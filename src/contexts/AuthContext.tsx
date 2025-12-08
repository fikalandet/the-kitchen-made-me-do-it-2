import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: 'buyer' | 'seller' | 'admin' | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    role: 'buyer' | 'seller',
    name?: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session from Supabase:', error);
      }

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        fetchUserRole(session.user.id);
      }

      setLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user role:', error);
      return;
    }

    if (data) {
      setUserRole(data.role);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: 'buyer' | 'seller',
    name?: string
  ) => {
    console.log('SIGNUP: calling supabase.auth.signUp', { email, role });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log('SIGNUP RESPONSE:', { data, error });

    if (error) {
      console.error('SUPABASE SIGNUP ERROR (auth):', error);
      alert(error.message);
      throw error;
    }

    if (!data.user) {
      console.warn('SIGNUP: no user returned from Supabase.');
      return;
    }

    // Försök skapa profil – men låt inte detta krascha hela sign up-flödet
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      role,
      full_name: name || '',
      membership_level: 'free',
    });

    if (profileError) {
      console.error('Error inserting profile (user is still created in Auth):', profileError);
      // vi kastar INTE här – kontot finns i Supabase Auth redan
    } else {
      setUserRole(role);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('SUPABASE SIGNIN ERROR:', error);
      alert(error.message);
      throw error;
    }

    if (data?.session) {
      setSession(data.session);
      setUser(data.session.user);
      fetchUserRole(data.session.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('SUPABASE SIGNOUT ERROR:', error);
      throw error;
    }

    setUserRole(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user, userRole, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
