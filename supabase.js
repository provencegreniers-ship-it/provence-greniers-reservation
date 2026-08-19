import { createClient } from '@supabase/supabase-js';

// Utilise la clé "service_role" côté serveur uniquement (jamais exposée au navigateur)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
