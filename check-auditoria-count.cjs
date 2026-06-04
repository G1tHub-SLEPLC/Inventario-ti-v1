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
    const { data, count, error } = await supabase.from('auditoria').select('*', { count: 'exact' });
    console.log('Total rows before:', count);
    if(count > 0) {
      console.log('Sample row:', data[0]);
    }
  }
  
  test();
}
