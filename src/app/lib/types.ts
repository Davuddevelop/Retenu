// src/app/lib/types.ts

// ============================================
// ORGANIZATION & SETTINGS
// ============================================

export type Organization = {
    id: string;
    name: string;
    created_at: string;
    demo_mode: boolean;
};

export type FinancialSettings = {
    id: string;
    organization_id: string;
    // Cost & Rate Settings
    default_internal_hourly_rate: number;
    default_internal_cost_rate: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
    // Alert Thresholds
    margin_warning_threshold_percent: number; // e.g., 25 = alert when margin < 25%
    scope_creep_threshold_percent: number; // e.g., 10 = alert when hours exceed limit by 10%
    underbilling_threshold_percent: number; // e.g., 15 = alert when underbilled by > 15%
    late_payment_days_threshold: number; // e.g., 7 = alert after 7 days overdue
    // Updated timestamp
    updated_at: string;
};

// ============================================
// CLIENT & CONTRACT
// ============================================

export type Client = {
    id: string;
    organization_id: string;
    name: string;
    // Financial configuration
    agreed_monthly_retainer: number;
    agreed_deliverables: string;
    hour_limit: number | null; // null = unlimited
    // Client-specific overrides (null = use org defaults)
    custom_hourly_rate: number | null;
    custom_cost_rate: number | null;
    custom_margin_threshold: number | null;
    // Metadata
    start_date: string;
    status: 'active' | 'inactive' | 'paused' | 'churned';
    created_at: string;
    updated_at: string;
};

export type Contract = {
    id: string;
    client_id: string;
    organization_id: string;
    // Rate configuration
    internal_hourly_rate: number;
    internal_cost_rate: number;
    // Contract details
    start_date: string;
    end_date: string | null;
    status: 'active' | 'inactive' | 'expired';
    created_at: string;
};

// ============================================
// FINANCIAL DATA
// ============================================

export type Invoice = {
    id: string;
    client_id: string;
    organization_id: string;
    amount: number;
    status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
    issue_date: string;
    due_date: string;
    paid_date: string | null;
    stripe_invoice_id: string | null;
    created_at: string;
};

export type TimeEntry = {
    id: string;
    client_id: string;
    organization_id: string;
    hours: number;
    date: string;
    team_member: string;
    description: string;
    billable: boolean;
    created_at: string;
    external_id?: string;
    source?: 'manual' | 'toggl' | 'clockify';
};

// ============================================
// ALERTS & ANALYTICS
// ============================================

export type AlertType =
    | 'underbilling'
    | 'scope_creep'
    | 'missing_invoice'
    | 'late_payment'
    | 'low_margin'
    | 'negative_margin';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export type RevenueAlert = {
    id: string;
    client_id: string;
    organization_id: string;
    alert_type: AlertType;
    severity: AlertSeverity;
    estimated_leakage: number;
    message: string;
    details: string;
    status: 'active' | 'resolved' | 'ignored';
    created_at: string;
    resolved_at: string | null;
};

// ============================================
// CALCULATED METRICS (Not stored, computed)
// ============================================

export type ClientMetrics = {
    client_id: string;
    period_start: string;
    period_end: string;
    // Revenue
    total_revenue: number;
    billed_revenue: number;
    retainer_revenue: number;
    // Costs
    total_cost: number;
    total_hours: number;
    billable_hours: number;
    // Margin
    gross_margin: number;
    margin_percent: number;
    // Leakage
    estimated_leakage: number;
    leakage_breakdown: {
        underbilling: number;
        scope_creep: number;
        missing_invoices: number;
        late_payments: number;
    };
};

export type DashboardMetrics = {
    period_start: string;
    period_end: string;
    // Totals
    total_revenue: number;
    total_cost: number;
    total_margin: number;
    margin_percent: number;
    // Leakage
    total_estimated_leakage: number;
    leakage_by_type: Record<AlertType, number>;
    // Invoices
    total_invoiced: number;
    total_paid: number;
    total_unpaid: number;
    total_overdue: number;
    // Clients
    total_clients: number;
    clients_at_risk: number;
    healthy_clients: number;
    // Alerts
    active_alerts: RevenueAlert[];
    alerts_by_type: Record<AlertType, number>;
};

// ============================================
// DATA STORE STATE
// ============================================

export type DataStore = {
    organization: Organization | null;
    settings: FinancialSettings | null;
    clients: Client[];
    contracts: Contract[];
    invoices: Invoice[];
    timeEntries: TimeEntry[];
    alerts: RevenueAlert[];
};

// ============================================
// EMPTY STATE HELPERS
// ============================================

export const EMPTY_FINANCIAL_SETTINGS: Omit<FinancialSettings, 'id' | 'organization_id' | 'updated_at'> = {
    default_internal_hourly_rate: 150,
    default_internal_cost_rate: 60,
    currency: 'USD',
    margin_warning_threshold_percent: 25,
    scope_creep_threshold_percent: 10,
    underbilling_threshold_percent: 15,
    late_payment_days_threshold: 7,
};

export const EMPTY_DASHBOARD_METRICS: DashboardMetrics = {
    period_start: '',
    period_end: '',
    total_revenue: 0,
    total_cost: 0,
    total_margin: 0,
    margin_percent: 0,
    total_estimated_leakage: 0,
    leakage_by_type: {
        underbilling: 0,
        scope_creep: 0,
        missing_invoice: 0,
        late_payment: 0,
        low_margin: 0,
        negative_margin: 0,
    },
    total_invoiced: 0,
    total_paid: 0,
    total_unpaid: 0,
    total_overdue: 0,
    total_clients: 0,
    clients_at_risk: 0,
    healthy_clients: 0,
    active_alerts: [],
    alerts_by_type: {
        underbilling: 0,
        scope_creep: 0,
        missing_invoice: 0,
        late_payment: 0,
        low_margin: 0,
        negative_margin: 0,
    },
};
