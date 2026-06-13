import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function check() {
  const { data, error } = await supabase.from('equipos').select('*');
  if (error) console.error(error);
  console.log(data.map(d => ({id: d.id, serie: d['Nº de serie'], cod: d['Código de Inventario']})));
}
check();
