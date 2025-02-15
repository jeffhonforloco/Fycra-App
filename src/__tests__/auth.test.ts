import { describe, it, expect, vi } from 'vitest';
import { validateEmail, validatePassword } from '../lib/security';
import { signIn, signUp } from '../lib/auth';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn()
    }
  }
}));

describe('Authentication', () => {
  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('StrongP@ssw0rd').valid).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('weak').valid).toBe(false);
      expect(validatePassword('password123').valid).toBe(false);
    });
  });

  describe('Sign In', () => {
    it('should sign in successfully', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockUser, session: null },
        error: null
      });

      const result = await signIn('test@example.com', 'password123');
      expect(result.user).toEqual(mockUser);
    });

    it('should handle sign in errors', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new Error('Invalid credentials')
      });

      await expect(signIn('test@example.com', 'wrong')).rejects.toThrow();
    });
  });
});