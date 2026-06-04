-- 1. Actualización de tabla EQUIPOS (Agregar estado y asignación)
-- Nota: Si tu tabla 'equipos' ya tiene datos, esto no los borrará, solo agregará columnas.
ALTER TABLE public.equipos 
ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'DISPONIBLE',
ADD COLUMN IF NOT EXISTS usuario_asignado_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Tabla de INSUMOS
CREATE TABLE IF NOT EXISTS public.insumos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    cantidad_disponible INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Nuevas columnas para Insumos
ALTER TABLE public.insumos 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(100),
ADD COLUMN IF NOT EXISTS marca VARCHAR(100),
ADD COLUMN IF NOT EXISTS modelo VARCHAR(100);


-- Habilitar RLS para insumos
ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for insumos" ON public.insumos FOR SELECT USING (true);
CREATE POLICY "Admin full access for insumos" ON public.insumos FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);

-- 3. Tabla de SOLICITUDES
CREATE TABLE IF NOT EXISTS public.solicitudes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'insumo' o 'prestamo'
    equipo_id VARCHAR(255), -- ID referencial del equipo (tu id de equipos es texto)
    insumo_id UUID REFERENCES public.insumos(id) ON DELETE SET NULL,
    cantidad INTEGER DEFAULT 1,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado', 'devuelto'
    observaciones_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para solicitudes
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own solicitudes" ON public.solicitudes FOR SELECT USING (auth.uid() = usuario_id OR EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));
CREATE POLICY "Users can insert own solicitudes" ON public.solicitudes FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Admins can update solicitudes" ON public.solicitudes FOR UPDATE USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));
CREATE POLICY "Admins can insert solicitudes" ON public.solicitudes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));
CREATE POLICY "Admins can delete solicitudes" ON public.solicitudes FOR DELETE USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));

-- 4. Tabla de NOTIFICACIONES (Toasts in-app)
CREATE TABLE IF NOT EXISTS public.notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para notificaciones
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view and update notificaciones" ON public.notificaciones FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);

-- Trigger opcional para insertar una notificación cuando se crea una solicitud (opcional si lo manejamos desde frontend)
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

-- 5. Tabla de AUDITORIA
CREATE TABLE IF NOT EXISTS public.auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    modulo VARCHAR(100) NOT NULL,
    accion VARCHAR(255) NOT NULL,
    detalles TEXT,
    usuario_afectado VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.auditoria ADD COLUMN IF NOT EXISTS usuario_afectado VARCHAR(255);

-- Habilitar RLS para auditoria
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view auditoria" ON public.auditoria FOR SELECT USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));
CREATE POLICY "Admins can insert auditoria" ON public.auditoria FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));

-- INTENCIONALMENTE NO HAY POLITICA DE DELETE/UPDATE PARA HACERLO INMUTABLE

-- Otorgar permisos base de PostgreSQL (Necesario para evitar 'permission denied for table auditoria')
GRANT ALL ON TABLE public.auditoria TO anon, authenticated, service_role;

-- También permitiremos a los administradores borrar de la tabla solicitudes (para revertir insumos)
CREATE POLICY "Admins can delete solicitudes" ON public.solicitudes FOR DELETE USING (EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti'));
