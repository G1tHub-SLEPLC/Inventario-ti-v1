import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useInventario } from '../context/InventarioContext';
import { PlusCircle, Edit2, Trash2, Users } from 'lucide-react';

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
  const { showToast } = useInventario();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, email: '', nombre: '', rol: 'slep', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleOpenModal = (user = null) => {
    if (user) {
      setFormData({ id: user.id, email: user.email, nombre: user.nombre || '', rol: user.rol, password: '' });
    } else {
      setFormData({ id: null, email: '', nombre: '', rol: 'slep', password: '' });
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
              password: formData.password
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
              rol: formData.rol
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

  return (
    <div className="p-6 max-w-[1920px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={24} className="text-[#006BB9]" /> Gestión de Usuarios
          </h1>
          <p className="text-sm text-gray-500 mt-1">Crea, edita o elimina cuentas de acceso al portal.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#112A46] text-white px-4 py-2 rounded-lg hover:bg-[#1A3A5F] transition-colors"
        >
          <PlusCircle size={18} />
          Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto table-scroll border border-gray-200">
        <table className="min-w-full text-sm text-left whitespace-nowrap">
          <thead className="uppercase text-xs border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Correo Electrónico</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Cargando usuarios...</td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No hay usuarios registrados en la tabla perfiles.</td></tr>
            ) : (
              usuarios.map((user) => (
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
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase border whitespace-nowrap ${
                      user.rol === 'admin_ti' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {user.rol === 'admin_ti' ? 'Administrador' : 'Funcionario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
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
    </div>
  );
}
