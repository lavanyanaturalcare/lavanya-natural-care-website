-- =====================================================================
-- ONZNATURAL — Central Supabase PostgreSQL Database Schema
-- Brand Rebrand, Security Hardening, RLS & Central Product Data
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'gu')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill full_name if upgrading from old schema
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'name'
    ) THEN
        UPDATE public.customers SET full_name = name WHERE full_name IS NULL;
    END IF;
END $$;

-- 3. CUSTOMER SESSIONS TABLE (Cryptographically Hashed Guest Tokens)
CREATE TABLE IF NOT EXISTS public.customer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token_hash TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- 4. CUSTOMER CONSENTS TABLE (Auditable Privacy Log)
CREATE TABLE IF NOT EXISTS public.customer_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    session_id TEXT,
    consent_type TEXT NOT NULL,
    consent_status TEXT NOT NULL DEFAULT 'granted' CHECK (consent_status IN ('granted', 'revoked', 'pending')),
    granted BOOLEAN NOT NULL DEFAULT TRUE,
    privacy_notice_version TEXT DEFAULT 'v2.0-onznatural',
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- 5. PRODUCTS TABLE (Authoritative Central Product Catalog)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    benefits TEXT[] DEFAULT '{}'::TEXT[],
    three_main_benefits TEXT[] DEFAULT '{}'::TEXT[],
    usage_instructions TEXT,
    price NUMERIC(10, 2) NOT NULL,
    weight_or_volume TEXT NOT NULL,
    image_url TEXT NOT NULL,
    additional_images TEXT[] DEFAULT '{}'::TEXT[],
    skin_type TEXT,
    availability_status TEXT DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued')),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONVERSATIONS TABLE
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

-- 7. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('customer', 'ai')),
    message_content TEXT NOT NULL,
    recommended_product_ids JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRODUCT INTERESTS TABLE (Behavioral Telemetry)
CREATE TABLE IF NOT EXISTS public.product_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    interest_type TEXT NOT NULL CHECK (interest_type IN ('ai_recommended', 'view_details', 'quick_preview', 'order_intent', 'wishlist_add')),
    source TEXT DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CUSTOMER EVENTS TABLE (First-Party Activity Tracking)
CREATE TABLE IF NOT EXISTS public.customer_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    product_id TEXT,
    safe_metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CUSTOMER ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.customer_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    product_id TEXT,
    customer_name TEXT NOT NULL,
    contact_details TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. DATA DELETION REQUESTS TABLE (GDPR / DPDP Compliance)
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

-- 12. ADMIN USERS TABLE (Secure Role-Based Access)
CREATE TABLE IF NOT EXISTS public.admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'store_manager' CHECK (role IN ('super_admin', 'store_manager', 'support')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    record_type TEXT NOT NULL,
    record_id TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 14. WISHLIST / SAVED PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.customer_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, product_id)
);

-- 15. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_auth_uid ON public.customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON public.customer_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_customer ON public.customer_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON public.conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_events_session ON public.customer_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_customer ON public.customer_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.customer_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON public.admin_audit_logs(admin_user_id);

-- 16. TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customers_updated ON public.customers;
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_conversations_updated ON public.conversations;
CREATE TRIGGER trg_conversations_updated BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_enquiries_updated ON public.customer_enquiries;
CREATE TRIGGER trg_enquiries_updated BEFORE UPDATE ON public.customer_enquiries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 17. SECURE ADMIN VERIFICATION FUNCTION
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

-- 18. SECURE GUEST SESSION & CONVERSATION FUNCTIONS (SECURITY DEFINER)
-- Replaces insecure direct client updates and validates hashed tokens

