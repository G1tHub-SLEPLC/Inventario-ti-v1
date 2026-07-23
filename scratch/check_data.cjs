const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envStr = fs.readFileSync(envPath, 'utf8');
const env = {};
envStr.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) {
    env[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: equipos, error: e1 } = await supabase.from('equipos').select('id, detalles, usuario_asignado_id');
  const { data: asignaciones, error: e2 } = await supabase.from('asignaciones_licencias').select('usuario_id');
  const { data: perfiles, error: e3 } = await supabase.from('perfiles').select('id, nombre');
  
  if (e1 || e2 || e3) console.error(e1, e2, e3);
  
  const asignadosUsuarios = asignaciones.map(a => {
    const p = perfiles.find(p => p.id === a.usuario_id);
    return p ? p.nombre : null;
  }).filter(Boolean);

  console.log("Usuarios con licencias asignadas:");
  console.log([...new Set(asignadosUsuarios)]);

  console.log("\nEquipos asignados (con campo 'Usuario' o 'usuario_asignado_id'):");
  equipos.forEach(eq => {
     let eqUser = eq.detalles && eq.detalles.Usuario ? eq.detalles.Usuario : null;
     if (eq.usuario_asignado_id) {
       const p = perfiles.find(p => p.id === eq.usuario_asignado_id);
       if (p) eqUser = p.nombre;
     }
     
     if (eqUser && eqUser.toLowerCase() !== 'disponible' && eqUser.toLowerCase() !== '—') {
       console.log(`- ${eqUser} (Equipo ID: ${eq.id})`);
     }
  });
}
check();
