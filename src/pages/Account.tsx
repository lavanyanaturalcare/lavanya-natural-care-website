import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import {
  getConversations,
  getEnquiries,
  getWishlist,
  submitDataDeletionRequest,
  revokeAllConsents
} from '../services/crmService';
import { Conversation, CustomerEnquiry, PreferredLanguage } from '../types/crm';
import { VERIFIED_PRODUCTS } from '../data/productKnowledge';
import { SEO } from '../components/SEO';
import {
  User,
  Heart,
  MessageSquare,
  Package,
  Shield,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Download,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const Account: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist' | 'consultations' | 'enquiries' | 'privacy'>('profile');

  // Customer Data
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState<PreferredLanguage>('en');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Collections
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);

  // Deletion Request
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionSubmitted, setDeletionSubmitted] = useState(false);
  const [deletionSubmitting, setDeletionSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check local session
      let localCustomer: any = null;
      try {
        const raw = localStorage.getItem('onznatural_customer_session');
        if (raw) localCustomer = JSON.parse(raw);
      } catch (e) {}

      let activeUser: any = null;
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) activeUser = user;
        } catch (e) {}
      }

      if (!activeUser && !localCustomer) {
        navigate('/login', { replace: true, state: { from: { pathname: '/account' } } });
        return;
      }

      const effectiveUser = activeUser || {
        id: localCustomer?.auth_user_id || localCustomer?.id || 'guest-user',
        email: localCustomer?.email || '',
        user_metadata: {
          full_name: localCustomer?.full_name || localCustomer?.name || '',
          phone: localCustomer?.phone || '',
          preferred_language: localCustomer?.preferred_language || 'en'
        }
      };

      setUser(effectiveUser);
      setFullName(effectiveUser.user_metadata?.full_name || localCustomer?.full_name || localCustomer?.name || '');
      setPhone(effectiveUser.user_metadata?.phone || localCustomer?.phone || '');
      setLanguage(effectiveUser.user_metadata?.preferred_language || localCustomer?.preferred_language || 'en');

      // Fetch customer profile from customers table if auth user exists
      if (activeUser?.id && isSupabaseConfigured() && supabase) {
        try {
          const { data: customerRow } = await supabase
            .from('customers')
            .select('*')
            .eq('auth_user_id', activeUser.id)
            .maybeSingle();

          if (customerRow) {
            setFullName(customerRow.full_name || customerRow.name || activeUser.user_metadata?.full_name || '');
            setPhone(customerRow.phone || activeUser.user_metadata?.phone || '');
            setLanguage(customerRow.preferred_language || 'en');
          }
        } catch (err) {}
      }

      // Load collections
      const email = effectiveUser.email || '';
      const [wList, convs, enqs] = await Promise.all([
        getWishlist(),
        getConversations({ search: email }),
        getEnquiries()
      ]);

      setWishlistIds(wList);
      setConversations(convs);
      setEnquiries(enqs.filter(e => (email && ((e.contact_details && e.contact_details.includes(email)) || (e.contact_info && e.contact_info.includes(email))))));
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSaved(false);

    try {
      if (supabase && user) {
        // Update auth metadata
        await supabase.auth.updateUser({
          data: { full_name: fullName, phone, preferred_language: language }
        });

        // Update customers table
        await supabase
          .from('customers')
          .update({
            full_name: fullName,
            name: fullName,
            phone,
            preferred_language: language
          })
          .eq('auth_user_id', user.id);
      }

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      console.warn('Profile update error:', err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('onznatural_customer_session');
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {}
    navigate('/');
  };

  const handleExportData = () => {
    const exportObject = {
      user: {
        id: user?.id,
        email: user?.email,
        full_name: fullName,
        phone,
        preferred_language: language
      },
      wishlist: wishlistIds,
      consultations: conversations,
      enquiries: enquiries,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onznatural_data_${user?.id?.substring(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setDeletionSubmitting(true);
    await submitDataDeletionRequest(user.email, deletionReason);
    setDeletionSubmitting(false);
    setDeletionSubmitted(true);
  };

  const wishlistProducts = VERIFIED_PRODUCTS.filter(p => wishlistIds.includes(p.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-sand-800">Loading your ONZNATURAL account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="My Account | ONZNATURAL"
        description="Manage your ONZNATURAL profile, saved botanical consultations, wishlist, and privacy settings."
        canonical="https://onznatural.com/account"
      />

      <div className="max-w-6xl mx-auto">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-900 text-white flex items-center justify-center text-xl font-serif">
              {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-700">
                Botanical Care Member
              </span>
              <h1 className="text-2xl font-serif font-medium text-primary-950">
                {fullName || user?.email}
              </h1>
              <p className="text-xs text-sand-700">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-sand-700 hover:text-red-700 hover:bg-red-50 border border-sand-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Account Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <div className="bg-white rounded-2xl p-3 border border-sand-200 shadow-sm">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary-900 text-white'
                    : 'text-sand-800 hover:bg-sand-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile & Details</span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-colors mt-1 ${
                  activeTab === 'wishlist'
                    ? 'bg-primary-900 text-white'
                    : 'text-sand-800 hover:bg-sand-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4" />
                  <span>Saved Botanicals</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-sand-200 text-sand-900">
                  {wishlistIds.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('consultations')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-colors mt-1 ${
                  activeTab === 'consultations'
                    ? 'bg-primary-900 text-white'
                    : 'text-sand-800 hover:bg-sand-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4" />
                  <span>AI Consultations</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-sand-200 text-sand-900">
                  {conversations.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('enquiries')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-colors mt-1 ${
                  activeTab === 'enquiries'
                    ? 'bg-primary-900 text-white'
                    : 'text-sand-800 hover:bg-sand-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>Orders & Inquiries</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-sand-200 text-sand-900">
                  {enquiries.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-colors mt-1 ${
                  activeTab === 'privacy'
                    ? 'bg-primary-900 text-white'
                    : 'text-sand-800 hover:bg-sand-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Privacy & Data (DPDP)</span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-primary-950 text-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-serif text-sm font-medium mb-1">Need Skincare Guidance?</h3>
              <p className="text-xs text-sand-300 mb-4 leading-relaxed">
                Consult ONZNATURAL Botanical AI for customized morning & evening routines.
              </p>
              <Link
                to="/ai-consultant"
                className="inline-flex items-center gap-1.5 text-xs text-accent-400 font-medium hover:underline"
              >
                <span>Start Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="lg:col-span-3">
            {/* 1. Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm">
                <h2 className="text-lg font-serif font-medium text-primary-950 mb-1">
                  Profile Information
                </h2>
                <p className="text-xs text-sand-700 mb-6">
                  Manage your personal details and preferred communication language.
                </p>

                {profileSaved && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your profile updates have been saved successfully.</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 text-sm bg-sand-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-4 py-2 rounded-xl border border-sand-200 bg-sand-100 text-sand-600 text-sm cursor-not-allowed"
                    />
                    <span className="text-[11px] text-sand-500 mt-1 block">
                      Email is linked to your authentication account.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                      WhatsApp / Phone (for delivery coordination)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98250 12345"
                      className="w-full px-4 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 text-sm bg-sand-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                      Consultation Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as PreferredLanguage)}
                      className="w-full px-4 py-2 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-accent-600 text-sm bg-sand-50/50"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिंदी (Hindi)</option>
                      <option value="gu">ગુજરાતી (Gujarati)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="btn-primary py-2.5 px-6 rounded-xl text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* 2. Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-serif font-medium text-primary-950">
                      Saved Botanicals ({wishlistProducts.length})
                    </h2>
                    <p className="text-xs text-sand-700">
                      Handcrafted soaps, lotions and herbal care saved to your list.
                    </p>
                  </div>
                  <Link
                    to="/products"
                    className="text-xs text-primary-900 font-medium hover:underline flex items-center gap-1"
                  >
                    <span>Browse All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-sand-200 rounded-2xl">
                    <Heart className="w-10 h-10 text-sand-400 mx-auto mb-3" />
                    <h3 className="font-serif text-base text-primary-950 mb-1">Your wishlist is empty</h3>
                    <p className="text-xs text-sand-700 mb-4">
                      Explore our handcrafted cold-process soaps and body lotions.
                    </p>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-900 text-white text-xs font-medium hover:bg-primary-950"
                    >
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistProducts.map(p => (
                      <div
                        key={p.id}
                        className="flex gap-4 p-4 rounded-2xl border border-sand-200 hover:border-sand-300 transition-colors bg-sand-50/50"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-semibold text-accent-700">
                            {p.category}
                          </span>
                          <h4 className="font-serif text-sm font-medium text-primary-950 truncate">
                            {p.name}
                          </h4>
                          <p className="text-xs font-semibold text-primary-900 mt-0.5">
                            ₹{p.mrp} <span className="font-normal text-sand-600 text-[11px]">({p.netWeightOrVol})</span>
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                            <Link
                              to={`/product/${p.id}`}
                              className="text-xs text-primary-900 hover:underline font-medium"
                            >
                              View Details
                            </Link>
                            <a
                              href={`https://wa.me/919726739515?text=${encodeURIComponent(`Hello ONZNATURAL, I would like to order ${p.name} (₹${p.mrp}, ${p.netWeightOrVol}).`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-700 hover:underline font-medium flex items-center gap-1"
                            >
                              <span>Order on WhatsApp</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Consultations Tab */}
            {activeTab === 'consultations' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-serif font-medium text-primary-950">
                      AI Botanical Consultations
                    </h2>
                    <p className="text-xs text-sand-700">
                      Your personalized Ayurvedic routines and conversation records.
                    </p>
                  </div>
                  <Link
                    to="/ai-consultant"
                    className="text-xs text-primary-900 font-medium hover:underline flex items-center gap-1"
                  >
                    <span>New Consultation</span>
                    <Sparkles className="w-3.5 h-3.5 text-accent-600" />
                  </Link>
                </div>

                {conversations.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-sand-200 rounded-2xl">
                    <MessageSquare className="w-10 h-10 text-sand-400 mx-auto mb-3" />
                    <h3 className="font-serif text-base text-primary-950 mb-1">No consultations found</h3>
                    <p className="text-xs text-sand-700 mb-4">
                      Chat with ONZNATURAL Botanical AI to discover cold-process soaps suited for your skin.
                    </p>
                    <Link
                      to="/ai-consultant"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-900 text-white text-xs font-medium hover:bg-primary-950"
                    >
                      Start AI Consultation
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.map(c => (
                      <div key={c.id} className="p-4 rounded-2xl border border-sand-200 bg-sand-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-primary-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-accent-600" />
                            {c.summary || 'Ayurvedic Skincare Consultation'}
                          </span>
                          <span className="text-[11px] text-sand-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(c.started_at).toLocaleDateString()}
                          </span>
                        </div>
                        {c.messages && c.messages.length > 0 && (
                          <div className="mt-2 space-y-2 text-xs text-sand-800">
                            {c.messages.slice(-2).map(m => (
                              <div
                                key={m.id}
                                className={`p-2.5 rounded-xl ${
                                  m.sender === 'ai' ? 'bg-white border border-sand-200' : 'bg-sand-100'
                                }`}
                              >
                                <span className="font-semibold block text-[10px] uppercase text-sand-600 mb-0.5">
                                  {m.sender === 'ai' ? 'ONZNATURAL AI' : 'You'}
                                </span>
                                <p className="line-clamp-2">{m.message_content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Enquiries & Orders Tab */}
            {activeTab === 'enquiries' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm">
                <h2 className="text-lg font-serif font-medium text-primary-950 mb-1">
                  Orders & Inquiries
                </h2>
                <p className="text-xs text-sand-700 mb-6">
                  Track your dispatch coordination and direct WhatsApp order requests.
                </p>

                {enquiries.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-sand-200 rounded-2xl">
                    <Package className="w-10 h-10 text-sand-400 mx-auto mb-3" />
                    <h3 className="font-serif text-base text-primary-950 mb-1">No orders recorded yet</h3>
                    <p className="text-xs text-sand-700 mb-4">
                      When you order via WhatsApp or checkout, details will appear here.
                    </p>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-900 text-white text-xs font-medium hover:bg-primary-950"
                    >
                      Shop Handcrafted Soaps
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enquiries.map(e => (
                      <div key={e.id} className="p-4 rounded-2xl border border-sand-200 bg-sand-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-primary-950">
                            {e.message}
                          </span>
                          <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                            e.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {e.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-sand-600 block">
                          Logged on {new Date(e.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Privacy & DPDP Tab */}
            {activeTab === 'privacy' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm space-y-8">
                <div>
                  <h2 className="text-lg font-serif font-medium text-primary-950 mb-1">
                    Customer Privacy & Consent Control
                  </h2>
                  <p className="text-xs text-sand-700">
                    Compliant with India's Digital Personal Data Protection (DPDP) Act and international privacy standards.
                  </p>
                </div>

                {/* Consent Revocation */}
                <div className="p-5 rounded-2xl bg-sand-50 border border-sand-200">
                  <h3 className="text-sm font-serif font-medium text-primary-950 mb-1">
                    Consent Settings
                  </h3>
                  <p className="text-xs text-sand-700 mb-4 leading-relaxed">
                    You have full control over what data ONZNATURAL retains. You can withdraw your consultation history storage consent at any time.
                  </p>
                  <button
                    onClick={async () => {
                      await revokeAllConsents();
                      alert('Your data consents have been successfully revoked.');
                    }}
                    className="px-4 py-2 rounded-xl border border-sand-300 text-sand-800 text-xs font-medium hover:bg-sand-200 transition-colors"
                  >
                    Revoke All Active Consents
                  </button>
                </div>

                {/* Data Export (Portability) */}
                <div className="p-5 rounded-2xl bg-sand-50 border border-sand-200">
                  <h3 className="text-sm font-serif font-medium text-primary-950 mb-1">
                    Data Portability
                  </h3>
                  <p className="text-xs text-sand-700 mb-4 leading-relaxed">
                    Download an auditable JSON export of all personal information, consultations, and saved items associated with your account.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-900 text-white text-xs font-medium hover:bg-primary-950 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Personal Data (JSON)</span>
                  </button>
                </div>

                {/* Erasure / Forget Me */}
                <div className="p-5 rounded-2xl bg-red-50/50 border border-red-200">
                  <div className="flex items-center gap-2 text-red-900 mb-1">
                    <Trash2 className="w-4 h-4" />
                    <h3 className="text-sm font-serif font-medium">
                      Right to Erasure (Delete My Account & Data)
                    </h3>
                  </div>
                  <p className="text-xs text-red-800/80 mb-4 leading-relaxed">
                    Submitting this request queues your personal identity, contact details, and consultations for complete permanent purging within 30 days.
                  </p>

                  {deletionSubmitted ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Your erasure request has been recorded. Our data officer will process it.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleDeleteRequest} className="space-y-3">
                      <input
                        type="text"
                        value={deletionReason}
                        onChange={(e) => setDeletionReason(e.target.value)}
                        placeholder="Reason for deletion (optional)"
                        className="w-full px-4 py-2 rounded-xl border border-red-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="submit"
                        disabled={deletionSubmitting}
                        className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {deletionSubmitting ? 'Submitting...' : 'Request Account Deletion'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
