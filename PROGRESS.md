# ONZNATURAL — Engineering Progress & Verification Log (`PROGRESS.md`)

**Branch:** `fix/admin-data-history-hardening`

---

## Phase 1 — Data History & Persistence Fixes

| # | Issue | Fix Applied | Evidence & Verification | Status |
|---|---|---|---|---|
| 1 | `AIAssistantWidget.tsx` never saved visitor/AI chat messages to Supabase | Added `conversationId` persistence in `sessionStorage` + immediate `createConversation()` and `saveMessage()` calls on send/receive with `metadata` (`source`, `model`, `error`) and visible failure alert | Verified in code diff (`src/components/AIAssistantWidget.tsx`) and `crmPersistence.test.ts` (`12/12` passing) | **Done** |
| 2 | `AIConsultant.tsx` silently swallowed customer `saveMessage` errors (`catch(() => {})`) | Awaited `saveMessage`, set `storageStatus('failed')` on error, and attached `{ source, language, model }` metadata | Verified in `src/pages/AIConsultant.tsx` and TypeScript build | **Done** |
| 3 | `Contact.tsx` faked submission with `setTimeout` and never wrote to `customer_enquiries` | Wired `handleSubmit` to `createEnquiry({ enquiry_type: 'contact_form', ... })` with visible error/retry handling | Verified in `src/pages/Contact.tsx` + `crmPersistence.test.ts` | **Done** |
| 4 | `OrderModal.tsx` silently ignored `createEnquiry` errors & lacked order confirmation reference | Generated `ONZ-XXXXXX` Order Ref, persisted via `createEnquiry({ enquiry_type: 'order_checkout', ... })`, displayed confirmation/warning banner | Verified in `src/components/OrderModal.tsx` | **Done** |
| 5 | `crmService.ts` `createEnquiry`, `createConversation`, `saveMessage` failed for `anon` under strict RLS due to `.select().single()` | Updated `crmService.ts` to use `SECURITY DEFINER` RPCs (`start_guest_conversation`, `append_guest_message`, `submit_guest_enquiry`) with retry and insert-only fallback | Verified in `supabase/migrations/20261127_fix_data_history_and_rpcs.sql` and `crmPersistence.test.ts` | **Done** |
| 6 | `admin_audit_logs` writes/reads failed silently due to wrong column names (`record_type`/`metadata`/`timestamp` vs `target_entity`/`details`/`created_at` + `admin_email`) | Fixed `log_admin_action` RPC, `logAdminAction`, `getAdminAuditLogs`, and `AdminDashboard.tsx` audit table + added `old_value -> new_value` product edit diffs | Verified in `crmPersistence.test.ts` (`logAdminAction` & `getAdminAuditLogs`) | **Done** |
| 7 | `AdminDashboard.tsx` lacked live updates, message timestamps, chronological sorting, status filter, and pagination | Added Supabase Realtime (`postgres_changes`) + 25s polling, `created_at ASC` message sorting, per-message timestamps/metadata badges, chat status filter, and pagination on AI Chats & Audit Trail | Verified in `src/pages/AdminDashboard.tsx` + `npm run build` | **Done** |

---

## Phase 2 & 3 — Testing & Verification Evidence

- **Automated Unit & Persistence Tests (`npm test`)**:
  - `src/__tests__/security.test.ts`: 5/5 passed (XSS sanitization, email/phone/password rules, honeypot, log masking)
  - `src/__tests__/catalogue.test.ts`: 2/2 passed (17 products, pricing/weight/ingredients/image checks)
  - `src/__tests__/crmPersistence.test.ts`: 5/5 passed (conversation creation, message metadata + error throwing, chronological sort, guest enquiry RPC, admin audit logs)
- **TypeScript & Production Build (`npx tsc --noEmit && npm run build`)**: Passed with 0 errors.
