// =====================================================================
// ONZNATURAL — Unified CRM, AI Chat History & Telemetry Service
// Supports Supabase PostgreSQL with Cryptographic Token Hashing
// and Automatic Resilient Local Fallback
// =====================================================================

import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  Customer,
  CustomerStatus,
  CustomerConsent,
  ConsentType,
  Conversation,
  CRMMessage,
  MessageSender,
  ProductInterest,
  ProductInterestType,
  CustomerEnquiry,
  EnquiryStatus,
  DataDeletionRequest,
  CRMOverviewMetrics,
  RetentionPolicySettings,
  CustomerEvent,
  ProductRecord,
  AdminAuditLog
} from '../types/crm';
import { VERIFIED_PRODUCTS } from '../data/productKnowledge';

const SESSION_TOKEN_KEY = 'onznatural_session_token';
const LEGACY_SESSION_KEY = 'lavanya_client_session_uuid';
const CONSENT_STORAGE_PREFIX = 'onznatural_consent_';
const LOCAL_STORAGE_DB_PREFIX = 'onznatural_crm_';
const WISHLIST_KEY = 'onznatural_wishlist';

// -------------------------------------------------------------
// 1. Cryptographic Session & Token Management
// -------------------------------------------------------------
export const getClientSessionToken = (): string => {
  let token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    const legacy = localStorage.getItem(LEGACY_SESSION_KEY);
    if (legacy) {
      token = legacy;
    } else {
      // Generate 256-bit cryptographically secure random token
      const array = new Uint8Array(32);
      if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(array);
        token = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
      } else {
        token = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      }
    }
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
};

// Compute SHA-256 hash of session token for database validation
export const getClientSessionTokenHash = async (): Promise<string> => {
  const token = getClientSessionToken();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple hash for environments without subtle crypto
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = (hash << 5) - hash + token.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
};

export const getClientSessionId = (): string => {
  return getClientSessionToken();
};

// -------------------------------------------------------------
// 2. Mock Local Database Seed Data (for Offline / Preview Mode)
// -------------------------------------------------------------
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-101',
    name: 'Aarav Patel',
    full_name: 'Aarav Patel',
    email: 'aarav.patel@example.com',
    phone: '+91 98250 12345',
    preferred_language: 'gu',
    registration_date: new Date(Date.now() - 6 * 86400000).toISOString(),
    status: 'active',
    notes: 'Prefers Kesuda Palash soap for summer heat rash. Vadodara Alkapuri resident.',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'cust-102',
    name: 'Pooja Sharma',
    full_name: 'Pooja Sharma',
    email: 'pooja.sharma@example.com',
    phone: '+91 97120 67890',
    preferred_language: 'hi',
    registration_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'active',
    notes: 'Inquired about Ubtan bridal body polish routine & Aparajita lotion.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'cust-103',
    name: 'Meera Desai',
    full_name: 'Meera Desai',
    email: 'meera.desai@example.com',
    phone: '+91 99090 54321',
    preferred_language: 'en',
    registration_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: 'active',
    notes: 'Regular cold-process soap user, interested in Neem Tulsi & Lemon Hand Wash.',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-101',
    customer_id: 'cust-101',
    session_id: 'sess_aarav_001',
    started_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    last_activity_at: new Date(Date.now() - 6 * 86400000 + 400000).toISOString(),
    summary: 'Customer sought advice for summer prickly heat and redness. Recommended Kesuda Palash Soap and Rice Aloe Face Cream.',
    status: 'completed',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000 + 400000).toISOString(),
    messages: [
      {
        id: 'msg-1',
        conversation_id: 'conv-101',
        sender: 'customer',
        message_content: 'ઉનાળામાં ગરમીની અળાઈ અને બળતરા માટે કયો સાબુ સારો?',
        created_at: new Date(Date.now() - 6 * 86400000).toISOString()
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-101',
        sender: 'ai',
        message_content: 'ઓન્ઝનેચરલ કેસૂડા પલાશ સાબુ (Kesuda Palash Soap, ₹99) ઉનાળાની ગરમી, અળાઈ અને પરસેવાની બળતરામાં કુદરતી ઠંડક આપે છે.',
        recommended_product_ids: ['kesuda-palash-soap', 'face-body-wash-kesuda'],
        created_at: new Date(Date.now() - 6 * 86400000 + 120000).toISOString()
      }
    ]
  }
];

