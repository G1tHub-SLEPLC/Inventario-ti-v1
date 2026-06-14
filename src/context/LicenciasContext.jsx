import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useInventario } from './InventarioContext';
import { useAuth } from './AuthContext';
import { logAuditoria } from '../utils/auditoria';

const LicenciasContext = createContext();

export const useLicencias = () => {
  return useContext(LicenciasContext);
};

export const LicenciasProvider = ({ children }) => {
  const { session } = useAuth();
  const { showToast } = useInventario();
  const [licencias, setLicencias] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all licenses (for admin)
  const fetchLicencias = async () => {
    setLicencias(current => {
      if (current.length === 0) {
        setLoading(true);
      }
      return current;
    });
    const { data, error } = await supabase
      .from('licencias')
      .select('*')
      .order('software', { ascending: true });
      
    if (error) {
      console.error('Error fetching licencias:', error);
    } else {
      setLicencias(data || []);
    }
    setLoading(false);
  };

  // Fetch all assignments (for admin) or just user assignments (handled by RLS)
  const fetchAsignaciones = async () => {
    const { data: asignacionesData, error: asignacionesError } = await supabase
      .from('asignaciones_licencias')
      .select(`
        *,
        licencias (software, version, tipo, descripcion, fecha_termino, estado)
      `)
      .order('fecha_asignacion', { ascending: false });
      
    if (asignacionesError) {
      console.error('Error fetching asignaciones:', asignacionesError);
      setAsignaciones([]);
      return;
    }
    
    // Fetch perfiles to map them manually
    const { data: perfilesData, error: perfilesError } = await supabase.from('perfiles').select('id, nombre, email');
    if (perfilesError) console.error('Error fetching perfiles for asignaciones:', perfilesError);
    
    const asignacionesCompletas = (asignacionesData || []).map(asig => {
      const perfil = (perfilesData || []).find(p => p.id === asig.usuario_id);
      return {
        ...asig,
        perfiles: perfil ? { nombre: perfil.nombre, email: perfil.email } : { nombre: 'Desconocido', email: '' }
      };
    });

    setAsignaciones(asignacionesCompletas);
  };

  useEffect(() => {
    if (session) {
      fetchLicencias();
      fetchAsignaciones();
    }
  }, [session]);

  const addLicencia = async (licencia) => {
    const { data, error } = await supabase
      .from('licencias')
      .insert([licencia])
      .select();
      
    if (error) {
      showToast('Error', 'No se pudo agregar la licencia.', 'error');
      throw error;
    }
    
    await logAuditoria('licencias', 'Crear Software', `Se registró nuevo software: ${licencia.software} ${licencia.version || ''} (${licencia.cantidad_total} licencias)`);
    showToast('Licencia Agregada', 'La licencia ha sido registrada con éxito.', 'success');
    await fetchLicencias();
    return data;
  };

  const addLicenciasMasivo = async (licenciasArray) => {
    const { data, error } = await supabase
      .from('licencias')
      .insert(licenciasArray)
      .select();
      
    if (error) {
      showToast('Error', 'No se pudieron cargar las licencias masivamente.', 'error');
      throw error;
    }
    
    await logAuditoria('licencias', 'Carga Masiva', `Se cargaron masivamente ${licenciasArray.length} licencias de software.`);
    await fetchLicencias();
    return data;
  };

  const executeMasivoLicencias = async (operations) => {
    let inserted = 0;
    let updated = 0;
    let omitted = 0;
    
    for (const op of operations) {
      if (op.type === 'insert') {
        const { error } = await supabase
          .from('licencias')
          .insert([op.payload]);
        if (error) {
          showToast('Error', `No se pudo registrar el software ${op.payload.software}.`, 'error');
          throw error;
        }
        inserted++;
      } else if (op.type === 'update') {
        const { error } = await supabase
          .from('licencias')
          .update({ cantidad_total: op.newQty })
          .eq('id', op.id);
        if (error) {
          showToast('Error', `No se pudo actualizar el software ${op.software}.`, 'error');
          throw error;
        }
        updated++;
      } else if (op.type === 'omit') {
        omitted++;
      }
    }
    
    await logAuditoria(
      'licencias', 
      'Carga Masiva', 
      `Carga masiva finalizada. Nuevas: ${inserted}, Modificadas/Sumadas: ${updated}, Omitidas: ${omitted}`
    );
    
    await fetchLicencias();
    return { inserted, updated, omitted, deleted: 0 };
  };


  const updateLicencia = async (id, updates) => {
    const { data, error } = await supabase
      .from('licencias')
      .update(updates)
      .eq('id', id)
      .select();
      
    if (error) {
      showToast('Error', 'No se pudo actualizar la licencia.', 'error');
      throw error;
    }
    
    const targetLic = licencias.find(l => l.id === id);
    const nombre = targetLic ? targetLic.software : 'Desconocido';
    await logAuditoria('licencias', 'Actualizar Software', `Se actualizaron datos del software: ${nombre} (ID: ${id})`);
    showToast('Licencia Actualizada', 'Los datos se guardaron correctamente.', 'success');
    await fetchLicencias();
    return data;
  };

  const deleteLicencia = async (id) => {
    const { error } = await supabase
      .from('licencias')
      .delete()
      .eq('id', id);
      
    if (error) {
      showToast('Error', 'No se pudo eliminar la licencia.', 'error');
      throw error;
    }
    
    const targetLic = licencias.find(l => l.id === id);
    const nombre = targetLic ? targetLic.software : 'Desconocido';
    await logAuditoria('licencias', 'Eliminar Software', `Se eliminó el software: ${nombre} y todas sus asignaciones (ID: ${id})`);
    showToast('Licencia Eliminada', 'El registro ha sido borrado.', 'success');
    await fetchLicencias();
  };

  const asignarLicencia = async (licencia_id, usuario_id, softwareNombre = 'Desconocido', usuarioNombre = 'Desconocido') => {
    const { error } = await supabase
      .from('asignaciones_licencias')
      .insert([{ licencia_id, usuario_id }]);
      
    if (error) {
      if (error.code === '23505') { // Unique violation
        showToast('Atención', 'Este usuario ya tiene esta licencia asignada.', 'warning');
      } else {
        showToast('Error', 'No se pudo asignar la licencia.', 'error');
      }
      throw error;
    }
    
    await logAuditoria('licencias', 'Asignar Licencia', `Se asignó la licencia: ${softwareNombre} (ID: ${licencia_id}) al usuario: ${usuarioNombre} (ID: ${usuario_id})`, usuarioNombre);
    showToast('Licencia Asignada', 'La licencia fue asignada al funcionario exitosamente.', 'success');
    await fetchAsignaciones();
  };

  const asignarLicenciasMultiples = async (licencia_id, usuariosArray, softwareNombre = 'Desconocido') => {
    const inserts = usuariosArray.map(u => ({ licencia_id, usuario_id: u.id }));
    const { error } = await supabase
      .from('asignaciones_licencias')
      .insert(inserts);
      
    if (error) {
      showToast('Error', 'No se pudieron asignar las licencias.', 'error');
      throw error;
    }
    
    for (const u of usuariosArray) {
      const uName = u.nombre || u.email || 'Desconocido';
      await logAuditoria('licencias', 'Asignar Licencia', `Se asignó la licencia: ${softwareNombre} (ID: ${licencia_id}) al usuario: ${uName} (ID: ${u.id})`, uName);
    }
    
    showToast('Licencia Asignada', `La licencia se asignó exitosamente a ${usuariosArray.length} funcionarios.`, 'success');
    await fetchAsignaciones();
  };

  const revocarLicencia = async (asignacion_id, softwareNombre = 'Desconocido', usuarioNombre = 'Desconocido') => {
    const { error } = await supabase
      .from('asignaciones_licencias')
      .delete()
      .eq('id', asignacion_id);
      
    if (error) {
      showToast('Error', 'No se pudo revocar la licencia.', 'error');
      throw error;
    }
    
    await logAuditoria('licencias', 'Revocar Licencia', `Se revocó la asignación de ${softwareNombre} al usuario: ${usuarioNombre} (Asignación ID: ${asignacion_id})`, usuarioNombre);
    showToast('Licencia Revocada', 'Se ha retirado el acceso al software.', 'success');
    await fetchAsignaciones();
  };

  const getAsignacionesCount = (licencia_id) => {
    return asignaciones.filter(a => a.licencia_id === licencia_id).length;
  };

  const setLicenciaFileStatus = async (id, type, hasFile) => {
    const targetLic = licencias.find(e => e.id === id);
    if (!targetLic) return;

    const dbKey = type === 'factura' ? 'has_factura_file' : 'has_oc_file';
    const { error } = await supabase.from('licencias').update({ [dbKey]: hasFile }).eq('id', id);
    if (error) {
      console.error('Error setLicenciaFileStatus:', error);
      return;
    }

    const nombre = targetLic ? targetLic.software : 'Desconocido';
    await logAuditoria('licencias', 'Archivo Subido', `Se subió documento (${type}) para la licencia: ${nombre} (ID: ${id})`);
    await fetchLicencias();
  };

  const saveLicenciaDocument = async (storageKey, type, file, licenciaId) => {
    const { error } = await supabase.storage
      .from('documentos')
      .upload(storageKey, file, { upsert: true });
      
    if (error) {
      showToast('Error', `No se pudo guardar la ${type}.`, 'error');
      throw error;
    }
    
    await setLicenciaFileStatus(licenciaId, type, true);
  };

  return (
    <LicenciasContext.Provider value={{
      licencias,
      asignaciones,
      loading,
      fetchLicencias,
      fetchAsignaciones,
      addLicencia,
      addLicenciasMasivo,
      executeMasivoLicencias,
      updateLicencia,
      deleteLicencia,
      asignarLicencia,
      asignarLicenciasMultiples,
      revocarLicencia,
      getAsignacionesCount,
      setLicenciaFileStatus,
      saveLicenciaDocument
    }}>
      {children}
    </LicenciasContext.Provider>
  );
};
