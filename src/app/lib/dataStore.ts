// src/app/lib/dataStore.ts
// Centralized data management with localStorage persistence

import {
    Organization,
    FinancialSettings,
    Client,
    Contract,
    Invoice,
    TimeEntry,
    DataStore,
    EMPTY_FINANCIAL_SETTINGS,
} from './types';

// Storage keys
const STORAGE_KEYS = {
    STORE: 'revenueLeak_dataStore',
    DEMO_MODE: 'revenueLeak_demoMode',
} as const;

// ============================================
// DEMO DATA (Only loaded in demo mode)
// ============================================

const DEMO_ORGANIZATION: Organization = {
    id: 'demo-org-001',
    name: 'Demo Agency',
    created_at: '2026-01-01T00:00:00Z',
    demo_mode: true,
};

const DEMO_SETTINGS: FinancialSettings = {
    id: 'demo-settings-001',
    organization_id: 'demo-org-001',
    ...EMPTY_FINANCIAL_SETTINGS,
    updated_at: new Date().toISOString(),
};

const DEMO_CLIENTS: Client[] = [
    {
        id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        name: 'TechStart Inc',
        agreed_monthly_retainer: 12000,
        agreed_deliverables: 'Full-Stack Development, API Integration, DevOps Support',
        hour_limit: 80,
        custom_hourly_rate: 175,
        custom_cost_rate: 70,
        custom_margin_threshold: null,
        start_date: '2025-11-01',
        status: 'active',
        created_at: '2025-11-01T00:00:00Z',
        updated_at: '2026-03-10T00:00:00Z',
    },
    {
        id: 'demo-client-beta',
        organization_id: 'demo-org-001',
        name: 'FinServe Solutions',
        agreed_monthly_retainer: 18000,
        agreed_deliverables: 'Enterprise Software Development, Security Audits',
        hour_limit: 120,
        custom_hourly_rate: 200,
        custom_cost_rate: 85,
        custom_margin_threshold: null,
        start_date: '2025-10-15',
        status: 'active',
        created_at: '2025-10-15T00:00:00Z',
        updated_at: '2026-03-10T00:00:00Z',
    },
    {
        id: 'demo-client-gamma',
        organization_id: 'demo-org-001',
        name: 'Marketing Pro Agency',
        agreed_monthly_retainer: 8500,
        agreed_deliverables: 'Social Media Management, Content Strategy, Analytics',
        hour_limit: 60,
        custom_hourly_rate: 150,
        custom_cost_rate: 60,
        custom_margin_threshold: 35,
        start_date: '2026-01-01',
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-03-10T00:00:00Z',
    },
    {
        id: 'demo-client-delta',
        organization_id: 'demo-org-001',
        name: 'E-Commerce Plus',
        agreed_monthly_retainer: 15000,
        agreed_deliverables: 'Platform Development, Payment Integration, UX Design',
        hour_limit: 100,
        custom_hourly_rate: 180,
        custom_cost_rate: 75,
        custom_margin_threshold: null,
        start_date: '2025-12-01',
        status: 'active',
        created_at: '2025-12-01T00:00:00Z',
        updated_at: '2026-03-10T00:00:00Z',
    },
    {
        id: 'demo-client-epsilon',
        organization_id: 'demo-org-001',
        name: 'HealthTech Innovations',
        agreed_monthly_retainer: 22000,
        agreed_deliverables: 'HIPAA Compliant Platform, Mobile App Development',
        hour_limit: 140,
        custom_hourly_rate: 195,
        custom_cost_rate: 80,
        custom_margin_threshold: null,
        start_date: '2025-09-01',
        status: 'active',
        created_at: '2025-09-01T00:00:00Z',
        updated_at: '2026-03-10T00:00:00Z',
    },
    {
        id: 'demo-client-zeta',
        organization_id: 'demo-org-001',
        name: 'CloudScale Systems',
        agreed_monthly_retainer: 9500,
        agreed_deliverables: 'Cloud Migration, Infrastructure as Code, Monitoring',
        hour_limit: 65,
        custom_hourly_rate: 165,
        custom_cost_rate: 65,
        custom_margin_threshold: null,
        start_date: '2026-02-01',
        status: 'active',
        created_at: '2026-02-01T00:00:00Z',
        updated_at: '2026-03-10T00:00:00Z',
    },
    {
        id: 'demo-client-eta',
        organization_id: 'demo-org-001',
        name: 'StartupHub Accelerator',
        agreed_monthly_retainer: 6000,
        agreed_deliverables: 'MVP Development, Product Consulting',
        hour_limit: 40,
        custom_hourly_rate: 160,
        custom_cost_rate: 55,
        custom_margin_threshold: 30,
        start_date: '2026-01-15',
        status: 'active',
        created_at: '2026-01-15T00:00:00Z',
        updated_at: '2026-03-10T00:00:00Z',
    },
];

