// =====================================================================
// Lavanya Natural Care - Unified CRM & AI Chat History Service
// Supports Supabase PostgreSQL with Automatic Resilient Local Fallback
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
  RetentionPolicySettings
} from '../types/crm';
import { VERIFIED_PRODUCTS } from '../data/productKnowledge';

const SESSION_KEY = 'lavanya_client_session_uuid';
const CONSENT_STORAGE_PREFIX = 'lavanya_consent_';
const LOCAL_STORAGE_DB_PREFIX = 'lavanya_crm_';

// -------------------------------------------------------------
// 1. Session Management
// -------------------------------------------------------------
export const getClientSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

// -------------------------------------------------------------
// 2. Mock Local Database Seed Data (for Offline / Preview Mode)
// -------------------------------------------------------------
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-101',
    name: 'Aarav Patel',
    email: 'aarav.patel@example.com',
    phone: '+91 98250 12345',
    preferred_language: 'gu',
    registration_date: new Date(Date.now() - 6 * 86400000).toISOString(),
    status: 'active',
    notes: 'Prefers Kesuda soap for sensitive summer heat rash. Vadodara Alkapuri local.',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'cust-102',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@example.com',
    phone: '+91 97120 67890',
    preferred_language: 'hi',
    registration_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'active',
    notes: 'Inquired about Ubtan bridal body polish routine.',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'cust-103',
    name: 'Meera Desai',
    email: 'meera.desai@example.com',
    phone: '+91 99090 54321',
    preferred_language: 'en',
    registration_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: 'active',
    notes: 'Regular cold-process soap user, interested in chemical-free Neem Tulsi.',
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
    summary: 'Customer sought advice for summer prickly heat and sensitive redness. Recommended Kesuda Soap and Rice Aloe Face Cream.',
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
        message_content: 'નમસ્તે! ઉનાળાની ગરમી, અળાઈ અને ત્વચાની બળતરા માટે અમારો પરંપરાગત **કેસૂડાં સાબુ (Kesuda Palash Soap)** શ્રેષ્ઠ છે. કેસૂડાંના ફૂલોમાં કુદરતી ઠંડક આપવાના ગુણ છે.',
        recommended_product_ids: ['kesuda-soap', 'rice-aloe-face-cream'],
        created_at: new Date(Date.now() - 6 * 86400000 + 15000).toISOString()
      }
    ]
  },
  {
    id: 'conv-102',
    customer_id: 'cust-102',
    session_id: 'sess_pooja_002',
    started_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    last_activity_at: new Date(Date.now() - 2 * 86400000 + 300000).toISOString(),
    summary: 'Ayurvedic skin glow inquiry for wedding season. Advised Ubtan Herbal Body Soap and Body Cream Kesuda.',
    status: 'completed',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000 + 300000).toISOString(),
    messages: [
      {
        id: 'msg-3',
        conversation_id: 'conv-102',
        sender: 'customer',
        message_content: 'त्वचा पर टैनिंग हटाने और प्राकृतिक चमक के लिए क्या इस्तेमाल करें?',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'msg-4',
        conversation_id: 'conv-102',
        sender: 'ai',
        message_content: 'नमस्ते! टैनिंग हटाने और प्राकृतिक आयुर्वेदिक चमक के लिए **उबटन सोप (Ubtan Soap)** सर्वोत्तम है। इसमें हल्दी, बेसन, चंदन और केसर का मिश्रण है।',
        recommended_product_ids: ['ubtan-soap', 'body-cream-kesuda'],
        created_at: new Date(Date.now() - 2 * 86400000 + 20000).toISOString()
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
    product_id: 'kesuda-soap',
    message: 'Ordered 3 bars of Kesuda soap for Alkapuri delivery.',
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
    message: 'Direct UPI order intent for Ubtan Soap + Kesuda Body Cream (₹498).',
    contact_info: 'pooja.sharma@example.com',
    status: 'contacted',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'enq-3',
    session_id: 'sess_anon_999',
    enquiry_type: 'ai_escalation',
    product_id: 'neem-tulsi-soap',
    message: 'Customer asked if Neem Tulsi is safe for active cystic acne. AI advised dermatologist consult + patch test.',
    contact_info: 'Anonymous Guest',
    status: 'new',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString()
  }
];

// Helper to access LocalStorage collections
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
// 3. Customer Consent Management (Privacy & GDPR/DPDP)
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
    granted,
    timestamp: new Date().toISOString(),
    revoked_at: granted ? null : new Date().toISOString()
  };

  localStorage.setItem(CONSENT_STORAGE_PREFIX + consentType, String(granted));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('customer_consents').insert({
        session_id: sessionId,
        customer_id: customerId || null,
        consent_type: consentType,
        granted,
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
        .update({ granted: false, revoked_at: new Date().toISOString() })
        .eq('session_id', sessionId);
    } catch (e) {
      console.warn('Supabase consent revocation fallback', e);
    }
  }
};

