-- ========================================================================================
-- ESQUEMA COMPLETO DE REFERENCIA - INVENTARIO TI
-- Este script es para levantar la estructura inicial de la base de datos en un 
-- proyecto de Supabase nuevo. No contiene datos.
-- ========================================================================================

-- Habilitar extensión para UUIDs (normalmente viene por defecto en Supabase, pero por si acaso)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABLA: perfiles (Usuarios del Sistema)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rol VARCHAR(50) DEFAULT 'usuario',
    acta_firmada_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de perfiles" ON public.perfiles FOR SELECT USING (true);
CREATE POLICY "Admins pueden todo en perfiles" ON public.perfiles FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);

-- ==========================================
-- 2. TABLA: equipos (Inventario Principal)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.equipos (
    id VARCHAR(255) PRIMARY KEY, -- Usualmente generado en cliente o con formato específico
    serial VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'DISPONIBLE',
    usuario_asignado_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    "Usuario" VARCHAR(255), -- Columna legacy textual si la usan
    historialUsuarios JSONB, -- O TEXT, dependiendo de cómo guardan el historial
    acta_firmada_url TEXT,
    detalles JSONB NOT NULL DEFAULT '{}'::jsonb, -- Aquí se guardan dinámicamente Marca, Modelo, Tipo, Factura, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de equipos" ON public.equipos FOR SELECT USING (true);
CREATE POLICY "Admins pueden todo en equipos" ON public.equipos FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);

-- ==========================================
-- 3. TABLA: insumos
-- ==========================================
CREATE TABLE IF NOT EXISTS public.insumos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    cantidad_disponible INTEGER DEFAULT 0,
    tipo VARCHAR(100),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for insumos" ON public.insumos FOR SELECT USING (true);
CREATE POLICY "Admin full access for insumos" ON public.insumos FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);

-- ==========================================
-- 4. TABLA: solicitudes
-- ==========================================
CREATE TABLE IF NOT EXISTS public.solicitudes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'insumo' o 'prestamo'
    equipo_id VARCHAR(255),
    insumo_id UUID REFERENCES public.insumos(id) ON DELETE SET NULL,
    cantidad INTEGER DEFAULT 1,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado', 'devuelto'
    observaciones_admin TEXT,
    acta_firmada_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own solicitudes" ON public.solicitudes FOR SELECT USING (auth.uid() = usuario_id OR EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));
CREATE POLICY "Users can insert own solicitudes" ON public.solicitudes FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Admins can update solicitudes" ON public.solicitudes FOR UPDATE USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));
CREATE POLICY "Admins can insert solicitudes" ON public.solicitudes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));
CREATE POLICY "Admins can delete solicitudes" ON public.solicitudes FOR DELETE USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));

-- ==========================================
-- 5. TABLA: licencias
-- ==========================================
CREATE TABLE IF NOT EXISTS public.licencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    software VARCHAR(255) NOT NULL,
    version VARCHAR(100),
    tipo VARCHAR(100),
    descripcion TEXT,
    cantidad_total INTEGER NOT NULL DEFAULT 0,
    fecha_inicio DATE,
    fecha_termino DATE,
    factura VARCHAR(255),
    orden_compra VARCHAR(255),
    has_factura_file BOOLEAN DEFAULT false,
    has_oc_file BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.licencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for licencias" ON public.licencias FOR SELECT USING (true);
CREATE POLICY "Admin full access for licencias" ON public.licencias FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);

CREATE TABLE IF NOT EXISTS public.asignaciones_licencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    licencia_id UUID REFERENCES public.licencias(id) ON DELETE CASCADE NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(licencia_id, usuario_id)
);

ALTER TABLE public.asignaciones_licencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assignments" ON public.asignaciones_licencias FOR SELECT USING (
  auth.uid() = usuario_id OR EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);
CREATE POLICY "Admin full access for assignments" ON public.asignaciones_licencias FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);

-- ==========================================
-- 6. TABLA: notificaciones y triggers
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view and update notificaciones" ON public.notificaciones FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);

CREATE OR REPLACE FUNCTION public.crear_notificacion_solicitud()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notificaciones (mensaje) 
  VALUES ('Nueva solicitud de ' || NEW.tipo || ' recibida.');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notificacion_solicitud ON public.solicitudes;
CREATE TRIGGER trigger_notificacion_solicitud
AFTER INSERT ON public.solicitudes
FOR EACH ROW EXECUTE FUNCTION public.crear_notificacion_solicitud();

-- ==========================================
-- 7. TABLA: auditoria
-- ==========================================
CREATE TABLE IF NOT EXISTS public.auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    modulo VARCHAR(100) NOT NULL,
    accion VARCHAR(255) NOT NULL,
    detalles TEXT,
    usuario_afectado VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view auditoria" ON public.auditoria FOR SELECT USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));
CREATE POLICY "Admins can insert auditoria" ON public.auditoria FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));

-- ==========================================
-- 8. STORAGE (Buckets para imágenes y actas)
-- ==========================================
-- (Si se ejecuta desde el editor SQL de Supabase web)
INSERT INTO storage.buckets (id, name, public) VALUES ('equipos_imagenes', 'equipos_imagenes', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('actas_firmadas', 'actas_firmadas', false) ON CONFLICT (id) DO NOTHING;

-- Políticas Storage: Equipos
CREATE POLICY "Imágenes accesibles para todo público" ON storage.objects FOR SELECT USING (bucket_id = 'equipos_imagenes');
CREATE POLICY "Permitir subida de imágenes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'equipos_imagenes');
CREATE POLICY "Permitir actualizar imágenes" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'equipos_imagenes');
CREATE POLICY "Permitir eliminar imágenes" ON storage.objects FOR DELETE USING (bucket_id = 'equipos_imagenes');

-- Políticas Storage: Actas Firmadas (Autenticados)
CREATE POLICY "Usuarios pueden subir actas" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'actas_firmadas' );
CREATE POLICY "Usuarios pueden ver actas" ON storage.objects FOR SELECT TO authenticated USING ( bucket_id = 'actas_firmadas' );
CREATE POLICY "Usuarios pueden eliminar sus actas" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'actas_firmadas' );

-- ==========================================
-- Otorgar permisos finales a todas las tablas para roles base
-- ==========================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
