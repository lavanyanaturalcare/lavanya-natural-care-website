import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { SEO } from '../components/SEO';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      setErrorMessage('Reset service is currently offline. Please contact care@onznatural.com.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/account`
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <SEO
        title="Reset Password | ONZNATURAL"
        description="Reset your ONZNATURAL account password to regain access to your saved botanical skincare recommendations."
        canonical="https://onznatural.com/forgot-password"
      />

      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="font-serif text-3xl font-bold tracking-widest text-primary-900 block">
              ONZNATURAL
            </span>
            <span className="text-xs uppercase tracking-widest text-sand-700 block mt-1">
              Handcrafted Botanical Care • Vadodara
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-serif text-primary-950 font-medium">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-sand-800">
            Enter your email and we'll send a secure link to reset your password
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-sand-200 p-8">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-primary-100 text-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-serif font-medium text-primary-950 mb-2">
                Check Your Email
              </h2>
              <p className="text-sm text-sand-800 mb-6 leading-relaxed">
                If an account exists for <strong className="text-primary-950">{email}</strong>, you will receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary-900 text-white text-sm font-medium hover:bg-primary-950"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-2">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent text-sm bg-sand-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-primary-900 hover:bg-primary-950 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending reset link...</span>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-sand-700 hover:text-primary-900 hover:underline">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
