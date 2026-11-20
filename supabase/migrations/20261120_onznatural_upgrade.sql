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

-- 20. SEED INITIAL PRODUCTS INTO DATABASE
INSERT INTO public.products (id, product_name, slug, category, short_description, description, ingredients, benefits, three_main_benefits, usage_instructions, price, weight_or_volume, image_url, skin_type, is_featured)
VALUES
('neem-tulsi-soap', 'Neem & Tulsi Soap', 'neem-tulsi-soap', 'Handmade Cold Process Soap', 
 'Purifying handcrafted luxury cold process soap infused with Neem & Tulsi for clear, refreshed skin.',
 'Neem & Tulsi Cold Process Soap is handcrafted in small batches using nourishing plant oils and Kokum Butter. Neem is traditionally valued in Ayurvedic skincare for its purifying qualities, while Tulsi offers revitalizing antioxidant botanical protection.',
 'Coconut Oil, Mahua Oil, Neem Oil, Kokum Butter, Sunflower Oil, Castor Oil, Saponified with Lye. Additives: Neem & Tulsi Leaf Powder, Natural Clay.',
 ARRAY['Gently cleanses skin removing dirt, excess sebum, and impurities', 'Neem supports skin clarity and blemish control', 'Tulsi offers revitalizing antioxidant protection', 'Cold-process glycerin prevents dryness'],
 ARRAY['Gently purifies blemishes, dirt & excess oil', 'Antioxidant-rich organic Neem and Tulsi herbs', 'Cold-process retained glycerin prevents dryness'],
 'Lather between wet palms. Massage over face and body, then rinse thoroughly with cool water.',
 99.00, '100 gm / 3.52 oz', '/images/products/neem-tulsi-soap.webp', 'Oily, Combination & Blemish-Prone Skin', TRUE),

('kesuda-palash-soap', 'Kesuda Palash Soap', 'kesuda-palash-soap', 'Handmade Cold Process Soap',
 'Soothing cold process soap enriched with Palash (Kesuda) flowers and Kokum Butter for sun-exposed skin.',
 'Kesuda Palash Cold Process Soap is handcrafted with wild-harvested Palash flowers, nourishing plant oils, and Kokum Butter. In Indian botanical tradition, Kesuda is revered for cooling summer heat rashes and soothing sensitive redness.',
 'Coconut Oil, Mahua Oil, Kokum Butter, Sunflower Oil, Castor Oil, Essential Oil, Saponified with Lye. Additives: Kesuda (Palash) Flower Infusion & Powder.',
 ARRAY['Handcrafted using nourishing plant oils and Kokum Butter', 'Gently cleanses while producing a rich silky lather', 'Kesuda is traditionally valued for soothing prickly heat', 'Artisanal cold process curing retains 100% natural glycerin'],
 ARRAY['Soothes summer prickly heat and sun-exposed redness', 'Retained vegetable glycerin prevents moisture loss', 'Rich, creamy lather with unrefined Kokum Butter'],
 'Work into a gentle lather with water. Glide over body during bath or shower. Rinse cleanly with water.',
 99.00, '100 gm / 3.52 oz', '/images/products/kesuda-palash-soap.webp', 'Sensitive, Sun-Exposed, Prickly Heat & Normal Skin', TRUE),

('hibiscus-soap', 'Hibiscus Soap', 'hibiscus-soap', 'Handmade Cold Process Soap',
 'Antioxidant-packed botanical cold process soap with natural AHAs for smooth, radiant skin.',
 'Hibiscus Cold Process Soap harnesses the power of the "Botox plant" of Ayurveda. Naturally rich in gentle botanical AHAs and antioxidants, it sloughs off dull surface cells while Kokum Butter deeply conditions.',
 'Coconut Oil, Mahua Oil, Kokum Butter, Sunflower Oil, Castor Oil, Essential Oil, Saponified with Lye. Additives: Hibiscus Flower Powder, Natural Clay.',
 ARRAY['Gently cleanses while supporting natural skin renewal', 'Rich in natural plant antioxidants for a youthful glow', 'Refines rough texture and revives tired dull skin'],
 ARRAY['Natural plant AHAs promote luminous, renewed skin', 'Revives dull complexions with antioxidant nutrients', 'Deeply conditions with pure Kokum Butter'],
 'Lather in hands with lukewarm water. Massage onto face and body in circular motions. Rinse thoroughly.',
 99.00, '100 gm / 3.52 oz', '/images/products/hibiscus-soap.webp', 'Normal to Dry, Mature & Dull Skin', TRUE),

