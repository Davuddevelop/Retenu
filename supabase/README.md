# Supabase Database Setup

This directory contains the database schema and migrations for Retenu.

## Quick Setup

### Option 1: Supabase Dashboard

1. Go to your Supabase project SQL Editor
2. Copy contents of `schema.sql`
3. Run the SQL

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Option 3: Direct PostgreSQL

```bash
psql -h YOUR_HOST -U postgres -d postgres -f schema.sql
```

## Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         organizations                            │
│  id, name, owner_id, demo_mode, created_at, updated_at          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┬───────────────┐
        │             │             │             │               │
        ▼             ▼             ▼             ▼               ▼
┌───────────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐
│financial_     │ │  clients   │ │ invoices │ │time_     │ │integrations│
│settings       │ │            │ │          │ │entries   │ │            │
└───────────────┘ └─────┬──────┘ └──────────┘ └──────────┘ └────────────┘
                        │
              ┌─────────┼─────────┐
              │         │         │
              ▼         ▼         ▼
        ┌──────────┐ ┌──────┐ ┌──────────┐
        │contracts │ │alerts│ │(invoices)│
        └──────────┘ └──────┘ └──────────┘
```

## Tables

### organizations
Multi-tenant organization/company data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Organization name |
| owner_id | UUID | FK to auth.users |
| demo_mode | BOOLEAN | Demo data enabled |

### clients
Client profiles with retainer/billing terms.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organizations |
| name | TEXT | Client name |
| agreed_monthly_retainer | DECIMAL | Monthly retainer amount |
| hour_limit | DECIMAL | Max hours per month |
| custom_hourly_rate | DECIMAL | Override billing rate |
| status | ENUM | active/inactive/paused/churned |

### contracts
Billing rate agreements per client.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK to clients |
| internal_hourly_rate | DECIMAL | Billing rate |
| internal_cost_rate | DECIMAL | Cost rate |
| status | ENUM | active/inactive/expired |

### invoices
Invoice records (can sync from Stripe).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK to clients |
| amount | DECIMAL | Invoice amount |
| status | ENUM | draft/sent/pending/paid/overdue/cancelled |
| stripe_invoice_id | TEXT | Stripe reference |

### time_entries
Tracked work hours (manual or synced).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK to clients |
| hours | DECIMAL | Hours worked |
| date | DATE | Entry date |
| billable | BOOLEAN | Billable to client |
| source | ENUM | manual/toggl/clockify/harvest/csv |

### alerts
Detection engine output - revenue leak alerts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK to clients |
| alert_type | ENUM | underbilling/scope_creep/missing_invoice/late_payment/low_margin/negative_margin |
| severity | ENUM | critical/high/medium/low |
| estimated_leakage | DECIMAL | Dollar amount at risk |
| status | ENUM | active/resolved/ignored |

### integrations
Third-party service connections.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organizations |
| provider | ENUM | stripe/toggl/clockify/harvest/quickbooks/xero |
| access_token | TEXT | OAuth token |
| enabled | BOOLEAN | Integration active |

## Row Level Security (RLS)

All tables have RLS enabled. Policies ensure users can only access data belonging to their organization:

```sql
-- Example policy pattern
CREATE POLICY "Users can manage own data" ON table_name
    FOR ALL USING (
        organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
        )
    );
```

## Triggers

- `update_updated_at_column()` - Auto-updates `updated_at` on row changes
- `create_default_settings()` - Auto-creates financial_settings when org is created

## Migrations

Located in `migrations/` directory:

| File | Description |
|------|-------------|
| `20240101000000_initial_schema.sql` | Initial database setup |

To add a new migration:

```bash
# Create timestamped file
touch migrations/$(date +%Y%m%d%H%M%S)_description.sql
```
