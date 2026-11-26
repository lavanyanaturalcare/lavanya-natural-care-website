import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-sand-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-950 font-serif font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Server-Side AI Security</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-sand-100 text-sand-700"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs sm:text-sm text-sand-700 leading-relaxed">
          ONZNATURAL Botanical AI runs exclusively through secure server-side Supabase Edge Functions. No Gemini API credentials are stored or exposed in your browser.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="btn-primary w-full py-2.5 rounded-xl text-white text-xs font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
};
