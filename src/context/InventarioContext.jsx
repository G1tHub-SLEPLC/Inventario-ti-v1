import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { logAuditoria } from '../utils/auditoria';

const InventarioContext = createContext();

export function useInventario() {
  return useContext(InventarioContext);
}

// Configuración de duración de los toasts en milisegundos
const TOAST_DURATION_DEFAULT = 8000;   // Tiempo por defecto (8 segundos)
const TOAST_DURATION_WARNING = 15000;  // Tiempo para advertencias y duplicados (15 segundos)

// Función utilitaria para asegurar consistencia en los archivos compartidos
function consolidateFileStatuses(list) {
  const ocHasFile = new Set();
  const facturaHasFile = new Set();

  list.forEach(eq => {
    const oc = eq['Orden de Compra'] ? String(eq['Orden de Compra']).trim().toLowerCase() : '';
    const fac = eq['Factura'] ? String(eq['Factura']).trim().toLowerCase() : '';
    if (eq.hasOcFile && oc && oc !== '—' && oc !== '') ocHasFile.add(oc);
    if (eq.hasFacturaFile && fac && fac !== '—' && fac !== '') facturaHasFile.add(fac);
  });

  return list.map(eq => {
    const oc = eq['Orden de Compra'] ? String(eq['Orden de Compra']).trim().toLowerCase() : '';
    const fac = eq['Factura'] ? String(eq['Factura']).trim().toLowerCase() : '';
    return {
      ...eq,
      hasOcFile: eq.hasOcFile || (oc && oc !== '—' && oc !== '' && ocHasFile.has(oc)),
      hasFacturaFile: eq.hasFacturaFile || (fac && fac !== '—' && fac !== '' && facturaHasFile.has(fac))
    };
  });
}

function toDbRow(eq) {
  const { id, 'Nº de serie': serial, 'Orden de Compra': oc, 'Factura': fac, hasOcFile, hasFacturaFile, estado, usuario_asignado_id, ...detalles } = eq;
  return {
    id,
    serial: serial || '',
    orden_compra: oc || '',
    factura: fac || '',
    has_oc_file: !!hasOcFile,
    has_factura_file: !!hasFacturaFile,
    estado: estado || 'DISPONIBLE',
    usuario_asignado_id: usuario_asignado_id || null,
    detalles
  };
}

function fromDbRow(dbRow) {
  let detalles = { ...dbRow.detalles };
  if (detalles['Codigo Compra Agil / Licitación / Codigo Convenio Marco'] !== undefined) {
    detalles['ID Publicación'] = detalles['Codigo Compra Agil / Licitación / Codigo Convenio Marco'];
    delete detalles['Codigo Compra Agil / Licitación / Codigo Convenio Marco'];
  }

  // Inject user data if joined
  if (dbRow.perfiles) {
    detalles['Usuario'] = dbRow.perfiles.nombre || dbRow.perfiles.email || 'Usuario';
    detalles['SubDirección'] = dbRow.perfiles.subdireccion || '';
  }

  return {
    id: dbRow.id,
    'Nº de serie': dbRow.serial,
    'Orden de Compra': dbRow.orden_compra,
    'Factura': dbRow.factura,
    hasOcFile: dbRow.has_oc_file,
    hasFacturaFile: dbRow.has_factura_file,
    estado: dbRow.estado || 'DISPONIBLE',
    usuario_asignado_id: dbRow.usuario_asignado_id || null,
    ...detalles
  };
}

