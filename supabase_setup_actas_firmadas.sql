-- ========================================================================================
-- Script para Configuración de Actas Firmadas
-- ========================================================================================

-- 1. Agregar columna para el acta firmada global del usuario
ALTER TABLE perfiles 
ADD COLUMN IF NOT EXISTS acta_firmada_url text;

-- 2. Agregar columna para el acta firmada en equipos (inventario)
ALTER TABLE inventario 
ADD COLUMN IF NOT EXISTS acta_firmada_url text;

-- 3. Agregar columna para el acta firmada en préstamos (solicitudes)
ALTER TABLE solicitudes 
ADD COLUMN IF NOT EXISTS acta_firmada_url text;

-- 4. Creación del bucket para las actas firmadas (si no existe)
-- Se requiere que ejecutes esto en el SQL Editor de Supabase
insert into storage.buckets (id, name, public)
values ('actas_firmadas', 'actas_firmadas', false) -- Privado, solo accesible por auth
on conflict (id) do nothing;

-- 5. Políticas de seguridad para el bucket de actas firmadas
-- Nota: Asegúrate de tener configurado RLS en la tabla objects si es necesario, 
-- pero por lo general se configuran políticas en el bucket.

-- Policy: Permitir a los usuarios subir actas
create policy "Usuarios pueden subir actas" 
on storage.objects for insert 
to authenticated 
with check ( bucket_id = 'actas_firmadas' );

-- Policy: Permitir a los usuarios ver actas
create policy "Usuarios pueden ver actas" 
on storage.objects for select 
to authenticated 
using ( bucket_id = 'actas_firmadas' );

-- Policy: Permitir a los usuarios eliminar actas (para reemplazo)
create policy "Usuarios pueden eliminar sus actas" 
on storage.objects for delete
to authenticated 
using ( bucket_id = 'actas_firmadas' );
