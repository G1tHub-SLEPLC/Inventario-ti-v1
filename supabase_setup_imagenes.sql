-- Script para crear el bucket de imágenes y configurar sus políticas de acceso

-- 1. Crear el bucket (si no existe) y hacerlo público
INSERT INTO storage.buckets (id, name, public)
VALUES ('equipos_imagenes', 'equipos_imagenes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Permitir lectura pública de las imágenes
CREATE POLICY "Imágenes accesibles para todo público"
ON storage.objects FOR SELECT
USING (bucket_id = 'equipos_imagenes');

-- 3. Permitir a los usuarios insertar/subir nuevas imágenes
CREATE POLICY "Permitir subida de imágenes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'equipos_imagenes');

-- 4. Permitir actualizar/sobrescribir imágenes
CREATE POLICY "Permitir actualizar imágenes"
ON storage.objects FOR UPDATE
WITH CHECK (bucket_id = 'equipos_imagenes');

-- 5. Permitir eliminar imágenes
CREATE POLICY "Permitir eliminar imágenes"
ON storage.objects FOR DELETE
USING (bucket_id = 'equipos_imagenes');
