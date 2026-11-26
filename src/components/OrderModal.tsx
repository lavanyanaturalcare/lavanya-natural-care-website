import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CheckCircle2, ShieldCheck, MessageCircle, QrCode, Truck, CreditCard, 
  Sparkles, Copy, Check, Tag, Gift, RefreshCw, AlertCircle, Plus, Info 
} from 'lucide-react';
import { Product } from '../types';
import { useProductCatalog } from '../context/ProductContext';
import { createEnquiry } from '../services/crmService';

interface OrderModalProps {
  product: Product | null;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ product, onClose }) => {
  const { products } = useProductCatalog();
  const [quantity, setQuantity] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'whatsapp' | 'cod'>('upi');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cityPincode, setCityPincode] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileClient, setIsMobileClient] = useState(false);

  // Growth & CRO state: coupon, add-on upsell, restock reminder
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [addComplementary, setAddComplementary] = useState(false);
  const [restockReminder, setRestockReminder] = useState(true);
  const [orderPersistError, setOrderPersistError] = useState<string | null>(null);
  const [confirmedOrderRef, setConfirmedOrderRef] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobileClient(
      typeof window !== 'undefined' &&
      (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768)
    );
  }, []);

  useEffect(() => {
    if (!product) return;
    setQuantity(1);
    setAppliedCoupon(null);
    setCouponError(null);
    setAddComplementary(false);

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

  // Complementary authentic product recommendation
  const complementaryProduct = useMemo(() => {
    if (!product || !products || products.length === 0) return null;
    if (product.category === 'Handmade Cold Process Soap') {
      return products.find(p => p.id === 'rice-aloe-face-cream') || 
             products.find(p => p.id === 'kesuda-palash-soap') || 
             products.find(p => p.id !== product.id);
    } else {
      return products.find(p => p.id === 'neem-tulsi-soap') || 
             products.find(p => p.id === 'kesuda-palash-soap') || 
             products.find(p => p.id !== product.id);
    }
  }, [product, products]);

  if (!product || !mounted) return null;

  // Base pricing
  const unitPrice = product.discountPrice && product.discountPrice < product.mrp ? product.discountPrice : product.mrp;
  const compUnitPrice = complementaryProduct
    ? (complementaryProduct.discountPrice && complementaryProduct.discountPrice < complementaryProduct.mrp
        ? complementaryProduct.discountPrice
        : complementaryProduct.mrp)
    : 0;
  const originalFullMrp = (product.mrp * quantity) + (addComplementary && complementaryProduct ? complementaryProduct.mrp : 0);
  const itemsSubtotal = (unitPrice * quantity) + (addComplementary && complementaryProduct ? compUnitPrice : 0);

  // Volume tier discounts (honest multi-pack saving)
  let volumeDiscountRate = 0;
  if (quantity === 2) volumeDiscountRate = 0.05; // 5% for Duo
  else if (quantity >= 3) volumeDiscountRate = 0.10; // 10% for 3+

  // Coupon handling
  let couponDiscountRate = 0;
  if (appliedCoupon === 'WELCOME10') {
    couponDiscountRate = 0.10;
  } else if (appliedCoupon === 'TRIO15') {
    if (quantity >= 3) {
      couponDiscountRate = 0.15;
    }
  }

  const effectiveDiscountRate = Math.max(volumeDiscountRate, couponDiscountRate);
  const discountAmount = Math.round(itemsSubtotal * effectiveDiscountRate);
  const discountedSubtotal = itemsSubtotal - discountAmount;

  // Shipping calculation (Flat courier fee)
  const standardShippingFee = 50;
  const shippingFee = standardShippingFee;

  const finalTotal = discountedSubtotal + shippingFee;
  const totalSavings = Math.max(0, originalFullMrp - finalTotal);

  const upiId = '9726739515@upi';
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=ONZNATURAL&am=${finalTotal}&cu=INR&tn=Order%20for%20${encodeURIComponent(product.name)}`;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'WELCOME10') {
      setAppliedCoupon('WELCOME10');
      setCouponError(null);
    } else if (clean === 'TRIO15') {
      if (quantity < 3) {
        setCouponError('Code TRIO15 requires 3 or more items. Increase quantity to unlock 15% OFF!');
      } else {
        setAppliedCoupon('TRIO15');
        setCouponError(null);
      }
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10 for 10% off your order.');
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const generateWhatsAppMessage = () => {
    let msg = `*NEW ORDER - ONZNATURAL*\n`;
    msg += `---------------------------------\n`;
    msg += `• Product: ${product.name} (x${quantity})\n`;
    if (addComplementary && complementaryProduct) {
      msg += `• Complementary Add-on: ${complementaryProduct.name} (x1) - ₹${complementaryProduct.mrp}\n`;
    }
    msg += `• Items Subtotal: ₹${itemsSubtotal}\n`;
    if (discountAmount > 0) {
      msg += `• Applied Discount: -₹${discountAmount} (${appliedCoupon ? `Code ${appliedCoupon}` : `${Math.round(effectiveDiscountRate * 100)}% Volume Save`})\n`;
    }
    msg += `• Delivery: Standard Courier (₹${shippingFee})\n`;
    msg += `• *TOTAL PAYABLE: ₹${finalTotal}* (Saved ₹${totalSavings})\n`;
    msg += `• Payment Method: ${selectedMethod.toUpperCase()}\n`;
    if (customerName) msg += `• Customer Name: ${customerName}\n`;
    if (customerPhone) msg += `• Phone: ${customerPhone}\n`;
    if (deliveryAddress) msg += `• Address: ${deliveryAddress}\n`;
    if (cityPincode) msg += `• City / Pincode: ${cityPincode}\n`;
    if (restockReminder) msg += `• Restock Reminder: Yes, remind on WhatsApp in 30 days\n`;
    msg += `---------------------------------\n`;
    msg += `Please confirm dispatch timeline and send tracking link.`;
    return encodeURIComponent(msg);
  };

  const handleDirectWhatsAppOrder = async () => {
    setOrderPersistError(null);
    setIsSubmittingOrder(true);
    const refCode = `ONZ-${Date.now().toString().slice(-6)}`;

    try {
      await createEnquiry({
        product_id: product.id,
        customer_name: customerName.trim() || 'Storefront Customer',
        contact_details: customerPhone.trim() || 'WhatsApp (+91 97267 39515)',
        enquiry_type: 'order_checkout',
        message: `[${refCode}] Order for ${quantity}x ${product.name}${addComplementary && complementaryProduct ? ` + ${complementaryProduct.name}` : ''} (₹${finalTotal}) via ${selectedMethod.toUpperCase()}.${deliveryAddress ? ` Address: ${deliveryAddress}` : ''}${cityPincode ? ` (${cityPincode})` : ''}. Restock: ${restockReminder ? 'Yes' : 'No'}`,
        status: 'new'
      });
      setConfirmedOrderRef(refCode);
    } catch (e: any) {
      setOrderPersistError(e?.message || 'Could not save order record to database, opening WhatsApp fallback.');
    } finally {
      setIsSubmittingOrder(false);
    }

    const url = `https://api.whatsapp.com/send?phone=919726739515&text=${generateWhatsAppMessage()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl border border-sand-200 shadow-2xl p-5 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto z-[100000]"
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

        {/* Express Dispatch & Courier Banner */}
        <div className="p-3 rounded-2xl bg-sand-50 border border-sand-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-primary-950 font-semibold">
            <Truck className="w-4 h-4 text-primary-900" />
            <span>Express Courier Delivery Across India</span>
          </div>
          <span className="text-[11px] text-sand-600 bg-sand-100 px-2.5 py-0.5 rounded-lg border border-sand-300 font-medium">
            Dispatched in 24–48 hrs
          </span>
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
              <span className="font-serif text-xl font-bold text-primary-950">₹{unitPrice}</span>
              {product.discountPrice && product.discountPrice < product.mrp && (
                <span className="text-xs line-through text-sand-500 font-medium">₹{product.mrp}</span>
              )}
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

        {/* Volume Tier Multi-Pack Quick Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-sand-700 uppercase tracking-wider block">
            Multi-Pack Volume Savings
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setQuantity(1)}
              className={`p-2 rounded-xl text-center border text-xs transition-all ${
                quantity === 1
                  ? 'border-primary-900 bg-sand-100 font-bold text-primary-950 ring-1 ring-primary-900'
                  : 'border-sand-200 bg-white text-sand-700 hover:border-sand-300'
              }`}
            >
              <div className="font-bold">1 Unit</div>
              <div className="text-[10px] text-sand-500">Standard</div>
            </button>
            <button
              type="button"
              onClick={() => setQuantity(2)}
              className={`p-2 rounded-xl text-center border text-xs transition-all ${
                quantity === 2
                  ? 'border-primary-900 bg-sand-100 font-bold text-primary-950 ring-1 ring-primary-900'
                  : 'border-sand-200 bg-white text-sand-700 hover:border-sand-300'
              }`}
            >
              <div className="font-bold flex items-center justify-center gap-1">
                <span>2 Units (Duo)</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold">Save 5%</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setQuantity(3);
                if (appliedCoupon === null) {
                  setAppliedCoupon('TRIO15');
                }
              }}
              className={`p-2 rounded-xl text-center border text-xs transition-all ${
                quantity >= 3
                  ? 'border-emerald-700 bg-emerald-50 font-bold text-emerald-950 ring-2 ring-emerald-600'
                  : 'border-sand-200 bg-white text-sand-700 hover:border-sand-300'
              }`}
            >
              <div className="font-bold flex items-center justify-center gap-1">
                <Gift className="w-3 h-3 text-emerald-600" />
                <span>3+ (Trio Pack)</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-bold">Save 15% (TRIO15)</div>
            </button>
          </div>
        </div>

        {/* Frequently Bought Together Add-on Upsell */}
        {complementaryProduct && (
          <div className="p-3 rounded-2xl bg-sand-50/80 border border-sand-200 flex items-center gap-3">
            <input
              type="checkbox"
              id="complementary-upsell"
              checked={addComplementary}
              onChange={(e) => setAddComplementary(e.target.checked)}
              className="w-4 h-4 rounded text-primary-900 focus:ring-accent-600 accent-primary-900 cursor-pointer"
            />
            <img
              src={complementaryProduct.image}
              alt={complementaryProduct.name}
              className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-sand-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <label htmlFor="complementary-upsell" className="text-xs font-bold text-primary-950 block truncate cursor-pointer">
                Pair with: {complementaryProduct.name}
              </label>
              <p className="text-[10px] text-sand-600">
                Recommended companion for complete botanical care.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-primary-950 block">+₹{complementaryProduct.mrp}</span>
              <span className="text-[9px] text-emerald-700 font-semibold">Popular Add-on</span>
            </div>
          </div>
        )}

        {/* Coupon Code Input */}
        <div className="space-y-1.5">
          <form onSubmit={handleApplyCoupon} className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-sand-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Promo code (e.g. WELCOME10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="w-full pl-8 pr-2 py-2.5 text-xs bg-white border border-sand-300 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-accent-600 min-h-[44px]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-primary-900 text-white text-xs font-bold hover:bg-primary-950 transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[68px] flex items-center justify-center"
            >
              Apply
            </button>
          </form>

          {appliedCoupon && (
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                <span>
                  Code <strong>{appliedCoupon}</strong> applied ({Math.round(effectiveDiscountRate * 100)}% OFF)
                </span>
              </span>
              <button
                type="button"
                onClick={() => { setAppliedCoupon(null); setCouponInput(''); }}
                className="text-[11px] underline hover:text-emerald-950"
              >
                Remove
              </button>
            </div>
          )}

          {couponError && (
            <div className="flex items-center gap-1.5 text-[11px] text-rose-700 p-2 rounded-lg bg-rose-50 border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{couponError}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] text-sand-600">
            <Info className="w-3 h-3 text-sand-500 shrink-0" />
            <span>Codes: <strong>WELCOME10</strong> (10% first order) • <strong>TRIO15</strong> (15% on 3+ items)</span>
          </div>
        </div>

        {/* Transparent Price Breakdown */}
        <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5 text-xs text-sand-700">
          <div className="flex justify-between">
            <span>Items Subtotal ({quantity}x {product.name}{addComplementary ? ' + Add-on' : ''})</span>
            <span className="font-medium text-primary-950">₹{itemsSubtotal}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Savings ({Math.round(effectiveDiscountRate * 100)}% OFF)</span>
              <span>-₹{discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Standard Courier Delivery</span>
            <span className="font-medium text-primary-950">₹{standardShippingFee}</span>
          </div>
          <div className="pt-2 border-t border-sand-200 flex items-baseline justify-between text-primary-950">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">Total Amount Payable</span>
              {totalSavings > 0 && (
                <span className="text-[10px] text-emerald-700 font-bold">You save ₹{totalSavings} overall</span>
              )}
            </div>
            <span className="font-serif text-2xl font-bold text-accent-700">₹{finalTotal}</span>
          </div>
        </div>

        {/* 30-Day Restock Reminder Checkbox */}
        <label className="flex items-center gap-2 text-xs text-sand-700 cursor-pointer">
          <input
            type="checkbox"
            checked={restockReminder}
            onChange={(e) => setRestockReminder(e.target.checked)}
            className="w-4 h-4 rounded text-primary-900 focus:ring-accent-600 accent-primary-900"
          />
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-primary-900 shrink-0" />
            <span>Send me a friendly restock reminder on WhatsApp in 30 days (artisanal soaps last 3-4 weeks)</span>
          </span>
        </label>

        {/* Payment Method Selector */}
        <div className="space-y-2.5">
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
              Pay ₹{finalTotal} via Google Pay, PhonePe, Paytm, or BHIM to <strong>+91 97267 39515</strong> (Siddharth Gandhi).
              Click below to send your delivery details on WhatsApp along with payment confirmation.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {isMobileClient ? (
                <a
                  href={upiPayUrl}
                  className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-primary-950 text-white text-xs font-bold text-center hover:bg-primary-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm min-h-[44px]"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Open UPI App (Mobile)</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-primary-950 text-white text-xs font-bold text-center hover:bg-primary-900 transition-colors flex items-center justify-center gap-1.5 shadow-sm min-h-[44px]"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'UPI ID Copied!' : 'Copy UPI ID'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleDirectWhatsAppOrder}
                className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl btn-whatsapp-3d text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md cursor-pointer min-h-[44px]"
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
              We will instantly chat with you on WhatsApp at <strong>+91 97267 39515</strong> with your order for <strong>{quantity}x {product.name} {addComplementary ? `+ ${complementaryProduct?.name}` : ''} (₹{finalTotal})</strong>. You can share your address directly in chat and choose UPI, Card, or COD.
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
              Cash on Delivery is available across Vadodara (1-2 days) and pan-India (3-6 days). Please enter your details below:
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
              <span>Submit Cash on Delivery Request (₹{finalTotal})</span>
            </button>
          </div>
        )}

        {/* Order Confirmation / Persistence Status */}
        {confirmedOrderRef && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Order Request Logged ({confirmedOrderRef})</p>
              <p className="text-[11px] text-emerald-800">Saved in our Vadodara workshop queue. Complete confirmation on WhatsApp.</p>
            </div>
          </div>
        )}
        {orderPersistError && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{orderPersistError}</span>
          </div>
        )}

        {/* Real Trust & Guarantee Guarantees */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-sand-100 text-[11px] text-sand-600 text-center">
          <div className="flex flex-col items-center justify-center gap-0.5">
            <ShieldCheck className="w-4 h-4 text-primary-900" />
            <span className="font-semibold text-primary-950">7-Day Transit</span>
            <span className="text-[10px] text-sand-500">Damage Replacement</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5">
            <Truck className="w-4 h-4 text-primary-900" />
            <span className="font-semibold text-primary-950">Fast Courier</span>
            <span className="text-[10px] text-sand-500">Vadodara &amp; Pan-India</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5">
            <CheckCircle2 className="w-4 h-4 text-primary-900" />
            <span className="font-semibold text-primary-950">100% Glycerin</span>
            <span className="text-[10px] text-sand-500">Pure Plant Oils</span>
          </div>
        </div>

        {/* Transparent Order Process & Policy Notice */}
        <p className="text-[11px] text-sand-600 text-center leading-relaxed pt-1">
          Orders are confirmed via WhatsApp or direct UPI verification (no online card gateway is used). By placing a request, you agree to our{' '}
          <a href="/shipping-delivery" target="_blank" rel="noopener noreferrer" className="underline text-primary-900 font-medium">Shipping</a>,{' '}
          <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="underline text-primary-900 font-medium">Refund</a>, and{' '}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-primary-900 font-medium">Privacy Policy</a>.
        </p>
      </div>
    </div>,
    document.body
  );
};
