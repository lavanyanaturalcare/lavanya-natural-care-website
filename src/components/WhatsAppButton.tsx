import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  productName?: string;
  mrp?: number;
  variant?: 'primary' | 'outline' | 'floating';
  className?: string;
  label?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  productName,
  mrp,
  variant = 'primary',
  className = '',
  label
}) => {
  const phone = '919726739515';
  
  let message = 'Hello Lavanya Natural Care! I would like to inquire about your natural skincare products.';
  if (productName && mrp) {
    message = `Hello! I would like to order ${productName} (₹${mrp}) from Lavanya Natural Care. Please provide delivery details.`;
  } else if (productName) {
    message = `Hello! I would like to order ${productName} from Lavanya Natural Care. Please share details.`;
  }

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 btn-whatsapp-3d text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 group font-semibold text-sm border-2 border-white/90"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline font-semibold">Order on WhatsApp</span>
      </a>
    );
  }

  if (variant === 'outline') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-[#25D366] text-[#1a8a43] hover:bg-[#25D366] hover:text-white transition-all duration-300 font-semibold text-sm shadow-xs hover:shadow-md ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        <span>{label || 'Order on WhatsApp'}</span>
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-whatsapp-3d inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white font-semibold text-sm ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      <span>{label || 'Order on WhatsApp'}</span>
    </a>
  );
};
