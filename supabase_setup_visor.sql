-- ==============================================================================
-- ACTUALIZACIÓN DE POLÍTICAS RLS PARA ROL "VISOR TI"
-- Ejecuta este script en el SQL Editor de Supabase
-- ==============================================================================

-- 1. Tabla: solicitudes
-- Permitir al rol visor_ti leer las solicitudes
DROP POLICY IF EXISTS "Users can view own solicitudes" ON public.solicitudes;
CREATE POLICY "Users can view own solicitudes" ON public.solicitudes FOR SELECT 
USING (
  auth.uid() = usuario_id OR 
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('admin_ti', 'visor_ti'))
);

-- 2. Tabla: asignaciones_licencias
-- Permitir al rol visor_ti leer las asignaciones de licencias
DROP POLICY IF EXISTS "Users can view own assignments" ON public.asignaciones_licencias;
CREATE POLICY "Users can view own assignments" ON public.asignaciones_licencias FOR SELECT 
USING (
  auth.uid() = usuario_id OR 
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('admin_ti', 'visor_ti'))
);

-- 3. Tabla: auditoria
-- Permitir al rol visor_ti leer los logs de auditoría
DROP POLICY IF EXISTS "Admins can view auditoria" ON public.auditoria;
CREATE POLICY "Admins can view auditoria" ON public.auditoria FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol IN ('admin_ti', 'visor_ti'))
);

-- Nota: Las tablas 'equipos', 'insumos', 'licencias' y 'perfiles' ya tienen 
-- políticas de lectura pública (SELECT USING (true)), por lo que visor_ti 
-- ya tiene acceso de lectura a ellas por defecto.
