# ONZNATURAL — Deployment & Operations Guide

This guide explains in plain language how to build, test, and deploy updates to **https://onznatural.com/** safely.

---

## 1. Hosting Architecture

- **Frontend Hosting**: Cloudflare Pages (`dist/` static build)
- **Domain & SSL**: `onznatural.com` managed via Cloudflare DNS & Universal SSL
- **Database, Auth & AI Edge Function**: Supabase (`https://fyhacouitykpbvylxwtz.supabase.co`)
- **Source Control**: GitHub (`lavanyanaturalcare/lavanya-natural-care-website`)

---

## 2. How to Deploy Frontend Updates

1. **Make changes on a feature/fix branch** (do not edit `main` directly during testing):
   ```bash
   git checkout -b fix/my-update
   ```
2. **Run typecheck and production build locally**:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
   Confirm `dist/index.html`, `dist/404.html`, and `dist/_headers` are generated cleanly with zero errors.
3. **Preview locally before publishing**:
   ```bash
   npm run preview
   ```
4. **Push to GitHub and merge into `main`** only after testing and owner approval:
   ```bash
   git push origin fix/my-update
   ```
   Once merged into `main`, Cloudflare Pages automatically builds and deploys `dist/` to `https://onznatural.com/`.

---

## 3. How to Deploy Supabase Database Migrations

Whenever a new `.sql` file is added under `supabase/migrations/`:

1. Open your Supabase Dashboard &rarr; **SQL Editor**.
2. Open the migration file (for example, `supabase/migrations/20261126_harden_rls_policies.sql`).
3. Paste the SQL into a **New Query** and click **Run**.
4. Verify there are no errors and confirm RLS is enabled on all customer/admin tables under **Authentication &rarr; Policies**.

---

## 4. How to Deploy the Gemini AI Edge Function

If `supabase/functions/gemini-consultant/index.ts` is updated:

1. Ensure the Supabase CLI is installed and logged in.
2. Confirm your server-side Gemini API secret is configured (never commit keys to Git):
   ```bash
   supabase secrets set GEMINI_API_KEY="YOUR_SECRET_KEY" --project-ref fyhacouitykpbvylxwtz
   ```
3. Deploy the Edge Function:
   ```bash
   supabase functions deploy gemini-consultant --project-ref fyhacouitykpbvylxwtz
   ```

---

## 5. Backups & Data Protection

- **Database Backups**: Enable daily automated backups in your Supabase project settings, and export a manual SQL dump before major schema changes.
- **Environment Variables**: In Cloudflare Pages (**Settings &rarr; Environment Variables**), only store public client configuration (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`). **Never** store `GEMINI_API_KEY` or Supabase `service_role` keys in Cloudflare Pages `VITE_*` variables.
