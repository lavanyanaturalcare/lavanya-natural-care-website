import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { getLocalCustomers } from '../services/crmService';
import { SEO } from '../components/SEO';
import { ArrowRight, Lock, Mail, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { sanitizeInput, checkRateLimit, recordFailedAttempt, resetRateLimit, isBotDetected } from '../utils/security';

export const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Honeypot check
    if (isBotDetected(honeypot)) {
      setErrorMessage('Invalid submission request.');
      return;
    }

    // 2. Anti-Brute Force Rate Limiting
    const rl = checkRateLimit('customer_login', 5, 60000, 60000);
    if (!rl.allowed) {
      setErrorMessage(`Too many sign in attempts. For your account security, please wait ${rl.remainingSeconds} seconds.`);
      return;
    }

    const cleanEmail = sanitizeInput(email).toLowerCase();

    if (!cleanEmail || !password.trim()) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      setErrorMessage('Authentication service is currently offline. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        recordFailedAttempt('customer_login', 5, 60000, 60000);
        if (error.message.toLowerCase().includes('confirm') || error.message.toLowerCase().includes('rate')) {
          const localList = getLocalCustomers();
          const match = localList.find(c => c.email.toLowerCase() === cleanEmail);
          if (match) {
            resetRateLimit('customer_login');
            localStorage.setItem('onznatural_customer_session', JSON.stringify(match));
            navigate(from, { replace: true });
            return;
          }
        }
        setErrorMessage(error.message || 'Invalid email or password.');
      } else if (data.user) {
        resetRateLimit('customer_login');
        // Set local session for reliability
        const sessionPayload = {
          auth_user_id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || '',
          name: data.user.user_metadata?.full_name || '',
          phone: data.user.user_metadata?.phone || null,
          preferred_language: data.user.user_metadata?.preferred_language || 'en'
        };
        localStorage.setItem('onznatural_customer_session', JSON.stringify(sessionPayload));
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      recordFailedAttempt('customer_login', 5, 60000, 60000);
      setErrorMessage(err.message || 'Sign in encountered an unexpected issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <SEO
        title="Sign In | ONZNATURAL"
        description="Sign in to your ONZNATURAL customer account to view your past consultations, saved routines, and manage your botanical care profile."
        canonical="https://onznatural.com/login"
      />

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-900 mb-3 shadow-inner">
            <Lock className="w-5 h-5 text-primary-800" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-primary-950 font-medium">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-sand-700">
            Sign in to access your saved routines and consultations
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

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-2">
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-sand-800">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-800 hover:text-primary-950 hover:underline min-h-[44px] inline-flex items-center"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 px-4 min-h-[48px] rounded-xl text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-6 border-t border-sand-100 text-center">
            <p className="text-xs text-sand-700 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-600" />
              <span>We never sell your personal information or spam your inbox.</span>
            </p>
          </div>
        </div>

        {/* Create account prompt */}
        <p className="mt-6 text-center text-sm text-sand-800">
          New to ONZNATURAL?{' '}
          <Link to="/register" className="font-medium text-primary-900 hover:underline">
            Create an account
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-sand-600 hover:text-sand-900 hover:underline">
            ← Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
