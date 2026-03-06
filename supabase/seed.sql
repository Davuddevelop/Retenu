-- RevenueLeak Seed Data
-- Run this AFTER schema.sql to populate test data
-- Note: You must have a user in auth.users first (create via Supabase Auth UI or API)

-- ============================================
-- CONFIGURATION
-- ============================================
-- Replace this with your actual auth.users ID after creating a test user
-- You can find this in Supabase Dashboard > Authentication > Users
DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000000';
    test_org_id UUID := '11111111-1111-1111-1111-111111111111';
    client_alpha_id UUID := '22222222-2222-2222-2222-222222222222';
    client_beta_id UUID := '33333333-3333-3333-3333-333333333333';
    client_gamma_id UUID := '44444444-4444-4444-4444-444444444444';
BEGIN

-- ============================================
-- ORGANIZATION
-- ============================================
-- First, ensure test user exists in auth.users (for local dev, you may need to create this manually)
-- For production seeding, comment out the organization insert and create via the app

INSERT INTO organizations (id, name, owner_id, demo_mode)
VALUES (test_org_id, 'Acme Marketing Agency', test_user_id, false)
ON CONFLICT (id) DO NOTHING;

-- Note: financial_settings are auto-created by trigger when organization is inserted

-- ============================================
-- CLIENTS
-- ============================================
INSERT INTO clients (id, organization_id, name, agreed_monthly_retainer, agreed_deliverables, hour_limit, status)
VALUES
    (client_alpha_id, test_org_id, 'Alpha Corp', 5000, '4 Blog Posts, 2 Newsletters', 40, 'active'),
    (client_beta_id, test_org_id, 'Beta SaaS', 8000, 'Paid Ads Management', 60, 'active'),
    (client_gamma_id, test_org_id, 'Gamma Dev', 3000, 'SEO Optimization', 20, 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CONTRACTS
-- ============================================
INSERT INTO contracts (id, client_id, organization_id, internal_hourly_rate, internal_cost_rate, start_date, status)
VALUES
    ('55555555-5555-5555-5555-555555555551', client_alpha_id, test_org_id, 150, 60, CURRENT_DATE - INTERVAL '60 days', 'active'),
    ('55555555-5555-5555-5555-555555555552', client_beta_id, test_org_id, 180, 80, CURRENT_DATE - INTERVAL '45 days', 'active'),
    ('55555555-5555-5555-5555-555555555553', client_gamma_id, test_org_id, 120, 50, CURRENT_DATE - INTERVAL '30 days', 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INVOICES
-- ============================================
-- Alpha Corp: Paid invoice (healthy)
-- Beta SaaS: Overdue invoice (late payment alert)
-- Gamma Dev: No invoice (missing invoice alert)
INSERT INTO invoices (id, client_id, organization_id, amount, status, issue_date, due_date, paid_date)
VALUES
    ('66666666-6666-6666-6666-666666666661', client_alpha_id, test_org_id, 5000, 'paid',
        CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE - INTERVAL '5 days'),
    ('66666666-6666-6666-6666-666666666662', client_beta_id, test_org_id, 8000, 'overdue',
        CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '10 days', NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TIME ENTRIES
-- ============================================
-- Alpha Corp: 45 hours > 40 limit (Scope Creep demo)
-- Beta SaaS: 40 hours (normal)
-- Gamma Dev: 15 hours (normal)
INSERT INTO time_entries (id, client_id, organization_id, hours, date, team_member, description, billable, source)
VALUES
    ('77777777-7777-7777-7777-777777777771', client_alpha_id, test_org_id, 25, CURRENT_DATE - INTERVAL '5 days', 'Alice', 'Content creation', true, 'manual'),
    ('77777777-7777-7777-7777-777777777772', client_alpha_id, test_org_id, 20, CURRENT_DATE - INTERVAL '2 days', 'Alice', 'Newsletter design', true, 'manual'),
    ('77777777-7777-7777-7777-777777777773', client_beta_id, test_org_id, 40, CURRENT_DATE - INTERVAL '5 days', 'Bob', 'Ad campaign management', true, 'manual'),
    ('77777777-7777-7777-7777-777777777774', client_gamma_id, test_org_id, 15, CURRENT_DATE - INTERVAL '10 days', 'Charlie', 'SEO audit', true, 'manual')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ALERTS (Pre-seeded for demo visibility)
-- ============================================
-- These alerts match what the detection engine would generate
INSERT INTO alerts (id, client_id, organization_id, alert_type, severity, estimated_leakage, message, details, status)
VALUES
    ('88888888-8888-8888-8888-888888888881', client_alpha_id, test_org_id, 'scope_creep', 'medium', 750,
        'Alpha Corp exceeded scope by 5 hours.',
        'Hour limit: 40h. Actual: 45h. Unbilled value: $750.00.', 'active'),
    ('88888888-8888-8888-8888-888888888882', client_beta_id, test_org_id, 'late_payment', 'high', 8000,
        'Beta SaaS has overdue invoices.',
        'Total overdue: $8,000.00.', 'active'),
    ('88888888-8888-8888-8888-888888888883', client_gamma_id, test_org_id, 'missing_invoice', 'medium', 3000,
        'No invoice generated for Gamma Dev this period.',
        'Expected retainer: $3,000.00.', 'active')
ON CONFLICT (id) DO NOTHING;

END $$;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify seed data was inserted correctly:
-- SELECT
--     (SELECT COUNT(*) FROM organizations) as orgs,
--     (SELECT COUNT(*) FROM clients) as clients,
--     (SELECT COUNT(*) FROM contracts) as contracts,
--     (SELECT COUNT(*) FROM invoices) as invoices,
--     (SELECT COUNT(*) FROM time_entries) as time_entries,
--     (SELECT COUNT(*) FROM alerts) as alerts,
--     (SELECT COUNT(*) FROM financial_settings) as settings;
