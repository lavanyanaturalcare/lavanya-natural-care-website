// =====================================================================
// Lavanya Natural Care - CRM & AI Chat History TypeScript Interfaces
// =====================================================================

export type CustomerStatus = 'active' | 'inactive' | 'blocked';
export type PreferredLanguage = 'en' | 'hi' | 'gu';

export interface Customer {
  id: string;
  auth_user_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  preferred_language: PreferredLanguage;
  registration_date: string;
  status: CustomerStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type ConsentType = 'ai_chat_storage' | 'marketing_offers' | 'analytics_cookies';

export interface CustomerConsent {
  id: string;
  customer_id?: string | null;
  session_id: string;
  consent_type: ConsentType;
  granted: boolean;
  ip_hash?: string | null;
  user_agent?: string | null;
  timestamp: string;
  revoked_at?: string | null;
}

export type ConversationStatus = 'active' | 'completed' | 'abandoned';

export interface Conversation {
  id: string;
  customer_id?: string | null;
  session_id: string;
  started_at: string;
  last_activity_at: string;
  summary?: string | null;
  status: ConversationStatus;
  consent_id?: string | null;
  created_at: string;
  updated_at: string;
  messages?: CRMMessage[];
  customer?: Customer | null;
}

export type MessageSender = 'customer' | 'ai';

export interface CRMMessage {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  message_content: string;
  recommended_product_ids?: string[];
  created_at: string;
}

export type ProductInterestType = 'ai_recommended' | 'view_details' | 'quick_preview' | 'order_intent';

export interface ProductInterest {
  id: string;
  customer_id?: string | null;
  session_id: string;
  product_id: string;
  interest_type: ProductInterestType;
  created_at: string;
}

export type EnquiryType = 'whatsapp' | 'order_checkout' | 'contact_form' | 'ai_escalation';
export type EnquiryStatus = 'new' | 'contacted' | 'resolved' | 'closed';

export interface CustomerEnquiry {
  id: string;
  customer_id?: string | null;
  session_id: string;
  enquiry_type: EnquiryType;
  product_id?: string | null;
  message: string;
  contact_info?: string | null;
  status: EnquiryStatus;
  created_at: string;
  updated_at: string;
}

export type DeletionRequestStatus = 'pending' | 'processed' | 'rejected';

export interface DataDeletionRequest {
  id: string;
  customer_id?: string | null;
  email_or_phone: string;
  session_id?: string | null;
  reason?: string | null;
  status: DeletionRequestStatus;
  requested_at: string;
  processed_at?: string | null;
  notes?: string | null;
}

export interface AdminUser {
  user_id: string;
  email: string;
  role: 'super_admin' | 'store_manager' | 'support';
  created_at: string;
}

export interface CRMOverviewMetrics {
  totalCustomers: number;
  newCustomersThisWeek: number;
  totalConversations: number;
  totalEnquiries: number;
  pendingFollowUps: number;
  mostRecommendedProducts: { productId: string; name: string; count: number }[];
  mostViewedProducts: { productId: string; name: string; count: number }[];
}

export interface RetentionPolicySettings {
  chatRetentionDays: number;
  analyticsRetentionDays: number;
  allowGuestChatStorage: boolean;
  autoPurgeRevokedData: boolean;
}