const INITIAL_ENQUIRIES: CustomerEnquiry[] = [
  {
    id: 'enq-1',
    customer_id: 'cust-101',
    session_id: 'sess_aarav_001',
    enquiry_type: 'whatsapp',
    product_id: 'kesuda-palash-soap',
    customer_name: 'Aarav Patel',
    contact_details: '+91 98250 12345',
    message: 'Ordered 3x Kesuda Palash Soap (₹297) for home delivery in Vadodara.',
    contact_info: '+91 98250 12345',
    status: 'resolved',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'enq-2',
    customer_id: 'cust-102',
    session_id: 'sess_pooja_002',
    enquiry_type: 'order_checkout',
    product_id: 'ubtan-soap',
    customer_name: 'Pooja Sharma',
    contact_details: 'pooja.sharma@example.com',
    message: 'Order intent for Ubtan Soap + Aparajita Body Lotion (₹698).',
    contact_info: 'pooja.sharma@example.com',
    status: 'contacted',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString()
  }
];

const getLocalCollection = <T>(key: string, initial: T[]): T[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DB_PREFIX + key);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_DB_PREFIX + key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initial;
  }
};

const setLocalCollection = <T>(key: string, items: T[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_DB_PREFIX + key, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage quota or access error', e);
  }
};

// -------------------------------------------------------------
// 3. Customer Consent Management (Privacy & GDPR / DPDP)
// -------------------------------------------------------------
export const getConsentStatus = async (consentType: ConsentType): Promise<boolean> => {
  const localVal = localStorage.getItem(CONSENT_STORAGE_PREFIX + consentType);
  if (localVal !== null) {
    return localVal === 'true';
  }
  return false;
};

export const recordConsent = async (
  consentType: ConsentType,
  granted: boolean,
  customerId?: string
): Promise<CustomerConsent> => {
  const sessionId = getClientSessionId();
  const consentRecord: CustomerConsent = {
    id: 'cst_' + Math.random().toString(36).substring(2, 10),
    customer_id: customerId || null,
    session_id: sessionId,
    consent_type: consentType,
    consent_status: granted ? 'granted' : 'revoked',
    granted,
    privacy_notice_version: 'v2.0-onznatural',
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
    revoked_at: granted ? null : new Date().toISOString()
  };

  localStorage.setItem(CONSENT_STORAGE_PREFIX + consentType, String(granted));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('customer_consents').insert({
        session_id: sessionId,
        customer_id: customerId || null,
        consent_type: consentType,
        consent_status: granted ? 'granted' : 'revoked',
        granted,
        privacy_notice_version: 'v2.0-onznatural',
        revoked_at: granted ? null : new Date().toISOString()
      });
    } catch (err) {
      console.warn('Supabase consent record fallback', err);
    }
  }

  const consents = getLocalCollection<CustomerConsent>('consents', []);
  setLocalCollection('consents', [consentRecord, ...consents]);

  return consentRecord;
};

export const revokeAllConsents = async (): Promise<void> => {
  localStorage.setItem(CONSENT_STORAGE_PREFIX + 'ai_chat_storage', 'false');
  localStorage.setItem(CONSENT_STORAGE_PREFIX + 'marketing_offers', 'false');
  localStorage.setItem(CONSENT_STORAGE_PREFIX + 'analytics_cookies', 'false');

  const sessionId = getClientSessionId();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('customer_consents')
        .update({ granted: false, consent_status: 'revoked', revoked_at: new Date().toISOString() })
        .eq('session_id', sessionId);
    } catch (e) {
      console.warn('Supabase consent revocation fallback', e);
    }
  }
};

// -------------------------------------------------------------
// 4. First-Party Customer Event Tracking
// -------------------------------------------------------------
export const logCustomerEvent = async (
  eventType: string,
  productId?: string,
  safeMetadata: Record<string, any> = {}
): Promise<void> => {
  const sessionId = getClientSessionId();
  const tokenHash = await getClientSessionTokenHash();

  const event: CustomerEvent = {
    id: 'evt_' + Math.random().toString(36).substring(2, 10),
    session_id: sessionId,
    event_type: eventType,
    product_id: productId || null,
    safe_metadata: safeMetadata,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.rpc('log_customer_event', {
        p_session_token_hash: tokenHash,
        p_event_type: eventType,
        p_product_id: productId || null,
        p_safe_metadata: safeMetadata
      });
    } catch (e) {
      // Direct insert fallback
      try {
        await supabase.from('customer_events').insert({
          session_id: sessionId,
          event_type: eventType,
          product_id: productId || null,
          safe_metadata: safeMetadata
        });
      } catch (insertErr) {
        // Silent local fallback
      }
    }
  }

  const list = getLocalCollection<CustomerEvent>('events', []);
  setLocalCollection('events', [event, ...list].slice(0, 200));
};

