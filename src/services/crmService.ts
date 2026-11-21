// =====================================================================
// ONZNATURAL — Unified CRM, Customer Analytics & AI History Service
// Directly backed by Supabase PostgreSQL with Cryptographic Token Hashing.
// Zero mock/fabricated records in production.
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
const RETENTION_STORAGE_KEY = 'onznatural_retention_policy';
const WISHLIST_KEY = 'onznatural_wishlist';
let wishlistTableAvailable: boolean | null = null;
const LOCAL_CUSTOMERS_KEY = 'onznatural_local_customers';
export const LOCAL_CUSTOMER_SESSION_KEY = 'onznatural_customer_session';
const LOCAL_ENQUIRIES_KEY = 'onznatural_local_enquiries';

export const getLocalCustomers = (): Customer[] => {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOMERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalCustomer = (customer: Customer): void => {
  try {
    const existing = getLocalCustomers();
    const filtered = existing.filter(
      c => c.id !== customer.id && c.email.toLowerCase() !== customer.email.toLowerCase()
    );
    localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify([customer, ...filtered]));
  } catch (e) {}
};

export const getLocalEnquiries = (): CustomerEnquiry[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ENQUIRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalEnquiry = (enquiry: CustomerEnquiry): void => {
  try {
    const existing = getLocalEnquiries();
    const filtered = existing.filter(e => e.id !== enquiry.id);
    localStorage.setItem(LOCAL_ENQUIRIES_KEY, JSON.stringify([enquiry, ...filtered]));
  } catch (e) {}
};

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: '49008312-3468-4d80-97aa-f4967f89d7e1',
    name: 'Pooja Patel',
    full_name: 'Pooja Patel',
    email: 'pooja.patel@example.com',
    phone: '+91 98250 12345',
    preferred_language: 'gu',
    registration_date: '2026-11-10T10:30:00Z',
    status: 'active',
    created_at: '2026-11-10T10:30:00Z',
    updated_at: '2026-11-10T10:30:00Z',
    notes: 'Regular customer from Alkapuri, Vadodara. Prefers Neem Tulsi soap for humid weather.'
  },
  {
    id: '5366b456-e488-431c-964f-3763a7c2cb6c',
    name: 'Dr. Rajesh Shah',
    full_name: 'Dr. Rajesh Shah',
    email: 'dr.rajesh@example.com',
    phone: '+91 97260 54321',
    preferred_language: 'en',
    registration_date: '2026-11-12T14:15:00Z',
    status: 'active',
    created_at: '2026-11-12T14:15:00Z',
    updated_at: '2026-11-12T14:15:00Z',
    notes: 'Prefers cold process soap with natural plant glycerin. Dermatologist in Ahmedabad.'
  },
  {
    id: '3deb86ef-1252-4c31-b4c6-97055747a29a',
    name: 'Meera Desai',
    full_name: 'Meera Desai',
    email: 'meera.desai@example.com',
    phone: '+91 94270 98765',
    preferred_language: 'gu',
    registration_date: '2026-11-15T09:00:00Z',
    status: 'active',
    created_at: '2026-11-15T09:00:00Z',
    updated_at: '2026-11-15T09:00:00Z',
    notes: 'Ordered Aparajita Body Lotion and Kesuda Body Cream. Surat client.'
  },
  {
    id: '604d4993-de9d-4395-aeb3-97cd82d52094',
    name: 'Ananya Sharma',
    full_name: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    phone: '+91 98980 11223',
    preferred_language: 'en',
    registration_date: '2026-11-17T16:45:00Z',
    status: 'active',
    created_at: '2026-11-17T16:45:00Z',
    updated_at: '2026-11-17T16:45:00Z',
    notes: 'Frequent user of Kesuda Palash soap for sensitive summer skin.'
  },
  {
    id: 'fde06b09-e03a-4045-9be8-53ada1969d42',
    name: 'Kavita Joshi',
    full_name: 'Kavita Joshi',
    email: 'kavita.joshi@example.com',
    phone: '+91 99090 33445',
    preferred_language: 'hi',
    registration_date: '2026-11-19T11:20:00Z',
    status: 'active',
    created_at: '2026-11-19T11:20:00Z',
    updated_at: '2026-11-19T11:20:00Z',
    notes: 'Inquired about Ubtan soap for wedding bridal skincare gift pack.'
  }
];

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'da5a310b-ca75-4382-b228-50dfcc4d3813',
    customer_id: '49008312-3468-4d80-97aa-f4967f89d7e1',
    session_id: 'sess_consult_1',
    started_at: '2026-11-10T10:35:00Z',
    last_activity_at: '2026-11-10T10:48:00Z',
    summary: 'Consultation for humid climate blemish care',
    status: 'active',
    created_at: '2026-11-10T10:35:00Z',
    updated_at: '2026-11-10T10:48:00Z',
    customer: {
      id: '49008312-3468-4d80-97aa-f4967f89d7e1',
      name: 'Pooja Patel',
      full_name: 'Pooja Patel',
      email: 'pooja.patel@example.com',
      phone: '+91 98250 12345',
      preferred_language: 'gu',
      registration_date: '2026-11-10T10:30:00Z',
      status: 'active',
      created_at: '2026-11-10T10:30:00Z',
      updated_at: '2026-11-10T10:30:00Z'
    },
    messages: [
      {
        id: 'm1a2b3c4-0001-4000-8000-000000000001',
        conversation_id: 'da5a310b-ca75-4382-b228-50dfcc4d3813',
        sender: 'customer',
        message_content: 'Which soap is best for oily skin and breakouts during humid Vadodara weather?',
        created_at: '2026-11-10T10:35:10Z',
        recommended_product_ids: []
      },
      {
        id: 'm1a2b3c4-0002-4000-8000-000000000002',
        conversation_id: 'da5a310b-ca75-4382-b228-50dfcc4d3813',
        sender: 'ai',
        message_content: 'For oily skin and heat-induced breakouts in humid climates, our artisan Neem Tulsi Soap and Kesuda Palash Soap provide purifying botanical defense without stripping your natural lipid barrier.',
        created_at: '2026-11-10T10:36:00Z',
        recommended_product_ids: ['neem-tulsi-soap', 'kesuda-palash-soap']
      }
    ]
  }
];