CREATE OR REPLACE FUNCTION public.create_or_get_guest_session(p_token_hash TEXT)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    SELECT id INTO v_session_id FROM public.customer_sessions
    WHERE session_token_hash = p_token_hash
    AND expires_at > NOW();

    IF v_session_id IS NULL THEN
        INSERT INTO public.customer_sessions (session_token_hash, last_activity_at)
        VALUES (p_token_hash, NOW())
        RETURNING id INTO v_session_id;
    ELSE
        UPDATE public.customer_sessions
        SET last_activity_at = NOW()
        WHERE id = v_session_id;
    END IF;

    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.start_guest_conversation(
    p_token_hash TEXT,
    p_summary TEXT DEFAULT 'Botanical AI Consultation'
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_conversation_id UUID;
BEGIN
    v_session_id := public.create_or_get_guest_session(p_token_hash);

    INSERT INTO public.conversations (session_id, summary, status)
    VALUES (v_session_id::TEXT, p_summary, 'active')
    RETURNING id INTO v_conversation_id;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.append_guest_message(
    p_conversation_id UUID,
    p_token_hash TEXT,
    p_sender TEXT,
    p_content TEXT,
    p_recommended_products JSONB DEFAULT '[]'::JSONB
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_msg_id UUID;
BEGIN
    SELECT id INTO v_session_id FROM public.customer_sessions
    WHERE session_token_hash = p_token_hash
    AND expires_at > NOW();

    IF v_session_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired session token';
    END IF;

    -- Verify that the conversation belongs to this session
    IF NOT EXISTS (
        SELECT 1 FROM public.conversations
        WHERE id = p_conversation_id AND session_id = v_session_id::TEXT
    ) THEN
        RAISE EXCEPTION 'Unauthorized: conversation does not belong to this session';
    END IF;

    INSERT INTO public.messages (conversation_id, sender, message_content, recommended_product_ids)
    VALUES (p_conversation_id, p_sender, p_content, p_recommended_products)
    RETURNING id INTO v_msg_id;

    UPDATE public.conversations
    SET last_activity_at = NOW()
    WHERE id = p_conversation_id;

    RETURN v_msg_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.claim_guest_session(p_token_hash TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_session_id UUID;
    v_customer_id UUID;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Must be authenticated to claim a session';
    END IF;

    SELECT id INTO v_customer_id FROM public.customers WHERE auth_user_id = auth.uid();
    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer profile not found';
    END IF;

    SELECT id INTO v_session_id FROM public.customer_sessions WHERE session_token_hash = p_token_hash;
    IF v_session_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Link session to customer
    UPDATE public.customer_sessions
    SET customer_id = v_customer_id
    WHERE id = v_session_id;

    -- Link conversations belonging to this session
    UPDATE public.conversations
    SET customer_id = v_customer_id
    WHERE session_id = v_session_id::TEXT;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_customer_event(
    p_token_hash TEXT,
    p_event_type TEXT,
    p_product_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
DECLARE
    v_session_id UUID;
    v_customer_id UUID := NULL;
BEGIN
    v_session_id := public.create_or_get_guest_session(p_token_hash);

    IF auth.uid() IS NOT NULL THEN
        SELECT id INTO v_customer_id FROM public.customers WHERE auth_user_id = auth.uid();
    END IF;

    INSERT INTO public.customer_events (customer_id, session_id, event_type, product_id, safe_metadata)
    VALUES (v_customer_id, v_session_id::TEXT, p_event_type, p_product_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action TEXT,
    p_record_type TEXT,
    p_record_id TEXT,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized audit logging';
    END IF;

    INSERT INTO public.admin_audit_logs (admin_user_id, action, record_type, record_id, metadata)
    VALUES (auth.uid(), p_action, p_record_type, p_record_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. DEFAULT-DENY ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wishlists ENABLE ROW LEVEL SECURITY;

-- Drop obsolete insecure policies if present
DROP POLICY IF EXISTS "Public and guests can update their active conversation" ON public.conversations;
DROP POLICY IF EXISTS "Public and guests can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Public and guests can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public and guests can insert consents" ON public.customer_consents;
DROP POLICY IF EXISTS "Public and guests can insert product interests" ON public.product_interests;
DROP POLICY IF EXISTS "Public and guests can submit customer enquiries" ON public.customer_enquiries;

-- A. PRODUCTS POLICIES (Public read-only, Admin read/write)
CREATE POLICY "Public can view in-stock products"
    ON public.products FOR SELECT TO public
    USING (availability_status != 'discontinued');

CREATE POLICY "Admins have full access to products"
    ON public.products FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- B. CUSTOMER PROFILE POLICIES
CREATE POLICY "Customers can view their own profile"
    ON public.customers FOR SELECT TO authenticated
    USING (auth_user_id = auth.uid());

CREATE POLICY "Customers can update their own profile"
    ON public.customers FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Customers can register their profile"
    ON public.customers FOR INSERT TO authenticated
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admins have full access to customers"
    ON public.customers FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- C. CONVERSATIONS & MESSAGES POLICIES
CREATE POLICY "Customers can view their own conversations"
    ON public.conversations FOR SELECT TO authenticated
    USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Customers can view their own messages"
    ON public.messages FOR SELECT TO authenticated
    USING (conversation_id IN (
        SELECT id FROM public.conversations 
        WHERE customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
    ));

CREATE POLICY "Admins have full access to conversations"
    ON public.conversations FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins have full access to messages"
    ON public.messages FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- D. WISHLIST POLICIES
CREATE POLICY "Customers manage their own wishlist"
    ON public.customer_wishlists FOR ALL TO authenticated
    USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()))
    WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

-- E. ENQUIRIES & DELETION REQUESTS POLICIES
CREATE POLICY "Public can submit enquiries"
    ON public.customer_enquiries FOR INSERT TO public
    WITH CHECK (customer_name IS NOT NULL AND contact_details IS NOT NULL);

CREATE POLICY "Customers can view their enquiries"
    ON public.customer_enquiries FOR SELECT TO authenticated
    USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins have full access to enquiries"
    ON public.customer_enquiries FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Public can submit data deletion requests"
    ON public.data_deletion_requests FOR INSERT TO public
    WITH CHECK (email_or_phone IS NOT NULL);

CREATE POLICY "Admins have full access to deletion requests"
    ON public.data_deletion_requests FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- F. ADMIN DIRECTORY & AUDIT LOG POLICIES
CREATE POLICY "Admins can view admin_users"
    ON public.admin_users FOR SELECT TO authenticated
    USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY "Admins can view audit logs"
    ON public.admin_audit_logs FOR SELECT TO authenticated
    USING (public.is_admin());

-- G. CONSENTS & EVENTS (Admin only read, RPC/function managed)
CREATE POLICY "Admins can view consents"
    ON public.customer_consents FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can view events"
    ON public.customer_events FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admins can view product interests"
    ON public.product_interests FOR SELECT TO authenticated
    USING (public.is_admin());
