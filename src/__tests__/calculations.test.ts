// src/__tests__/calculations.test.ts
import {
    getClientHourlyRate,
    getClientCostRate,
    getClientMarginThreshold,
    calculateClientRevenue,
    calculateClientCosts,
    calculateClientMargin,
} from '../app/lib/calculations';
import { Client, Contract, Invoice, TimeEntry, FinancialSettings } from '../app/lib/types';

// Mock data factories
const createMockSettings = (overrides?: Partial<FinancialSettings>): FinancialSettings => ({
    id: 'settings-1',
    organization_id: 'org-1',
    default_internal_hourly_rate: 150,
    default_internal_cost_rate: 75,
    currency: 'USD',
    margin_warning_threshold_percent: 25,
    scope_creep_threshold_percent: 10,
    underbilling_threshold_percent: 15,
    late_payment_days_threshold: 7,
    updated_at: new Date().toISOString(),
    ...overrides,
});

const createMockClient = (overrides?: Partial<Client>): Client => ({
    id: 'client-1',
    organization_id: 'org-1',
    name: 'Test Client',
    agreed_monthly_retainer: 5000,
    agreed_deliverables: 'Web development',
    hour_limit: 40,
    custom_hourly_rate: null,
    custom_cost_rate: null,
    custom_margin_threshold: null,
    start_date: '2024-01-01',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
});

const createMockContract = (overrides?: Partial<Contract>): Contract => ({
    id: 'contract-1',
    client_id: 'client-1',
    organization_id: 'org-1',
    internal_hourly_rate: 175,
    internal_cost_rate: 85,
    start_date: '2024-01-01',
    end_date: null,
    status: 'active',
    created_at: new Date().toISOString(),
    ...overrides,
});

const createMockInvoice = (overrides?: Partial<Invoice>): Invoice => ({
    id: 'invoice-1',
    client_id: 'client-1',
    organization_id: 'org-1',
    amount: 5000,
    status: 'paid',
    issue_date: '2024-03-15',
    due_date: '2024-04-15',
    paid_date: '2024-03-20',
    created_at: new Date().toISOString(),
    ...overrides,
});

const createMockTimeEntry = (overrides?: Partial<TimeEntry>): TimeEntry => ({
    id: 'entry-1',
    client_id: 'client-1',
    organization_id: 'org-1',
    hours: 8,
    date: '2024-03-15',
    team_member: 'John Doe',
    description: 'Development work',
    billable: true,
    external_id: null,
    source: 'manual',
    created_at: new Date().toISOString(),
    ...overrides,
});

describe('Rate Resolution Functions', () => {
    describe('getClientHourlyRate', () => {
        it('returns client custom rate when set', () => {
            const client = createMockClient({ custom_hourly_rate: 200 });
            const contract = createMockContract();
            const settings = createMockSettings();

            expect(getClientHourlyRate(client, contract, settings)).toBe(200);
        });

        it('returns contract rate when client has no custom rate', () => {
            const client = createMockClient({ custom_hourly_rate: null });
            const contract = createMockContract({ internal_hourly_rate: 175 });
            const settings = createMockSettings();

            expect(getClientHourlyRate(client, contract, settings)).toBe(175);
        });

        it('returns default settings rate when no client or contract rate', () => {
            const client = createMockClient({ custom_hourly_rate: null });
            const settings = createMockSettings({ default_internal_hourly_rate: 150 });

            expect(getClientHourlyRate(client, null, settings)).toBe(150);
        });

        it('handles zero custom rate correctly', () => {
            const client = createMockClient({ custom_hourly_rate: 0 });
            const contract = createMockContract();
            const settings = createMockSettings();

            // Zero is a valid rate (pro bono work)
            expect(getClientHourlyRate(client, contract, settings)).toBe(0);
        });
    });

    describe('getClientCostRate', () => {
        it('returns client custom cost rate when set', () => {
            const client = createMockClient({ custom_cost_rate: 100 });
            const contract = createMockContract();
            const settings = createMockSettings();

            expect(getClientCostRate(client, contract, settings)).toBe(100);
        });

        it('returns contract cost rate when client has no custom rate', () => {
            const client = createMockClient({ custom_cost_rate: null });
            const contract = createMockContract({ internal_cost_rate: 85 });
            const settings = createMockSettings();

            expect(getClientCostRate(client, contract, settings)).toBe(85);
        });

        it('returns default settings cost rate when no client or contract rate', () => {
            const client = createMockClient({ custom_cost_rate: null });
            const settings = createMockSettings({ default_internal_cost_rate: 75 });

            expect(getClientCostRate(client, null, settings)).toBe(75);
        });
    });

    describe('getClientMarginThreshold', () => {
        it('returns client custom threshold when set', () => {
            const client = createMockClient({ custom_margin_threshold: 30 });
            const settings = createMockSettings();

            expect(getClientMarginThreshold(client, settings)).toBe(30);
        });

        it('returns default threshold when client has no custom threshold', () => {
            const client = createMockClient({ custom_margin_threshold: null });
            const settings = createMockSettings({ margin_warning_threshold_percent: 25 });

            expect(getClientMarginThreshold(client, settings)).toBe(25);
        });
    });
});

