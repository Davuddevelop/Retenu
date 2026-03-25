# Obsidian Roadmap

> Analysis and roadmap for transforming Obsidian into a production-ready SaaS

---

## Executive Summary

Obsidian is a Obsidian detection tool for agencies that tracks clients, time entries, and invoices to identify underbilling, scope creep, missing invoices, and margin issues. The core detection engine and UI foundation are solid, but significant work remains for production readiness.

---

## Phase 1: Critical Bugs & Blockers (Week 1-2)

### P0 - Login Page Non-Functional
**File:** `src/app/(auth)/login/page.tsx`

The login page is a static mock that doesn't actually authenticate:
- Form inputs are uncontrolled (no state binding)
- "Sign In" button is just a Link to `/app` (bypasses auth)
- No connection to Supabase auth
- No error handling or loading states

**Fix:** Wire up the AuthProvider and make form functional with proper validation.

---

### P0 - Schema Mismatch Between Seed & Schema
**Files:** `supabase/schema.sql`, `supabase/seed.sql`

The seed.sql references tables/columns that don't exist in schema.sql:
- `users` table referenced in seed but not in schema
- `revenue_alerts` table in seed vs `alerts` table in schema
- `contracts` table missing `organization_id` NOT NULL in some INSERT statements

**Fix:** Align seed.sql with schema.sql or update schema to match.

---

### P0 - Client Detail Page Uses Local DataStore Only
**File:** `src/app/app/clients/[id]/page.tsx`

The client detail page directly imports `dataStore` and `getClientStats` from detectionEngine - it doesn't use the DataProvider context. This means:
- Supabase mode is ignored
- Realtime updates don't work
- Data is stale

**Fix:** Migrate to use `useData()` hook like the dashboard.

---

### P0 - Alerts Page Uses Local DataStore Only
**File:** `src/app/app/alerts/page.tsx`

Same issue as client detail - directly uses `dataStore` and `runDetectionEngine()` instead of DataProvider.

**Fix:** Migrate to use `useData()` hook.

---

### P1 - Type Safety Issues in actions.ts
**File:** `src/lib/actions.ts`

Multiple lines have `// @ts-ignore` comments inline with code (syntax error from bad merge):
```typescript
const { data } = await supabase// @ts-ignoreorganizations')
```

**Fix:** Properly format the `.from('tablename')` calls.

---

### P1 - Missing Organization Creation Flow
There's no UI to create an organization after signup. Users authenticate but have no org, so all queries fail silently.

**Fix:** Add onboarding flow that creates organization + financial_settings after first login.

---

### P1 - Sidebar Mobile Navigation Missing
**File:** `src/app/components/Sidebar.tsx`

The sidebar has `hidden md:flex` - completely hidden on mobile with no hamburger menu or mobile nav.

**Fix:** Add mobile navigation drawer/sheet.

---

## Phase 2: Feature Gaps (Week 2-4)

### Time Entry Sync Not Working
**Files:** `src/app/api/integrations/toggl/route.ts`, `src/app/api/integrations/clockify/route.ts`

The sync endpoints exist but:
- No automatic/scheduled sync (requires manual trigger)
- No deduplication of existing entries
- No handling of deleted entries in source system
- Project-to-client mapping is stored but never used during sync

**Fix:**
1. Store mapping persistently in integrations.config
2. Apply mapping during sync
3. Add upsert logic based on external_id
4. Consider cron job for background sync

---

### Invoice Sync Missing
Stripe webhook receives invoice events, but:
- No initial sync of historical invoices
- No mapping of Stripe customers to Obsidian clients
- Webhook doesn't check if invoice already exists

**Fix:** Add Stripe invoice list sync endpoint and customer-to-client mapping.

---

### Alert Resolution Flow
Alerts are calculated on-the-fly by detectionEngine but:
- No "Resolve" or "Ignore" buttons in UI
- No persistence of resolved/ignored status in local mode
- Server actions exist but aren't connected to UI

**Fix:** Add alert action buttons and wire to server actions (Supabase) or dataStore (local).

---

### CSV Import Half-Built
**File:** `src/app/app/time-entries/upload/page.tsx`

The file exists but I didn't read it. Likely needs:
- Column mapping UI
- Validation feedback
- Error handling for malformed data

**Status:** Needs review and completion.

---

### Settings Page Incomplete
**File:** `src/app/app/settings/page.tsx`

Financial settings UI exists but:
- Only shows "link to integrations"
- No actual settings form to edit thresholds, rates, currency
- No connection to `updateFinancialSettings` server action

**Fix:** Build out settings form with all FinancialSettings fields.

---

### No Invoice Edit/Delete
Invoice list exists, but:
- No edit page like clients have
- No delete confirmation
- No mark-as-paid quick action in list view

**Fix:** Add invoice CRUD operations in UI.

---

### No Time Entry Edit
Time entries can be added but not edited. Need:
- Edit modal or page
- Inline editing in table
- Bulk delete with confirmation

---

## Phase 3: Security & Production Hardening (Week 4-5)

### API Route Authorization
Several API routes use service role key without verifying the requesting user:
- `src/app/api/integrations/route.ts` - Anyone with org_id can fetch integrations
- Toggl/Clockify sync endpoints same issue

**Fix:** Add middleware to verify session and ownership.

---

