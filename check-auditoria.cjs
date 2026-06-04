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
    const { data, error } = await supabase.from('auditoria').select('count', { count: 'exact' });
    console.log('Total rows in auditoria:', data ? data.length : 0, 'Error:', error);
    
    // Also fetch the first row to see what it is
    const { data: row } = await supabase.from('auditoria').select('*').limit(1);
    console.log('First row:', row);
  }
  
  test();
}
