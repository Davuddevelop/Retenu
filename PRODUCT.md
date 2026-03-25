# Obsidian - Product Documentation (Honest Version)

## What This Is

Obsidian is a tool I'm building to help agencies find money they're losing to billing mistakes. It's currently a working demo/MVP, not a production SaaS yet.

**Current Status:** Demo with local data storage. Core detection logic works. Some integrations started but not complete.

---

## The Problem (This Part Is Real)

Service businesses lose money in ways they don't notice:

### 1. Unbilled Hours
Team logs 40 hours for Client X. Invoice goes out for 35 hours. Nobody notices the gap.

**Why it happens:**
- Time gets logged but forgotten when invoicing
- "Quick calls" and emails never tracked
- Confusion about what's billable

### 2. Scope Creep
Contract says 10 hours/month. Client actually uses 14 hours. Agency eats the difference to "keep the relationship."

**Why it happens:**
- No automated tracking against limits
- Awkward to push back on clients
- "It's just a few extra hours"

### 3. Late Payments
Invoices sit at 45, 60, 90 days overdue. Nobody follows up systematically.

**Why it happens:**
- No automated reminders
- Embarrassment about chasing money
- Invoices get lost in email

### 4. Missing Invoices
Project finishes. Team moves to next thing. Final invoice never sent.

**Why it happens:**
- No system to check "did we bill for this?"
- Handoff problems between project and finance

### How Much Money? I Don't Know Yet.

I've read that agencies lose 4-10% of revenue to these issues. But I can't prove that number. I don't have customer data yet to validate it.

What I can say: If you've ever forgotten to bill for something, or had a client go months without paying, you know the problem is real.

---

## Who This Is For

**Ideal user:**
- Digital/creative agency or consultancy
- Bills clients by the hour or on retainer
- Has 5-50 active clients
- Uses some kind of time tracking (even spreadsheets)
- Doesn't have a full-time finance person

**Not for:**
- Product companies (no hourly billing)
- Agencies that only do fixed-price projects
- Large enterprises with finance teams

---

## What Obsidian Actually Does (Today)

### Working Features

**1. Dashboard**
- Shows total "revenue at risk" (sum of detected issues)
- Breaks down by issue type
- Lists active alerts

**2. Client Management**
- Add clients with retainer amounts, hourly rates, hour limits
- Track client status (active/inactive)
- Set per-client financial settings

**3. Time Entry Tracking**
- Manual entry
- CSV upload (works)
- Toggl import (partially built - API connection exists)

**4. Invoice Tracking**
- Create and track invoices
- Mark as draft/sent/paid/overdue
- See which clients have outstanding balances

**5. Detection Engine**
This is NOT AI. It's conditional logic that compares numbers:

```
Unbilled Hours Alert:
IF (hours logged for client) > (hours invoiced for client) by more than X%
THEN create alert with $ amount = gap × hourly rate

Scope Creep Alert:
IF (hours worked this month) > (client's hour limit) by more than X%
THEN create alert

Late Payment Alert:
IF (invoice due date) was more than X days ago AND status != paid
THEN create alert

Missing Invoice Alert:
IF (client has billable hours this month) AND (no invoice exists for this month)
THEN create alert
```

That's it. It's math, not machine learning. But it still finds real problems.

**6. Stripe Integration**
- OAuth connection flow exists
- Can sync payment status from Stripe
- Webhook handling for payment events

### What's NOT Built Yet

- QuickBooks integration (not started)
- Xero integration (not started)
- FreshBooks integration (not started)
- Harvest integration (not started)
- Clockify integration (not started)
- Slack notifications (not started)
- Email alerts (not started)
- SMS alerts (not started)
- One-click invoice generation from alerts (not started)
- Team member management (basic only)
- Reports/exports (not started)
- Mobile app (not started)

---

## How It Works (Technical)

### Data Flow

```
User enters data (or imports CSV/Toggl)
         ↓
Data stored in browser (demo mode) or Supabase (production)
         ↓
Detection engine runs (on page load or manual refresh)
         ↓
Compares: time entries vs invoices vs client settings
         ↓
Creates alerts for detected issues
         ↓
Dashboard displays alerts and totals
```

### Tech Stack (Real)

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Next.js API routes, Supabase
- **Database:** PostgreSQL (via Supabase) or localStorage (demo)
- **Payments:** Stripe (for connected accounts)
- **Hosting:** Not deployed yet (runs locally)

### Data Storage

**Demo Mode:**
- All data in browser localStorage
- Pre-populated with fake sample data
- Good for trying the product

**Production Mode:**
- Supabase PostgreSQL database
- Row-level security for multi-tenant
- Requires Supabase account setup

---

## What Users Need to Provide

### Minimum to Use

1. **Clients** - Name, monthly retainer (if any), hourly rate
2. **Time entries** - Client, hours, date, billable flag
3. **Invoices** - Client, amount, dates, status

### How to Get Data In

| Method | Status | Notes |
|--------|--------|-------|
| Manual entry | Works | Tedious but functional |
| CSV upload | Works | For time entries |
| Toggl API | Partial | Connection exists, sync is buggy |
| Other integrations | Not built | On roadmap |

---

## Security & Compliance

### What I Can Honestly Say

- Passwords hashed with bcrypt (via Supabase Auth)
- HTTPS in production
- Data stored in Supabase (their security, not mine)
- No SOC 2 certification
- No ISO 27001
- No security audit completed
- I'm a solo developer, not an enterprise vendor

### What This Means

If you're an agency handling client financial data, you should know:
- This is early-stage software
- I haven't had a professional security review
- For now, use demo mode with fake data to evaluate
- Production use is at your own risk until I mature the product

---

## Pricing

**Current:** Free (it's a demo)

**Future plans (not implemented):**
- Probably freemium model
- Free tier for small usage
- Paid tier for more clients/integrations
- Haven't figured out exact pricing yet

---

## What I'm Trying to Validate

Before building more, I want to know:

1. **Is the core problem real?** Do agencies actually lose significant money this way?
2. **Does the detection logic catch real issues?** When pointed at real data, does it find things?
3. **Would agencies pay for this?** And how much?
4. **What integrations matter most?** Toggl? QuickBooks? Something else?

If you're an agency owner testing this, I'd love your feedback:
- Did it find real Obsidians in your data?
- What features are missing that you'd need?
- Would you pay for this? How much?

---

## Roadmap (Honest)

### Near Term (Next 1-2 Months)
- [ ] Fix Toggl integration bugs
- [ ] Add Clockify integration (seems popular)
- [ ] Email notifications for alerts
- [ ] Basic reporting/export

### Medium Term (3-6 Months)
- [ ] QuickBooks integration
- [ ] Stripe payment sync improvements
- [ ] One-click recovery actions
- [ ] Team member tracking

### Long Term (Maybe)
- [ ] Mobile app
- [ ] More accounting integrations
- [ ] Actual AI/ML for pattern detection
- [ ] Enterprise features

### Might Never Build
- Things that don't get requested
- Features that add complexity without value

---

## Glossary (No BS)

| Term | What It Actually Means |
|------|------------------------|
| Obsidianage | Money you should have collected but didn't |
| Detection Engine | If/then logic comparing your numbers |
| Alert | "Hey, this looks wrong" notification |
| Scope Creep | Client getting more than they paid for |
| Recovery | Actually collecting the money you're owed |

---

## Contact

This is built by a solo developer.

- **GitHub:** [project repo]
- **Email:** [your email]

I read every message. Feedback helps me build something actually useful.

---

*Last Updated: March 2024*
*Status: Demo/MVP - Not Production Ready*
