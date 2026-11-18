import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Sparkles, X, Send, Leaf, ArrowRight, RefreshCw, Key, ExternalLink } from 'lucide-react';
import { askLavanyaAI, hasGeminiApiKey } from '../services/geminiService';
import { productsData } from '../data/products';
import { ApiKeyModal } from './ApiKeyModal';

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'model'; text: string; recommendedProductIds?: string[] }[]>([
    {
      id: 'init',
      role: 'model',
      text: 'Namaste! 👋 I can help you choose the right cold-process soap for your skin type, or answer any botanical ingredient questions.',
      recommendedProductIds: ['kesuda-soap', 'neem-tulsi-soap']
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // If on the full /ai-consultant page, don't show the floating widget to avoid duplicate chat
  const isFullConsultantPage = location.pathname === '/ai-consultant';

  // Listen to custom window events for opening the widget with preloaded product question
  useEffect(() => {
    const handleOpenWidget = (e: any) => {
      setIsOpen(true);
      if (e.detail?.initialPrompt) {
        handleSend(e.detail.initialPrompt);
      }
    };
    window.addEventListener('open-lavanya-ai-assistant', handleOpenWidget);
    return () => window.removeEventListener('open-lavanya-ai-assistant', handleOpenWidget);
  }, []);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (isFullConsultantPage) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      text: textToSend.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await askLavanyaAI(userMsg.text, history);

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model' as const,
          text: response.text,
          recommendedProductIds: response.recommendedProductIds
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model' as const,
          text: `⚠️ Error: ${err.message || 'Please check your connection.'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-24 right-4 sm:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-botanical-900 text-white font-bold text-xs shadow-xl hover:shadow-2xl hover:bg-botanical-950 transition-all border border-gold-500/30 group hover:scale-105 active:scale-95"
            aria-label="Open Lavanya Botanical AI Skincare Assistant"
          >
            <div className="w-6 h-6 rounded-full bg-gold-400 text-botanical-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="tracking-wide">Ask Lavanya AI</span>
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-cream-300 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-botanical-950 via-botanical-900 to-botanical-950 text-cream-50 p-4 flex items-center justify-between border-b border-gold-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gold-400 text-botanical-950 flex items-center justify-center font-bold shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold leading-tight">Lavanya Skincare AI</h4>
                <span className="text-[10px] text-cream-200">Powered by Google Gemini</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-cream-200 transition-colors"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick link banner to Full AI Diagnostic */}
          <Link
            to="/ai-consultant"
            onClick={() => setIsOpen(false)}
            className="bg-cream-100 hover:bg-cream-200 px-3.5 py-1.5 text-xs text-botanical-950 font-semibold flex items-center justify-between border-b border-cream-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span>Take Full Prakriti & Skincare Quiz</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-botanical-700" />
          </Link>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-cream-50/40 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 max-w-[88%] ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-botanical-800 text-white rounded-tr-none'
                      : 'bg-white border border-cream-200 text-warmgray-900 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {m.recommendedProductIds && m.recommendedProductIds.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-cream-100 space-y-1">
                      <span className="text-[10px] font-bold text-gold-700 uppercase tracking-wider block">
                        Matching Soaps:
                      </span>
                      <div className="flex flex-col gap-1">
                        {m.recommendedProductIds.map((pid) => {
                          const p = productsData.find(prod => prod.id === pid);
                          if (!p) return null;
                          return (
                            <Link
                              key={pid}
                              to={`/products/${pid}`}
                              onClick={() => setIsOpen(false)}
                              className="p-1.5 rounded-lg bg-cream-50 hover:bg-gold-50 border border-cream-200 font-semibold text-botanical-950 flex items-center justify-between"
                            >
                              <span>{p.name} (₹{p.mrp})</span>
                              <ArrowRight className="w-3 h-3 text-gold-600" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-[11px] text-warmgray-500 mr-auto p-2 bg-white rounded-xl border border-cream-200">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-botanical-800" />
                <span>Consulting Ayurvedic formulas...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Prompt pills */}
          <div className="px-3 py-2 bg-white border-t border-cream-100 overflow-x-auto whitespace-nowrap flex gap-1.5">
            {[
              'Soaps for summer heat rash',
              'Cold process vs commercial soap',
              'Tan removal routine',
              'Neem Tulsi soap benefits'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-full bg-cream-100 hover:bg-cream-200 text-[11px] text-warmgray-700 border border-cream-200 shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-cream-200 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a skincare question..."
              className="flex-1 px-3 py-2 rounded-xl border border-cream-300 text-xs focus:outline-none focus:border-botanical-800"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-botanical-800 text-white hover:bg-botanical-900 transition-colors disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />
    </>
  );
};
