import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase, UserProfile, ensureUserProfile } from '../../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  guestMode: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Maximum time to wait for auth before forcing loading to false
const AUTH_TIMEOUT_MS = 5000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadingResolved = useRef(false);

  const resolveLoading = () => {
    if (!loadingResolved.current) {
      loadingResolved.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clean up stale URL hash fragments that can cause Supabase to hang.
    // After a failed/cancelled Google OAuth, the URL may have a bare '#' 
    // or '#error=...' that prevents getSession() from resolving.
    const hash = window.location.hash;
    if (hash && !hash.includes('access_token')) {
      // Remove the stale hash without triggering a navigation
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Safety timeout: if auth never resolves, force the app to show login
    const timeout = setTimeout(() => {
      if (!loadingResolved.current) {
        console.warn('Auth check timed out after', AUTH_TIMEOUT_MS, 'ms — showing login screen');
        resolveLoading();
      }
    }, AUTH_TIMEOUT_MS);

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        if (session) {
          const userProfile = await ensureUserProfile(session);
          if (userProfile) {
            setUser(userProfile);
          } else {
            setUser({
              auth_id: session.user.id,
              email: session.user.email || '',
              username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              avatar_url: session.user.user_metadata?.avatar_url || '',
            });
          }
          resolveLoading();
          return;
        }
      } catch (err) {
        console.error("Failed to check session:", err);
      }

      // No session — check guest mode
      const isGuest = localStorage.getItem('net_gains_guest_mode') === 'true';
      setGuestMode(isGuest);

      if (isGuest) {
        setUser({
          auth_id: 'guest',
          email: 'guest@example.com',
          username: 'Guest User',
          coins: 100,
          gems: 10,
          login_streak: 1,
        });
      }
      resolveLoading();
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userProfile = await ensureUserProfile(session);
        if (userProfile) {
          setUser(userProfile);
        } else {
          setUser({
            auth_id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            avatar_url: session.user.user_metadata?.avatar_url || '',
          });
        }
        setGuestMode(false);
        localStorage.removeItem('net_gains_guest_mode');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setGuestMode(false);
        localStorage.removeItem('net_gains_guest_mode');
        localStorage.removeItem('net_gains_gamification');
        localStorage.removeItem('net_gains_tasks');
      }
      resolveLoading();
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        console.error("Google sign-in error:", error);
        alert("Sign in failed. Please try again.");
      }
    } catch (err) {
      console.error("Google sign-in exception:", err);
      alert("Sign in failed. Please check your connection and try again.");
    }
  };

  const signInAsGuest = () => {
    localStorage.setItem('net_gains_guest_mode', 'true');
    setGuestMode(true);
    setUser({
      auth_id: 'guest',
      email: 'guest@example.com',
      username: 'Guest User',
      coins: 100,
      gems: 10,
      login_streak: 1,
    });
  };

  const signOut = async () => {
    if (guestMode) {
      setGuestMode(false);
      setUser(null);
      localStorage.removeItem('net_gains_guest_mode');
      localStorage.removeItem('net_gains_gamification');
      localStorage.removeItem('net_gains_tasks');
    } else {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, guestMode, loading, signInWithGoogle, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