const DEMO_CONTRACTS: Contract[] = [
    {
        id: 'demo-contract-alpha',
        client_id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        internal_hourly_rate: 175,
        internal_cost_rate: 70,
        start_date: '2025-11-01',
        end_date: null,
        status: 'active',
        created_at: '2025-11-01T00:00:00Z',
    },
    {
        id: 'demo-contract-beta',
        client_id: 'demo-client-beta',
        organization_id: 'demo-org-001',
        internal_hourly_rate: 200,
        internal_cost_rate: 85,
        start_date: '2025-10-15',
        end_date: null,
        status: 'active',
        created_at: '2025-10-15T00:00:00Z',
    },
    {
        id: 'demo-contract-gamma',
        client_id: 'demo-client-gamma',
        organization_id: 'demo-org-001',
        internal_hourly_rate: 150,
        internal_cost_rate: 60,
        start_date: '2026-01-01',
        end_date: null,
        status: 'active',
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'demo-contract-delta',
        client_id: 'demo-client-delta',
        organization_id: 'demo-org-001',
        internal_hourly_rate: 180,
        internal_cost_rate: 75,
        start_date: '2025-12-01',
        end_date: null,
        status: 'active',
        created_at: '2025-12-01T00:00:00Z',
    },
    {
        id: 'demo-contract-epsilon',
        client_id: 'demo-client-epsilon',
        organization_id: 'demo-org-001',
        internal_hourly_rate: 195,
        internal_cost_rate: 80,
        start_date: '2025-09-01',
        end_date: null,
        status: 'active',
        created_at: '2025-09-01T00:00:00Z',
    },
    {
        id: 'demo-contract-zeta',
        client_id: 'demo-client-zeta',
        organization_id: 'demo-org-001',
        internal_hourly_rate: 165,
        internal_cost_rate: 65,
        start_date: '2026-02-01',
        end_date: null,
        status: 'active',
        created_at: '2026-02-01T00:00:00Z',
    },
    {
        id: 'demo-contract-eta',
        client_id: 'demo-client-eta',
        organization_id: 'demo-org-001',
        internal_hourly_rate: 160,
        internal_cost_rate: 55,
        start_date: '2026-01-15',
        end_date: null,
        status: 'active',
        created_at: '2026-01-15T00:00:00Z',
    },
];

const DEMO_INVOICES: Invoice[] = [
    // TechStart Inc - Paid invoices
    {
        id: 'demo-invoice-alpha-1',
        client_id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        amount: 12000,
        status: 'paid',
        issue_date: '2025-11-01',
        due_date: '2025-11-15',
        paid_date: '2025-11-12',
        stripe_invoice_id: null,
        created_at: '2025-11-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-alpha-2',
        client_id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        amount: 12000,
        status: 'paid',
        issue_date: '2025-12-01',
        due_date: '2025-12-15',
        paid_date: '2025-12-14',
        stripe_invoice_id: null,
        created_at: '2025-12-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-alpha-3',
        client_id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        amount: 12000,
        status: 'paid',
        issue_date: '2026-01-01',
        due_date: '2026-01-15',
        paid_date: '2026-01-10',
        stripe_invoice_id: null,
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-alpha-4',
        client_id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        amount: 12000,
        status: 'paid',
        issue_date: '2026-02-01',
        due_date: '2026-02-15',
        paid_date: '2026-02-18',
        stripe_invoice_id: null,
        created_at: '2026-02-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-alpha-5',
        client_id: 'demo-client-alpha',
        organization_id: 'demo-org-001',
        amount: 12000,
        status: 'sent',
        issue_date: '2026-03-01',
        due_date: '2026-03-15',
        paid_date: null,
        stripe_invoice_id: null,
        created_at: '2026-03-01T00:00:00Z',
    },
    // FinServe Solutions - Mix of paid and overdue
    {
        id: 'demo-invoice-beta-1',
        client_id: 'demo-client-beta',
        organization_id: 'demo-org-001',
        amount: 18000,
        status: 'paid',
        issue_date: '2025-10-15',
        due_date: '2025-10-30',
        paid_date: '2025-10-28',
        stripe_invoice_id: null,
        created_at: '2025-10-15T00:00:00Z',
    },
    {
        id: 'demo-invoice-beta-2',
        client_id: 'demo-client-beta',
        organization_id: 'demo-org-001',
        amount: 18000,
        status: 'paid',
        issue_date: '2025-11-15',
        due_date: '2025-11-30',
        paid_date: '2025-12-05',
        stripe_invoice_id: null,
        created_at: '2025-11-15T00:00:00Z',
    },
    {
        id: 'demo-invoice-beta-3',
        client_id: 'demo-client-beta',
        organization_id: 'demo-org-001',
        amount: 18000,
        status: 'paid',
        issue_date: '2025-12-15',
        due_date: '2025-12-30',
        paid_date: '2026-01-08',
        stripe_invoice_id: null,
        created_at: '2025-12-15T00:00:00Z',
    },
    {
        id: 'demo-invoice-beta-4',
        client_id: 'demo-client-beta',
        organization_id: 'demo-org-001',
        amount: 18000,
        status: 'overdue',
        issue_date: '2026-01-15',
        due_date: '2026-01-30',
        paid_date: null,
        stripe_invoice_id: null,
        created_at: '2026-01-15T00:00:00Z',
    },
    {
        id: 'demo-invoice-beta-5',
        client_id: 'demo-client-beta',
        organization_id: 'demo-org-001',
        amount: 18000,
        status: 'overdue',
        issue_date: '2026-02-15',
        due_date: '2026-02-28',
        paid_date: null,
        stripe_invoice_id: null,
        created_at: '2026-02-15T00:00:00Z',
    },
    // Marketing Pro Agency
    {
        id: 'demo-invoice-gamma-1',
        client_id: 'demo-client-gamma',
        organization_id: 'demo-org-001',
        amount: 8500,
        status: 'paid',
        issue_date: '2026-01-01',
        due_date: '2026-01-15',
        paid_date: '2026-01-12',
        stripe_invoice_id: null,
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-gamma-2',
        client_id: 'demo-client-gamma',
        organization_id: 'demo-org-001',
        amount: 8500,
        status: 'paid',
        issue_date: '2026-02-01',
        due_date: '2026-02-15',
        paid_date: '2026-02-14',
        stripe_invoice_id: null,
        created_at: '2026-02-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-gamma-3',
        client_id: 'demo-client-gamma',
        organization_id: 'demo-org-001',
        amount: 8500,
        status: 'sent',
        issue_date: '2026-03-01',
        due_date: '2026-03-15',
        paid_date: null,
        stripe_invoice_id: null,
        created_at: '2026-03-01T00:00:00Z',
    },
    // E-Commerce Plus
    {
        id: 'demo-invoice-delta-1',
        client_id: 'demo-client-delta',
        organization_id: 'demo-org-001',
        amount: 15000,
        status: 'paid',
        issue_date: '2025-12-01',
        due_date: '2025-12-15',
        paid_date: '2025-12-10',
        stripe_invoice_id: null,
        created_at: '2025-12-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-delta-2',
        client_id: 'demo-client-delta',
        organization_id: 'demo-org-001',
        amount: 15000,
        status: 'paid',
        issue_date: '2026-01-01',
        due_date: '2026-01-15',
        paid_date: '2026-01-11',
        stripe_invoice_id: null,
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-delta-3',
        client_id: 'demo-client-delta',
        organization_id: 'demo-org-001',
        amount: 15000,
        status: 'paid',
        issue_date: '2026-02-01',
        due_date: '2026-02-15',
        paid_date: '2026-02-13',
        stripe_invoice_id: null,
        created_at: '2026-02-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-delta-4',
        client_id: 'demo-client-delta',
        organization_id: 'demo-org-001',
        amount: 15000,
        status: 'sent',
        issue_date: '2026-03-01',
        due_date: '2026-03-15',
        paid_date: null,
        stripe_invoice_id: null,
        created_at: '2026-03-01T00:00:00Z',
    },
    // HealthTech Innovations - All paid
    {
        id: 'demo-invoice-epsilon-1',
        client_id: 'demo-client-epsilon',
        organization_id: 'demo-org-001',
        amount: 22000,
        status: 'paid',
        issue_date: '2026-01-01',
        due_date: '2026-01-15',
        paid_date: '2026-01-08',
        stripe_invoice_id: null,
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-epsilon-2',
        client_id: 'demo-client-epsilon',
        organization_id: 'demo-org-001',
        amount: 22000,
        status: 'paid',
        issue_date: '2026-02-01',
        due_date: '2026-02-15',
        paid_date: '2026-02-10',
        stripe_invoice_id: null,
        created_at: '2026-02-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-epsilon-3',
        client_id: 'demo-client-epsilon',
        organization_id: 'demo-org-001',
        amount: 22000,
        status: 'sent',
        issue_date: '2026-03-01',
        due_date: '2026-03-15',
        paid_date: null,
        stripe_invoice_id: null,
        created_at: '2026-03-01T00:00:00Z',
    },
    // CloudScale Systems
    {
        id: 'demo-invoice-zeta-1',
        client_id: 'demo-client-zeta',
        organization_id: 'demo-org-001',
        amount: 9500,
        status: 'paid',
        issue_date: '2026-02-01',
        due_date: '2026-02-15',
        paid_date: '2026-02-12',
        stripe_invoice_id: null,
        created_at: '2026-02-01T00:00:00Z',
    },
    {
        id: 'demo-invoice-zeta-2',
        client_id: 'demo-client-zeta',
        organization_id: 'demo-org-001',
        amount: 9500,
        status: 'sent',
        issue_date: '2026-03-01',
        due_date: '2026-03-15',
        paid_date: null,
        stripe_invoice_id: null,
        created_at: '2026-03-01T00:00:00Z',
    },
    // StartupHub Accelerator
    {
        id: 'demo-invoice-eta-1',
        client_id: 'demo-client-eta',
        organization_id: 'demo-org-001',
        amount: 6000,
        status: 'paid',
        issue_date: '2026-01-15',
        due_date: '2026-01-30',
        paid_date: '2026-01-28',
        stripe_invoice_id: null,
        created_at: '2026-01-15T00:00:00Z',
    },
    {
        id: 'demo-invoice-eta-2',
        client_id: 'demo-client-eta',
        organization_id: 'demo-org-001',
        amount: 6000,
        status: 'paid',
        issue_date: '2026-02-15',
        due_date: '2026-02-28',
        paid_date: '2026-02-26',
        stripe_invoice_id: null,
        created_at: '2026-02-15T00:00:00Z',
    },
];