('ubtan-soap', 'Ubtan Soap', 'ubtan-soap', 'Handmade Cold Process Soap',
 'Traditional bridal herbal soap with Besan, Turmeric, Milk, and Multani Mitti for natural tan removal.',
 'Ubtan Cold Process Soap unites the sacred herbs of Indian beauty rituals: gram flour (Besan), wild Kasturi turmeric, wholesome milk, and Fuller''s Earth (Multani Mitti) for gentle exfoliation and brightening.',
 'Coconut Oil, Mahua Oil, Sunflower Oil, Castor Oil, Essential Oil, Saponified with Lye. Additives: Besan, Haldi, Milk, Multani Mitti.',
 ARRAY['Gently exfoliates dead skin cells, excess sebum, and pollutants', 'Besan delivers ultra-fine polishing without micro-tears', 'Turmeric visibly brightens uneven tone and sun tan'],
 ARRAY['Gentle daily micro-exfoliation with fine Besan', 'Kasturi Turmeric restores a radiant, even glow', 'Milk & Multani Mitti soften texture without dryness'],
 'Wet bar and create a rich lather. Massage over tanned areas. Leave on for 60 seconds before rinsing.',
 99.00, '100 gm / 3.52 oz', '/images/products/ubtan-soap.webp', 'All Skin Types, Sun-Tanned & Uneven Skin Tone', TRUE),

('charcoal-rice-soap', 'Charcoal Rice Soap', 'charcoal-rice-soap', 'Handmade Cold Process Soap',
 'Deep pore cleansing Activated Charcoal and Rice soap for clarified, smooth skin.',
 'Charcoal Rice Cold Process Soap pairs the detoxifying power of activated bamboo charcoal with finely milled rice powder to pull out impurities while gently refining skin texture.',
 'Coconut Oil, Mahua Oil, Kokum Butter, Sunflower Oil, Castor Oil, Essential Oil, Saponified with Lye. Additives: Activated Bamboo Charcoal, Milled Rice Powder.',
 ARRAY['Deep pore clarifying with activated charcoal', 'Gentle smoothing with milled rice powder', 'Clarifies congested oily zones without over-drying'],
 ARRAY['Activated Charcoal purges deep pore impurities', 'Rice powder smooths and refines rough texture', 'Balanced cold process oils prevent dry tight skin'],
 'Lather with water until a rich grey foam forms. Gently work over blemish-prone zones. Rinse with cool water.',
 99.00, '100 gm / 3.52 oz', '/images/products/charcoal-rice-soap.webp', 'Oily, Congested & Normal Skin', FALSE),

('aparajita-body-lotion', 'Aparajita Body Lotion', 'aparajita-body-lotion', 'Body Care',
 'Antioxidant-rich handcrafted body lotion infused with Butterfly Pea (Aparajita) flower.',
 'Aparajita Body Lotion features wild-harvested Butterfly Pea flower extract, celebrated for its high anthocyanin antioxidant content to shield against environmental stress and keep skin velvety soft.',
 'Aparajita (Butterfly Pea) Flower Extract, Sunflower Seed Oil, Rice Bran Oil, Shea Butter, Vegetable Glycerin, Purified Water.',
 ARRAY['Butterfly Pea provides deep antioxidant defense', 'Revives dull, fatigued skin for a supple luminous finish', 'Fast-absorbing texture hydrates deeply without heavy residue'],
 ARRAY['Butterfly Pea flower delivers potent antioxidants', 'Fast-absorbing hydration leaves zero oily sheen', 'Restores skin softness and luminous tone'],
 'Dispense 2-3 pumps onto clean, towel-dried skin after bathing. Massage in long upward strokes.',
 599.00, '150 ml', '/images/products/aparajita-body-lotion.webp', 'Normal, Dry & Sun-Exposed Skin', TRUE),

