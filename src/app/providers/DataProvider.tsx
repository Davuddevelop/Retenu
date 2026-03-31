// src/app/providers/DataProvider.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { dataStore } from '../lib/dataStore';
import { getDataStatus, runDetectionEngine } from '../lib/detectionEngine';
import type { Client, Contract, Invoice, TimeEntry, RevenueAlert, FinancialSettings } from '../lib/types';

// Determine data source mode
type DataMode = 'local' | 'supabase';

interface DataContextType {
    // Mode
    mode: DataMode;
    isDemoMode: boolean;
    isInitialized: boolean;
    isLoading: boolean;
    hasData: boolean;
    error: string | null;

    // Organization
    organizationId: string | null;

    // Data
    clients: Client[];
    contracts: Contract[];
    invoices: Invoice[];
    timeEntries: TimeEntry[];
    alerts: RevenueAlert[];
    settings: FinancialSettings | null;

    // Actions
    enableDemoMode: () => void;
    disableDemoMode: () => void;
    refreshData: () => Promise<void>;
    refreshClients: () => Promise<void>;
    refreshInvoices: () => Promise<void>;
    refreshTimeEntries: () => Promise<void>;
    refreshAlerts: () => Promise<void>;
    resolveAlert: (alertId: string) => Promise<void>;
    ignoreAlert: (alertId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

interface DataProviderProps {
    children: ReactNode;
    // If true, use Supabase; otherwise use local dataStore
    useSupabase?: boolean;
    // Force demo mode for guest/anonymous users
    forceDemoMode?: boolean;
    // Server-side initial data for hydration
    initialData?: {
        organizationId?: string;
        clients?: Client[];
        contracts?: Contract[];
        invoices?: Invoice[];
        timeEntries?: TimeEntry[];
        alerts?: RevenueAlert[];
        settings?: FinancialSettings;
    };
}

export function DataProvider({ children, useSupabase = false, forceDemoMode = false, initialData }: DataProviderProps) {
    const supabase = useSupabase ? createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key'
    ) : null;

    const [mode] = useState<DataMode>(useSupabase ? 'supabase' : 'local');
    const [isDemoMode, setIsDemoMode] = useState(forceDemoMode);
    const [isInitialized, setIsInitialized] = useState(!!initialData);
    const [isLoading, setIsLoading] = useState(!initialData);
    const [hasData, setHasData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [organizationId, setOrganizationId] = useState<string | null>(
        initialData?.organizationId || null
    );
    const [clients, setClients] = useState<Client[]>(initialData?.clients || []);
    const [contracts, setContracts] = useState<Contract[]>(initialData?.contracts || []);
    const [invoices, setInvoices] = useState<Invoice[]>(initialData?.invoices || []);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(
        initialData?.timeEntries || []
    );
    const [alerts, setAlerts] = useState<RevenueAlert[]>(initialData?.alerts || []);
    const [settings, setSettings] = useState<FinancialSettings | null>(
        initialData?.settings || null
    );

    // ============================================
    // LOCAL MODE FUNCTIONS
    // ============================================

    const loadLocalData = useCallback(() => {
        const status = getDataStatus();

        // If forceDemoMode is true (guest user), always enable demo mode
        if (forceDemoMode) {
            if (!status.isDemoMode) {
                dataStore.enableDemoMode();
            }
            setIsDemoMode(true);
        } else {
            // Real user - don't auto-enable demo mode
            // They should see empty state and connect their own data
            setIsDemoMode(status.isDemoMode);
        }

        setClients(dataStore.getClients());
        setContracts(dataStore.getContracts());
        setInvoices(dataStore.getInvoices());
        setTimeEntries(dataStore.getTimeEntries());
        setSettings(dataStore.getSettings());

        // Calculate alerts
        const org = dataStore.getOrganization();
        if (org) {
            setOrganizationId(org.id);
            const calculatedAlerts = runDetectionEngine();
            setAlerts(calculatedAlerts);
        }

        setHasData(status.hasClients);
        setIsInitialized(true);
        setIsLoading(false);
    }, [forceDemoMode]);

    // ============================================
    // SUPABASE MODE FUNCTIONS
    // ============================================

    const fetchOrganization = useCallback(async () => {
        if (!supabase) return null;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // First try to fetch existing organization
        let { data } = await supabase
            .from('organizations')
            .select('*')
            .eq('owner_id', user.id)
            .single();

        // If no organization exists, create one
        if (!data) {
            const orgName = user.user_metadata?.companyName ||
                           user.email?.split('@')[0] ||
                           'My Organization';

            const { data: newOrg, error: insertError } = await supabase
                .from('organizations')
                .insert({
                    name: orgName + "'s Agency",
                    owner_id: user.id,
                })
                .select()
                .single();

            if (insertError) {
                console.error('Failed to create organization:', insertError);
                return null;
            }

            data = newOrg;
        }

        if (data) {
            setOrganizationId(data.id);
            setIsDemoMode(data.demo_mode || false);
        }

        return data;
    }, [supabase]);

    const refreshClients = useCallback(async () => {
        if (mode === 'local') {
            setClients(dataStore.getClients());
            return;
        }

        if (!supabase || !organizationId) return;

        const { data } = await supabase
            .from('clients')
            .select('*')
            .eq('organization_id', organizationId)
            .order('name');

        const transformedClients: Client[] = (data || []).map((c: any) => ({
            id: c.id,
            organization_id: c.organization_id || '',
            name: c.name,
            agreed_monthly_retainer: Number(c.agreed_monthly_retainer),
            agreed_deliverables: c.agreed_deliverables || '',
            hour_limit: c.hour_limit ? Number(c.hour_limit) : null,
            custom_hourly_rate: c.custom_hourly_rate ? Number(c.custom_hourly_rate) : null,
            custom_cost_rate: c.custom_cost_rate ? Number(c.custom_cost_rate) : null,
            custom_margin_threshold: c.custom_margin_threshold || null,
            start_date: c.start_date,
            status: c.status as Client['status'],
            created_at: c.created_at || new Date().toISOString(),
            updated_at: c.updated_at || new Date().toISOString(),
        }));

        setClients(transformedClients);
        setHasData(transformedClients.length > 0);
    }, [supabase, organizationId, mode]);

    const refreshContracts = useCallback(async () => {
        if (mode === 'local') {
            setContracts(dataStore.getContracts());
            return;
        }

        if (!supabase || !organizationId) return;

        const { data } = await supabase
            .from('contracts')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('status', 'active');

        const transformedContracts: Contract[] = (data || []).map((c: any) => ({
            id: c.id,
            client_id: c.client_id,
            organization_id: c.organization_id || '',
            internal_hourly_rate: Number(c.internal_hourly_rate),
            internal_cost_rate: Number(c.internal_cost_rate),
            start_date: c.start_date,
            end_date: c.end_date || null,
            status: c.status as Contract['status'],
            created_at: c.created_at || new Date().toISOString(),
        }));

        setContracts(transformedContracts);
    }, [supabase, organizationId, mode]);

    const refreshInvoices = useCallback(async () => {
        if (mode === 'local') {
            setInvoices(dataStore.getInvoices());
            return;
        }

        if (!supabase || !organizationId) return;

        const { data } = await supabase
            .from('invoices')
            .select('*')
            .eq('organization_id', organizationId)
            .order('issue_date', { ascending: false });

        const transformedInvoices: Invoice[] = (data || []).map((inv: any) => ({
            id: inv.id,
            client_id: inv.client_id,
            organization_id: inv.organization_id || '',
            amount: Number(inv.amount),
            status: inv.status as Invoice['status'],
            issue_date: inv.issue_date,
            due_date: inv.due_date,
            paid_date: inv.paid_date || undefined,
            stripe_invoice_id: inv.stripe_invoice_id || undefined,
            created_at: inv.created_at || new Date().toISOString(),
        }));

        setInvoices(transformedInvoices);
    }, [supabase, organizationId, mode]);

    const refreshTimeEntries = useCallback(async () => {
        if (mode === 'local') {
            setTimeEntries(dataStore.getTimeEntries());
            return;
        }

        if (!supabase || !organizationId) return;

        // Get current month's entries
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split('T')[0];

        const { data } = await supabase
            .from('time_entries')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('date', startOfMonth)
            .order('date', { ascending: false });

        const transformedEntries: TimeEntry[] = (data || []).map((entry: any) => ({
            id: entry.id,
            client_id: entry.client_id,
            organization_id: entry.organization_id || '',
            hours: Number(entry.hours),
            date: entry.date,
            team_member: entry.team_member || 'Unknown',
            description: entry.description || '',
            billable: entry.billable,
            external_id: entry.external_id || null,
            source: entry.source as TimeEntry['source'],
            created_at: entry.created_at || new Date().toISOString(),
        }));

        setTimeEntries(transformedEntries);
    }, [supabase, organizationId, mode]);

    const refreshAlerts = useCallback(async () => {
        if (mode === 'local') {
            const calculatedAlerts = runDetectionEngine();
            setAlerts(calculatedAlerts);
            return;
        }

        if (!supabase || !organizationId) return;

        const { data } = await supabase
            .from('alerts')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        const transformedAlerts: RevenueAlert[] = (data || []).map((alert: any) => ({
            id: alert.id,
            client_id: alert.client_id,
            organization_id: alert.organization_id || '',
            alert_type: alert.alert_type as RevenueAlert['alert_type'],
            severity: (alert.severity || 'medium') as RevenueAlert['severity'],
            message: alert.message,
            estimated_leakage: Number(alert.estimated_leakage || 0),
            details: alert.details || '',
            status: alert.status as RevenueAlert['status'],
            created_at: alert.created_at || new Date().toISOString(),
            resolved_at: alert.resolved_at || null,
        }));

        setAlerts(transformedAlerts);
    }, [supabase, organizationId, mode]);

    const resolveAlert = useCallback(async (alertId: string) => {
        if (mode === 'local') {
            // For local mode, update the alert in state
            setAlerts(prev => prev.map(alert =>
                alert.id === alertId
                    ? { ...alert, status: 'resolved' as const, resolved_at: new Date().toISOString() }
                    : alert
            ).filter(alert => alert.status === 'active'));
            return;
        }

        if (!supabase || !organizationId) return;

        await supabase
            .from('alerts')
            .update({
                status: 'resolved',
                resolved_at: new Date().toISOString(),
            })
            .eq('id', alertId)
            .eq('organization_id', organizationId);

        // Refresh alerts to get updated list
        await refreshAlerts();
    }, [supabase, organizationId, mode, refreshAlerts]);

    const ignoreAlert = useCallback(async (alertId: string) => {
        if (mode === 'local') {
            // For local mode, remove the alert from active list
            setAlerts(prev => prev.filter(alert => alert.id !== alertId));
            return;
        }

        if (!supabase || !organizationId) return;

        await supabase
            .from('alerts')
            .update({ status: 'ignored' })
            .eq('id', alertId)
            .eq('organization_id', organizationId);

        // Refresh alerts to get updated list
        await refreshAlerts();
    }, [supabase, organizationId, mode, refreshAlerts]);

    const refreshSettings = useCallback(async () => {
        if (mode === 'local') {
            setSettings(dataStore.getSettings());
            return;
        }

        if (!supabase || !organizationId) return;

        const { data } = await supabase
            .from('financial_settings')
            .select('*')
            .eq('organization_id', organizationId)
            .single();

        if (data) {
            const transformedSettings: FinancialSettings = {
                id: data.id,
                organization_id: data.organization_id,
                default_internal_hourly_rate: Number(data.default_internal_hourly_rate),
                default_internal_cost_rate: Number(data.default_internal_cost_rate),
                currency: data.currency || 'USD',
                margin_warning_threshold_percent: data.margin_warning_threshold_percent || 25,
                scope_creep_threshold_percent: data.scope_creep_threshold_percent || 10,
                underbilling_threshold_percent: data.underbilling_threshold_percent || 15,
                late_payment_days_threshold: data.late_payment_days_threshold || 7,
                updated_at: data.updated_at,
            };
            setSettings(transformedSettings);
        }
    }, [supabase, organizationId, mode]);

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (mode === 'local') {
                loadLocalData();
            } else {
                const org = await fetchOrganization();
                if (org) {
                    await Promise.all([
                        refreshClients(),
                        refreshContracts(),
                        refreshInvoices(),
                        refreshTimeEntries(),
                        refreshAlerts(),
                        refreshSettings(),
                    ]);
                }
            }
        } catch (err) {
            console.error('Error refreshing data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setIsLoading(false);
            setIsInitialized(true);
        }
    }, [
        mode,
        loadLocalData,
        fetchOrganization,
        refreshClients,
        refreshContracts,
        refreshInvoices,
        refreshTimeEntries,
        refreshAlerts,
        refreshSettings,
    ]);

