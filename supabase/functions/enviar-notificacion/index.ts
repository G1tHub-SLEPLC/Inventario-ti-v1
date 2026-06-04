import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') // Tu lista de distribución

serve(async (req) => {
  try {
    const payload = await req.json()
    
    // Verificamos si es una inserción en la tabla solicitudes
    if (payload.type === 'INSERT' && payload.table === 'solicitudes') {
      const solicitud = payload.record
      
      const tipoMensaje = solicitud.tipo === 'insumo' ? 'Insumo' : 'Préstamo de Equipo'
      const htmlContent = `
        <h2>Nueva Solicitud Recibida en el Portal TI</h2>
        <p>Se ha generado una nueva solicitud de <strong>${tipoMensaje}</strong>.</p>
        <p>Por favor, ingresa al portal de administración para revisarla, aprobarla o rechazarla.</p>
        <br/>
        <p><a href="https://tu-dominio.com/solicitudes">Ir al Portal</a></p>
      `

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Inventario TI <notificaciones@tu-dominio.com>', // Debes configurar un dominio verificado en Resend
          to: [ADMIN_EMAIL],
          subject: `Nueva Solicitud: ${tipoMensaje}`,
          html: htmlContent,
        })
      })

      if (res.ok) {
        return new Response(JSON.stringify({ message: "Email sent" }), { status: 200 })
      } else {
        const errorText = await res.text()
        console.error('Error enviando email:', errorText)
        return new Response(JSON.stringify({ error: errorText }), { status: 400 })
      }
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
