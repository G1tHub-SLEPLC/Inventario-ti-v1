import { useState, useRef, useEffect } from 'react';
import { useSolicitudes } from '../context/SolicitudesContext';
import { supabase } from '../lib/supabaseClient';
import { useInventario } from '../context/InventarioContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Edit2, Trash2, UserPlus, History, Package, Upload, Download, Printer, UploadCloud, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { logAuditoria, getDiffString } from '../utils/auditoria';
import { exportToExcelAndPDF } from '../utils/exportUtils';
import { useSort } from '../hooks/useSort';
import { SortableHeader } from '../components/SortableHeader';

function getInitials(name) {
  if (!name || name === '—') return '??';
  const words = String(name).trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function InsumosPage() {
  const { insumos } = useSolicitudes();
  const { showToast } = useInventario();
  const { session } = useAuth();
  const { sorted: sortedInsumos, sortKey: insSortKey, sortDir: insSortDir, handleSort: handleInsSort } = useSort(insumos);
  
  const [activeTab, setActiveTab] = useState('insumos'); // 'insumos' o 'historial'
  const [historial, setHistorial] = useState([]);
  const [usuariosSlep, setUsuariosSlep] = useState([]);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, nombre: '', descripcion: '', categoria: '', tipo: '', marca: '', modelo: '', cantidad_disponible: 0 });
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState({ insumo_id: null, insumo_nombre: '', usuario_id: '', cantidad: 1, stock_actual: 0, observaciones: '' });
  const [entregasPrevias, setEntregasPrevias] = useState(null);

  const [isEditHistModalOpen, setIsEditHistModalOpen] = useState(false);
  const [editHistData, setEditHistData] = useState({ id: null, insumo_id: null, insumo_nombre: '', usuario_nombre: '', cantidad_original: 0, cantidad_nueva: 0, observaciones_original: '', observaciones: '' });

  const [isMasivaModalOpen, setIsMasivaModalOpen] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const fileInputRef = useRef(null);

  // Load perfiles para select de asignación
  useEffect(() => {
    const loadUsuarios = async () => {
      const { data } = await supabase.from('perfiles').select('id, nombre, email, rol');
      if (data) setUsuariosSlep(data.filter(u => u.rol === 'slep'));
    };
    loadUsuarios();
  }, []);

  // Load historial
  useEffect(() => {
    if (activeTab === 'historial') {
      const loadHistorial = async () => {
        const { data: sols } = await supabase
          .from('solicitudes')
          .select('id, cantidad, created_at, usuario_id, observaciones_admin, insumos(nombre, tipo, marca, modelo)')
          .eq('tipo', 'insumo')
          .eq('estado', 'aprobado')
          .order('created_at', { ascending: false });
          
        if (sols) {
          const { data: perfs } = await supabase.from('perfiles').select('id, nombre, email');
          const hist = sols.map(s => {
            const user = perfs?.find(p => p.id === s.usuario_id);
            return {
              ...s,
              usuario_nombre: user?.nombre || user?.email || 'Desconocido'
            };
          });
          setHistorial(hist);
        }
      };
      loadHistorial();
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

  const handleOpenModal = (insumo = null) => {
    if (insumo) {
      setFormData(insumo);
    } else {
      setFormData({ id: null, nombre: '', descripcion: '', categoria: '', tipo: '', marca: '', modelo: '', cantidad_disponible: 0 });
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
        showToast('Eliminado', 'Insumo eliminado correctamente.', 'success');
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
    setIsAssignModalOpen(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (assignData.cantidad > assignData.stock_actual) {
      showToast('Stock insuficiente', 'La cantidad a asignar supera el stock disponible.', 'warning');
      return;
    }
    if (!assignData.usuario_id) {
      showToast('Error', 'Debe seleccionar un funcionario.', 'error');
      return;
    }

    // Explicit confirmation if the user already received this item previously
    if (entregasPrevias > 0) {
      const confirmacion = window.confirm(`ATENCIÓN: Este funcionario ya ha recibido ${entregasPrevias} unidad(es) de este insumo anteriormente.\\n\\n¿Estás seguro de que deseas asignarle otra unidad de forma duplicada?`);
      if (!confirmacion) {
        return; // Cancel the assignment
      }
    }

    try {
      // 1. Descontar stock
      const { error: errorUpd } = await supabase.from('insumos')
        .update({ cantidad_disponible: assignData.stock_actual - assignData.cantidad })
        .eq('id', assignData.insumo_id);
      
      if (errorUpd) throw errorUpd;

      // 2. Registrar en solicitudes como entregado (aprobado)
      const { error: errorSol } = await supabase.from('solicitudes').insert({
        usuario_id: assignData.usuario_id,
        tipo: 'insumo',
        insumo_id: assignData.insumo_id,
        cantidad: assignData.cantidad,
        estado: 'aprobado',
        observaciones_admin: assignData.observaciones ? `Entrega directa: ${assignData.observaciones}` : 'Entrega directa'
      });

      if (errorSol) throw errorSol;

      // 3. Log Auditoria
      const funcName = usuariosSlep.find(u => u.id === assignData.usuario_id)?.nombre || 'Funcionario';
      await logAuditoria('insumos', 'Asignar Insumo', `Asignó ${assignData.cantidad}x ${assignData.insumo_nombre}. Observaciones: ${assignData.observaciones || 'Ninguna'}`, funcName);

      showToast('Asignación exitosa', `Se han asignado ${assignData.cantidad} unidades a la cuenta seleccionada.`, 'success');
      setIsAssignModalOpen(false);
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
      // Update UI manually or reload
      setHistorial(prev => prev.filter(h => h.id !== histItem.id));
    } catch (err) {
      console.error(err);
      showToast('Error', 'Hubo un error al intentar revertir la entrega.', 'error');
    }
  };

  const openEditHistModal = (histItem) => {
    setEditHistData({
      id: histItem.id,
      insumo_id: histItem.insumo_id,
      insumo_nombre: histItem.insumos?.nombre,
      usuario_nombre: histItem.usuario_nombre,
      cantidad_original: histItem.cantidad,
      cantidad_nueva: histItem.cantidad,
      observaciones_original: histItem.observaciones_admin || '',
      observaciones: histItem.observaciones_admin || ''
    });
    setIsEditHistModalOpen(true);
  };

  const handleEditHistorial = async (e) => {
    e.preventDefault();
    if (editHistData.cantidad_nueva < 1) {
      showToast('Error', 'La cantidad debe ser al menos 1.', 'error');
      return;
    }

    const diff = editHistData.cantidad_nueva - editHistData.cantidad_original;

    try {
      if (diff > 0 && editHistData.insumo_id) {
        // Verificar si hay stock suficiente para aumentar la entrega
        const { data: currentInsumo } = await supabase.from('insumos').select('cantidad_disponible').eq('id', editHistData.insumo_id).single();
        if (!currentInsumo || currentInsumo.cantidad_disponible < diff) {
          showToast('Stock insuficiente', `Solo hay ${currentInsumo?.cantidad_disponible || 0} en stock, no se puede aumentar la entrega en ${diff}.`, 'warning');
          return;
        }
      }

      // 1. Actualizar solicitud
      const { error: updSolError } = await supabase.from('solicitudes')
        .update({ cantidad: editHistData.cantidad_nueva, observaciones_admin: editHistData.observaciones })
        .eq('id', editHistData.id);
      
      if (updSolError) throw updSolError;

      // 2. Actualizar stock si hubo cambio en cantidad
      if (diff !== 0 && editHistData.insumo_id) {
        const { data: currentInsumo } = await supabase.from('insumos').select('cantidad_disponible').eq('id', editHistData.insumo_id).single();
        if (currentInsumo) {
          await supabase.from('insumos').update({ cantidad_disponible: currentInsumo.cantidad_disponible - diff }).eq('id', editHistData.insumo_id);
        }
      }

      // 3. Log Auditoria
      const oldVals = { cantidad: editHistData.cantidad_original, observaciones: editHistData.observaciones_original };
      const newVals = { cantidad: editHistData.cantidad_nueva, observaciones: editHistData.observaciones };
      const diffText = getDiffString(oldVals, newVals);
      await logAuditoria('insumos', 'Editar Entrega', `Se modificó la entrega de ${editHistData.insumo_nombre}. Cambios detectados: ${diffText}`, editHistData.usuario_nombre);
      
      showToast('Actualizado', 'La entrega ha sido actualizada correctamente.', 'success');
      
      // Update UI manually
      setHistorial(prev => prev.map(h => {
        if (h.id === editHistData.id) {
          return { ...h, cantidad: editHistData.cantidad_nueva, observaciones_admin: editHistData.observaciones };
        }
        return h;
      }));
      setIsEditHistModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Error', 'Hubo un error al editar la entrega.', 'error');
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
    const cols = ['Fecha', 'Funcionario', 'Insumo', 'Marca/Modelo', 'Cantidad', 'Observaciones'];
    const title = 'Historial de Entregas de Insumos';
    const formatter = (row) => ({
      'Fecha': new Date(row.created_at).toLocaleString(),
      'Funcionario': row.usuario_nombre,
      'Insumo': row.insumos?.nombre || '—',
      'Marca/Modelo': `${row.insumos?.marca || ''} - ${row.insumos?.modelo || ''}`,
      'Cantidad': row.cantidad,
      'Observaciones': row.observaciones_admin || '—'
    });
    exportToExcelAndPDF(format, historial, cols, title, 'insumos_entregas', formatter);
  };

  return (
    <div className="p-6 max-w-[1920px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Insumos</h1>
        
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
          <div className="flex gap-2">
            <button onClick={() => exportHistorial('xlsx')} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-300 shadow-sm font-medium transition-colors text-sm">
              <Download size={14} /> Excel
            </button>
            <button onClick={() => exportHistorial('pdf')} className="flex items-center gap-2 bg-rose-200 text-rose-800 px-3 py-1.5 rounded-lg hover:bg-rose-300 shadow-sm font-medium transition-colors text-sm">
              <Printer size={14} /> PDF
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button 
            onClick={() => setActiveTab('insumos')}
            className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'insumos' ? 'border-[#006BB9] bg-white text-[#006BB9]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            <Package size={18} />
            Inventario de Insumos
          </button>
          <button 
            onClick={() => setActiveTab('historial')}
            className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'historial' ? 'border-[#006BB9] bg-white text-[#006BB9]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
          >
            <History size={18} />
            Historial de Entregas
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
        ) : (
          <div className="overflow-x-auto table-scroll">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Funcionario</th>
                  <th className="px-6 py-3">Insumo Entregado</th>
                  <th className="px-6 py-3 text-center">Cantidad</th>
                  <th className="px-6 py-3">Observaciones</th>
                  <th className="px-6 py-3 text-center w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historial.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">No hay historial de entregas.</td>
                  </tr>
                ) : (
                  historial.map((hist) => (
                    <tr key={hist.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 text-gray-600">{new Date(hist.created_at).toLocaleDateString()} {new Date(hist.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 p-0.5 pr-2.5 rounded-full text-[12px] font-bold border border-blue-200 shadow-sm">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black uppercase shrink-0">
                            {getInitials(hist.usuario_nombre)}
                          </span>
                          <span title={hist.usuario_nombre}>{hist.usuario_nombre}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {hist.insumos?.nombre} 
                        <span className="text-xs text-gray-400 ml-2">({hist.insumos?.marca} - {hist.insumos?.modelo})</span>
                      </td>
                      <td className="px-6 py-3 text-center font-bold text-[#25306B]">
                        {hist.cantidad}
                      </td>
                      <td className="px-6 py-3 text-gray-500 italic max-w-xs truncate" title={hist.observaciones_admin}>
                        {hist.observaciones_admin || '—'}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openEditHistModal(hist)} 
                            title="Editar entrega" 
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteEntrega(hist)} 
                            title="Revertir y eliminar entrega" 
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                          >
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
        )}
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
                  <select required value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="Tóner">Tóner</option>
                    <option value="Tinta">Tinta</option>
                    <option value="Tambor">Tambor</option>
                    <option value="Mouse">Mouse</option>
                    <option value="Teclado">Teclado</option>
                    <option value="Pilas">Pilas</option>
                    <option value="Otro">Otro</option>
                  </select>
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
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-scale-in border-t-4 border-emerald-500">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Asignar Insumo</h2>
            <p className="text-sm text-gray-500 mb-5 border-b pb-3">Entregando: <strong className="text-emerald-700">{assignData.insumo_nombre}</strong> (Stock: {assignData.stock_actual})</p>
            
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Funcionario SLEP *</label>
                <select required value={assignData.usuario_id} onChange={e => setAssignData({...assignData, usuario_id: e.target.value})} className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white">
                  <option value="">-- Seleccione un funcionario --</option>
                  {usuariosSlep.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre || u.email}</option>
                  ))}
                </select>
                
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
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Cantidad a entregar *</label>
                <input required type="number" min="1" max={assignData.stock_actual} value={assignData.cantidad} onChange={e => setAssignData({...assignData, cantidad: parseInt(e.target.value)})} className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500" />
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
                <button type="submit" disabled={assignData.stock_actual < 1} className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  Confirmar Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Historial */}
      {isEditHistModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-scale-in border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-2 text-gray-800">Editar Entrega</h2>
            <p className="text-sm text-gray-500 mb-5 border-b pb-3">Funcionario: <strong className="text-[#25306B]">{editHistData.usuario_nombre}</strong> <br/>Insumo: <strong className="text-[#25306B]">{editHistData.insumo_nombre}</strong></p>
            
            <form onSubmit={handleEditHistorial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Cantidad Entregada *</label>
                <div className="flex items-center gap-3">
                  <input required type="number" min="1" value={editHistData.cantidad_nueva} onChange={e => setEditHistData({...editHistData, cantidad_nueva: parseInt(e.target.value)})} className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500" />
                  <span className="text-xs text-gray-500 whitespace-nowrap">(Original: {editHistData.cantidad_original})</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Observaciones / Notas (Opcional)</label>
                <textarea 
                  value={editHistData.observaciones} 
                  onChange={e => setEditHistData({...editHistData, observaciones: e.target.value})} 
                  className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                  placeholder="Detalles sobre la entrega..."
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsEditHistModalOpen(false)} className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                  Guardar Cambios
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

    </div>
  );
}
