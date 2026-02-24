import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';

// Infer types from supabase client to avoid direct type imports
type User = NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>;
type Session = NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'coach' | 'player';
  identification?: string;
  assigned_categories?: string[];
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch the user profile from coaches, admins, or players tables
 * by matching the auth user's email.
 */
/**
 * Fetch the user profile from coaches, admins, or players tables.
 * Prioritizes auth_user_id linking, then falls back to email matching.
 */
/**
 * Fetch the user profile from the unified profiles table.
 */
async function fetchUserProfile(user: User): Promise<UserProfile | null> {
  const authUserId = user.id;


  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (error) throw error;

    if (profile) {
      return {
        id: authUserId,
        name: profile.name,
        email: profile.email,
        role: profile.role as 'admin' | 'coach' | 'player',
        identification: profile.identification
      };
    }
  } catch (err) {
  }

  // Si no hay perfil, NO asignamos un rol por defecto. 
  // Retornamos null para que el sistema sepa que es un usuario sin perfil configurado.
  return null;
}


/**
 * useAuth Hook — Supabase Auth nativo
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  // Combined Auth Initialization & Listener
  useEffect(() => {
    let mounted = true;
    let initialLoadDone = false;

    const handleSession = async (session: Session | null) => {
      if (!mounted) return;

      if (!session?.user) {
        setState({ user: null, profile: null, session: null, loading: false, error: null });
        return;
      }

      try {
        // Fetch profile
        const profile = await fetchUserProfile(session.user);

        if (mounted) {
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (mounted) {
          setState(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Error al procesar sesión' }));
        }
      }
    };

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!initialLoadDone) {
        handleSession(session);
        initialLoadDone = true;
      } else {
      }
    }).catch(err => {
      if (mounted) {
        setState(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Error al obtener sesión inicial' }));
      }
    });

    // 2. Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {

      // If we already handled the initial session via getSession, 
      // we only care about real changes or if getSession hasn't finished yet.
      if (initialLoadDone || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        handleSession(session);
        initialLoadDone = true; // Ensure initial load is marked as done after any event
      } else {
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { success: false, error: error.message };
    }

    // Profile will be loaded by onAuthStateChange listener
    return { success: true, error: null };
  }, []);

  // Logout
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error);
    }
    setState({ user: null, profile: null, session: null, loading: false, error: null });
  }, []);

  return {
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    isAuthenticated: !!state.session,
  };
}