('lavender-body-lotion', 'Lavender Body Lotion', 'lavender-body-lotion', 'Body Care',
 'Calming aromatherapy body lotion with pure French Lavender essential oil.',
 'Lavender Body Lotion is formulated with cold-pressed French lavender essential oil and plant emollients to soothe dry, stressed skin while creating a tranquil, aromatic evening ritual.',
 'French Lavender Essential Oil, Cold-Pressed Almond Oil, Sunflower Seed Oil, Shea Butter, Vegetable Glycerin, Purified Water.',
 ARRAY['Lightweight, long-lasting daily hydration', 'Aromatherapeutic lavender scent calms the mind', 'Absorbs quickly without sticky residue'],
 ARRAY['French Lavender essential oil soothes skin & senses', 'Lightweight non-greasy all-day moisture lock', 'Leaves skin silky, smooth, and delicately scented'],
 'Smooth generously over entire body, especially arms and legs before bedtime for calming hydration.',
 599.00, '150 ml', '/images/products/lavender-body-lotion.webp', 'All Skin Types, Normal to Dry', FALSE),

('honey-almond-body-lotion', 'Honey Almond Body Lotion', 'honey-almond-body-lotion', 'Body Care',
 'Deeply nourishing botanical lotion with Honey and Sweet Almond extracts for dry skin.',
 'Honey & Almond Body Lotion brings together pure humectant honey and cold-pressed sweet almond oil to deeply moisturize, soften rough patches, and give dry body skin a healthy radiance.',
 'Pure Honey Extract, Sweet Almond Oil, Shea Butter, Sunflower Oil, Vegetable Glycerin, Purified Water.',
 ARRAY['Natural honey humectant draws moisture deep into skin', 'Sweet Almond oil nourishes with Vitamin E', 'Soothes rough elbows, knees, and dry patches'],
 ARRAY['Natural honey draws and locks in moisture', 'Sweet Almond oil nourishes with Vitamin E', 'Softens dry skin for a radiant, supple finish'],
 'Apply daily after showering or whenever skin feels tight or dry. Massage thoroughly until absorbed.',
 599.00, '150 ml', '/images/products/honey-almond-body-lotion.webp', 'Dry, Very Dry & Rough Skin', TRUE),

('kesuda-body-lotion', 'Kesuda Body Lotion', 'kesuda-body-lotion', 'Body Care',
 'Refreshing, cooling body lotion infused with wild Kesudo (Palash) flower extract.',
 'Kesuda Body Lotion is enriched with the cooling botanical goodness of Kesuda flowers. Specially formulated for warm, sunny climates to quench heat-stressed skin.',
 'Kesuda (Palash) Flower Infusion, Sunflower Seed Oil, Shea Butter, Vegetable Glycerin, Purified Water.',
 ARRAY['Palash flower infusion calms skin exposed to hot summer sun', 'Featherlight non-greasy daily hydration', 'Maintains healthy tone and guards against flakiness'],
 ARRAY['Cools and revitalizes heat-stressed skin', 'Featherlight hydration without greasy residue', 'Enriched with wild Palash flower nutrients'],
 'Smooth over body every morning after bath. Re-apply on sun-exposed arms and legs for relief.',
 599.00, '150 ml', '/images/products/kesuda-body-lotion.webp', 'Normal, Heat-Sensitive & Sun-Exposed Skin', FALSE),

('aparajita-body-cream', 'Aparajita Body Cream', 'aparajita-body-cream', 'Body Care',
 'Rich, antioxidant-dense botanical body cream with Butterfly Pea and Shea Butter.',
 'Aparajita Body Cream combines distilled Butterfly Pea flower infusion with nourishing sunflower oil, rice bran oil, and pure shea butter for intensive, cushiony moisture.',
 'Aparajita Flower Distilled Water, Sunflower Oil, Rice Bran Oil, Shea Butter, Vegetable Glycerin.',
 ARRAY['Intense buttery nourishment for persistent dryness', 'Butterfly Pea protects with concentrated antioxidants', 'Shea butter and rice bran oil lock in moisture all day'],
 ARRAY['Intensive buttery moisture with pure Shea Butter', 'Aparajita flower provides antioxidant nourishment', 'Restores velvety softness to rough, dry skin'],
 'Scoop a small quantity and warm between palms. Massage into dry body areas.',
 399.00, '100 gm', '/images/products/aparajita-body-cream.webp', 'Dry to Extremely Dry Skin', FALSE),

