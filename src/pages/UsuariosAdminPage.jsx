import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useInventario } from '../context/InventarioContext';
import { PlusCircle, Edit2, Trash2, Users, UploadCloud, XCircle, CheckCircle, QrCode, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';
import { logAuditoria } from '../utils/auditoria';
import { useSort } from '../hooks/useSort';
import { SortableHeader } from '../components/SortableHeader';

const formatEmailName = (email) => {
  if (!email) return '';
  return email.split('@')[0]
    .split(/[\.\-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

function getInitials(name) {
  if (!name || name === '—') return '??';
  const words = String(name).trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function UsuariosAdminPage() {
  const { showToast, equipos, opcionesMapeadas } = useInventario();
  const [usuarios, setUsuarios] = useState([]);
  const { sorted: sortedUsuarios, sortKey: uSortKey, sortDir: uSortDir, handleSort: handleUSort } = useSort(usuarios);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, email: '', nombre: '', rol: 'slep', password: '', subdireccion: '' });
  const [showSubdirSug, setShowSubdirSug] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carga Masiva States
  const [isMasivaModalOpen, setIsMasivaModalOpen] = useState(false);
  const [masivaStatus, setMasivaStatus] = useState({ type: 'idle', message: '' }); // idle, loading, success, error, results
  const [masivaResults, setMasivaResults] = useState(null);
  const [qrModalUser, setQrModalUser] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('perfiles').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      showToast('Error', 'No se pudieron cargar los usuarios.', 'error');
    } else {
      setUsuarios(data || []);
    }
    setLoading(false);
  };

  const getSubdireccionUser = (user) => {
    if (!equipos || equipos.length === 0) return 'Sin Subdirección';
    const uName = user.nombre || formatEmailName(user.email);
    const eqUser = equipos.find(eq => 
      eq['Usuario'] && 
      eq['Usuario'].trim().toLowerCase() === uName.trim().toLowerCase() && 
      eq['SubDirección'] && 
      eq['SubDirección'].trim() !== '—'
    );
    return eqUser ? eqUser['SubDirección'] : 'Sin Subdirección';
  };

  const generateStickerCanvas = (svgElement, user) => {
    return new Promise((resolve) => {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = 3;
        const baseWidth = 208;
        const baseHeight = 302;
        
        canvas.width = baseWidth * scale;
        canvas.height = baseHeight * scale;
        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, baseWidth, baseHeight);
        
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(10, 10, baseWidth - 20, 24);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SLEP LOS COPIHUES", baseWidth / 2, 22);
        
        const qrSize = 130;
        const qrX = (baseWidth - qrSize) / 2;
        ctx.drawImage(image, qrX, 45, qrSize, qrSize);
        
        const boxY = 185;
        const boxH = 26;
        ctx.fillStyle = "#f1f5f9";
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(15, boxY, baseWidth - 30, boxH, 4);
        ctx.fill();
        ctx.stroke();
        
        const uName = user.nombre || formatEmailName(user.email);
        ctx.fillStyle = "#0f172a";
        
        // Auto-fit name: reduce font size until text fits within the box width
        const maxWidth = baseWidth - 34; // 17px padding on each side
        let nameFontSize = 13;
        ctx.font = `bold ${nameFontSize}px 'Segoe UI', sans-serif`;
        while (ctx.measureText(uName).width > maxWidth && nameFontSize > 7) {
          nameFontSize -= 0.5;
          ctx.font = `bold ${nameFontSize}px 'Segoe UI', sans-serif`;
        }

        // If still too long, wrap into two lines
        if (ctx.measureText(uName).width > maxWidth) {
          const words = uName.split(' ');
          let line1 = '';
          let line2 = '';
          let switched = false;
          for (const word of words) {
            const test = (switched ? line2 : line1) + (switched ? (line2 ? ' ' : '') : (line1 ? ' ' : '')) + word;
            if (!switched && ctx.measureText(test).width > maxWidth) {
              switched = true;
              line2 = word;
            } else if (switched) {
              line2 += (line2 ? ' ' : '') + word;
            } else {
              line1 = test;
            }
          }
          ctx.fillText(line1, baseWidth / 2, boxY + (boxH / 2) - 6);
          ctx.fillText(line2, baseWidth / 2, boxY + (boxH / 2) + 6);
        } else {
          ctx.fillText(uName, baseWidth / 2, boxY + (boxH / 2));
        }

        // Subdirección
        const subdir = getSubdireccionUser(user);
        let subdirFontSize = 10;
        ctx.font = `bold ${subdirFontSize}px 'Segoe UI', sans-serif`;
        while (ctx.measureText(subdir).width > maxWidth && subdirFontSize > 7) {
          subdirFontSize -= 0.5;
          ctx.font = `bold ${subdirFontSize}px 'Segoe UI', sans-serif`;
        }
        ctx.fillText(subdir, baseWidth / 2, 225);

        // Email
        ctx.fillStyle = "#475569";
        let emailFontSize = 9;
        ctx.font = `${emailFontSize}px 'Segoe UI', sans-serif`;
        while (ctx.measureText(user.email).width > maxWidth && emailFontSize > 6) {
          emailFontSize -= 0.5;
          ctx.font = `${emailFontSize}px 'Segoe UI', sans-serif`;
        }
        ctx.fillText(user.email, baseWidth / 2, 240);
        
        URL.revokeObjectURL(blobURL);
        resolve(canvas.toDataURL("image/png"));
      };
      image.src = blobURL;
    });
  };

  const handleDownloadQR = async (user) => {
    const svgElement = document.getElementById("user-qr-code-svg");
    if (!svgElement) return;
    const pngDataUrl = await generateStickerCanvas(svgElement, user);
    const downloadLink = document.createElement("a");
    downloadLink.href = pngDataUrl;
    downloadLink.download = `QR_Usuario_${user.nombre || formatEmailName(user.email)}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrintQR = async (user) => {
    const svgElement = document.getElementById("user-qr-code-svg");
    if (!svgElement) return;
    const pngDataUrl = await generateStickerCanvas(svgElement, user);
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Etiqueta Funcionario</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background: #fff;
            }
            img {
              width: 5.5cm;
              height: auto;
              max-width: 100%;
            }
            @media print {
              body { align-items: flex-start; justify-content: flex-start; }
            }
          </style>
        </head>
        <body>
          <img src="${pngDataUrl}" onload="window.print(); setTimeout(() => window.close(), 500);" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setFormData({ id: user.id, email: user.email, nombre: user.nombre || '', rol: user.rol, password: '', subdireccion: user.subdireccion || '' });
    } else {
      setFormData({ id: null, email: '', nombre: '', rol: 'slep', password: '', subdireccion: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.id) {
        // Update user
        const { data, error } = await supabase.functions.invoke('admin-users', {
          body: {
            action: 'UPDATE_USER',
            payload: {
              userId: formData.id,
              nombre: formData.nombre,
              rol: formData.rol,
              password: formData.password,
              subdireccion: formData.subdireccion
            }
          }
        });
        
        if (error) {
          console.error("Invoke error details:", error);
          if (error.context && typeof error.context.json === 'function') {
            const contextData = await error.context.json().catch(() => null);
            throw new Error(contextData?.error || error.message);
          }
          throw error;
        }
        if (data?.error) throw new Error(data.error);
        showToast('Usuario actualizado', 'Los datos se guardaron correctamente.', 'success');
      } else {
        // Create user
        if (!formData.password) {
          throw new Error('La contraseña es obligatoria para nuevos usuarios.');
        }
        
        const { data, error } = await supabase.functions.invoke('admin-users', {
          body: {
            action: 'CREATE_USER',
            payload: {
              email: formData.email,
              password: formData.password,
              nombre: formData.nombre,
              rol: formData.rol,
              subdireccion: formData.subdireccion
            }
          }
        });
        
        if (error) {
          console.error("Invoke error details:", error);
          if (error.context && typeof error.context.json === 'function') {
            const contextData = await error.context.json().catch(() => null);
            throw new Error(contextData?.error || error.message);
          }
          throw error;
        }
        if (data?.error) throw new Error(data.error);
        showToast('Usuario creado', 'El usuario fue registrado con éxito.', 'success');
      }
      
      setIsModalOpen(false);
      fetchUsuarios();
    } catch (error) {
      console.error(error);
      showToast('Error', error.message || 'Ocurrió un error inesperado al guardar.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (confirm(`¿Estás completamente seguro de que deseas eliminar al usuario ${user.email}? Esta acción no se puede deshacer y podría afectar el historial de asignaciones.`)) {
      try {
        const { data, error } = await supabase.functions.invoke('admin-users', {
          body: {
            action: 'DELETE_USER',
            payload: { userId: user.id }
          }
        });
        
        if (error || data?.error) throw error || new Error(data?.error);
        
        showToast('Usuario eliminado', 'El usuario ha sido borrado del sistema.', 'success');
        fetchUsuarios();
      } catch (error) {
        console.error(error);
        showToast('Error', error.message || 'No se pudo eliminar el usuario.', 'error');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMasivaStatus({ type: 'loading', message: 'Analizando archivo...' });
    setMasivaResults(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const duplicates = [];
        const validUsers = [];
        const currentEmails = usuarios.map(u => u.email.toLowerCase().trim());

        for (const rawRow of data) {
          const row = {};
          for(const key in rawRow) {
            const normalKey = key.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            row[normalKey] = rawRow[key];
          }

          const email = (row['correo electronico'] || row['correo'] || row['email'] || '').toString().trim();
          const rawNombre = (row['nombre'] || '').toString().trim();
          const rawRol = (row['rol'] || 'SLEP').toString().trim().toUpperCase();

          if (!email || !rawNombre) continue;

          if (currentEmails.includes(email.toLowerCase())) {
            duplicates.push({ email, nombre: rawNombre, motivo: 'El correo ya existe en el sistema' });
            continue;
          }

          const firstName = rawNombre.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          const defaultPassword = `${firstName}.2026`;

          const rol = (rawRol === 'ADMIN' || rawRol === 'ADMINISTRADOR' || rawRol === 'ADMIN_TI') ? 'admin_ti' : 'slep';

          validUsers.push({ email, nombre: rawNombre, rol, password: defaultPassword });
        }

        if (validUsers.length === 0) {
          setMasivaStatus({ type: 'error', message: 'No se encontraron usuarios válidos nuevos en el archivo.' });
          setMasivaResults({ duplicates, created: 0, errors: [] });
          return;
        }

        setMasivaStatus({ type: 'loading', message: `Creando ${validUsers.length} usuarios...` });
        
        let createdCount = 0;
        const creationErrors = [];

        for (const u of validUsers) {
          try {
             const { data: resData, error: invokeError } = await supabase.functions.invoke('admin-users', {
              body: {
                action: 'CREATE_USER',
                payload: {
                  email: u.email,
                  password: u.password,
                  nombre: u.nombre,
                  rol: u.rol
                }
              }
            });

            if (invokeError) throw invokeError;
            if (resData?.error) throw new Error(resData.error);
            createdCount++;
          } catch (err) {
            creationErrors.push({ email: u.email, motivo: err.message || 'Error al crear' });
          }
        }

        await logAuditoria('usuarios', 'Carga Masiva', `Se cargaron masivamente ${createdCount} usuarios desde Excel.`);
        fetchUsuarios();

        setMasivaStatus({ type: 'results', message: 'Carga masiva finalizada' });
        setMasivaResults({ duplicates, created: createdCount, errors: creationErrors });

      } catch (error) {
        setMasivaStatus({ type: 'error', message: 'Error procesando archivo: ' + error.message });
      }
    };
    reader.onerror = () => setMasivaStatus({ type: 'error', message: 'Error de lectura de archivo' });
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  return (
    <div className="p-6 max-w-[1920px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={24} className="text-[#006BB9]" /> Gestión de Usuarios
          </h1>
          <p className="text-sm text-gray-500 mt-1">Crea, edita o elimina cuentas de acceso al portal.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMasivaModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
          >
            <UploadCloud size={18} />
            Carga Masiva
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#112A46] text-white px-4 py-2 rounded-lg hover:bg-[#1A3A5F] transition-colors shadow-sm font-medium"
          >
            <PlusCircle size={18} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto table-scroll border border-gray-200">
        <table className="min-w-full text-sm text-left whitespace-nowrap">
          <thead className="uppercase text-xs border-b border-gray-200">
            <tr>
              <SortableHeader label="Nombre" sortKey="nombre" currentKey={uSortKey} currentDir={uSortDir} onSort={handleUSort} className="px-6 py-3" />
              <SortableHeader label="Correo Electrónico" sortKey="email" currentKey={uSortKey} currentDir={uSortDir} onSort={handleUSort} className="px-6 py-3" />
              <SortableHeader label="Subdirección" sortKey="subdireccion" currentKey={uSortKey} currentDir={uSortDir} onSort={handleUSort} className="px-6 py-3" />
              <SortableHeader label="Rol" sortKey="rol" currentKey={uSortKey} currentDir={uSortDir} onSort={handleUSort} className="px-6 py-3" />
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Cargando usuarios...</td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No hay usuarios registrados en la tabla perfiles.</td></tr>
            ) : (
              sortedUsuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 p-0.5 pr-2.5 rounded-full text-[12px] font-bold border border-blue-200 shadow-sm">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black uppercase shrink-0">
                        {getInitials(user.nombre || formatEmailName(user.email))}
                      </span>
                      <span title={user.nombre || formatEmailName(user.email)}>
                        {user.nombre || formatEmailName(user.email)}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.subdireccion || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase border whitespace-nowrap ${
                      user.rol === 'admin_ti' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {user.rol === 'admin_ti' ? 'Administrador' : 'Funcionario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setQrModalUser(user)} className="text-emerald-600 hover:text-emerald-800 mr-4" title="Generar QR de Funcionario">
                      <QrCode size={18} />
                    </button>
                    <button onClick={() => handleOpenModal(user)} className="text-blue-600 hover:text-blue-800 mr-4" title="Editar Usuario">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-800" title="Eliminar Usuario">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-5 text-[#25306B]">
              {formData.id ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                <input 
                  required
                  type="text" 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})} 
                  className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                <input 
                  required 
                  type="email" 
                  disabled={!!formData.id}
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className={`w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9] ${formData.id ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
                  placeholder="correo@slep.gob.cl"
                />
                {formData.id && <p className="text-[10px] text-gray-500 mt-1">El correo no se puede modificar desde aquí.</p>}
              </div>
              
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subdirección</label>
                <input 
                  type="text" 
                  value={formData.subdireccion} 
                  onChange={e => {
                    setFormData({...formData, subdireccion: e.target.value});
                    setShowSubdirSug(true);
                  }}
                  onFocus={() => setShowSubdirSug(true)}
                  onBlur={() => setTimeout(() => setShowSubdirSug(false), 200)}
                  className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                  placeholder="Ej: Administración y Finanzas"
                />
                {showSubdirSug && opcionesMapeadas?.SubDirección && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-40 overflow-auto sug-list">
                    {opcionesMapeadas.SubDirección
                      .filter(opt => opt.toLowerCase().includes(formData.subdireccion.toLowerCase()))
                      .map((opt, i) => (
                        <li 
                          key={i} 
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Evita que el input pierda el foco y lance onBlur
                            setFormData({...formData, subdireccion: opt});
                            setShowSubdirSug(false);
                          }}
                        >
                          {opt}
                        </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
                  <select 
                    value={formData.rol} 
                    onChange={e => setFormData({...formData, rol: e.target.value})}
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9]"
                  >
                    <option value="slep">Funcionario (SLEP)</option>
                    <option value="admin_ti">Administrador (TI)</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {formData.id ? 'Nueva Contraseña' : 'Contraseña'}
                  </label>
                  <input 
                    type="password" 
                    required={!formData.id}
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    className="w-full rounded-lg border-gray-300 shadow-sm border p-2.5 focus:border-[#006BB9] focus:ring-[#006BB9]" 
                    placeholder={formData.id ? 'Opcional' : 'Requerida'}
                  />
                </div>
              </div>
              
              {formData.id && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  <strong>Nota:</strong> Solo escribe en "Nueva Contraseña" si deseas forzar el cambio de la contraseña del usuario.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button 
                  type="button" 
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#006BB9] text-white rounded-lg hover:bg-[#1A3A5F] font-medium transition flex items-center gap-2"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Carga Masiva */}
      {isMasivaModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-[#25306B] flex items-center gap-2">
              <UploadCloud size={24} className="text-emerald-600" /> Carga Masiva de Usuarios
            </h2>
            
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm border border-blue-100">
              <h3 className="font-bold mb-2">Instrucciones:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Sube un archivo Excel (.xlsx) con las columnas: <strong>Nombre</strong>, <strong>Correo electronico</strong>, <strong>Rol</strong>.</li>
                <li>Los roles aceptados son <strong>SLEP</strong> (Funcionario) y <strong>ADMIN</strong> (Administrador).</li>
                <li>Si un correo ya existe en el sistema, será omitido automáticamente.</li>
                <li>La contraseña por defecto generada será: <strong>primer_nombre.2026</strong> (en minúsculas).</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block w-full border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center cursor-pointer hover:bg-emerald-50 transition-colors">
                <UploadCloud size={48} className="mx-auto text-emerald-400 mb-4" />
                <span className="text-emerald-700 font-semibold block">Haz clic para seleccionar el archivo Excel</span>
                <span className="text-sm text-emerald-600 mt-1 block">Formatos soportados: .xlsx, .csv</span>
                <input 
                  type="file" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  disabled={masivaStatus.type === 'loading'}
                />
              </label>
            </div>

            {masivaStatus.type !== 'idle' && (
              <div className={`p-4 rounded-lg mb-6 border ${
                masivaStatus.type === 'loading' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                masivaStatus.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {masivaStatus.type === 'loading' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>}
                  {masivaStatus.type === 'error' && <XCircle size={18} />}
                  {masivaStatus.type === 'results' && <CheckCircle size={18} />}
                  {masivaStatus.message}
                </div>
              </div>
            )}

            {masivaResults && (
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <span className="block text-emerald-800 font-bold">Creados Exitosamente</span>
                    <span className="text-2xl font-black text-emerald-600">{masivaResults.created}</span>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <span className="block text-amber-800 font-bold">Duplicados (Omitidos)</span>
                    <span className="text-2xl font-black text-amber-600">{masivaResults.duplicates.length}</span>
                  </div>
                </div>

                {masivaResults.duplicates.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-bold text-amber-800 mb-2 text-sm">Usuarios omitidos (Ya existen)</h4>
                    <div className="bg-amber-50 rounded border border-amber-100 max-h-40 overflow-y-auto">
                      <ul className="text-xs divide-y divide-amber-100">
                        {masivaResults.duplicates.map((dup, i) => (
                          <li key={i} className="p-2 text-amber-700 flex justify-between">
                            <span>{dup.nombre}</span>
                            <span className="opacity-75">{dup.email}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {masivaResults.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-bold text-red-800 mb-2 text-sm">Errores de creación</h4>
                    <div className="bg-red-50 rounded border border-red-100 max-h-40 overflow-y-auto">
                      <ul className="text-xs divide-y divide-red-100">
                        {masivaResults.errors.map((err, i) => (
                          <li key={i} className="p-2 text-red-700 flex flex-col">
                            <span className="font-bold">{err.email}</span>
                            <span className="opacity-75">{err.motivo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end border-t pt-4">
              <button 
                onClick={() => {
                  setIsMasivaModalOpen(false);
                  setMasivaStatus({ type: 'idle', message: '' });
                  setMasivaResults(null);
                }} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal QR Code de Usuario */}
      {qrModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-[#25306B] text-white">
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <QrCode size={16} /> Código QR del Funcionario
              </h2>
              <button
                onClick={() => setQrModalUser(null)}
                className="text-white/80 hover:text-white hover:bg-white/10 px-2 py-0.5 rounded-lg transition-colors cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col items-center gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-inner flex items-center justify-center">
                <QRCodeSVG
                  id="user-qr-code-svg"
                  value={`${window.location.origin}/qr-info?usuario=${encodeURIComponent(qrModalUser.nombre || formatEmailName(qrModalUser.email))}`}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Detalles */}
              <div className="w-full bg-slate-50 border border-gray-150 p-3 rounded-xl space-y-1.5">
                <div>
                  <span className="font-bold text-[#25306B]">Funcionario:</span>{' '}
                  <span className="text-gray-700 font-medium">{qrModalUser.nombre || formatEmailName(qrModalUser.email)}</span>
                </div>
                <div>
                  <span className="font-bold text-[#25306B]">Correo Electrónico:</span>{' '}
                  <span className="text-gray-700 font-medium">{qrModalUser.email}</span>
                </div>
                <div>
                  <span className="font-bold text-[#25306B]">Rol:</span>{' '}
                  <span className="text-gray-700 font-medium">
                    {qrModalUser.rol === 'admin_ti' ? 'Administrador' : 'Funcionario'}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 w-full mt-1">
                <button
                  onClick={() => handleDownloadQR(qrModalUser)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold rounded-xl border border-gray-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} /> Descargar PNG
                </button>
                <button
                  onClick={() => handlePrintQR(qrModalUser)}
                  className="flex-1 py-2 bg-[#006BB9] hover:bg-[#25306B] text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Printer size={14} /> Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
