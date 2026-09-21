import { createClient, Session, SupabaseClient, User } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const missingConfigError = {
  message: `Missing configuration: ${!supabaseUrl ? "EXPO_PUBLIC_SUPABASE_URL" : ""}${!supabaseUrl && !supabaseAnonKey ? " and " : ""}${!supabaseAnonKey ? "EXPO_PUBLIC_SUPABASE_ANON_KEY" : ""}. Add these to mobile/.env and restart Expo.`,
};

type AuthResult = {
  data: { session: Session | null; user: User | null };
  error: { message: string } | null;
};

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { data: { session: null, user: null }, error: missingConfigError };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, fullName: string): Promise<AuthResult> {
  if (!supabase) return { data: { session: null, user: null }, error: missingConfigError };
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
}

export async function signOut() {
  if (!supabase) return { error: missingConfigError };
  return supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function getUserId(user: User | null): string | undefined {
  return user?.id;
}

export function getUserRole(user: User | null): "citizen" | "staff" | "admin" {
  const role = user?.app_metadata?.role;
  return role === "admin" || role === "staff" ? role : "citizen";
}