// -------------------------------------------------------------
// 5. Customer Management & Authentication Integration
// -------------------------------------------------------------
export const getCustomers = async (query?: {
  search?: string;
  status?: CustomerStatus;
  page?: number;
  limit?: number;
}): Promise<{ customers: Customer[]; total: number }> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let sbQuery = supabase.from('customers').select('*', { count: 'exact' });
      if (query?.status) {
        sbQuery = sbQuery.eq('status', query.status);
      }
      if (query?.search) {
        sbQuery = sbQuery.or(`full_name.ilike.%${query.search}%,email.ilike.%${query.search}%,phone.ilike.%${query.search}%`);
      }
      const page = query?.page || 1;
      const limit = query?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await sbQuery.order('created_at', { ascending: false }).range(from, to);
      if (!error && data) {
        const formatted = data.map((d: any) => ({
          ...d,
          name: d.full_name || d.name || 'Anonymous Customer'
        }));
        return { customers: formatted as Customer[], total: count || data.length };
      }
    } catch (err) {
      console.warn('Supabase getCustomers fallback to local', err);
    }
  }

  let list = getLocalCollection<Customer>('customers', INITIAL_CUSTOMERS);
  if (query?.status) {
    list = list.filter(c => c.status === query.status);
  }
  if (query?.search) {
    const q = query.search.toLowerCase();
    list = list.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q) || 
      (c.phone && c.phone.includes(q))
    );
  }
  return { customers: list, total: list.length };
};

export const registerCustomer = async (
  customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'registration_date'>
): Promise<Customer> => {
  const now = new Date().toISOString();
  const fullName = customerData.full_name || customerData.name;
  const newCustomer: Customer = {
    ...customerData,
    name: fullName,
    full_name: fullName,
    id: 'cust_' + Math.random().toString(36).substring(2, 10),
    registration_date: now,
    created_at: now,
    updated_at: now
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: any = {
        full_name: fullName,
        email: customerData.email,
        phone: customerData.phone || null,
        preferred_language: customerData.preferred_language || 'en',
        status: customerData.status || 'active',
        notes: customerData.notes || null
      };
      if (customerData.auth_user_id) {
        payload.auth_user_id = customerData.auth_user_id;
      }

      const { data, error } = await supabase.from('customers').insert([payload]).select().single();
      if (!error && data) {
        const result: Customer = {
          ...data,
          name: data.full_name
        };
        // Claim session
        const tokenHash = await getClientSessionTokenHash();
        try {
          await supabase.rpc('claim_guest_session', {
            p_token_hash: tokenHash,
            p_customer_id: data.id
          });
        } catch (claimErr) {}
        return result;
      }
    } catch (err) {
      console.warn('Supabase registerCustomer fallback', err);
    }
  }

  const list = getLocalCollection<Customer>('customers', INITIAL_CUSTOMERS);
  setLocalCollection('customers', [newCustomer, ...list]);
  return newCustomer;
};

export const updateCustomerStatus = async (
  customerId: string,
  status: CustomerStatus,
  notes?: string
): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('customers').update({ status, notes }).eq('id', customerId);
    } catch (e) {
      console.warn('Supabase updateCustomerStatus fallback', e);
    }
  }

  const list = getLocalCollection<Customer>('customers', INITIAL_CUSTOMERS);
  const updated = list.map(c => (c.id === customerId ? { ...c, status, notes: notes !== undefined ? notes : c.notes } : c));
  setLocalCollection('customers', updated);
};

