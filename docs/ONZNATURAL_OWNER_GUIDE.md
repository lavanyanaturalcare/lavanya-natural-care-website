# ONZNATURAL — Store Owner Operating Manual

**Brand**: ONZNATURAL  
**Studio Location**: Vadodara, Gujarat, India  
**Production Website**: [https://onznatural.com](https://onznatural.com)  
**Administrator Portal**: [https://onznatural.com/admin](https://onznatural.com/admin)  
**Database**: Supabase PostgreSQL (`fyhacouitykpbvylxwtz.supabase.co`)  
**AI Engine**: Google Gemini 2.5 Flash via Supabase Edge Function  

---

## 1. Executive Overview

Welcome to the operating manual for **ONZNATURAL** (formerly Lavanya Natural Care). 

ONZNATURAL is a premium, artisanal skincare brand specializing in small-batch cold-process soaps, botanical face washes, nourishing body washes, and herbal body lotions handcrafted in Vadodara, Gujarat.

Your website is built on a modern, high-performance architecture:
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Hosting**: Cloudflare Workers / Pages with global edge distribution
- **Database & Authentication**: Supabase PostgreSQL with cryptographic token hashing and Row Level Security (RLS)
- **AI Skincare Advisor**: Google Gemini 2.5 Flash deployed as an isolated serverless Supabase Edge Function (`gemini-consultant`) strictly grounded in your 16 verified botanicals
- **Commerce**: Hybrid direct WhatsApp ordering, UPI checkout, and automated customer enquiry logging

---

## 2. Accessing Your Administrator Dashboard

The administrative dashboard is located at:
```
https://onznatural.com/admin
```

### Security & Authentication Protocol
Your dashboard is protected by enterprise-grade security:
1. **Real Supabase Auth Session**: You must authenticate with a registered email and password in Supabase.
2. **Server-Side Authorization**: Your user account must be registered in the `admin_users` table with the role `super_admin` or `store_manager`.
3. **No Insecure Fallbacks**: There are no hardcoded passwords, no email-string checks, and no bypass flags in browser storage.
4. **Session Expiry**: When you log out or your token expires, access is immediately revoked.

### How to Sign In:
1. Navigate to `https://onznatural.com/admin`.
2. Enter your administrator email (e.g., `owner@onznatural.com`).
3. Enter your password.
4. Click **Sign In to Operations Portal**.
5. Once verified, you will be taken to your dashboard overview.

---

## 3. Daily Operations Workflow

### Morning Routine:
1. **Check Orders & Leads (`/admin` &rarr; Enquiries)**:
   - Filter by **New / Pending**.
   - Review incoming WhatsApp order intents and customer messages.
   - Click the green **WhatsApp** icon next to any enquiry to open a conversation directly with the customer.
   - Update the status dropdown to **Contacted** once you reach out.
2. **Check Pending Follow-Ups**:
   - The Overview screen displays **Pending Follow-Ups** that require packaging or shipping action.
   - Once payment is confirmed and the parcel is dispatched from your Vadodara studio, change the enquiry status to **Resolved**.
3. **Review Stock & Pricing (`/admin` &rarr; Catalogue)**:
   - If any soap batch is curing or out of stock, change its status to **Low Stock** or **Out of Stock** in the Catalogue tab. It will immediately reflect on the website and inform the AI.

---

## 4. Managing Customers & Leads

Your customer directory (`/admin` &rarr; Customers) categorizes visitors into:
- **Registered Customers**: Users who created an account on `onznatural.com`. They have an active login, can save wishlists, view order status, and update privacy preferences.
- **Guest / Lead Profiles**: Visitors who initiated a WhatsApp enquiry or used the AI Consultant with consent. Their contact details and language preferences are stored for shipping and customer care.

### Exporting Customer Records:
Click **Export Customers CSV** at the top right of the Customers tab to download an Excel-compatible spreadsheet of all customer names, phone numbers, emails, and languages.

---

## 5. Central Product Catalogue (Single Source of Truth)

All 16 verified ONZNATURAL products are centrally synchronized between your Supabase `products` table and the storefront.

### How to Change a Price or Stock Status:
1. Go to the **Catalogue** tab.
2. Locate the product (e.g., `kesuda-palash-soap` or `neem-tulsi-soap`).
3. Click **Edit**.
4. Adjust the **Price (INR)** or choose the **Availability Status**:
   - `In Stock`: Product is available for immediate purchase.
   - `Low Stock`: Displays an "Only Few Left" badge on the storefront.
   - `Out of Stock`: Disables the order button and shows "Temporarily Out of Stock".
   - `Discontinued`: Hides product from purchase recommendations.
5. Click **Save**.
6. The change updates immediately in the database, the Homepage, the Collection page, the Product Detail page, and the AI Consultant's knowledge base.

---

## 6. AI Botanical Consultant & Chat Logs

The ONZNATURAL AI Consultant is located at `https://onznatural.com/ai-consultant`.

### Grounded Knowledge:
The AI is strictly grounded on your 16 verified products:
1. Kesuda (Palash Flower) Cold Process Soap (₹99)
2. Neem Tulsi Botanical Purifying Soap (₹99)
3. Royal Haldi Ubtan Complexion Soap (₹99)
4. Charcoal Detox Deep Cleansing Soap (₹99)
5. Goat Milk & Wild Honey Nourishing Soap (₹99)
6. Multani Mitti Cooling Clay Soap (₹99)
7. Chandan Sandalwood Calming Soap (₹99)
8. Aloe Vera & Cucumber Hydrating Soap (₹99)
9. Rose Petal & Rose Water Soap (₹99)
10. Coffee & Kokum Butter Scrub Soap (₹99)
11. Lemongrass & Tea Tree Clarifying Soap (₹99)
12. Lavender & French Clay Relaxing Soap (₹99)
13. Neem & Tea Tree Botanical Face Wash (₹149)
14. Haldi Ubtan Radiance Face Wash (₹149)
15. Kesuda & Aloe Vera Cooling Body Wash (₹199)
16. Kokum Butter & Almond Deep Body Lotion (₹249)

### Reading Consultations (`/admin` &rarr; AI Chats):
- You can read full transcripts of consultations to understand what skincare concerns customers are facing (e.g., acne, heat rash, pigmentation).
- Check the recommended product badges to see what products were suggested by the AI.
- Transcripts are only stored if the customer consented to chat storage, respecting DPDP privacy guidelines.

---

## 7. Privacy, DPDP Act & Data Deletion

India's Digital Personal Data Protection (DPDP) Act grants individuals the right to have their personal data erased upon request.

### Handling Data Deletion Requests:
1. When a user requests data deletion through the website's privacy modal, a record is added to **Erasure Requests** (`/admin` &rarr; Privacy).
2. Review the requested email or phone number.
3. Click **Process Erasure**.
4. The system will permanently purge their customer record, conversation transcripts, and consent logs, leaving an auditable record in the Security Audit Trail.

---

## 8. Summary of Quick Links
- **Storefront**: [https://onznatural.com](https://onznatural.com)
- **Admin Portal**: [https://onznatural.com/admin](https://onznatural.com/admin)
- **AI Consultant**: [https://onznatural.com/ai-consultant](https://onznatural.com/ai-consultant)
- **Products Collection**: [https://onznatural.com/products](https://onznatural.com/products)
- **Supabase Dashboard**: [https://supabase.com/dashboard/project/fyhacouitykpbvylxwtz](https://supabase.com/dashboard/project/fyhacouitykpbvylxwtz)
- **WhatsApp Support Number**: `+91 94269 19098`
