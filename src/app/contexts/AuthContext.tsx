import { createContext, useContext, useEffect, useState } from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        const userProfile = await ensureUserProfile(session);
        setUser(userProfile);
      } else {
        // Check guest mode
        const isGuest = localStorage.getItem('net_gains_guest_mode') === 'true';
        setGuestMode(isGuest);
        
        if (isGuest) {
          // Setup guest profile
          setUser({
            auth_id: 'guest',
            name: 'Guest User',
            email: 'guest@example.com',
            coins: 100,
            gems: 10,
            login_streak: 1
          });
        }
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userProfile = await ensureUserProfile(session);
        setUser(userProfile);
        setGuestMode(false);
        localStorage.removeItem('net_gains_guest_mode');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setGuestMode(false);
        localStorage.removeItem('net_gains_guest_mode');
        // Clear local storage data on sign out
        localStorage.removeItem('net_gains_gamification');
        localStorage.removeItem('net_gains_tasks');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const signInAsGuest = () => {
    localStorage.setItem('net_gains_guest_mode', 'true');
    setGuestMode(true);
    setUser({
      auth_id: 'guest',
      name: 'Guest User',
      email: 'guest@example.com',
      coins: 100,
      gems: 10,
      login_streak: 1
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
