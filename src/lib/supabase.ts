import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vbyaqrockpztxslsjfvn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieWFxcm9ja3B6dHhzbHNqZnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzI0MTAsImV4cCI6MjA4Nzk0ODQxMH0.beRmy8iWeTkpoS3o75f6511OWuuVq98KMoedMPA1z2c';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * UserProfile maps to the actual Supabase `users` table schema:
 *   id         UUID (PK, DB row ID — used as FK in coin_ledger, user_progress, etc.)
 *   auth_id    UUID (from Supabase Auth, matches auth.uid())
 *   email      TEXT
 *   username   TEXT
 *   avatar_url TEXT
 *   created_at TIMESTAMPTZ
 *
 * NOTE: coins, gems, login_streak are NOT in the DB.
 * They are computed client-side or stored in localStorage.
 */
export interface UserProfile {
  id?: string;         // UUID — the DB row PK, used as FK in other tables
  auth_id: string;     // UUID from Supabase Auth
  email: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
  // Client-side only (not in DB)
  coins?: number;
  gems?: number;
  login_streak?: number;
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Ensures the user has a row in the public.users table.
 * Called after successful login.
 *
 * The `users` table columns are: id, auth_id, email, username, avatar_url, created_at
 */
export async function ensureUserProfile(session: any): Promise<UserProfile | null> {
  if (!session || !session.user) return null;

  try {
    // Check if user exists
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();

    if (user) {
      return {
        id: user.id,
        auth_id: user.auth_id,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      };
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching user profile:", fetchError);
      // Don't return null yet — try to create
    }

    // Create new user record using the correct column names
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{
        auth_id: session.user.id,
        email: session.user.email || '',
        username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
        avatar_url: session.user.user_metadata?.avatar_url || '',
      }])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating user profile:", insertError);
      return null;
    }

    return {
      id: newUser.id,
      auth_id: newUser.auth_id,
      email: newUser.email,
      username: newUser.username,
      avatar_url: newUser.avatar_url,
      created_at: newUser.created_at,
    };
  } catch (err) {
    console.error("ensureUserProfile exception:", err);
    return null;
  }
}
