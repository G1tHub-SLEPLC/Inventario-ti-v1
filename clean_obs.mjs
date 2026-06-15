import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hjjhoukwyqkspwqerugg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqamhvdWt3eXFrc3B3cWVydWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2MTUsImV4cCI6MjA5NTUwNTYxNX0.GgyNeZBzLi8oZ5ryuGghEQz2b0Znpe7sPWn6W-wsj9w";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanObservaciones() {
  console.log('Fetching solicitudes...');
  const { data: solicitudes, error } = await supabase
    .from('solicitudes')
    .select('id, observaciones_admin');

  if (error) {
    console.error('Error fetching solicitudes:', error);
    return;
  }

  const toUpdate = solicitudes.filter(s => 
    s.observaciones_admin && 
    (s.observaciones_admin.trim().toUpperCase() === 'ENTREGA DIRECTA' || 
     s.observaciones_admin.trim().toUpperCase() === 'ENTREGA DIRECTA (MÚLTIPLE)' ||
     s.observaciones_admin.trim().toUpperCase() === 'ENTREGA DIRECTA (MULTIPLE)')
  );

  console.log(`Found ${toUpdate.length} records to update.`);

  let successCount = 0;
  for (const sol of toUpdate) {
    const { error: updError } = await supabase
      .from('solicitudes')
      .update({ observaciones_admin: '' })
      .eq('id', sol.id);
      
    if (updError) {
      console.error(`Error updating id ${sol.id}:`, updError);
    } else {
      successCount++;
    }
  }

  console.log(`Successfully updated ${successCount} records.`);
}

cleanObservaciones();
