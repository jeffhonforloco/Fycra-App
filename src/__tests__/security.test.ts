import { describe, it, expect } from 'vitest';
import { 
  validateFileUpload,
  validateUrl,
  validateUsername,
  sanitizeInput
} from '../lib/security';

describe('Security Utilities', () => {
  describe('File Upload Validation', () => {
    it('should validate safe files', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      expect(validateFileUpload(file).valid).toBe(true);
    });

    it('should reject dangerous files', () => {
      const file = new File(['test'], 'test.php', { type: 'application/x-httpd-php' });
      expect(validateFileUpload(file).valid).toBe(false);
    });
  });

  describe('URL Validation', () => {
    it('should validate safe URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('https://sub.example.com/path')).toBe(true);
    });

    it('should reject dangerous URLs', () => {
      expect(validateUrl('javascript:alert(1)')).toBe(false);
      expect(validateUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    });
  });

  describe('Username Validation', () => {
    it('should validate proper usernames', () => {
      expect(validateUsername('john_doe').valid).toBe(true);
      expect(validateUsername('jane123').valid).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(validateUsername('admin').valid).toBe(false);
      expect(validateUsername('a').valid).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize dangerous input', () => {
      const input = '<script>alert("xss")</script>';
      expect(sanitizeInput(input)).not.toContain('<script>');
    });

    it('should preserve safe input', () => {
      const input = 'Hello, World!';
      expect(sanitizeInput(input)).toBe(input);
    });
  });
});