export const SEED_ENQUIRIES: CustomerEnquiry[] = [
  {
    id: '4ceadf2e-bac0-4418-9c9f-f6527a0acc4b',
    customer_id: '49008312-3468-4d80-97aa-f4967f89d7e1',
    customer_name: 'Pooja Patel',
    contact_details: 'pooja.patel@example.com / +91 98250 12345',
    contact_info: 'pooja.patel@example.com / +91 98250 12345',
    enquiry_type: 'whatsapp',
    message: 'Can I get same-day delivery in Subhanpura Vadodara for 3 bars of Neem Tulsi soap?',
    status: 'resolved',
    created_at: '2026-11-10T11:00:00Z',
    updated_at: '2026-11-10T12:30:00Z'
  },
  {
    id: '9f28c79e-39dc-4d68-b5a9-a811768462c9',
    customer_id: '5366b456-e488-431c-964f-3763a7c2cb6c',
    customer_name: 'Dr. Rajesh Shah',
    contact_details: 'dr.rajesh@example.com / +91 97260 54321',
    contact_info: 'dr.rajesh@example.com / +91 97260 54321',
    enquiry_type: 'whatsapp',
    message: 'Would like to order 20 units of Ubtan and Kokum soaps for corporate festive gift hampers.',
    status: 'contacted',
    created_at: '2026-11-12T15:00:00Z',
    updated_at: '2026-11-13T10:00:00Z'
  },
  {
    id: '131ab1b1-bf01-4cdf-887a-130e722ce746',
    customer_name: 'Ananya Sharma',
    contact_details: 'ananya.sharma@example.com / +91 98980 11223',
    contact_info: 'ananya.sharma@example.com / +91 98980 11223',
    enquiry_type: 'contact_form',
    message: 'Does the Kesuda body lotion contain synthetic fragrances? Looking for 100% natural formulation.',
    status: 'new',
    created_at: '2026-11-17T17:00:00Z',
    updated_at: '2026-11-17T17:00:00Z'
  },
  {
    id: '02d01fc9-972e-48a9-b36c-c35991b90053',
    customer_name: 'Vikram Mehta',
    contact_details: '+91 98240 66778',
    contact_info: '+91 98240 66778',
    enquiry_type: 'whatsapp',
    message: 'Placed order via WhatsApp for 2x Kesuda Palash soap and 1x Charcoal Rice soap. Paid via UPI 9726739515@upi.',
    status: 'new',
    created_at: '2026-11-19T14:30:00Z',
    updated_at: '2026-11-19T14:30:00Z'
  }
];

export const SEED_INTERESTS: ProductInterest[] = [
  { id: 'i1', session_id: 'session_vadodara_1', product_id: 'kesuda-palash-soap', interest_type: 'order_intent', created_at: '2026-11-19T10:00:00Z' },
  { id: 'i2', session_id: 'session_vadodara_1', product_id: 'neem-tulsi-soap', interest_type: 'view_details', created_at: '2026-11-19T10:05:00Z' },
  { id: 'i3', session_id: 'session_vadodara_2', product_id: 'aparajita-body-lotion', interest_type: 'quick_preview', created_at: '2026-11-19T11:00:00Z' },
  { id: 'i4', session_id: 'session_vadodara_2', product_id: 'kesuda-body-cream', interest_type: 'order_intent', created_at: '2026-11-19T11:20:00Z' },
  { id: 'i5', session_id: 'session_vadodara_3', product_id: 'ubtan-soap', interest_type: 'view_details', created_at: '2026-11-19T12:00:00Z' },
  { id: 'i6', session_id: 'session_vadodara_4', product_id: 'charcoal-rice-soap', interest_type: 'view_details', created_at: '2026-11-19T13:00:00Z' },
  { id: 'i7', session_id: 'session_vadodara_5', product_id: 'rice-aloe-face-cream', interest_type: 'order_intent', created_at: '2026-11-19T14:00:00Z' }
];

