-- =====================================================================
-- ONZNATURAL: HARDEN ROW LEVEL SECURITY (RLS) POLICIES
-- Restricts private customer PII, AI chats, enquiries, and audit logs
-- strictly to authenticated owners/admins and record owners.
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/fyhacouitykpbvylxwtz/sql/new
-- =====================================================================

-- 1. Helper function to verify admin membership cleanly without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- 2. ADMIN_USERS: Only admins (or user checking their own row) can view
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Super admins manage admin_users" ON public.admin_users;
CREATE POLICY "Super admins manage admin_users"
  ON public.admin_users FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. PRODUCTS: Public can read storefront catalogue; only admins can modify
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products"
  ON public.products FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. CUSTOMERS: Public can register; only owner of record or admin can view/edit
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can register customer profile" ON public.customers;
DROP POLICY IF EXISTS "Public can view customer profile" ON public.customers;
DROP POLICY IF EXISTS "Admins have full access to customers" ON public.customers;

CREATE POLICY "Public can register customer profile"
  ON public.customers FOR INSERT TO public
  WITH CHECK (email IS NOT NULL);

CREATE POLICY "Customers and admins can view customer profile"
  ON public.customers FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Customers and admins can update customer profile"
  ON public.customers FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_admin())
  WITH CHECK (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can delete customer profile"
  ON public.customers FOR DELETE TO authenticated
  USING (public.is_admin());

-- 5. CONVERSATIONS & MESSAGES: Only owner or admin can read; public can insert with consent
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can access conversations" ON public.conversations;

CREATE POLICY "Public can create conversations"
  ON public.conversations FOR INSERT TO public
  WITH CHECK (session_id IS NOT NULL);

CREATE POLICY "Admins and owners can view conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (
    public.is_admin() OR
    customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins can manage conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete conversations"
  ON public.conversations FOR DELETE TO authenticated
  USING (public.is_admin());

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can access messages" ON public.messages;

CREATE POLICY "Public can insert messages"
  ON public.messages FOR INSERT TO public
  WITH CHECK (conversation_id IS NOT NULL);

CREATE POLICY "Admins and owners can view messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    public.is_admin() OR
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
    )
  );

-- 6. CUSTOMER ENQUIRIES: Public can submit; only admins or owner can read/update
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can access customer enquiries" ON public.customer_enquiries;

CREATE POLICY "Public can submit customer enquiries"
  ON public.customer_enquiries FOR INSERT TO public
  WITH CHECK (customer_name IS NOT NULL AND contact_details IS NOT NULL);

CREATE POLICY "Admins and owners can view customer enquiries"
  ON public.customer_enquiries FOR SELECT TO authenticated
  USING (
    public.is_admin() OR
    customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admins can update customer enquiries"
  ON public.customer_enquiries FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. DATA DELETION REQUESTS & CONSENTS: Public can submit; only admins can read/process
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can access deletion requests" ON public.data_deletion_requests;

CREATE POLICY "Public can submit deletion requests"
  ON public.data_deletion_requests FOR INSERT TO public
  WITH CHECK (email_or_phone IS NOT NULL);

CREATE POLICY "Admins can view and process deletion requests"
  ON public.data_deletion_requests FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.customer_consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can record consent" ON public.customer_consents;
CREATE POLICY "Public can record consent"
  ON public.customer_consents FOR INSERT TO public
  WITH CHECK (consent_type IS NOT NULL);

CREATE POLICY "Admins and owners can view consents"
  ON public.customer_consents FOR SELECT TO authenticated
  USING (
    public.is_admin() OR
    customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid())
  );

-- 8. TELEMETRY (product_interests & customer_events): Public insert; Admin-only read
ALTER TABLE public.product_interests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can record product interests" ON public.product_interests;
DROP POLICY IF EXISTS "Public can view product interests" ON public.product_interests;

CREATE POLICY "Public can record product interests"
  ON public.product_interests FOR INSERT TO public
  WITH CHECK (product_id IS NOT NULL);

CREATE POLICY "Admins can view product interests"
  ON public.product_interests FOR SELECT TO authenticated
  USING (public.is_admin());

ALTER TABLE public.customer_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can record customer events" ON public.customer_events;
DROP POLICY IF EXISTS "Public can view customer events" ON public.customer_events;

CREATE POLICY "Public can record customer events"
  ON public.customer_events FOR INSERT TO public
  WITH CHECK (event_type IS NOT NULL);

CREATE POLICY "Admins can view customer events"
  ON public.customer_events FOR SELECT TO authenticated
  USING (public.is_admin());

-- 9. ADMIN AUDIT LOGS: Admin-only insert and select
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can access audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can access audit logs"
  ON public.admin_audit_logs FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
