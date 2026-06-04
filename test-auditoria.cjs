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
    console.log('Testing auditoria deletion...');
    const { error: error1 } = await supabase.from('auditoria').delete().not('created_at', 'is', null);
    console.log('Delete all result error:', error1);
    
    const { data: data2, error: error2 } = await supabase.from('auditoria').select('*').limit(1);
    console.log('Any rows left?', data2 ? data2.length : 0, error2);
  }
  
  test();
}
