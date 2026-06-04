import { supabase } from '../lib/supabaseClient';

/**
 * Registra un evento en la tabla inmutable de auditoría.
 * @param {string} modulo - 'equipos', 'insumos', 'solicitudes', 'usuarios', etc.
 * @param {string} accion - Acción corta descriptiva
 * @param {string} detalles - Descripción detallada de los cambios
 * @param {string} usuarioAfectado - (Opcional) Nombre del usuario al que se le asignó o modificó algo
 */
export async function logAuditoria(modulo, accion, detalles, usuarioAfectado = null) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: 'No session' };

    const { error } = await supabase.from('auditoria').insert({
      usuario_id: session.user.id,
      modulo: modulo,
      accion: accion,
      detalles: detalles,
      usuario_afectado: usuarioAfectado
    });

    if (error) {
      console.error('Error al registrar en auditoría:', error);
      alert(`ATENCIÓN: Error al guardar en Auditoría.\n\nDetalle técnico: ${error.message}\n\n¿Ejecutaste el script SQL en Supabase?`);
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    console.error('Excepción al registrar auditoría:', error);
    alert(`Excepción en Auditoría: ${error.message}`);
    return { success: false, error };
  }
}

/**
 * Genera un texto detallando qué campos cambiaron entre dos objetos
 */
export function getDiffString(oldObj, newObj, ignoreKeys = ['id', 'created_at']) {
  if (!oldObj) return 'Registro nuevo creado.';
  let diffs = [];
  for (const key in newObj) {
    if (ignoreKeys.includes(key)) continue;
    // Ignorar si ambos son falsy o iguales
    if (oldObj[key] == newObj[key]) continue;
    
    diffs.push(`[${key}]: '${oldObj[key] || 'Vacio'}' -> '${newObj[key] || 'Vacio'}'`);
  }
  return diffs.length > 0 ? diffs.join(' | ') : 'No se detectaron cambios en los campos.';
}
