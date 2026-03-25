-- Obsidian Database Schema v2
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    demo_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organizations" ON organizations
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create organizations" ON organizations
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own organizations" ON organizations
    FOR UPDATE USING (owner_id = auth.uid());

-- ============================================
-- FINANCIAL SETTINGS
-- ============================================
CREATE TABLE financial_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    default_internal_hourly_rate DECIMAL(10,2) DEFAULT 150.00,
    default_internal_cost_rate DECIMAL(10,2) DEFAULT 60.00,
    currency TEXT DEFAULT 'USD',
    margin_warning_threshold_percent INTEGER DEFAULT 25,
    scope_creep_threshold_percent INTEGER DEFAULT 10,
    underbilling_threshold_percent INTEGER DEFAULT 15,
    late_payment_days_threshold INTEGER DEFAULT 7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id)
);

ALTER TABLE financial_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings" ON financial_settings
    FOR ALL USING (
        organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    );

-- ============================================
-- CLIENTS
-- ============================================
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'paused', 'churned');

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    agreed_monthly_retainer DECIMAL(10,2) NOT NULL,
    agreed_deliverables TEXT DEFAULT '',
    hour_limit DECIMAL(10,2),
    custom_hourly_rate DECIMAL(10,2),
    custom_cost_rate DECIMAL(10,2),
    custom_margin_threshold INTEGER,
    start_date DATE DEFAULT CURRENT_DATE,
    status client_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_organization ON clients(organization_id);
CREATE INDEX idx_clients_status ON clients(status);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own clients" ON clients
    FOR ALL USING (
        organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    );

-- ============================================
-- CONTRACTS
-- ============================================
CREATE TYPE contract_status AS ENUM ('active', 'inactive', 'expired');

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    internal_hourly_rate DECIMAL(10,2) NOT NULL,
    internal_cost_rate DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status contract_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contracts_client ON contracts(client_id);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contracts" ON contracts
    FOR ALL USING (
        organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    );

-- ============================================
-- INVOICES
-- ============================================
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled');

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status invoice_status DEFAULT 'draft',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    stripe_invoice_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own invoices" ON invoices
    FOR ALL USING (
        organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    );

-- ============================================
-- TIME ENTRIES
-- ============================================
CREATE TYPE time_entry_source AS ENUM ('manual', 'toggl', 'clockify', 'harvest', 'csv');

CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    hours DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    team_member TEXT DEFAULT 'Unknown',
    description TEXT DEFAULT '',
    billable BOOLEAN DEFAULT true,
    external_id TEXT,
    source time_entry_source DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_client ON time_entries(client_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_external ON time_entries(external_id);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own time entries" ON time_entries
    FOR ALL USING (
        organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    );

-- ============================================
-- INTEGRATIONS
-- ============================================
CREATE TYPE integration_provider AS ENUM ('stripe', 'toggl', 'clockify', 'harvest', 'quickbooks', 'xero');

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider integration_provider NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    api_key TEXT,
    workspace_id TEXT,
    enabled BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMPTZ,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, provider)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations" ON integrations
    FOR ALL USING (
        organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    );

-- ============================================
-- ALERTS
-- ============================================
CREATE TYPE alert_type AS ENUM ('underbilling', 'scope_creep', 'missing_invoice', 'late_payment', 'low_margin', 'negative_margin');
CREATE TYPE alert_severity AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE alert_status AS ENUM ('active', 'resolved', 'ignored');

CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    alert_type alert_type NOT NULL,
    severity alert_severity DEFAULT 'medium',
    estimated_leakage DECIMAL(10,2) DEFAULT 0,
    message TEXT NOT NULL,
    details TEXT DEFAULT '',
    status alert_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_client ON alerts(client_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_type ON alerts(alert_type);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts" ON alerts
    FOR ALL USING (
        organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_settings_updated_at
    BEFORE UPDATE ON financial_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create settings when organization is created
CREATE OR REPLACE FUNCTION create_default_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO financial_settings (organization_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_settings_for_new_org
    AFTER INSERT ON organizations
    FOR EACH ROW EXECUTE FUNCTION create_default_settings();