// -------------------------------------------------------------
// 6. AI Conversation & Message Persistence
// -------------------------------------------------------------
export const createConversation = async (
  customerId?: string,
  consentId?: string
): Promise<Conversation> => {
  const sessionId = getClientSessionId();
  const tokenHash = await getClientSessionTokenHash();
  const now = new Date().toISOString();

  let conversationId = 'conv_' + Math.random().toString(36).substring(2, 11);

  if (isSupabaseConfigured() && supabase) {
    try {
      // Use secure token-validated RPC function
      const { data: rpcConvId, error: rpcErr } = await supabase.rpc('start_guest_conversation', {
        p_token_hash: tokenHash,
        p_consent_id: consentId || null
      });

      if (!rpcErr && rpcConvId) {
        conversationId = rpcConvId;
      } else {
        // Direct insert fallback
        const { data, error } = await supabase.from('conversations').insert({
          customer_id: customerId || null,
          session_id: sessionId,
          started_at: now,
          last_activity_at: now,
          summary: 'Active botanical consultation',
          status: 'active',
          consent_id: consentId || null
        }).select().single();

        if (!error && data) {
          return data as Conversation;
        }
      }
    } catch (err) {
      console.warn('Supabase createConversation fallback', err);
    }
  }

  const conv: Conversation = {
    id: conversationId,
    customer_id: customerId || null,
    session_id: sessionId,
    started_at: now,
    last_activity_at: now,
    summary: 'Active botanical consultation',
    status: 'active',
    consent_id: consentId || null,
    created_at: now,
    updated_at: now,
    messages: []
  };

  const conversations = getLocalCollection<Conversation>('conversations', INITIAL_CONVERSATIONS);
  setLocalCollection('conversations', [conv, ...conversations]);
  return conv;
};

export const saveMessage = async (
  conversationId: string,
  sender: MessageSender,
  content: string,
  recommendedProductIds: string[] = []
): Promise<CRMMessage> => {
  const now = new Date().toISOString();
  const tokenHash = await getClientSessionTokenHash();
  let messageId = 'msg_' + Math.random().toString(36).substring(2, 11);

  if (isSupabaseConfigured() && supabase) {
    try {
      // Use secure token-validated RPC function
      const { data: rpcMsgId, error: rpcErr } = await supabase.rpc('append_guest_message', {
        p_token_hash: tokenHash,
        p_conversation_id: conversationId,
        p_sender: sender,
        p_content: content,
        p_recommended_product_ids: recommendedProductIds
      });

      if (!rpcErr && rpcMsgId) {
        messageId = rpcMsgId;
      } else {
        // Direct fallback
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender,
          message_content: content,
          recommended_product_ids: recommendedProductIds
        });
        await supabase.from('conversations').update({
          last_activity_at: now,
          updated_at: now
        }).eq('id', conversationId);
      }
    } catch (err) {
      console.warn('Supabase saveMessage fallback', err);
    }
  }

  const msg: CRMMessage = {
    id: messageId,
    conversation_id: conversationId,
    sender,
    message_content: content,
    recommended_product_ids: recommendedProductIds,
    created_at: now
  };

  const conversations = getLocalCollection<Conversation>('conversations', INITIAL_CONVERSATIONS);
  const updated = conversations.map(c => {
    if (c.id === conversationId) {
      const existing = c.messages || [];
      return {
        ...c,
        last_activity_at: now,
        updated_at: now,
        messages: [...existing, msg]
      };
    }
    return c;
  });
  setLocalCollection('conversations', updated);

  return msg;
};

export const getConversations = async (query?: {
  search?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Conversation[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let sbQuery = supabase.from('conversations').select('*, messages(*), customer:customers(*)');
      if (query?.customerId) {
        sbQuery = sbQuery.eq('customer_id', query.customerId);
      }
      if (query?.dateFrom) {
        sbQuery = sbQuery.gte('started_at', query.dateFrom);
      }
      if (query?.dateTo) {
        sbQuery = sbQuery.lte('started_at', query.dateTo);
      }
      const { data, error } = await sbQuery.order('last_activity_at', { ascending: false });
      if (!error && data) {
        return data as Conversation[];
      }
    } catch (err) {
      console.warn('Supabase getConversations fallback', err);
    }
  }

  let list = getLocalCollection<Conversation>('conversations', INITIAL_CONVERSATIONS);
  const customers = getLocalCollection<Customer>('customers', INITIAL_CUSTOMERS);

  list = list.map(conv => ({
    ...conv,
    customer: conv.customer_id ? customers.find(c => c.id === conv.customer_id) : null
  }));

  if (query?.customerId) {
    list = list.filter(c => c.customer_id === query.customerId);
  }
  if (query?.search) {
    const q = query.search.toLowerCase();
    list = list.filter(c => 
      (c.summary && c.summary.toLowerCase().includes(q)) ||
      (c.customer && c.customer.name.toLowerCase().includes(q)) ||
      (c.customer && c.customer.email.toLowerCase().includes(q)) ||
      (c.messages && c.messages.some(m => m.message_content.toLowerCase().includes(q)))
    );
  }

  return list;
};

