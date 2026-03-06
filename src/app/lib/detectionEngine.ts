// src/app/lib/detectionEngine.ts
// Revenue leak detection engine - uses real calculations, no hardcoded values

import {
    RevenueAlert,
    DashboardMetrics,
    ClientMetrics,
    FinancialSettings,
    EMPTY_DASHBOARD_METRICS,
    EMPTY_FINANCIAL_SETTINGS,
} from './types';
import {
    calculateDashboardMetrics,
    calculateClientMetrics,
    generateClientAlerts,
} from './calculations';
import { dataStore } from './dataStore';
import { startOfMonth, endOfMonth } from 'date-fns';

// ============================================
// MAIN DETECTION ENGINE
// ============================================

export function runDetectionEngine(): RevenueAlert[] {
    const store = dataStore.getFullStore();

    // If no data, return empty alerts
    if (!store.settings || store.clients.length === 0) {
        return [];
    }

    const now = new Date();
    const periodStart = startOfMonth(now);
    const periodEnd = endOfMonth(now);
    const organizationId = store.organization?.id || '';

    const allAlerts: RevenueAlert[] = [];

    // Generate alerts for each active client
    const activeClients = store.clients.filter(c => c.status === 'active');

    activeClients.forEach(client => {
        const contract = dataStore.getContractByClientId(client.id) || null;

        const metrics = calculateClientMetrics(
            client,
            contract,
            store.invoices,
            store.timeEntries,
            store.settings!,
            periodStart,
            periodEnd
        );

        const alerts = generateClientAlerts(client, metrics, store.settings!, organizationId);
        allAlerts.push(...alerts);
    });

    return allAlerts;
}

// ============================================
// DASHBOARD STATS
// ============================================

export function getDashboardStats(): DashboardMetrics {
    const store = dataStore.getFullStore();

    // If no settings configured, return empty metrics
    if (!store.settings) {
        return {
            ...EMPTY_DASHBOARD_METRICS,
            period_start: startOfMonth(new Date()).toISOString(),
            period_end: endOfMonth(new Date()).toISOString(),
        };
    }

    // If no clients, return empty metrics
    if (store.clients.length === 0) {
        return {
            ...EMPTY_DASHBOARD_METRICS,
            period_start: startOfMonth(new Date()).toISOString(),
            period_end: endOfMonth(new Date()).toISOString(),
        };
    }

    const organizationId = store.organization?.id || '';
    const now = new Date();
    const periodStart = startOfMonth(now);
    const periodEnd = endOfMonth(now);

    return calculateDashboardMetrics(
        store.clients,
        store.contracts,
        store.invoices,
        store.timeEntries,
        store.settings,
        organizationId,
        periodStart,
        periodEnd
    );
}

// ============================================
// CLIENT-SPECIFIC STATS
// ============================================

export function getClientStats(clientId: string): ClientMetrics | null {
    const store = dataStore.getFullStore();
    const client = dataStore.getClientById(clientId);

    if (!client || !store.settings) {
        return null;
    }

    const contract = dataStore.getContractByClientId(clientId) || null;
    const now = new Date();
    const periodStart = startOfMonth(now);
    const periodEnd = endOfMonth(now);

    return calculateClientMetrics(
        client,
        contract,
        store.invoices,
        store.timeEntries,
        store.settings,
        periodStart,
        periodEnd
    );
}

export function getClientAlerts(clientId: string): RevenueAlert[] {
    const store = dataStore.getFullStore();
    const client = dataStore.getClientById(clientId);

    if (!client || !store.settings) {
        return [];
    }

    const contract = dataStore.getContractByClientId(clientId) || null;
    const now = new Date();
    const periodStart = startOfMonth(now);
    const periodEnd = endOfMonth(now);
    const organizationId = store.organization?.id || '';

    const metrics = calculateClientMetrics(
        client,
        contract,
        store.invoices,
        store.timeEntries,
        store.settings,
        periodStart,
        periodEnd
    );

    return generateClientAlerts(client, metrics, store.settings, organizationId);
}

// ============================================
// SETTINGS HELPERS
// ============================================

export function getEffectiveSettings(): FinancialSettings {
    const settings = dataStore.getSettings();

    if (!settings) {
        // Return defaults if no settings configured
        return {
            id: 'default',
            organization_id: '',
            ...EMPTY_FINANCIAL_SETTINGS,
            updated_at: new Date().toISOString(),
        };
    }

    return settings;
}

// ============================================
// DATA STATUS HELPERS
// ============================================

export function hasRequiredData(): boolean {
    return dataStore.hasSettings() && dataStore.hasData();
}

export function getDataStatus(): {
    hasOrganization: boolean;
    hasSettings: boolean;
    hasClients: boolean;
    hasInvoices: boolean;
    hasTimeEntries: boolean;
    isDemoMode: boolean;
} {
    const store = dataStore.getFullStore();

    return {
        hasOrganization: store.organization !== null,
        hasSettings: store.settings !== null,
        hasClients: store.clients.length > 0,
        hasInvoices: store.invoices.length > 0,
        hasTimeEntries: store.timeEntries.length > 0,
        isDemoMode: dataStore.isDemoModeEnabled(),
    };
}

// ============================================
// DEMO MODE HELPERS
// ============================================

export function enableDemoMode(): void {
    dataStore.enableDemoMode();
}

export function disableDemoMode(): void {
    dataStore.disableDemoMode();
}

export function isDemoMode(): boolean {
    return dataStore.isDemoModeEnabled();
}

// ============================================
// LEGACY COMPATIBILITY
// These functions maintain backwards compatibility during migration
// ============================================

// Re-export data for components that still use direct imports
export function getClients() {
    return dataStore.getClients();
}

export function getContracts() {
    return dataStore.getContracts();
}

export function getInvoices() {
    return dataStore.getInvoices();
}

export function getTimeEntries() {
    return dataStore.getTimeEntries();
}
