/**
 * supabase.js
 * Initialises and exports the Supabase client for Net Gains.
 *
 * NOTE: This project has no bundler, so we import from the ESM CDN build
 * rather than the npm package. The anon key is intentionally public —
 * all data access is secured by Row Level Security policies on the database.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL     = 'https://vbyaqrockpztxslsjfvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieWFxcm9ja3B6dHhzbHNqZnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzI0MTAsImV4cCI6MjA4Nzk0ODQxMH0.beRmy8iWeTkpoS3o75f6511OWuuVq98KMoedMPA1z2c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Initiates Google SSO login.
 */
export async function signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Redirect back to the current URL
            redirectTo: window.location.origin + window.location.pathname
        }
    });
}

/**
 * Signs the user out.
 */
export async function signOut() {
    return supabase.auth.signOut();
}

/**
 * Gets the current active session.
 */
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error("Error getting session:", error);
    return session;
}

/**
 * Listens for auth state changes (sign in, sign out).
 */
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
}

/**
 * Ensures the user has a row in the public.users table.
 * Called after successful login.
 */
export async function ensureUserProfile(session) {
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