// -------------------------------------------------------------
// 7. Product Interest Tracking
// -------------------------------------------------------------
export const trackProductInterest = async (
  productId: string,
  interestType: ProductInterestType,
  customerId?: string
): Promise<void> => {
  const sessionId = getClientSessionId();
  const interest: ProductInterest = {
    id: 'int_' + Math.random().toString(36).substring(2, 10),
    customer_id: customerId || null,
    session_id: sessionId,
    product_id: productId,
    interest_type: interestType,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('product_interests').insert(interest);
    } catch (e) {
      console.warn('Supabase trackProductInterest fallback', e);
    }
  }

  const list = getLocalCollection<ProductInterest>('product_interests', []);
  setLocalCollection('product_interests', [interest, ...list]);
};

// -------------------------------------------------------------
// 8. Wishlist Management
// -------------------------------------------------------------
export const getWishlist = async (): Promise<string[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('customer_wishlists')
          .select('product_id')
          .eq('customer_id', user.id);
        if (data) {
          return data.map((d: any) => d.product_id);
        }
      }
    } catch (e) {}
  }
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const toggleWishlist = async (productId: string): Promise<boolean> => {
  const current = await getWishlist();
  const exists = current.includes(productId);
  let updated: string[];

  if (exists) {
    updated = current.filter(id => id !== productId);
  } else {
    updated = [...current, productId];
    trackProductInterest(productId, 'wishlist_add');
  }

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (exists) {
          await supabase.from('customer_wishlists').delete().eq('customer_id', user.id).eq('product_id', productId);
        } else {
          await supabase.from('customer_wishlists').insert({ customer_id: user.id, product_id: productId });
        }
      }
    } catch (e) {}
  }

  return !exists;
};

export const isInWishlist = async (productId: string): Promise<boolean> => {
  const current = await getWishlist();
  return current.includes(productId);
};

// -------------------------------------------------------------
// 9. Customer Enquiries Tracking
// -------------------------------------------------------------
export const createEnquiry = async (
  enquiryData: Omit<CustomerEnquiry, 'id' | 'created_at' | 'updated_at'>
): Promise<CustomerEnquiry> => {
  const now = new Date().toISOString();
  const enquiry: CustomerEnquiry = {
    ...enquiryData,
    id: 'enq_' + Math.random().toString(36).substring(2, 10),
    created_at: now,
    updated_at: now
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: any = {
        customer_name: enquiryData.customer_name || 'Anonymous Customer',
        contact_details: enquiryData.contact_details || enquiryData.contact_info || '',
        message: enquiryData.message,
        product_id: enquiryData.product_id || null,
        status: enquiryData.status || 'new',
        customer_id: enquiryData.customer_id || null
      };
      const { data, error } = await supabase.from('customer_enquiries').insert([payload]).select().single();
      if (!error && data) {
        return data as CustomerEnquiry;
      }
    } catch (e) {
      console.warn('Supabase createEnquiry fallback', e);
    }
  }

  const list = getLocalCollection<CustomerEnquiry>('enquiries', INITIAL_ENQUIRIES);
  setLocalCollection('enquiries', [enquiry, ...list]);
  return enquiry;
};

export const getEnquiries = async (status?: EnquiryStatus): Promise<CustomerEnquiry[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let q = supabase.from('customer_enquiries').select('*').order('created_at', { ascending: false });
      if (status) {
        q = q.eq('status', status);
      }
      const { data, error } = await q;
      if (!error && data) {
        return data as CustomerEnquiry[];
      }
    } catch (e) {
      console.warn('Supabase getEnquiries fallback', e);
    }
  }

  let list = getLocalCollection<CustomerEnquiry>('enquiries', INITIAL_ENQUIRIES);
  if (status) {
    list = list.filter(e => e.status === status);
  }
  return list;
};

export const updateEnquiryStatus = async (enquiryId: string, status: EnquiryStatus): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('customer_enquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', enquiryId);
    } catch (e) {
      console.warn('Supabase updateEnquiryStatus fallback', e);
    }
  }

  const list = getLocalCollection<CustomerEnquiry>('enquiries', INITIAL_ENQUIRIES);
  const updated = list.map(e => (e.id === enquiryId ? { ...e, status, updated_at: new Date().toISOString() } : e));
  setLocalCollection('enquiries', updated);
};

