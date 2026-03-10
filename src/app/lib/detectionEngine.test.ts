import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runDetectionEngine, getClientAlerts } from './detectionEngine';
import { dataStore } from './dataStore';
import { startOfMonth, endOfMonth, format, addDays } from 'date-fns';

// Mock the data store to control inputs
vi.mock('./dataStore', () => ({
    dataStore: {
        getFullStore: vi.fn(),
        getClientById: vi.fn(),
        getContractByClientId: vi.fn(),
        getSettings: vi.fn(),
    }
}));

describe('Detection Engine Integration', () => {
    const periodStart = startOfMonth(new Date());
    const periodEnd = endOfMonth(new Date());
    const midMonthDate = format(addDays(periodStart, 15), 'yyyy-MM-dd');

    const mockSettings = {
        id: 'settings-1',
        organization_id: 'org-1',
        default_internal_hourly_rate: 100,
        default_internal_cost_rate: 50,
        margin_warning_threshold_percent: 30,
        underbilling_threshold_percent: 5,
        scope_creep_threshold_percent: 10,
        late_payment_days_threshold: 15,
    };

    const mockClient = {
        id: 'client-1',
        organization_id: 'org-1',
        name: 'Test Client',
        status: 'active',
        agreed_monthly_retainer: 1000,
        hour_limit: 10,
        custom_hourly_rate: null,
        custom_cost_rate: null,
        custom_margin_threshold: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate multiple alerts for a problematic client', () => {
        // ... (setup code remains the same)
        const mockStore = {
            settings: mockSettings,
            clients: [mockClient],
            contracts: [],
            invoices: [],
            timeEntries: [
                { id: '1', client_id: 'client-1', organization_id: 'org-1', user_id: 'u1', hours: 20, description: 'Work', date: midMonthDate, billable: true }
            ],
            organization: { id: 'org-1' }
        };

        (dataStore.getFullStore as any).mockReturnValue(mockStore);
        (dataStore.getContractByClientId as any).mockReturnValue(null);
        (dataStore.getClientById as any).mockReturnValue(mockClient);

        const alerts = runDetectionEngine();
        // ...

        // Should have: 
        // 1. Missing Invoice Alert (value $1000)
        // 2. Scope Creep Alert (10h excess * $100 = $1000)
        // (Note: Underbilling is 0 because scope creep is subtracted)
        // 3. Low Margin Alert (Revenue $1000, Cost $1000 -> 0% margin, threshold 30%)

        expect(alerts.length).toBe(3);

        const types = alerts.map(a => a.alert_type);
        expect(types).toContain('missing_invoice');
        expect(types).toContain('scope_creep');

        const scopeCreepAlert = alerts.find(a => a.alert_type === 'scope_creep');
        expect(scopeCreepAlert?.estimated_leakage).toBe(1000);
        expect(scopeCreepAlert?.severity).toBe('critical'); // 1000 / 1000 = 100% ( > 50% )
    });

    it('should return no alerts for a healthy client', () => {
        const mockStore = {
            settings: mockSettings,
            clients: [mockClient],
            contracts: [],
            invoices: [
                { id: 'inv-1', client_id: 'client-1', organization_id: 'org-1', amount: 1000, status: 'paid', issue_date: midMonthDate, due_date: midMonthDate }
            ],
            timeEntries: [
                { id: '1', client_id: 'client-1', organization_id: 'org-1', user_id: 'u1', hours: 10, description: 'Work', date: midMonthDate, billable: true }
            ],
            organization: { id: 'org-1' }
        };

        (dataStore.getFullStore as any).mockReturnValue(mockStore);

        const alerts = runDetectionEngine();
        expect(alerts.filter(a => a.alert_type !== 'low_margin').length).toBe(0);
    });
});
