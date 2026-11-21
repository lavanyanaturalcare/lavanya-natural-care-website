import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { registerCustomer, recordConsent } from '../services/crmService';
import { PreferredLanguage } from '../types/crm';
import { SEO } from '../components/SEO';
import { ArrowRight, Lock, Mail, User, Phone, Globe, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { sanitizeInput, validateEmail, validatePhone, validatePassword, checkRateLimit, recordFailedAttempt, resetRateLimit, isBotDetected } from '../utils/security';

export const SignUp: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<PreferredLanguage>('en');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [consentStorage, setConsentStorage] = useState(false); // DPDP Act: Unchecked by default
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Honeypot check
    if (isBotDetected(honeypot)) {
      setErrorMessage('Invalid submission request.');
      return;
    }

    // 2. Rate limit registration attempts (max 4 per 5 minutes)
    const rl = checkRateLimit('customer_signup', 4, 300000, 300000);
    if (!rl.allowed) {
      setErrorMessage(`Registration rate limit reached. Please wait ${rl.remainingSeconds} seconds.`);
      return;
    }

    const cleanName = sanitizeInput(fullName);
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanPhone = sanitizeInput(phone);

    if (!cleanName || !cleanEmail || !password) {
      setErrorMessage('Please provide your name, email, and a secure password.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (cleanPhone && !validatePhone(cleanPhone)) {
      setErrorMessage('Please enter a valid contact phone number.');
      return;
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.isValid) {
      setErrorMessage(pwCheck.message || 'Password must be at least 8 characters with letters and numbers.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!consentStorage) {
      setErrorMessage('Please accept the privacy consent to create your account per the DPDP Act.');
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      setErrorMessage('Registration service is currently offline. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      let authUserId: string | null = null;

      // 1. Sign up auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone || null,
            preferred_language: preferredLanguage
          }
        }
      });

      if (authError) {
        recordFailedAttempt('customer_signup', 4, 300000, 300000);
        const msg = authError.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('user already exists')) {
          setErrorMessage('An account with this email address already exists. Please sign in instead.');
          setLoading(false);
          return;
        }
        console.warn('Supabase Auth notice during signup:', authError.message);
      } else if (authData?.user) {
        authUserId = authData.user.id;
      }

      resetRateLimit('customer_signup');

      // 2. Register profile in customers table & local session
      const registered = await registerCustomer({
        name: cleanName,
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || null,
        preferred_language: preferredLanguage,
        status: 'active',
        auth_user_id: authUserId
      });

      // 3. Record consent
      if (consentStorage) {
        try {
          await recordConsent('ai_chat_storage', true, registered.id);
        } catch (cErr) {}
      }

      navigate('/account');
    } catch (err: any) {
      recordFailedAttempt('customer_signup', 4, 300000, 300000);
      setErrorMessage(err.message || 'An unexpected error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <SEO
        title="Create an Account | ONZNATURAL"
        description="Create your ONZNATURAL account for personalized botanical skincare routines, consultation records, and handcrafted orders dispatched from Vadodara."
        canonical="https://onznatural.com/register"
      />

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-900 mb-3 shadow-inner">
            <User className="w-5 h-5 text-primary-800" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-primary-950 font-medium">
            Create Your Account
          </h1>
          <p className="mt-1 text-sm text-sand-700">
            Save consultations, routines, and track artisan orders
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field for bot suppression */}
            <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input
                type="text"
                name="_bot_honey"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent text-sm bg-sand-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent text-sm bg-sand-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sand-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98250..."
                    className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent text-sm bg-sand-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                  Preferred Language
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sand-500" />
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as PreferredLanguage)}
                    className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent text-sm bg-sand-50/50"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="gu">ગુજરાતી (Gujarati)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-11 py-2.5 min-h-[44px] rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent text-sm bg-sand-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sand-500 hover:text-primary-950 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full pl-10 pr-11 py-2.5 min-h-[44px] rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent text-sm bg-sand-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sand-500 hover:text-primary-950 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Privacy Consent */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentStorage}
                  onChange={(e) => setConsentStorage(e.target.checked)}
                  className="mt-1 rounded text-primary-900 focus:ring-accent-600 h-4 w-4 border-sand-300"
                />
                <span className="text-xs text-sand-700 leading-relaxed">
                  I agree to securely save my personalized Ayurvedic consultations and routine recommendations. You can withdraw consent or request complete data erasure anytime.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 px-4 min-h-[48px] rounded-xl text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-6 border-t border-sand-100 flex items-center justify-center gap-2 text-xs text-sand-700">
            <ShieldCheck className="w-4 h-4 text-accent-700 flex-shrink-0" />
            <span>Strict privacy: Protected by PostgreSQL Row Level Security.</span>
          </div>
        </div>

        {/* Existing account prompt */}
        <p className="mt-6 text-center text-sm text-sand-800">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-900 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
