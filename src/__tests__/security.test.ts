import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  validateEmail,
  validatePhone,
  validatePassword,
  isBotDetected,
  maskSensitiveData
} from '../utils/security';

describe('Security Utilities', () => {
  it('sanitizes XSS script tags, HTML tags, and event handlers', () => {
    expect(sanitizeInput('<script>alert(1)</script>Hello')).toBe('Hello');
    expect(sanitizeInput('<b>Bold</b> text')).toBe('Bold text');
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    expect(sanitizeInput('test onclick=evil()')).toBe('test evil()');
  });

  it('validates emails and phone numbers accurately', () => {
    expect(validateEmail('care@onznatural.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validatePhone('+91 97267 39515')).toBe(true);
    expect(validatePhone('123')).toBe(false);
  });

  it('enforces strong password rules (min 8 chars, letter + number)', () => {
    expect(validatePassword('short1').isValid).toBe(false);
    expect(validatePassword('onlyletters').isValid).toBe(false);
    expect(validatePassword('12345678').isValid).toBe(false);
    expect(validatePassword('Botanical99').isValid).toBe(true);
  });

  it('detects filled honeypot fields as bots', () => {
    expect(isBotDetected('')).toBe(false);
    expect(isBotDetected('   ')).toBe(false);
    expect(isBotDetected('spam-bot-value')).toBe(true);
  });

  it('masks sensitive emails and phone numbers for logs', () => {
    const masked = maskSensitiveData('Customer radhika.sharma@example.com called +919825012345');
    expect(masked).not.toContain('radhika.sharma@example.com');
    expect(masked).not.toContain('9825012345');
    expect(masked).toContain('ra***@example.com');
  });
});
