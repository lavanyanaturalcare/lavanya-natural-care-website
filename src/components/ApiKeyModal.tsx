import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey, hasGeminiApiKey } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEnvKey, setIsEnvKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getGeminiApiKey();
      const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      setIsEnvKey(Boolean(envKey && envKey.trim() !== '' && !envKey.includes('your_gemini')));
      setApiKey(current);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(apiKey.trim());
    setSavedSuccess(true);
    if (onKeySaved) onKeySaved();
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setGeminiApiKey('');
    setApiKey('');
    setSavedSuccess(false);
    if (onKeySaved) onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-botanical-950/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-cream-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative background circle */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gold-400/10 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-warmgray-400 hover:text-warmgray-700 p-1.5 rounded-full hover:bg-cream-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-botanical-100 flex items-center justify-center text-botanical-800 shrink-0">
            <Key className="w-5 h-5 text-botanical-700" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-botanical-950">
              Gemini API Settings
            </h2>
            <p className="text-xs text-warmgray-500">
              Power Lavanya Skincare AI with Google Gemini
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-warmgray-600 leading-relaxed mb-5">
          Enter your free Google Gemini API key to enable live AI routine consultations, real-time skincare chat, and multimodal photo analysis.
        </p>

        {isEnvKey && (
          <div className="mb-4 p-3 rounded-xl bg-botanical-50 border border-botanical-200 text-xs text-botanical-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-botanical-700 shrink-0" />
            <span>Active key detected from environment file (<code>.env</code>).</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="gemini-key-input" className="block text-xs font-semibold uppercase tracking-wider text-warmgray-700 mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                id="gemini-key-input"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-botanical-800/20 focus:border-botanical-800 text-sm font-mono transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-botanical-800 hover:text-gold-700 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>Get a free key on Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2.5 rounded-xl border border-cream-300 text-xs font-semibold text-warmgray-600 hover:bg-cream-100 transition-colors"
                >
                  Clear Key
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-botanical-800 text-white text-xs font-bold hover:bg-botanical-900 transition-all shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-gold-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                    <span>Save Key</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-cream-100 flex items-center justify-between text-[11px] text-warmgray-500">
          <span>🔒 Stored only in your local browser</span>
          <span className="font-semibold text-botanical-800">Model: Gemini 2.5 Flash</span>
        </div>
      </div>
    </div>
  );
};
