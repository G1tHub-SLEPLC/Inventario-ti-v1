const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim().replace(/"/g, '');
const KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim().replace(/"/g, '');

async function run() {
  const res = await fetch(URL + '/rest/v1/equipos?select=id,estado,usuario_asignado_id,detalles', {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
  });
  const data = await res.json();
  const corrupted = data.filter(e => {
    const user = e.detalles && e.detalles.Usuario;
    const isAssigned = user && !['disponible', 'bodega', '—', '-', 'sin asignar'].includes(user.toLowerCase().trim());
    return isAssigned && e.estado === 'DISPONIBLE';
  });
  console.log('Equipos con Usuario pero estado DISPONIBLE:', corrupted.length);
  if(corrupted.length > 0) console.log(corrupted[0]);
}
run();
