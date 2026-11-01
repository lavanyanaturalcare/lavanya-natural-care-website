import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, CheckCircle2, AlertCircle, Send, Sparkles } from 'lucide-react';
import { SEO } from '../components/SEO';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { socialAccounts } from '../data/social';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Product Inquiry',
    message: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!/^[0-9+ -]{8,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid contact number.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your inquiry or message.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    // Simulate brief processing
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'General Product Inquiry',
      message: ''
    });
    setErrors({});
    setIsSubmitted(false);
  };

  // Pre-fill WhatsApp message based on form
  const generateWhatsAppMessage = () => {
    return encodeURIComponent(
      `Hello Lavanya Natural Care!\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nInquiry: ${formData.subject}\n\nMessage:\n${formData.message}`
    );
  };

  return (
    <div className="py-12 md:py-20 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SEO
        title="Contact Us & Store Location | Lavanya Natural Care"
        description="Get in touch with Lavanya Natural Care in Subhanpura, Vadodara. Call +91 97267 39515 or message us on WhatsApp for handcrafted cold-process soaps and botanical skincare."
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold-700 block">
          Get In Touch
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-botanical-950">
          Contact Lavanya Natural Care
        </h1>
        <p className="text-warmgray-600 text-base leading-relaxed">
          We would love to assist you with product inquiries, customized orders, or wholesale questions. Reach out directly or send us a message below.
        </p>
      </div>

      {/* Main Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-botanical-950">
              Direct Reach & Orders
            </h2>

            <div className="space-y-5 text-sm">
              {/* Phone (Clickable) */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-warmgray-500 font-semibold uppercase block">Phone / Mobile</span>
                  <a
                    href="tel:+919726739515"
                    className="font-semibold text-botanical-900 text-base hover:text-gold-700 transition-colors block"
                    aria-label="Call +91 97267 39515"
                  >
                    +91 97267 39515
                  </a>
                  <span className="text-xs text-warmgray-500 block mt-0.5">Click to call directly</span>
                </div>
              </div>

              {/* WhatsApp (Clickable) */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 text-[#1e9b4c] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-warmgray-500 font-semibold uppercase block">WhatsApp Business</span>
                  <a
                    href="https://wa.me/919726739515?text=Hello%20Lavanya%20Natural%20Care!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#1e9b4c] text-base hover:underline block"
                    aria-label="Chat with Lavanya Natural Care on WhatsApp"
                  >
                    +91 97267 39515
                  </a>
                  <span className="text-xs text-warmgray-500 block mt-0.5">Instant messaging & orders</span>
                </div>
              </div>

              {/* Email (Clickable) */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-warmgray-500 font-semibold uppercase block">Email Address</span>
                  <a
                    href="mailto:lavanyanaturalcare@gmail.com"
                    className="font-semibold text-botanical-900 text-base hover:text-gold-700 transition-colors block break-all"
                    aria-label="Email lavanyanaturalcare@gmail.com"
                  >
                    lavanyanaturalcare@gmail.com
                  </a>
                  <span className="text-xs text-warmgray-500 block mt-0.5">Click to write an email</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-warmgray-500 font-semibold uppercase block">Store / Workshop Address</span>
                  <a
                    href="https://maps.google.com/?q=Subhanpura+Vadodara+Gujarat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-botanical-900 leading-snug hover:text-gold-700 transition-colors block"
                  >
                    FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat 390023, India
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-warmgray-500 font-semibold uppercase block">Working Hours</span>
                  <p className="font-semibold text-botanical-900">Monday – Saturday: 10:00 AM – 7:00 PM</p>
                  <span className="text-xs text-warmgray-500 block mt-0.5">Sunday: Prior Appointment</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-cream-100 flex flex-col gap-3">
              <a
                href="tel:+919726739515"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-botanical-800 text-botanical-900 font-semibold text-sm hover:bg-botanical-800 hover:text-white transition-all shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now (+91 97267 39515)</span>
              </a>
              <WhatsAppButton
                label="Chat on WhatsApp Now"
                className="py-3.5 justify-center"
              />
            </div>
          </div>

          {/* Social Accounts */}
          <div className="bg-botanical-900 text-cream-50 p-6 sm:p-8 rounded-3xl space-y-4 border border-botanical-800 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-cream-50">Follow Lavanya Natural Care</h3>
            <p className="text-xs text-warmgray-300">
              Connect with our official channels for handcrafted soapmaking, skincare insights, and product updates.
            </p>
            <div className="space-y-3 pt-2">
              {socialAccounts.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-botanical-950/60 border border-botanical-800 hover:border-gold-500/50 transition-colors text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <social.icon className="w-4 h-4 text-gold-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-cream-100 block">{social.name}</span>
                      <span className="text-[11px] text-warmgray-400">{social.handle}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-botanical-800 text-gold-400 group-hover:bg-gold-500 group-hover:text-botanical-950 transition-colors text-[11px] font-semibold">
                    Follow
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Contact Form & Google Map */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Interactive Contact & Inquiry Form */}
          <div className="bg-white p-6 sm:p-8 md:p-10 rounded-3xl border border-cream-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-botanical-100 text-botanical-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>Send Us an Inquiry</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-botanical-950">
                Send a Direct Message
              </h2>
              <p className="text-xs sm:text-sm text-warmgray-600">
                Have questions about our ingredients, soap cure times, or custom bulk orders? Fill out the form below.
              </p>
            </div>

            {/* Success Message Banner */}
            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-botanical-50 border-2 border-botanical-600/40 space-y-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-botanical-800 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl font-bold text-botanical-950">
                      Thank You, {formData.name}!
                    </h3>
                    <p className="text-xs sm:text-sm text-botanical-900 leading-relaxed">
                      Your message has been successfully received. Our team in Vadodara will respond to you at{' '}
                      <span className="font-semibold">{formData.email}</span> within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/919726739515?text=${generateWhatsAppMessage()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:bg-[#1faa4f] transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Also Send via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-cream-300 text-warmgray-700 text-xs font-semibold hover:bg-cream-100 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                
                {/* Global Error Notice if validation failed */}
                {Object.keys(errors).length > 0 && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>Please correct the highlighted fields below before submitting.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-warmgray-800 uppercase tracking-wider block">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder="e.g. Ananya Patel"
                      className={`w-full px-4 py-3 bg-cream-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.name
                          ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                          : 'border-cream-200 focus:ring-botanical-800'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-warmgray-800 uppercase tracking-wider block">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="e.g. ananya@example.com"
                      className={`w-full px-4 py-3 bg-cream-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                          : 'border-cream-200 focus:ring-botanical-800'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Phone Field */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-semibold text-warmgray-800 uppercase tracking-wider block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      placeholder="e.g. +91 98765 43210"
                      className={`w-full px-4 py-3 bg-cream-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.phone
                          ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                          : 'border-cream-200 focus:ring-botanical-800'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Subject Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-xs font-semibold text-warmgray-800 uppercase tracking-wider block">
                      Inquiry Type
                    </label>
                    <select
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-cream-50/50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-botanical-800"
                    >
                      <option value="General Product Inquiry">General Product Inquiry</option>
                      <option value="Custom Bulk / Gifting Order">Custom Bulk / Gifting Order</option>
                      <option value="Ingredient Guidance for Skin Type">Ingredient Guidance for Skin Type</option>
                      <option value="Workshop Visit Inquiry">Workshop Visit Inquiry</option>
                    </select>
                  </div>
                </div>

                {/* Message Field */}
                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-semibold text-warmgray-800 uppercase tracking-wider block">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                    placeholder="Tell us about the products you are interested in or questions you have..."
                    className={`w-full px-4 py-3 bg-cream-50/50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.message
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/20'
                        : 'border-cream-200 focus:ring-botanical-800'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl btn-botanical-3d text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span>Submitting Message...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Your Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Embedded Interactive Google Map */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-botanical-950">
                Workshop Location Map
              </h3>
              <p className="text-xs sm:text-sm text-warmgray-600">
                FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat, India.
              </p>
            </div>

            <div className="w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-cream-200 shadow-inner bg-cream-50">
              <iframe
                title="Lavanya Natural Care Vadodara Map Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.963428987114!2d73.1534293!3d22.3172081!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc8b0a1d48c8b%3A0x6b14f6b1e626e257!2sSubhanpura%2C%20Vadodara%2C%20Gujarat%20390023!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-4 rounded-xl bg-cream-50 border border-cream-100 flex items-center gap-3 text-xs text-botanical-900 font-medium">
              <CheckCircle2 className="w-4 h-4 text-gold-600 shrink-0" />
              <span>
                Visiting us? Call us prior at{' '}
                <a href="tel:+919726739515" className="font-bold underline hover:text-gold-700">
                  +91 97267 39515
                </a>{' '}
                to confirm workshop availability.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
