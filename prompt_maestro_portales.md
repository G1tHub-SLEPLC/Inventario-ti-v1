# Prompt Maestro: Plantilla de Arquitectura de Portales Web

*Copia todo el texto a continuación y pégalo en modelos avanzados como Claude Opus 4.6 (Thinking) o Gemini 3.1 Pro (High) cuando inicies un nuevo proyecto.*

---

Actúa como un Arquitecto de Software Experto (Senior Full-Stack Developer). Quiero construir un 'Portal Web de Gestión' desde cero. Aquí tienes el detalle exacto de toda la arquitectura, tecnologías y reglas de negocio que debes implementar. Tu objetivo inicial es proponer el esquema SQL de la base de datos y la estructura de carpetas, y luego programar las vistas y lógica paso a paso cuando yo te lo indique.

**1. STACK TECNOLÓGICO:**
- **Frontend:** React (usando Vite).
- **Estilos:** Tailwind CSS (diseño moderno, limpio, corporativo, uso de iconos de 'lucide-react').
- **Backend & Base de Datos:** Supabase (PostgreSQL).
- **Autenticación:** Supabase Auth (Email y Contraseña).
- **Librerías Extra obligatorias:** `xlsx` y `papaparse` para carga/exportación de Excel/CSV, `jspdf` y `jspdf-autotable` para reportes PDF, `react-router-dom` para navegación.

**2. ARQUITECTURA DE BASE DE DATOS (Supabase):**
Debes crear los scripts SQL (con RLS - Row Level Security estrictamente configurado) para al menos estas entidades:
- **perfiles:** Vinculado a auth.users. Control de roles (Admin, Usuario).
- **entidad_principal (ej: equipos):** Campos clave como id, descripción, identificador único (ej: número de serie), asignación.
- **entidad_secundaria (ej: insumos):** Manejo de stock y stock mínimo.
- **solicitudes:** Flujo de estados (pendiente, aprobado, rechazado) con campo para 'observaciones_admin'.
- **auditoria:** Tabla de historial intocable (id, created_at, usuario_id, modulo, accion, detalles). RLS debe permitir INSERT y SELECT a autenticados, pero requerir permisos explícitos o denegar el DELETE para evitar manipulación del historial.

**3. ARQUITECTURA DEL FRONTEND (/src):**
- **/components:** Componentes reutilizables. Debes incluir un sistema de "Toasts" (alertas flotantes) globales con un z-index altísimo (ej: 9999) para que jamás queden ocultos detrás de modales.
- **/context:**
   - `AuthContext.jsx`: Manejo global de la sesión de Supabase.
   - `AppContext.jsx`: Estado global de los datos principales.
- **/utils:**
   - `auditoria.js`: Función asíncrona global para registrar silenciosamente en BD qué hace cada usuario.
   - `exportUtils.js`: Lógica centralizada para exportar cualquier tabla a Excel o PDF.
- **/pages:**
   - `LoginPage`: Diseño moderno, dividido en dos columnas (imagen a un lado, formulario al otro).
   - `Tabla Principal`: Con buscador en tiempo real, filtros y botones de acción.
   - `CargaMasivaPage`: Interfaz para subir archivos.

**4. REGLAS CRÍTICAS DE NEGOCIO Y LÓGICA (¡No olvidar!):**
- **Auditoría Obligatoria:** Cualquier acción de Crear, Actualizar o Eliminar en la aplicación debe llamar a la utilidad de auditoría automáticamente. La pantalla de Auditoría debe usar Supabase Realtime (WebSockets) para actualizarse sola si hay cambios.
- **Carga Masiva Inteligente:** Al procesar Excel/CSV, el sistema DEBE normalizar los nombres de columnas (mediante alias). Debe detectar duplicados cruzando datos con la BD local y omitirlos sin dar error, alertando al usuario mediante Toasts.
- **Borrado Seguro de Base de Datos:** La vista de "Limpiar Base de Datos" debe requerir que el administrador re-ingrese su contraseña (usando `supabase.auth.signInWithPassword`) antes de ejecutar comandos DELETE. El borrado debe atrapar errores (try/catch) por si RLS bloquea la acción, mostrando la razón en pantalla y sin congelar la interfaz.

**Para empezar, responde solo con:**
1. El código SQL completo para crear estas tablas y sus políticas RLS.
2. La estructura de directorios inicial.
3. El comando exacto para inicializar el proyecto base con Vite.
