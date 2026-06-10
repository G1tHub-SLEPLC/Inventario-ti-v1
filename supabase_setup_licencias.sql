-- Tabla para gestionar el inventario de Licencias de Software
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

-- Si la tabla ya existe y le faltan las columnas nuevas, ejecute:
-- ALTER TABLE public.licencias ADD COLUMN IF NOT EXISTS version VARCHAR(100);
-- ALTER TABLE public.licencias ADD COLUMN IF NOT EXISTS tipo VARCHAR(100);
-- ALTER TABLE public.licencias ADD COLUMN IF NOT EXISTS fecha_inicio DATE;
-- ALTER TABLE public.licencias ADD COLUMN IF NOT EXISTS fecha_termino DATE;
-- ALTER TABLE public.licencias ADD COLUMN IF NOT EXISTS factura VARCHAR(255);
-- ALTER TABLE public.licencias ADD COLUMN IF NOT EXISTS orden_compra VARCHAR(255);
-- ALTER TABLE public.licencias ADD COLUMN IF NOT EXISTS has_factura_file BOOLEAN DEFAULT false;
-- ALTER TABLE public.licencias ADD COLUMN IF NOT EXISTS has_oc_file BOOLEAN DEFAULT false;

-- Habilitar RLS para licencias
ALTER TABLE public.licencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for licencias" ON public.licencias FOR SELECT USING (true);
CREATE POLICY "Admin full access for licencias" ON public.licencias FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);

-- Tabla para gestionar las asignaciones de licencias a los usuarios
CREATE TABLE IF NOT EXISTS public.asignaciones_licencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    licencia_id UUID REFERENCES public.licencias(id) ON DELETE CASCADE NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(licencia_id, usuario_id) -- Un usuario no puede tener la misma licencia asignada dos veces
);

-- Habilitar RLS para asignaciones_licencias
ALTER TABLE public.asignaciones_licencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assignments" ON public.asignaciones_licencias FOR SELECT USING (
  auth.uid() = usuario_id OR EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);
CREATE POLICY "Admin full access for assignments" ON public.asignaciones_licencias FOR ALL USING (
  EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin_ti')
);

-- Otorgar permisos base
GRANT ALL ON TABLE public.licencias TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.asignaciones_licencias TO anon, authenticated, service_role;
