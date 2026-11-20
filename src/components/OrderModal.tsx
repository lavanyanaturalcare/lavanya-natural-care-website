import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, ShieldCheck, MessageCircle, QrCode, Truck, CreditCard, Sparkles, Copy, Check } from 'lucide-react';
import { Product } from '../types';
import { createEnquiry } from '../services/crmService';

interface OrderModalProps {
  product: Product | null;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'whatsapp' | 'cod'>('upi');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cityPincode, setCityPincode] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!product) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product || !mounted) return null;

  const totalAmount = product.mrp * quantity;
  const upiId = '9726739515@upi';
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=ONZNATURAL&am=${totalAmount}&cu=INR&tn=Order%20for%20${encodeURIComponent(product.name)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const generateWhatsAppMessage = () => {
    let msg = `*NEW ORDER - ONZNATURAL*\n`;
    msg += `• Product: ${product.name}\n`;
    msg += `• Quantity: ${quantity}\n`;
    msg += `• Total Amount: ₹${totalAmount}\n`;
    msg += `• Payment Preference: ${selectedMethod.toUpperCase()}\n`;
    if (customerName) msg += `• Customer Name: ${customerName}\n`;
    if (customerPhone) msg += `• Phone: ${customerPhone}\n`;
    if (deliveryAddress) msg += `• Address: ${deliveryAddress}\n`;
    if (cityPincode) msg += `• City / Pincode: ${cityPincode}\n`;
    msg += `\nPlease confirm delivery availability and dispatch timeline.`;
    return encodeURIComponent(msg);
  };

  const handleDirectWhatsAppOrder = async () => {
    // Record enquiry in CRM database
    try {
      await createEnquiry({
        product_id: product.id,
        customer_name: customerName || 'WhatsApp Customer',
        contact_details: customerPhone || 'WhatsApp (+91 97267 39515)',
        message: `Order for ${quantity}x ${product.name} (₹${totalAmount}) via ${selectedMethod.toUpperCase()}. Address: ${deliveryAddress} ${cityPincode}`,
        status: 'new'
      });
    } catch (e) {}

    const url = `https://api.whatsapp.com/send?phone=919726739515&text=${generateWhatsAppMessage()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl border border-sand-200 shadow-2xl p-5 sm:p-7 space-y-6 max-h-[92vh] overflow-y-auto z-[100000]"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: '#ffffff', opacity: 1 }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-sand-100">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-100 text-primary-950 text-xs font-bold uppercase tracking-wider border border-sand-200">
              <Sparkles className="w-3.5 h-3.5 text-accent-700" />
              <span>Easy Checkout &amp; Direct Order</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-sand-500 hover:text-primary-950 hover:bg-sand-100 rounded-full transition-colors focus:outline-none"
            aria-label="Close Order Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Product Summary */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-sand-50 border border-sand-200">
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl bg-white p-2 border border-sand-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h2 id="order-modal-title" className="font-serif text-lg sm:text-xl font-bold text-primary-950 truncate">
              {product.name}
            </h2>
            <p className="text-xs text-sand-600 font-medium">
              {product.netWeightOrVol} • Handcrafted in Vadodara
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-serif text-xl font-bold text-primary-950">₹{product.mrp}</span>
              <span className="text-[11px] text-sand-500">per piece (Incl. Taxes)</span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center border border-sand-300 rounded-xl bg-white overflow-hidden shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2.5 py-1 text-sm font-bold text-sand-700 hover:bg-sand-100 transition-colors"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-3 py-1 text-xs font-bold text-primary-950 min-w-[28px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-2.5 py-1 text-sm font-bold text-sand-700 hover:bg-sand-100 transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Price Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary-950 text-sand-50">
          <span className="text-xs uppercase tracking-wider font-semibold text-sand-300">
            Total Payable ({quantity} item{quantity > 1 ? 's' : ''})
          </span>
          <span className="font-serif text-2xl font-bold text-accent-400">₹{totalAmount}</span>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-primary-950 uppercase tracking-wider block">
            Select Your Preferred Payment &amp; Ordering Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedMethod === 'upi'
                  ? 'border-primary-900 bg-sand-100 text-primary-950 shadow-sm font-bold ring-2 ring-primary-900'
                  : 'border-sand-200 bg-white text-sand-700 hover:border-sand-300'
              }`}
            >
              <QrCode className="w-5 h-5 mx-auto mb-1 text-primary-900" />
              <span className="text-xs block">UPI / GPay / PhonePe</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('whatsapp')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedMethod === 'whatsapp'
                  ? 'border-[#25D366] bg-[#25D366]/10 text-primary-950 shadow-sm font-bold ring-2 ring-[#25D366]'
                  : 'border-sand-200 bg-white text-sand-700 hover:border-sand-300'
              }`}
            >
              <MessageCircle className="w-5 h-5 mx-auto mb-1 text-[#25D366]" />
              <span className="text-xs block">WhatsApp 1-Click</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('cod')}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedMethod === 'cod'
                  ? 'border-accent-600 bg-accent-50 text-primary-950 shadow-sm font-bold ring-2 ring-accent-600'
                  : 'border-sand-200 bg-white text-sand-700 hover:border-sand-300'
              }`}
            >
              <Truck className="w-5 h-5 mx-auto mb-1 text-accent-700" />
              <span className="text-xs block">Cash on Delivery (COD)</span>
            </button>
          </div>
        </div>

        {/* Method-specific Information Panel */}
        {selectedMethod === 'upi' && (
          <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-primary-950">ONZNATURAL Official UPI ID:</span>
              <div className="flex items-center gap-1.5">
                <code className="bg-white px-2.5 py-1 rounded-lg border border-sand-300 font-mono text-primary-950 font-bold">
                  {upiId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-1.5 rounded-lg bg-primary-900 text-white hover:bg-primary-950 transition-colors"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-sand-700 leading-relaxed">
              Pay ₹{totalAmount} via Google Pay, PhonePe, Paytm, or BHIM to <strong>+91 97267 39515</strong> (Siddharth Gandhi).
              Click below to send your delivery details on WhatsApp along with your payment confirmation.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={upiPayUrl}
                className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-primary-950 text-white text-xs font-bold text-center hover:bg-primary-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Open UPI App (Mobile)</span>
              </a>
              <button
                type="button"
                onClick={handleDirectWhatsAppOrder}
                className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl btn-whatsapp-3d text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Confirm on WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {selectedMethod === 'whatsapp' && (
          <div className="p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 space-y-3">
            <p className="text-xs text-primary-950 leading-relaxed font-medium">
              We will instantly chat with you on WhatsApp at <strong>+91 97267 39515</strong> with your order for <strong>{quantity}x {product.name} (₹{totalAmount})</strong>. You can share your address directly in chat and choose UPI, Card, or COD.
            </p>
            <button
              type="button"
              onClick={handleDirectWhatsAppOrder}
              className="w-full py-3.5 rounded-xl btn-whatsapp-3d text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Send Order via WhatsApp (+91 97267 39515)</span>
            </button>
          </div>
        )}

        {selectedMethod === 'cod' && (
          <div className="p-4 rounded-2xl bg-accent-50/80 border border-accent-300 space-y-3">
            <p className="text-xs text-primary-950 leading-relaxed font-medium">
              Cash on Delivery is available for all orders across Vadodara (1-2 days) and pan-India (3-6 days). Please enter your details below to place order.
            </p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Full Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
              <input
                type="tel"
                placeholder="Mobile Number (10 digits)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
              <input
                type="text"
                placeholder="Delivery Address & Landmark"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
              <input
                type="text"
                placeholder="City & Pincode (e.g. Vadodara 390023)"
                value={cityPincode}
                onChange={(e) => setCityPincode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>
            <button
              type="button"
              onClick={handleDirectWhatsAppOrder}
              className="w-full py-3.5 rounded-xl bg-primary-950 hover:bg-primary-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Truck className="w-4 h-4 text-accent-400" />
              <span>Submit Cash on Delivery Request</span>
            </button>
          </div>
        )}

        {/* Trust Guarantees */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-sand-100 text-[11px] text-sand-600 text-center">
          <div className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-900" />
            <span>100% Plant-Based</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Truck className="w-3.5 h-3.5 text-primary-900" />
            <span>Vadodara &amp; Pan-India</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary-900" />
            <span>Safe Ingredients</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
