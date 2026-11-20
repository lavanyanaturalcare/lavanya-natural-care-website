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
  
  let message = 'Hello ONZNATURAL! I would like to inquire about your handcrafted botanical skincare products.';
  if (productName && mrp) {
    message = `Hello! I would like to order ${productName} (₹${mrp}) from ONZNATURAL. Please provide delivery details.`;
  } else if (productName) {
    message = `Hello! I would like to order ${productName} from ONZNATURAL. Please share details.`;
  }

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
  };

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label="Order on WhatsApp"
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 btn-whatsapp-3d text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 group font-semibold text-xs sm:text-sm border-2 border-white/90"
      >
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
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
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-emerald-700 bg-emerald-50 text-emerald-950 hover:bg-emerald-700 hover:text-white transition-all duration-300 font-bold text-sm shadow-xs hover:shadow-md ${className}`}
      >
        <MessageCircle className="w-4 h-4 text-emerald-800" />
        <span>{label || 'Order on WhatsApp'}</span>
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`btn-whatsapp-3d inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-white font-semibold text-sm ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      <span>{label || 'Order on WhatsApp'}</span>
    </a>
  );
};