describe('Revenue Calculations', () => {
    describe('calculateClientRevenue', () => {
        const periodStart = new Date('2024-03-01');
        const periodEnd = new Date('2024-03-31');

        it('calculates billed revenue from invoices in period', () => {
            const client = createMockClient({ agreed_monthly_retainer: 5000 });
            const invoices = [
                createMockInvoice({ client_id: 'client-1', amount: 3000, issue_date: '2024-03-10' }),
                createMockInvoice({ client_id: 'client-1', amount: 2000, issue_date: '2024-03-20' }),
            ];

            const result = calculateClientRevenue(client, invoices, periodStart, periodEnd);

            expect(result.billed).toBe(5000);
            expect(result.retainer).toBe(5000);
            expect(result.total).toBe(5000);
        });

        it('excludes cancelled invoices', () => {
            const client = createMockClient({ agreed_monthly_retainer: 5000 });
            const invoices = [
                createMockInvoice({ amount: 3000, status: 'paid' }),
                createMockInvoice({ amount: 2000, status: 'cancelled' }),
            ];

            const result = calculateClientRevenue(client, invoices, periodStart, periodEnd);

            expect(result.billed).toBe(3000);
        });

        it('excludes draft invoices', () => {
            const client = createMockClient({ agreed_monthly_retainer: 5000 });
            const invoices = [
                createMockInvoice({ amount: 3000, status: 'paid' }),
                createMockInvoice({ amount: 2000, status: 'draft' }),
            ];

            const result = calculateClientRevenue(client, invoices, periodStart, periodEnd);

            expect(result.billed).toBe(3000);
        });

        it('excludes invoices outside period', () => {
            const client = createMockClient({ agreed_monthly_retainer: 5000 });
            const invoices = [
                createMockInvoice({ amount: 3000, issue_date: '2024-03-15' }),
                createMockInvoice({ amount: 2000, issue_date: '2024-02-15' }), // Previous month
            ];

            const result = calculateClientRevenue(client, invoices, periodStart, periodEnd);

            expect(result.billed).toBe(3000);
        });

        it('returns retainer as total when billed is lower', () => {
            const client = createMockClient({ agreed_monthly_retainer: 5000 });
            const invoices = [
                createMockInvoice({ amount: 3000 }),
            ];

            const result = calculateClientRevenue(client, invoices, periodStart, periodEnd);

            expect(result.total).toBe(5000); // Should be retainer, not billed
        });

        it('filters by client_id', () => {
            const client = createMockClient({ id: 'client-1' });
            const invoices = [
                createMockInvoice({ client_id: 'client-1', amount: 3000 }),
                createMockInvoice({ client_id: 'client-2', amount: 2000 }),
            ];

            const result = calculateClientRevenue(client, invoices, periodStart, periodEnd);

            expect(result.billed).toBe(3000);
        });
    });
});

describe('Cost Calculations', () => {
    describe('calculateClientCosts', () => {
        const periodStart = new Date('2024-03-01');
        const periodEnd = new Date('2024-03-31');

        it('calculates total hours and costs correctly', () => {
            const client = createMockClient();
            const contract = createMockContract({ internal_cost_rate: 75 });
            const settings = createMockSettings();
            const entries = [
                createMockTimeEntry({ hours: 8, date: '2024-03-10' }),
                createMockTimeEntry({ hours: 4, date: '2024-03-11' }),
            ];

            const result = calculateClientCosts(client, contract, entries, settings, periodStart, periodEnd);

            expect(result.totalHours).toBe(12);
            expect(result.totalCost).toBe(12 * 75); // 900
        });

        it('calculates billable hours separately', () => {
            const client = createMockClient();
            const settings = createMockSettings();
            const entries = [
                createMockTimeEntry({ hours: 8, billable: true }),
                createMockTimeEntry({ hours: 4, billable: false }),
            ];

            const result = calculateClientCosts(client, null, entries, settings, periodStart, periodEnd);

            expect(result.totalHours).toBe(12);
            expect(result.billableHours).toBe(8);
        });

        it('excludes entries outside period', () => {
            const client = createMockClient();
            const settings = createMockSettings();
            const entries = [
                createMockTimeEntry({ hours: 8, date: '2024-03-15' }),
                createMockTimeEntry({ hours: 4, date: '2024-02-15' }), // Previous month
            ];

            const result = calculateClientCosts(client, null, entries, settings, periodStart, periodEnd);

            expect(result.totalHours).toBe(8);
        });

        it('filters by client_id', () => {
            const client = createMockClient({ id: 'client-1' });
            const settings = createMockSettings();
            const entries = [
                createMockTimeEntry({ client_id: 'client-1', hours: 8 }),
                createMockTimeEntry({ client_id: 'client-2', hours: 4 }),
            ];

            const result = calculateClientCosts(client, null, entries, settings, periodStart, periodEnd);

            expect(result.totalHours).toBe(8);
        });
    });
});

describe('Margin Calculations', () => {
    describe('calculateClientMargin', () => {
        it('calculates positive margin correctly', () => {
            const result = calculateClientMargin(10000, 6000);

            expect(result.grossMargin).toBe(4000);
            expect(result.marginPercent).toBe(40);
        });

        it('calculates negative margin correctly', () => {
            const result = calculateClientMargin(5000, 7000);

            expect(result.grossMargin).toBe(-2000);
            expect(result.marginPercent).toBe(-40);
        });

        it('handles zero revenue', () => {
            const result = calculateClientMargin(0, 1000);

            expect(result.grossMargin).toBe(-1000);
            expect(result.marginPercent).toBe(0); // safeDiv returns 0 for division by zero
        });

        it('handles zero cost (100% margin)', () => {
            const result = calculateClientMargin(5000, 0);

            expect(result.grossMargin).toBe(5000);
            expect(result.marginPercent).toBe(100);
        });

        it('clamps extremely high margin percentages', () => {
            // Edge case: very small revenue with larger cost reduction
            const result = calculateClientMargin(1, 0);

            expect(result.marginPercent).toBeLessThanOrEqual(1000);
        });
    });
});
