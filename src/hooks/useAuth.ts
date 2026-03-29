import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';

// Infer types from supabase client to avoid direct type imports
type User = NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>;
type Session = NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'coach' | 'player' | 'physiotherapist';
  identification?: string;
  assigned_categories?: string[];
  is_chief?: boolean;
  reports_to?: string;
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
      let assignedCategories: string[] | undefined;

      // If the user is a coach, fetch their assigned categories from the coaches table
      if (profile.role === 'coach') {
        try {
          const { data: coachData } = await supabase
            .from('coaches')
            .select('assigned_categories')
            .eq('id', authUserId)
            .maybeSingle();

          if (coachData?.assigned_categories && Array.isArray(coachData.assigned_categories)) {
            assignedCategories = coachData.assigned_categories;
          }
        } catch (err) {
          console.error('Error fetching coach categories:', err);
        }
      }

      let isChief = false;
      let reportsTo: string | undefined;

      if (profile.role === 'physiotherapist') {
        try {
          const { data: physioData } = await supabase
            .from('physiotherapists')
            .select('assigned_categories, is_chief, reports_to')
            .eq('id', authUserId)
            .maybeSingle();

          if (physioData) {
            assignedCategories = physioData.assigned_categories;
            isChief = physioData.is_chief || false;
            reportsTo = physioData.reports_to;
          }
        } catch (err) {
          console.error('Error fetching physio data:', err);
        }
      }

      return {
        id: authUserId,
        name: profile.name,
        email: profile.email,
        role: profile.role as 'admin' | 'coach' | 'player' | 'physiotherapist',
        identification: profile.identification,
        assigned_categories: assignedCategories,
        is_chief: isChief,
        reports_to: reportsTo,
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

  // Login - supports both email and identification (document/cedula)
  const login = useCallback(async (emailOrIdentification: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Determine if input is email or identification
      const isEmail = emailOrIdentification.includes('@');
      let loginEmail = emailOrIdentification;

      // If not email, try to find the user by identification first
      if (!isEmail) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('identification', emailOrIdentification)
          .maybeSingle();

        if (profileError || !profileData) {
          setState(prev => ({ ...prev, loading: false }));
          return { 
            success: false, 
            error: 'Usuario no encontrado. Verifica tu número de documento.' 
          };
        }

        loginEmail = profileData.email;
      }

      // Now perform auth login using email
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: loginEmail, 
        password 
      });

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }

      // Profile will be loaded by onAuthStateChange listener
      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
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
