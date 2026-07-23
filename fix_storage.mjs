import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env manually
const env = fs.readFileSync('.env', 'utf8');
let url = '';
let key = '';
env.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
});

const supabase = createClient(url, key);

async function run() {
  const { data: files, error } = await supabase.storage.from('documentos').list();
  if (error) {
    console.error("Error listing files:", error);
    return;
  }
  
  const relevantFiles = files.filter(f => f.name.includes('1263') || f.name.includes('camara') || f.name.includes('factura'));
  console.log("Files containing '1263', 'camara' or 'factura':");
  relevantFiles.forEach(f => console.log(f.name));
  
  // also get the camera equipment
  const { data: eq } = await supabase.from('equipos').select('id, descripcion_bien, factura, orden_compra, has_factura_file').ilike('descripcion_bien', '%cámara%');
  console.log("\nCameras in DB:");
  console.log(eq);
}

run();
