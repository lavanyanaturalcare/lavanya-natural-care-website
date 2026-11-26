# ONZNATURAL — Phase 0 Full-Stack Audit (`AUDIT.md`)

**Website:** [https://onznatural.com/](https://onznatural.com/)  
**Repository:** `lavanyanaturalcare/lavanya-natural-care-website`  
**Stack:** React 18, TypeScript, Vite 5, Tailwind CSS, React Router v6, Supabase (PostgreSQL + Auth + RLS + Edge Functions), Cloudflare Pages  
**AI Provider:** Google Gemini via Supabase Edge Function (`supabase/functions/gemini-consultant/index.ts`)  
**Payments / Orders:** Direct UPI (`upi://pay`), Cash on Delivery (COD), and 1-click WhatsApp Order Requests

---

## 1. Repository & Architecture Map

- **Routes (`src/App.tsx`)**:
  - Public Storefront: `/`, `/products`, `/products/:id`, `/product/:id`, `/ai-consultant`, `/ingredients`, `/process`, `/about`, `/contact`, `/blog`, `/blog/:slug`, `/wishlist`
  - Legal & Policies: `/shipping-delivery`, `/refund-policy`, `/privacy-policy`, `/cookie-policy`, `/terms`
  - Auth & Account: `/login`, `/signin`, `/register`, `/signup`, `/forgot-password`, `/account`
  - Operations / Admin: `/admin` (`AdminDashboard.tsx`)
- **Key Services & Data**:
  - `src/services/supabaseClient.ts`: Supabase JS client initializer (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
  - `src/services/crmService.ts`: Customer profiles, sessions, consents, AI conversations/messages, product interests, enquiries, deletion requests, audit logs, product catalogue
  - `src/services/geminiService.ts`: Calls `gemini-consultant` Edge Function with deterministic local fallback
  - `src/data/products.ts`: Authoritative 17-product catalogue
  - `supabase/schema.sql` & `supabase/migrations/*.sql`: PostgreSQL tables, `SECURITY DEFINER` guest RPCs, RLS policies
- **Environment Variables**:
  - Frontend (`VITE_*`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Server-side Edge Function Secret: `GEMINI_API_KEY` (stored in Supabase Secrets)

---

## 2. End-to-End AI Chat & Admin Data History Trace

### A. Floating AI Widget (`src/components/AIAssistantWidget.tsx`)
- **Trace**: `User types message -> handleSend() -> askOnzAI() -> setMessages(React state)`
- **Where data is lost (CRITICAL)**: `AIAssistantWidget.tsx` **never** calls `createConversation()` or `saveMessage()`. Every chat in the floating widget lives only in ephemeral React `useState` and is permanently lost on refresh or widget close.

### B. Full AI Consultant Page (`src/pages/AIConsultant.tsx`)
- **Trace**: `User types message -> handleSendChat() -> if (hasChatConsent) createConversation() -> saveMessage('customer') -> askOnzAI() -> saveMessage('ai')`
- **Where data is lost (CRITICAL)**:
  1. `saveMessage` error is silently swallowed (`saveMessage(...).catch(() => {})`).
  2. When `hasChatConsent` is `false` or not yet clicked, `conversations`/`messages` are not written.
  3. In `crmService.ts`, `saveMessage` falls back to direct `.insert().select().single()` + `conversations.update(...)` if `append_guest_message` RPC fails. Under hardened RLS, `anon` cannot `SELECT` or `UPDATE` `conversations`/`messages`, causing PostgREST `42501` errors.
  4. `messages` lack `metadata` (model, errors, latency/tokens) and `createConversation` / `saveMessage` do not retry transient failures or surface a visible persistence error to the user.

### C. Contact Form (`src/pages/Contact.tsx`)
- **Trace**: `User submits contact form -> handleSubmit() -> setTimeout(600ms) -> setIsSubmitted(true)`
- **Where data is lost (CRITICAL)**: `Contact.tsx` **never calls `createEnquiry()`** or writes to `customer_enquiries` in Supabase. All contact form submissions are discarded client-side.

### D. Orders / Checkout (`src/components/OrderModal.tsx`)
- **Trace**: `User clicks Confirm / Submit COD -> handleDirectWhatsAppOrder() -> createEnquiry()`
- **Where data is lost (HIGH)**:
  1. `createEnquiry` calls `.insert([payload]).select().single()`. Under hardened RLS (`anon` cannot `SELECT` `customer_enquiries`), `.select().single()` fails with an RLS error, which `OrderModal.tsx` silently ignores in `try {} catch (e) {}`!
  2. UPI flow (`Open UPI App` / `Copy UPI ID`) does not record an order/enquiry record in the database at all unless the user also clicks WhatsApp.
  3. There is no dedicated `orders` persistence / order confirmation reference ID shown to the customer.

### E. Admin Audit Logs (`crmService.ts` & `AdminDashboard.tsx`)
- **Trace**: `Admin updates product/status -> logAdminAction() -> admin_audit_logs`
- **Where data is lost (CRITICAL)**:
  1. Schema (`20261121_fix_auth_and_admin.sql`) defines columns: `admin_user_id`, `admin_email` (NOT NULL), `action`, `target_entity` (NOT NULL), `target_id`, `details`, `created_at`.
  2. `crmService.ts` inserts wrong column names (`record_type`, `record_id`, `metadata`) without `admin_email`, and `getAdminAuditLogs()` orders by nonexistent column `timestamp` instead of `created_at` — silently returning `[]` on every call!
  3. Product edits (`updateProductInDb`) do not record `old_value -> new_value` diffs in the audit log.

### F. Admin Dashboard Display (`src/pages/AdminDashboard.tsx`)
- **Bugs (HIGH)**:
  1. Nested `messages` inside `getConversations()` are not sorted chronologically (`created_at ASC`), and message bubbles do not display individual timestamps (`m.created_at`) or metadata.
  2. No real-time listener (Supabase Realtime) or auto-refresh polling for live AI chats, enquiries, or audit logs.
  3. Missing pagination on chats, enquiries, and audit logs; missing status filter on chats (`active`, `completed`, `abandoned`).

---

## 3. Ranked Bug & Risk Register

| Severity | Area | Finding |
|---|---|---|
| **Critical** | `AIAssistantWidget.tsx` | Live chat messages in floating widget are never saved to Supabase (`conversations`/`messages`). |
| **Critical** | `Contact.tsx` | Contact form simulates success with `setTimeout` and never saves submissions to `customer_enquiries`. |
| **Critical** | `crmService.ts` (`logAdminAction` / `getAdminAuditLogs`) | Column name mismatch (`record_type`/`metadata`/`timestamp` vs `target_entity`/`details`/`created_at` + `admin_email`) causes all audit log reads/writes to fail silently. |
| **Critical** | `crmService.ts` (`createEnquiry` / `saveMessage`) | `.insert().select().single()` fails under hardened RLS for `anon` visitors; needs `SECURITY DEFINER` RPC or insert-only without `.select()`. |
| **High** | `OrderModal.tsx` | Silently swallows `createEnquiry` errors; UPI clicks do not persist order records; no order confirmation reference number. |
| **High** | `AdminDashboard.tsx` | Chat messages not sorted by `created_at`, no timestamps/metadata shown, no live real-time updates/polling, no pagination/status filter on chats. |
| **High** | `AdminDashboard.tsx` (`handleSaveProduct` / `handleSaveFullProduct`) | Product edits do not log `old_value -> new_value` in `admin_audit_logs`. |
| **Medium** | Testing | No automated test suite (`vitest`) covering chat persistence, enquiry saving, audit logs, and security/sanitization utilities. |
| **Medium** | `AIAssistantWidget.tsx` | Shows old `p.mrp` instead of `p.discountPrice || p.mrp` in recommended product chips. |
| **Low** | Documentation | Missing root `README.md` with env vars, setup, and maintenance instructions. |