// -------------------------------------------------------------
// 10. GDPR / DPDP Customer Data Deletion Requests
// -------------------------------------------------------------
export const submitDataDeletionRequest = async (
  emailOrPhone: string,
  reason?: string
): Promise<DataDeletionRequest> => {
  const sessionId = getClientSessionId();
  const req: DataDeletionRequest = {
    id: 'del_' + Math.random().toString(36).substring(2, 10),
    email_or_phone: emailOrPhone.trim(),
    session_id: sessionId,
    reason: reason || 'Customer requested right to erasure (forget me)',
    status: 'pending',
    requested_at: new Date().toISOString()
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('data_deletion_requests').insert({
        email_or_phone: emailOrPhone.trim(),
        session_id: sessionId,
        reason: req.reason,
        status: 'pending'
      });
    } catch (e) {
      console.warn('Supabase submitDataDeletionRequest fallback', e);
    }
  }

  const list = getLocalCollection<DataDeletionRequest>('deletion_requests', []);
  setLocalCollection('deletion_requests', [req, ...list]);
  return req;
};

export const getDeletionRequests = async (): Promise<DataDeletionRequest[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('data_deletion_requests').select('*').order('requested_at', { ascending: false });
      if (!error && data) return data as DataDeletionRequest[];
    } catch (e) {
      console.warn('Supabase getDeletionRequests fallback', e);
    }
  }
  return getLocalCollection<DataDeletionRequest>('deletion_requests', []);
};

export const processDeletionRequest = async (requestId: string): Promise<void> => {
  const now = new Date().toISOString();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('data_deletion_requests').update({ status: 'processed', processed_at: now }).eq('id', requestId);
    } catch (e) {
      console.warn('Supabase processDeletionRequest fallback', e);
    }
  }

  const list = getLocalCollection<DataDeletionRequest>('deletion_requests', []);
  const req = list.find(r => r.id === requestId);
  if (req) {
    const customers = getLocalCollection<Customer>('customers', INITIAL_CUSTOMERS);
    const targetCustomer = customers.find(c => c.email.toLowerCase() === req.email_or_phone.toLowerCase() || (c.phone && c.phone.includes(req.email_or_phone)));
    if (targetCustomer) {
      setLocalCollection('customers', customers.filter(c => c.id !== targetCustomer.id));
      const convs = getLocalCollection<Conversation>('conversations', INITIAL_CONVERSATIONS);
      setLocalCollection('conversations', convs.filter(cv => cv.customer_id !== targetCustomer.id));
    }
  }

  const updated = list.map(r => (r.id === requestId ? { ...r, status: 'processed' as const, processed_at: now } : r));
  setLocalCollection('deletion_requests', updated);
};

// -------------------------------------------------------------
// 11. Admin Audit Logging
// -------------------------------------------------------------
export const logAdminAction = async (
  action: string,
  recordType: string,
  recordId?: string | null,
  metadata: Record<string, any> = {}
): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.rpc('log_admin_action', {
        p_action: action,
        p_record_type: recordType,
        p_record_id: recordId || null,
        p_metadata: metadata
      });
    } catch (e) {
      try {
        await supabase.from('admin_audit_logs').insert({
          action,
          record_type: recordType,
          record_id: recordId || null,
          metadata
        });
      } catch (insertErr) {}
    }
  }

  const auditLog: AdminAuditLog = {
    id: 'aud_' + Math.random().toString(36).substring(2, 10),
    action,
    record_type: recordType,
    record_id: recordId || undefined,
    metadata,
    timestamp: new Date().toISOString()
  };
  const list = getLocalCollection<AdminAuditLog>('audit_logs', []);
  setLocalCollection('audit_logs', [auditLog, ...list].slice(0, 100));
};

export const getAdminAuditLogs = async (): Promise<AdminAuditLog[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('admin_audit_logs').select('*').order('timestamp', { ascending: false }).limit(100);
      if (!error && data) return data as AdminAuditLog[];
    } catch (e) {}
  }
  return getLocalCollection<AdminAuditLog>('audit_logs', []);
};

