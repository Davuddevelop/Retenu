# How to Make RevenueLeak Actually Work

## Current State Assessment

### What's ACTUALLY Built and Working

| Component | Status | Notes |
|-----------|--------|-------|
| UI/Frontend | ✅ Working | Dashboard, clients, invoices, time entries, settings |
| Demo Mode | ✅ Working | localStorage with fake data, good for testing |
| Detection Engine | ✅ Working | Real logic in `calculations.ts` and `detectionEngine.ts` |
| Database Schema | ✅ Ready | `supabase/schema.sql` - just needs to be deployed |
| Auth UI | ✅ Working | Login/signup pages exist |
| Stripe OAuth Flow | ⚠️ Partial | Connect flow exists, webhook handling partial |
| Toggl Integration | ⚠️ Partial | API calls exist, sync logic incomplete |

### What's NOT Working Yet

| Component | Status | What's Missing |
|-----------|--------|----------------|
| Supabase Connection | ❌ Not deployed | Need to run schema.sql in Supabase |
| Real User Data | ❌ | Only demo mode works, DataProvider needs testing |
| User Signup Flow | ❌ | Organization creation on signup not wired |
| Toggl Sync | ❌ | Fetches projects but doesn't import time entries |
| Stripe Payment Sync | ❌ | Webhook exists but doesn't update invoices |
| Email Notifications | ❌ | Not built |
| CSV Import | ⚠️ Partial | Parser exists, may have bugs |

---

## Step-by-Step: Make It Work

### Phase 1: Get Supabase Running (30 minutes)

#### Step 1.1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (free tier is fine)
3. Wait for it to initialize (~2 min)

#### Step 1.2: Run the Schema
1. In Supabase, go to SQL Editor
2. Copy entire contents of `supabase/schema.sql`
3. Paste and click "Run"
4. Should see "Success" for all statements

#### Step 1.3: Get Your Keys
1. Go to Settings → API
2. Copy these values:
   - `Project URL` → This is your SUPABASE_URL
   - `anon public` key → This is your SUPABASE_ANON_KEY
   - `service_role` key → This is your SUPABASE_SERVICE_KEY (keep secret!)

#### Step 1.4: Configure Environment
Create `.env.local` in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

# Stripe (optional for now)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_CLIENT_ID=ca_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Step 1.5: Test Connection
```bash
npm run dev
```
Go to `/login`, try to sign up. If it creates a user in Supabase Auth, connection works.

---

### Phase 2: Fix User Signup Flow (1 hour)

The problem: When a user signs up, we need to:
1. Create user in Supabase Auth ✅ (this works)
2. Create an Organization for them ❌ (not happening)
3. Create default FinancialSettings ❌ (trigger exists but org needs to exist first)

#### What to Fix

File: `src/app/auth/callback/route.ts` or create a signup handler

```typescript
// After successful auth, create organization
const { data: user } = await supabase.auth.getUser();

if (user && user.user) {
  // Check if org exists
  const { data: existingOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', user.user.id)
    .single();

  if (!existingOrg) {
    // Create organization
    const { data: newOrg } = await supabase
      .from('organizations')
      .insert({
        name: user.user.email?.split('@')[0] + "'s Agency",
        owner_id: user.user.id,
      })
      .select()
      .single();

    // Settings created automatically by trigger
  }
}
```

---

### Phase 3: Connect DataProvider to Supabase (2 hours)

The `DataProvider.tsx` already has Supabase fetch functions, but they need testing and debugging.

#### Test Each Function

1. **fetchClients** - Does it return data after you add a client via Supabase UI?
2. **fetchInvoices** - Same test
3. **fetchTimeEntries** - Same test
4. **saveClient** - Does it actually insert into Supabase?

#### Common Issues to Fix

1. **Organization ID mismatch** - Make sure queries filter by correct org_id
2. **RLS blocking queries** - Check that user is authenticated
3. **Type mismatches** - Supabase returns slightly different shapes

---

### Phase 4: Make Data Entry Work (2 hours)

Currently data entry goes to localStorage. Need to make it save to Supabase.

#### Files to Update

| File | Current | Needed |
|------|---------|--------|
| `src/app/app/clients/new/page.tsx` | Calls `dataStore.addClient()` | Call Supabase insert |
| `src/app/app/invoices/new/page.tsx` | Calls `dataStore.addInvoice()` | Call Supabase insert |
| `src/app/app/time-entries/new/page.tsx` | Calls `dataStore.addTimeEntry()` | Call Supabase insert |

