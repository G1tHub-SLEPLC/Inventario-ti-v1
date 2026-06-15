import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hjjhoukwyqkspwqerugg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqamhvdWt3eXFrc3B3cWVydWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2MTUsImV4cCI6MjA5NTUwNTYxNX0.GgyNeZBzLi8oZ5ryuGghEQz2b0Znpe7sPWn6W-wsj9w";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkObservaciones() {
  const { data: solicitudes, error } = await supabase
    .from('solicitudes')
    .select('id, observaciones_admin');

  if (error) {
    console.error('Error fetching solicitudes:', error);
    return;
  }

  const toUpdate = solicitudes.filter(s => s.observaciones_admin);
  
  console.log('Unique observations:');
  const uniqueObs = [...new Set(toUpdate.map(s => s.observaciones_admin))];
  console.log(uniqueObs);
}

checkObservaciones();
