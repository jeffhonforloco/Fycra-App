import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SignUpData, SignInData, ResetPasswordData, UpdatePasswordData, AuthResponse } from '../types';
import { handleError } from '@/lib/monitoring/errors';
import { validateEmail, validatePassword } from '@/lib/security';
import toast from 'react-hot-toast';

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const signUp = async (data: SignUpData): Promise<AuthResponse> => {
    try {
      setLoading(true);

      if (!validateEmail(data.email)) {
        throw new Error('Invalid email address');
      }

      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.error);
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName
          }
        }
      });

      if (error) throw error;

      return {
        user: authData.user,
        session: authData.session
      };
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
      return { user: null, session: null, error: errorDetails };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: SignInData): Promise<AuthResponse> => {
    try {
      setLoading(true);

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) throw error;

      return {
        user: authData.user,
        session: authData.session
      };
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
      return { user: null, session: null, error: errorDetails };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData): Promise<void> => {
    try {
      setLoading(true);

      if (!validateEmail(data.email)) {
        throw new Error('Invalid email address');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(data.email);
      if (error) throw error;
      toast.success('Password reset email sent');
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (data: UpdatePasswordData): Promise<void> => {
    try {
      setLoading(true);

      const passwordValidation = validatePassword(data.newPassword);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.error);
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;
      toast.success('Password updated successfully');
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  };
}