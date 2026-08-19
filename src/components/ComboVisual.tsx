import React from 'react';

interface ComboVisualProps {
  comboNumber: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ComboVisual: React.FC<ComboVisualProps> = ({ comboNumber, className = '', size = 'md' }) => {
  const containerHeight = size === 'sm' ? 'h-36' : size === 'lg' ? 'h-64' : 'h-48';

  if (comboNumber === 1) {
    // 5 Soap Collection
    return (
      <div className={`w-full ${containerHeight} rounded-2xl bg-cream-50/90 border border-cream-200/80 p-3 relative flex items-center justify-center overflow-hidden group ${className}`}>
        {/* Soft radial ground stage */}
        <div className="absolute bottom-2 w-3/4 h-6 bg-botanical-900/10 rounded-full blur-md" />
        
        {/* Soap Stack Visual */}
        <img
          src="/assets/use-for-making-website/soaps image.webp"
          alt="5 Handcrafted Cold Process Soap Collection"
          className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute bottom-2 right-2 z-20 bg-botanical-900/90 text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
          5 Soap Bars
        </div>
      </div>
    );
  }

  if (comboNumber === 2) {
    // 2 Soap + 1 Body Wash + 1 Lip Balm
    return (
      <div className={`w-full ${containerHeight} rounded-2xl bg-cream-50/90 border border-cream-200/80 p-2 relative flex items-center justify-center overflow-hidden group ${className}`}>
        {/* Soft Ground Stage Shadow */}
        <div className="absolute bottom-2 w-4/5 h-6 bg-botanical-900/12 rounded-full blur-md" />

        <div className="relative z-10 flex items-end justify-center w-full h-full pb-1 px-2 gap-1 sm:gap-2">
          {/* Item 1: Face & Body Wash (Tall in center-left) */}
          <div className="w-[36%] h-[90%] flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
            <img
              src="/assets/products/face-body-wash-kesuda.webp"
              alt="Kesuda Face & Body Wash 300ml"
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          </div>

          {/* Item 2: Handcrafted Soaps (Stacked/overlapping center-right) */}
          <div className="w-[38%] h-[80%] flex items-center justify-center -ml-2 transition-transform duration-300 group-hover:-translate-y-1">
            <img
              src="/assets/products/neem-tulsi-soap.png"
              alt="Neem Tulsi Soap"
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          </div>

          {/* Item 3: Free Natural Lip Balm (Front right foreground) */}
          <div className="w-[26%] h-[55%] flex items-center justify-center -ml-2 transition-transform duration-300 group-hover:scale-110">
            <img
              src="/assets/products/lip-balm.webp"
              alt="Natural Lip Balm"
              className="max-h-full max-w-full object-contain drop-shadow-lg"
            />
          </div>
        </div>

        <div className="absolute bottom-2 right-2 z-20 bg-botanical-900/90 text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
          2 Soaps + Body Wash + Balm
        </div>
      </div>
    );
  }

  // Combo 3: 2 Soap + 1 Body Wash
  return (
    <div className={`w-full ${containerHeight} rounded-2xl bg-cream-50/90 border border-cream-200/80 p-2 relative flex items-center justify-center overflow-hidden group ${className}`}>
      {/* Soft Ground Stage Shadow */}
      <div className="absolute bottom-2 w-4/5 h-6 bg-botanical-900/12 rounded-full blur-md" />

      <div className="relative z-10 flex items-end justify-center w-full h-full pb-1 px-4 gap-3">
        {/* Item 1: Face & Body Wash (Left) */}
        <div className="w-[45%] h-[92%] flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
          <img
            src="/assets/products/face-body-wash-neem-tulsi.webp"
            alt="Neem & Tulsi Face & Body Wash 300ml"
            className="max-h-full max-w-full object-contain drop-shadow-md"
          />
        </div>

        {/* Item 2: Handcrafted Soap (Right) */}
        <div className="w-[45%] h-[82%] flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
          <img
            src="/assets/products/kesuda-soap.PNG"
            alt="Kesuda Handcrafted Soap"
            className="max-h-full max-w-full object-contain drop-shadow-md"
          />
        </div>
      </div>

      <div className="absolute bottom-2 right-2 z-20 bg-botanical-900/90 text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
        2 Soaps + Body Wash
      </div>
    </div>
  );
};
