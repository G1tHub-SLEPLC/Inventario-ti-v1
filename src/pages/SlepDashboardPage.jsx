import { useState, useMemo } from 'react';
import { useInventario } from '../context/InventarioContext';
import { useSolicitudes } from '../context/SolicitudesContext';
import { useAuth } from '../context/AuthContext';
import { useLicencias } from '../context/LicenciasContext';
import { Monitor, Package, Calendar, Key } from 'lucide-react';

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

  const formatEmailName = (email) => {
    if (!email) return '';
    return email.split('@')[0]
      .split(/[\.\-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Filtrar equipos
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
    return equipos.filter(eq => eq.estado === 'PARA PRESTAMO');
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
      // Error handled in context
    }
  };

  const openPrestamoModal = (equipoId) => {
    setSelectedEquipo(equipoId);
    setFechaInicio('');
    setHoraInicio('');
    setFechaFin('');
    setHoraFin('');
    setMotivo('');
    setIsPrestamoModalOpen(true);
  };

  return (
    <div className="p-6 max-w-[1920px] mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mi Portal SLEP</h1>

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
                      <th className="px-4 py-3 font-semibold">Descripción del Bien</th>
                      <th className="px-4 py-3 font-semibold">Marca</th>
                      <th className="px-4 py-3 font-semibold">Modelo</th>
                      <th className="px-4 py-3 font-semibold">Nº de serie</th>
                      <th className="px-4 py-3 font-semibold">SubDirección</th>
                      <th className="px-4 py-3 font-semibold text-center w-24">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                    {misEquipos.map((eq, i) => (
                      <tr key={eq.id || i} className="hover:bg-blue-50 even:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{eq['Descripción del Bien'] || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{eq.Marca || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{eq.Modelo || '—'}</td>
                        <td className="px-4 py-3 font-mono text-[12px] whitespace-nowrap">{eq['Nº de serie'] || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{eq['SubDirección'] || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-sans bg-lime-300 text-lime-800 border border-lime-400 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
                            ASIGNADO
                          </span>
                        </td>
                      </tr>
                    ))}
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
                    <th className="px-4 py-3 font-semibold">Marca</th>
                    <th className="px-4 py-3 font-semibold">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-center w-24">Estado</th>
                    <th className="px-4 py-3 font-semibold text-center w-24">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                  {insumos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500 italic">No hay insumos en el catálogo.</td>
                    </tr>
                  ) : (
                    insumos.map((ins) => {
                      const disponible = ins.cantidad_disponible > 0;
                      return (
                        <tr key={ins.id} className="hover:bg-blue-50 even:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium">{ins.tipo || ins.nombre}</td>
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
                    <th className="px-4 py-3 font-semibold text-center w-24">Estado</th>
                    <th className="px-4 py-3 font-semibold text-center w-24">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                  {equiposDisponiblesParaPrestamo.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500 italic">No hay equipos disponibles para préstamo actualmente.</td>
                    </tr>
                  ) : (
                    equiposDisponiblesParaPrestamo.map((eq) => (
                      <tr key={eq.id} className="hover:bg-blue-50 even:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium">{eq['Descripción del Bien'] || '—'}</td>
                        <td className="px-4 py-3">{eq.Marca || '—'}</td>
                        <td className="px-4 py-3">{eq.Modelo || '—'}</td>
                        <td className="px-4 py-3 font-mono text-[12px]">{eq['Nº de serie'] || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-indigo-200 text-indigo-600 border border-indigo-600 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase whitespace-nowrap">
                            PARA PRESTAMO
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openPrestamoModal(eq.id)}
                            className="px-3 py-1.5 rounded text-xs font-semibold transition-colors shadow-sm bg-[#006BB9] text-white hover:bg-[#25306B]"
                          >
                            Solicitar
                          </button>
                        </td>
                      </tr>
                    ))
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
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-[#006BB9] focus:ring-[#006BB9] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Hora de Inicio</label>
                  <input 
                    type="time" 
                    required
                    value={horaInicio} 
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-[#006BB9] focus:ring-[#006BB9] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Fecha de Devolución</label>
                  <input 
                    type="date" 
                    required
                    value={fechaFin} 
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-[#006BB9] focus:ring-[#006BB9] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Hora de Devolución</label>
                  <input 
                    type="time" 
                    required
                    value={horaFin} 
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 text-sm focus:border-[#006BB9] focus:ring-[#006BB9] bg-white"
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
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t mt-4">
                <button type="button" onClick={() => setIsPrestamoModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#006BB9] text-white text-sm font-medium rounded-lg hover:bg-[#25306B] transition-colors shadow-sm">Confirmar Solicitud</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