export function InventarioProvider({ children }) {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  const broadcastEquiposChanges = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'equipos_changed',
        payload: {}
      });
    }
  }, []);
  const [toast, setToast] = useState(null);

  const showToast = (title, message, type = 'success', details = null, customDuration = null) => {
    const duration = customDuration || (type === 'warning' ? TOAST_DURATION_WARNING : TOAST_DURATION_DEFAULT);
    
    setToast({ title, message, type, ...details });
    setTimeout(() => {
      setToast(prev => (prev && prev.title === title ? null : prev));
    }, duration);
  };

  const loadData = useCallback(async () => {
    // First check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data: equiposData, error: equiposError } = await supabase.from('equipos').select('*').order('created_at', { ascending: false });
    if (equiposError) {
      console.error('Error al cargar inventario desde Supabase:', equiposError);
    } else if (equiposData) {
      const { data: perfilesData, error: perfilesError } = await supabase.from('perfiles').select('id, nombre, email, subdireccion').order('nombre', { ascending: true });
      
      const perfilesMap = {};
      if (!perfilesError && perfilesData) {
        perfilesData.forEach(p => { perfilesMap[p.id] = p; });
      }

      const parsed = equiposData.map(dbRow => {
        const rowWithProfile = { ...dbRow };
        if (dbRow.usuario_asignado_id && perfilesMap[dbRow.usuario_asignado_id]) {
          rowWithProfile.perfiles = perfilesMap[dbRow.usuario_asignado_id];
        }
        return fromDbRow(rowWithProfile);
      });
      
      const consolidated = consolidateFileStatuses(parsed);
      setEquipos(consolidated);
    }
    setLoading(false);
  }, []);

  // Cargar datos de Supabase
  useEffect(() => {
    loadData();

    // Tiempo real: Escuchar cambios en la tabla
    const channel = supabase.channel('equipos-changes');
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipos' }, () => {
         loadData();
      })
      .on('broadcast', { event: 'equipos_changed' }, () => {
         loadData();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channelRef.current = channel;
        }
      });

    const perfilesChannel = supabase.channel('equipos-perfiles-changes');
    perfilesChannel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'perfiles' }, () => {
         loadData();
      })
      .subscribe();
      
    // Refrescar al iniciar o cerrar sesión
    let hasInitialLoad = false;
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        if (event === 'SIGNED_IN') {
          if (!hasInitialLoad) {
            setEquipos(current => {
              if (current.length === 0) setLoading(true);
              return current;
            });
            loadData();
            hasInitialLoad = true;
          }
        }
      } else {
        setEquipos([]);
        hasInitialLoad = false;
      }
    });
      
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(perfilesChannel);
      authListener.subscription.unsubscribe();
    };
  }, [loadData]);

  const addMasivo = async (nuevosEquipos) => {
    const merged = [...equipos];
    const upsertPayload = [];

    nuevosEquipos.forEach((nuevo, idx) => {
      const serial = nuevo['Nº de serie'] ? String(nuevo['Nº de serie']).trim() : '';
      const nuevoId = serial || `item_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`;
      
      const index = serial 
        ? merged.findIndex(e => e['Nº de serie'] && String(e['Nº de serie']).trim() === serial) 
        : -1;
        
      let newObj;
      if (index >= 0) {
        newObj = { ...merged[index], ...nuevo, id: merged[index].id || nuevoId };
        merged[index] = newObj;
      } else {
        newObj = { ...nuevo, id: nuevoId };
        merged.push(newObj);
      }
      upsertPayload.push(toDbRow(newObj));
    });
    
    const next = consolidateFileStatuses(merged);
    setEquipos(next); // UI optimista
    
    const { error } = await supabase.from('equipos').upsert(upsertPayload);
    if (error) {
      console.error('Error addMasivo:', error);
    } else {
      await logAuditoria('equipos', 'Carga Masiva', `Se cargaron/actualizaron masivamente ${nuevosEquipos.length} equipos por Excel.`);
      await loadData();
    }
  };

  const addEquipo = async (equipo) => {
    const serial = equipo['Nº de serie'] ? String(equipo['Nº de serie']).trim() : '';
    const newId = serial || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const finalEq = { ...equipo, id: newId };
    
    const next = consolidateFileStatuses([...equipos, finalEq]);
    setEquipos(next);

    const { error } = await supabase.from('equipos').insert(toDbRow(finalEq));
    if (error) {
      console.error('Error addEquipo:', error);
    } else {
      await logAuditoria('equipos', 'Crear Equipo', `Se registró un nuevo equipo: ${equipo['Descripción del Bien']} (S/N: ${serial})`);
      await loadData();
    }
  };

  const updateEquipo = async (index, equipo) => {
    const copy = [...equipos];
    const updated = { ...equipo, id: copy[index].id || equipo.id };
    copy[index] = updated;
    
    const next = consolidateFileStatuses(copy);
    setEquipos(next);
    
    const { error } = await supabase.from('equipos').update(toDbRow(updated)).eq('id', updated.id);
    if (error) {
      console.error('Error updateEquipo:', error);
    } else {
      await logAuditoria('equipos', 'Actualizar Equipo', `Se actualizó el equipo: ${updated['Descripción del Bien']} (ID: ${updated.id} / S/N: ${updated['Nº de serie']}). Estado: ${updated.estado}`);
      await loadData();
    }
  };

  const updateEquipoBySerial = async (serial, updatedEquipo) => {
    const copy = equipos.map(eq => {
      if (eq['Nº de serie'] && eq['Nº de serie'].trim() === serial.trim()) {
        return { ...updatedEquipo, id: eq.id || updatedEquipo.id || serial };
      }
      return eq;
    });
    const next = consolidateFileStatuses(copy);
    setEquipos(next);
    
    const finalObj = next.find(e => e['Nº de serie'] && e['Nº de serie'].trim() === serial.trim());
    if (finalObj) {
      const { error } = await supabase.from('equipos').update(toDbRow(finalObj)).eq('id', finalObj.id);
      if (error) {
        console.error('Error updateEquipoBySerial:', error);
      } else {
        await logAuditoria('equipos', 'Actualizar Equipo por S/N', `Se actualizó el equipo: ${updatedEquipo['Descripción del Bien']} (S/N: ${serial}). Estado: ${updatedEquipo.estado}`);
        await loadData();
      }
    }
  };

  const updateEquiposMasivo = async (equiposActualizados) => {
    const copy = [...equipos];
    const upsertPayload = [];
    
    equiposActualizados.forEach(updated => {
       const idx = copy.findIndex(e => e.id === updated.id);
       if (idx >= 0) {
          copy[idx] = updated;
          upsertPayload.push(toDbRow(updated));
       }
    });

    const next = consolidateFileStatuses(copy);
    setEquipos(next);
    
    const { error } = await supabase.from('equipos').upsert(upsertPayload);
    if (error) {
      console.error('Error updateEquiposMasivo:', error);
    } else {
      await logAuditoria('equipos', 'Actualización Múltiple', `Se actualizaron masivamente ${equiposActualizados.length} equipos relacionados.`);
      await loadData();
    }
  };

  const setFileStatus = async (id, type, hasFile) => {
    const targetEq = equipos.find(e => e.id === id);
    if (!targetEq) return;

    const fieldName = type === 'factura' ? 'Factura' : 'Orden de Compra';
    const docCode = targetEq[fieldName] ? String(targetEq[fieldName]).trim() : '';
    const key = type === 'factura' ? 'hasFacturaFile' : 'hasOcFile';

    const copy = equipos.map((eq) => {
      const eqCode = eq[fieldName] ? String(eq[fieldName]).trim() : '';
      if (eq.id === id || (docCode && docCode !== '—' && eqCode && eqCode.toLowerCase() === docCode.toLowerCase())) {
        return { ...eq, [key]: hasFile };
      }
      return eq;
    });
    
    const next = consolidateFileStatuses(copy);
    setEquipos(next);

    const updatedRows = next.filter(eq => {
      const eqCode = eq[fieldName] ? String(eq[fieldName]).trim() : '';
      return eq.id === id || (docCode && docCode !== '—' && eqCode && eqCode.toLowerCase() === docCode.toLowerCase());
    });

    for (const row of updatedRows) {
       const dbKey = type === 'factura' ? 'has_factura_file' : 'has_oc_file';
       const { error } = await supabase.from('equipos').update({ [dbKey]: hasFile }).eq('id', row.id);
       if (error) console.error('Error setFileStatus:', error);
    }

    if (updatedRows.length > 0) {
      await logAuditoria('equipos', 'Archivo Subido', `Se subió documento (${type}) para el equipo: ${updatedRows[0]['Descripción del Bien']} (ID: ${id})`);
      await loadData();
    }
  };

  const clearInventario = async (skipConfirm = false) => {
    if (skipConfirm || confirm("¿Estás seguro de que deseas borrar TODO el inventario de Supabase?")) {
      setEquipos([]);
      const { error } = await supabase.from('equipos').delete().neq('id', 'null');
      if (error) {
        console.error('Error clearInventario:', error);
      } else {
        await logAuditoria('equipos', 'Borrado Masivo', `¡Peligro! Se eliminó masivamente todo el inventario de equipos.`);
        await loadData();
      }
    }
  };

  return (
    <InventarioContext.Provider value={{ 
      equipos, 
      loading, 
      toast, 
      setToast, 
      showToast, 
      addMasivo, 
      addEquipo, 
      updateEquipo, 
      updateEquipoBySerial, 
      updateEquiposMasivo,
      setFileStatus, 
      clearInventario,
      refetchInventario: loadData,
      broadcastEquiposChanges
    }}>
      {children}
    </InventarioContext.Provider>
  );
}
