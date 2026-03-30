# 💸 Retenu

**Stop the bleeding. Scale your agency.**

Retenu is a high-performance financial intelligence platform designed specifically for agencies. It automatically identifies "hidden" revenue losses by analyzing the gap between your contracts, time tracking, and actual invoicing.



## 🚀 The Core Engine

Retenu doesn't just show you numbers; it actively detects **four types of leakage** that kill agency margins:

1.  **Underbilling Detection:** Automatically flags when billable hours worked exceed the amount actually invoiced, accounting for retainer offsets.
2.  **Scope Creep Alerts:** Real-time monitoring of contract hour limits. The system triggers warnings when projects exceed their scoped boundaries.
3.  **Missing Invoice audit:** A safety net that ensures every active client with a retainer is invoiced every single month.
4.  **Late Payment Tracking:** Aggressive monitoring of overdue receivables to keep your cash flow healthy.

## 🛠️ Technology Stack

Built with a modern, high-performance stack for maximum reliability:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Styling:** Tailwind CSS + Framer Motion (for premium UI animations)
- **Integrations:** Stripe (Invoices), Toggl (Time Tracking)
- **Testing:** [Vitest](https://vitest.dev/) (100% logic coverage)

## 🚦 Getting Started

### 1. Prerequisites
- Node.js 18+
- A Supabase project
- Optional: Stripe and Toggl developer accounts

### 2. Installation
```bash
git clone https://github.com/Davuddevelop/Retenu.git
cd Retenu
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

### 4. Direct Development
```bash
npm run dev
```

## 🧪 Automated Testing

We take financial accuracy seriously. Our calculation engine is protected by a comprehensive suite of automated tests.

Run the test suite:
```bash
npm test
```

## 🔐 Security & Compliance

- **OAuth 2.0:** Secure integrations with Stripe and Toggl.
- **Row Level Security (RLS):** Built-in data protection via Supabase.
- **GDPR Ready:** Clean data management patterns.

---

Built with ❤️ for Agency Owners.