#### Pattern to Use

```typescript
// Instead of:
dataStore.addClient(clientData);

// Do:
const supabase = createBrowserClient(...);
const { data, error } = await supabase
  .from('clients')
  .insert({
    ...clientData,
    organization_id: currentOrgId, // Get from context
  })
  .select()
  .single();

if (error) {
  // Handle error
} else {
  // Success, redirect or update UI
}
```

---

### Phase 5: Test the Detection Engine (1 hour)

The detection engine (`detectionEngine.ts`) is actually the most complete part. It:
- Calculates unbilled hours
- Detects scope creep
- Finds overdue invoices
- Generates alerts with real $ amounts

#### How to Test

1. Add a client with `hour_limit: 10`
2. Add 15 hours of time entries for that client
3. Run detection: `runDetectionEngine()` should return a scope creep alert
4. Check the dashboard - should show the alert

#### If Alerts Don't Show

Check:
- Is the client status 'active'?
- Are time entries in the current month?
- Is `settings.scope_creep_threshold_percent` set correctly?

---

## What Each Feature Actually Needs

### Feature: Toggl Import

**Current State:** API connection exists, project list works

**What's Missing:**
1. Fetch time entries from Toggl API
2. Map Toggl projects to RevenueLeak clients
3. Insert time entries into database
4. Avoid duplicates (check external_id)

**File to modify:** `src/app/api/integrations/toggl/route.ts`

**Toggl API to call:**
```
GET https://api.track.toggl.com/api/v9/me/time_entries
```

---

### Feature: Stripe Payment Tracking

**Current State:** Webhook endpoint exists, receives events

**What's Missing:**
1. When `invoice.paid` event comes in, find matching RevenueLeak invoice
2. Update invoice status to 'paid'
3. Set paid_date

**File to modify:** `src/app/api/stripe/webhook/route.ts`

---

### Feature: CSV Import

**Current State:** Parser exists in upload page

**What's Missing:**
1. Better error handling
2. Client matching (map CSV client names to existing clients)
3. Duplicate detection

**File:** `src/app/app/time-entries/upload/page.tsx`

---

## Minimum Viable Product Checklist

To have something that actually works end-to-end:

```
[ ] Supabase deployed with schema
[ ] User can sign up and get an organization created
[ ] User can add clients (saved to Supabase)
[ ] User can add time entries (saved to Supabase)
[ ] User can add invoices (saved to Supabase)
[ ] Detection engine runs on real data
[ ] Alerts show on dashboard
[ ] User can mark alerts as resolved
```

That's your MVP. Everything else (Toggl, Stripe, emails) is enhancement.

---

## Quick Debugging Commands

```bash
# Check if Supabase is connected
npm run dev
# Then in browser console:
const { createBrowserClient } = await import('@supabase/ssr');
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const { data, error } = await supabase.from('clients').select('*');
console.log(data, error);

# Check detection engine
import { runDetectionEngine } from '@/app/lib/detectionEngine';
const alerts = runDetectionEngine();
console.log(alerts);
```

---

## Priority Order

1. **Supabase setup** (required for anything)
2. **Signup flow fix** (can't use app without org)
3. **Data entry → Supabase** (need real data)
4. **Test detection** (core value prop)
5. **CSV import** (easiest way to get lots of data)
6. **Toggl integration** (nice to have)
7. **Stripe integration** (nice to have)
8. **Email alerts** (later)

---

## Time Estimate

| Task | Time |
|------|------|
| Supabase setup | 30 min |
| Fix signup flow | 1 hour |
| Data entry to Supabase | 2 hours |
| Test & debug detection | 2 hours |
| Fix CSV import | 1 hour |
| **Total to MVP** | **~7 hours** |

After that, Toggl/Stripe are ~2-3 hours each.

---

## Files You'll Touch Most

```
src/app/auth/callback/route.ts      # Fix signup flow
src/app/providers/DataProvider.tsx  # Debug Supabase fetches
src/app/app/clients/new/page.tsx    # Save to Supabase
src/app/app/invoices/new/page.tsx   # Save to Supabase
src/app/app/time-entries/new/page.tsx # Save to Supabase
src/app/lib/detectionEngine.ts      # Already works, just test
```

---

*This is the honest path to a working product. No shortcuts, no fake it till you make it. Just wire up what's already built.*