    // ============================================
    // DEMO MODE FUNCTIONS
    // ============================================

    const enableDemoMode = useCallback(() => {
        if (mode === 'local') {
            dataStore.enableDemoMode();
            localStorage.removeItem('revenueLeak_demoDisabled');
            loadLocalData();
        } else if (supabase && organizationId) {
            // In Supabase mode, update the organization
            supabase
                .from('organizations')
                .update({ demo_mode: true })
                .eq('id', organizationId)
                .then(() => {
                    setIsDemoMode(true);
                });
        }
    }, [mode, supabase, organizationId, loadLocalData]);

    const disableDemoMode = useCallback(() => {
        if (mode === 'local') {
            dataStore.disableDemoMode();
            localStorage.setItem('revenueLeak_demoDisabled', 'true');
            loadLocalData();
        } else if (supabase && organizationId) {
            supabase
                .from('organizations')
                .update({ demo_mode: false })
                .eq('id', organizationId)
                .then(() => {
                    setIsDemoMode(false);
                    refreshData();
                });
        }
    }, [mode, supabase, organizationId, loadLocalData, refreshData]);

    // ============================================
    // INITIALIZATION
    // ============================================

    useEffect(() => {
        if (!initialData) {
            refreshData();
        }
    }, [initialData, refreshData]);

