# ONZNATURAL — Troubleshooting & Technical Incident Guide

This guide contains solutions for common operational and technical incidents on the ONZNATURAL website and administrative systems.

---

## Issue 1: "Access Denied: This account is authenticated in Supabase but is not registered in the admin_users table."

### Cause:
The email and password used are valid in Supabase Auth (`auth.users`), but the account has not been granted administrative privileges in the `admin_users` table.

### Solution:
1. Log into your Supabase Console: [https://supabase.com/dashboard/project/fyhacouitykpbvylxwtz](https://supabase.com/dashboard/project/fyhacouitykpbvylxwtz)
2. Go to **Authentication &rarr; Users** and locate the email address.
3. Copy the user's **User UID** (e.g. `12345678-abcd-ef01-2345-6789abcdef01`).
4. In the left navigation, click **Table Editor &rarr; admin_users**.
5. Click **Insert row** and enter:
   - `user_id`: Paste the User UID.
   - `email`: Enter the email address.
   - `role`: Set to `super_admin` or `store_manager`.
6. Click **Save**.
7. Return to `https://onznatural.com/admin` and sign in again.

---

## Issue 2: "AI Consultant shows connection or network notice."

### Cause:
The browser was unable to communicate with the Supabase Edge Function `gemini-consultant`, or the Google Gemini API key is missing or expired in the Supabase secrets store.

### Verification Steps:
1. Open your browser developer console (F12) &rarr; **Network** tab.
2. In the AI Consultant, send a message. Look for the POST request to:
   `https://fyhacouitykpbvylxwtz.supabase.co/functions/v1/gemini-consultant`
3. If the response code is `401` or `500`:
   - Open your Supabase Dashboard &rarr; **Edge Functions** &rarr; **gemini-consultant** &rarr; **Logs**.
   - Check the error log for `GEMINI_API_KEY is not set`.
4. If missing, set your Gemini API key in Supabase:
   ```bash
   supabase secrets set GEMINI_API_KEY="your-google-ai-studio-key" --project-ref fyhacouitykpbvylxwtz
   ```
   Or set it in the Supabase Dashboard under **Project Settings &rarr; Edge Functions &rarr; Secrets**.

---

## Issue 3: "Product price or stock changes not updating on storefront."

### Cause:
A network interruption prevented the update from reaching Supabase, or Row Level Security prevented an unauthorized user from modifying the `products` table.

### Verification Steps:
1. In the `/admin` Catalogue tab, check if the "Save" button completes and shows the updated price.
2. If an alert pops up saying "Could not save product: permission denied":
   - Ensure the user account you are logged in with is a `super_admin` or `store_manager` in `admin_users`.
3. Open an Incognito window and visit `https://onznatural.com/products`.
4. If the updated price is visible in incognito, clear your normal browser cache or click the **Refresh Live Data** button in the dashboard navbar.

---

## Issue 4: "Customer unable to sign in or reset password."

### Cause:
Customer entered an incorrect password, or the Supabase Auth email confirmation is required.

### Solution:
1. In Supabase Dashboard &rarr; **Authentication &rarr; Users**, search for the customer's email.
2. Check the **Confirmed** column. If unconfirmed:
   - Click the three dots next to the user &rarr; **Send password recovery** or **Auto confirm user**.
3. If the customer forgot their password:
   - Advise them to use the **Forgot Password** link on `https://onznatural.com/signin`.
   - Alternatively, the store owner can generate a password recovery link directly from the Supabase Users table.

---

## Issue 5: "Cloudflare Worker deployment fails with wrangler error."

### Cause:
Cloudflare Workers Previews Base previously defaulted to `wrangler preview`, or recursive `_redirects` caused infinite loop error `100324`.

### Solution (Already applied in repository):
1. **Node.js version**: Cloudflare builds must run on Node 22 (`.nvmrc` and `.node-version` are set to `22`).
2. **Wrangler Preview Patch**: `scripts/patch-wrangler.js` is automatically run on `npm postinstall` to map any legacy `preview` commands to `deploy`.
3. **Redirect Loop Prevention**: `public/_redirects` must NOT contain `/*  /index.html  200` because Cloudflare Workers static assets flags that as recursive. Instead, `scripts/postbuild.js` copies `dist/index.html` to `dist/404.html` for single-page application routing.
4. **Build Command**: Cloudflare deploy command is `npm run build`.

---

## Issue 6: "WhatsApp order button does not open WhatsApp on mobile or desktop."

### Cause:
The customer's browser blocked the popup, or their device lacks WhatsApp installed.

### Verification:
1. All WhatsApp buttons use the universal web link:
   `https://wa.me/919426919098?text=...`
2. If clicking on mobile does not open the WhatsApp application:
   - The device will automatically fall back to opening WhatsApp Web in the browser.
   - Verify that the customer has popups allowed for `onznatural.com`.
3. Ensure the studio phone number is consistently formatted as international format without leading plus or dashes: `919426919098`.

---

## Issue 7: "How to clear local test data and reset sessions."

### Solution:
1. Open Chrome DevTools (F12) &rarr; **Application** tab.
2. Under **Storage**, click **Clear site data**.
3. This clears:
   - `onznatural_session_token`
   - `onznatural_consent_*`
   - `onznatural_wishlist`
4. On next page refresh, a new anonymous 256-bit cryptographic session token will be generated.