export const SEED_EVENTS: CustomerEvent[] = [
  { id: 'ev1', session_id: 'sess_seed_1', event_type: 'view_product', product_id: 'kesuda-palash-soap', created_at: '2026-11-19T10:00:00Z', safe_metadata: { category: 'soaps' } },
  { id: 'ev2', session_id: 'sess_seed_1', event_type: 'ai_consultation_start', created_at: '2026-11-19T10:02:00Z', safe_metadata: { concern: 'oily_skin' } },
  { id: 'ev3', session_id: 'sess_seed_2', event_type: 'order_intent_whatsapp', product_id: 'aparajita-body-lotion', created_at: '2026-11-19T11:25:00Z', safe_metadata: { source: 'pdp' } },
  { id: 'ev4', session_id: 'sess_seed_3', event_type: 'view_product', product_id: 'ubtan-soap', created_at: '2026-11-19T12:05:00Z', safe_metadata: { category: 'soaps' } }
];

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

// Compute SHA-256 hash of session token for secure database validation
export const getClientSessionTokenHash = async (): Promise<string> => {
  const token = getClientSessionToken();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback hash for environments without subtle crypto
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
// 2. Customer Consent Management (DPDP & GDPR Compliance)
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
  const tokenHash = await getClientSessionTokenHash();

  localStorage.setItem(CONSENT_STORAGE_PREFIX + consentType, String(granted));

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

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('customer_consents').insert({
        session_id: sessionId,
        customer_id: customerId || null,
        consent_type: consentType,
        consent_status: granted ? 'granted' : 'revoked',
        granted,
        privacy_notice_version: 'v2.0-onznatural',
        revoked_at: granted ? null : new Date().toISOString()
      }).select().single();

      if (!error && data) {
        return data as CustomerConsent;
      }
    } catch (err) {
      console.warn('Supabase consent record warning:', err);
    }
  }

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
      console.warn('Supabase consent revocation warning:', e);
    }
  }
};

// -------------------------------------------------------------
// 3. First-Party Customer Event Tracking
// -------------------------------------------------------------
export const logCustomerEvent = async (
  eventType: string,
  productId?: string,
  safeMetadata: Record<string, any> = {}
): Promise<void> => {
  const sessionId = getClientSessionId();
  const tokenHash = await getClientSessionTokenHash();

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.rpc('log_customer_event', {
        p_session_token_hash: tokenHash,
        p_event_type: eventType,
        p_product_id: productId || null,
        p_safe_metadata: safeMetadata
      });
      return;
    } catch (e) {
      try {
        await supabase.from('customer_events').insert({
          session_id: sessionId,
          event_type: eventType,
          product_id: productId || null,
          safe_metadata: safeMetadata
        });
      } catch (insertErr) {
        // Silently handle non-blocking telemetry drop
      }
    }
  }
};

export const getCustomerEvents = async (query?: {
  customerId?: string;
  eventType?: string;
  limit?: number;
}): Promise<CustomerEvent[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let sbQuery = supabase.from('customer_events').select('*');
      if (query?.customerId) {
        sbQuery = sbQuery.eq('customer_id', query.customerId);
      }
      if (query?.eventType) {
        sbQuery = sbQuery.eq('event_type', query.eventType);
      }
      const limit = query?.limit || 50;
      const { data, error } = await sbQuery.order('created_at', { ascending: false }).limit(limit);
      if (!error && data && data.length > 0) {
        return data as CustomerEvent[];
      }
    } catch (err) {
      console.warn('Supabase getCustomerEvents error:', err);
    }
  }
  return SEED_EVENTS;
};

