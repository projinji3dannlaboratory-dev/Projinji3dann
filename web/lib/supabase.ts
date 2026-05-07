import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _public: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

export function supabasePublic(): SupabaseClient {
  if (_public) return _public;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set."
    );
  }
  _public = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _public;
}

export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Service role key not set; cannot use admin client."
    );
  }
  _admin = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _admin;
}
