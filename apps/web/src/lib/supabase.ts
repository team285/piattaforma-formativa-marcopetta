import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing Supabase env vars. Crea apps/web/.env.local con VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

/**
 * withTimeout — wrappa una promise (es. una query Supabase) con un timeout.
 * Se la promise non risolve entro `ms`, restituisce `fallbackValue`.
 * Cosi' le viste non si bloccano in "Caricamento..." infinito se la rete è
 * lenta o la query ha un errore di sintassi PostgREST.
 */
export async function withTimeout<T, F>(
  promise: Promise<T> | PromiseLike<T>,
  ms: number,
  fallbackValue: F,
  label = "query"
): Promise<T | F> {
  return new Promise<T | F>((resolve) => {
    const timer = setTimeout(() => {
      console.warn(`[supabase] ${label} timeout after ${ms}ms — using fallback`);
      resolve(fallbackValue);
    }, ms);
    Promise.resolve(promise).then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        console.warn(`[supabase] ${label} rejected:`, err);
        resolve(fallbackValue);
      }
    );
  });
}
