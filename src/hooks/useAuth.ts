import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import type { User } from '@jsr/supabase__supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * useAuth Hook
 * Provides current authenticated user from Supabase
 */
export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          setState({ user: null, loading: false, error: error.message });
        } else {
          setState({ user, loading: false, error: null });
        }
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    getUser();

    // Subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState({
        user: session?.user || null,
        loading: false,
        error: null,
      });
    });

    return () => {
      if (data?.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  return state;
};
