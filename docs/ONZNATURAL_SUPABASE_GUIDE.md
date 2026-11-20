# ONZNATURAL — Supabase Database Architecture & Operations Guide

**Database**: PostgreSQL 15 via Supabase  
**Project ID**: `fyhacouitykpbvylxwtz`  
**Project URL**: `https://fyhacouitykpbvylxwtz.supabase.co`  
**Management Console**: [https://supabase.com/dashboard/project/fyhacouitykpbvylxwtz](https://supabase.com/dashboard/project/fyhacouitykpbvylxwtz)  

---

## 1. Architecture Overview

ONZNATURAL utilizes Supabase for database persistence, real-time Row Level Security (RLS), authentication, and serverless Edge Functions.

```
                    ┌───────────────────────────────┐
                    │     Client Browser / Store    │
                    └───────────────┬───────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               │                                         │
               ▼                                         ▼
   ┌──────────────────────┐                  ┌──────────────────────┐
   │  Supabase Edge Func  │                  │   Supabase Postgres  │
   │  `gemini-consultant` │                  │  13 Normalized Tables│
   │   (Gemini 2.5 Flash) │                  │  Protected by RLS    │
   └──────────────────────┘                  └──────────────────────┘
```

---

## 2. Authentication Model: Users vs Customers vs Admins

Supabase separates identity from operational data:

| Entity | Location | Purpose |
| :--- | :--- | :--- |
| **Auth User** | `auth.users` | Supabase managed table containing cryptographic passwords, email verification tokens, and session JWTs. |
| **Customer Profile** | `public.customers` | Storefront customer record containing contact details, shipping language, and link to `auth_user_id`. |
| **Store Administrator** | `public.admin_users` | Authorized staff list containing `user_id` and administrative role (`super_admin`, `store_manager`, `support`). |

### How to Create an Administrator:
1. Log into your Supabase Dashboard: [https://supabase.com/dashboard/project/fyhacouitykpbvylxwtz](https://supabase.com/dashboard/project/fyhacouitykpbvylxwtz)
2. In the left navigation, click **Authentication** &rarr; **Users**.
3. Click **Add user** &rarr; **Create user**.
4. Enter the administrator's email (e.g. `owner@onznatural.com`) and choose a strong password. Click **Create user**.
5. Copy the newly generated **User UID** (e.g. `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).
6. Navigate to **Table Editor** &rarr; `admin_users`.
7. Click **Insert row** and fill in:
   - `user_id`: Paste the User UID copied in step 5
   - `email`: `owner@onznatural.com`
   - `role`: `super_admin`
8. Click **Save**. The user can now securely log in at `https://onznatural.com/admin`.

---

## 3. Schema Breakdown of All 13 Database Tables

### 1. `customers`
Stores customer identity, contact information, and registration timestamps.
- `id` (UUID, Primary Key)
- `auth_user_id` (UUID, Nullable, References `auth.users(id)`)
- `name` / `full_name` (Text)
- `email` (Text, Unique)
- `phone` (Text, Nullable)
- `preferred_language` (Text, e.g. `'en'`, `'hi'`, `'gu'`)
- `registration_date` (Timestamp)
- `status` (Text: `'active'`, `'inactive'`, `'blocked'`)
- `notes` (Text, Nullable)

### 2. `customer_consents`
Records timestamped, auditable consent records in compliance with India's DPDP Act.
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Nullable, References `customers(id)`)
- `session_id` (Text)
- `consent_type` (Text: `'ai_chat_storage'`, `'marketing_offers'`, `'analytics_cookies'`)
- `consent_status` (Text: `'granted'`, `'revoked'`)
- `granted` (Boolean)
- `privacy_notice_version` (Text, e.g. `'v2.0-onznatural'`)
- `created_at` / `revoked_at` (Timestamp)

### 3. `conversations`
Header records for AI skincare consultations.
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Nullable, References `customers(id)`)
- `session_id` (Text)
- `started_at` / `last_activity_at` (Timestamp)
- `summary` (Text, Nullable)
- `status` (Text: `'active'`, `'completed'`, `'abandoned'`)
- `consent_id` (UUID, Nullable)

### 4. `messages`
Individual customer and AI turns in an AI consultation session.
- `id` (UUID, Primary Key)
- `conversation_id` (UUID, References `conversations(id)` ON DELETE CASCADE)
- `sender` (Text: `'customer'`, `'ai'`)
- `message_content` (Text)
- `recommended_product_ids` (Text Array)
- `created_at` (Timestamp)

### 5. `products`
The single source of truth for all 16 handcrafted botanicals, prices, and inventory availability.
- `id` (Text, Primary Key, e.g. `'kesuda-palash-soap'`)
- `product_name` (Text)
- `slug` (Text)
- `category` (Text)
- `short_description` (Text)
- `description` (Text)
- `ingredients` (Text)
- `benefits` (Text Array)
- `three_main_benefits` (Text Array)
- `price` (Numeric / Float, in INR)
- `weight_or_volume` (Text, e.g. `'100g Bar'`, `'200ml Bottle'`)
- `image_url` (Text)
- `additional_images` (Text Array)
- `skin_type` (Text)
- `availability_status` (Text: `'in_stock'`, `'low_stock'`, `'out_of_stock'`, `'discontinued'`)
- `is_featured` (Boolean)

### 6. `customer_events`
First-party telemetry stream recording user actions (product views, quick previews, modal opens).
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Nullable)
- `session_id` (Text)
- `event_type` (Text: `'view_details'`, `'quick_preview'`, `'wishlist_add'`, `'order_intent'`)
- `product_id` (Text, Nullable)
- `safe_metadata` (JSONB)
- `created_at` (Timestamp)

