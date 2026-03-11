import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vbyaqrockpztxslsjfvn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieWFxcm9ja3B6dHhzbHNqZnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzI0MTAsImV4cCI6MjA4Nzk0ODQxMH0.beRmy8iWeTkpoS3o75f6511OWuuVq98KMoedMPA1z2c';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Define User profile type mapping to the existing DB structure
export interface UserProfile {
  id?: number;
  auth_id: string;
  name: string;
  email: string;
  coins?: number;
  gems?: number;
  login_streak?: number;
  last_login?: string;
  created_at?: string;
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
 */
export async function ensureUserProfile(session: any): Promise<UserProfile | null> {
  if (!session || !session.user) return null;

  // Check if user exists
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', session.user.id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Error fetching user profile:", fetchError);
    return null;
  }

  if (user) {
    return user; // User exists
  }

  // Create new user record
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{
      auth_id: session.user.id,
      name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email
    }])
    .select()
    .single();

  if (insertError) {
    console.error("Error creating user profile:", insertError);
    return null;
  }

  return newUser;
}
