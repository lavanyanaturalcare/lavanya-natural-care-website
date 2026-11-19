-- =====================================================================
-- Lavanya Natural Care - PostgreSQL CRM & AI Chat History Schema
-- Compatible with Supabase (PostgreSQL 15+)
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'gu')),
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CUSTOMER CONSENTS TABLE (Auditable Privacy Log)
CREATE TABLE IF NOT EXISTS public.customer_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    consent_type TEXT NOT NULL CHECK (consent_type IN ('ai_chat_storage', 'marketing_offers', 'analytics_cookies')),
    granted BOOLEAN NOT NULL DEFAULT TRUE,
    ip_hash TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- 4. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    summary TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    consent_id UUID REFERENCES public.customer_consents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('customer', 'ai')),
    message_content TEXT NOT NULL,
    recommended_product_ids JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCT INTERESTS TABLE (Behavioral Telemetry)
CREATE TABLE IF NOT EXISTS public.product_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    interest_type TEXT NOT NULL CHECK (interest_type IN ('ai_recommended', 'view_details', 'quick_preview', 'order_intent')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CUSTOMER ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.customer_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    enquiry_type TEXT NOT NULL CHECK (enquiry_type IN ('whatsapp', 'order_checkout', 'contact_form', 'ai_escalation')),
    product_id TEXT,
    message TEXT NOT NULL,
    contact_info TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DATA DELETION REQUESTS TABLE (GDPR / DPDP Compliance)
CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    email_or_phone TEXT NOT NULL,
    session_id TEXT,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    notes TEXT
);

-- 9. ADMIN USERS TABLE (Secure Role-Based Access)
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'store_manager' CHECK (role IN ('super_admin', 'store_manager', 'support')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INDEXES FOR HIGH-TRAFFIC QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_consents_session_id ON public.customer_consents(session_id);
CREATE INDEX IF NOT EXISTS idx_consents_customer_id ON public.customer_consents(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON public.conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_activity ON public.conversations(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_interests_product_id ON public.product_interests(product_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.customer_enquiries(status);

-- 11. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_conversations_updated_at ON public.conversations;
CREATE TRIGGER set_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_enquiries_updated_at ON public.customer_enquiries;
CREATE TRIGGER set_enquiries_updated_at
    BEFORE UPDATE ON public.customer_enquiries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 12. HELPER FUNCTION: CHECK IF CURRENT USER IS AN ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'store_manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. ROW LEVEL SECURITY (RLS) ACTIVATION
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 14. ROW LEVEL SECURITY POLICIES

-- A. ADMINS: Full access to everything
CREATE POLICY "Admins have full access to customers"
    ON public.customers FOR ALL TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins have full access to consents"
    ON public.customer_consents FOR ALL TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins have full access to conversations"
    ON public.conversations FOR ALL TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins have full access to messages"
    ON public.messages FOR ALL TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins have full access to product_interests"
    ON public.product_interests FOR ALL TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins have full access to customer_enquiries"
    ON public.customer_enquiries FOR ALL TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins have full access to deletion requests"
    ON public.data_deletion_requests FOR ALL TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can view admin_users"
    ON public.admin_users FOR SELECT TO authenticated
    USING (public.is_admin() OR user_id = auth.uid());

-- B. AUTHENTICATED CUSTOMERS: Can access only their own rows
CREATE POLICY "Customers can view their own profile"
    ON public.customers FOR SELECT TO authenticated
    USING (auth_user_id = auth.uid());

CREATE POLICY "Customers can update their own profile"
    ON public.customers FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid());

CREATE POLICY "Customers can view their own conversations"
    ON public.conversations FOR SELECT TO authenticated
    USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Customers can view their own messages"
    ON public.messages FOR SELECT TO authenticated
    USING (conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
    ));

-- C. ANONYMOUS GUESTS & PUBLIC INSERTS (Strict Session Tagging)
CREATE POLICY "Public and guests can insert consents"
    ON public.customer_consents FOR INSERT TO anon, authenticated
    WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Public and guests can insert conversations"
    ON public.conversations FOR INSERT TO anon, authenticated
    WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Public and guests can update their active conversation"
    ON public.conversations FOR UPDATE TO anon, authenticated
    USING (session_id IS NOT NULL);

CREATE POLICY "Public and guests can insert messages"
    ON public.messages FOR INSERT TO anon, authenticated
    WITH CHECK (conversation_id IS NOT NULL);

CREATE POLICY "Public and guests can insert product interests"
    ON public.product_interests FOR INSERT TO anon, authenticated
    WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Public and guests can submit customer enquiries"
    ON public.customer_enquiries FOR INSERT TO anon, authenticated
    WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Public can submit data deletion requests"
    ON public.data_deletion_requests FOR INSERT TO anon, authenticated
    WITH CHECK (email_or_phone IS NOT NULL);
