import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Sparkles, X, Send, ArrowRight, RefreshCw } from 'lucide-react';
import { askOnzAI } from '../services/geminiService';
import { productsData } from '../data/products';

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'model'; text: string; recommendedProductIds?: string[] }[]>([
    {
      id: 'init',
      role: 'model',
      text: 'Namaste! 👋 I am your ONZNATURAL Botanical Skincare Consultant. I can help you find the right handcrafted cold-process soap, body lotion, or herbal routine for your skin.',
      recommendedProductIds: ['kesuda-palash-soap', 'neem-tulsi-soap']
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isFullConsultantPage = location.pathname === '/ai-consultant';

  useEffect(() => {
    const handleOpenWidget = (e: any) => {
      setIsOpen(true);
      if (e.detail?.initialPrompt) {
        handleSend(e.detail.initialPrompt);
      }
    };
    window.addEventListener('open-onz-ai-assistant', handleOpenWidget);
    window.addEventListener('open-lavanya-ai-assistant', handleOpenWidget);
    return () => {
      window.removeEventListener('open-onz-ai-assistant', handleOpenWidget);
      window.removeEventListener('open-lavanya-ai-assistant', handleOpenWidget);
    };
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
      const response = await askOnzAI(userMsg.text, history);

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
      <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="btn-primary flex items-center justify-center gap-2 p-2.5 sm:px-4 sm:py-3 rounded-full text-white font-bold text-xs shadow-xl hover:shadow-2xl transition-all border border-accent-500/30 group hover:scale-105 active:scale-95 min-w-[44px] min-h-[44px]"
            aria-label="Open ONZNATURAL Botanical AI Skincare Assistant"
            title="Ask ONZNATURAL Botanical AI"
          >
            <div className="w-6 h-6 rounded-full bg-accent-400 text-primary-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline-block tracking-wide text-xs">Ask Botanical AI</span>
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-sand-300 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-primary-950 text-sand-50 p-4 flex items-center justify-between border-b border-accent-600/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent-400 text-primary-950 flex items-center justify-center font-bold shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold leading-tight">ONZNATURAL Botanical AI</h4>
                <span className="text-[10px] text-sand-300">Gemini 3 Flash • Handcrafted Botanical Consultant</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-sand-300 transition-colors"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick link banner to Full AI Diagnostic */}
          <Link
            to="/ai-consultant"
            onClick={() => setIsOpen(false)}
            className="bg-sand-100 hover:bg-sand-200 px-3.5 py-1.5 text-xs text-primary-950 font-semibold flex items-center justify-between border-b border-sand-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-700" />
              <span>Take Full Prakriti & Skincare Quiz</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-primary-900" />
          </Link>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-sand-50/40 text-xs">
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
                      ? 'bg-primary-900 text-white rounded-tr-none'
                      : 'bg-white border border-sand-200 text-primary-950 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {m.recommendedProductIds && m.recommendedProductIds.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-sand-100 space-y-1">
                      <span className="text-[10px] font-bold text-accent-700 uppercase tracking-wider block">
                        Matching Botanicals:
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
                              className="p-1.5 rounded-lg bg-sand-50 hover:bg-accent-50 border border-sand-200 font-semibold text-primary-950 flex items-center justify-between"
                            >
                              <span>{p.name} (₹{p.mrp})</span>
                              <ArrowRight className="w-3 h-3 text-accent-700" />
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
              <div className="flex items-center gap-2 text-[11px] text-sand-600 mr-auto p-2 bg-white rounded-xl border border-sand-200">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-900" />
                <span>Consulting Ayurvedic formulas...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Prompt pills */}
          <div className="px-3 py-2 bg-white border-t border-sand-100 overflow-x-auto whitespace-nowrap flex gap-1.5">
            {[
              'Soaps for summer heat rash',
              'Aparajita body lotion benefits',
              'Tan removal routine',
              'Neem & Tulsi soap'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-full bg-sand-100 hover:bg-sand-200 text-[11px] text-sand-800 border border-sand-200 shrink-0"
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
            className="p-2.5 bg-white border-t border-sand-200 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a botanical skincare question..."
              className="flex-1 px-3 py-2 rounded-xl border border-sand-300 text-xs focus:outline-none focus:ring-2 focus:ring-accent-600"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-primary-900 text-white hover:bg-primary-950 transition-colors disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
