import { createClient } from '@supabase/supabase-js';

// Validación temprana — Vite incrusta estas variables en el bundle en tiempo
// de compilación (no en runtime). Si faltan al correr "npm run build", createClient()
// crashea de forma silenciosa con "Error: supabaseUrl is required." y la app
// queda en blanco (solo el fondo rojo de respaldo del <body> en index.html).
const REQUIRED_ENV_VARS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !import.meta.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`❌ Variables de entorno faltantes en el build del frontend: ${missingEnvVars.join(', ')}`);
  console.error('Agregalas a frontend/.env antes de correr "npm run build" (Vite las incrusta en el bundle en tiempo de compilación, no las lee del entorno del servidor en runtime).');
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
