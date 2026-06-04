import { useAuth } from '../context/AuthContext';

export default function UnauthorizedPage() {
  const { perfil, authError } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4 text-gray-700">
      <h1 className="text-3xl font-bold text-red-600">Acceso Denegado</h1>
      <p className="max-w-md">
        Tu cuenta no tiene un rol asignado para acceder a este portal. Por favor, contacta a soporte TI.
      </p>
      <div className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
        Rol detectado: {perfil?.rol || 'Ninguno'}
      </div>
      {authError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded text-left max-w-md w-full">
          <strong>Error leyendo perfil:</strong>
          <pre className="mt-2 whitespace-pre-wrap font-mono">{JSON.stringify(authError, null, 2)}</pre>
          <p className="mt-2">
            <strong>Posible causa:</strong> Las políticas RLS (Row Level Security) en Supabase impiden que leas la tabla "perfiles".
          </p>
        </div>
      )}
    </div>
  );
}
