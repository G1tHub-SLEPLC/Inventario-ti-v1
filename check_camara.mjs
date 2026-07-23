import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkCamara() {
  const { data, error } = await supabase.from('equipos').select('*').ilike('descripcion_bien', '%cámara%').or('descripcion_bien.ilike.%camara%');
  if (error) {
    console.error(error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log("No cameras found");
    return;
  }

  console.log("Found cameras:", data.length);
  for (let cam of data) {
    console.log(`\nID: ${cam.id}`);
    console.log(`Desc: ${cam.descripcion_bien}`);
    console.log(`Factura: ${cam.factura}`);
    console.log(`OC: ${cam.orden_compra}`);
    console.log(`Has Factura File: ${cam.has_factura_file}`);
    console.log(`Has OC File: ${cam.has_oc_file}`);
    
    // check storage
    if (cam.has_factura_file) {
      const code = cam.factura ? cam.factura.trim().toLowerCase() : '';
      const storageKey = (code && code !== '—') ? `factura_${code}` : `factura_${cam.id}`;
      console.log(`Expected Storage Key (Factura): ${storageKey}`);
      
      const { data: fileData, error: fileError } = await supabase.storage.from('documentos').list('', { search: storageKey });
      if (fileData && fileData.length > 0) {
        console.log(`  -> FILE EXISTS IN STORAGE: ${fileData.map(f => f.name).join(', ')}`);
      } else {
        console.log(`  -> FILE MISSING IN STORAGE!`);
        
        // try fallback
        const { data: fallback } = await supabase.storage.from('documentos').list('', { search: cam.id });
        if (fallback && fallback.length > 0) {
          console.log(`  -> FOUND AS FALLBACK: ${fallback.map(f => f.name).join(', ')}`);
        }
      }
    }
  }
}

checkCamara();
