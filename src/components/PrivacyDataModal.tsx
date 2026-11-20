import React, { useState } from 'react';
import { Shield, Trash2, X, CheckCircle2, AlertTriangle, ArrowRight, Lock } from 'lucide-react';
import { revokeAllConsents, submitDataDeletionRequest } from '../services/crmService';

interface PrivacyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyDataModal: React.FC<PrivacyDataModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'consents' | 'deletion'>('consents');
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokedSuccess, setRevokedSuccess] = useState(false);

  // Deletion Request Form
  const [contactInput, setContactInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRevoke = async () => {
    setIsRevoking(true);
    await revokeAllConsents();
    setIsRevoking(false);
    setRevokedSuccess(true);
    setTimeout(() => {
      setRevokedSuccess(false);
    }, 4000);
  };

  const handleSubmitDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;
    setIsSubmitting(true);
    await submitDataDeletionRequest(contactInput.trim(), reasonInput.trim() || undefined);
    setIsSubmitting(false);
    setDeletionSuccess(true);
    setContactInput('');
    setReasonInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-sand-200 overflow-hidden relative">
        {/* Header */}
        <div className="bg-primary-950 text-sand-50 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-900 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg">Customer Data Privacy &amp; Controls</h3>
              <p className="text-[11px] text-sand-300">ONZNATURAL • Vadodara, Gujarat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-primary-900 flex items-center justify-center text-sand-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-sand-200 bg-sand-50/50">
          <button
            onClick={() => setActiveTab('consents')}
            className={`flex-1 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'consents'
                ? 'border-primary-900 text-primary-950 font-bold bg-white'
                : 'border-transparent text-sand-600 hover:text-primary-950'
            }`}
          >
            Manage Consents
          </button>
          <button
            onClick={() => setActiveTab('deletion')}
            className={`flex-1 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'deletion'
                ? 'border-primary-900 text-primary-950 font-bold bg-white'
                : 'border-transparent text-sand-600 hover:text-primary-950'
            }`}
          >
            Right to Erasure (Forget Me)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {activeTab === 'consents' && (
            <div className="space-y-4 text-xs sm:text-sm text-sand-800">
              <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200 space-y-2">
                <div className="flex items-center gap-2 text-primary-950 font-semibold">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>How ONZNATURAL Protects Your Data</span>
                </div>
                <p className="text-xs text-sand-700 leading-relaxed">
                  We collect minimal information only to provide tailored botanical skincare consultations. Your conversations are never sold, never shared, and never used to train public generative AI models.
                </p>
              </div>

              <div className="border border-sand-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-primary-950 text-xs sm:text-sm">AI Skincare History Storage</h5>
                    <p className="text-xs text-sand-600 mt-0.5">
                      Saves your routine in secure database tables governed by 90-day retention.
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>

                {revokedSuccess ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>All consent preferences have been revoked. Future sessions will run as anonymous guest.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRevoke}
                    disabled={isRevoking}
                    className="w-full py-2.5 px-3 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-semibold text-xs transition-colors flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isRevoking ? 'Revoking...' : 'Revoke All Consents & Switch to Guest'}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'deletion' && (
            <div className="space-y-4">
              <div className="bg-accent-50/60 p-4 rounded-2xl border border-accent-200 flex items-start gap-2.5 text-xs text-primary-950">
                <AlertTriangle className="w-4 h-4 text-accent-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Under India's Digital Personal Data Protection (DPDP) Act and international privacy standards, you have the right to request permanent deletion of your customer record and consultation messages.
                </p>
              </div>

              {deletionSuccess ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-950 text-sm">Deletion Request Received</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Our compliance administrator will review and purge any matching records from the database within 48 hours according to our retention protocol.
                  </p>
                  <button
                    onClick={() => setDeletionSuccess(false)}
                    className="mt-2 text-xs text-emerald-700 underline font-semibold"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitDeletion} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary-950 mb-1">
                      Email Address or WhatsApp Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactInput}
                      onChange={e => setContactInput(e.target.value)}
                      placeholder="e.g. yourname@gmail.com or +91 98250 00000"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 bg-sand-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary-950 mb-1">
                      Reason for Deletion (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={reasonInput}
                      onChange={e => setReasonInput(e.target.value)}
                      placeholder="e.g. Right to be forgotten, no longer using the service"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 bg-sand-50/50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !contactInput.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary-900 text-white font-semibold text-xs sm:text-sm hover:bg-primary-950 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <span>Submit Deletion Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-sand-50 px-6 py-3 border-t border-sand-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-primary-950 hover:bg-sand-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
