import { useState, useRef, useEffect, useMemo } from 'react';
import { useSolicitudes } from '../context/SolicitudesContext';
import { supabase } from '../lib/supabaseClient';
import { useInventario } from '../context/InventarioContext';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { PlusCircle, Edit2, Trash2, UserPlus, History, Package, Upload, Download, Printer, UploadCloud, AlertCircle, CheckCircle, AlertTriangle, Eye, Users, Search, Box } from 'lucide-react';
import * as XLSX from 'xlsx';
import { logAuditoria, getDiffString } from '../utils/auditoria';
import { exportToExcelAndPDF } from '../utils/exportUtils';
import { useSort } from '../hooks/useSort';
import { SortableHeader } from '../components/SortableHeader';
import AutocompleteInput from '../components/AutocompleteInput';

function getInitials(name) {
  if (!name || name === '—') return '??';
  const words = String(name).trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function InsumosPage() {
  const { insumos, refetch, broadcast } = useSolicitudes();
  const { showToast } = useInventario();
  const { session } = useAuth();
  const { showAlertConfirm } = useAlert();
  const { sorted: sortedInsumos, sortKey: insSortKey, sortDir: insSortDir, handleSort: handleInsSort } = useSort(insumos, 'nombre', 'asc');
  
  const [activeTab, setActiveTab] = useState('insumos'); // 'insumos' | 'func' | 'insumo'
  const [historial, setHistorial] = useState([]);
  const [usuariosSlep, setUsuariosSlep] = useState([]);

  const [funcSearch, setFuncSearch] = useState('');
  const [showFuncSug, setShowFuncSug] = useState(false);
  const [selectedFunc, setSelectedFunc] = useState(null);
  const [focusedFuncIndex, setFocusedFuncIndex] = useState(-1);

  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [insumoGlobalSearch, setInsumoGlobalSearch] = useState('');

  const funcSuggestions = useMemo(() => {
    if (!funcSearch) return usuariosSlep;
    const q = funcSearch.toLowerCase();
    return usuariosSlep.filter(u => 
      (u.nombre || '').toLowerCase().includes(q) || 
      (u.email || '').toLowerCase().includes(q)
    );
  }, [usuariosSlep, funcSearch]);

  const { sorted: sortedAsignacionesFunc, sortKey: asigFuncSortKey, sortDir: asigFuncSortDir, handleSort: handleAsigFuncSort } = useSort(
    useMemo(() => historial.filter(a => a.usuario_id === selectedFunc?.id), [historial, selectedFunc])
  );

  const { sorted: sortedAsignacionesInsumo, sortKey: asigInsumoSortKey, sortDir: asigInsumoSortDir, handleSort: handleAsigInsumoSort } = useSort(
    useMemo(() => {
      let data = historial.filter(a => a.insumo_id === selectedInsumoId);
      if (insumoGlobalSearch) {
        const q = insumoGlobalSearch.toLowerCase();
        data = data.filter(a => 
          (a.usuario_nombre || '').toLowerCase().includes(q) ||
          (a.perfiles?.email || '').toLowerCase().includes(q)
        );
      }
      return data;
    }, [historial, selectedInsumoId, insumoGlobalSearch])
  );

  const selectedInsumoData = useMemo(() => insumos.find(i => i.id === selectedInsumoId), [insumos, selectedInsumoId]);

  const getAsignacionesCount = (insId) => {
    return historial.filter(h => h.insumo_id === insId).reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
  };
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '', categoria: '', tipo: '', marca: '', modelo: '', cantidad_disponible: 0 });
  const [selectTipoVal, setSelectTipoVal] = useState('');

  const dynamicTipos = useMemo(() => {
    const defaultTipos = ["Tóner", "Tinta", "Tambor", "Mouse", "Teclado", "Pilas"];
    const dbTipos = insumos.map(i => i.tipo).filter(t => t && t.trim() !== '' && !defaultTipos.includes(t));
    return [...new Set([...defaultTipos, ...dbTipos])].sort((a, b) => String(a).localeCompare(String(b)));
  }, [insumos]);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState({ insumo_id: null, insumo_nombre: '', usuario_id: '', cantidad: 1, stock_actual: 0, observaciones: '' });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [entregasPrevias, setEntregasPrevias] = useState(null);
  const [isMultiAssign, setIsMultiAssign] = useState(false);
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewInsumo, setViewInsumo] = useState(null);
  const [viewInsumoAsignaciones, setViewInsumoAsignaciones] = useState([]);
  const [isViewModalLoading, setIsViewModalLoading] = useState(false);

  const flatViewAsignaciones = useMemo(() => {
    return viewInsumoAsignaciones.map(a => ({
      ...a,
      nombre: a.perfiles?.nombre || '',
      email: a.perfiles?.email || ''
    }));
  }, [viewInsumoAsignaciones]);

  const { sorted: sortedViewAsignaciones, sortKey: vAsigSortKey, sortDir: vAsigSortDir, handleSort: handleVAsigSort } = useSort(flatViewAsignaciones, 'created_at', 'desc');

  const userAssignOrder = useMemo(() => {
    const order = {};
    const chronologicalAsig = [...viewInsumoAsignaciones].sort((x, y) => new Date(x.created_at) - new Date(y.created_at));
    chronologicalAsig.forEach((asig) => {
       const uid = asig.usuario_id || asig.usuario_nombre || asig.perfiles?.nombre || asig.id;
       if (!order[uid]) order[uid] = [];
       order[uid].push(asig.id);
    });
    return order;
  }, [viewInsumoAsignaciones]);

  const [isMasivaModalOpen, setIsMasivaModalOpen] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const fileInputRef = useRef(null);

  // Load perfiles para select de asignación
  useEffect(() => {
    const loadUsuarios = async () => {
      const { data } = await supabase.from('perfiles').select('id, nombre, email, rol').order('nombre', { ascending: true });
      if (data) setUsuariosSlep(data);
    };
    loadUsuarios();

    const perfilesChannel = supabase.channel('insumos-perfiles-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'perfiles' }, () => {
        loadUsuarios();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(perfilesChannel);
    };
  }, []);

  const fetchHistorial = async () => {
    const { data: sols } = await supabase
      .from('solicitudes')
      .select('id, cantidad, created_at, usuario_id, insumo_id, observaciones_admin, insumos(id, nombre, tipo, marca, modelo)')
      .eq('tipo', 'insumo')
      .eq('estado', 'aprobado')
      .order('created_at', { ascending: false });
      
    if (sols) {
      const { data: perfs } = await supabase.from('perfiles').select('id, nombre, email').order('nombre', { ascending: true });
      const hist = sols.map(s => {
        const user = perfs?.find(p => p.id === s.usuario_id);
        const obsTrimmed = (s.observaciones_admin || '').trim();
        const obsClean = (obsTrimmed.toUpperCase() === 'ENTREGA DIRECTA' || obsTrimmed.toUpperCase() === 'ENTREGA DIRECTA (MÚLTIPLE)' || obsTrimmed.toUpperCase() === 'ENTREGA DIRECTA (MULTIPLE)') ? '' : s.observaciones_admin;
        return {
          ...s,
          observaciones_admin: obsClean,
          perfiles: user || null,
          usuario_nombre: user?.nombre || user?.email || 'Desconocido'
        };
      });
      setHistorial(hist);
    }
  };

  // Load historial based on tabs and listen to real-time changes
  useEffect(() => {
    if (activeTab === 'func' || activeTab === 'insumo') {
      fetchHistorial();

      const channel = supabase.channel('insumos-historial-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, () => {
          fetchHistorial();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeTab]);

  // Load entregas previas for assignment modal
  useEffect(() => {
    if (isAssignModalOpen && assignData.usuario_id && assignData.insumo_id) {
      const fetchEntregas = async () => {
        const { data } = await supabase
          .from('solicitudes')
          .select('cantidad')
          .eq('usuario_id', assignData.usuario_id)
          .eq('insumo_id', assignData.insumo_id)
          .eq('estado', 'aprobado')
          .eq('tipo', 'insumo');
        
        if (data) {
          const total = data.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
          setEntregasPrevias(total);
        } else {
          setEntregasPrevias(0);
        }
      };
      fetchEntregas();
    } else {
      setEntregasPrevias(null);
    }
  }, [assignData.usuario_id, assignData.insumo_id, isAssignModalOpen]);

  const handleOpenViewModal = async (insumo) => {
    setViewInsumo(insumo);
    setIsViewModalOpen(true);
    setIsViewModalLoading(true);

    const { data: sols } = await supabase
      .from('solicitudes')
      .select('id, cantidad, created_at, usuario_id, observaciones_admin, insumos(nombre, tipo, marca, modelo)')
      .eq('tipo', 'insumo')
      .eq('insumo_id', insumo.id)
      .eq('estado', 'aprobado')
      .order('created_at', { ascending: false });
      
    if (sols) {
      const { data: perfs } = await supabase.from('perfiles').select('id, nombre, email').order('nombre', { ascending: true });
      const hist = sols.map(s => {
        const user = perfs?.find(p => p.id === s.usuario_id);
        const obsTrimmed = (s.observaciones_admin || '').trim();
        const obsClean = (obsTrimmed.toUpperCase() === 'ENTREGA DIRECTA' || obsTrimmed.toUpperCase() === 'ENTREGA DIRECTA (MÚLTIPLE)' || obsTrimmed.toUpperCase() === 'ENTREGA DIRECTA (MULTIPLE)') ? '' : s.observaciones_admin;
        return {
          ...s,
          observaciones_admin: obsClean,
          insumo_id: insumo.id,
          perfiles: user || null,
          usuario_nombre: user?.nombre || user?.email || 'Desconocido'
        };
      });
      setViewInsumoAsignaciones(hist);
    } else {
      setViewInsumoAsignaciones([]);
    }
    setIsViewModalLoading(false);
  };

  const handleRevocarDesdeModal = async (histItem) => {
    const confirmacion = await showAlertConfirm(
      'Revertir Entrega',
      `¿Estás seguro de que deseas eliminar esta entrega de <strong>${histItem.cantidad}x ${histItem.insumos?.nombre}</strong>?<br/><br/>Esta acción restaurará el stock y no se puede deshacer.`
    );
    if (!confirmacion) return;

    try {
      const { error: delError } = await supabase.from('solicitudes').delete().eq('id', histItem.id);
      if (delError) throw delError;

      if (histItem.insumo_id) {
        const { data: currentInsumo } = await supabase.from('insumos').select('cantidad_disponible').eq('id', histItem.insumo_id).single();
        if (currentInsumo) {
          await supabase.from('insumos').update({ cantidad_disponible: currentInsumo.cantidad_disponible + histItem.cantidad }).eq('id', histItem.insumo_id);
        }
      }

      await logAuditoria('insumos', 'Revertir Entrega', `Se eliminó entrega de ${histItem.cantidad}x ${histItem.insumos?.nombre}. Stock restaurado.`, histItem.usuario_nombre);
      
      showToast('Reversión exitosa', 'La entrega fue eliminada y el stock restaurado.', 'success');
      await refetch();
      await fetchHistorial();
      
      setViewInsumoAsignaciones(prev => prev.filter(a => a.id !== histItem.id));
    } catch (err) {
      console.error(err);
      showToast('Error', 'Hubo un error al intentar revertir la entrega.', 'error');
    }
  };

  const handleOpenModal = (insumo = null) => {
    if (insumo) {
      setFormData(insumo);
      setSelectTipoVal(insumo.tipo || '');
    } else {
      setFormData({ id: null, nombre: '', descripcion: '', categoria: '', tipo: '', marca: '', modelo: '', cantidad_disponible: 0 });
      setSelectTipoVal('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        const originalInsumo = insumos.find(i => i.id === formData.id);
        const { id, ...updateData } = formData;
        const { error } = await supabase.from('insumos').update(updateData).eq('id', id);
        if (error) throw error;
        
        const diffText = getDiffString(originalInsumo, updateData);
        await logAuditoria('insumos', 'Editar Insumo', `Insumo: ${updateData.nombre} (${updateData.marca} - ${updateData.modelo}). Cambios detectados: ${diffText}`);
        
        showToast('Insumo actualizado', 'El insumo se ha actualizado correctamente.', 'success');
      } else {
        const { id, ...insertData } = formData;
        const { error } = await supabase.from('insumos').insert(insertData);
        if (error) throw error;
        
        await logAuditoria('insumos', 'Crear Insumo', `Creó nuevo insumo: ${insertData.nombre} (${insertData.marca} - ${insertData.modelo}). Stock inicial: ${insertData.cantidad_disponible}`);
        
        showToast('Insumo creado', 'El insumo se ha creado correctamente.', 'success');
      }
      setIsModalOpen(false);
      await refetch();
    } catch (error) {
      console.error(error);
      showToast('Error', 'Hubo un error al guardar el insumo.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const insumoItem = insumos.find(i => i.id === id);
    if (confirm('¿Estás seguro de que deseas eliminar este insumo?')) {
      const { error } = await supabase.from('insumos').delete().eq('id', id);
      if (error) {
        showToast('Error', 'No se pudo eliminar el insumo.', 'error');
      } else {
        await logAuditoria('insumos', 'Eliminar Insumo', `Eliminó el insumo: ${insumoItem?.nombre} (${insumoItem?.marca} - ${insumoItem?.modelo})`);
        showToast('Insumo eliminado', 'El insumo se eliminó del catálogo.', 'success');
        await refetch();
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus({ type: 'processing', message: 'Procesando archivo...' });

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        let count = 0;
        for (const row of data) {
          const insumo = {
            nombre: row['Nombre'] || row['nombre'] || 'Sin nombre',
            tipo: row['Tipo'] || row['tipo'] || 'Otro',
            marca: row['Marca'] || row['marca'] || 'N/A',
            modelo: row['Modelo'] || row['modelo'] || 'N/A',
            categoria: row['Categoría'] || row['categoria'] || '',
            descripcion: row['Descripción'] || row['descripcion'] || '',
            cantidad_disponible: parseInt(row['Cantidad'] || row['cantidad'] || 0, 10)
          };
          
          const { error } = await supabase.from('insumos').insert(insumo);
          if (!error) count++;
        }
        
        await refetch();
        setStatus({ type: 'success', message: `Se importaron ${count} insumos exitosamente.` });
        showToast('Carga completada', `Se importaron ${count} insumos exitosamente.`, 'success');
        
        setTimeout(() => {
          setIsMasivaModalOpen(false);
          setStatus({ type: 'idle', message: '' });
        }, 2500);
      } catch (err) {
        setStatus({ type: 'error', message: 'Hubo un problema al procesar el archivo Excel.' });
        showToast('Error', 'Hubo un problema al procesar el archivo Excel.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // reset
  };

  const openAssignModal = (insumo) => {
    setAssignData({ insumo_id: insumo.id, insumo_nombre: insumo.nombre, usuario_id: '', cantidad: 1, stock_actual: insumo.cantidad_disponible, observaciones: '' });
    setUserSearchTerm('');
    setIsMultiAssign(false);
    setSelectedUsuarios([]);
    setIsAssignModalOpen(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    
    const totalQuantity = assignData.cantidad * (isMultiAssign ? selectedUsuarios.length : 1);
    if (totalQuantity > assignData.stock_actual) {
      showToast('Stock insuficiente', 'La cantidad total a asignar supera el stock disponible.', 'warning');
      return;
    }
    
    if (!isMultiAssign && !assignData.usuario_id) {
      showToast('Error', 'Debe seleccionar un funcionario.', 'error');
      return;
    }

    if (isMultiAssign && selectedUsuarios.length === 0) {
      showToast('Error', 'Debe seleccionar al menos un funcionario.', 'error');
      return;
    }

    const userIds = isMultiAssign ? selectedUsuarios.map(u => u.id) : [assignData.usuario_id];

    // Verify previous assignments
    try {
      const { data: previousSols, error: prevError } = await supabase
        .from('solicitudes')
        .select('usuario_id, cantidad')
        .in('usuario_id', userIds)
        .eq('insumo_id', assignData.insumo_id)
        .eq('estado', 'aprobado')
        .eq('tipo', 'insumo');

      if (prevError) throw prevError;

      const counts = {};
      if (previousSols) {
        previousSols.forEach(s => {
          counts[s.usuario_id] = (counts[s.usuario_id] || 0) + (s.cantidad || 0);
        });
      }

      const usersWithPrevious = [];
      userIds.forEach(uid => {
        if (counts[uid] > 0) {
          const u = usuariosSlep.find(x => x.id === uid);
          if (u) {
            usersWithPrevious.push({
              nombre: u.nombre || u.email || 'Desconocido',
              cantidad: counts[uid]
            });
          }
        }
      });

      if (usersWithPrevious.length > 0) {
        if (!assignData.observaciones || assignData.observaciones.trim() === '') {
          showToast('Observación Obligatoria', 'Se requiere ingresar una observación al asignar este insumo repetidas veces al mismo funcionario.', 'error');
          return;
        }

        const userListStr = usersWithPrevious.map(u => `<li>${u.nombre} (ya tiene ${u.cantidad} unidad(es))</li>`).join('');
        const confirmacion = await showAlertConfirm(
          'Advertencia de Entregas Previas',
          `ATENCIÓN: Los siguientes funcionarios ya han recibido este insumo anteriormente:<br/><br/><ul>${userListStr}</ul><br/>¿Estás seguro de que deseas continuar con la asignación para todos ellos?`
        );
        if (!confirmacion) {
          return; // Cancel assignment
        }
      }
    } catch (err) {
      console.error('Error al verificar entregas previas:', err);
    }

    try {
      // 1. Descontar stock
      const { error: errorUpd } = await supabase.from('insumos')
        .update({ cantidad_disponible: assignData.stock_actual - totalQuantity })
        .eq('id', assignData.insumo_id);
      
      if (errorUpd) throw errorUpd;

      // 2. Registrar en solicitudes como entregado (aprobado)
      if (isMultiAssign) {
        const inserts = selectedUsuarios.map(u => ({
          usuario_id: u.id,
          tipo: 'insumo',
          insumo_id: assignData.insumo_id,
          cantidad: assignData.cantidad,
          estado: 'aprobado',
          observaciones_admin: assignData.observaciones || ''
        }));
        const { error: errorSol } = await supabase.from('solicitudes').insert(inserts);
        if (errorSol) throw errorSol;

        // 3. Log Auditoria
        for (const u of selectedUsuarios) {
          const uName = u.nombre || u.email || 'Funcionario';
          await logAuditoria('insumos', 'Asignar Insumo', `Asignó ${assignData.cantidad}x ${assignData.insumo_nombre} (Asignación Múltiple). Observaciones: ${assignData.observaciones || 'Ninguna'}`, uName);
        }
        showToast('Asignación exitosa', `Se han asignado ${assignData.cantidad} unidades a ${selectedUsuarios.length} funcionarios.`, 'success');
      } else {
        const { error: errorSol } = await supabase.from('solicitudes').insert({
          usuario_id: assignData.usuario_id,
          tipo: 'insumo',
          insumo_id: assignData.insumo_id,
          cantidad: assignData.cantidad,
          estado: 'aprobado',
          observaciones_admin: assignData.observaciones || ''
        });
        if (errorSol) throw errorSol;

        // 3. Log Auditoria
        const funcName = usuariosSlep.find(u => u.id === assignData.usuario_id)?.nombre || 'Funcionario';
        await logAuditoria('insumos', 'Asignar Insumo', `Asignó ${assignData.cantidad}x ${assignData.insumo_nombre}. Observaciones: ${assignData.observaciones || 'Ninguna'}`, funcName);
        showToast('Asignación exitosa', `Se han asignado ${assignData.cantidad} unidades al funcionario seleccionado.`, 'success');
      }

      setIsAssignModalOpen(false);
      await refetch();
      await fetchHistorial();
      if (broadcast) broadcast();
    } catch (err) {
      console.error(err);
      showToast('Error', 'Hubo un error en la asignación.', 'error');
    }
  };

  const handleDeleteEntrega = async (histItem) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar esta entrega de ${histItem.cantidad}x ${histItem.insumos?.nombre}? Esto devolverá la cantidad al stock disponible.`)) return;

    try {
      // 1. Delete from solicitudes
      const { error: delError } = await supabase.from('solicitudes').delete().eq('id', histItem.id);
      if (delError) throw delError;

      // 2. Restore stock
      if (histItem.insumo_id) {
        const { data: currentInsumo } = await supabase.from('insumos').select('cantidad_disponible').eq('id', histItem.insumo_id).single();
        if (currentInsumo) {
          await supabase.from('insumos').update({ cantidad_disponible: currentInsumo.cantidad_disponible + histItem.cantidad }).eq('id', histItem.insumo_id);
        }
      }

      // 3. Log auditoria
      await logAuditoria('insumos', 'Revertir Entrega', `Se eliminó entrega de ${histItem.cantidad}x ${histItem.insumos?.nombre}. Stock restaurado.`, histItem.usuario_nombre);
      
      showToast('Reversión exitosa', 'La entrega fue eliminada y el stock restaurado.', 'success');
      await refetch();
      await fetchHistorial();
      if (broadcast) broadcast();
    } catch (err) {
      console.error(err);
      showToast('Error', 'Hubo un error al intentar revertir la entrega.', 'error');
    }
  };

  const exportInsumos = (format) => {
    const cols = ['Nombre', 'Tipo', 'Marca', 'Modelo', 'Cantidad Disponible'];
    const title = 'Inventario de Insumos';
    const formatter = (row) => ({
      'Nombre': row.nombre,
      'Tipo': row.tipo,
      'Marca': row.marca,
      'Modelo': row.modelo,
      'Cantidad Disponible': row.cantidad_disponible
    });
    exportToExcelAndPDF(format, insumos, cols, title, 'insumos_catalogo', formatter);
  };

  const exportHistorial = (format) => {
    const dataToExport = activeTab === 'func' ? sortedAsignacionesFunc : sortedAsignacionesInsumo;
    if (!dataToExport || dataToExport.length === 0) {
      showToast('Sin datos', 'No hay datos para exportar en esta vista.', 'warning');
      return;
    }
    const cols = ['Fecha', 'Funcionario', 'Insumo', 'Marca/Modelo', 'Cantidad', 'Observaciones'];
    const title = activeTab === 'func' 
      ? `Insumos de ${selectedFunc?.nombre || selectedFunc?.email || 'Funcionario'}` 
      : `Entregas de ${selectedInsumoData?.nombre || 'Insumo'}`;
    const formatter = (row) => ({
      'Fecha': new Date(row.created_at).toLocaleString(),
      'Funcionario': row.usuario_nombre,
      'Insumo': row.insumos?.nombre || '—',
      'Marca/Modelo': `${row.insumos?.marca || ''} - ${row.insumos?.modelo || ''}`,
      'Cantidad': row.cantidad,
      'Observaciones': row.observaciones_admin || '—'
    });
    exportToExcelAndPDF(format, dataToExport, cols, title, 'insumos_entregas', formatter);
  };

  return (
    <div className="p-6 max-w-[1920px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print-interactive">
        <div className="flex items-center gap-3">
          <div className="bg-[#112A46] p-2 rounded-lg text-white">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#112A46] tracking-tight">Gestión de Insumos</h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Control y administración de inventario y consumibles</p>
          </div>
        </div>
        
        {activeTab === 'insumos' ? (
          <div className="flex gap-2">
            <button
              onClick={() => { setStatus({ type: 'idle', message: '' }); setIsMasivaModalOpen(true); }}
              className="flex items-center gap-2 bg-blue-100 text-[#006BB9] px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium border border-blue-200"
            >
              <UploadCloud size={16} />
              Carga Masiva
            </button>
            <div className="flex gap-2">
              <button onClick={() => exportInsumos('xlsx')} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-300 shadow-sm font-medium transition-colors text-sm">
                <Download size={14} /> Excel
              </button>
              <button onClick={() => exportInsumos('pdf')} className="flex items-center gap-2 bg-rose-200 text-rose-800 px-3 py-1.5 rounded-lg hover:bg-rose-300 shadow-sm font-medium transition-colors text-sm">
                <Printer size={14} /> PDF
              </button>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-[#112A46] text-white px-4 py-2 rounded-lg hover:bg-[#1A3A5F] shadow-sm font-medium transition-colors text-sm"
            >
              <PlusCircle size={16} />
              Nuevo Insumo
            </button>
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <button onClick={() => exportHistorial('xlsx')} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-300 shadow-sm font-medium transition-colors text-sm">
                <Download size={14} /> Excel
              </button>
              <button onClick={() => exportHistorial('pdf')} className="flex items-center gap-2 bg-rose-200 text-rose-800 px-3 py-1.5 rounded-lg hover:bg-rose-300 shadow-sm font-medium transition-colors text-sm">
                <Printer size={14} /> PDF
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            onClick={() => { setActiveTab('insumos'); setFuncSearch(''); setSelectedFunc(null); setSelectedInsumoId(''); setInsumoGlobalSearch(''); }}
            className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'insumos' ? 'border-[#006BB9] bg-white text-[#006BB9]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            <Package size={18} />
            Inventario de Insumos
          </button>
          <button 
            onClick={() => { setActiveTab('func'); setFuncSearch(''); setSelectedFunc(null); }}
            className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'func' ? 'border-[#006BB9] bg-white text-[#006BB9]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            <Users size={18} />
            Por Funcionario
          </button>
          <button 
            onClick={() => { setActiveTab('insumo'); setInsumoGlobalSearch(''); setSelectedInsumoId(''); }}
            className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'insumo' ? 'border-[#006BB9] bg-white text-[#006BB9]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            <Box size={18} />
            Por Insumo
          </button>
        </div>

        {activeTab === 'insumos' ? (
          <div className="overflow-x-auto table-scroll">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs border-b border-gray-200">
                <tr>
                  <SortableHeader label="Nombre" sortKey="nombre" currentKey={insSortKey} currentDir={insSortDir} onSort={handleInsSort} className="px-6 py-3" />
                  <SortableHeader label="Tipo" sortKey="tipo" currentKey={insSortKey} currentDir={insSortDir} onSort={handleInsSort} className="px-6 py-3" />
                  <SortableHeader label="Marca" sortKey="marca" currentKey={insSortKey} currentDir={insSortDir} onSort={handleInsSort} className="px-6 py-3" />
                  <SortableHeader label="Modelo" sortKey="modelo" currentKey={insSortKey} currentDir={insSortDir} onSort={handleInsSort} className="px-6 py-3" />
                  <SortableHeader label="Cantidad" sortKey="cantidad_disponible" currentKey={insSortKey} currentDir={insSortDir} onSort={handleInsSort} className="px-6 py-3 text-center" />
                  <th className="px-6 py-3 text-center w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {insumos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">No hay insumos registrados.</td>
                  </tr>
                ) : (
                  sortedInsumos.map((insumo) => (
                    <tr key={insumo.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{insumo.nombre}</td>
                      <td className="px-6 py-3 text-gray-600">{insumo.tipo || '—'}</td>
                      <td className="px-6 py-3 text-gray-600">{insumo.marca || '—'}</td>
                      <td className="px-6 py-3 text-gray-600">{insumo.modelo || '—'}</td>
                      <td className="px-6 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${insumo.cantidad_disponible > 5 ? 'bg-green-100 text-green-800 border border-green-200' : insumo.cantidad_disponible > 0 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                          {insumo.cantidad_disponible} unid.
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenViewModal(insumo)} title="Ver Asignaciones" className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => openAssignModal(insumo)} title="Asignar a funcionario" className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors">
                            <UserPlus size={16} />
                          </button>
                          <button onClick={() => handleOpenModal(insumo)} title="Editar" className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(insumo.id)} title="Eliminar" className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'func' ? (
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between no-print-interactive">
              <div className="relative flex-1 sm:max-w-md">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-gray-400 animate-none" style={{ top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    value={funcSearch}
                    onChange={e => {
                      setFuncSearch(e.target.value);
                      setShowFuncSug(true);
                      setFocusedFuncIndex(-1);
                      if(!e.target.value) setSelectedFunc(null);
                    }}
                    onKeyDown={e => {
                      if (!showFuncSug) return;
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setFocusedFuncIndex(prev => (prev < funcSuggestions.length - 1 ? prev + 1 : prev));
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setFocusedFuncIndex(prev => (prev > 0 ? prev - 1 : 0));
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (focusedFuncIndex >= 0 && focusedFuncIndex < funcSuggestions.length) {
                          const u = funcSuggestions[focusedFuncIndex];
                          setSelectedFunc(u);
                          setFuncSearch(u.nombre || u.email);
                          setShowFuncSug(false);
                          setFocusedFuncIndex(-1);
                        }
                      } else if (e.key === 'Escape') {
                        setShowFuncSug(false);
                        setFocusedFuncIndex(-1);
                      }
                    }}
                    onFocus={() => setShowFuncSug(true)}
                    onClick={() => {
                      if (selectedFunc) {
                        setFuncSearch('');
                        setSelectedFunc(null);
                        setShowFuncSug(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => { setShowFuncSug(false); setFocusedFuncIndex(-1); }, 200)}
                    placeholder="Buscar funcionario..." 
                    className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm transition-all"
                  />
                </div>
                {showFuncSug && (
                  <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
                    <div className="py-1">
                      {funcSuggestions.length > 0 ? funcSuggestions.map((u, idx) => (
                        <div 
                          key={u.id} 
                          onMouseDown={() => { setSelectedFunc(u); setFuncSearch(u.nombre || u.email); setShowFuncSug(false); setFocusedFuncIndex(-1); }} 
                          className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${focusedFuncIndex === idx ? 'bg-blue-100' : 'hover:bg-slate-50'}`}
                        >
                          <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black uppercase shrink-0 shadow-sm">
                            {getInitials(u.nombre || u.email)}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">{u.nombre || 'Sin nombre'}</span>
                            <span className="text-xs text-gray-500">{u.email}</span>
                          </div>
                        </div>
                      )) : <div className="px-4 py-3 text-slate-500 italic text-center text-sm">Sin coincidencias...</div>}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-sm font-medium text-[#25306B] flex items-center gap-2">
                {selectedFunc ? <><CheckCircle size={16} className="text-green-600" /> Mostrando insumos de {selectedFunc.nombre || selectedFunc.email}</> : 'Seleccione un funcionario'}
              </div>
            </div>

            {!selectedFunc ? (
              <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500 text-sm bg-slate-50">
                Seleccione un funcionario para ver sus insumos entregados.
              </div>
            ) : (
              <div className="table-scroll rounded-lg border border-gray-200 overflow-x-auto">
                <table className="min-w-full text-sm text-left whitespace-nowrap">
                  <thead>
                    <tr>
                      <SortableHeader label="Insumo" sortKey="insumos.nombre" currentKey={asigFuncSortKey} currentDir={asigFuncSortDir} onSort={handleAsigFuncSort} className="text-white bg-[#112A46] text-left" />
                      <SortableHeader label="Marca" sortKey="insumos.marca" currentKey={asigFuncSortKey} currentDir={asigFuncSortDir} onSort={handleAsigFuncSort} className="text-white bg-[#112A46] text-left" />
                      <SortableHeader label="Modelo" sortKey="insumos.modelo" currentKey={asigFuncSortKey} currentDir={asigFuncSortDir} onSort={handleAsigFuncSort} className="text-white bg-[#112A46] text-left" />
                      <SortableHeader label="Fecha Entrega" sortKey="created_at" currentKey={asigFuncSortKey} currentDir={asigFuncSortDir} onSort={handleAsigFuncSort} className="text-white bg-[#112A46] text-left" />
                      <SortableHeader label="Cantidad" sortKey="cantidad" currentKey={asigFuncSortKey} currentDir={asigFuncSortDir} onSort={handleAsigFuncSort} className="text-white bg-[#112A46] text-center" />
                      <SortableHeader label="Observaciones" sortKey="observaciones_admin" currentKey={asigFuncSortKey} currentDir={asigFuncSortDir} onSort={handleAsigFuncSort} className="text-white bg-[#112A46] text-left" />
                      <th className="px-3 py-3 text-center font-bold text-white bg-[#112A46]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedAsignacionesFunc.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No hay insumos entregados a este funcionario.
                        </td>
                      </tr>
                    ) : (
                      sortedAsignacionesFunc.map((asig) => (
                        <tr key={asig.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2.5 font-bold text-[#112A46] text-[15px]">
                            {asig.insumos?.nombre}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">
                            {asig.insumos?.marca || '—'}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">
                            {asig.insumos?.modelo || '—'}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 text-xs">
                            {new Date(asig.created_at).toLocaleDateString()} {new Date(asig.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold text-[#25306B]">
                            {asig.cantidad}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 max-w-[200px] truncate" title={asig.observaciones_admin || ''}>
                            {asig.observaciones_admin || '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button 
                              onClick={() => handleDeleteEntrega(asig)}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors border border-red-100 inline-flex items-center justify-center shrink-0 cursor-pointer"
                              title="Revocar Entrega (Devolver Stock)"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'insumo' ? (
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between no-print-interactive">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <select 
                  value={selectedInsumoId} 
                  onChange={e => setSelectedInsumoId(e.target.value)}
                  className="w-full sm:w-64 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none shadow-sm bg-white"
                >
                  <option value="">— Seleccionar insumo —</option>
                  {insumos.map(i => (
                    <option key={i.id} value={i.id}>{i.nombre} {i.marca ? `(${i.marca})` : ''}</option>
                  ))}
                </select>

                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    value={insumoGlobalSearch}
                    onChange={e => setInsumoGlobalSearch(e.target.value)}
                    placeholder="Filtrar resultados..."
                    className="w-full pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#006BB9] focus:outline-none bg-white"
                  />
                </div>
              </div>
            </div>

            {!selectedInsumoId ? (
              <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500 text-sm bg-slate-50">
                Seleccione un insumo para ver sus entregas y estadísticas.
              </div>
            ) : (
              <>
                {selectedInsumoData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 shadow-sm" style={{borderColor:'var(--slep-primary)'}}>
                      <div className="text-xs text-gray-500 uppercase font-semibold">Total Entregados</div>
                      <div className="text-2xl font-bold text-[#25306B]">{getAsignacionesCount(selectedInsumoId)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 border-l-4 shadow-sm" style={{borderColor:'var(--slep-green)'}}>
                      <div className="text-xs text-gray-500 uppercase font-semibold">Stock Disponible</div>
                      <div className="text-2xl font-bold text-[#90d039]">{selectedInsumoData.cantidad_disponible}</div>
                    </div>
                  </div>
                )}

                <div className="table-scroll rounded-lg border border-gray-200 overflow-x-auto">
                  <table className="min-w-full text-sm text-left whitespace-nowrap">
                    <thead>
                      <tr>
                        <SortableHeader label="Funcionario" sortKey="usuario_nombre" currentKey={asigInsumoSortKey} currentDir={asigInsumoSortDir} onSort={handleAsigInsumoSort} className="text-white bg-[#112A46] text-left" />
                        <SortableHeader label="Correo Electrónico" sortKey="perfiles.email" currentKey={asigInsumoSortKey} currentDir={asigInsumoSortDir} onSort={handleAsigInsumoSort} className="text-white bg-[#112A46] text-left" />
                        <SortableHeader label="Fecha Entrega" sortKey="created_at" currentKey={asigInsumoSortKey} currentDir={asigInsumoSortDir} onSort={handleAsigInsumoSort} className="text-white bg-[#112A46] text-left" />
                        <SortableHeader label="Cantidad" sortKey="cantidad" currentKey={asigInsumoSortKey} currentDir={asigInsumoSortDir} onSort={handleAsigInsumoSort} className="text-white bg-[#112A46] text-center" />
                        <SortableHeader label="Observaciones" sortKey="observaciones_admin" currentKey={asigInsumoSortKey} currentDir={asigInsumoSortDir} onSort={handleAsigInsumoSort} className="text-white bg-[#112A46] text-left" />
                        <th className="px-3 py-3 text-center font-bold text-white bg-[#112A46]">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedAsignacionesInsumo.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            Nadie tiene asignado este insumo aún.
                          </td>
                        </tr>
                      ) : (
                        sortedAsignacionesInsumo.map((asig) => (
                          <tr key={asig.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black uppercase shrink-0 shadow-sm">
                                  {getInitials(asig.usuario_nombre)}
                                </span>
                                <span className="font-semibold text-gray-800">{asig.usuario_nombre}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-gray-700">
                              {asig.perfiles?.email || '—'}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 text-xs">
                              {new Date(asig.created_at).toLocaleDateString()} {new Date(asig.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </td>
                            <td className="px-3 py-2.5 text-center font-bold text-[#25306B]">
                              {asig.cantidad}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 max-w-[200px] truncate" title={asig.observaciones_admin || ''}>
                              {asig.observaciones_admin || '—'}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <button 
                                onClick={() => handleDeleteEntrega(asig)}
                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors border border-red-100 inline-flex items-center justify-center shrink-0 cursor-pointer"
                                title="Revocar Entrega (Devolver Stock)"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Modal Nuevo/Editar Insumo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg animate-scale-in">
            <h2 className="text-xl font-bold mb-5 text-[#25306B] border-b pb-2">{formData.id ? 'Editar Insumo' : 'Nuevo Insumo'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Nombre Descriptivo *</label>
                  <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Ej: Tóner Negro HP" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Tipo *</label>
                  <select
                    required
                    value={selectTipoVal}
                    onChange={e => {
                      setSelectTipoVal(e.target.value);
                      if (e.target.value !== 'Otro') {
                        setFormData({ ...formData, tipo: e.target.value });
                      } else {
                        setFormData({ ...formData, tipo: '' });
                      }
                    }}
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    {dynamicTipos.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="Otro">Otro...</option>
                  </select>
                  {selectTipoVal === 'Otro' && (
                    <input
                      required
                      type="text"
                      value={formData.tipo}
                      onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                      placeholder="Escriba el nuevo tipo de insumo"
                      className="mt-2 w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Stock Disponible *</label>
                  <input required type="number" min="0" value={formData.cantidad_disponible} onChange={e => setFormData({...formData, cantidad_disponible: parseInt(e.target.value)})} className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Marca *</label>
                  <input required type="text" value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Ej: HP" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Modelo *</label>
                  <input required type="text" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Ej: CF283A" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Descripción (Opcional)</label>
                  <textarea value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" rows="2"></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-[#006BB9] text-white font-medium rounded-lg hover:bg-[#25306B] transition-colors shadow-sm">Guardar Insumo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar Insumo */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-white p-6 rounded-xl shadow-2xl w-full transition-all duration-350 animate-scale-in border-t-4 border-emerald-500 ${isMultiAssign ? 'max-w-xl' : 'max-w-md'}`}>
            <h2 className="text-xl font-bold mb-2 text-gray-800">Asignar Insumo</h2>
            <p className="text-sm text-gray-500 mb-4 border-b pb-3">
              Entregando: <strong className="text-emerald-700">{assignData.insumo_nombre}</strong> (Stock: {assignData.stock_actual})
            </p>
            
            <form onSubmit={handleAssign} className="space-y-4">
              {/* Modo asignación múltiple toggle */}
              <div className="flex items-center gap-2 mb-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <input 
                  type="checkbox" 
                  id="multiAssignToggle" 
                  checked={isMultiAssign} 
                  onChange={(e) => {
                    setIsMultiAssign(e.target.checked);
                    setSelectedUsuarios([]);
                    setAssignData(prev => ({ ...prev, usuario_id: '', cantidad: 1 }));
                    setEntregasPrevias(null);
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="multiAssignToggle" className="text-xs font-bold text-gray-700 select-none cursor-pointer">
                  Activar modo asignaciones múltiples
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {isMultiAssign ? 'Buscar Funcionarios *' : 'Funcionario SLEP *'}
                </label>

                {isMultiAssign ? (
                  <div className="space-y-3">
                    <AutocompleteInput
                      name="usuario_id"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      options={usuariosSlep.map(u => ({ label: u.nombre || 'Sin nombre', value: u.id, sublabel: u.email }))}
                      onSelectOption={(opt) => {
                        const user = usuariosSlep.find(u => u.id === opt.value);
                        if (user) {
                          if (!selectedUsuarios.some(s => s.id === user.id)) {
                            setSelectedUsuarios([...selectedUsuarios, user]);
                          } else {
                            showToast('Info', 'El usuario ya está en la lista.', 'info');
                          }
                        }
                        setUserSearchTerm('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm transition-shadow"
                      placeholder="Buscar funcionario por nombre o correo..."
                    />

                    {selectedUsuarios.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Funcionarios por asignar ({selectedUsuarios.length})
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setSelectedUsuarios([])} 
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            Limpiar todos
                          </button>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-2 bg-slate-50/50 max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 custom-scrollbar">
                          {selectedUsuarios.map(u => (
                            <div key={u.id} className="bg-white border border-slate-250 rounded-md p-1.5 flex items-center justify-between shadow-sm">
                              <div className="min-w-0 flex-1 pr-1.5">
                                <div className="font-bold text-gray-800 text-[11px] leading-tight truncate">{u.nombre || 'Sin nombre'}</div>
                                <div className="text-[9px] text-gray-500 truncate">{u.email}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedUsuarios(selectedUsuarios.filter(s => s.id !== u.id))}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-0.5 rounded transition-colors text-sm font-bold"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {assignData.usuario_id ? (
                      <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg shadow-sm w-full">
                        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 pr-2">
                          <div className="w-6 h-6 shrink-0 rounded-full bg-[#006BB9] text-white flex items-center justify-center text-xs font-bold">
                            {getInitials(usuariosSlep.find(u => u.id === assignData.usuario_id)?.nombre)}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-xs leading-tight font-bold text-[#25306B] truncate">
                              {usuariosSlep.find(u => u.id === assignData.usuario_id)?.nombre || 'Funcionario'}
                            </span>
                            <span className="text-[10px] text-gray-500 truncate">
                              {usuariosSlep.find(u => u.id === assignData.usuario_id)?.email || ''}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAssignData({ ...assignData, usuario_id: '' });
                            setEntregasPrevias(null);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors font-bold text-sm"
                          title="Cambiar funcionario"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <AutocompleteInput
                        name="usuario_id"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        options={usuariosSlep.map(u => ({ label: u.nombre || 'Sin nombre', value: u.id, sublabel: u.email }))}
                        onSelectOption={(opt) => {
                          setAssignData({
                            ...assignData,
                            usuario_id: opt.value
                          });
                          setUserSearchTerm('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm transition-shadow"
                        placeholder="Buscar funcionario por nombre o correo..."
                      />
                    )}

                    {entregasPrevias !== null && (
                      <div className={`mt-2 text-[11px] p-2.5 rounded-lg border ${entregasPrevias > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {entregasPrevias > 0 ? (
                          <p className="flex items-start gap-1.5">
                            <span className="text-amber-500 mt-0.5">⚠️</span> 
                            <span>Este funcionario ya ha recibido <strong>{entregasPrevias} unidad(es)</strong> de este insumo históricamente. Considere esto antes de asignar más.</span>
                          </p>
                        ) : (
                          <p className="flex items-start gap-1.5">
                            <span className="text-slate-400 mt-0.5">ℹ️</span> 
                            <span>Primer registro: Este funcionario no ha recibido este insumo anteriormente.</span>
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {isMultiAssign ? 'Cantidad por funcionario *' : 'Cantidad a entregar *'}
                  {isMultiAssign && selectedUsuarios.length > 0 && (
                    <span className="text-[10px] text-gray-500 lowercase font-normal ml-1">
                      (Total: {assignData.cantidad * selectedUsuarios.length} uds, Stock disp: {assignData.stock_actual})
                    </span>
                  )}
                </label>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  max={isMultiAssign && selectedUsuarios.length > 0 ? Math.floor(assignData.stock_actual / selectedUsuarios.length) : assignData.stock_actual} 
                  value={assignData.cantidad} 
                  onChange={e => setAssignData({...assignData, cantidad: parseInt(e.target.value) || 1})} 
                  className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Observaciones / Notas (Opcional)</label>
                <textarea 
                  value={assignData.observaciones} 
                  onChange={e => setAssignData({...assignData, observaciones: e.target.value})} 
                  className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  rows="2"
                  placeholder="Detalles sobre la entrega..."
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={
                    (isMultiAssign ? selectedUsuarios.length === 0 : !assignData.usuario_id) || 
                    assignData.cantidad < 1 || 
                    (assignData.cantidad * (isMultiAssign ? selectedUsuarios.length : 1)) > assignData.stock_actual
                  } 
                  className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  Confirmar Entrega {isMultiAssign && selectedUsuarios.length > 0 ? `(${assignData.cantidad * selectedUsuarios.length} uds)` : ''}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Carga Masiva */}
      {isMasivaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => { setIsMasivaModalOpen(false); setStatus({ type: 'idle', message: '' }); }} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors cursor-pointer"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-[#25306B] flex items-center gap-2">
              <UploadCloud className="text-[#006BB9]" /> Carga Masiva de Insumos
            </h2>
            
            <div className="overflow-y-auto flex-1 pr-2 mt-2 custom-scrollbar">
              <p className="text-[13px] text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                Sube un archivo Excel (<strong>.xlsx, .xls</strong>) o <strong>.csv</strong> con el inventario de insumos. Las columnas reconocidas automáticamente son (la primera fila debe ser el encabezado): <br/>
                <span className="font-mono text-blue-800 text-xs font-bold leading-relaxed">Nombre, Tipo, Marca, Modelo, Categoría, Descripción, Cantidad</span>
              </p>

              <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-colors relative group mt-2">
                <label className="cursor-pointer flex flex-col items-center justify-center">
                  <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <UploadCloud size={28} />
                  </div>
                  <span className="font-bold text-[#006BB9] text-base group-hover:underline">Haz clic para buscar el archivo</span>
                  <span className="text-xs text-gray-500 mt-2">o arrastra el archivo aquí</span>
                  <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileUpload} ref={fileInputRef} />
                </label>
              </div>

              {status.type !== 'idle' && (
                <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
                  status.type === 'processing' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {status.type === 'processing' && <AlertCircle className="w-4 h-4 animate-pulse shrink-0 mt-0.5" />}
                  {status.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  {status.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span className="font-medium leading-tight">{status.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para Ver Asignaciones */}
      {isViewModalOpen && viewInsumo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-fade-in relative overflow-hidden">
            
            {/* Header del modal */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Package size={24} className="stroke-[1.5]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  Asignaciones de Insumo
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-medium">
                  <span className="text-blue-600">{viewInsumo.nombre}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span>{viewInsumo.tipo}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  <span>{viewInsumoAsignaciones.reduce((acc, curr) => acc + (curr.cantidad || 0), 0)} unidades entregadas</span>
                </div>
              </div>
              <button 
                onClick={() => setIsViewModalOpen(false)} 
                className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 overflow-x-auto min-h-0">
              {isViewModalLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-sm font-medium">Cargando asignaciones...</p>
                </div>
              ) : viewInsumoAsignaciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Package size={32} className="mb-3 opacity-20" />
                  <p className="text-sm font-medium">No hay entregas registradas para este insumo aún.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <table className="min-w-full text-xs text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                        <SortableHeader label="Funcionario" sortKey="nombre" currentKey={vAsigSortKey} currentDir={vAsigSortDir} onSort={handleVAsigSort} className="text-white text-left px-4 py-2 hover:bg-slate-800" />
                        <SortableHeader label="Correo Electrónico" sortKey="email" currentKey={vAsigSortKey} currentDir={vAsigSortDir} onSort={handleVAsigSort} className="text-white text-left px-4 py-2 hover:bg-slate-800" />
                        <SortableHeader label="Fecha Entrega" sortKey="created_at" currentKey={vAsigSortKey} currentDir={vAsigSortDir} onSort={handleVAsigSort} className="text-white text-left px-4 py-2 hover:bg-slate-800 whitespace-nowrap" />
                        <SortableHeader label="Cantidad" sortKey="cantidad" currentKey={vAsigSortKey} currentDir={vAsigSortDir} onSort={handleVAsigSort} className="text-white text-center px-4 py-2 hover:bg-slate-800 whitespace-nowrap" />
                        <th className="px-4 py-2 text-center w-24 border-l border-slate-800/50 whitespace-nowrap">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {sortedViewAsignaciones.map(a => {
                        const uName = a.perfiles?.nombre || a.usuario_nombre || 'Sin nombre';
                        const uEmail = a.perfiles?.email || 'Sin correo';
                        const dateStr = new Date(a.created_at).toLocaleDateString() + ' ' + new Date(a.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        const initials = uName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
                        
                        const uid = a.usuario_id || uName || a.id;
                        const orderArr = userAssignOrder[uid] || [];
                        const isMultiple = orderArr.indexOf(a.id) > 0;
                        const qtyBg = isMultiple ? "bg-yellow-100 text-yellow-800 border-yellow-200" : "bg-gray-100 text-gray-700 border-gray-200";

                        return (
                          <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black uppercase shrink-0 shadow-sm">
                                  {initials}
                               </span>
                                <span className="font-semibold text-slate-700 break-words">{uName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-slate-500 font-medium break-all whitespace-normal">{uEmail}</td>
                            <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{dateStr}</td>
                            <td className="px-4 py-2 text-center whitespace-nowrap">
                              <div className="relative inline-flex items-center justify-center">
                                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full font-bold border ${qtyBg}`}>
                                  {a.cantidad}
                                </span>
                                {a.observaciones_admin && (
                                  <>
                                    <div className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white cursor-help peer z-10"></div>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all whitespace-normal w-max max-w-[200px] z-50 pointer-events-none leading-tight font-normal text-left">
                                      {a.observaciones_admin}
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-slate-800"></div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleRevocarDesdeModal(a)}
                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors border border-red-100 inline-flex items-center justify-center shrink-0 cursor-pointer"
                                title="Revocar Entrega (Devolver Stock)"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsViewModalOpen(false)} 
                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
