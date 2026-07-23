import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hjjhoukwyqkspwqerugg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqamhvdWt3eXFrc3B3cWVydWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2MTUsImV4cCI6MjA5NTUwNTYxNX0.GgyNeZBzLi8oZ5ryuGghEQz2b0Znpe7sPWn6W-wsj9w";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('insumos').select('*').limit(1);
  if (error) {
    console.error('Error de tabla insumos:', error);
  } else {
    console.log('Insumos existe y devolvió datos:', data);
  }
}

check();
