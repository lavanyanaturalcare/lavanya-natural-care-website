# ONZNATURAL — Handcrafted Botanical Skincare Storefront & Operations CRM

**Website:** [https://onznatural.com/](https://onznatural.com/)  
**Atelier:** FF-22 Pujar Complex, Subhanpura, Vadodara, Gujarat 390023, India

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS, React Router v6, Lucide Icons
- **Backend / Database / Auth**: Supabase (PostgreSQL, Row Level Security, Supabase Auth, Edge Functions)
- **AI Consultant**: Google Gemini via server-side Supabase Edge Function (`supabase/functions/gemini-consultant`)
- **Hosting**: Cloudflare Pages (`dist/` + `public/_headers` + `dist/404.html`)
- **Testing**: Vitest (`npm test`)

---

## Environment Variables

### Frontend (`.env` / Cloudflare Pages Environment Variables)
| Variable | Purpose | Public? |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key (protected by RLS) | Yes |

### Server-Side (Supabase Edge Function Secrets — NEVER in frontend `.env`)
| Secret | Purpose |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key for `gemini-consultant` Edge Function |

---

## Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run automated tests
npm test

# 3. Type-check & production build
npx tsc --noEmit && npm run build

# 4. Preview production build locally
npm run preview
```

---

## Database Migrations & Edge Function Deployment

1. Apply SQL migrations in `supabase/migrations/` in chronological order via the Supabase SQL Editor (including `20261126_harden_rls_policies.sql` and `20261127_fix_data_history_and_rpcs.sql`).
2. Deploy the Edge Function:
   ```bash
   supabase secrets set GEMINI_API_KEY="YOUR_KEY" --project-ref fyhacouitykpbvylxwtz
   supabase functions deploy gemini-consultant --project-ref fyhacouitykpbvylxwtz
   ```
3. See `docs/` for detailed owner, admin, Supabase, deployment, and troubleshooting guides.
