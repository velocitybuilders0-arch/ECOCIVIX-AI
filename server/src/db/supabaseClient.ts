/**
 * ECOCIVIX AI — Supabase Client Singleton
 * Uses anon key (safe for server-side with RLS) or service-role key for admin ops.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the mobile client.
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] SUPABASE_URL or SUPABASE_ANON_KEY not set. Database operations will fail."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "http://localhost:54321",
  supabaseAnonKey ?? "placeholder"
);
