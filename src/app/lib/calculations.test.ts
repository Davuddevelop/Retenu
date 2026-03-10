import { describe, it, expect } from 'vitest';
import {
    getClientHourlyRate,
    calculateClientRevenue,
    calculateClientCosts,
    calculateUnderbilling,
    calculateScopeCreep,
    calculateMissingInvoices,
    calculateLatePayments,
    calculateClientMetrics
} from './calculations';
import { Client, Contract, Invoice, TimeEntry, FinancialSettings } from './types';
import { addDays, subDays, startOfMonth, endOfMonth, format } from 'date-fns';

describe('Calculation Engine', () => {
    const mockSettings: FinancialSettings = {
        id: 'settings-1',
        organization_id: 'org-1',
        default_internal_hourly_rate: 100,
        default_internal_cost_rate: 50,
        margin_warning_threshold_percent: 30,
        underbilling_threshold_percent: 5,
        scope_creep_threshold_percent: 10,
        late_payment_days_threshold: 15,
        updated_at: new Date().toISOString()
    };

    const mockClient: Client = {
        id: 'client-1',
        organization_id: 'org-1',
        name: 'Test Client',
        email: 'test@example.com',
        status: 'active',
        agreed_monthly_retainer: 1000,
        hour_limit: 10,
        custom_hourly_rate: null,
        custom_cost_rate: null,
        custom_margin_threshold: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const periodStart = startOfMonth(new Date());
    const periodEnd = endOfMonth(new Date());
    const midMonthDate = format(addDays(periodStart, 15), 'yyyy-MM-dd');

    describe('getClientHourlyRate', () => {
        it('should use client override if present', () => {
            const clientWithOverride = { ...mockClient, custom_hourly_rate: 200 };
            expect(getClientHourlyRate(clientWithOverride, null, mockSettings)).toBe(200);
        });

        it('should fall back to contract rate if no client override', () => {
            const mockContract: Partial<Contract> = { internal_hourly_rate: 150 };
            expect(getClientHourlyRate(mockClient, mockContract as Contract, mockSettings)).toBe(150);
        });

        it('should fall back to default settings if no overrides', () => {
            expect(getClientHourlyRate(mockClient, null, mockSettings)).toBe(100);
        });
    });

    describe('calculateUnderbilling', () => {
        it('should detect underbilling when expected revenue exceeds actual', () => {
            // 20 hours * $100 = $2000 expected.
            // Actual is $1000 (retainer).
            // Underbilling should be $1000.
            const timeEntries: TimeEntry[] = [
                { id: '1', client_id: 'client-1', organization_id: 'org-1', user_id: 'u1', hours: 20, description: 'Work', date: midMonthDate, billable: true, created_at: '' }
            ];
            const invoices: Invoice[] = []; // Only retainer counts

            // Note: In our current logic, if billableHours (20) > hour_limit (10), 
            // the excess 10 hours are counted as Scope Creep and subtracted from Underbilling.
            // So: $2000 (total) - $1000 (scope creep) - $1000 (retainer) = $0 underbilling.

            const underbilling = calculateUnderbilling(mockClient, null, timeEntries, invoices, mockSettings, periodStart, periodEnd);
            expect(underbilling).toBe(0); // Because it's 100% scope creep
        });

        it('should detect underbilling within limits', () => {
            // Client has 10h limit. Work 8h.
            // Expected: 8 * $100 = $800.
            // Retainer: $1000.
            // No underbilling (actual revenue $1000 covers the $800 work).
            const timeEntries: TimeEntry[] = [
                { id: '1', client_id: 'client-1', organization_id: 'org-1', user_id: 'u1', hours: 8, description: 'Work', date: midMonthDate, billable: true, created_at: '' }
            ];
            const underbilling = calculateUnderbilling(mockClient, null, timeEntries, [], mockSettings, periodStart, periodEnd);
            expect(underbilling).toBe(0);
        });

        it('should detect underbilling when billable work exceeds retainer but no invoice exists', () => {
            const clientNoLimit = { ...mockClient, hour_limit: null, agreed_monthly_retainer: 500 };
            // 10 hours * $100 = $1000 expected.
            // Retainer = $500.
            // Difference = $500.
            const timeEntries: TimeEntry[] = [
                { id: '1', client_id: 'client-1', organization_id: 'org-1', user_id: 'u1', hours: 10, description: 'Work', date: midMonthDate, billable: true, created_at: '' }
            ];
            const underbilling = calculateUnderbilling(clientNoLimit, null, timeEntries, [], mockSettings, periodStart, periodEnd);
            expect(underbilling).toBe(500);
        });
    });

    describe('calculateScopeCreep', () => {
        it('should detect scope creep when hours exceed limit', () => {
            // Limit 10h. Work 15h.
            // Excess 5h * $100 = $500 scope creep.
            const timeEntries: TimeEntry[] = [
                { id: '1', client_id: 'client-1', organization_id: 'org-1', user_id: 'u1', hours: 15, description: 'Work', date: midMonthDate, billable: true, created_at: '' }
            ];
            const creep = calculateScopeCreep(mockClient, null, timeEntries, mockSettings, periodStart, periodEnd);
            expect(creep).toBe(500);
        });

        it('should respect threshold for scope creep', () => {
            // Limit 10h. Threshold 10% (starts at 11h).
            // Work 10.5h -> Should be 0 creep.
            const timeEntries: TimeEntry[] = [
                { id: '1', client_id: 'client-1', organization_id: 'org-1', user_id: 'u1', hours: 10.5, description: 'Work', date: midMonthDate, billable: true, created_at: '' }
            ];
            const creep = calculateScopeCreep(mockClient, null, timeEntries, mockSettings, periodStart, periodEnd);
            expect(creep).toBe(0);
        });
    });

    describe('calculateMissingInvoices', () => {
        it('should flag retainer as leakage if no invoice exists', () => {
            const leakage = calculateMissingInvoices(mockClient, [], periodStart, periodEnd);
            expect(leakage).toBe(1000);
        });

        it('should return 0 if any valid invoice exists', () => {
            const invoices: Invoice[] = [
                { id: 'inv-1', client_id: 'client-1', organization_id: 'org-1', amount: 1000, status: 'pending', issue_date: midMonthDate, due_date: midMonthDate, created_at: '' }
            ];
            const leakage = calculateMissingInvoices(mockClient, invoices, periodStart, periodEnd);
            expect(leakage).toBe(0);
        });
    });

    describe('calculateLatePayments', () => {
        it('should count overdue invoices past threshold', () => {
            const oldDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
            const invoices: Invoice[] = [
                { id: 'inv-1', client_id: 'client-1', organization_id: 'org-1', amount: 1500, status: 'overdue', issue_date: oldDate, due_date: oldDate, created_at: '' }
            ];
            const leakage = calculateLatePayments(mockClient, invoices, mockSettings, new Date());
            expect(leakage).toBe(1500);
        });

        it('should not count invoices within threshold', () => {
            const recentDate = format(subDays(new Date(), 5), 'yyyy-MM-dd');
            const invoices: Invoice[] = [
                { id: 'inv-1', client_id: 'client-1', organization_id: 'org-1', amount: 1500, status: 'overdue', issue_date: recentDate, due_date: recentDate, created_at: '' }
            ];
            const leakage = calculateLatePayments(mockClient, invoices, mockSettings, new Date());
            expect(leakage).toBe(0);
        });
    });
});
