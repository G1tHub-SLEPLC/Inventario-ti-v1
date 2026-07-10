const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim().replace(/"/g, '');
const KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim().replace(/"/g, '');

const normalizeStr = (str) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

async function fixEquipos() {
  const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
  
  // 1. Get all equipos
  const equiposRes = await fetch(URL + '/rest/v1/equipos?select=*', { headers });
  const equipos = await equiposRes.json();
  
  // 2. Find corrupted equipments
  const corrupted = equipos.filter(e => {
    const user = e.detalles && e.detalles.Usuario;
    const isAssigned = user && !['disponible', 'bodega', '—', '-', 'sin asignar'].includes(user.toLowerCase().trim());
    return isAssigned && (e.estado === 'DISPONIBLE');
  });
  
  console.log(`Encontrados ${corrupted.length} equipos para arreglar...`);
  
  // 3. Update each one
  let count = 0;
  for (const eq of corrupted) {
    const userName = eq.detalles.Usuario;
    const updateBody = { estado: 'ASIGNADO' };
    
    const updateRes = await fetch(URL + `/rest/v1/equipos?id=eq.${eq.id}`, {
       method: 'PATCH',
       headers,
       body: JSON.stringify(updateBody)
    });
    if (updateRes.ok) {
       count++;
       console.log(`Arreglado equipo ${eq.id} (${userName}) -> ASIGNADO`);
    } else {
       console.error(`Error arreglando ${eq.id}:`, await updateRes.text());
    }
  }
  console.log(`Total arreglados: ${count}`);
}

fixEquipos().catch(console.error);