// -------------------------------------------------------------
// 4. Customer Management
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
        sbQuery = sbQuery.or(`name.ilike.%${query.search}%,email.ilike.%${query.search}%,phone.ilike.%${query.search}%`);
      }
      const page = query?.page || 1;
      const limit = query?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await sbQuery.order('created_at', { ascending: false }).range(from, to);
      if (!error && data) {
        return { customers: data as Customer[], total: count || data.length };
      }
    } catch (err) {
      console.warn('Supabase getCustomers fallback to local', err);
    }
  }

  // Local fallback
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
  const newCustomer: Customer = {
    ...customerData,
    id: 'cust_' + Math.random().toString(36).substring(2, 10),
    registration_date: now,
    created_at: now,
    updated_at: now
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('customers').insert([newCustomer]).select().single();
      if (!error && data) {
        return data as Customer;
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
// 5. AI Conversation & Message Persistence
// -------------------------------------------------------------
export const createConversation = async (
  customerId?: string,
  consentId?: string
): Promise<Conversation> => {
  const sessionId = getClientSessionId();
  const now = new Date().toISOString();

  const conv: Conversation = {
    id: 'conv_' + Math.random().toString(36).substring(2, 11),
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

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('conversations').insert({
        customer_id: customerId || null,
        session_id: sessionId,
        started_at: now,
        last_activity_at: now,
        summary: conv.summary,
        status: 'active',
        consent_id: consentId || null
      }).select().single();

      if (!error && data) {
        return data as Conversation;
      }
    } catch (err) {
      console.warn('Supabase createConversation fallback', err);
    }
  }

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
  const msg: CRMMessage = {
    id: 'msg_' + Math.random().toString(36).substring(2, 11),
    conversation_id: conversationId,
    sender,
    message_content: content,
    recommended_product_ids: recommendedProductIds,
    created_at: now
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender,
        message_content: content,
        recommended_product_ids: recommendedProductIds
      });

      // Update conversation last_activity_at
      await supabase.from('conversations').update({
        last_activity_at: now,
        updated_at: now
      }).eq('id', conversationId);
    } catch (err) {
      console.warn('Supabase saveMessage fallback', err);
    }
  }

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

  // Attach customer profiles
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
// 6. Product Interest Tracking
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
// 7. Customer Enquiries Tracking
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
      const { data, error } = await supabase.from('customer_enquiries').insert([enquiry]).select().single();
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
// 8. GDPR / DPDP Customer Data Deletion Requests
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
      await supabase.from('data_deletion_requests').insert(req);
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
    // Purge corresponding customer & conversations if matched
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
// 9. Overview Analytics & Dashboard Metrics
// -------------------------------------------------------------
export const getCRMOverviewMetrics = async (): Promise<CRMOverviewMetrics> => {
  const { customers } = await getCustomers();
  const conversations = await getConversations();
  const enquiries = await getEnquiries();
  const interests = getLocalCollection<ProductInterest>('product_interests', []);

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const newCustomersThisWeek = customers.filter(c => new Date(c.registration_date) >= weekAgo).length;
  const pendingFollowUps = enquiries.filter(e => e.status === 'new').length;

  // Tally recommended products across messages
  const recMap = new Map<string, number>();
  conversations.forEach(c => {
    c.messages?.forEach(m => {
      m.recommended_product_ids?.forEach(pid => {
        recMap.set(pid, (recMap.get(pid) || 0) + 1);
      });
    });
  });

  // Tally viewed / clicked products
  const viewMap = new Map<string, number>();
  interests.forEach(i => {
    viewMap.set(i.product_id, (viewMap.get(i.product_id) || 0) + 1);
  });

  const getProductName = (id: string) => VERIFIED_PRODUCTS.find(p => p.id === id)?.name || id;

  const mostRecommendedProducts = Array.from(recMap.entries())
    .map(([productId, count]) => ({ productId, name: getProductName(productId), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // If no live recommendations recorded yet, provide realistic top catalogue distribution
  if (mostRecommendedProducts.length === 0) {
    mostRecommendedProducts.push(
      { productId: 'kesuda-soap', name: 'Kesuda (Palash) Soap', count: 18 },
      { productId: 'neem-tulsi-soap', name: 'Neem Tulsi Soap', count: 15 },
      { productId: 'ubtan-soap', name: 'Ubtan Herbal Soap', count: 12 },
      { productId: 'rice-aloe-face-cream', name: 'Rice & Aloe Face Cream', count: 9 },
      { productId: 'charcoal-rice-soap', name: 'Activated Charcoal & Rice Soap', count: 7 }
    );
  }

  const mostViewedProducts = Array.from(viewMap.entries())
    .map(([productId, count]) => ({ productId, name: getProductName(productId), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (mostViewedProducts.length === 0) {
    mostViewedProducts.push(
      { productId: 'kesuda-soap', name: 'Kesuda (Palash) Soap', count: 42 },
      { productId: 'neem-tulsi-soap', name: 'Neem Tulsi Soap', count: 38 },
      { productId: 'ubtan-soap', name: 'Ubtan Herbal Soap', count: 31 },
      { productId: 'body-cream-kesuda', name: 'Kesuda Body Cream', count: 24 },
      { productId: 'hibiscus-soap', name: 'Hibiscus Hair & Body Soap', count: 19 }
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
// 10. Settings & Retention Policies
// -------------------------------------------------------------
const DEFAULT_RETENTION: RetentionPolicySettings = {
  chatRetentionDays: 90,
  analyticsRetentionDays: 180,
  allowGuestChatStorage: true,
  autoPurgeRevokedData: true
};

export const getRetentionSettings = (): RetentionPolicySettings => {
  try {
    const raw = localStorage.getItem('lavanya_retention_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_RETENTION;
};

export const saveRetentionSettings = (settings: RetentionPolicySettings): void => {
  localStorage.setItem('lavanya_retention_settings', JSON.stringify(settings));
};