('kesuda-palash-body-cream', 'Kesuda Palash Natural Body Cream', 'kesuda-palash-body-cream', 'Body Care',
 'Soothing Ayurvedic body cream with Kesuda extract, Shea Butter, and Vitamin E.',
 'Kesuda Palash Natural Body Cream absorbs effortlessly to revive dry or dull skin, leaving a silky finish that lasts all day without leaving a heavy feel.',
 'Kesuda (Palash) Extract, Shea Butter, Vitamin E, Sunflower Seed Oil, Vegetable Glycerin, Purified Water.',
 ARRAY['Effortlessly absorbs into skin for day-long comfort', 'Kesuda extract calms irritated sun-stressed skin', 'Shea butter and Vitamin E replenish lipid barrier'],
 ARRAY['Absorbs effortlessly to revive dry or dull skin', 'Kesuda extract & Vitamin E soothe sensitivity', 'Silky non-greasy all-day comfortable hydration'],
 'Massage gently all over the body, focusing on areas needing soothing moisture.',
 399.00, '100 gm', '/images/products/kesuda-palash-body-cream.webp', 'Dry, Sensitive, Rough & Dull Skin', TRUE),

('honey-almond-body-cream', 'Honey Almond Body Cream', 'honey-almond-body-cream', 'Body Care',
 'Nourishing body cream enriched with Honey, Almond, and Shea Butter.',
 'Nourishing body cream enriched with honey and cold-pressed almond oil to deeply moisturize, soften, and leave skin smooth, supple, and radiant.',
 'Honey Extract, Sweet Almond Oil, Shea Butter, Sunflower Oil, Vegetable Glycerin, Purified Water.',
 ARRAY['Deeply moisturizes parched skin with honey', 'Sweet Almond oil provides essential fatty acids', 'Softens rough flaking skin textures'],
 ARRAY['Enriched with pure Honey & Sweet Almond oil', 'Deeply moisturizes, softens, and replenishes', 'Velvety finish leaves skin radiant and smooth'],
 'Apply a generous dollop all over clean body. Gently massage until absorbed.',
 399.00, '100 gm', '/images/products/honey-almond-body-cream.webp', 'Dry, Very Dry & Rough Body Skin', FALSE),

('face-body-wash-neem-tulsi', 'Neem Tulsi Face & Body Wash', 'face-body-wash-neem-tulsi', 'Face & Body Wash',
 'Refreshing plant-based liquid cleanser infused with Neem & Tulsi for daily purification.',
 'Neem & Tulsi Face & Body Wash is an artisanal liquid botanical cleanser handcrafted with saponified vegetable oils and concentrated herbal infusions.',
 'Neem-Tulsi Infused Water, Saponified Oils of Coconut, Mahua, Sunflower & Castor, Pure Neem Oil, Vegetable Glycerin.',
 ARRAY['Gentle everyday cleansing removes dirt and sweat', 'Neem supports clarity and blemish control', 'Tulsi energizes tired skin with botanical antioxidants'],
 ARRAY['Gentle everyday cleanse removes dirt & excess oil', 'Pure Neem & Tulsi herbs clarify and soothe', 'Vegetable glycerin prevents tightness after bathing'],
 'Pump onto wet hands or loofah. Lather generously over face and body. Rinse clean.',
 599.00, '300 ml', '/images/products/neem-tulsi-face-body-wash.webp', 'Oily, Combination & Acne-Prone Skin', TRUE),

('face-body-wash-kesuda', 'Kesuda Face & Body Wash', 'face-body-wash-kesuda', 'Face & Body Wash',
 'Hydrating Kesudo (Palash) flower liquid body wash for soft, freshly cooled skin.',
 'Kesuda Face & Body Wash is crafted with distilled Kesuda flower infused water and saponified plant oils to soothe heat-stressed skin.',
 'Kesuda Flower Infused Water, Saponified Oils of Coconut, Mahua, Sunflower & Castor, Vegetable Glycerin.',
 ARRAY['Gently cleanses while preserving natural moisture', 'Kesudo flower essence keeps skin cool in hot weather', 'Reduces surface redness and prickly heat discomfort'],
 ARRAY['Kesudo (Palash) flower water cools & revives', 'Leaves skin silky, soft, and refreshed', 'Plant-based saponified oils create gentle lather'],
 'Apply to wet skin during bath. Work into a cooling aromatic lather. Rinse with cool water.',
 599.00, '300 ml', '/images/products/kesuda-face-body-wash.webp', 'Normal, Sensitive & Heat-Sensitive Skin', FALSE),

