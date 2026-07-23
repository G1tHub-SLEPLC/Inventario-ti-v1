import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hjjhoukwyqkspwqerugg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqamhvdWt3eXFrc3B3cWVydWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2MTUsImV4cCI6MjA5NTUwNTYxNX0.GgyNeZBzLi8oZ5ryuGghEQz2b0Znpe7sPWn6W-wsj9w";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkEquipos() {
  const { data: equipos, error } = await supabase
    .from('equipos')
    .select('id, serial, detalles');

  if (error) {
    console.error('Error al consultar equipos:', error);
    return;
  }

  const equiposConObs = equipos.filter(e => e.detalles && e.detalles.observacion_asignacion);
  
  if (equiposConObs.length > 0) {
    console.log(`✅ ¡Éxito! Se encontraron ${equiposConObs.length} equipos con "observacion_asignacion" guardada.`);
    equiposConObs.forEach(e => {
      console.log(`- Equipo ID: ${e.id} | Serial: ${e.serial} | Observación: "${e.detalles.observacion_asignacion}"`);
    });
  } else {
    console.log(`⚠️ No se encontraron equipos con "observacion_asignacion" en la base de datos.`);
  }
}

checkEquipos();