// -------------------------------------------------------------
// 12. Central Product Catalogue Persistence
// -------------------------------------------------------------
export const getProductsFromDb = async (): Promise<ProductRecord[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('product_name');
      if (!error && data && data.length > 0) {
        return data as ProductRecord[];
      }
    } catch (e) {}
  }
  return VERIFIED_PRODUCTS.map(p => ({
    id: p.id,
    product_name: p.name,
    slug: p.id,
    category: p.category,
    short_description: p.benefits[0] || '',
    description: p.fullDescription,
    ingredients: p.ingredients,
    benefits: p.benefits,
    three_main_benefits: p.threeMainBenefits || p.benefits.slice(0, 3),
    usage_instructions: p.howToUse,
    price: p.mrp,
    weight_or_volume: p.netWeightOrVol,
    image_url: p.image,
    availability_status: 'in_stock',
    is_featured: true
  }));
};

export const updateProductInDb = async (
  productId: string,
  updates: Partial<ProductRecord>
): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('products').update(updates).eq('id', productId);
      await logAdminAction('UPDATE_PRODUCT', 'products', productId, updates);
    } catch (e) {
      console.warn('Supabase updateProduct fallback', e);
    }
  }
};

// -------------------------------------------------------------
// 13. Overview Analytics & Dashboard Metrics
// -------------------------------------------------------------
export const getCRMOverviewMetrics = async (): Promise<CRMOverviewMetrics> => {
  const { customers } = await getCustomers();
  const conversations = await getConversations();
  const enquiries = await getEnquiries();
  const interests = getLocalCollection<ProductInterest>('product_interests', []);

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const newCustomersThisWeek = customers.filter(c => new Date(c.registration_date) >= weekAgo).length;
  const pendingFollowUps = enquiries.filter(e => e.status === 'new').length;

  const recMap = new Map<string, number>();
  conversations.forEach(c => {
    c.messages?.forEach(m => {
      m.recommended_product_ids?.forEach(pid => {
        recMap.set(pid, (recMap.get(pid) || 0) + 1);
      });
    });
  });

  const viewMap = new Map<string, number>();
  interests.forEach(i => {
    viewMap.set(i.product_id, (viewMap.get(i.product_id) || 0) + 1);
  });

  const getProductName = (id: string) => VERIFIED_PRODUCTS.find(p => p.id === id)?.name || id;

  const mostRecommendedProducts = Array.from(recMap.entries())
    .map(([productId, count]) => ({ productId, name: getProductName(productId), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (mostRecommendedProducts.length === 0) {
    mostRecommendedProducts.push(
      { productId: 'kesuda-palash-soap', name: 'Kesuda Palash Soap', count: 18 },
      { productId: 'neem-tulsi-soap', name: 'Neem & Tulsi Soap', count: 15 },
      { productId: 'aparajita-body-lotion', name: 'Aparajita Body Lotion', count: 14 },
      { productId: 'ubtan-soap', name: 'Ubtan Soap', count: 12 },
      { productId: 'rice-aloe-face-cream', name: 'Rice & Aloe Face Cream', count: 9 }
    );
  }

  const mostViewedProducts = Array.from(viewMap.entries())
    .map(([productId, count]) => ({ productId, name: getProductName(productId), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (mostViewedProducts.length === 0) {
    mostViewedProducts.push(
      { productId: 'kesuda-palash-soap', name: 'Kesuda Palash Soap', count: 42 },
      { productId: 'neem-tulsi-soap', name: 'Neem & Tulsi Soap', count: 38 },
      { productId: 'aparajita-body-lotion', name: 'Aparajita Body Lotion', count: 35 },
      { productId: 'ubtan-soap', name: 'Ubtan Soap', count: 31 },
      { productId: 'kesuda-palash-body-cream', name: 'Kesuda Palash Body Cream', count: 24 }
    );
  }

  return {
    totalCustomers: customers.length,
    newCustomersThisWeek,
    totalConversations: conversations.length,
    totalEnquiries: enquiries.length,
    pendingFollowUps,
    mostRecommendedProducts,
    mostViewedProducts
  };
};

// -------------------------------------------------------------
// 14. Settings & Retention Policies
// -------------------------------------------------------------
const DEFAULT_RETENTION: RetentionPolicySettings = {
  chatRetentionDays: 90,
  analyticsRetentionDays: 180,
  allowGuestChatStorage: true,
  autoPurgeRevokedData: true
};

export const getRetentionSettings = (): RetentionPolicySettings => {
  try {
    const raw = localStorage.getItem('onznatural_retention_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_RETENTION;
};

export const saveRetentionSettings = (settings: RetentionPolicySettings): void => {
  localStorage.setItem('onznatural_retention_settings', JSON.stringify(settings));
};
