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
      if (!error && data) {
        return data as CustomerEvent[];
      }
    } catch (err) {
      console.warn('Supabase getCustomerEvents error:', err);
    }
  }
  return [];
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
  if (isSupabaseConfigured() && supabase) {
    try {
      let sbQuery = supabase.from('customers').select('*', { count: 'exact' });
      if (query?.status && (query.status as string) !== 'all') {
        sbQuery = sbQuery.eq('status', query.status);
      }
      if (query?.search && query.search.trim()) {
        const term = query.search.trim();
        sbQuery = sbQuery.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
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
      if (error) {
        console.warn('Supabase getCustomers error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase getCustomers query exception:', err);
    }
  }

  return { customers: [], total: 0 };
};

export const registerCustomer = async (
  customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'registration_date'>
): Promise<Customer> => {
  const fullName = customerData.full_name || customerData.name;

  if (isSupabaseConfigured() && supabase) {
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
    if (error) {
      throw new Error(error.message || 'Could not register customer profile in database.');
    }
    if (data) {
      const result: Customer = {
        ...data,
        name: data.full_name
      };

      // Claim session
      const tokenHash = await getClientSessionTokenHash();
      try {
        await supabase.rpc('claim_guest_session', {
          p_token_hash: tokenHash
        });
      } catch (claimErr) {}

      return result;
    }
  }

  throw new Error('Database is currently unreachable. Profile could not be saved.');
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
        let results = data as Conversation[];
        if (query?.search && query.search.trim()) {
          const q = query.search.toLowerCase().trim();
          results = results.filter(c =>
            (c.summary && c.summary.toLowerCase().includes(q)) ||
            (c.customer && c.customer.name && c.customer.name.toLowerCase().includes(q)) ||
            (c.customer && c.customer.email && c.customer.email.toLowerCase().includes(q)) ||
            (c.messages && c.messages.some(m => m.message_content.toLowerCase().includes(q)))
          );
        }
        return results;
      }
    } catch (err) {
      console.warn('Supabase getConversations query error:', err);
    }
  }

  return [];
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
      if (!error && data) {
        return data as ProductInterest[];
      }
    } catch (err) {
      console.warn('Supabase getProductInterests error:', err);
    }
  }
  return [];
};

// -------------------------------------------------------------
// 7. Wishlist / Saved Products
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
        if (data && data.length > 0) {
          const ids = data.map((d: any) => d.product_id);
          localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
          return ids;
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
// 8. Customer Enquiries Tracking
// -------------------------------------------------------------
export const createEnquiry = async (
  enquiryData: Omit<CustomerEnquiry, 'id' | 'created_at' | 'updated_at'>
): Promise<CustomerEnquiry> => {
  if (isSupabaseConfigured() && supabase) {
    const payload: any = {
      customer_name: enquiryData.customer_name || 'Anonymous Customer',
      contact_details: enquiryData.contact_details || enquiryData.contact_info || '',
      message: enquiryData.message,
      product_id: enquiryData.product_id || null,
      status: enquiryData.status || 'new',
      customer_id: enquiryData.customer_id || null
    };
    const { data, error } = await supabase.from('customer_enquiries').insert([payload]).select().single();
    if (error) {
      throw new Error(error.message);
    }
    if (data) {
      return data as CustomerEnquiry;
    }
  }

  throw new Error('Database is offline. Enquiry could not be recorded.');
};

export const getEnquiries = async (filter?: { status?: string; search?: string }): Promise<CustomerEnquiry[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let sbQuery = supabase.from('customer_enquiries').select('*');
      if (filter?.status && filter.status !== 'all') {
        sbQuery = sbQuery.eq('status', filter.status);
      }
      const { data, error } = await sbQuery.order('created_at', { ascending: false });
      if (!error && data) {
        let results = data as CustomerEnquiry[];
        if (filter?.search && filter.search.trim()) {
          const q = filter.search.toLowerCase().trim();
          results = results.filter(e =>
            (e.customer_name && e.customer_name.toLowerCase().includes(q)) ||
            (e.contact_details && e.contact_details.toLowerCase().includes(q)) ||
            (e.message && e.message.toLowerCase().includes(q))
          );
        }
        return results;
      }
    } catch (e) {
      console.warn('Supabase getEnquiries error:', e);
    }
  }

  return [];
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
// 11. Central Product Catalogue Persistence
// -------------------------------------------------------------
export const getProductsFromDb = async (): Promise<ProductRecord[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('product_name');
      if (!error && data && data.length > 0) {
        return data as ProductRecord[];
      }
    } catch (e) {
      console.warn('Database catalogue query warning:', e);
    }
  }

  // Authoritative verified catalogue fallback
  return VERIFIED_PRODUCTS.map(p => ({
    id: p.id,
    product_name: p.name,
    slug: p.id,
    category: p.category,
    short_description: p.shortDescription || p.benefits[0] || '',
    description: p.fullDescription,
    ingredients: p.ingredients,
    benefits: p.benefits,
    three_main_benefits: p.threeMainBenefits || p.benefits.slice(0, 3),
    usage_instructions: p.howToUse,
    price: p.mrp,
    weight_or_volume: p.netWeightOrVol,
    image_url: p.image,
    additional_images: [p.image],
    availability_status: 'in_stock',
    is_featured: true
  }));
};

export const updateProductInDb = async (
  productId: string,
  updates: Partial<ProductRecord>
): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('products').update(updates).eq('id', productId);
    if (error) {
      throw new Error(`Failed to update product in database: ${error.message}`);
    }
    await logAdminAction('UPDATE_PRODUCT', 'products', productId, updates);
  }
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
