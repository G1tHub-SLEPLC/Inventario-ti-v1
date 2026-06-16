import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useInventario } from './InventarioContext';
import { sendPrestamoEmail } from '../utils/emailUtils';

const SolicitudesContext = createContext(null);

export function useSolicitudes() {
  return useContext(SolicitudesContext);
}

export function SolicitudesProvider({ children }) {
  const { session, isAdmin } = useAuth();
  const { showToast, broadcastEquiposChanges, refetchInventario } = useInventario();
  
  const [insumos, setInsumos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const solicitudesChannelRef = useRef(null);

  const broadcastSolicitudesChanges = () => {
    if (solicitudesChannelRef.current) {
      solicitudesChannelRef.current.send({
        type: 'broadcast',
        event: 'solicitudes_changed',
        payload: {}
      });
    }
  };

  const loadData = useCallback(async () => {
    if (!session) {
      setInsumos([]);
      setSolicitudes([]);
      setLoading(false);
      return;
    }

    setSolicitudes(current => {
      if (current.length === 0) {
        setLoading(true);
      }
      return current;
    });
    
    // Load Insumos
    const { data: insumosData, error: insumosError } = await supabase.from('insumos').select('*');
    if (insumosError) console.error('Error cargando insumos:', insumosError);
    else setInsumos(insumosData || []);

    // Load Solicitudes
    let query = supabase.from('solicitudes').select('*, insumo:insumos(nombre), perfil:perfiles(nombre, email, rut, subdireccion)');
    // Si no es admin, solo carga las suyas y todas las de tipo prestamo
    if (!isAdmin) {
      query = query.or(`usuario_id.eq.${session.user.id},tipo.eq.prestamo`);
    }

    
    const { data: solsData, error: solsError } = await query.order('created_at', { ascending: false });
    
    if (solsError) {
      console.error('Error cargando solicitudes:', solsError);
      return;
    }
    
    // Fetch perfiles to map them manually since FK join might be missing or failing
    const { data: perfilesData, error: perfilesError } = await supabase.from('perfiles').select('*').order('nombre', { ascending: true });
    if (perfilesError) console.error('Error cargando perfiles:', perfilesError);
    
    const solicitudesCompletas = (solsData || []).map(sol => {
      // Encontrar el perfil usando el usuario_id
      const perfil = (perfilesData || []).find(p => p.id === sol.usuario_id);
      return {
        ...sol,
        perfil: perfil ? { nombre: perfil.nombre, correo: perfil.email, rut: perfil.rut, subdireccion: perfil.subdireccion } : sol.perfil // Fallback a lo que haya traido Supabase
      };
    });

    setSolicitudes(solicitudesCompletas);
    setLoading(false);
  }, [session, isAdmin]);

  useEffect(() => {
    loadData();

    // Listen to real-time changes in solicitudes
    const solicitudesChannel = supabase.channel('solicitudes-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, (payload) => {
        loadData();
        
        // Mostrar Toast a los Admins si hay una nueva solicitud
        if (isAdmin && payload.eventType === 'INSERT') {
          showToast('Nueva Solicitud', `Se ha recibido una nueva solicitud de ${payload.new.tipo}.`, 'info');
        }
      })
      .on('broadcast', { event: 'solicitudes_changed' }, () => {
        loadData();
      })
      .subscribe();

    solicitudesChannelRef.current = solicitudesChannel;

    const insumosChannel = supabase.channel('insumos-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insumos' }, () => {
        loadData();
      })
      .subscribe();

    const perfilesChannel = supabase.channel('solicitudes-perfiles-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'perfiles' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(solicitudesChannel);
      supabase.removeChannel(insumosChannel);
      supabase.removeChannel(perfilesChannel);
    };
  }, [loadData, isAdmin, showToast]);

  const solicitarPrestamo = async (equipo_id, fecha_inicio, fecha_fin, hora_inicio, hora_fin, motivo) => {
    const { error } = await supabase.from('solicitudes').insert({
      usuario_id: session.user.id,
      tipo: 'prestamo',
      equipo_id,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      motivo
    });
    if (error) {
      console.error('Error al solicitar préstamo:', error);
      throw error;
    }

    // Actualizar el estado del equipo a ESPERANDO RESPUESTA
    // Tratamos equipo_id como posible string o numero, buscamos por id o N° de serie
    // Pero asumiendo que equipo_id pasado es el ID real del equipo:
    const { error: eqError } = await supabase
      .from('equipos')
      .update({ estado: 'ESPERANDO RESPUESTA' })
      .eq('id', equipo_id);
      
    if (eqError) {
      console.error('Error al actualizar estado del equipo:', eqError);
      // No hacemos throw aquí para no romper el flujo si falla, pero sí queda registrado
    }
    
    // Send email notification
    sendPrestamoEmail({
      userEmail: session.user.email,
      userName: session.user.user_metadata?.nombre || session.user.email,
      equipoNombre: equipo_id, // Podríamos buscar el nombre real del equipo si es necesario
      fechaInicio: fecha_inicio,
      horaInicio: hora_inicio,
      fechaFin: fecha_fin,
      horaFin: hora_fin,
      motivo: motivo
    });

    showToast('Éxito', 'Solicitud de préstamo enviada correctamente.', 'success');
    await loadData();
    if (refetchInventario) {
      await refetchInventario();
    }
    broadcastSolicitudesChanges();
    if (broadcastEquiposChanges) {
      broadcastEquiposChanges();
    }
  };

  const solicitarInsumo = async (insumo_id, cantidad) => {
    const { error } = await supabase.from('solicitudes').insert({
      usuario_id: session.user.id,
      tipo: 'insumo',
      insumo_id,
      cantidad
    });
    if (error) {
      console.error('Error al solicitar insumo:', error);
      throw error;
    }
    showToast('Éxito', 'Solicitud de insumo enviada correctamente.', 'success');
    await loadData();
    broadcastSolicitudesChanges();
  };

  const updateEstadoSolicitud = async (id, estado, observaciones_admin) => {
    const { error } = await supabase.from('solicitudes').update({
      estado,
      observaciones_admin
    }).eq('id', id);
    
    if (error) {
      console.error('Error actualizando solicitud:', error);
      throw error;
    }
    
    // Update local state immediately without waiting for realtime channel reload
    setSolicitudes(prev => prev.map(sol => 
      sol.id === id ? { ...sol, estado, observaciones_admin } : sol
    ));
    
    showToast('Éxito', `Solicitud ${estado} correctamente.`, 'success');
    await loadData();
    broadcastSolicitudesChanges();
  };

  return (
    <SolicitudesContext.Provider value={{
      insumos,
      solicitudes,
      loading,
      solicitarPrestamo,
      solicitarInsumo,
      updateEstadoSolicitud,
      refetch: loadData,
      broadcast: broadcastSolicitudesChanges
    }}>
      {children}
    </SolicitudesContext.Provider>
  );
}