### Environment Variable Validation
No validation that required env vars are set. App will crash cryptically if:
- NEXT_PUBLIC_SUPABASE_URL is missing
- STRIPE_SECRET_KEY is missing during Stripe operations

**Fix:** Add startup validation with clear error messages.

---

### Rate Limiting
No rate limiting on:
- Auth endpoints
- API routes
- Webhook endpoints

**Fix:** Add rate limiting middleware (Upstash ratelimit or similar).

---

### Webhook Signature Verification
Stripe webhook verifies signature, but:
- Error handling exposes internals
- No replay protection (timestamp check)

**Review:** Ensure production hardening of webhook handler.

---

### Sensitive Data in Logs
Console.error statements may log sensitive data:
```typescript
console.error('Error fetching integrations:', error);
```

**Fix:** Sanitize error logging in production.

---

## Phase 4: UX Polish (Week 5-6)

### Loading States Inconsistent
Some pages have loading spinners, others don't. Need:
- Consistent loading skeleton components
- Suspense boundaries for streaming

---

### Error Boundaries Missing
No error boundaries - entire app crashes on component error.

**Fix:** Add error.tsx files for graceful degradation.

---

### Empty States Need Work
EmptyStates.tsx exists but:
- Not all pages use appropriate empty states
- Demo mode banner could be more contextual

---

### Form Validation
Client forms have basic required validation but:
- No inline validation feedback
- No server error display
- Currency inputs should use proper formatting

**Fix:** Add react-hook-form or similar with zod validation.

---

### Accessibility (a11y)
- Forms missing proper labels in some places
- No focus management after navigation
- Charts may not be screen-reader friendly
- Color contrast not audited

**Fix:** Run axe audit and address issues.

---

### Responsive Polish
- Dashboard cards could stack better on mobile
- Tables need horizontal scroll or card view on mobile
- Chart tooltips may be cut off on small screens

---

## Phase 5: Advanced Features (Month 2+)

### Team Members & Permissions
Currently single-user per org. Need:
- `team_members` table with roles
- Invite flow
- Permission checks in UI and API

---

### Multi-Currency Support
`currency` field exists in settings but:
- All calculations assume USD
- No exchange rate handling
- Formatters hardcoded to USD

---

### Historical Trends & Analytics
- Month-over-month comparison
- Leakage trends over time
- Client profitability trends
- Export to CSV/PDF

---

### Email Notifications
- Alert digests
- Payment reminders
- Weekly summary reports

**Suggested:** Use Resend or SendGrid with Supabase Edge Functions.

---

### Zapier/Make Integration
For users who want custom automation beyond Toggl/Clockify/Stripe.

---

### Mobile App / PWA
Make the app installable with:
- manifest.json
- Service worker
- Offline support for viewing data

---

## Technical Debt

### Duplicate Type Definitions
- `src/app/lib/types.ts` and `src/lib/database.types.ts` have overlapping definitions
- Should generate types from Supabase schema

**Fix:** Use `supabase gen types typescript` and derive app types from DB types.

---

### DataStore Singleton Pattern
The localStorage-based dataStore works but:
- No reactive updates when data changes
- Singleton pattern doesn't work well with React
- Should be replaced with zustand or jotai for local-first mode

---

### Demo Data Hardcoded
Demo clients have hardcoded 2026 dates. Should be relative to current date.

---

### Test Coverage
No tests exist. Need:
- Unit tests for calculations.ts
- Integration tests for API routes
- E2E tests for critical flows (login, add client, view alerts)

---

## Priority Matrix

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Fix login page | 2h | Blocking |
| P0 | Fix schema/seed mismatch | 1h | Blocking |
| P0 | Migrate pages to DataProvider | 4h | Blocking |
| P1 | Add onboarding flow | 4h | High |
| P1 | Mobile navigation | 2h | High |
| P1 | Fix actions.ts syntax | 1h | High |
| P2 | Complete time entry sync | 8h | Medium |
| P2 | Invoice sync & mapping | 8h | Medium |
| P2 | Settings page form | 4h | Medium |
| P2 | Alert resolution UI | 4h | Medium |
| P3 | API authorization | 4h | Medium |
| P3 | Error boundaries | 2h | Medium |
| P3 | Form validation | 6h | Medium |
| P3 | Invoice CRUD | 4h | Low |
| P4 | Test coverage | 16h | Low |
| P4 | Team members | 16h | Low |
| P4 | Email notifications | 8h | Low |

---

## Recommended Immediate Actions

1. **Fix login page** - Users can't actually log in
2. **Fix schema mismatch** - Database setup will fail
3. **Migrate remaining pages to DataProvider** - Supabase mode is broken
4. **Add onboarding flow** - First-run experience is broken
5. **Add mobile nav** - App unusable on phones

---

## Architecture Recommendations

### Short Term
- Keep the dual local/Supabase mode - it's great for demos
- Use react-query or SWR for data fetching instead of raw useEffect
- Add proper form library (react-hook-form + zod)

### Medium Term
- Consider tRPC for type-safe API routes
- Move to app router middleware for auth checks
- Use Supabase Realtime more extensively

### Long Term
- Consider multi-tenant architecture if scaling beyond single-org
- Evaluate local-first sync solutions (PowerSync, ElectricSQL) for offline support
- Consider separate API service if complexity grows

---

*Last updated: 2026-03-07*
