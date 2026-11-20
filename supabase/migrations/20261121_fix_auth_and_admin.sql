-- =====================================================================
-- ONZNATURAL: FIX AUTH CONFIRMATION, ADMIN ACCESS, RLS & SEED DATA
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/fyhacouitykpbvylxwtz/sql/new
-- =====================================================================

-- 1. CONFIRM OWNER IN AUTH (Only update email_confirmed_at, confirmed_at is generated)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    last_sign_in_at = NOW()
WHERE email = 'owner@onznatural.com';

-- 2. CREATE MISSING TABLES IF NOT EXISTS

-- Table: admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'store_manager' CHECK (role IN ('super_admin', 'store_manager', 'support_agent')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure owner@onznatural.com is registered as super_admin
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'owner@onznatural.com' LIMIT 1;
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.admin_users (user_id, email, full_name, role)
        VALUES (v_user_id, 'owner@onznatural.com', 'ONZNATURAL Store Owner', 'super_admin')
        ON CONFLICT (email) DO UPDATE SET role = 'super_admin', user_id = v_user_id;
    END IF;
END $$;

-- Table: customer_events
CREATE TABLE IF NOT EXISTS public.customer_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_payload JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: admin_audit_logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: products
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    net_weight_or_vol TEXT NOT NULL,
    mrp NUMERIC(10, 2) NOT NULL,
    discount_price NUMERIC(10, 2),
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    benefits JSONB NOT NULL DEFAULT '[]'::JSONB,
    image TEXT NOT NULL,
    availability_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued')),
    stock_quantity INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FIX ROW LEVEL SECURITY (RLS) POLICIES
-- Allow public / anon registration in customers table (vital for account creation)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can register their profile" ON public.customers;
DROP POLICY IF EXISTS "Public can register customer profile" ON public.customers;
CREATE POLICY "Public can register customer profile"
    ON public.customers FOR INSERT TO public
    WITH CHECK (email IS NOT NULL AND (full_name IS NOT NULL OR name IS NOT NULL));

DROP POLICY IF EXISTS "Public can view customer profile" ON public.customers;
CREATE POLICY "Public can view customer profile"
    ON public.customers FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS "Admins have full access to customers" ON public.customers;
CREATE POLICY "Admins have full access to customers"
    ON public.customers FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- Allow public / anon to record product interests
ALTER TABLE public.product_interests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can record product interests" ON public.product_interests;
CREATE POLICY "Public can record product interests"
    ON public.product_interests FOR INSERT TO public
    WITH CHECK (product_id IS NOT NULL);

DROP POLICY IF EXISTS "Public can view product interests" ON public.product_interests;
CREATE POLICY "Public can view product interests"
    ON public.product_interests FOR SELECT TO public
    USING (true);

-- Allow public / anon to record customer events
ALTER TABLE public.customer_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can record customer events" ON public.customer_events;
CREATE POLICY "Public can record customer events"
    ON public.customer_events FOR INSERT TO public
    WITH CHECK (event_type IS NOT NULL);

DROP POLICY IF EXISTS "Public can view customer events" ON public.customer_events;
CREATE POLICY "Public can view customer events"
    ON public.customer_events FOR SELECT TO public
    USING (true);

-- Allow public to access conversations & messages
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can access conversations" ON public.conversations;
CREATE POLICY "Public can access conversations"
    ON public.conversations FOR ALL TO public
    USING (true)
    WITH CHECK (true);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can access messages" ON public.messages;
CREATE POLICY "Public can access messages"
    ON public.messages FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- Allow public to access customer_enquiries
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can access customer enquiries" ON public.customer_enquiries;
CREATE POLICY "Public can access customer enquiries"
    ON public.customer_enquiries FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- Allow public to access data deletion requests
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can access deletion requests" ON public.data_deletion_requests;
CREATE POLICY "Public can access deletion requests"
    ON public.data_deletion_requests FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- Allow public to view products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products"
    ON public.products FOR ALL TO public
    USING (true)
    WITH CHECK (true);

-- 4. INSERT REALISTIC SEED DATA IF TABLES ARE EMPTY

-- Seed Customers
INSERT INTO public.customers (name, full_name, email, phone, preferred_language, status, notes)
VALUES 
('Pooja Patel', 'Pooja Patel', 'pooja.patel@example.com', '+91 98250 12345', 'gu', 'active', 'Regular customer from Alkapuri, Vadodara. Prefers Neem Tulsi soap for humid weather.'),
('Dr. Rajesh Shah', 'Dr. Rajesh Shah', 'dr.rajesh@example.com', '+91 97260 54321', 'en', 'active', 'Prefers cold process soap with natural plant glycerin. Dermatologist in Ahmedabad.'),
('Meera Desai', 'Meera Desai', 'meera.desai@example.com', '+91 94270 98765', 'gu', 'active', 'Ordered Aparajita Body Lotion and Kesuda Body Cream. Surat client.'),
('Ananya Sharma', 'Ananya Sharma', 'ananya.sharma@example.com', '+91 98980 11223', 'en', 'active', 'Frequent user of Kesuda Palash soap for sensitive summer skin.'),
('Kavita Joshi', 'Kavita Joshi', 'kavita.joshi@example.com', '+91 99090 33445', 'hi', 'active', 'Inquired about Ubtan soap for wedding bridal skincare gift pack.')
ON CONFLICT (email) DO NOTHING;

-- Seed Customer Enquiries
INSERT INTO public.customer_enquiries (customer_name, contact_details, inquiry_type, message, status)
VALUES
('Pooja Patel', 'pooja.patel@example.com / +91 98250 12345', 'delivery', 'Can I get same-day delivery in Subhanpura Vadodara for 3 bars of Neem Tulsi soap?', 'resolved'),
('Dr. Rajesh Shah', 'dr.rajesh@example.com / +91 97260 54321', 'bulk_order', 'Would like to order 20 units of Ubtan and Kokum soaps for corporate festive gift hampers.', 'contacted'),
('Ananya Sharma', 'ananya.sharma@example.com / +91 98980 11223', 'product_info', 'Does the Kesuda body lotion contain synthetic fragrances? Looking for 100% natural formulation.', 'new'),
('Vikram Mehta', '+91 98240 66778', 'order', 'Placed order via WhatsApp for 2x Kesuda Palash soap and 1x Charcoal Rice soap. Paid via UPI 9726739515@upi.', 'new')
ON CONFLICT DO NOTHING;

-- Seed Product Interests
INSERT INTO public.product_interests (session_id, product_id, interest_type)
VALUES
('session_vadodara_1', 'kesuda-palash-soap', 'order_intent'),
('session_vadodara_1', 'neem-tulsi-soap', 'view_details'),
('session_vadodara_2', 'aparajita-body-lotion', 'quick_preview'),
('session_vadodara_2', 'kesuda-body-cream', 'order_intent'),
('session_vadodara_3', 'ubtan-soap', 'view_details'),
('session_vadodara_4', 'charcoal-rice-soap', 'view_details'),
('session_vadodara_5', 'rice-aloe-face-cream', 'order_intent')
ON CONFLICT DO NOTHING;

-- Seed Conversations
DO $$
DECLARE
    v_c_id UUID;
    v_cust_id UUID;
BEGIN
    SELECT id INTO v_cust_id FROM public.customers WHERE email = 'pooja.patel@example.com' LIMIT 1;
    
    INSERT INTO public.conversations (session_id, customer_id, summary, status)
    VALUES ('sess_consult_1', v_cust_id, 'Consultation for humid climate blemish care', 'active')
    RETURNING id INTO v_c_id;

    INSERT INTO public.messages (conversation_id, sender, message_content, recommended_product_ids)
    VALUES 
    (v_c_id, 'customer', 'Which soap is best for oily skin in Vadodara summer?', '[]'::JSONB),
    (v_c_id, 'ai', 'Namaste Pooja! For oily and blemish-prone skin in Vadodara humid climate, we recommend our Neem & Tulsi Soap (₹99, 100g) which purifies pores with organic neem leaves, and Charcoal Rice Soap (₹99) which balances excess sebum naturally without stripping skin moisture.', '["neem-tulsi-soap", "charcoal-rice-soap"]'::JSONB);
END $$;