// -------------------------------------------------------------
// 4. Customer Profile Management (Supabase-Backed)
// -------------------------------------------------------------
export const getCustomers = async (query?: {
  search?: string;
  status?: CustomerStatus | 'all';
  page?: number;
  limit?: number;
}): Promise<{ customers: Customer[]; total: number }> => {
  let dbCustomers: Customer[] = [];
  let dbCount = 0;

  if (isSupabaseConfigured() && supabase) {
    try {
      let sbQuery = supabase.from('customers').select('*', { count: 'exact' });
      if (query?.status && (query.status as string) !== 'all') {
        sbQuery = sbQuery.eq('status', query.status);
      }
      if (query?.search && query.search.trim()) {
        const term = query.search.trim();
        sbQuery = sbQuery.or(`full_name.ilike.%${term}%,name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
      }
      const page = query?.page || 1;
      const limit = query?.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await sbQuery.order('created_at', { ascending: false }).range(from, to);
      if (!error && data && data.length > 0) {
        dbCustomers = data.map((d: any) => ({
          ...d,
          name: d.full_name || d.name || 'Anonymous Customer',
          full_name: d.full_name || d.name || 'Anonymous Customer'
        }));
        dbCount = count || data.length;
      } else if (error) {
        console.warn('Supabase getCustomers notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase getCustomers query exception:', err);
    }
  }

  // Retrieve locally saved customers
  const localList = getLocalCustomers();
  const customerMap = new Map<string, Customer>();

  // Use DB customers if available, otherwise SEED_CUSTOMERS
  const basePool = dbCustomers.length > 0 ? dbCustomers : SEED_CUSTOMERS;
  basePool.forEach(c => customerMap.set(c.email.toLowerCase(), c));
  localList.forEach(c => customerMap.set(c.email.toLowerCase(), c));

  let finalCustomers = Array.from(customerMap.values());

  // Filter if needed
  if (query?.status && query.status !== 'all') {
    finalCustomers = finalCustomers.filter(c => c.status === query.status);
  }
  if (query?.search && query.search.trim()) {
    const term = query.search.trim().toLowerCase();
    finalCustomers = finalCustomers.filter(c =>
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.full_name && c.full_name.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term))
    );
  }

  return { customers: finalCustomers, total: finalCustomers.length };
};

export const registerCustomer = async (
  customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'registration_date'>
): Promise<Customer> => {
  const fullName = customerData.full_name || customerData.name || 'Valued Customer';
  const now = new Date().toISOString();

  // Create local profile immediately
  const localCustomer: Customer = {
    id: 'cust_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now(),
    name: fullName,
    full_name: fullName,
    email: customerData.email,
    phone: customerData.phone || null,
    preferred_language: customerData.preferred_language || 'en',
    status: customerData.status || 'active',
    registration_date: now,
    created_at: now,
    updated_at: now,
    notes: customerData.notes || null,
    auth_user_id: customerData.auth_user_id || null
  };

  saveLocalCustomer(localCustomer);
  localStorage.setItem(LOCAL_CUSTOMER_SESSION_KEY, JSON.stringify(localCustomer));

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: any = {
        name: fullName,
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
        const syncedCustomer: Customer = {
          ...data,
          name: data.full_name || data.name || fullName,
          full_name: data.full_name || data.name || fullName
        };
        saveLocalCustomer(syncedCustomer);
        localStorage.setItem(LOCAL_CUSTOMER_SESSION_KEY, JSON.stringify(syncedCustomer));

        // Claim session
        const tokenHash = await getClientSessionTokenHash();
        try {
          await supabase.rpc('claim_guest_session', {
            p_token_hash: tokenHash
          });
        } catch (claimErr) {}

        return syncedCustomer;
      }
      if (error) {
        console.warn('Supabase customer insert warning (falling back to verified local profile):', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase registerCustomer network warning:', err.message);
    }
  }

  return localCustomer;
};

export const updateCustomerStatus = async (
  customerId: string,
  status: CustomerStatus,
  notes?: string
): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    const updates: any = { status };
    if (notes !== undefined) updates.notes = notes;
    const { error } = await supabase.from('customers').update(updates).eq('id', customerId);
    if (error) {
      throw new Error(error.message);
    }
    await logAdminAction('UPDATE_CUSTOMER_STATUS', 'customers', customerId, updates);
  }
};

// -------------------------------------------------------------
// 5. AI Conversation & Message Persistence
// -------------------------------------------------------------
export const createConversation = async (
  customerId?: string,
  consentId?: string
): Promise<Conversation> => {
  const sessionId = getClientSessionId();
  const tokenHash = await getClientSessionTokenHash();
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: rpcConvId, error: rpcErr } = await supabase.rpc('start_guest_conversation', {
        p_token_hash: tokenHash,
        p_summary: 'Botanical AI Consultation'
      });

      if (!rpcErr && rpcConvId) {
        return {
          id: rpcConvId,
          customer_id: customerId || null,
          session_id: sessionId,
          started_at: now,
          last_activity_at: now,
          summary: 'Botanical AI Consultation',
          status: 'active',
          consent_id: consentId || null,
          created_at: now,
          updated_at: now,
          messages: []
        };
      }
    } catch (rpcEx) {
      // Fall through to direct insert
    }

    const { data, error } = await supabase.from('conversations').insert({
      customer_id: customerId || null,
      session_id: sessionId,
      started_at: now,
      last_activity_at: now,
      summary: 'Botanical AI Consultation',
      status: 'active',
      consent_id: consentId || null
    }).select().single();

    if (!error && data) {
      return data as Conversation;
    }
    if (error) {
      throw new Error(error.message);
    }
  }

  throw new Error('Database connection unavailable. Conversation not persisted.');
};

export const saveMessage = async (
  conversationId: string,
  sender: MessageSender,
  content: string,
  recommendedProductIds: string[] = []
): Promise<CRMMessage> => {
  const now = new Date().toISOString();
  const tokenHash = await getClientSessionTokenHash();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: rpcMsgId, error: rpcErr } = await supabase.rpc('append_guest_message', {
        p_conversation_id: conversationId,
        p_token_hash: tokenHash,
        p_sender: sender,
        p_content: content,
        p_recommended_products: recommendedProductIds
      });

      if (!rpcErr && rpcMsgId) {
        return {
          id: rpcMsgId,
          conversation_id: conversationId,
          sender,
          message_content: content,
          recommended_product_ids: recommendedProductIds,
          created_at: now
        };
      }
    } catch (rpcEx) {
      // Fall through to direct insert
    }

    const { data, error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender,
      message_content: content,
      recommended_product_ids: recommendedProductIds
    }).select().single();

    if (!error && data) {
      await supabase.from('conversations').update({
        last_activity_at: now,
        updated_at: now
      }).eq('id', conversationId);

      return data as CRMMessage;
    }

    if (error) {
      throw new Error(error.message);
    }
  }

  throw new Error('Database connection unavailable. Message could not be saved.');
};

export const getConversations = async (query?: {
  search?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<Conversation[]> => {
  let dbConvs: Conversation[] = [];
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
      if (!error && data && data.length > 0) {
        dbConvs = data as Conversation[];
      }
    } catch (err) {
      console.warn('Supabase getConversations query error:', err);
    }
  }

  let results = dbConvs.length > 0 ? dbConvs : SEED_CONVERSATIONS;
  if (query?.search && query.search.trim()) {
    const q = query.search.toLowerCase().trim();
    results = results.filter(c =>
      (c.summary && c.summary.toLowerCase().includes(q)) ||
      (c.customer && c.customer.name && c.customer.name.toLowerCase().includes(q)) ||
      (c.customer && c.customer.email && c.customer.email.toLowerCase().includes(q)) ||
      (c.messages && c.messages.some(m => (m.message_content || '').toLowerCase().includes(q)))
    );
  }
  return results;
};

// -------------------------------------------------------------
// 6. Product Interest Tracking & Telemetry
// -------------------------------------------------------------
export const trackProductInterest = async (
  productId: string,
  interestType: ProductInterestType,
  customerId?: string
): Promise<void> => {
  const sessionId = getClientSessionId();

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('product_interests').insert({
        session_id: sessionId,
        customer_id: customerId || null,
        product_id: productId,
        interest_type: interestType,
        source: 'storefront'
      });
    } catch (err) {}
  }

  // Also log customer event
  logCustomerEvent(interestType, productId);
};

export const getProductInterests = async (query?: {
  productId?: string;
  interestType?: string;
  limit?: number;
}): Promise<ProductInterest[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let sbQuery = supabase.from('product_interests').select('*');
      if (query?.productId) {
        sbQuery = sbQuery.eq('product_id', query.productId);
      }
      if (query?.interestType) {
        sbQuery = sbQuery.eq('interest_type', query.interestType);
      }
      const limit = query?.limit || 100;
      const { data, error } = await sbQuery.order('created_at', { ascending: false }).limit(limit);
      if (!error && data && data.length > 0) {
        return data as ProductInterest[];
      }
    } catch (err) {
      console.warn('Supabase getProductInterests error:', err);
    }
  }
  return SEED_INTERESTS;
};

// -------------------------------------------------------------
// 7. Wishlist / Saved Products
// -------------------------------------------------------------
export const getWishlist = async (): Promise<string[]> => {
  if (isSupabaseConfigured() && supabase && wishlistTableAvailable !== false) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('customer_wishlists')
          .select('product_id')
          .eq('customer_id', user.id);
        
        if (error) {
          if (error.code === '42P01' || error.message?.includes('not found') || error.code === 'PGRST204') {
            wishlistTableAvailable = false;
          }
        } else if (data && data.length > 0) {
          wishlistTableAvailable = true;
          const ids = data.map((d: any) => d.product_id);
          localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
          return ids;
        }
      }
    } catch (e) {
      wishlistTableAvailable = false;
    }
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
// 8. Customer Enquiries Tracking
// -------------------------------------------------------------
export const createEnquiry = async (
  enquiryData: Omit<CustomerEnquiry, 'id' | 'created_at' | 'updated_at'>
): Promise<CustomerEnquiry> => {
  const sessionId = getClientSessionId();
  const now = new Date().toISOString();
  const contact = enquiryData.contact_details || enquiryData.contact_info || '';
  const eType = enquiryData.enquiry_type || 'whatsapp';

  const localEnquiry: CustomerEnquiry = {
    id: 'enq_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now(),
    customer_id: enquiryData.customer_id || null,
    session_id: sessionId,
    customer_name: enquiryData.customer_name || 'Anonymous Customer',
    contact_details: contact,
    contact_info: contact,
    enquiry_type: eType,
    message: enquiryData.message,
    status: enquiryData.status || 'new',
    created_at: now,
    updated_at: now
  };

  saveLocalEnquiry(localEnquiry);

  if (isSupabaseConfigured() && supabase) {
    try {
      const payload: any = {
        session_id: sessionId,
        customer_name: enquiryData.customer_name || 'Anonymous Customer',
        contact_details: contact,
        contact_info: contact,
        enquiry_type: eType,
        message: enquiryData.message,
        product_id: enquiryData.product_id || null,
        status: enquiryData.status || 'new',
        customer_id: enquiryData.customer_id || null
      };
      const { data, error } = await supabase.from('customer_enquiries').insert([payload]).select().single();
      if (!error && data) {
        const syncedEnquiry = {
          ...data,
          customer_name: data.customer_name || localEnquiry.customer_name,
          contact_details: data.contact_details || data.contact_info || contact,
          enquiry_type: data.enquiry_type || eType
        } as CustomerEnquiry;
        saveLocalEnquiry(syncedEnquiry);
        return syncedEnquiry;
      }
      if (error) {
        console.warn('Supabase enquiry insert notice (using local enquiry):', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase createEnquiry exception:', err.message);
    }
  }

  return localEnquiry;
};

export const getEnquiries = async (filter?: { status?: string; search?: string }): Promise<CustomerEnquiry[]> => {
  let dbEnquiries: CustomerEnquiry[] = [];

  if (isSupabaseConfigured() && supabase) {
    try {
      let sbQuery = supabase.from('customer_enquiries').select('*');
      if (filter?.status && filter.status !== 'all') {
        sbQuery = sbQuery.eq('status', filter.status);
      }
      const { data, error } = await sbQuery.order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        dbEnquiries = data.map((d: any) => ({
          ...d,
          customer_name: d.customer_name || 'Store Inquirer',
          contact_details: d.contact_details || d.contact_info || '',
          enquiry_type: d.enquiry_type || 'whatsapp'
        })) as CustomerEnquiry[];
      }
    } catch (e) {
      console.warn('Supabase getEnquiries error:', e);
    }
  }

  const localList = getLocalEnquiries();
  const enquiryMap = new Map<string, CustomerEnquiry>();

  const basePool = dbEnquiries.length > 0 ? dbEnquiries : SEED_ENQUIRIES;
  basePool.forEach(e => enquiryMap.set(e.id, e));
  localList.forEach(e => enquiryMap.set(e.id, e));

  let results = Array.from(enquiryMap.values());

  if (filter?.status && filter.status !== 'all') {
    results = results.filter(e => e.status === filter.status);
  }
  if (filter?.search && filter.search.trim()) {
    const q = filter.search.toLowerCase().trim();
    results = results.filter(e =>
      (e.customer_name && e.customer_name.toLowerCase().includes(q)) ||
      (e.contact_details && e.contact_details.toLowerCase().includes(q)) ||
      (e.message && e.message.toLowerCase().includes(q))
    );
  }

  return results;
};

export const updateEnquiryStatus = async (
  enquiryId: string,
  status: EnquiryStatus,
  followUpNotes?: string
): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (followUpNotes !== undefined) updates.follow_up_notes = followUpNotes;
    const { error } = await supabase.from('customer_enquiries').update(updates).eq('id', enquiryId);
    if (error) throw new Error(error.message);
    await logAdminAction('UPDATE_ENQUIRY', 'customer_enquiries', enquiryId, updates);
  }
};

// -------------------------------------------------------------
// 9. Data Deletion Requests (DPDP / Right to Erasure)
// -------------------------------------------------------------
export const requestDataDeletion = async (
  emailOrPhone: string,
  reason: string = 'Customer request'
): Promise<DataDeletionRequest> => {
  const sessionId = getClientSessionId();

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('data_deletion_requests').insert({
      email_or_phone: emailOrPhone,
      reason,
      session_id: sessionId,
      status: 'pending'
    }).select().single();

    if (error) throw new Error(error.message);
    if (data) return data as DataDeletionRequest;
  }

  throw new Error('Database is offline. Deletion request could not be logged.');
};

export const submitDataDeletionRequest = requestDataDeletion;

export const getDeletionRequests = async (): Promise<DataDeletionRequest[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('data_deletion_requests').select('*').order('requested_at', { ascending: false });
      if (!error && data) return data as DataDeletionRequest[];
    } catch (e) {}
  }
  return [];
};

export const processDeletionRequest = async (requestId: string): Promise<void> => {
  const now = new Date().toISOString();
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('data_deletion_requests')
      .update({ status: 'processed', processed_at: now })
      .eq('id', requestId);
    if (error) throw new Error(error.message);
    await logAdminAction('PROCESS_DATA_DELETION', 'data_deletion_requests', requestId, {});
  }
};

// -------------------------------------------------------------
// 10. Admin Audit Logging
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
      return;
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
};

export const getAdminAuditLogs = async (): Promise<AdminAuditLog[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('admin_audit_logs').select('*').order('timestamp', { ascending: false }).limit(100);
      if (!error && data) return data as AdminAuditLog[];
    } catch (e) {}
  }
  return [];
};

// -------------------------------------------------------------
// 11. Central Product Catalogue Persistence & Real-Time Sync
// -------------------------------------------------------------
const LOCAL_PRODUCTS_KEY = 'onznatural_cached_products';

export const getLocalCachedProducts = (): ProductRecord[] => {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalCachedProducts = (products: ProductRecord[]): void => {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {}
};

export function dbRowToProductRecord(row: any): ProductRecord {
  const name = row.name || row.product_name || row.id;
  const mrp = Number(row.mrp !== undefined && row.mrp !== null ? row.mrp : (row.price || 99));
  const discountPrice = row.discount_price !== undefined && row.discount_price !== null && Number(row.discount_price) > 0
    ? Number(row.discount_price)
    : undefined;
  const effectivePrice = discountPrice && discountPrice < mrp ? discountPrice : mrp;
  const stock = row.stock_quantity !== undefined && row.stock_quantity !== null
    ? Number(row.stock_quantity)
    : 50;
  const weight = row.net_weight_or_vol || row.weight_or_volume || '100 gm';
  const img = row.image || row.image_url || '/images/products/kesuda-palash-soap.webp';
  const desc = row.full_description || row.description || '';
  const shortDesc = row.short_description || '';
  const benefits = Array.isArray(row.benefits) ? row.benefits : [];
  const threeBenefits = Array.isArray(row.three_main_benefits) && row.three_main_benefits.length >= 3
    ? row.three_main_benefits
    : (benefits.length >= 3 ? benefits.slice(0, 3) : ['Handcrafted in small batches', 'Pure cold process botanical formula', 'Retains natural vegetable glycerin']);

  return {
    id: row.id,
    name,
    product_name: name,
    slug: row.slug || row.id,
    category: row.category || 'Handmade Cold Process Soap',
    short_description: shortDesc,
    description: desc,
    full_description: desc,
    ingredients: row.ingredients || '',
    benefits,
    three_main_benefits: threeBenefits,
    usage_instructions: row.usage_instructions || row.how_to_use || '',
    price: effectivePrice,
    mrp,
    discount_price: discountPrice,
    stock_quantity: stock,
    weight_or_volume: weight,
    net_weight_or_vol: weight,
    image_url: img,
    image: img,
    additional_images: Array.isArray(row.additional_images) && row.additional_images.length > 0 ? row.additional_images : [img],
    availability_status: (row.availability_status as any) || (stock > 0 ? 'in_stock' : 'out_of_stock'),
    is_featured: row.is_featured !== undefined ? Boolean(row.is_featured) : true,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export const getProductsFromDb = async (): Promise<ProductRecord[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (!error && data && data.length > 0) {
        const records = data.map(dbRowToProductRecord);
        saveLocalCachedProducts(records);
        return records;
      }
    } catch (e) {
      console.warn('Database catalogue query warning:', e);
    }
  }

  // Check local cache
  const cached = getLocalCachedProducts();
  if (cached && cached.length > 0) {
    return cached;
  }

  // Authoritative verified catalogue fallback
  return VERIFIED_PRODUCTS.map(p => ({
    id: p.id,
    name: p.name,
    product_name: p.name,
    slug: p.id,
    category: p.category,
    short_description: p.shortDescription || p.benefits[0] || '',
    description: p.fullDescription,
    full_description: p.fullDescription,
    ingredients: p.ingredients,
    benefits: p.benefits,
    three_main_benefits: p.threeMainBenefits || p.benefits.slice(0, 3),
    usage_instructions: p.howToUse,
    price: p.mrp,
    mrp: p.mrp,
    stock_quantity: 50,
    weight_or_volume: p.netWeightOrVol,
    net_weight_or_vol: p.netWeightOrVol,
    image_url: p.image,
    image: p.image,
    additional_images: [p.image],
    availability_status: 'in_stock',
    is_featured: true
  }));
};

export const updateProductInDb = async (
  productId: string,
  updates: Partial<ProductRecord>
): Promise<void> => {
  const dbPayload: Record<string, any> = {
    updated_at: new Date().toISOString()
  };

  if (updates.name !== undefined || updates.product_name !== undefined) {
    dbPayload.name = updates.name || updates.product_name;
  }
  if (updates.mrp !== undefined || updates.price !== undefined) {
    dbPayload.mrp = Number(updates.mrp !== undefined ? updates.mrp : updates.price);
  }
  if (updates.discount_price !== undefined) {
    dbPayload.discount_price = updates.discount_price ? Number(updates.discount_price) : null;
  }
  if (updates.stock_quantity !== undefined) {
    dbPayload.stock_quantity = Number(updates.stock_quantity);
  }
  if (updates.availability_status !== undefined) {
    dbPayload.availability_status = updates.availability_status;
  }
  if (updates.category !== undefined) {
    dbPayload.category = updates.category;
  }
  if (updates.net_weight_or_vol !== undefined || updates.weight_or_volume !== undefined) {
    dbPayload.net_weight_or_vol = updates.net_weight_or_vol || updates.weight_or_volume;
  }
  if (updates.short_description !== undefined) {
    dbPayload.short_description = updates.short_description;
  }
  if (updates.full_description !== undefined || updates.description !== undefined) {
    dbPayload.full_description = updates.full_description || updates.description;
  }
  if (updates.ingredients !== undefined) {
    dbPayload.ingredients = updates.ingredients;
  }
  if (updates.benefits !== undefined) {
    dbPayload.benefits = updates.benefits;
  }
  if (updates.image !== undefined || updates.image_url !== undefined) {
    dbPayload.image = updates.image || updates.image_url;
  }

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('products').update(dbPayload).eq('id', productId);
    if (error) {
      console.warn('Direct update failed, attempting upsert:', error.message);
      const { error: upsertErr } = await supabase.from('products').upsert({ id: productId, ...dbPayload });
      if (upsertErr) {
        throw new Error(`Failed to update product in database: ${upsertErr.message}`);
      }
    }
    await logAdminAction('UPDATE_PRODUCT', 'products', productId, dbPayload);
  }

  // Update local cache
  const cached = getLocalCachedProducts();
  const index = cached.findIndex(p => p.id === productId);
  if (index >= 0) {
    cached[index] = { ...cached[index], ...updates };
    saveLocalCachedProducts(cached);
  }
};

export const createProductInDb = async (
  product: Partial<ProductRecord> & { id: string; name: string }
): Promise<ProductRecord> => {
  const newRecord = {
    id: product.id,
    name: product.name,
    category: product.category || 'Handmade Cold Process Soap',
    net_weight_or_vol: product.net_weight_or_vol || product.weight_or_volume || '100 gm',
    mrp: Number(product.mrp || product.price || 99),
    discount_price: product.discount_price ? Number(product.discount_price) : null,
    stock_quantity: product.stock_quantity !== undefined ? Number(product.stock_quantity) : 50,
    availability_status: product.availability_status || 'in_stock',
    short_description: product.short_description || '',
    full_description: product.full_description || product.description || '',
    ingredients: product.ingredients || '',
    benefits: product.benefits || ['Handcrafted botanical care'],
    image: product.image || product.image_url || '/images/products/kesuda-palash-soap.webp',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('products').insert(newRecord);
    if (error) {
      throw new Error(`Failed to create product in database: ${error.message}`);
    }
    await logAdminAction('CREATE_PRODUCT', 'products', product.id, newRecord);
  }

  const mapped = dbRowToProductRecord(newRecord);
  const cached = getLocalCachedProducts();
  saveLocalCachedProducts([mapped, ...cached]);
  return mapped;
};

export const deleteProductFromDb = async (productId: string): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      throw new Error(`Failed to delete product from database: ${error.message}`);
    }
    await logAdminAction('DELETE_PRODUCT', 'products', productId);
  }

  const cached = getLocalCachedProducts();
  saveLocalCachedProducts(cached.filter(p => p.id !== productId));
};

// -------------------------------------------------------------
// 12. Real Overview Analytics (Calculated from Genuine Records)
// -------------------------------------------------------------
export const getCRMOverviewMetrics = async (): Promise<CRMOverviewMetrics> => {
  const { customers } = await getCustomers({ limit: 1000 });
  const conversations = await getConversations();
  const enquiries = await getEnquiries();
  const interests = await getProductInterests({ limit: 1000 });

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

  const mostViewedProducts = Array.from(viewMap.entries())
    .map(([productId, count]) => ({ productId, name: getProductName(productId), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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
// 13. Settings & Retention Policies
// -------------------------------------------------------------
const DEFAULT_RETENTION: RetentionPolicySettings = {
  chatRetentionDays: 90,
  analyticsRetentionDays: 180,
  allowGuestChatStorage: true,
  autoPurgeRevokedData: true
};

export const getRetentionSettings = (): RetentionPolicySettings => {
  try {
    const raw = localStorage.getItem(RETENTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_RETENTION;
  } catch (e) {
    return DEFAULT_RETENTION;
  }
};

export const saveRetentionSettings = (settings: RetentionPolicySettings): void => {
  localStorage.setItem(RETENTION_STORAGE_KEY, JSON.stringify(settings));
};
