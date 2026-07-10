const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const URL = urlMatch[1].trim();
const KEY = keyMatch[1].trim();

async function run() {
  const res = await fetch(`${URL}/rest/v1/perfiles?id=eq.80e2bd11-590e-4158-8e5b-413dc4975720`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
  });
  const users = await res.json();
  console.log('Users:', users);

  const res2 = await fetch(`${URL}/rest/v1/equipos?select=id,estado,usuario_asignado_id,detalles`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
  });
  const equipos = await res2.json();
  console.log('Equipos total:', equipos.length);
  
  const assigned = equipos.filter(e => e.usuario_asignado_id === '80e2bd11-590e-4158-8e5b-413dc4975720');
  console.log('Equipos with exact usuario_asignado_id:', assigned.length);

  const user = users[0];
  const byName = equipos.filter(e => {
    if(!e.detalles || !e.detalles.Usuario) return false;
    const u = e.detalles.Usuario.toLowerCase();
    const name = user.nombre ? user.nombre.toLowerCase() : '';
    const email = user.email ? user.email.toLowerCase() : '';
    return (name && u.includes(name)) || (email && u.includes(email));
  });
  console.log('Equipos matched by name/email:', byName.length);
}
run();
