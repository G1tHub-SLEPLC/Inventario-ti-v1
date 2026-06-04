// URL del flujo de Power Automate (Webhook)
// Esta URL se generará cuando tengas la licencia Premium y actives el flujo
const POWER_AUTOMATE_WEBHOOK_URL = 'PENDIENTE_LICENCIA_PREMIUM'; 

/**
 * Envía un correo notificando una reserva de equipo vía Power Automate
 */
export const sendPrestamoEmail = async (prestamoData) => {
  if (POWER_AUTOMATE_WEBHOOK_URL === 'PENDIENTE_LICENCIA_PREMIUM') {
    console.log('Envío de correo omitido: Esperando licencia Premium de Power Automate.');
    return false;
  }

  try {
    const response = await fetch(POWER_AUTOMATE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo_notificacion: 'prestamo',
        to_email: prestamoData.userEmail,
        to_name: prestamoData.userName,
        equipo_nombre: prestamoData.equipoNombre,
        fecha_inicio: prestamoData.fechaInicio,
        hora_inicio: prestamoData.horaInicio,
        fecha_fin: prestamoData.fechaFin,
        hora_fin: prestamoData.horaFin,
        motivo: prestamoData.motivo
      })
    });
    return true;
  } catch (error) {
    console.error('Error invocando Power Automate:', error);
    return false;
  }
};

/**
 * Envía un correo notificando la aprobación y entrega de un insumo vía Power Automate
 */
export const sendInsumoAprobadoEmail = async (insumoData) => {
  if (POWER_AUTOMATE_WEBHOOK_URL === 'PENDIENTE_LICENCIA_PREMIUM') {
    console.log('Envío de correo omitido: Esperando licencia Premium de Power Automate.');
    return false;
  }

  try {
    const response = await fetch(POWER_AUTOMATE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo_notificacion: 'insumo',
        to_email: insumoData.userEmail,
        to_name: insumoData.userName,
        insumo_nombre: insumoData.insumoNombre,
        cantidad: insumoData.cantidad,
        observaciones: insumoData.observaciones
      })
    });
    return true;
  } catch (error) {
    console.error('Error invocando Power Automate:', error);
    return false;
  }
};
