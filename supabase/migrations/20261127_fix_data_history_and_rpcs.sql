-- =====================================================================
-- ONZNATURAL: FIX DATA HISTORY, CHAT METADATA, ORDERS & AUDIT LOGS
-- Safe, non-destructive migration (preserves all existing records).
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/fyhacouitykpbvylxwtz/sql/new
-- =====================================================================

-- 1. Add metadata column to messages (model, errors, latency, etc.)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;

-- 2. Ensure indexes for fast chronological chat & audit queries
CREATE INDEX IF NOT EXISTS idx_conversations_last_activity ON public.conversations(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.customer_enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_audit_logs(created_at DESC);

-- 3. Ensure customer_enquiries has enquiry_type & contact_info compatibility columns
ALTER TABLE public.customer_enquiries
  ADD COLUMN IF NOT EXISTS enquiry_type TEXT DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS contact_info TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_notes TEXT;

-- 4. Update append_guest_message RPC to accept optional p_metadata
CREATE OR REPLACE FUNCTION public.append_guest_message(
    p_conversation_id UUID,
    p_token_hash TEXT,
    p_sender TEXT,
    p_content TEXT,
    p_recommended_products JSONB DEFAULT '[]'::JSONB,
    p_metadata JSONB DEFAULT '{}'::JSONB
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

    IF NOT EXISTS (
        SELECT 1 FROM public.conversations
        WHERE id = p_conversation_id AND session_id = v_session_id::TEXT
    ) THEN
        RAISE EXCEPTION 'Unauthorized: conversation does not belong to this session';
    END IF;

    INSERT INTO public.messages (conversation_id, sender, message_content, recommended_product_ids, metadata)
    VALUES (p_conversation_id, p_sender, p_content, p_recommended_products, COALESCE(p_metadata, '{}'::JSONB))
    RETURNING id INTO v_msg_id;

    UPDATE public.conversations
    SET last_activity_at = NOW(), updated_at = NOW()
    WHERE id = p_conversation_id;

    RETURN v_msg_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Secure guest enquiry submission RPC (returns new ID without exposing SELECT on all enquiries)
CREATE OR REPLACE FUNCTION public.submit_guest_enquiry(
    p_token_hash TEXT,
    p_customer_name TEXT,
    p_contact_details TEXT,
    p_message TEXT,
    p_enquiry_type TEXT DEFAULT 'contact_form',
    p_product_id TEXT DEFAULT NULL,
    p_customer_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_enquiry_id UUID;
BEGIN
    v_session_id := public.create_or_get_guest_session(p_token_hash);

    INSERT INTO public.customer_enquiries (
        session_id,
        customer_id,
        customer_name,
        contact_details,
        contact_info,
        enquiry_type,
        message,
        product_id,
        status
    )
    VALUES (
        v_session_id::TEXT,
        p_customer_id,
        p_customer_name,
        p_contact_details,
        p_contact_details,
        COALESCE(p_enquiry_type, 'contact_form'),
        p_message,
        p_product_id,
        'new'
    )
    RETURNING id INTO v_enquiry_id;

    RETURN v_enquiry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fix log_admin_action RPC to match actual admin_audit_logs schema
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action TEXT,
    p_target_entity TEXT,
    p_target_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_email TEXT;
BEGIN
    SELECT COALESCE(email, 'admin@onznatural.com') INTO v_email
    FROM auth.users WHERE id = auth.uid();

    INSERT INTO public.admin_audit_logs (
        admin_user_id,
        admin_email,
        action,
        target_entity,
        target_id,
        details
    )
    VALUES (
        auth.uid(),
        COALESCE(v_email, 'admin@onznatural.com'),
        p_action,
        p_target_entity,
        p_target_id,
        COALESCE(p_details, '{}'::JSONB)
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
