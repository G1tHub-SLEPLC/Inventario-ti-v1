import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: equipos, error: e1 } = await supabase.from('equipos').select('id, detalles');
  const { data: asignaciones, error: e2 } = await supabase.from('asignaciones_licencias').select('usuario_id');
  const { data: perfiles, error: e3 } = await supabase.from('perfiles').select('id, nombre');
  
  if (e1 || e2 || e3) console.error(e1, e2, e3);
  
  const asignadosUsuarios = asignaciones.map(a => {
    const p = perfiles.find(p => p.id === a.usuario_id);
    return p ? p.nombre : null;
  }).filter(Boolean);

  console.log("Usuarios con licencias asignadas:");
  console.log(asignadosUsuarios);

  console.log("\nEquipos asignados (con campo 'Usuario'):");
  equipos.forEach(eq => {
     if (eq.detalles && eq.detalles.Usuario && eq.detalles.Usuario.toLowerCase() !== 'disponible') {
       console.log(`- ${eq.detalles.Usuario} (Equipo ID: ${eq.id})`);
     }
  });

}
check();
