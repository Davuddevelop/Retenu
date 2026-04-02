<div align="center">

# Retenu

**Find the money your agency is losing to unbilled work.**

<br />

[![Try the Demo](https://img.shields.io/badge/Try_the_Demo-FF5733?style=for-the-badge&logoColor=white)](https://retenu.vercel.app/api/demo)

<br />

Built with Next.js 16 &bull; TypeScript &bull; Supabase &bull; Stripe

---

</div>

## What is Retenu?

Retenu automatically detects revenue leaks in your agency by connecting your time tracking, contracts, and invoices.

**It finds money you're leaving on the table:**
- Hours tracked but never billed
- Scope creep on retainer accounts
- Invoices that should exist but don't
- Clients who haven't paid

<div align="center">
  <br />
  <img src="public/dashboard obsidian 2.png" alt="Retenu Dashboard" width="85%">
  <br />
  <br />
</div>

## Pricing

| Plan | Price | What You Get |
|------|-------|--------------|
| **Free** | $0/mo | 1 client, basic alerts |
| **Starter** | $29/mo | 10 clients, all integrations, email alerts |
| **Growth** | $79/mo | Unlimited clients, team access, API |
| **Agency** | $199/mo | White-label, priority support, custom rules |

All plans include a 14-day free trial. No credit card required.

## How It Works

```
Time Tracking (Toggl, Clockify, CSV)
         +
Contract Terms (retainers, hourly rates)
         +
Invoice Data (Stripe, manual)
         ↓
    RETENU analyzes gaps
         ↓
    Alerts: "Client X has 12 unbilled hours ($1,800)"
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  CLIENT                                      │
│                           (Next.js App Router)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │  Dashboard   │    │   Clients    │    │    Alerts    │                  │
│   │    Page      │    │    Page      │    │    Page      │                  │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│          │                   │                   │                           │
│          └───────────────────┼───────────────────┘                           │
│                              ▼                                               │
│                    ┌──────────────────┐                                      │
│                    │   DataProvider   │  ← React Context for state           │
│                    │   (Context API)  │                                      │
│                    └────────┬─────────┘                                      │
│                             │                                                │
├─────────────────────────────┼────────────────────────────────────────────────┤
│                             ▼                                                │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                      DETECTION ENGINE                                │   │
│   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│   │  │ Underbilling│ │ Scope Creep │ │Late Payment │ │ Low Margin  │   │   │
│   │  │   Rules     │ │   Rules     │ │   Rules     │ │   Rules     │   │   │
│   │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                              API LAYER                                       │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│   │ /api/cron  │  │/api/toggl  │  │/api/stripe │  │ /api/demo  │            │
│   │  detect    │  │   sync     │  │  webhook   │  │   entry    │            │
│   └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────────────┘            │
│         │               │               │                                    │
└─────────┼───────────────┼───────────────┼────────────────────────────────────┘
          │               │               │
          ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │   Supabase   │    │    Toggl     │    │    Stripe    │                  │
│   │  (Database)  │    │  (Time API)  │    │  (Payments)  │                  │
│   │              │    │              │    │              │                  │
│   │ • clients    │    │ • entries    │    │ • invoices   │                  │
│   │ • contracts  │    │ • projects   │    │ • payments   │                  │
│   │ • alerts     │    │              │    │ • customers  │                  │
│   │ • time_entries│   │              │    │              │                  │
│   └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
git clone https://github.com/Davuddevelop/Retenu.git
cd Retenu
npm install
cp .env.example .env.local
npm run dev
```

Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Features

- **Detection Engine** - 6 alert types: unbilled hours, scope creep, missing invoices, late payments, low margin, negative margin
- **Integrations** - Toggl, Clockify, Stripe, CSV import
- **Dashboard** - Real-time metrics, filterable alerts, client overview
- **Actions** - Resolve or ignore alerts with one click

## Tech Stack

Next.js 16 (App Router) / TypeScript / Tailwind CSS / Supabase / Stripe / Vercel

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY` (optional)
   - `STRIPE_WEBHOOK_SECRET` (optional)
4. Deploy

### Self-Hosted

```bash
npm run build
npm start
```

Requires Node.js 18+ and a PostgreSQL database (Supabase or self-hosted).

## Database Schema

Located in `supabase/schema.sql`. Key tables:

| Table | Purpose |
|-------|---------|
| `organizations` | Multi-tenant org data |
| `clients` | Client profiles + retainer terms |
| `contracts` | Billing rates per client |
| `invoices` | Invoice records |
| `time_entries` | Tracked hours |
| `alerts` | Detection engine outputs |
| `financial_settings` | Org-level thresholds |

Run migrations:
```bash
# Using Supabase CLI
supabase db push

# Or manually
psql -d your_db -f supabase/schema.sql
```

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/demo` | Enter demo mode (sets cookie, redirects) |
| `POST` | `/api/stripe/webhook` | Stripe payment webhooks |
| `GET` | `/api/integrations/toggl` | Fetch Toggl time entries |
| `POST` | `/api/cron/detect` | Run detection engine (cron) |

### Authentication

All `/app/*` routes require authentication via Supabase Auth or guest mode cookie.

```typescript
// Guest mode
Cookie: guest_mode=true

// Authenticated
Authorization: Bearer <supabase_jwt>
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

Tests use Vitest + React Testing Library. Coverage target: 50%+.

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/name`)
3. Write tests for new code
4. Ensure CI passes (`npm test && npm run lint`)
5. Submit PR

## License

MIT

---

<div align="center">

**Stop losing money.**

[![Try the Demo](https://img.shields.io/badge/Try_the_Demo-FF5733?style=for-the-badge)](https://retenu.vercel.app/api/demo)

</div>
