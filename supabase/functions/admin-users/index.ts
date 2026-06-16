import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Manejo de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Inicializar Supabase con llaves de entorno
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    // Supabase no permite crear secretos manuales que empiecen con SUPABASE_
    const supabaseServiceKey = Deno.env.get('ADMIN_SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 2. Verificar que quien llama es un admin_ti
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw new Error('No autorizado')
    }

    const { data: perfilData, error: perfilError } = await supabaseAdmin
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (perfilError) {
      throw new Error(`Error leyendo perfil admin: ${perfilError.message}. Key preview: ${supabaseServiceKey.substring(0, 10)}...`)
    }

    if (perfilData?.rol !== 'admin_ti') {
      throw new Error(`Rol incorrecto: ${perfilData?.rol}`)
    }

    // 3. Obtener los datos de la petición
    const { action, payload } = await req.json()

    // 4. Procesar la acción
    if (action === 'CREATE_USER') {
      const { email, password, nombre, rol, subdireccion, rut } = payload
      
      // Crear en auth.users
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (authError) throw authError

      // Actualizar el perfil que se creó automáticamente por el trigger (si existe)
      // O insertarlo si no hay trigger
      const newUserId = authData.user.id
      const { error: profileError } = await supabaseAdmin
        .from('perfiles')
        .upsert({
          id: newUserId,
          email: email,
          nombre: nombre,
          rol: rol || 'slep',
          subdireccion: subdireccion || null,
          rut: rut || null
        })

      if (profileError) throw profileError

      return new Response(JSON.stringify({ success: true, user: authData.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'DELETE_USER') {
      const { userId } = payload
      
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    
    if (action === 'UPDATE_USER') {
      const { userId, nombre, rol, password, subdireccion, rut } = payload
      
      // Si enviaron contraseña, la actualizamos en auth.users
      if (password && password.trim() !== '') {
        const { error: passError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: password
        })
        if (passError) throw passError
      }

      // Actualizar perfil
      const { error: profError } = await supabaseAdmin
        .from('perfiles')
        .update({ nombre, rol, subdireccion: subdireccion || null, rut: rut || null })
        .eq('id', userId)

      if (profError) throw profError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error('Acción desconocida')

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
