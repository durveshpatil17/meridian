import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Auto-seed on login if it's a new user
      if (session?.user && _event === 'SIGNED_IN') {
        const { data, error } = await supabase.from('courses').select('id').eq('user_id', session.user.id).limit(1);
        if (!error && (!data || data.length === 0)) {
          // No courses found, run seed function
          await supabase.rpc('create_seed_data', { p_user_id: session.user.id });
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUp = (email, password) => supabase.auth.signUp({ email, password });
  const signOut = () => supabase.auth.signOut();
  const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, signInWithGoogle, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
