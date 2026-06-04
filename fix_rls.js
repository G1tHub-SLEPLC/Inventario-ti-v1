import { createClient } from '@supabase/supabase-js';

const url = "https://hjjhoukwyqkspwqerugg.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqamhvdWt3eXFrc3B3cWVydWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk2MTUsImV4cCI6MjA5NTUwNTYxNX0.GgyNeZBzLi8oZ5ryuGghEQz2b0Znpe7sPWn6W-wsj9w";

const supabase = createClient(url, key);

async function check() {
  const sql = `
    CREATE POLICY "Admins can insert solicitudes" ON public.solicitudes FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
    );
  `;
  // We can't execute raw SQL from supabase-js unless we use rpc.
  // Wait, let's just create an rpc function or use the postgres connection.
  console.log("SQL to execute:");
  console.log(sql);
}
check();
