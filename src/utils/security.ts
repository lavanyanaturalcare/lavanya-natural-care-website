// =====================================================================
// ONZNATURAL — Web Application Security & Privacy Utilities
// Sanitization, Client Rate Limiting, Honeypot Check & DPDP Masking
// =====================================================================

/**
 * Strips dangerous HTML, control characters, and common XSS vectors from inputs.
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/\0/g, '') // remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip script tags
    .replace(/<[^>]+>/g, '') // strip any remaining HTML tags
    .replace(/javascript:/gi, '') // strip javascript: pseudo-protocol
    .replace(/on\w+=/gi, '') // strip inline event handlers like onclick=
    .trim();
};

/**
 * Validates email according to safe RFC 5322 regex standard.
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
};

/**
 * Validates Indian & international phone numbers (8 to 15 digits, allowing leading + or spaces).
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^\+?[0-9]{8,15}$/.test(cleaned);
};

/**
 * Validates password strength:
 * - Minimum 8 characters
 * - At least one letter (a-z or A-Z)
 * - At least one digit (0-9)
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }
  return { isValid: true };
};

interface RateLimitRecord {
  attempts: number[];
  lockedUntil?: number;
}

const RATE_LIMIT_PREFIX = 'onznatural_rl_';

/**
 * Checks if a specific action (e.g. 'login', 'signup', 'contact', 'forgot_password') is allowed.
 * Locks out if attempts within window exceed maxAttempts.
 */
export const checkRateLimit = (
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 60000,
  lockoutMs: number = 60000
): { allowed: boolean; remainingSeconds: number; attemptCount: number } => {
  const key = `${RATE_LIMIT_PREFIX}${action}`;
  const now = Date.now();

  try {
    const raw = sessionStorage.getItem(key);
    const record: RateLimitRecord = raw ? JSON.parse(raw) : { attempts: [] };

    // Check if currently locked
    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, remainingSeconds, attemptCount: record.attempts.length };
    }

    // Filter out expired attempts
    const validAttempts = record.attempts.filter(t => now - t < windowMs);

    if (validAttempts.length >= maxAttempts) {
      const lockedUntil = now + lockoutMs;
      sessionStorage.setItem(key, JSON.stringify({ attempts: validAttempts, lockedUntil }));
      const remainingSeconds = Math.ceil(lockoutMs / 1000);
      return { allowed: false, remainingSeconds, attemptCount: validAttempts.length };
    }

    return { allowed: true, remainingSeconds: 0, attemptCount: validAttempts.length };
  } catch (err) {
    // If storage is unavailable, fail open safely
    return { allowed: true, remainingSeconds: 0, attemptCount: 0 };
  }
};

/**
 * Records a failed attempt for rate-limiting.
 */
export const recordFailedAttempt = (
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 60000,
  lockoutMs: number = 60000
): { locked: boolean; remainingSeconds: number } => {
  const key = `${RATE_LIMIT_PREFIX}${action}`;
  const now = Date.now();

  try {
    const raw = sessionStorage.getItem(key);
    const record: RateLimitRecord = raw ? JSON.parse(raw) : { attempts: [] };
    const validAttempts = record.attempts.filter(t => now - t < windowMs);
    validAttempts.push(now);

    let lockedUntil = record.lockedUntil;
    let locked = false;
    let remainingSeconds = 0;

    if (validAttempts.length >= maxAttempts) {
      lockedUntil = now + lockoutMs;
      locked = true;
      remainingSeconds = Math.ceil(lockoutMs / 1000);
    }

    sessionStorage.setItem(key, JSON.stringify({ attempts: validAttempts, lockedUntil }));
    return { locked, remainingSeconds };
  } catch (err) {
    return { locked: false, remainingSeconds: 0 };
  }
};

/**
 * Resets rate limit counter upon successful action (e.g. valid sign in).
 */
export const resetRateLimit = (action: string): void => {
  try {
    sessionStorage.removeItem(`${RATE_LIMIT_PREFIX}${action}`);
  } catch (err) {}
};

/**
 * Honeypot bot detector. Returns true if bot detected (field is filled).
 */
export const isBotDetected = (honeypotValue: string | undefined | null): boolean => {
  return Boolean(honeypotValue && honeypotValue.trim().length > 0);
};

/**
 * Masks sensitive user data for privacy-compliant console logs (DPDP Act).
 */
export const maskSensitiveData = (text: string): string => {
  if (!text) return '';
  // Mask email
  text = text.replace(/([a-zA-Z0-9_\-\.]{2})[a-zA-Z0-9_\-\.]*@([a-zA-Z0-9_\-\.]+)/g, '$1***@$2');
  // Mask phone numbers (keep last 4 digits)
  text = text.replace(/(\+?[0-9]{2,4})([0-9]{3,6})([0-9]{4})/g, '$1******$3');
  return text;
};
