import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Aparece no console do navegador se as variáveis não foram configuradas no Vercel.
  console.error("Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY nas variáveis de ambiente.");
}

export const supabase = createClient(url || "http://localhost", anonKey || "missing-key", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
