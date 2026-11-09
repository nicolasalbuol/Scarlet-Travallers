import { createClient } from "@supabase/supabase-js";

// Endereço e chave pública (publishable) do Supabase. A chave pública pode ficar no site;
// as fichas são protegidas pelas regras do banco (RLS). Nunca coloque a "secret" aqui.
const url = import.meta.env.VITE_SUPABASE_URL || "https://gyvkmxpyxbjhstzfqnbp.supabase.co";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_dJInnJppokHvcYS_x_xE-A_SSUaEUwH";

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
