// src/lib/actions.ts
// Server actions for data mutations
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { Database } from './database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];

async function getSupabase(): Promise<SupabaseClient<Database>> {
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
}

async function getOrganizationId(): Promise<string | null> {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase// @ts-ignoreorganizations')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    return (data as any)?.id || null;
}

// ============================================
// CLIENT ACTIONS
// ============================================

export async function createClient(
    data: Omit<Tables['clients']['Insert'], 'id' | 'organization_id' | 'created_at' | 'updated_at'>
) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { data: client, error } = await supabase// @ts-ignoreclients')
        .insert({
            ...data,
            organization_id: organizationId,
        })
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/app/clients');
    revalidatePath('/app');

    return client;
}

export async function updateClient(
    clientId: string,
    data: Partial<Tables['clients']['Update']>
) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { data: client, error } = await supabase// @ts-ignoreclients')
        .update(data)
        .eq('id', clientId)
        .eq('organization_id', organizationId)
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/app/clients');
    revalidatePath(`/app/clients/${clientId}`);
    revalidatePath('/app');

    return client;
}

export async function deleteClient(clientId: string) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { error } = await supabase// @ts-ignoreclients')
        .delete()
        .eq('id', clientId)
        .eq('organization_id', organizationId);

    if (error) throw error;

    revalidatePath('/app/clients');
    revalidatePath('/app');
}

// ============================================
// INVOICE ACTIONS
// ============================================

export async function createInvoice(
    data: Omit<Tables['invoices']['Insert'], 'id' | 'organization_id' | 'created_at'>
) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { data: invoice, error } = await supabase// @ts-ignoreinvoices')
        .insert({
            ...data,
            organization_id: organizationId,
        })
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/app/invoices');
    revalidatePath('/app');

    return invoice;
}

export async function updateInvoice(
    invoiceId: string,
    data: Partial<Tables['invoices']['Update']>
) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { data: invoice, error } = await supabase// @ts-ignoreinvoices')
        .update(data)
        .eq('id', invoiceId)
        .eq('organization_id', organizationId)
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/app/invoices');
    revalidatePath('/app');

    return invoice;
}

export async function markInvoicePaid(invoiceId: string) {
    return updateInvoice(invoiceId, {
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
    });
}

export async function deleteInvoice(invoiceId: string) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { error } = await supabase// @ts-ignoreinvoices')
        .delete()
        .eq('id', invoiceId)
        .eq('organization_id', organizationId);

    if (error) throw error;

    revalidatePath('/app/invoices');
    revalidatePath('/app');
}

// ============================================
// TIME ENTRY ACTIONS
// ============================================

export async function createTimeEntry(
    data: Omit<Tables['time_entries']['Insert'], 'id' | 'organization_id' | 'created_at'>
) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { data: entry, error } = await supabase// @ts-ignoretime_entries')
        .insert({
            ...data,
            organization_id: organizationId,
        })
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/app/time-entries');
    revalidatePath('/app');

    return entry;
}

export async function createTimeEntries(
    entries: Array<Omit<Tables['time_entries']['Insert'], 'id' | 'organization_id' | 'created_at'>>
) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { data, error } = await supabase// @ts-ignoretime_entries')
        .insert(
            entries.map(entry => ({
                ...entry,
                organization_id: organizationId,
            }))
        )
        .select();

    if (error) throw error;

    revalidatePath('/app/time-entries');
    revalidatePath('/app');

    return data;
}

export async function updateTimeEntry(
    entryId: string,
    data: Partial<Tables['time_entries']['Update']>
) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { data: entry, error } = await supabase// @ts-ignoretime_entries')
        .update(data)
        .eq('id', entryId)
        .eq('organization_id', organizationId)
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/app/time-entries');
    revalidatePath('/app');

    return entry;
}

export async function deleteTimeEntry(entryId: string) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { error } = await supabase// @ts-ignoretime_entries')
        .delete()
        .eq('id', entryId)
        .eq('organization_id', organizationId);

    if (error) throw error;

    revalidatePath('/app/time-entries');
    revalidatePath('/app');
}

export async function deleteTimeEntries(entryIds: string[]) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { error } = await supabase// @ts-ignoretime_entries')
        .delete()
        .in('id', entryIds)
        .eq('organization_id', organizationId);

    if (error) throw error;

    revalidatePath('/app/time-entries');
    revalidatePath('/app');
}

// ============================================
// ALERT ACTIONS
// ============================================

export async function resolveAlert(alertId: string) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { error } = await supabase// @ts-ignorealerts')
        .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId)
        .eq('organization_id', organizationId);

    if (error) throw error;

    revalidatePath('/app/alerts');
    revalidatePath('/app');
}

export async function ignoreAlert(alertId: string) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { error } = await supabase// @ts-ignorealerts')
        .update({ status: 'ignored' })
        .eq('id', alertId)
        .eq('organization_id', organizationId);

    if (error) throw error;

    revalidatePath('/app/alerts');
    revalidatePath('/app');
}

// ============================================
// SETTINGS ACTIONS
// ============================================

export async function updateFinancialSettings(
    data: Partial<Tables['financial_settings']['Update']>
) {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    const { data: settings, error } = await supabase// @ts-ignorefinancial_settings')
        .update(data)
        .eq('organization_id', organizationId)
        .select()
        .single();

    if (error) throw error;

    revalidatePath('/app/settings');
    revalidatePath('/app');

    return settings;
}

// ============================================
// DEMO MODE ACTIONS
// ============================================

export async function enableDemoMode() {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    await supabase// @ts-ignoreorganizations')
        .update({ demo_mode: true })
        .eq('id', organizationId);

    revalidatePath('/app');
}

export async function disableDemoMode() {
    const organizationId = await getOrganizationId();
    if (!organizationId) throw new Error('Not authenticated');

    const supabase = await getSupabase();

    await supabase// @ts-ignoreorganizations')
        .update({ demo_mode: false })
        .eq('id', organizationId);

    revalidatePath('/app');
}