### 7. `product_interests`
Aggregated customer demand signals indicating purchase and exploration intent.
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Nullable)
- `session_id` (Text)
- `product_id` (Text, References `products(id)`)
- `interest_type` (Text: `'ai_recommended'`, `'view_details'`, `'order_intent'`, `'wishlist_add'`)
- `source` (Text, default `'storefront'`)
- `created_at` (Timestamp)

### 8. `customer_enquiries`
Order intents from the storefront, WhatsApp checkout, and customer contact forms.
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Nullable)
- `customer_name` (Text)
- `contact_details` / `contact_info` (Text, WhatsApp number or email)
- `message` (Text)
- `status` (Text: `'new'`, `'contacted'`, `'resolved'`, `'closed'`)
- `enquiry_type` (Text: `'whatsapp'`, `'order_checkout'`, `'contact_form'`)
- `created_at` / `updated_at` (Timestamp)

### 9. `customer_wishlists`
Customer saved items synchronized between local storage and database accounts.
- `id` (UUID, Primary Key)
- `customer_id` (UUID, References `auth.users(id)`)
- `product_id` (Text, References `products(id)`)
- `created_at` (Timestamp)

### 10. `data_deletion_requests`
Auditable log of DPDP / GDPR right to erasure requests.
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Nullable)
- `email_or_phone` (Text)
- `status` (Text: `'pending'`, `'processed'`, `'rejected'`)
- `requested_at` / `processed_at` (Timestamp)
- `reason` (Text, Nullable)

### 11. `admin_users`
Staff and administrator authorization registry.
- `id` (UUID, Primary Key)
- `user_id` (UUID, References `auth.users(id)`)
- `email` (Text)
- `role` (Text: `'super_admin'`, `'store_manager'`, `'support'`)
- `created_at` (Timestamp)

### 12. `admin_audit_logs`
Immutable chronological audit log of all administrator operations and data exports.
- `id` (UUID, Primary Key)
- `admin_user_id` (UUID, Nullable)
- `action` (Text)
- `record_type` (Text)
- `record_id` (Text, Nullable)
- `metadata` (JSONB)
- `timestamp` (Timestamp)

### 13. `retention_policies`
Legal data retention configuration settings.
- `id` (UUID, Primary Key)
- `chat_retention_days` (Integer, default 90)
- `analytics_retention_days` (Integer, default 180)
- `allow_guest_chat_storage` (Boolean, default true)
- `auto_purge_revoked_data` (Boolean, default true)
- `updated_at` (Timestamp)

---

## 4. Row Level Security (RLS) Policies

All tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

Key RLS rules:
1. **Public Read**:
   - `products`: Public can read all active products (`availability_status != 'discontinued'`).
2. **Customer Self-Access**:
   - `customers`, `customer_consents`, `customer_wishlists`: Authenticated customers can read and update only records matching `auth.uid() = auth_user_id`.
3. **Session-Based Privacy**:
   - Guests can write their own messages and enquiries matching their session token hash.
4. **Admin Access**:
   - Only users who satisfy `is_admin()` (i.e. existing in `admin_users`) can read all customers, read all chat transcripts, update product prices, and view the audit log.

---

## 5. Supabase Edge Function: `gemini-consultant`

The AI Skincare Advisor executes inside a secure Deno runtime Edge Function:
- **Location in Repo**: `supabase/functions/gemini-consultant/index.ts`
- **Model**: `gemini-2.5-flash`
- **Grounding**: Embedded JSON catalogue of all 16 ONZNATURAL botanicals

### Setting Environment Secrets:
To configure your Google Gemini API key:
```bash
supabase secrets set GEMINI_API_KEY="your-gemini-api-key" --project-ref fyhacouitykpbvylxwtz
```

### Viewing Edge Function Logs:
1. In the Supabase Dashboard, click **Edge Functions** in the left menu.
2. Select **`gemini-consultant`**.
3. Click the **Logs** tab to see real-time requests, token consumption, and response timings.

---

## 6. Backups & Database Exports

Supabase automatically takes daily backups. For manual offsite backups:
1. Navigate to **Database** &rarr; **Backups**.
2. Click **Download Backup** for the latest point-in-time snapshot.
3. To export individual tables as CSV, use the **Export Table** feature in the Table Editor or use the CSV export buttons built into `/admin`.
