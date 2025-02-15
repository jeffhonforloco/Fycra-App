import { supabase } from './supabase';
import { validateEmail, validatePassword } from './security';
import { captureError } from './monitoring';
import toast from 'react-hot-toast';

export async function signUp(email: string, password: string) {
  try {
    // Validate input
    if (!validateEmail(email)) {
      throw new Error('Invalid email address');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    captureError(error as Error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    captureError(error as Error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success('Signed out successfully');
  } catch (error) {
    captureError(error as Error);
    toast.error('Failed to sign out');
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    if (!validateEmail(email)) {
      throw new Error('Invalid email address');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    toast.success('Password reset email sent');
  } catch (error) {
    captureError(error as Error);
    toast.error('Failed to send reset email');
    throw error;
  }
}

export async function updatePassword(password: string) {
  try {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error);
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
    toast.success('Password updated successfully');
  } catch (error) {
    captureError(error as Error);
    toast.error('Failed to update password');
    throw error;
  }
}