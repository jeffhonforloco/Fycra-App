import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '@/lib/supabase';
import { handleError } from '@/lib/monitoring/errors';
import toast from 'react-hot-toast';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (err) {
      const errorDetails = handleError(err as Error);
      setError(new Error(errorDetails.message));
      toast.error(errorDetails.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;
      setUser({ ...user, ...data });
      toast.success('Profile updated successfully');
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
      throw err;
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    await fetchUser(user.id);
  };

  return (
    <UserContext.Provider value={{ user, loading, error, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}