('hand-wash-lemon', 'Lemon Hand Wash', 'hand-wash-lemon', 'Hand Wash',
 'Nourishing plant-based liquid hand wash with fresh cold-pressed Lemon essential oil.',
 'Lemon Hand Wash is made with saponified vegetable oils and cold-pressed Lemon Essential Oil. It cleanses hands effectively while replenishing moisture.',
 'Saponified Oils of Coconut, Mahua, Sunflower & Castor, Vegetable Glycerin, Cold-Pressed Lemon Essential Oil.',
 ARRAY['Gently removes dirt, grease, and impurities', 'Crafted from saponified plant oils without harsh sulfates', 'Natural cold-pressed lemon oil neutralizes odors'],
 ARRAY['Plant-based cleansing removes dirt & food odors', 'High vegetable glycerin protects against dryness', 'Refreshing natural lemon aroma energizes hands'],
 'Dispense 1 pump onto wet hands. Rub for 20 seconds. Rinse clean with water.',
 599.00, '300 ml', '/images/products/lemon-hand-wash.webp', 'All Skin Types (Frequent Daily Handwashing)', FALSE),

('rice-aloe-face-cream', 'Rice Aloe Face Cream', 'rice-aloe-face-cream', 'Face Care',
 'Nourishing daily face cream combining traditional Rice extract, Aloe Vera, and Jojoba Oil.',
 'Rice Aloe Face Cream combines the soothing comfort of Aloe Vera with the brightening heritage of Rice and Jojoba Oil to keep facial skin soft, supple, and radiant.',
 'Aloe Vera Juice, Rice Starch & Extract, Jojoba Oil, Sunflower Oil, Vegetable Glycerin.',
 ARRAY['Keeps facial skin soft and moisturized all day', 'Pure Aloe Vera soothes environmental irritation', 'Rice starch promotes a luminous even tone', 'Jojoba oil balances moisture without feeling greasy'],
 ARRAY['Rice extract & Aloe Vera soothe and brighten', 'Jojoba oil balances moisture without feeling greasy', 'Softens and smooths skin texture naturally'],
 'After cleansing, take a small amount on fingertips. Dot across face and neck, then massage gently.',
 399.00, '100 gm', '/images/products/rice-aloe-face-cream.webp', 'Dry, Normal, Combination & Sensitive Facial Skin', TRUE),

('lip-balm', 'Natural Lip Balm', 'lip-balm', 'Lip Care',
 'Nourishing botanical lip balm with natural oils, Shea butter, and pure Beeswax.',
 'Natural Lip Balm shields delicate lips from dryness and chapping using nourishing Almond Oil, Coconut Oil, unrefined Shea Butter, and pure Beeswax.',
 'Coconut Oil, Pure Beeswax, Sweet Almond Oil, Shea Butter, Castor Oil, Natural Mixed Fruit Flavor Oil.',
 ARRAY['Deeply moisturizes and comforts dry chapped lips', 'Forms a botanical barrier sealing in hydration', 'Free from petroleum jelly or synthetic chemicals'],
 ARRAY['Pure Coconut Oil, Almond Oil & Shea Butter', 'Protective natural beeswax seals in moisture', 'Prevents chapping and keeps lips soft all day'],
 'Smooth a small amount onto lips with clean fingertips as needed.',
 70.00, '10 g', '/assets/products/lip-balm.webp', 'Dry, Chapped & Sensitive Lips', FALSE)
ON CONFLICT (id) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    weight_or_volume = EXCLUDED.weight_or_volume,
    image_url = EXCLUDED.image_url,
    description = EXCLUDED.description,
    ingredients = EXCLUDED.ingredients,
    benefits = EXCLUDED.benefits,
    three_main_benefits = EXCLUDED.three_main_benefits,
    usage_instructions = EXCLUDED.usage_instructions,
    updated_at = NOW();
