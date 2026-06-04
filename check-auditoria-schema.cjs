const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const uMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const kMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
if(uMatch && kMatch) {
  const url = uMatch[1].trim().replace(/^['"]|['"]$/g, '');
  const key = kMatch[1].trim().replace(/^['"]|['"]$/g, '');
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(url, key);
  
  async function test() {
    console.log('Inserting dummy row...');
    const { data: insData, error: insError } = await supabase.from('auditoria').insert([{
      modulo: 'dummy',
      accion: 'Test',
      detalles: 'Test delete functionality'
    }]).select();
    
    console.log('Insert:', insData, insError);
    if(insData && insData.length > 0) {
      console.log('Columns:', Object.keys(insData[0]));
    }
  }
  
  test();
}
