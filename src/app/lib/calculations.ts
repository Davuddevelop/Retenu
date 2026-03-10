// src/app/lib/calculations.ts
// Pure server-side calculation functions - NO hardcoded values

import {
    Client,
    Contract,
    Invoice,
    TimeEntry,
    FinancialSettings,
    ClientMetrics,
    RevenueAlert,
    AlertType,
    AlertSeverity,
    DashboardMetrics,
    EMPTY_DASHBOARD_METRICS,
} from './types';
import { isBefore, parseISO, differenceInDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// ============================================
// HELPER FUNCTIONS
// ============================================

function safeDiv(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return numerator / denominator;
}

function clampPercent(value: number): number {
    // Prevent impossible percentages
    return Math.max(-100, Math.min(value, 1000));
}

function validatePositive(value: number, fieldName: string): number {
    if (value < 0) {
        console.warn(`Invalid negative value for ${fieldName}: ${value}`);
        return 0;
    }
    return value;
}

// ============================================
// RATE RESOLUTION
// ============================================

export function getClientHourlyRate(
    client: Client,
    contract: Contract | null,
    settings: FinancialSettings
): number {
    // Priority: Client override > Contract rate > Org default
    if (client.custom_hourly_rate !== null && client.custom_hourly_rate !== undefined) {
        return client.custom_hourly_rate;
    }
    if (contract?.internal_hourly_rate) {
        return contract.internal_hourly_rate;
    }
    return settings.default_internal_hourly_rate;
}

export function getClientCostRate(
    client: Client,
    contract: Contract | null,
    settings: FinancialSettings
): number {
    // Priority: Client override > Contract rate > Org default
    if (client.custom_cost_rate !== null && client.custom_cost_rate !== undefined) {
        return client.custom_cost_rate;
    }
    if (contract?.internal_cost_rate) {
        return contract.internal_cost_rate;
    }
    return settings.default_internal_cost_rate;
}

export function getClientMarginThreshold(
    client: Client,
    settings: FinancialSettings
): number {
    // Priority: Client override > Org default
    if (client.custom_margin_threshold !== null) {
        return client.custom_margin_threshold;
    }
    return settings.margin_warning_threshold_percent;
}

// ============================================
// CLIENT METRICS CALCULATIONS
// ============================================

export function calculateClientRevenue(
    client: Client,
    invoices: Invoice[],
    periodStart: Date,
    periodEnd: Date
): { billed: number; retainer: number; total: number } {
    const clientInvoices = invoices.filter(inv =>
        inv.client_id === client.id &&
        inv.status !== 'cancelled' &&
        inv.status !== 'draft' &&
        isWithinInterval(parseISO(inv.issue_date), { start: periodStart, end: periodEnd })
    );

    const billed = clientInvoices.reduce((sum, inv) => sum + validatePositive(inv.amount, 'invoice amount'), 0);
    const retainer = validatePositive(client.agreed_monthly_retainer, 'retainer');

    // Revenue is the higher of billed amount or retainer (what they should have earned)
    const total = Math.max(billed, retainer);

    return { billed, retainer, total };
}

export function calculateClientCosts(
    client: Client,
    contract: Contract | null,
    timeEntries: TimeEntry[],
    settings: FinancialSettings,
    periodStart: Date,
    periodEnd: Date
): { totalCost: number; totalHours: number; billableHours: number } {
    const clientEntries = timeEntries.filter(entry =>
        entry.client_id === client.id &&
        isWithinInterval(parseISO(entry.date), { start: periodStart, end: periodEnd })
    );

    const costRate = getClientCostRate(client, contract, settings);

    const totalHours = clientEntries.reduce((sum, entry) => sum + validatePositive(entry.hours, 'hours'), 0);
    const billableHours = clientEntries
        .filter(entry => entry.billable)
        .reduce((sum, entry) => sum + validatePositive(entry.hours, 'hours'), 0);

    const totalCost = totalHours * costRate;

    return { totalCost, totalHours, billableHours };
}

export function calculateClientMargin(
    revenue: number,
    cost: number
): { grossMargin: number; marginPercent: number } {
    const grossMargin = revenue - cost;
    const marginPercent = clampPercent(safeDiv(grossMargin, revenue) * 100);

    return { grossMargin, marginPercent };
}

// ============================================
// LEAKAGE DETECTION
// ============================================

export function calculateUnderbilling(
    client: Client,
    contract: Contract | null,
    timeEntries: TimeEntry[],
    invoices: Invoice[],
    settings: FinancialSettings,
    periodStart: Date,
    periodEnd: Date
): number {
    const hourlyRate = getClientHourlyRate(client, contract, settings);
    const { billableHours } = calculateClientCosts(client, contract, timeEntries, settings, periodStart, periodEnd);
    const { billed } = calculateClientRevenue(client, invoices, periodStart, periodEnd);

    const expectedRevenue = billableHours * hourlyRate;
    const actualRevenue = Math.max(billed, client.agreed_monthly_retainer);

    // Only flag if underbilling exceeds threshold
    let difference = expectedRevenue - actualRevenue;

    // Prevent double-counting: If there's an hour limit, excess hours are "Scope Creep", not general underbilling.
    // Subtract the scope creep value from the underbilling difference if it exists.
    if (client.hour_limit !== null && billableHours > client.hour_limit) {
        const excessHours = billableHours - client.hour_limit;
        difference -= (excessHours * hourlyRate);
    }
    const thresholdAmount = actualRevenue * (settings.underbilling_threshold_percent / 100);

    if (difference > thresholdAmount && difference > 0) {
        return difference;
    }
    return 0;
}

export function calculateScopeCreep(
    client: Client,
    contract: Contract | null,
    timeEntries: TimeEntry[],
    settings: FinancialSettings,
    periodStart: Date,
    periodEnd: Date
): number {
    if (client.hour_limit === null) return 0; // No limit set

    const { totalHours } = calculateClientCosts(client, contract, timeEntries, settings, periodStart, periodEnd);
    const hourlyRate = getClientHourlyRate(client, contract, settings);

    const threshold = client.hour_limit * (1 + settings.scope_creep_threshold_percent / 100);

    if (totalHours > threshold) {
        const excessHours = totalHours - client.hour_limit;
        return excessHours * hourlyRate;
    }
    return 0;
}

export function calculateMissingInvoices(
    client: Client,
    invoices: Invoice[],
    periodStart: Date,
    periodEnd: Date
): number {
    const clientInvoices = invoices.filter(inv =>
        inv.client_id === client.id &&
        inv.status !== 'cancelled' &&
        isWithinInterval(parseISO(inv.issue_date), { start: periodStart, end: periodEnd })
    );

    if (clientInvoices.length === 0 && client.agreed_monthly_retainer > 0) {
        return client.agreed_monthly_retainer;
    }
    return 0;
}

export function calculateLatePayments(
    client: Client,
    invoices: Invoice[],
    settings: FinancialSettings,
    now: Date
): number {
    const overdueInvoices = invoices.filter(inv =>
        inv.client_id === client.id &&
        (inv.status === 'pending' || inv.status === 'overdue') &&
        differenceInDays(now, parseISO(inv.due_date)) > settings.late_payment_days_threshold
    );

    return overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
}

// ============================================
// FULL CLIENT METRICS
// ============================================

export function calculateClientMetrics(
    client: Client,
    contract: Contract | null,
    invoices: Invoice[],
    timeEntries: TimeEntry[],
    settings: FinancialSettings,
    periodStart: Date,
    periodEnd: Date
): ClientMetrics {
    const revenue = calculateClientRevenue(client, invoices, periodStart, periodEnd);
    const costs = calculateClientCosts(client, contract, timeEntries, settings, periodStart, periodEnd);
    const margin = calculateClientMargin(revenue.total, costs.totalCost);

    const underbilling = calculateUnderbilling(client, contract, timeEntries, invoices, settings, periodStart, periodEnd);
    const scopeCreep = calculateScopeCreep(client, contract, timeEntries, settings, periodStart, periodEnd);
    const missingInvoices = calculateMissingInvoices(client, invoices, periodStart, periodEnd);
    const latePayments = calculateLatePayments(client, invoices, settings, new Date());

    const totalLeakage = underbilling + scopeCreep + missingInvoices + latePayments;

    return {
        client_id: client.id,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        total_revenue: revenue.total,
        billed_revenue: revenue.billed,
        retainer_revenue: revenue.retainer,
        total_cost: costs.totalCost,
        total_hours: costs.totalHours,
        billable_hours: costs.billableHours,
        gross_margin: margin.grossMargin,
        margin_percent: margin.marginPercent,
        estimated_leakage: totalLeakage,
        leakage_breakdown: {
            underbilling,
            scope_creep: scopeCreep,
            missing_invoices: missingInvoices,
            late_payments: latePayments,
        },
    };
}

// ============================================
// ALERT GENERATION
// ============================================

function calculateAlertSeverity(alertType: AlertType, leakage: number, retainer: number): AlertSeverity {
    const leakagePercent = retainer > 0 ? (leakage / retainer) * 100 : 0;

    // Critical: negative margin or very high leakage (>50% of retainer)
    if (alertType === 'negative_margin') return 'critical';
    if (leakagePercent > 50) return 'critical';

    // High: significant leakage (>25% of retainer)
    if (leakagePercent > 25) return 'high';
    if (alertType === 'late_payment' && leakage > 1000) return 'high';

    // Medium: moderate leakage (>10% of retainer)
    if (leakagePercent > 10) return 'medium';
    if (alertType === 'low_margin') return 'medium';

    // Low: minor issues
    return 'low';
}

export function generateClientAlerts(
    client: Client,
    metrics: ClientMetrics,
    settings: FinancialSettings,
    organizationId: string
): RevenueAlert[] {
    const alerts: RevenueAlert[] = [];
    const now = new Date().toISOString();
    const marginThreshold = getClientMarginThreshold(client, settings);
    const retainer = client.agreed_monthly_retainer;

    // Underbilling Alert
    if (metrics.leakage_breakdown.underbilling > 0) {
        alerts.push({
            id: `underbilling-${client.id}-${Date.now()}`,
            client_id: client.id,
            organization_id: organizationId,
            alert_type: 'underbilling',
            severity: calculateAlertSeverity('underbilling', metrics.leakage_breakdown.underbilling, retainer),
            estimated_leakage: metrics.leakage_breakdown.underbilling,
            message: `${client.name} is underbilled based on hours worked.`,
            details: `Expected revenue based on ${metrics.billable_hours} billable hours exceeds actual billing by $${metrics.leakage_breakdown.underbilling.toFixed(2)}.`,
            status: 'active',
            created_at: now,
            resolved_at: null,
        });
    }

    // Scope Creep Alert
    if (metrics.leakage_breakdown.scope_creep > 0) {
        const excessHours = client.hour_limit ? metrics.total_hours - client.hour_limit : 0;
        alerts.push({
            id: `scope_creep-${client.id}-${Date.now()}`,
            client_id: client.id,
            organization_id: organizationId,
            alert_type: 'scope_creep',
            severity: calculateAlertSeverity('scope_creep', metrics.leakage_breakdown.scope_creep, retainer),
            estimated_leakage: metrics.leakage_breakdown.scope_creep,
            message: `${client.name} exceeded scope by ${excessHours.toFixed(1)} hours.`,
            details: `Hour limit: ${client.hour_limit}h. Actual: ${metrics.total_hours.toFixed(1)}h. Unbilled value: $${metrics.leakage_breakdown.scope_creep.toFixed(2)}.`,
            status: 'active',
            created_at: now,
            resolved_at: null,
        });
    }

    // Missing Invoice Alert
    if (metrics.leakage_breakdown.missing_invoices > 0) {
        alerts.push({
            id: `missing_invoice-${client.id}-${Date.now()}`,
            client_id: client.id,
            organization_id: organizationId,
            alert_type: 'missing_invoice',
            severity: calculateAlertSeverity('missing_invoice', metrics.leakage_breakdown.missing_invoices, retainer),
            estimated_leakage: metrics.leakage_breakdown.missing_invoices,
            message: `No invoice generated for ${client.name} this period.`,
            details: `Expected retainer: $${client.agreed_monthly_retainer.toFixed(2)}.`,
            status: 'active',
            created_at: now,
            resolved_at: null,
        });
    }

    // Late Payment Alert
    if (metrics.leakage_breakdown.late_payments > 0) {
        alerts.push({
            id: `late_payment-${client.id}-${Date.now()}`,
            client_id: client.id,
            organization_id: organizationId,
            alert_type: 'late_payment',
            severity: calculateAlertSeverity('late_payment', metrics.leakage_breakdown.late_payments, retainer),
            estimated_leakage: metrics.leakage_breakdown.late_payments,
            message: `${client.name} has overdue invoices.`,
            details: `Total overdue: $${metrics.leakage_breakdown.late_payments.toFixed(2)}.`,
            status: 'active',
            created_at: now,
            resolved_at: null,
        });
    }

    // Low Margin Alert
    if (metrics.margin_percent < marginThreshold && metrics.margin_percent >= 0) {
        alerts.push({
            id: `low_margin-${client.id}-${Date.now()}`,
            client_id: client.id,
            organization_id: organizationId,
            alert_type: 'low_margin',
            severity: 'medium',
            estimated_leakage: 0, // Not direct leakage, but a warning
            message: `${client.name} margin is below target.`,
            details: `Current margin: ${metrics.margin_percent.toFixed(1)}%. Target: ${marginThreshold}%.`,
            status: 'active',
            created_at: now,
            resolved_at: null,
        });
    }

    // Negative Margin Alert
    if (metrics.margin_percent < 0) {
        alerts.push({
            id: `negative_margin-${client.id}-${Date.now()}`,
            client_id: client.id,
            organization_id: organizationId,
            alert_type: 'negative_margin',
            severity: 'critical',
            estimated_leakage: Math.abs(metrics.gross_margin),
            message: `${client.name} is unprofitable.`,
            details: `Margin: ${metrics.margin_percent.toFixed(1)}%. Loss: $${Math.abs(metrics.gross_margin).toFixed(2)}.`,
            status: 'active',
            created_at: now,
            resolved_at: null,
        });
    }

    return alerts;
}

// ============================================
// DASHBOARD METRICS
// ============================================

export function calculateDashboardMetrics(
    clients: Client[],
    contracts: Contract[],
    invoices: Invoice[],
    timeEntries: TimeEntry[],
    settings: FinancialSettings,
    organizationId: string,
    periodStart?: Date,
    periodEnd?: Date
): DashboardMetrics {
    // If no clients, return empty metrics
    if (clients.length === 0) {
        return {
            ...EMPTY_DASHBOARD_METRICS,
            period_start: (periodStart || startOfMonth(new Date())).toISOString(),
            period_end: (periodEnd || endOfMonth(new Date())).toISOString(),
        };
    }

    const start = periodStart || startOfMonth(new Date());
    const end = periodEnd || endOfMonth(new Date());
    const now = new Date();

    let totalRevenue = 0;
    let totalCost = 0;
    let totalLeakage = 0;
    const leakageByType: Record<AlertType, number> = {
        underbilling: 0,
        scope_creep: 0,
        missing_invoice: 0,
        late_payment: 0,
        low_margin: 0,
        negative_margin: 0,
    };
    const alertsByType: Record<AlertType, number> = {
        underbilling: 0,
        scope_creep: 0,
        missing_invoice: 0,
        late_payment: 0,
        low_margin: 0,
        negative_margin: 0,
    };

    const allAlerts: RevenueAlert[] = [];
    let clientsAtRisk = 0;
    let healthyClients = 0;

    // Calculate metrics for each client
    const activeClients = clients.filter(c => c.status === 'active');

    activeClients.forEach(client => {
        const contract = contracts.find(c => c.client_id === client.id && c.status === 'active') || null;
        const metrics = calculateClientMetrics(client, contract, invoices, timeEntries, settings, start, end);
        const alerts = generateClientAlerts(client, metrics, settings, organizationId);

        totalRevenue += metrics.total_revenue;
        totalCost += metrics.total_cost;
        totalLeakage += metrics.estimated_leakage;

        // Aggregate leakage by type
        leakageByType.underbilling += metrics.leakage_breakdown.underbilling;
        leakageByType.scope_creep += metrics.leakage_breakdown.scope_creep;
        leakageByType.missing_invoice += metrics.leakage_breakdown.missing_invoices;
        leakageByType.late_payment += metrics.leakage_breakdown.late_payments;

        // Count alerts by type
        alerts.forEach(alert => {
            alertsByType[alert.alert_type]++;
            if (alert.alert_type === 'negative_margin') {
                leakageByType.negative_margin += alert.estimated_leakage;
            }
        });

        allAlerts.push(...alerts);

        // Client health classification
        if (alerts.length > 0) {
            clientsAtRisk++;
        } else {
            healthyClients++;
        }
    });

    // Invoice totals
    const periodInvoices = invoices.filter(inv =>
        inv.status !== 'cancelled' &&
        inv.status !== 'draft' &&
        isWithinInterval(parseISO(inv.issue_date), { start, end })
    );

    const totalInvoiced = periodInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = periodInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);
    const totalUnpaid = periodInvoices
        .filter(inv => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0);
    const totalOverdue = periodInvoices
        .filter(inv => inv.status === 'overdue' || (inv.status === 'pending' && isBefore(parseISO(inv.due_date), now)))
        .reduce((sum, inv) => sum + inv.amount, 0);

    const { grossMargin, marginPercent } = calculateClientMargin(totalRevenue, totalCost);

    return {
        period_start: start.toISOString(),
        period_end: end.toISOString(),
        total_revenue: totalRevenue,
        total_cost: totalCost,
        total_margin: grossMargin,
        margin_percent: marginPercent,
        total_estimated_leakage: totalLeakage,
        leakage_by_type: leakageByType,
        total_invoiced: totalInvoiced,
        total_paid: totalPaid,
        total_unpaid: totalUnpaid,
        total_overdue: totalOverdue,
        total_clients: activeClients.length,
        clients_at_risk: clientsAtRisk,
        healthy_clients: healthyClients,
        active_alerts: allAlerts.filter(a => a.status === 'active'),
        alerts_by_type: alertsByType,
    };
}
