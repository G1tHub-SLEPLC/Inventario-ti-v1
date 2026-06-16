import { useState, useMemo } from 'react';
import { useInventario } from '../context/InventarioContext';
import { useSolicitudes } from '../context/SolicitudesContext';
import { useAuth } from '../context/AuthContext';
import { useLicencias } from '../context/LicenciasContext';
import { Monitor, Package, Calendar, Key, AlertTriangle, Download } from 'lucide-react';
import CustomTimePicker from '../components/CustomTimePicker';
import { supabase } from '../lib/supabaseClient';
import { generateActaDocx } from '../utils/docxUtils';

export default function SlepDashboardPage() {
  const { session, perfil } = useAuth();
  const { equipos, showToast } = useInventario();
  const { insumos, solicitarInsumo, solicitarPrestamo, solicitudes } = useSolicitudes();
  const { asignaciones } = useLicencias();
  const [activeTab, setActiveTab] = useState('equipos'); // 'equipos', 'insumos', 'prestamos', 'licencias'

  // Forms state
  const [selectedInsumo, setSelectedInsumo] = useState('');
  const [cantidadInsumo, setCantidadInsumo] = useState(1);
  const [isSolicitarModalOpen, setIsSolicitarModalOpen] = useState(false);
  const [isPrestamoModalOpen, setIsPrestamoModalOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [motivo, setMotivo] = useState('');
  const [pendingWarningInfo, setPendingWarningInfo] = useState(null); // { applicantName, equipoId }

  const formatEmailName = (email) => {
    if (!email) return '';
    return email.split('@')[0]
      .split(/[\.\-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatFechaDev = (fechaStr) => {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return fechaStr;
  };

  // Filtrar equipos
  const handleGenerateActa = async (activeLoan, eq) => {
    try {
      const adminMatch = activeLoan?.observaciones_admin ? activeLoan.observaciones_admin.match(/\[Aprobado por:\s*(.*?)\]/) : null;
      const approvedByName = adminMatch ? adminMatch[1].trim() : null;

      // Intentar obtener el admin_ti que aprobó o uno válido
      const { data: admins } = await supabase.from('perfiles').select('*').eq('rol', 'admin_ti');
      let admin = null;
      if (approvedByName && admins) {
        admin = admins.find(a => a.nombre === approvedByName || a.email === approvedByName);
      }
      if (!admin && admins) {
         admin = admins.find(a => a.rut) || admins[0];
      }

      const adminName = admin?.nombre || approvedByName || 'Administrador TI';
      const adminRut = admin?.rut || '—';
      const adminSub = admin?.subdireccion || 'Tecnologías de la Información';

      const userName = activeLoan?.perfil?.nombre || eq.perfiles?.nombre || perfil?.nombre || session?.user?.user_metadata?.nombre || 'Usuario';
      const userRut = activeLoan?.perfil?.rut || eq.perfiles?.rut || perfil?.rut || session?.user?.user_metadata?.rut || '—';
      const userSub = activeLoan?.perfil?.subdireccion || eq.perfiles?.subdireccion || perfil?.subdireccion || session?.user?.user_metadata?.subdireccion || '—';

      const data = {
        ti_nombre: adminName,
        ti_rut: adminRut,
        ti_subdireccion: adminSub,
        solicitante_nombre: userName,
        solicitante_rut: userRut,
        solicitante_subdireccion: userSub,
        fecha_inicio: activeLoan?.fecha_inicio || '',
        fecha_fin: activeLoan?.fecha_fin || '',
        hora_inicio: activeLoan?.hora_inicio || '',
        hora_fin: activeLoan?.hora_fin || '',
        fecha_entrega: new Date().toLocaleDateString(),
        equipos: [
          {
            tipo: eq['Descripción del Bien'] || 'Equipo',
            marca_modelo: `${eq.Marca || ''} ${eq.Modelo || ''}`.trim(),
            serie: eq['Nº de serie'] || '—',
            codigo_interno: eq.id || eq['ID Publicación'] || '',
            estado: eq.estado || '—'
          }
        ]
      };

      const templateName = activeLoan ? 'acta_prestamo.docx' : 'acta_asigna.docx';
      const result = await generateActaDocx(data, templateName);
      if (!result.success) {
         showToast('Error', result.error || 'No se pudo generar el acta', 'error');
      }
    } catch(err) {
       console.error(err);
       showToast('Error', 'Hubo un error al crear el acta.', 'error');
    }
  };

  const misEquipos = useMemo(() => {
    const userName = perfil?.nombre || formatEmailName(session?.user?.email);

    const normalize = (str) => {
      if (!str) return '';
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    };

    const isNameMatch = (name1, name2) => {
      if (!name1 || !name2) return false;
      const n1 = normalize(name1);
      const n2 = normalize(name2);
      if (n1 === n2) return true;

      const w1 = n1.split(/\s+/).filter(w => w.length > 2);
      const w2 = n2.split(/\s+/).filter(w => w.length > 2);
      if (w1.length === 0 || w2.length === 0) return false;

      const [shorter, longer] = w1.length < w2.length ? [w1, w2] : [w2, w1];
      // Require at least 2 words to match (like first name and last name) to avoid generic single-word false positives,
      // unless the shorter name only has 1 valid word.
      const matchCount = shorter.filter(word => longer.includes(word)).length;
      return matchCount === shorter.length;
    };

    return equipos.filter(eq => {
      const matchId = eq.usuario_asignado_id === session?.user?.id;
      const matchName = eq['Usuario'] && isNameMatch(userName, eq['Usuario']);
      return matchId || matchName;
    });
  }, [equipos, session, perfil]);

  const equiposDisponiblesParaPrestamo = useMemo(() => {
    return equipos.filter(eq => eq.estado === 'PARA PRESTAMO' || eq.estado === 'EN PRESTAMO' || eq.estado === 'ESPERANDO RESPUESTA');
  }, [equipos]);

  const misLicencias = useMemo(() => {
    return asignaciones.filter(a => a.usuario_id === session?.user?.id);
  }, [asignaciones, session]);

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

  const handleSolicitarInsumoClick = (insumoId) => {
    // Buscar entregas previas de este insumo para este usuario
    // (Relajamos los filtros: convertimos a String para evitar problemas de tipos int vs uuid, 
    // y quitamos la validación de usuario_id porque el SolicitudesContext ya filtra por el usuario actual)
    const entregasPrevias = solicitudes
      .filter(s => s.tipo === 'insumo' && String(s.insumo_id) === String(insumoId) && s.estado === 'aprobado')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (entregasPrevias.length > 0) {
      const ultima = entregasPrevias[0];
      const fecha = new Date(ultima.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });

      // Mostrar el toast
      showToast('Atención', `Ya se te asignó este insumo anteriormente (${fecha}). Revisa bien tu solicitud.`, 'warning', null, 10000);
    }

    setSelectedInsumo(insumoId);
    setCantidadInsumo(1);
    setIsSolicitarModalOpen(true);
  };

  const handleSolicitarInsumo = async (e) => {
    e.preventDefault();
    if (!selectedInsumo || cantidadInsumo < 1) return;
    try {
      await solicitarInsumo(selectedInsumo, cantidadInsumo);
      setSelectedInsumo('');
      setCantidadInsumo(1);
      setIsSolicitarModalOpen(false);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleSolicitarPrestamo = async (e) => {
    e.preventDefault();
    if (!selectedEquipo || !fechaInicio || !fechaFin || !horaInicio || !horaFin || !motivo) return;

    const startDateTime = new Date(`${fechaInicio}T${horaInicio}`);
    const endDateTime = new Date(`${fechaFin}T${horaFin}`);

    if (endDateTime <= startDateTime) {
      showToast('Error de Fechas', 'La fecha y hora de devolución deben ser posteriores al inicio del préstamo.', 'error');
      return;
    }

    // Validación de horario de devolución
    const returnDay = endDateTime.getDay(); // 0 = Domingo, 1 = Lunes, ..., 5 = Viernes, 6 = Sábado
    const returnTimeNum = endDateTime.getHours() * 100 + endDateTime.getMinutes();

    if (returnDay >= 1 && returnDay <= 4) { // Lunes a Jueves
      if (returnTimeNum > 1645) {
        showToast('Horario excedido', 'De lunes a jueves, los equipos deben devolverse a las 16:45 hrs como máximo. De lo contrario, programa la devolución para el día hábil siguiente a primera hora.', 'error', null, 8000);
        return;
      }
    } else if (returnDay === 5) { // Viernes
      if (returnTimeNum > 1545) {
        showToast('Horario excedido', 'Los viernes, los equipos deben devolverse a las 15:45 hrs como máximo. De lo contrario, programa la devolución para el día hábil siguiente a primera hora.', 'error', null, 8000);
        return;
      }
    }

    try {
      await solicitarPrestamo(selectedEquipo, fechaInicio, fechaFin, horaInicio, horaFin, motivo);
      setSelectedEquipo('');
      setFechaInicio('');
      setHoraInicio('');
      setFechaFin('');
      setHoraFin('');
      setMotivo('');
      setIsPrestamoModalOpen(false);
    } catch (error) {
      console.error('Error in handleSolicitarPrestamo:', error);
      showToast('Error', 'No se pudo procesar la solicitud de préstamo. Verifique que los datos sean correctos o contacte a soporte.', 'error');
    }
  };

  const openPrestamoModal = (equipoId) => {
    const targetEquipo = equipos.find(e => e.id === equipoId || String(e.id) === String(equipoId));

    // Check if there is a pending request for this equipment
    const pendingRequest = targetEquipo ? solicitudes.find(sol => {
      if (sol.tipo !== 'prestamo' || sol.estado !== 'pendiente') return false;

      const matchId = sol.equipo_id === equipoId || String(sol.equipo_id) === String(equipoId);
      const matchSerial1 = targetEquipo['Nº de serie'] && (sol.equipo_id === targetEquipo['Nº de serie'] || String(sol.equipo_id) === String(targetEquipo['Nº de serie']));
      const matchSerial2 = targetEquipo['N° de serie'] && (sol.equipo_id === targetEquipo['N° de serie'] || String(sol.equipo_id) === String(targetEquipo['N° de serie']));

      return matchId || matchSerial1 || matchSerial2;
    }) : null;

    if (pendingRequest) {
      const applicantName = pendingRequest.perfil?.nombre || formatEmailName(pendingRequest.perfil?.correo) || 'otro funcionario';
      setPendingWarningInfo({
        applicantName,
        equipoId
      });
    } else {
      setSelectedEquipo(equipoId);
      setFechaInicio('');
      setHoraInicio('');
      setFechaFin('');
      setHoraFin('');
      setMotivo('');
      setIsPrestamoModalOpen(true);
    }
  };



  const handleCancelWarning = () => {
    setPendingWarningInfo(null);
  };

  return (
    <div className="p-6 max-w-[1920px] mx-auto">

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('equipos')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'equipos' ? 'border-[#006BB9] text-[#006BB9]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Monitor size={16} /> Mis Equipos
        </button>
        <button
          onClick={() => setActiveTab('insumos')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'insumos' ? 'border-[#006BB9] text-[#006BB9]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Package size={16} /> Solicitar Insumos
        </button>
        <button
          onClick={() => setActiveTab('prestamos')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'prestamos' ? 'border-[#006BB9] text-[#006BB9]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Calendar size={16} /> Solicitar Préstamo
        </button>
        <button
          onClick={() => setActiveTab('licencias')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'licencias' ? 'border-[#006BB9] text-[#006BB9]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Key size={16} /> Mis Licencias
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">

        {/* TAB: MIS EQUIPOS */}
        {activeTab === 'equipos' && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Equipos Asignados</h2>
            {misEquipos.length === 0 ? (
              <p className="text-gray-500">No tienes equipos asignados actualmente.</p>
            ) : (
              <div className="table-scroll rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600 uppercase">
                      <th className="px-4 py-3 font-semibold w-16">Imagen</th>
                      <th className="px-4 py-3 font-semibold">Descripción del Bien</th>
                      <th className="px-4 py-3 font-semibold">Marca</th>
                      <th className="px-4 py-3 font-semibold">Modelo</th>
                      <th className="px-4 py-3 font-semibold">Nº de serie</th>
                      <th className="px-4 py-3 font-semibold">SubDirección</th>
                      <th className="px-4 py-3 font-semibold text-center w-24">Estado</th>
                      <th className="px-4 py-3 font-semibold text-center w-24">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                    {misEquipos.map((eq, i) => {
                      const isEnPrestamo = eq.estado === 'EN PRESTAMO' || eq.estado === 'EN PRÉSTAMO';
                      let myActiveLoan = null;
                      if (isEnPrestamo && solicitudes) {
                        myActiveLoan = solicitudes.find(s => (s.equipo_id === eq.id || String(s.equipo_id) === String(eq['Nº de serie'])) && s.estado === 'aprobado' && s.tipo === 'prestamo');
                      }
                      
                      return (
                      <tr key={eq.id || i} className="hover:bg-blue-50 even:bg-slate-50 transition-colors">
                        <td className="px-4 py-2">
                          <div className="w-[48px] h-[48px] rounded-[6px] bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                            {eq.imagen_url ? (
                              <img src={eq.imagen_url} alt={eq['Descripción del Bien'] || 'Equipo'} style={{ objectFit: 'contain' }} className="w-full h-full" />
                            ) : (
                              <span className="text-[8px] text-gray-400 font-bold uppercase text-center leading-tight">Sin<br />Img</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{eq['Descripción del Bien'] || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{eq.Marca || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{eq.Modelo || '—'}</td>
                        <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap">{eq['Nº de serie'] || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{eq['SubDirección'] || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {eq.estado === 'EN PRESTAMO' || eq.estado === 'EN PRÉSTAMO' ? (
                            <span className="font-sans bg-amber-100 text-amber-700 border border-amber-300 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
                              EN PRESTAMO
                            </span>
                          ) : (
                            <span className="font-sans bg-lime-300 text-lime-800 border border-lime-400 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
                              ASIGNADO
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleGenerateActa(myActiveLoan, eq)}
                            className="flex items-center justify-center mx-auto gap-1 bg-indigo-100 text-indigo-700 border border-indigo-400 hover:bg-indigo-200 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
                            title="Descargar Acta"
                          >
                            <Download size={14} className="stroke-[2.5]" /> Acta
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
        )}

        {/* TAB: INSUMOS */}
        {activeTab === 'insumos' && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Catálogo de Insumos</h2>
            <div className="table-scroll rounded-lg border border-gray-200 overflow-x-auto">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600 uppercase">
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Marca</th>
                    <th className="px-4 py-3 font-semibold">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-center w-24">Estado</th>
                    <th className="px-4 py-3 font-semibold text-center w-24">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                  {insumos.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500 italic">No hay insumos en el catálogo.</td>
                    </tr>
                  ) : (
                    insumos.map((ins) => {
                      const disponible = ins.cantidad_disponible > 0;
                      return (
                        <tr key={ins.id} className="hover:bg-blue-50 even:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">{ins.tipo || '—'}</td>
                          <td className="px-4 py-3 font-medium whitespace-nowrap">{ins.nombre || '—'}</td>
                          <td className="px-4 py-3">{ins.marca || '—'}</td>
                          <td className="px-4 py-3">{ins.modelo || '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-sans px-2.5 py-1 rounded text-[11px] font-bold tracking-wide border uppercase whitespace-nowrap ${disponible ? 'bg-green-300 text-green-800 border-green-400' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              {disponible ? 'DISPONIBLE' : 'AGOTADO'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleSolicitarInsumoClick(ins.id)}
                              disabled={!disponible}
                              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm ${disponible ? 'bg-[#006BB9] text-white hover:bg-[#25306B]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                              Solicitar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PRESTAMOS */}
        {activeTab === 'prestamos' && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Equipos Disponibles para Préstamo</h2>
            <div className="table-scroll rounded-lg border border-gray-200 overflow-x-auto">
              <table className="min-w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600 uppercase">
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Marca</th>
                    <th className="px-4 py-3 font-semibold">Modelo</th>
                    <th className="px-4 py-3 font-semibold">Nº de Serie</th>
                    <th className="px-4 py-3 font-semibold">Entregado a</th>
                    <th className="px-4 py-3 font-semibold">Devolución</th>
                    <th className="px-4 py-3 font-semibold text-center w-24">Estado</th>
                    <th className="px-4 py-3 font-semibold text-center w-24">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                  {equiposDisponiblesParaPrestamo.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500 italic">No hay equipos disponibles para préstamo actualmente.</td>
                    </tr>
                  ) : (
                    equiposDisponiblesParaPrestamo.map((eq) => {
                      const activeLoan = solicitudes.find(sol =>
                        sol.tipo === 'prestamo' &&
                        sol.estado === 'aprobado' &&
                        (sol.equipo_id === eq.id || sol.equipo_id === eq['Nº de serie'] || String(sol.equipo_id) === String(eq.id))
                      );
                      const isEnPrestamo = eq.estado === 'EN PRESTAMO';
                      const isEsperandoRespuesta = eq.estado === 'ESPERANDO RESPUESTA';

                      return (
                        <tr key={eq.id} className="hover:bg-blue-50 even:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium">{eq['Descripción del Bien'] || '—'}</td>
                          <td className="px-4 py-3">{eq.Marca || '—'}</td>
                          <td className="px-4 py-3">{eq.Modelo || '—'}</td>
                          <td className="px-4 py-3 font-mono text-[12px]">{eq['Nº de serie'] || '—'}</td>

                          {/* Usuario entregado */}
                          <td className="px-4 py-3">
                            {isEnPrestamo ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">
                                  {activeLoan?.perfil?.nombre || eq.perfiles?.nombre || '—'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {activeLoan?.perfil?.correo || activeLoan?.perfil?.email || eq.perfiles?.email || eq.perfiles?.correo || ''}
                                </span>
                              </div>
                            ) : '—'}
                          </td>

                          {/* Fecha devolución */}
                          <td className="px-4 py-3">
                            {isEnPrestamo ? (
                              (activeLoan?.fecha_fin || eq.devolucion_fecha) ? (
                                <div className="flex flex-col font-medium">
                                  <span>{formatFechaDev(activeLoan?.fecha_fin || eq.devolucion_fecha)}</span>
                                  <span className="text-xs text-gray-500">
                                    {(activeLoan?.hora_fin || eq.devolucion_hora) ? (activeLoan?.hora_fin || eq.devolucion_hora).substring(0, 5) : ''} hrs
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col font-medium text-gray-400">
                                  <span className="text-[11px] uppercase tracking-wide">No disponible</span>
                                </div>
                              )
                            ) : '—'}
                          </td>

                          <td className="px-4 py-3 text-center">
                            {isEnPrestamo ? (
                              <span className="bg-amber-100 text-amber-700 border border-amber-300 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
                                EN PRESTAMO
                              </span>
                            ) : isEsperandoRespuesta ? (
                              <span className="bg-gray-100 text-gray-600 border border-gray-300 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
                                EN TRÁMITE
                              </span>
                            ) : (
                              <span className="bg-indigo-100 text-indigo-700 border border-indigo-300 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
                                PARA PRESTAMO
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isEnPrestamo ? (
                              activeLoan?.usuario_id === session?.user?.id ? (
                                <button
                                  onClick={() => handleGenerateActa(activeLoan, eq)}
                                  className="flex items-center justify-center mx-auto gap-1 bg-indigo-100 text-indigo-700 border border-indigo-400 hover:bg-indigo-200 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
                                  title="Descargar Acta de Préstamo"
                                >
                                  <Download size={14} className="stroke-[2.5]" /> Acta
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="px-3 py-1.5 rounded text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                                >
                                  Prestado
                                </button>
                              )
                            ) : isEsperandoRespuesta ? (
                              <button
                                disabled
                                className="px-3 py-1.5 rounded text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                              >
                                En Trámite
                              </button>
                            ) : (
                              <button
                                onClick={() => openPrestamoModal(eq.id)}
                                className="px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm bg-[#006BB9] text-white hover:bg-[#25306B]"
                              >
                                Solicitar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: LICENCIAS */}
        {activeTab === 'licencias' && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Licencias de Software Asignadas</h2>
            {misLicencias.length === 0 ? (
              <p className="text-gray-500 italic">No tienes licencias de software asignadas actualmente.</p>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-x-auto table-scroll border border-gray-200">
                <table className="min-w-full text-sm text-left whitespace-nowrap">
                  <thead className="uppercase text-xs border-b border-gray-200 bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-3 py-3 w-16">Logo</th>
                      <th className="px-3 py-3">Software</th>
                      <th className="px-3 py-3">Fecha de Asignación</th>
                      <th className="px-3 py-3">Vencimiento</th>
                      <th className="px-3 py-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {misLicencias.map((asignacion) => {
                      const lic = asignacion.licencias;

                      // Calculate status
                      let estadoLabel = 'ACTIVA';
                      let estadoClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                      if (!lic) {
                        estadoLabel = 'ELIMINADA';
                        estadoClass = 'bg-slate-100 text-slate-700 border-slate-200';
                      } else if (asignacion.estado === 'suspendida' || lic.estado === 'suspendida') {
                        estadoLabel = 'SUSPENDIDA';
                        estadoClass = 'bg-amber-50 text-amber-700 border-amber-200';
                      } else if (lic.fecha_termino) {
                        const parts = lic.fecha_termino.split('T')[0].split('-');
                        if (parts.length === 3) {
                          const [year, month, day] = parts;
                          const expirationDate = new Date(year, month - 1, day, 23, 59, 59);
                          if (expirationDate < new Date()) {
                            estadoLabel = 'CADUCADA';
                            estadoClass = 'bg-rose-50 text-rose-700 border-rose-200';
                          }
                        }
                      }

                      // Format expiration date to prevent timezone shift
                      const formatExpDate = (dateStr) => {
                        if (!dateStr) return '';
                        const parts = dateStr.split('T')[0].split('-');
                        if (parts.length !== 3) return dateStr;
                        const [year, month, day] = parts;
                        return `${day}/${month}/${year}`;
                      };

                      return (
                        <tr key={asignacion.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-2.5">
                            <div className="w-11 h-11 rounded shadow-sm border border-gray-100 overflow-hidden bg-white flex items-center justify-center">
                              <img
                                src={getLogoUrl(lic?.software)}
                                alt={lic?.software || 'Software'}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(lic?.software || 'SW')}&background=random&color=fff&rounded=true&bold=true`;
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-bold text-[#112A46] text-[15px]">
                              {lic?.software || 'Software Eliminado'}
                              {lic?.version && <span className="text-xs font-medium text-gray-500 ml-1">{lic.version}</span>}
                            </div>
                            <div className="text-[11px] mt-1 flex gap-2 items-center">
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-semibold">{lic?.tipo || 'SAAS'}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">
                            {new Date(asignacion.fecha_asignacion).toLocaleDateString('es-CL')}
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">
                            {lic?.fecha_termino ? formatExpDate(lic.fecha_termino) : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className={`px-2.5 py-1 rounded text-[9px] font-semibold uppercase border whitespace-nowrap inline-block ${estadoClass}`}>
                              {estadoLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal Solicitar Insumo */}
      {isSolicitarModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm animate-scale-in border-t-4 border-[#006BB9]">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Solicitar Insumo</h2>
            <form onSubmit={handleSolicitarInsumo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Cantidad Requerida</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantidadInsumo}
                  onChange={(e) => setCantidadInsumo(parseInt(e.target.value))}
                  className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-[#006BB9] focus:ring-[#006BB9]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t mt-4">
                <button type="button" onClick={() => setIsSolicitarModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#006BB9] text-white text-sm font-medium rounded-lg hover:bg-[#25306B] transition-colors shadow-sm">Confirmar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Solicitar Prestamo */}
      {isPrestamoModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md animate-scale-in border-t-4 border-[#006BB9]">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Confirmar Préstamo</h2>
            <form onSubmit={handleSolicitarPrestamo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    required
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-[#006BB9] focus:ring-[#006BB9] bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Hora de Inicio</label>
                  <CustomTimePicker
                    required
                    value={horaInicio}
                    onChange={setHoraInicio}
                    placeholder="HH:MM"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Fecha de Devolución</label>
                  <input
                    type="date"
                    required
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-[#006BB9] focus:ring-[#006BB9] bg-white cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Hora de Devolución</label>
                  <CustomTimePicker
                    required
                    value={horaFin}
                    onChange={setHoraFin}
                    placeholder="HH:MM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Motivo de la Reserva (Obligatorio)</label>
                <textarea
                  required
                  placeholder="Explique brevemente para qué necesita este equipo..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-[#006BB9] focus:ring-[#006BB9] bg-white"
                  rows="3"
                ></textarea>
                <div className="mt-3 bg-blue-50 border border-blue-100 p-3 rounded-lg text-[11px] leading-relaxed text-blue-800 text-justify">
                  <strong className="block mb-1 text-blue-900">Condiciones del Préstamo:</strong>
                  "Al solicitar este equipo, el funcionario asume la completa responsabilidad por su cuidado y buen uso durante el período de préstamo y debe ser devuelto en las mismas condiciones en las que fue entregado, en la fecha y hora acordadas. Cualquier daño físico, pérdida, robo o alteración de software sin autorización deberá ser reportado inmediatamente a la Unidad de Tecnologías de la Información."
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t mt-4">
                <button type="button" onClick={() => setIsPrestamoModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#006BB9] text-white text-sm font-medium rounded-lg hover:bg-[#25306B] transition-colors shadow-sm">Confirmar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pop-up SaaS Advertencia de Solicitud Pendiente */}
      {pendingWarningInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-slide-in border-t-4 border-amber-500">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 text-amber-500 mb-4 border border-amber-200">
              <AlertTriangle size={32} className="animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Solicitud de Préstamo en Trámite</h3>

            <div className="space-y-3 mt-4">
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                El funcionario <strong className="text-gray-800 font-semibold">{pendingWarningInfo.applicantName}</strong> tiene una solicitud de préstamo pendiente para este mismo equipo.
              </p>
              <p className="text-xs text-gray-500 text-center">
                Actualmente se encuentra en espera de que el administrador revise la solicitud para su aprobación o rechazo.
              </p>
            </div>

            <div className="flex justify-center pt-4 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={handleCancelWarning}
                className="px-8 py-2.5 bg-[#006BB9] hover:bg-[#25306B] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm w-full sm:w-auto cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
