// src/lib/supabaseData.ts
// Server-side data service for fetching from Supabase
// Use this in server components and server actions

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { Database } from './database.types';

// Types from database
type Tables = Database['public']['Tables'];
export type Organization = Tables['organizations']['Row'];
export type Client = Tables['clients']['Row'];
export type Invoice = Tables['invoices']['Row'];
export type TimeEntry = Tables['time_entries']['Row'];
export type Alert = Tables['alerts']['Row'];
export type Integration = Tables['integrations']['Row'];
export type FinancialSettings = Tables['financial_settings']['Row'];

// Create a cached Supabase client for server components
export const createClient = cache(async () => {
    const cookieStore = await cookies();
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch { }
                },
            },
        }
    );
});

// Get the current user's organization
export async function getOrganization(): Promise<Organization | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    return data;
}

// Get all clients for the organization
export async function getClients(organizationId: string): Promise<Client[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }

    return data || [];
}

// Get a single client
export async function getClient(clientId: string): Promise<Client | null> {
    const supabase = await createClient();

    const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

    return data;
}

// Get all invoices for the organization
export async function getInvoices(
    organizationId: string,
    options?: {
        clientId?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
    }
): Promise<Invoice[]> {
    const supabase = await createClient();

    let query = supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .order('issue_date', { ascending: false });

    if (options?.clientId) {
        query = query.eq('client_id', options.clientId);
    }
    if (options?.status) {
        query = query.eq('status', options.status);
    }
    if (options?.startDate) {
        query = query.gte('issue_date', options.startDate);
    }
    if (options?.endDate) {
        query = query.lte('issue_date', options.endDate);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching invoices:', error);
        return [];
    }

    return data || [];
}

// Get all time entries for the organization
export async function getTimeEntries(
    organizationId: string,
    options?: {
        clientId?: string;
        startDate?: string;
        endDate?: string;
        billableOnly?: boolean;
    }
): Promise<TimeEntry[]> {
    const supabase = await createClient();

    let query = supabase
        .from('time_entries')
        .select('*')
        .eq('organization_id', organizationId)
        .order('date', { ascending: false });

    if (options?.clientId) {
        query = query.eq('client_id', options.clientId);
    }
    if (options?.startDate) {
        query = query.gte('date', options.startDate);
    }
    if (options?.endDate) {
        query = query.lte('date', options.endDate);
    }
    if (options?.billableOnly) {
        query = query.eq('billable', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching time entries:', error);
        return [];
    }

    return data || [];
}

// Get time entries for a specific client in a date range
export async function getClientTimeEntries(
    clientId: string,
    startDate: string,
    endDate: string
): Promise<TimeEntry[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('client_id', clientId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching client time entries:', error);
        return [];
    }

    return data || [];
}

// Get all alerts for the organization
export async function getAlerts(
    organizationId: string,
    options?: {
        status?: 'active' | 'resolved' | 'ignored';
        alertType?: string;
        clientId?: string;
    }
): Promise<Alert[]> {
    const supabase = await createClient();

    let query = supabase
        .from('alerts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (options?.status) {
        query = query.eq('status', options.status);
    }
    if (options?.alertType) {
        query = query.eq('alert_type', options.alertType);
    }
    if (options?.clientId) {
        query = query.eq('client_id', options.clientId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching alerts:', error);
        return [];
    }

    return data || [];
}

// Get financial settings
export async function getFinancialSettings(
    organizationId: string
): Promise<FinancialSettings | null> {
    const supabase = await createClient();

    const { data } = await supabase
        .from('financial_settings')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

    return data;
}

// Get integrations
export async function getIntegrations(
    organizationId: string
): Promise<Integration[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', organizationId);

    if (error) {
        console.error('Error fetching integrations:', error);
        return [];
    }

    return data || [];
}

// Get dashboard summary data (aggregated)
export async function getDashboardData(organizationId: string) {
    const supabase = await createClient();

    // Get current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

    // Parallel fetch all data
    const [
        clientsResult,
        invoicesResult,
        timeEntriesResult,
        alertsResult,
        settingsResult,
    ] = await Promise.all([
        supabase
            .from('clients')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('status', 'active'),
        supabase
            .from('invoices')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('issue_date', startOfMonth)
            .lte('issue_date', endOfMonth),
        supabase
            .from('time_entries')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('date', startOfMonth)
            .lte('date', endOfMonth),
        supabase
            .from('alerts')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('status', 'active'),
        supabase
            .from('financial_settings')
            .select('*')
            .eq('organization_id', organizationId)
            .single(),
    ]);

    return {
        clients: clientsResult.data || [],
        invoices: invoicesResult.data || [],
        timeEntries: timeEntriesResult.data || [],
        alerts: alertsResult.data || [],
        settings: settingsResult.data,
        dateRange: { startOfMonth, endOfMonth },
    };
}

// Check if user has any data
export async function hasUserData(organizationId: string): Promise<boolean> {
    const supabase = await createClient();

    const { count } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

    return (count || 0) > 0;
}