    // Subscribe to realtime changes in Supabase mode
    useEffect(() => {
        if (mode !== 'supabase' || !supabase || !organizationId) return;

        const channel = supabase
            .channel('data-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'clients',
                    filter: `organization_id=eq.${organizationId}`,
                },
                () => refreshClients()
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'invoices',
                    filter: `organization_id=eq.${organizationId}`,
                },
                () => refreshInvoices()
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'time_entries',
                    filter: `organization_id=eq.${organizationId}`,
                },
                () => refreshTimeEntries()
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'alerts',
                    filter: `organization_id=eq.${organizationId}`,
                },
                () => refreshAlerts()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [
        mode,
        supabase,
        organizationId,
        refreshClients,
        refreshInvoices,
        refreshTimeEntries,
        refreshAlerts,
    ]);

    return (
        <DataContext.Provider
            value={{
                mode,
                isDemoMode,
                isInitialized,
                isLoading,
                hasData,
                error,
                organizationId,
                clients,
                contracts,
                invoices,
                timeEntries,
                alerts,
                settings,
                enableDemoMode,
                disableDemoMode,
                refreshData,
                refreshClients,
                refreshInvoices,
                refreshTimeEntries,
                refreshAlerts,
                resolveAlert,
                ignoreAlert,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}

// Convenience hooks
export function useClients() {
    const { clients, refreshClients, isLoading } = useData();
    return { clients, refresh: refreshClients, isLoading };
}

export function useInvoices() {
    const { invoices, refreshInvoices, isLoading } = useData();
    return { invoices, refresh: refreshInvoices, isLoading };
}

export function useTimeEntries() {
    const { timeEntries, refreshTimeEntries, isLoading } = useData();
    return { timeEntries, refresh: refreshTimeEntries, isLoading };
}

export function useAlerts() {
    const { alerts, refreshAlerts, isLoading } = useData();
    return { alerts, refresh: refreshAlerts, isLoading };
}

export function useOrganization() {
    const { organizationId, isDemoMode, isLoading } = useData();
    return { organizationId, isDemoMode, isLoading };
}

export function useSettings() {
    const { settings, isLoading } = useData();
    return { settings, isLoading };
}