const DEMO_TIME_ENTRIES: TimeEntry[] = [
    // TechStart Inc - March (SCOPE CREEP: 95 hours vs 80 limit)
    { id: 'demo-time-alpha-1', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 8, date: '2026-03-01', team_member: 'Sarah Chen', description: 'API integration development', billable: true, source: 'manual', created_at: '2026-03-01T00:00:00Z' },
    { id: 'demo-time-alpha-2', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 6, date: '2026-03-02', team_member: 'Sarah Chen', description: 'Authentication module', billable: true, source: 'manual', created_at: '2026-03-02T00:00:00Z' },
    { id: 'demo-time-alpha-3', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 7, date: '2026-03-03', team_member: 'Mike Johnson', description: 'Database optimization', billable: true, source: 'manual', created_at: '2026-03-03T00:00:00Z' },
    { id: 'demo-time-alpha-4', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 8, date: '2026-03-04', team_member: 'Sarah Chen', description: 'Payment gateway integration', billable: true, source: 'manual', created_at: '2026-03-04T00:00:00Z' },
    { id: 'demo-time-alpha-5', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 5, date: '2026-03-05', team_member: 'Mike Johnson', description: 'DevOps setup', billable: true, source: 'manual', created_at: '2026-03-05T00:00:00Z' },
    { id: 'demo-time-alpha-6', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 9, date: '2026-03-06', team_member: 'Sarah Chen', description: 'Frontend component development', billable: true, source: 'manual', created_at: '2026-03-06T00:00:00Z' },
    { id: 'demo-time-alpha-7', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 7, date: '2026-03-07', team_member: 'Mike Johnson', description: 'CI/CD pipeline setup', billable: true, source: 'manual', created_at: '2026-03-07T00:00:00Z' },
    { id: 'demo-time-alpha-8', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 8, date: '2026-03-08', team_member: 'Sarah Chen', description: 'API endpoint testing', billable: true, source: 'manual', created_at: '2026-03-08T00:00:00Z' },
    { id: 'demo-time-alpha-9', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 6, date: '2026-03-09', team_member: 'Mike Johnson', description: 'Security audit fixes', billable: true, source: 'manual', created_at: '2026-03-09T00:00:00Z' },
    { id: 'demo-time-alpha-10', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 8, date: '2026-03-10', team_member: 'Sarah Chen', description: 'Bug fixes and refinements', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-alpha-11', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 7, date: '2026-03-10', team_member: 'Mike Johnson', description: 'Performance optimization', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-alpha-12', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 8, date: '2026-03-10', team_member: 'Alex Rivera', description: 'Code review and documentation', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-alpha-13', client_id: 'demo-client-alpha', organization_id: 'demo-org-001', hours: 8, date: '2026-03-10', team_member: 'Sarah Chen', description: 'Extra feature requests', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },

    // FinServe Solutions - March (SCOPE CREEP: 135 hours vs 120 limit)
    { id: 'demo-time-beta-1', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 9, date: '2026-03-01', team_member: 'James Park', description: 'Enterprise architecture planning', billable: true, source: 'manual', created_at: '2026-03-01T00:00:00Z' },
    { id: 'demo-time-beta-2', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-02', team_member: 'Emma Wilson', description: 'Security audit - penetration testing', billable: true, source: 'manual', created_at: '2026-03-02T00:00:00Z' },
    { id: 'demo-time-beta-3', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 10, date: '2026-03-03', team_member: 'James Park', description: 'Compliance documentation', billable: true, source: 'manual', created_at: '2026-03-03T00:00:00Z' },
    { id: 'demo-time-beta-4', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 7, date: '2026-03-04', team_member: 'Emma Wilson', description: 'Vulnerability assessment', billable: true, source: 'manual', created_at: '2026-03-04T00:00:00Z' },
    { id: 'demo-time-beta-5', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-05', team_member: 'James Park', description: 'Microservices development', billable: true, source: 'manual', created_at: '2026-03-05T00:00:00Z' },
    { id: 'demo-time-beta-6', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 9, date: '2026-03-06', team_member: 'Emma Wilson', description: 'Security patches implementation', billable: true, source: 'manual', created_at: '2026-03-06T00:00:00Z' },
    { id: 'demo-time-beta-7', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-07', team_member: 'James Park', description: 'Database migration', billable: true, source: 'manual', created_at: '2026-03-07T00:00:00Z' },
    { id: 'demo-time-beta-8', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 10, date: '2026-03-08', team_member: 'Emma Wilson', description: 'Encryption implementation', billable: true, source: 'manual', created_at: '2026-03-08T00:00:00Z' },
    { id: 'demo-time-beta-9', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 9, date: '2026-03-09', team_member: 'James Park', description: 'API development', billable: true, source: 'manual', created_at: '2026-03-09T00:00:00Z' },
    { id: 'demo-time-beta-10', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 9, date: '2026-03-10', team_member: 'Emma Wilson', description: 'Security testing and validation', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-beta-11', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-10', team_member: 'James Park', description: 'Integration testing', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-beta-12', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 10, date: '2026-03-10', team_member: 'Alex Rivera', description: 'Additional security requirements', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-beta-13', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-10', team_member: 'Emma Wilson', description: 'Compliance updates', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-beta-14', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 7, date: '2026-03-10', team_member: 'James Park', description: 'Emergency hotfix deployment', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-beta-15', client_id: 'demo-client-beta', organization_id: 'demo-org-001', hours: 7, date: '2026-03-10', team_member: 'Sarah Chen', description: 'Additional feature scope', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },

    // Marketing Pro Agency - March (within limit: 58 hours vs 60)
    { id: 'demo-time-gamma-1', client_id: 'demo-client-gamma', organization_id: 'demo-org-001', hours: 6, date: '2026-03-01', team_member: 'Lisa Martinez', description: 'Social media strategy planning', billable: true, source: 'manual', created_at: '2026-03-01T00:00:00Z' },
    { id: 'demo-time-gamma-2', client_id: 'demo-client-gamma', organization_id: 'demo-org-001', hours: 5, date: '2026-03-02', team_member: 'Lisa Martinez', description: 'Content calendar creation', billable: true, source: 'manual', created_at: '2026-03-02T00:00:00Z' },
    { id: 'demo-time-gamma-3', client_id: 'demo-client-gamma', organization_id: 'demo-org-001', hours: 7, date: '2026-03-03', team_member: 'Tom Anderson', description: 'Analytics reporting', billable: true, source: 'manual', created_at: '2026-03-03T00:00:00Z' },
    { id: 'demo-time-gamma-4', client_id: 'demo-client-gamma', organization_id: 'demo-org-001', hours: 6, date: '2026-03-04', team_member: 'Lisa Martinez', description: 'Campaign management', billable: true, source: 'manual', created_at: '2026-03-04T00:00:00Z' },
    { id: 'demo-time-gamma-5', client_id: 'demo-client-gamma', organization_id: 'demo-org-001', hours: 5, date: '2026-03-05', team_member: 'Tom Anderson', description: 'Performance analysis', billable: true, source: 'manual', created_at: '2026-03-05T00:00:00Z' },
    { id: 'demo-time-gamma-6', client_id: 'demo-client-gamma', organization_id: 'demo-org-001', hours: 6, date: '2026-03-06', team_member: 'Lisa Martinez', description: 'Content creation and posting', billable: true, source: 'manual', created_at: '2026-03-06T00:00:00Z' },
    { id: 'demo-time-gamma-7', client_id: 'demo-client-gamma', organization_id: 'demo-org-001', hours: 4, date: '2026-03-07', team_member: 'Tom Anderson', description: 'Competitor analysis', billable: true, source: 'manual', created_at: '2026-03-07T00:00:00Z' },
    { id: 'demo-time-gamma-8', client_id: 'demo-client-gamma', organization_id: 'demo-org-001', hours: 6, date: '2026-03-08', team_member: 'Lisa Martinez', description: 'Influencer outreach', billable: true, source: 'manual', created_at: '2026-03-08T00:00:00Z' },
    { id: 'demo-time-gamma-9', client_id: 'demo-client-gamma', organization_id: 'demo-org-001', hours: 5, date: '2026-03-09', team_member: 'Tom Anderson', description: 'ROI reporting', billable: true, source: 'manual', created_at: '2026-03-09T00:00:00Z' },
    { id: 'demo-time-gamma-10', client_id: 'demo-client-gamma', organization_id: 'demo-org-001', hours: 8, date: '2026-03-10', team_member: 'Lisa Martinez', description: 'Monthly strategy review', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },

    // E-Commerce Plus - March (SCOPE CREEP: 112 hours vs 100 limit)
    { id: 'demo-time-delta-1', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-01', team_member: 'David Kim', description: 'Shopping cart optimization', billable: true, source: 'manual', created_at: '2026-03-01T00:00:00Z' },
    { id: 'demo-time-delta-2', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 7, date: '2026-03-02', team_member: 'Rachel Green', description: 'Payment gateway integration', billable: true, source: 'manual', created_at: '2026-03-02T00:00:00Z' },
    { id: 'demo-time-delta-3', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 9, date: '2026-03-03', team_member: 'David Kim', description: 'Product catalog updates', billable: true, source: 'manual', created_at: '2026-03-03T00:00:00Z' },
    { id: 'demo-time-delta-4', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-04', team_member: 'Rachel Green', description: 'UX redesign - checkout flow', billable: true, source: 'manual', created_at: '2026-03-04T00:00:00Z' },
    { id: 'demo-time-delta-5', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 7, date: '2026-03-05', team_member: 'David Kim', description: 'Inventory management system', billable: true, source: 'manual', created_at: '2026-03-05T00:00:00Z' },
    { id: 'demo-time-delta-6', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-06', team_member: 'Rachel Green', description: 'Mobile responsiveness fixes', billable: true, source: 'manual', created_at: '2026-03-06T00:00:00Z' },
    { id: 'demo-time-delta-7', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 9, date: '2026-03-07', team_member: 'David Kim', description: 'Search functionality enhancement', billable: true, source: 'manual', created_at: '2026-03-07T00:00:00Z' },
    { id: 'demo-time-delta-8', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 7, date: '2026-03-08', team_member: 'Rachel Green', description: 'User testing and feedback', billable: true, source: 'manual', created_at: '2026-03-08T00:00:00Z' },
    { id: 'demo-time-delta-9', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-09', team_member: 'David Kim', description: 'Shipping integration', billable: true, source: 'manual', created_at: '2026-03-09T00:00:00Z' },
    { id: 'demo-time-delta-10', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-10', team_member: 'Rachel Green', description: 'Performance optimization', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-delta-11', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 9, date: '2026-03-10', team_member: 'David Kim', description: 'Additional feature requests', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-delta-12', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-10', team_member: 'Alex Rivera', description: 'Security enhancements', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-delta-13', client_id: 'demo-client-delta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-10', team_member: 'Rachel Green', description: 'Bug fixes and polish', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },

    // HealthTech Innovations - March (within limit: 125 hours vs 140)
    { id: 'demo-time-epsilon-1', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 10, date: '2026-03-01', team_member: 'Dr. Nina Patel', description: 'HIPAA compliance review', billable: true, source: 'manual', created_at: '2026-03-01T00:00:00Z' },
    { id: 'demo-time-epsilon-2', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 9, date: '2026-03-02', team_member: 'Marcus Lee', description: 'Patient data encryption', billable: true, source: 'manual', created_at: '2026-03-02T00:00:00Z' },
    { id: 'demo-time-epsilon-3', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 8, date: '2026-03-03', team_member: 'Dr. Nina Patel', description: 'EHR system integration', billable: true, source: 'manual', created_at: '2026-03-03T00:00:00Z' },
    { id: 'demo-time-epsilon-4', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 10, date: '2026-03-04', team_member: 'Marcus Lee', description: 'Mobile app development', billable: true, source: 'manual', created_at: '2026-03-04T00:00:00Z' },
    { id: 'demo-time-epsilon-5', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 9, date: '2026-03-05', team_member: 'Dr. Nina Patel', description: 'Healthcare API development', billable: true, source: 'manual', created_at: '2026-03-05T00:00:00Z' },
    { id: 'demo-time-epsilon-6', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 8, date: '2026-03-06', team_member: 'Marcus Lee', description: 'Telemedicine features', billable: true, source: 'manual', created_at: '2026-03-06T00:00:00Z' },
    { id: 'demo-time-epsilon-7', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 10, date: '2026-03-07', team_member: 'Dr. Nina Patel', description: 'Security audit', billable: true, source: 'manual', created_at: '2026-03-07T00:00:00Z' },
    { id: 'demo-time-epsilon-8', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 9, date: '2026-03-08', team_member: 'Marcus Lee', description: 'Patient portal development', billable: true, source: 'manual', created_at: '2026-03-08T00:00:00Z' },
    { id: 'demo-time-epsilon-9', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 8, date: '2026-03-09', team_member: 'Dr. Nina Patel', description: 'Compliance documentation', billable: true, source: 'manual', created_at: '2026-03-09T00:00:00Z' },
    { id: 'demo-time-epsilon-10', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 10, date: '2026-03-10', team_member: 'Marcus Lee', description: 'Testing and QA', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-epsilon-11', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 9, date: '2026-03-10', team_member: 'Dr. Nina Patel', description: 'User acceptance testing', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-epsilon-12', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 8, date: '2026-03-10', team_member: 'Alex Rivera', description: 'Code review', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
    { id: 'demo-time-epsilon-13', client_id: 'demo-client-epsilon', organization_id: 'demo-org-001', hours: 9, date: '2026-03-10', team_member: 'Marcus Lee', description: 'Deployment preparation', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },

    // CloudScale Systems - March (within limit: 62 hours vs 65)
    { id: 'demo-time-zeta-1', client_id: 'demo-client-zeta', organization_id: 'demo-org-001', hours: 7, date: '2026-03-01', team_member: 'Omar Hassan', description: 'AWS infrastructure setup', billable: true, source: 'manual', created_at: '2026-03-01T00:00:00Z' },
    { id: 'demo-time-zeta-2', client_id: 'demo-client-zeta', organization_id: 'demo-org-001', hours: 6, date: '2026-03-02', team_member: 'Omar Hassan', description: 'Terraform configuration', billable: true, source: 'manual', created_at: '2026-03-02T00:00:00Z' },
    { id: 'demo-time-zeta-3', client_id: 'demo-client-zeta', organization_id: 'demo-org-001', hours: 8, date: '2026-03-03', team_member: 'Jennifer Wu', description: 'Kubernetes deployment', billable: true, source: 'manual', created_at: '2026-03-03T00:00:00Z' },
    { id: 'demo-time-zeta-4', client_id: 'demo-client-zeta', organization_id: 'demo-org-001', hours: 6, date: '2026-03-04', team_member: 'Omar Hassan', description: 'Monitoring setup - Prometheus', billable: true, source: 'manual', created_at: '2026-03-04T00:00:00Z' },
    { id: 'demo-time-zeta-5', client_id: 'demo-client-zeta', organization_id: 'demo-org-001', hours: 7, date: '2026-03-05', team_member: 'Jennifer Wu', description: 'Grafana dashboards', billable: true, source: 'manual', created_at: '2026-03-05T00:00:00Z' },
    { id: 'demo-time-zeta-6', client_id: 'demo-client-zeta', organization_id: 'demo-org-001', hours: 6, date: '2026-03-06', team_member: 'Omar Hassan', description: 'Auto-scaling configuration', billable: true, source: 'manual', created_at: '2026-03-06T00:00:00Z' },
    { id: 'demo-time-zeta-7', client_id: 'demo-client-zeta', organization_id: 'demo-org-001', hours: 5, date: '2026-03-07', team_member: 'Jennifer Wu', description: 'Load balancer setup', billable: true, source: 'manual', created_at: '2026-03-07T00:00:00Z' },
    { id: 'demo-time-zeta-8', client_id: 'demo-client-zeta', organization_id: 'demo-org-001', hours: 6, date: '2026-03-08', team_member: 'Omar Hassan', description: 'Security groups configuration', billable: true, source: 'manual', created_at: '2026-03-08T00:00:00Z' },
    { id: 'demo-time-zeta-9', client_id: 'demo-client-zeta', organization_id: 'demo-org-001', hours: 5, date: '2026-03-09', team_member: 'Jennifer Wu', description: 'Backup automation', billable: true, source: 'manual', created_at: '2026-03-09T00:00:00Z' },
    { id: 'demo-time-zeta-10', client_id: 'demo-client-zeta', organization_id: 'demo-org-001', hours: 6, date: '2026-03-10', team_member: 'Omar Hassan', description: 'Documentation and handoff', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },

    // StartupHub Accelerator - March (within limit: 38 hours vs 40)
    { id: 'demo-time-eta-1', client_id: 'demo-client-eta', organization_id: 'demo-org-001', hours: 5, date: '2026-03-01', team_member: 'Chris Taylor', description: 'MVP wireframing', billable: true, source: 'manual', created_at: '2026-03-01T00:00:00Z' },
    { id: 'demo-time-eta-2', client_id: 'demo-client-eta', organization_id: 'demo-org-001', hours: 4, date: '2026-03-02', team_member: 'Chris Taylor', description: 'Product strategy session', billable: true, source: 'manual', created_at: '2026-03-02T00:00:00Z' },
    { id: 'demo-time-eta-3', client_id: 'demo-client-eta', organization_id: 'demo-org-001', hours: 6, date: '2026-03-03', team_member: 'Sophia Brown', description: 'UI design', billable: true, source: 'manual', created_at: '2026-03-03T00:00:00Z' },
    { id: 'demo-time-eta-4', client_id: 'demo-client-eta', organization_id: 'demo-org-001', hours: 4, date: '2026-03-04', team_member: 'Chris Taylor', description: 'Frontend development', billable: true, source: 'manual', created_at: '2026-03-04T00:00:00Z' },
    { id: 'demo-time-eta-5', client_id: 'demo-client-eta', organization_id: 'demo-org-001', hours: 5, date: '2026-03-05', team_member: 'Sophia Brown', description: 'Backend API setup', billable: true, source: 'manual', created_at: '2026-03-05T00:00:00Z' },
    { id: 'demo-time-eta-6', client_id: 'demo-client-eta', organization_id: 'demo-org-001', hours: 3, date: '2026-03-06', team_member: 'Chris Taylor', description: 'User flow optimization', billable: true, source: 'manual', created_at: '2026-03-06T00:00:00Z' },
    { id: 'demo-time-eta-7', client_id: 'demo-client-eta', organization_id: 'demo-org-001', hours: 4, date: '2026-03-07', team_member: 'Sophia Brown', description: 'Database design', billable: true, source: 'manual', created_at: '2026-03-07T00:00:00Z' },
    { id: 'demo-time-eta-8', client_id: 'demo-client-eta', organization_id: 'demo-org-001', hours: 4, date: '2026-03-09', team_member: 'Chris Taylor', description: 'Product consulting call', billable: true, source: 'manual', created_at: '2026-03-09T00:00:00Z' },
    { id: 'demo-time-eta-9', client_id: 'demo-client-eta', organization_id: 'demo-org-001', hours: 3, date: '2026-03-10', team_member: 'Sophia Brown', description: 'Testing and feedback', billable: true, source: 'manual', created_at: '2026-03-10T00:00:00Z' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function isClient(): boolean {
    return typeof window !== 'undefined';
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
    if (!isClient()) return defaultValue;
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error(`Error loading ${key} from localStorage:`, e);
    }
    return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
    if (!isClient()) return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error saving ${key} to localStorage:`, e);
    }
}

// ============================================
// DATA STORE SINGLETON
// ============================================

class DataStoreManager {
    private static instance: DataStoreManager;
    private store: DataStore;
    private isDemoMode: boolean = false;
    private initialized: boolean = false;

    private constructor() {
        this.store = {
            organization: null,
            settings: null,
            clients: [],
            contracts: [],
            invoices: [],
            timeEntries: [],
            alerts: [],
        };
    }

    static getInstance(): DataStoreManager {
        if (!DataStoreManager.instance) {
            DataStoreManager.instance = new DataStoreManager();
        }
        return DataStoreManager.instance;
    }

    // Initialize from localStorage (call on app load)
    initialize(): void {
        if (this.initialized || !isClient()) return;

        this.isDemoMode = loadFromStorage(STORAGE_KEYS.DEMO_MODE, false);

        if (this.isDemoMode) {
            this.loadDemoData();
        } else {
            const savedStore = loadFromStorage<DataStore | null>(STORAGE_KEYS.STORE, null);
            if (savedStore) {
                this.store = savedStore;
            }
        }

        this.initialized = true;
    }

    private loadDemoData(): void {
        this.store = {
            organization: DEMO_ORGANIZATION,
            settings: DEMO_SETTINGS,
            clients: [...DEMO_CLIENTS],
            contracts: [...DEMO_CONTRACTS],
            invoices: [...DEMO_INVOICES],
            timeEntries: [...DEMO_TIME_ENTRIES],
            alerts: [],
        };
    }

    private persist(): void {
        if (this.isDemoMode) return;
        saveToStorage(STORAGE_KEYS.STORE, this.store);
    }

    // ============================================
    // DEMO MODE
    // ============================================

    enableDemoMode(): void {
        this.isDemoMode = true;
        saveToStorage(STORAGE_KEYS.DEMO_MODE, true);
        this.loadDemoData();
    }

    disableDemoMode(): void {
        this.isDemoMode = false;
        saveToStorage(STORAGE_KEYS.DEMO_MODE, false);

        // Load real data from storage or reset to empty
        const savedStore = loadFromStorage<DataStore | null>(STORAGE_KEYS.STORE, null);
        if (savedStore) {
            this.store = savedStore;
        } else {
            this.reset();
        }
    }

    isDemoModeEnabled(): boolean {
        if (!this.initialized && isClient()) {
            this.initialize();
        }
        return this.isDemoMode;
    }

    // ============================================
    // GETTERS
    // ============================================

    getOrganization(): Organization | null {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.organization;
    }

    getSettings(): FinancialSettings | null {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.settings;
    }

    getClients(): Client[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.clients;
    }

    getClientById(id: string): Client | undefined {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.clients.find(c => c.id === id);
    }

    getActiveClients(): Client[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.clients.filter(c => c.status === 'active');
    }

    getContracts(): Contract[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.contracts;
    }

    getContractByClientId(clientId: string): Contract | undefined {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.contracts.find(c => c.client_id === clientId && c.status === 'active');
    }

    getInvoices(): Invoice[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.invoices;
    }

    getInvoiceById(id: string): Invoice | undefined {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.invoices.find(i => i.id === id);
    }

    getInvoicesByClientId(clientId: string): Invoice[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.invoices.filter(i => i.client_id === clientId);
    }

    getTimeEntries(): TimeEntry[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.timeEntries;
    }

    getTimeEntryById(id: string): TimeEntry | undefined {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.timeEntries.find(t => t.id === id);
    }

    getTimeEntriesByClientId(clientId: string): TimeEntry[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.timeEntries.filter(t => t.client_id === clientId);
    }

    getTimeEntriesByDateRange(startDate: string, endDate: string): TimeEntry[] {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.timeEntries.filter(t => t.date >= startDate && t.date <= endDate);
    }

    getFullStore(): DataStore {
        if (!this.initialized && isClient()) this.initialize();
        return { ...this.store };
    }

    // ============================================
    // ORGANIZATION
    // ============================================

    setOrganization(org: Organization): void {
        this.store.organization = org;
        this.isDemoMode = org.demo_mode;
        this.persist();
    }

    createOrganization(name: string): Organization {
        const org: Organization = {
            id: generateId('org'),
            name,
            created_at: new Date().toISOString(),
            demo_mode: false,
        };
        this.store.organization = org;
        this.persist();
        return org;
    }

    // ============================================
    // SETTINGS
    // ============================================

    setSettings(settings: FinancialSettings): void {
        this.store.settings = settings;
        this.persist();
    }

    createSettings(orgId: string, overrides?: Partial<FinancialSettings>): FinancialSettings {
        const settings: FinancialSettings = {
            id: generateId('settings'),
            organization_id: orgId,
            ...EMPTY_FINANCIAL_SETTINGS,
            ...overrides,
            updated_at: new Date().toISOString(),
        };
        this.store.settings = settings;
        this.persist();
        return settings;
    }

    updateSettings(updates: Partial<FinancialSettings>): void {
        if (this.store.settings) {
            this.store.settings = {
                ...this.store.settings,
                ...updates,
                updated_at: new Date().toISOString(),
            };
            this.persist();
        }
    }

    // ============================================
    // CLIENTS
    // ============================================

    setClients(clients: Client[]): void {
        this.store.clients = clients;
        this.persist();
    }

    addClient(client: Client): void {
        // Ensure we're initialized
        if (!this.initialized && isClient()) this.initialize();

        this.store.clients.push(client);
        this.persist();
    }

    createClient(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Client {
        const now = new Date().toISOString();
        const client: Client = {
            ...data,
            id: generateId('client'),
            created_at: now,
            updated_at: now,
        };
        this.store.clients.push(client);
        this.persist();
        return client;
    }

    updateClient(clientId: string, updates: Partial<Client>): Client | null {
        const index = this.store.clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
            this.store.clients[index] = {
                ...this.store.clients[index],
                ...updates,
                updated_at: new Date().toISOString(),
            };
            this.persist();
            return this.store.clients[index];
        }
        return null;
    }

    deleteClient(clientId: string): boolean {
        const initialLength = this.store.clients.length;
        this.store.clients = this.store.clients.filter(c => c.id !== clientId);
        // Also remove related data
        this.store.contracts = this.store.contracts.filter(c => c.client_id !== clientId);
        this.store.invoices = this.store.invoices.filter(i => i.client_id !== clientId);
        this.store.timeEntries = this.store.timeEntries.filter(t => t.client_id !== clientId);
        this.persist();
        return this.store.clients.length < initialLength;
    }

    // ============================================
    // CONTRACTS
    // ============================================

    setContracts(contracts: Contract[]): void {
        this.store.contracts = contracts;
        this.persist();
    }

    addContract(contract: Contract): void {
        this.store.contracts.push(contract);
        this.persist();
    }

    createContract(data: Omit<Contract, 'id' | 'created_at'>): Contract {
        const contract: Contract = {
            ...data,
            id: generateId('contract'),
            created_at: new Date().toISOString(),
        };
        this.store.contracts.push(contract);
        this.persist();
        return contract;
    }

    updateContract(contractId: string, updates: Partial<Contract>): Contract | null {
        const index = this.store.contracts.findIndex(c => c.id === contractId);
        if (index !== -1) {
            this.store.contracts[index] = {
                ...this.store.contracts[index],
                ...updates,
            };
            this.persist();
            return this.store.contracts[index];
        }
        return null;
    }

    // ============================================
    // INVOICES
    // ============================================

    setInvoices(invoices: Invoice[]): void {
        this.store.invoices = invoices;
        this.persist();
    }

    addInvoice(invoice: Invoice): void {
        this.store.invoices.push(invoice);
        this.persist();
    }

    createInvoice(data: Omit<Invoice, 'id' | 'created_at'>): Invoice {
        const invoice: Invoice = {
            ...data,
            id: generateId('invoice'),
            created_at: new Date().toISOString(),
        };
        this.store.invoices.push(invoice);
        this.persist();
        return invoice;
    }

    updateInvoice(invoiceId: string, updates: Partial<Invoice>): Invoice | null {
        const index = this.store.invoices.findIndex(i => i.id === invoiceId);
        if (index !== -1) {
            this.store.invoices[index] = {
                ...this.store.invoices[index],
                ...updates,
            };
            this.persist();
            return this.store.invoices[index];
        }
        return null;
    }

    deleteInvoice(invoiceId: string): boolean {
        const initialLength = this.store.invoices.length;
        this.store.invoices = this.store.invoices.filter(i => i.id !== invoiceId);
        this.persist();
        return this.store.invoices.length < initialLength;
    }

    markInvoicePaid(invoiceId: string, paidDate?: string): Invoice | null {
        return this.updateInvoice(invoiceId, {
            status: 'paid',
            paid_date: paidDate || new Date().toISOString().split('T')[0],
        });
    }

    // ============================================
    // TIME ENTRIES
    // ============================================

    setTimeEntries(entries: TimeEntry[]): void {
        this.store.timeEntries = entries;
        this.persist();
    }

    addTimeEntry(entry: TimeEntry): void {
        this.store.timeEntries.push(entry);
        this.persist();
    }

    createTimeEntry(data: Omit<TimeEntry, 'id' | 'created_at'>): TimeEntry {
        const entry: TimeEntry = {
            ...data,
            id: generateId('time'),
            created_at: new Date().toISOString(),
        };
        this.store.timeEntries.push(entry);
        this.persist();
        return entry;
    }

    addTimeEntries(entries: Omit<TimeEntry, 'id' | 'created_at'>[]): TimeEntry[] {
        const now = new Date().toISOString();
        const newEntries = entries.map((data, index) => ({
            ...data,
            id: generateId(`time-${index}`),
            created_at: now,
        }));
        this.store.timeEntries.push(...newEntries);
        this.persist();
        return newEntries;
    }

    updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): TimeEntry | null {
        const index = this.store.timeEntries.findIndex(t => t.id === entryId);
        if (index !== -1) {
            this.store.timeEntries[index] = {
                ...this.store.timeEntries[index],
                ...updates,
            };
            this.persist();
            return this.store.timeEntries[index];
        }
        return null;
    }

    deleteTimeEntry(entryId: string): boolean {
        const initialLength = this.store.timeEntries.length;
        this.store.timeEntries = this.store.timeEntries.filter(t => t.id !== entryId);
        this.persist();
        return this.store.timeEntries.length < initialLength;
    }

    deleteTimeEntries(entryIds: string[]): number {
        const initialLength = this.store.timeEntries.length;
        this.store.timeEntries = this.store.timeEntries.filter(t => !entryIds.includes(t.id));
        this.persist();
        return initialLength - this.store.timeEntries.length;
    }

    // ============================================
    // HELPERS & UTILITIES
    // ============================================

    hasData(): boolean {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.clients.length > 0;
    }

    hasSettings(): boolean {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.settings !== null;
    }

    hasInvoices(): boolean {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.invoices.length > 0;
    }

    hasTimeEntries(): boolean {
        if (!this.initialized && isClient()) this.initialize();
        return this.store.timeEntries.length > 0;
    }

    reset(): void {
        this.isDemoMode = false;
        this.store = {
            organization: null,
            settings: null,
            clients: [],
            contracts: [],
            invoices: [],
            timeEntries: [],
            alerts: [],
        };
        if (isClient()) {
            localStorage.removeItem(STORAGE_KEYS.STORE);
            localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
        }
    }

    // Get stats for a specific month
    getMonthlyStats(year: number, month: number): { hours: number; revenue: number; invoiceCount: number } {
        if (!this.initialized && isClient()) this.initialize();

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

        const monthEntries = this.store.timeEntries.filter(
            t => t.date >= startDate && t.date <= endDate
        );
        const monthInvoices = this.store.invoices.filter(
            i => i.issue_date >= startDate && i.issue_date <= endDate
        );

        return {
            hours: monthEntries.reduce((sum, t) => sum + t.hours, 0),
            revenue: monthInvoices.reduce((sum, i) => sum + i.amount, 0),
            invoiceCount: monthInvoices.length,
        };
    }
}

// Export singleton instance
export const dataStore = DataStoreManager.getInstance();

// Export for backwards compatibility during migration
export function getDataStore(): DataStoreManager {
    return DataStoreManager.getInstance();
}
