import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseClientConfig {
  url: string;
  anonKey: string;
}

export function createSupabase(config: SupabaseClientConfig): SupabaseClient {
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
}
