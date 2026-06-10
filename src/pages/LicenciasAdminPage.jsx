import { useState, useRef, useEffect, useMemo } from 'react';
import { useLicencias } from '../context/LicenciasContext';
import { useInventario } from '../context/InventarioContext';
import { supabase } from '../lib/supabaseClient';
import { PlusCircle, Edit2, Trash2, Key, Users, UploadCloud, Download, Printer, AlertTriangle, CheckCircle, AlertCircle, FileText, Upload, UserPlus, Plus, X, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { exportToExcelAndPDF } from '../utils/exportUtils';
import { useAuth } from '../context/AuthContext';

const TIPOS_LICENCIA = [
  'SAAS', 'Perpetua', 'SW Propietario', 'SW Libre (Open Source)', 'Freemium / Shareware', 'PAAS (Plataforma como Servicio)', 'IAAS (Infraestructura como Servicio)'
];

const formatLocalDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return new Date(dateStr).toLocaleDateString();
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

export default function LicenciasAdminPage() {
  const { session } = useAuth();
  const { licencias, asignaciones, loading, addLicencia, updateLicencia, deleteLicencia, asignarLicencia, asignarLicenciasMultiples, revocarLicencia, getAsignacionesCount, addLicenciasMasivo, executeMasivoLicencias, saveLicenciaDocument, setLicenciaFileStatus } = useLicencias();
  const { showToast } = useInventario();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isMasivaModalOpen, setIsMasivaModalOpen] = useState(false);
  
  const [validationErrors, setValidationErrors] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [resolvedConflicts, setResolvedConflicts] = useState({});
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [pendingImports, setPendingImports] = useState([]);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({ 
    id: null, software: '', version: '', tipo: 'SAAS', descripcion: '', cantidad_total: 1,
    fecha_inicio: '', fecha_termino: '', factura: '', orden_compra: '', has_factura_file: false, has_oc_file: false
  });
  
  const [facturaFile, setFacturaFile] = useState(null);
  const [ocFile, setOcFile] = useState(null);

  const [assignData, setAssignData] = useState({ licencia_id: '', usuario_id: '' });
  const [viewLicencia, setViewLicencia] = useState(null);
  
  const [usuarios, setUsuarios] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);
  const [focusedUserIndex, setFocusedUserIndex] = useState(-1);

  useEffect(() => {
    const fetchUsuarios = async () => {
      const { data } = await supabase.from('perfiles').select('*').order('nombre', { ascending: true });
      if (data) setUsuarios(data);
    };
    fetchUsuarios();
  }, []);

  const handleOpenModal = (lic = null) => {
    if (lic) {
      setFormData({ 
        id: lic.id, software: lic.software, version: lic.version || '', tipo: lic.tipo || 'SAAS', 
        descripcion: lic.descripcion || '', cantidad_total: lic.cantidad_total,
        fecha_inicio: lic.fecha_inicio || '', fecha_termino: lic.fecha_termino || '', 
        factura: lic.factura || '', orden_compra: lic.orden_compra || '', 
        has_factura_file: lic.has_factura_file || false, has_oc_file: lic.has_oc_file || false
      });
    } else {
      setFormData({ 
        id: null, software: '', version: 'Suscripción Anual', tipo: 'SAAS', descripcion: '', cantidad_total: 1,
        fecha_inicio: '', fecha_termino: '', factura: '', orden_compra: '', has_factura_file: false, has_oc_file: false
      });
    }
    setFacturaFile(null);
    setOcFile(null);
    setIsModalOpen(true);
  };

  const handleOpenAssignModal = (licenciaId = '') => {
    setAssignData({ licencia_id: licenciaId, usuario_id: '' });
    setUserSearchTerm('');
    setIsUserDropdownOpen(false);
    setSelectedUsuarios([]);
    setFocusedUserIndex(-1);
    setIsAssignModalOpen(true);
  };

  const filteredAvailableUsuarios = useMemo(() => {
    if (!assignData.licencia_id) return [];
    const q = userSearchTerm.toLowerCase().trim();
    return usuarios.filter(u => {
      const hasLicense = asignaciones.some(a => a.usuario_id === u.id && a.licencia_id === assignData.licencia_id);
      const isAlreadySelected = selectedUsuarios.some(s => s.id === u.id);
      const matchesSearch = (u.nombre || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
      return !hasLicense && !isAlreadySelected && matchesSearch;
    });
  }, [usuarios, asignaciones, assignData.licencia_id, selectedUsuarios, userSearchTerm]);

  const handleAddUser = (user) => {
    if (!assignData.licencia_id) {
      showToast('Atención', 'Debe seleccionar un software de la lista primero.', 'warning');
      return;
    }
    const lic = licencias.find(l => l.id === assignData.licencia_id);
    if (!lic) return;
    const disponibles = lic.cantidad_total - getAsignacionesCount(lic.id);
    if (selectedUsuarios.length >= disponibles) {
      showToast('Stock insuficiente', `No quedan más licencias disponibles de este software (${disponibles} en total).`, 'warning');
      return;
    }
    setSelectedUsuarios([...selectedUsuarios, user]);
    setUserSearchTerm('');
    setFocusedUserIndex(-1);
  };

  const handleRemoveUser = (user) => {
    setSelectedUsuarios(selectedUsuarios.filter(s => s.id !== user.id));
  };

  const handleUserKeyDown = (e) => {
    if (filteredAvailableUsuarios.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedUserIndex(prev => (prev < filteredAvailableUsuarios.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedUserIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' || (e.key === ' ' && focusedUserIndex >= 0)) {
      if (focusedUserIndex >= 0 && focusedUserIndex < filteredAvailableUsuarios.length) {
        e.preventDefault();
        const user = filteredAvailableUsuarios[focusedUserIndex];
        handleAddUser(user);
      }
    }
  };

  const handleOpenViewModal = (lic) => {
    setViewLicencia(lic);
    setIsViewModalOpen(true);
  };

  const handleTipoChange = (e) => {
    const newTipo = e.target.value;
    const isSaasLike = newTipo === 'SAAS' || newTipo === 'PAAS (Plataforma como Servicio)' || newTipo === 'IAAS (Infraestructura como Servicio)';
    setFormData({
      ...formData,
      tipo: newTipo,
      version: isSaasLike ? 'Suscripción Anual' : formData.version
    });
  };

  const norm = (val) => String(val || '').trim().toLowerCase();

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dbPayload = {
        software: formData.software,
        version: formData.version,
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        cantidad_total: formData.cantidad_total,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_termino: formData.fecha_termino || null,
        factura: formData.factura || '',
        orden_compra: formData.orden_compra || ''
      };

      let finalId = formData.id;

      if (formData.id) {
        await updateLicencia(formData.id, dbPayload);
      } else {
        const result = await addLicencia(dbPayload);
        if (result && result.length > 0) finalId = result[0].id;
      }

      // Handle Files Upload
      if (finalId) {
        if (facturaFile && formData.factura) {
           const storageKey = `factura_${norm(formData.factura)}_${Date.now()}`;
           await saveLicenciaDocument(storageKey, 'factura', facturaFile, finalId);
        }
        if (ocFile && formData.orden_compra) {
           const storageKey = `oc_${norm(formData.orden_compra)}_${Date.now()}`;
           await saveLicenciaDocument(storageKey, 'orden_compra', ocFile, finalId);
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = async (licenciaId, type) => {
    const targetLic = licencias.find(e => e.id === licenciaId);
    if (!targetLic) return;
    const fieldName = type === 'factura' ? 'factura' : 'orden_compra';
    const code = targetLic[fieldName];
    if (!code) return;
    
    try {
      const { data, error } = await supabase.storage.from('documentos').list();
      if (error) throw error;
      
      const filePrefix = type === 'factura' ? `factura_${norm(code)}` : `oc_${norm(code)}`;
      const match = data.find(f => f.name.startsWith(filePrefix));
      
      if (match) {
        const { data: urlData, error: urlError } = await supabase.storage
          .from('documentos')
          .createSignedUrl(match.name, 60);
          
        if (urlError) throw urlError;
        window.open(urlData.signedUrl, '_blank');
      } else {
         alert('El archivo no pudo ser localizado en el almacenamiento.');
         // Auto-fix desync
         setLicenciaFileStatus(licenciaId, type, false);
      }
    } catch (err) {
      console.error(err);
      alert('Error al obtener el documento.');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignData.licencia_id) {
      showToast('Atención', 'Debe seleccionar un software de la lista.', 'warning');
      return;
    }
    if (selectedUsuarios.length === 0) {
      showToast('Atención', 'Debe seleccionar al menos un funcionario.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const lic = licencias.find(l => l.id === assignData.licencia_id);
      await asignarLicenciasMultiples(
        assignData.licencia_id, 
        selectedUsuarios, 
        lic?.software
      );
      setIsAssignModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (lic) => {
    setDeleteTarget(lic);
    setAdminPassword('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    setDeleteError('');
    setIsDeleting(true);
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: adminPassword
      });
      
      if (authError) {
        setDeleteError(`Contraseña incorrecta: ${authError.message}`);
        setIsDeleting(false);
        return;
      }
      
      await deleteLicencia(deleteTarget.id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      setDeleteError('Ocurrió un error al eliminar.');
    }
    setIsDeleting(false);
  };

  const handleRevocar = async (asignacion) => {
    if (confirm(`¿Revocar el acceso a esta licencia para ${asignacion.perfiles?.nombre || asignacion.perfiles?.email}?`)) {
      await revocarLicencia(asignacion.id, asignacion.licencias?.software, asignacion.perfiles?.nombre || asignacion.perfiles?.email);
    }
  };

  const asignacionesDeLicencia = viewLicencia 
    ? asignaciones
        .filter(a => a.licencia_id === viewLicencia.id)
        .sort((a, b) => {
          const nameA = (a.perfiles?.nombre || a.perfiles?.email || '').toLowerCase();
          const nameB = (b.perfiles?.nombre || b.perfiles?.email || '').toLowerCase();
          return nameA.localeCompare(nameB);
        })
    : [];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setStatus({ type: 'processing', message: 'Procesando archivo...' });
    
    const ext = file.name.split('.').pop().toLowerCase();
    
    if(ext === 'csv') {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: res => processMasivaData(res.data),
        error: err => setStatus({ type: 'error', message: err.message })
      });
    } else if(ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const wb = XLSX.read(ev.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
          processMasivaData(json);
        } catch(err) {
          setStatus({ type: 'error', message: 'Error al leer el archivo Excel' });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setStatus({ type: 'error', message: 'Formato no soportado. Usa CSV o XLSX.' });
    }
  };

  const processMasivaData = async (rows) => {
    setValidationErrors([]);
    setConflicts([]);
    setResolvedConflicts({});
    setPendingImports([]);

    const errors = [];
    const cleanedRows = [];
    
    rows.forEach((r, idx) => {
      const getField = (aliases) => {
        const key = Object.keys(r).find(k => aliases.includes(k.trim().toLowerCase()));
        return key ? String(r[key]).trim() : '';
      };
      
      const software = getField(['nombre', 'software', 'nombre software']);
      if (!software) return;
      
      const facturaVal = getField(['factura', 'nº factura', 'num factura']);
      const ocVal = getField(['orden de compra', 'oc']);
      const version = getField(['versión', 'version']);
      const tipo = getField(['tipo', 'tipo licencia', 'tipo de licencia']) || 'SAAS';
      const cantidad_total = parseInt(getField(['total licencias', 'cantidad', 'total', 'cantidad total', 'licencias'])) || 1;
      const descripcion = getField(['descripción', 'descripcion', 'detalle']) || '';
      const fecha_inicio = getField(['fecha de inicio', 'fecha inicio', 'desde']) || null;
      const fecha_termino = getField(['fecha de término', 'fecha termino', 'hasta', 'vencimiento']) || null;
      
      const rowNum = idx + 2;
      
      if (facturaVal && !/^\d+$/.test(facturaVal)) {
        errors.push(`Fila ${rowNum} (${software}): Factura '${facturaVal}' debe ser solo números.`);
      }
      if (ocVal && !/^1456839-\d{2}-[a-zA-Z]{2}26$/i.test(ocVal)) {
        errors.push(`Fila ${rowNum} (${software}): Orden de Compra '${ocVal}' debe tener el formato 1456839-??-??26.`);
      }
      
      cleanedRows.push({
        software,
        version,
        tipo,
        cantidad_total,
        descripcion,
        fecha_inicio: fecha_inicio || null,
        fecha_termino: fecha_termino || null,
        factura: facturaVal,
        orden_compra: ocVal.toUpperCase()
      });
    });
    
    if (errors.length > 0) {
      setStatus({ type: 'error', message: 'Errores de formato en el archivo.' });
      setValidationErrors(errors);
      return;
    }
    
    if (cleanedRows.length === 0) {
      setStatus({ type: 'error', message: 'No se encontraron licencias válidas en el archivo.' });
      return;
    }

    const detectedConflicts = [];
    const defaultResolved = {};

    cleanedRows.forEach(row => {
      const existing = licencias.find(l => l.software.trim().toLowerCase() === row.software.trim().toLowerCase());
      const duplicateOc = row.orden_compra ? licencias.find(l => l.orden_compra && l.orden_compra.trim().toUpperCase() === row.orden_compra.toUpperCase()) : null;

      if (existing || duplicateOc) {
        const isSameQty = existing && existing.cantidad_total === row.cantidad_total;
        
        detectedConflicts.push({
          software: row.software,
          version: row.version,
          uploadedQty: row.cantidad_total,
          existingId: existing ? existing.id : null,
          existingQty: existing ? existing.cantidad_total : 0,
          isSameQty,
          duplicateOc: duplicateOc ? {
            code: row.orden_compra,
            software: duplicateOc.software
          } : null,
          rowPayload: row
        });

        defaultResolved[row.software] = 'sumar';
      }
    });

    if (detectedConflicts.length > 0) {
      setConflicts(detectedConflicts);
      setResolvedConflicts(defaultResolved);
      setPendingImports(cleanedRows);
      setIsConflictModalOpen(true);
      setStatus({ type: 'idle', message: 'Se requiere resolución de conflictos.' });
    } else {
      try {
        setStatus({ type: 'processing', message: 'Guardando licencias en la base de datos...' });
        const operations = cleanedRows.map(row => ({
          type: 'insert',
          payload: row
        }));

        const stats = await executeMasivoLicencias(operations);
        
        showToast(
          'Carga Masiva Exitosa',
          `Carga finalizada con éxito. Nuevas: ${stats.inserted}, Sumadas: ${stats.updated}, Omitidas: ${stats.omitted}, Eliminadas: 0`,
          'success'
        );

        setStatus({ type: 'success', message: `✓ ${stats.inserted} licencias cargadas exitosamente.` });
        setTimeout(() => setIsMasivaModalOpen(false), 2000);
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', message: 'Error al guardar en base de datos.' });
      }
    }
  };

  const confirmConflictResolution = async () => {
    setIsSubmitting(true);
    try {
      setStatus({ type: 'processing', message: 'Guardando licencias en la base de datos...' });
      
      const operations = [];
      
      pendingImports.forEach(row => {
        const conf = conflicts.find(c => c.software === row.software);
        
        if (conf) {
          const resolution = resolvedConflicts[row.software] || 'sumar';
          if (resolution === 'sumar') {
            if (conf.existingId) {
              operations.push({
                type: 'update',
                id: conf.existingId,
                software: row.software,
                oldQty: conf.existingQty,
                newQty: conf.existingQty + row.cantidad_total
              });
            } else {
              operations.push({
                type: 'insert',
                payload: row
              });
            }
          } else {
            operations.push({
              type: 'omit',
              software: row.software
            });
          }
        } else {
          operations.push({
            type: 'insert',
            payload: row
          });
        }
      });
      
      const stats = await executeMasivoLicencias(operations);
      
      showToast(
        'Carga Masiva Finalizada',
        `Carga finalizada con éxito. Nuevas: ${stats.inserted}, Sumadas: ${stats.updated}, Omitidas: ${stats.omitted}, Eliminadas: 0`,
        'success'
      );
      
      setIsConflictModalOpen(false);
      setIsMasivaModalOpen(false);
      setConflicts([]);
      setResolvedConflicts({});
      setPendingImports([]);
      setStatus({ type: 'idle', message: '' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Error al procesar la carga masiva.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportData = (format) => {
    const columns = ['Software', 'Versión', 'Tipo', 'Fecha Inicio', 'Fecha Término', 'Factura', 'Orden Compra', 'Total Adquiridas', 'Asignadas', 'Disponibles', 'Usuarios Asignados', 'Descripción'];
    
    const rowFormatter = (row, cols) => {
      const asignadasInfo = asignaciones.filter(a => a.licencia_id === row.id);
      const nombresUsuarios = asignadasInfo.map(a => a.perfiles?.nombre || a.perfiles?.email).join(', ');
      const totalAsignadas = asignadasInfo.length;
      const disponibles = row.cantidad_total - totalAsignadas;

      return {
        'Software': row.software,
        'Versión': row.version || 'N/A',
        'Tipo': row.tipo || 'N/A',
        'Fecha Inicio': row.fecha_inicio || 'N/A',
        'Fecha Término': row.fecha_termino || 'N/A',
        'Factura': row.factura || 'N/A',
        'Orden Compra': row.orden_compra || 'N/A',
        'Total Adquiridas': row.cantidad_total,
        'Asignadas': totalAsignadas,
        'Disponibles': disponibles,
        'Usuarios Asignados': nombresUsuarios || 'Ninguno',
        'Descripción': row.descripcion || '—'
      };
    };

    exportToExcelAndPDF(
      format, 
      licencias, 
      columns, 
      'Inventario de Licencias de Software', 
      'licencias_export', 
      rowFormatter
    );
  };

  const getLogoUrl = (softwareName) => {
    if (!softwareName) return null;
    const name = softwareName.toLowerCase();
    
    let domain = '';
    if (name.includes('office') || name.includes('microsoft 365') || name.includes('m365') || name.includes('excel') || name.includes('word') || name.includes('powerpoint') || name.includes('teams') || name.includes('outlook')) {
      domain = 'office.com';
    } else if (name.includes('adobe') || name.includes('photoshop') || name.includes('illustrator') || name.includes('acrobat') || name.includes('pdf')) {
      domain = 'adobe.com';
    } else if (name.includes('google') || name.includes('workspace') || name.includes('drive')) {
      domain = 'google.com';
    } else if (name.includes('autodesk') || name.includes('autocad')) {
      domain = 'autodesk.com';
    } else if (name.includes('slack')) {
      domain = 'slack.com';
    } else if (name.includes('zoom')) {
      domain = 'zoom.us';
    } else if (name.includes('canvas') || name.includes('canva')) {
      domain = 'canva.com';
    } else if (name.includes('figma')) {
      domain = 'figma.com';
    } else {
      const firstWord = softwareName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      domain = `${firstWord}.com`;
    }
    
    return `https://logos.hunter.io/${domain}`;
  };

  const totalLicencias = licencias.reduce((sum, lic) => sum + (lic.cantidad_total || 0), 0);
  const totalAsignadas = asignaciones.length;
  const totalDisponibles = Math.max(0, totalLicencias - totalAsignadas);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Key size={24} className="text-[#006BB9]" /> Licencias de Software
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona el inventario de software y asigna licencias a los funcionarios.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => exportData('xlsx')} className="flex items-center gap-2 bg-green-200 text-green-800 px-3 py-2 rounded-lg hover:bg-green-300 font-medium transition-colors text-sm">
            <Download size={16} /> Excel
          </button>
          <button onClick={() => exportData('pdf')} className="flex items-center gap-2 bg-rose-200 text-rose-800 px-3 py-2 rounded-lg hover:bg-rose-300 font-medium transition-colors text-sm">
            <Printer size={16} /> PDF
          </button>
          <button
            onClick={() => { setStatus({type:'idle',message:''}); setIsMasivaModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-100 text-[#006BB9] px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium border border-blue-200"
          >
            <UploadCloud size={16} />
            Carga Masiva
          </button>
          <button
            onClick={() => handleOpenAssignModal()}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Users size={16} />
            Asignar
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#112A46] text-white px-4 py-2 rounded-lg hover:bg-[#1A3A5F] transition-colors text-sm font-medium shadow-sm"
          >
            <PlusCircle size={16} />
            Nuevo
          </button>
        </div>
      </div>

      {/* Global KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print-interactive">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4" style={{borderColor: 'var(--slep-primary)'}}>
          <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total de Licencias</div>
          <div className="text-4xl font-bold mt-2 text-[#25306B]">{totalLicencias}</div>
          <div className="text-xs text-gray-500 mt-1">Licencias totales adquiridas</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4" style={{borderColor: 'var(--slep-secondary)'}}>
          <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Licencias Asignadas</div>
          <div className="text-4xl font-bold mt-2 text-[#006BB9]">{totalAsignadas}</div>
          <div className="text-xs text-gray-500 mt-1">{totalLicencias ? ((totalAsignadas/totalLicencias)*100).toFixed(1) : 0}% del total</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4" style={{borderColor: 'var(--slep-green)'}}>
          <div className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Licencias Disponibles</div>
          <div className="text-4xl font-bold mt-2 text-[#90d039]">{totalDisponibles}</div>
          <div className="text-xs text-gray-500 mt-1">{totalLicencias ? ((totalDisponibles/totalLicencias)*100).toFixed(1) : 0}% del total</div>
        </div>
      </section>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto table-scroll border border-gray-200">
        <table className="min-w-full text-sm text-left whitespace-nowrap">
          <thead className="uppercase text-xs border-b border-gray-200 bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-3 w-16">Logo</th>
              <th className="px-3 py-3">Software</th>
              <th className="px-3 py-3">Respaldo</th>
              <th className="px-3 py-3 text-center">Disponibles</th>
              <th className="px-3 py-3 text-center">Asignadas</th>
              <th className="px-3 py-3 text-center">Estado</th>
              <th className="px-3 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Cargando licencias...</td></tr>
            ) : licencias.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No hay licencias de software registradas.</td></tr>
            ) : (
              licencias.map((lic) => {
                const asignadas = getAsignacionesCount(lic.id);
                const disponibles = lic.cantidad_total - asignadas;
                const hasStock = disponibles > 0;
                
                return (
                  <tr key={lic.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="w-11 h-11 rounded shadow-sm border border-gray-100 overflow-hidden bg-white flex items-center justify-center relative group">
                        <img 
                          src={getLogoUrl(lic.software)} 
                          alt={lic.software}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lic.software)}&background=random&color=fff&rounded=true&bold=true`;
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-[#112A46] text-[15px]">{lic.software} <span className="text-xs font-medium text-gray-500 ml-1">{lic.version}</span></div>
                      <div className="text-[11px] mt-1 flex gap-2 items-center">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-semibold">{lic.tipo || 'SAAS'}</span>
                        <span className="text-gray-400">|</span>
                        {lic.fecha_termino ? (
                          <span className="text-gray-500">Expira: {formatLocalDate(lic.fecha_termino)}</span>
                        ) : (
                          <span className="text-gray-400 italic">Sin caducidad</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          {lic.factura ? (
                            <button 
                              onClick={() => lic.has_factura_file ? handlePreview(lic.id, 'factura') : null}
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${lic.has_factura_file ? 'bg-blue-50 text-[#006BB9] border-blue-200 hover:bg-blue-100 cursor-pointer' : 'bg-gray-50 text-gray-500 border-gray-200 cursor-default'}`}
                              title={lic.has_factura_file ? `Ver Factura ${lic.factura}` : `Factura: ${lic.factura} (Sin archivo)`}
                            >
                              <FileText size={12}/> FACTURA N° {lic.factura}
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase" title="Falta Factura">
                              <AlertCircle size={10} /> Sin Factura
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {lic.orden_compra ? (
                            <button 
                              onClick={() => lic.has_oc_file ? handlePreview(lic.id, 'orden_compra') : null}
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${lic.has_oc_file ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer' : 'bg-gray-50 text-gray-500 border-gray-200 cursor-default'}`}
                              title={lic.has_oc_file ? `Ver OC ${lic.orden_compra}` : `OC: ${lic.orden_compra} (Sin archivo)`}
                            >
                              <FileText size={12}/> OC N° {lic.orden_compra}
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase" title="Falta Orden de Compra">
                              <AlertCircle size={10} /> Sin OC
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="font-black text-gray-800 text-lg">{disponibles} <span className="text-xs font-medium text-gray-400">/ {lic.cantidad_total}</span></div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                       <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full font-bold text-xs">{asignadas}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase border w-full ${hasStock ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {hasStock ? 'SUFICIENTE' : 'AGOTADO'}
                        </span>
                        {(() => {
                          if (!lic.fecha_termino) return null;
                          const parts = lic.fecha_termino.split('T')[0].split('-');
                          if (parts.length !== 3) return null;
                          const [year, month, day] = parts;
                          const expirationDate = new Date(year, month - 1, day, 23, 59, 59);
                          const diffTime = expirationDate - new Date();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays > 0) {
                            return <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase border w-full ${diffDays <= 30 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>Quedan {diffDays} días</span>;
                          } else if (diffDays === 0) {
                            return <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase border bg-rose-50 text-rose-700 border-rose-200 w-full">Vence Hoy</span>;
                          } else {
                            return <span className="px-2 py-0.5 rounded text-[9px] font-semibold uppercase border bg-red-100 text-red-800 border-red-300 w-full">Vencida hace {Math.abs(diffDays)} días</span>;
                          }
                        })()}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button onClick={() => handleOpenAssignModal(lic.id)} className="text-emerald-600 hover:text-emerald-800 mr-3 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors border border-emerald-100" title="Asignar a Funcionario">
                        <UserPlus size={16} />
                      </button>
                      <button onClick={() => handleOpenViewModal(lic)} className="text-[#006BB9] hover:text-[#25306B] mr-3 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors border border-blue-100" title="Ver Asignaciones">
                        <Users size={16} />
                      </button>
                      <button onClick={() => handleOpenModal(lic)} className="text-amber-600 hover:text-amber-800 mr-3 bg-amber-50 hover:bg-amber-100 p-1.5 rounded-lg transition-colors border border-amber-100" title="Editar Licencia">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => openDeleteModal(lic)} className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors border border-red-100" title="Eliminar Licencia">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl animate-fade-in max-h-[95vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-bold mb-5 text-[#25306B]">
              {formData.id ? 'Editar Software' : 'Nuevo Software'}
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Software</label>
                  <input 
                    required
                    type="text" 
                    value={formData.software} 
                    onChange={e => setFormData({...formData, software: e.target.value})} 
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                    placeholder="Ej: Microsoft Office"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Licencia</label>
                  <select 
                    value={formData.tipo} 
                    onChange={handleTipoChange} 
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                  >
                    {TIPOS_LICENCIA.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Versión</label>
                  <input 
                    type="text" 
                    value={formData.version} 
                    onChange={e => setFormData({...formData, version: e.target.value})} 
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                    placeholder="Ej: 365, 2024"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cantidad Total Adquirida</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={formData.cantidad_total} 
                    onChange={e => setFormData({...formData, cantidad_total: parseInt(e.target.value)})} 
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                  />
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Inicio</label>
                  <input 
                    required
                    type="date" 
                    value={formData.fecha_inicio} 
                    onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} 
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de Término</label>
                  <input 
                    required
                    type="date" 
                    value={formData.fecha_termino} 
                    onChange={e => setFormData({...formData, fecha_termino: e.target.value})} 
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                  />
                </div>
              </div>

              {/* Documentos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Factura */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Respaldo Factura</label>
                  <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                    Nombra el archivo así:
                    <span className="block mt-1 font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold border border-blue-100 w-fit">Factura n° ??? - Producto.pdf</span>
                  </p>
                  
                  {formData.has_factura_file && !facturaFile ? (
                    <div className="flex flex-col gap-2 mb-3 mt-auto">
                      <div className="flex items-center gap-2 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                        <CheckCircle className="text-emerald-500 w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium text-emerald-800 truncate">Factura Subida</span>
                      </div>
                      <button type="button" onClick={() => setFormData({...formData, has_factura_file: false, factura: ''})} className="text-xs text-red-600 font-bold hover:underline self-end">Quitar / Reemplazar</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors mb-3 mt-auto">
                      <Upload className="w-6 h-6 text-[#006BB9] mb-2" />
                      <span className="text-xs text-gray-600 text-center font-medium px-2 truncate w-full">
                        {facturaFile ? facturaFile.name : 'Haz clic o arrastra el archivo'}
                      </span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFacturaFile(file);
                            const match = file.name.match(/factura\s*n[°º]?\s*(\d+)/i);
                            if (match) {
                               setFormData(prev => ({...prev, factura: match[1]}));
                            } else {
                               setFormData(prev => ({...prev, factura: file.name.split('.').slice(0, -1).join('.')}));
                            }
                          }
                        }} 
                      />
                    </label>
                  )}
                  
                  <div className="mt-auto">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wide">N° Extraído Automáticamente:</label>
                    <input 
                      type="text" 
                      value={formData.factura} 
                      onChange={e => setFormData({...formData, factura: e.target.value})} 
                      className="w-full rounded bg-white border-gray-300 shadow-sm border p-2 text-sm text-gray-800 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                      placeholder="N° Factura..."
                    />
                  </div>
                </div>

                {/* Orden de Compra */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Respaldo Orden de Compra</label>
                  <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                    Nombra el archivo así:
                    <span className="block mt-1 font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold border border-blue-100 w-fit">1456839-??-??26 - Producto.pdf</span>
                  </p>
                  
                  {formData.has_oc_file && !ocFile ? (
                    <div className="flex flex-col gap-2 mb-3 mt-auto">
                      <div className="flex items-center gap-2 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                        <CheckCircle className="text-emerald-500 w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium text-emerald-800 truncate">OC Subida</span>
                      </div>
                      <button type="button" onClick={() => setFormData({...formData, has_oc_file: false, orden_compra: ''})} className="text-xs text-red-600 font-bold hover:underline self-end">Quitar / Reemplazar</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors mb-3 mt-auto">
                      <Upload className="w-6 h-6 text-[#006BB9] mb-2" />
                      <span className="text-xs text-gray-600 text-center font-medium px-2 truncate w-full">
                        {ocFile ? ocFile.name : 'Haz clic o arrastra el archivo'}
                      </span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setOcFile(file);
                            const match = file.name.match(/(\d+-\d+-[a-zA-Z0-9]+)/i);
                            if (match) {
                               setFormData(prev => ({...prev, orden_compra: match[1].toUpperCase()}));
                            } else {
                               setFormData(prev => ({...prev, orden_compra: file.name.split('.').slice(0, -1).join('.')}));
                            }
                          }
                        }} 
                      />
                    </label>
                  )}
                  
                  <div className="mt-auto">
                    <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wide">N° Extraído Automáticamente:</label>
                    <input 
                      type="text" 
                      value={formData.orden_compra} 
                      onChange={e => setFormData({...formData, orden_compra: e.target.value})} 
                      className="w-full rounded bg-white border-gray-300 shadow-sm border p-2 text-sm text-gray-800 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                      placeholder="N° Orden Compra..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea 
                  value={formData.descripcion} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                  className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                  placeholder="Observaciones o notas"
                  rows="2"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#006BB9] text-white rounded-lg hover:bg-[#1A3A5F] flex items-center gap-2">
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  Guardar Licencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Asignar Licencia */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl animate-fade-in flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4 text-[#25306B] border-b pb-2 flex items-center gap-2">
              <Users className="text-[#006BB9]" /> Asignar Licencia a Funcionarios
            </h2>
            <form onSubmit={handleAssign} className="space-y-4 flex-1 flex flex-col min-h-0">
              
              {/* Software Select (Full Width) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Software a Asignar *</label>
                <select 
                  required
                  value={assignData.licencia_id} 
                  onChange={e => {
                    setAssignData({...assignData, licencia_id: e.target.value});
                    setSelectedUsuarios([]);
                  }} 
                  className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9] bg-white text-sm" 
                >
                  <option value="">-- Seleccionar Software --</option>
                  {licencias.map(lic => {
                    const disponibles = lic.cantidad_total - getAsignacionesCount(lic.id);
                    return (
                      <option key={lic.id} value={lic.id} disabled={disponibles <= 0}>
                        {lic.software} {lic.version} ({disponibles} cupos disponibles)
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Split Content: Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 overflow-hidden">
                
                {/* Column 1: Available & Search */}
                <div className="flex flex-col min-h-0 space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Buscar Funcionarios</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o correo..."
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        setFocusedUserIndex(-1);
                      }}
                      onKeyDown={handleUserKeyDown}
                      className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 pl-9 text-sm focus:border-[#006BB9] focus:ring-[#006BB9]"
                    />
                  </div>

                  {/* Available List Box */}
                  <div className="border border-gray-200 rounded-lg overflow-y-auto flex-1 h-[250px] divide-y divide-gray-100 bg-white">
                    {filteredAvailableUsuarios.map((u, idx) => {
                      const isFocused = idx === focusedUserIndex;
                      return (
                        <div 
                          key={u.id} 
                          onClick={() => handleAddUser(u)}
                          className={`p-2.5 transition-colors cursor-pointer flex items-center justify-between ${
                            isFocused ? 'bg-blue-50 border-l-4 border-blue-500 font-medium' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="font-semibold text-gray-800 text-xs truncate">{u.nombre || 'Sin nombre'}</div>
                            <div className="text-[10px] text-gray-500 truncate">{u.email}</div>
                          </div>
                          <div className="text-blue-600 bg-blue-50 p-1 rounded hover:bg-blue-100 shrink-0">
                            <Plus size={14} />
                          </div>
                        </div>
                      )
                    })}
                    {filteredAvailableUsuarios.length === 0 && (
                      <div className="p-8 text-center text-xs text-gray-400 italic">
                        {userSearchTerm ? 'No se encontraron funcionarios.' : 'Escribe arriba para buscar funcionarios.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Selected List (Grid of 2 items per line) */}
                <div className="flex flex-col min-h-0 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Lista por Asignar ({selectedUsuarios.length})</label>
                    {selectedUsuarios.length > 0 && (
                      <button type="button" onClick={() => setSelectedUsuarios([])} className="text-[10px] text-red-500 hover:underline">Limpiar todos</button>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-y-auto flex-1 h-[250px] bg-slate-50/50 p-2">
                    <div className="grid grid-cols-2 gap-2">
                      {selectedUsuarios.map(u => (
                        <div 
                          key={u.id} 
                          className="bg-white border border-blue-100 rounded-lg p-2 flex items-center justify-between shadow-sm"
                        >
                          <div className="min-w-0 flex-1 pr-1.5">
                            <div className="font-bold text-blue-900 text-[11px] leading-tight truncate" title={u.nombre}>{u.nombre || 'Sin nombre'}</div>
                            <div className="text-[9px] text-blue-600 truncate" title={u.email}>{u.email}</div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveUser(u)}
                            className="text-gray-400 hover:text-red-500 p-0.5 hover:bg-red-50 rounded shrink-0 transition-colors"
                            title="Quitar"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {selectedUsuarios.length === 0 && (
                      <div className="p-8 text-center text-xs text-gray-400 italic flex items-center justify-center h-full min-h-[150px]">
                        Haz clic en un funcionario de la izquierda para agregarlo.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t mt-4 shrink-0">
                <button type="button" disabled={isSubmitting} onClick={() => setIsAssignModalOpen(false)} className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm">Cancelar</button>
                <button type="submit" disabled={isSubmitting || selectedUsuarios.length === 0} className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                  Confirmar Asignación ({selectedUsuarios.length})
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal para Ver Asignaciones */}
      {isViewModalOpen && viewLicencia && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-fade-in">
            <h2 className="text-xl font-bold mb-1 text-[#25306B] flex items-center gap-2">
              <img src={getLogoUrl(viewLicencia.software)} className="w-6 h-6 object-contain" alt="" onError={e => e.target.style.display='none'} />
              Asignaciones: {viewLicencia.software}
            </h2>
            <p className="text-sm text-gray-500 mb-4 border-b pb-4">
              {asignacionesDeLicencia.length} de {viewLicencia.cantidad_total} licencias en uso
            </p>
            
            <div className="overflow-y-auto flex-1 pr-2">
              {asignacionesDeLicencia.length === 0 ? (
                <div className="text-center text-gray-500 py-4 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">Nadie tiene asignada esta licencia aún.</div>
              ) : (
                <div className="space-y-3">
                  {asignacionesDeLicencia.map(a => (
                    <div key={a.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div>
                        <div className="font-bold text-sm text-gray-800">{a.perfiles?.nombre || a.perfiles?.email}</div>
                        <div className="text-[11px] text-gray-500 font-medium">Asignado el: {new Date(a.fecha_asignacion).toLocaleDateString()}</div>
                      </div>
                      <button 
                        onClick={() => handleRevocar(a)}
                        className="text-[11px] font-bold bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-3 py-1.5 rounded transition-colors shadow-sm"
                      >
                        Revocar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4 mt-4 border-t">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Borrado Seguro */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in border border-gray-200">
            <div className="bg-red-600 p-6 flex flex-col items-center justify-center text-white text-center">
              <AlertTriangle className="w-12 h-12 mb-3 text-red-100" strokeWidth={1.5} />
              <h2 className="text-xl font-bold">¡Advertencia de Borrado!</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 text-center mb-4 leading-relaxed">
                Estás a punto de eliminar el software <strong>{deleteTarget.software}</strong> de forma permanente.
                Esta acción revocará <strong>{getAsignacionesCount(deleteTarget.id)}</strong> asignaciones activas de los usuarios.
              </p>

              <form onSubmit={handleConfirmDelete} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Ingresa tu contraseña de administrador para continuar:
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Contraseña"
                    required
                  />
                  {deleteError && <p className="text-red-600 text-[11px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={12}/> {deleteError}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setAdminPassword('');
                      setDeleteError('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || !adminPassword}
                    className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Carga Masiva */}
      {isMasivaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in relative max-h-[90vh] flex flex-col">
            <button onClick={() => setIsMasivaModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors">&times;</button>
            <h2 className="text-xl font-bold mb-2 text-[#25306B] flex items-center gap-2">
              <UploadCloud className="text-[#006BB9]" /> Carga Masiva de Licencias
            </h2>
            
            <div className="overflow-y-auto flex-1 pr-2 mt-2 custom-scrollbar">
              <p className="text-[13px] text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                Sube un archivo Excel (<strong>.xlsx, .xls</strong>) o <strong>.csv</strong> con el inventario de licencias. Las columnas reconocidas automáticamente son: <br/>
                <span className="font-mono text-blue-800 text-xs font-bold leading-relaxed">Nombre, Versión, Tipo, Total Licencias, Fecha de Inicio, Fecha de Término, Factura, Orden de Compra, Descripción</span>
              </p>

              <div className="mb-5">
                <h3 className="text-sm font-bold text-gray-800 mb-2 border-b pb-1">Tipos de Licencia Soportados</h3>
                <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded mb-3 font-medium">
                  <strong>IMPORTANTE:</strong> Si el software es de tipo SAAS, PAAS o IAAS, recuerda escribir <strong>"Suscripción Anual"</strong> (o "Suscripción Mensual") en la columna <span className="font-mono">Versión</span> para mantener el orden.
                </div>
                <ul className="text-[12px] space-y-2 text-gray-600">
                  <li className="flex gap-2"><span className="font-bold text-gray-800 shrink-0 w-20">SAAS:</span> <span>Software as a Service (Ej. Microsoft 365, Google Workspace).</span></li>
                  <li className="flex gap-2"><span className="font-bold text-gray-800 shrink-0 w-20">Perpetua:</span> <span>Compra de pago único sin fecha de caducidad (Ej. Office 2019).</span></li>
                  <li className="flex gap-2"><span className="font-bold text-gray-800 shrink-0 w-20">SW Propietario:</span> <span>Software de código cerrado tradicional que requiere licencia comercial.</span></li>
                  <li className="flex gap-2"><span className="font-bold text-gray-800 shrink-0 w-20">SW Libre:</span> <span>Software gratuito o de código abierto (Ej. Ubuntu, OBS Studio, VLC).</span></li>
                  <li className="flex gap-2"><span className="font-bold text-gray-800 shrink-0 w-20">Freemium:</span> <span>Funciones básicas gratuitas, con pago por características avanzadas (Ej. Slack).</span></li>
                  <li className="flex gap-2"><span className="font-bold text-gray-800 shrink-0 w-20">PAAS / IAAS:</span> <span>Plataforma o Infraestructura como servicio (AWS, Azure, Heroku).</span></li>
                </ul>
              </div>
              
              <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-colors relative group mt-2">
                <label className="cursor-pointer flex flex-col items-center justify-center">
                  <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <UploadCloud size={28} />
                  </div>
                  <span className="font-bold text-[#006BB9] text-base group-hover:underline">Haz clic para buscar el archivo</span>
                  <span className="text-xs text-gray-500 mt-2">o arrastra el archivo aquí</span>
                  <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} ref={fileInputRef} />
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

              {validationErrors.length > 0 && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-xs text-left">
                  <strong className="block mb-1 font-bold">Errores de formato en el archivo:</strong>
                  <ul className="list-disc pl-4 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resolución de Conflictos */}
      {isConflictModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-amber-500 p-5 flex flex-col items-center justify-center text-white text-center shrink-0">
              <AlertTriangle className="w-12 h-12 mb-2 text-amber-100" />
              <h2 className="text-xl font-bold">Confirmación y Resolución de Conflictos</h2>
              <p className="text-xs text-amber-50 mt-1">
                Se detectaron licencias existentes en el sistema o con Orden de Compra duplicada.
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar bg-slate-50">
              {conflicts.map((conf, index) => {
                const totalFuturo = conf.existingQty + conf.uploadedQty;
                return (
                  <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-800 text-base leading-tight truncate">{conf.software}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Versión sugerida: {conf.version || 'Sin especificar'}</p>
                        
                        {conf.duplicateOc && (
                          <div className="text-red-700 bg-red-50 border border-red-100 rounded-lg p-2 mt-2 text-xs font-semibold flex items-start gap-1.5 leading-tight">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <span>OC Duplicada: La Orden de Compra <strong>"{conf.duplicateOc.code}"</strong> ya está registrada en el sistema bajo el software <strong>"{conf.duplicateOc.software}"</strong>. Por favor verifica si el dato es correcto.</span>
                          </div>
                        )}
                        
                        {conf.existingId && (
                          <div className="text-[12px] font-medium text-slate-700 mt-2">
                            {conf.isSameQty ? (
                              <p className="text-amber-800 bg-amber-50 border border-amber-100 p-2 rounded-lg flex items-center gap-1.5 font-bold">
                                ⚠️ Ya se ingresó la misma cantidad ({conf.existingQty}) de este software anteriormente.
                              </p>
                            ) : (
                              <p className="text-blue-800 bg-blue-50 border border-blue-100 p-2 rounded-lg flex items-center gap-1.5">
                                ℹ️ La cantidad es diferente. El total pasará de <strong className="text-blue-900">{conf.existingQty}</strong> a <strong className="text-blue-900">{totalFuturo}</strong> licencias.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex bg-slate-100 rounded-lg border border-slate-200 p-1 shrink-0 shadow-sm self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setResolvedConflicts(prev => ({ ...prev, [conf.software]: 'sumar' }))}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            (resolvedConflicts[conf.software] || 'sumar') === 'sumar'
                              ? 'bg-[#006BB9] text-white shadow'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Sumar (+{conf.uploadedQty})
                        </button>
                        <button
                          type="button"
                          onClick={() => setResolvedConflicts(prev => ({ ...prev, [conf.software]: 'omit' }))}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            resolvedConflicts[conf.software] === 'omit'
                              ? 'bg-red-600 text-white shadow'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Omitir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-white px-6 py-4 flex justify-end gap-3 border-t shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsConflictModalOpen(false);
                  setConflicts([]);
                  setResolvedConflicts({});
                  setPendingImports([]);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors cursor-pointer"
              >
                Cancelar Carga
              </button>
              <button
                type="button"
                onClick={confirmConflictResolution}
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#006BB9] text-white rounded-lg hover:bg-blue-700 text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Confirmar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
