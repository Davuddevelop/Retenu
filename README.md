<div align="center">
  <img src="public/header-banner.png" alt="RETENU - Revenue Intelligence Platform" width="100%">

  <br />
  <br />

  <h1>RETENU</h1>
  <h3>Revenue Intelligence for Modern Agencies</h3>

  <p><strong>Stop losing money to unbilled work, scope creep, and forgotten invoices.</strong></p>

  <br />

  [![Next.js 16](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

  <br />
  <br />

  [**Live Demo**](https://retenu.vercel.app/demo) &nbsp;&nbsp;|&nbsp;&nbsp; [**Documentation**](#-quick-start) &nbsp;&nbsp;|&nbsp;&nbsp; [**Report Bug**](https://github.com/yourusername/retenu/issues)

  <br />

  ---

</div>

<br />

## The Problem

> **Agencies lose 10-25% of their annual revenue** to invisible leaks they don't even know exist.

Every agency deals with these silent profit killers:

| Problem | What Happens | Annual Cost |
|---------|--------------|-------------|
| **Unbilled Hours** | Time tracked but never invoiced | $15,000 - $50,000 |
| **Scope Creep** | Extra work on retainers never charged | $10,000 - $40,000 |
| **Late Payments** | Cash flow gaps from overdue invoices | $5,000 - $20,000 |
| **Margin Erosion** | Projects that cost more than they earn | $20,000 - $80,000 |

**The worst part?** Most agencies have no idea how much they're losing until it's too late.

<br />

## The Solution

<div align="center">
  <img src="public/dashboard obsidian 2.png" alt="Retenu Dashboard" width="90%" style="border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">

  <br />
  <br />

  <em>Real-time revenue intelligence that shows you exactly where money is slipping through the cracks.</em>
</div>

<br />

**Retenu** connects your time tracking, contracts, and invoicing to automatically surface revenue leaks before they become permanent losses.

### How It Works

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Time Tracker  │      │    Contracts    │      │    Invoices     │
│   (Toggl, etc)  │ ──── │   & Retainers   │ ──── │    (Stripe)     │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │    RETENU DETECTION     │
                    │         ENGINE          │
                    │                         │
                    │  • Underbilling alerts  │
                    │  • Scope creep warnings │
                    │  • Payment tracking     │
                    │  • Margin analysis      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   ACTIONABLE INSIGHTS   │
                    │                         │
                    │  "Client X has 12 hrs   │
                    │   unbilled this month"  │
                    │                         │
                    │   💰 $1,800 at risk     │
                    └─────────────────────────┘
```

<br />

## Features

<table>
<tr>
<td width="50%">

### Real-Time Detection Engine
Automatically identifies revenue leaks across all your clients with rule-based detection that achieves **85-99% accuracy**.

- Unbilled hours detection
- Scope creep analysis
- Missing invoice alerts
- Late payment tracking
- Margin erosion warnings

</td>
<td width="50%">

### Beautiful Dashboard
Mercury-inspired dark UI designed for agencies who care about design.

- Real-time metrics at a glance
- Filterable alerts by severity
- Client health overview
- Revenue trend visualization
- Mobile responsive

</td>
</tr>
<tr>
<td width="50%">

### Seamless Integrations
Connect your existing tools in minutes.

- **Toggl Track** - Time entries sync
- **Clockify** - Time tracking import
- **Stripe** - Invoice & payment data
- **CSV Import** - Universal compatibility

</td>
<td width="50%">

### Client Management
Everything you need to track client profitability.

- Retainer agreements
- Hourly rate tracking
- Custom billing rates
- Contract management
- Performance history

</td>
</tr>
</table>

<br />

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/retenu.git
cd retenu

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run the development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Toggl (optional)
TOGGL_API_TOKEN=your_toggl_token
```

### Database Setup

```bash
# Run Supabase migrations
npx supabase db push
```

<br />

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Payments** | Stripe |
| **Deployment** | Vercel |
| **Animations** | Framer Motion |

<br />

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── app/               # Protected dashboard routes
│   │   ├── alerts/        # Revenue leak alerts
│   │   ├── clients/       # Client management
│   │   ├── invoices/      # Invoice tracking
│   │   ├── time-entries/  # Time entry management
│   │   └── settings/      # User & integration settings
│   ├── api/               # API routes
│   │   ├── auth/          # OAuth callbacks
│   │   ├── cron/          # Scheduled detection jobs
│   │   └── integrations/  # External service APIs
│   ├── providers/         # React context providers
│   │   ├── AuthProvider   # Authentication state
│   │   └── DataProvider   # Data & demo mode state
│   └── lib/               # Shared utilities
│       ├── dataStore      # Local storage management
│       ├── detectionEngine# Revenue leak detection
│       └── types          # TypeScript definitions
├── proxy.ts               # Edge middleware (auth)
└── ...
```

<br />

## Detection Engine

Retenu uses a **rule-based detection engine** that analyzes patterns across your data:

### Detection Rules

| Alert Type | Trigger Condition | Severity |
|------------|-------------------|----------|
| **Underbilling** | Tracked hours > Billed hours | High |
| **Scope Creep** | Hours exceed retainer limit by >10% | Medium-High |
| **Missing Invoice** | Work completed, no invoice created | High |
| **Late Payment** | Invoice overdue by >7 days | Medium |
| **Low Margin** | Project margin <25% | Medium |
| **Negative Margin** | Costs exceed revenue | Critical |

### Why Rule-Based?

After extensive analysis, we chose rule-based detection over ML/AI because:

1. **Transparency** - Users understand exactly why alerts fire
2. **Accuracy** - 85-99% accuracy with proper thresholds
3. **Speed** - No model training or inference latency
4. **Cost** - No API costs or compute requirements
5. **Customization** - Easy to adjust thresholds per client

<br />

## Roadmap

### Completed
- [x] Core dashboard with real-time metrics
- [x] Client management with retainer tracking
- [x] Invoice and time entry management
- [x] Detection engine with 6 alert types
- [x] Toggl & Clockify integrations
- [x] CSV import for time entries
- [x] Demo mode for prospects
- [x] Mobile responsive design
- [x] Alert resolve/ignore actions

### In Progress
- [ ] Email notifications for new alerts
- [ ] Slack integration
- [ ] Weekly digest reports

### Planned
- [ ] Team management & permissions
- [ ] Client-facing reports (PDF export)
- [ ] Historical trend analysis
- [ ] API access for custom integrations
- [ ] White-label option for agencies
- [ ] QuickBooks integration

<br />

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

```bash
# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

<br />

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<br />

---

<div align="center">

  <br />

  **Built with precision for agencies who refuse to leave money on the table.**

  <br />

  [Try the Demo](https://retenu.vercel.app/demo) &nbsp;&nbsp;•&nbsp;&nbsp; [Report Issues](https://github.com/yourusername/retenu/issues) &nbsp;&nbsp;•&nbsp;&nbsp; [Request Features](https://github.com/yourusername/retenu/discussions)

  <br />

  Made with dedication by the Retenu team

</div>
