// src/app/app/time-entries/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Clock, Plus, Minus } from 'lucide-react';
import { dataStore } from '../../../lib/dataStore';
import { useData } from '../../../providers/DataProvider';
import { createBrowserClient } from '@supabase/ssr';

interface TimeEntryRow {
    id: string;
    client_id: string;
    team_member: string;
    hours: string;
    date: string;
    description: string;
    billable: boolean;
}

const createEmptyRow = (): TimeEntryRow => ({
    id: Math.random().toString(36).substr(2, 9),
    client_id: '',
    team_member: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    billable: true,
});

export default function NewTimeEntryPage() {
    const router = useRouter();
    const { mode, organizationId: orgIdFromContext, clients: allClients, refreshTimeEntries } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<TimeEntryRow[]>([createEmptyRow()]);

    const clients = mode === 'supabase'
        ? allClients.filter(c => c.status === 'active')
        : dataStore.getActiveClients();

    const handleRowChange = (id: string, field: keyof TimeEntryRow, value: string | boolean) => {
        setRows(prev => prev.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const addRow = () => {
        // Copy client_id, team_member, and date from last row for convenience
        const lastRow = rows[rows.length - 1];
        const newRow = createEmptyRow();
        if (lastRow) {
            newRow.client_id = lastRow.client_id;
            newRow.team_member = lastRow.team_member;
            newRow.date = lastRow.date;
        }
        setRows([...rows, newRow]);
    };

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            setRows(rows.filter(row => row.id !== id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Validate rows
            const validRows = rows.filter(row => row.client_id && row.hours && parseFloat(row.hours) > 0);

            if (validRows.length === 0) {
                throw new Error('Please add at least one valid time entry with a client and hours.');
            }

            if (mode === 'supabase') {
                if (!orgIdFromContext) throw new Error('Organization not found');

                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const entries = validRows.map(row => ({
                    client_id: row.client_id,
                    organization_id: orgIdFromContext,
                    hours: parseFloat(row.hours),
                    date: row.date,
                    team_member: row.team_member.trim() || 'Unknown',
                    description: row.description.trim(),
                    billable: row.billable,
                    source: 'manual'
                }));

                const { error: insertError } = await supabase.from('time_entries').insert(entries);
                
                if (insertError) throw insertError;
                
                await refreshTimeEntries();
            } else {
                const org = dataStore.getOrganization();
                const organizationId = org?.id || 'default-org';

                // Create time entries
                const entries = validRows.map(row => ({
                    client_id: row.client_id,
                    organization_id: organizationId,
                    hours: parseFloat(row.hours),
                    date: row.date,
                    team_member: row.team_member.trim() || 'Unknown',
                    description: row.description.trim(),
                    billable: row.billable,
                }));

                dataStore.addTimeEntries(entries);
            }

            // Redirect to time entries list
            router.push('/app/time-entries');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add time entries');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalHours = rows.reduce((sum, row) => sum + (parseFloat(row.hours) || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Back Link */}
            <Link
                href="/app/time-entries"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-[var(--foreground)] transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Time Entries
            </Link>

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Log Time</h1>
                    <p className="text-gray-400">Add one or more time entries to track billable hours.</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-[var(--leak)]/10 border border-[var(--leak)]/20 rounded-lg">
                        <p className="text-sm text-[var(--leak)]">{error}</p>
                    </div>
                )}

                {/* Time Entry Rows */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Time Entries</h2>
                        <span className="text-sm text-gray-400">
                            {rows.length} entr{rows.length === 1 ? 'y' : 'ies'} • {totalHours.toFixed(1)} hours total
                        </span>
                    </div>

                    <div className="divide-y divide-[var(--border)]">
                        {rows.map((row, index) => (
                            <div key={row.id} className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-400">Entry {index + 1}</span>
                                    {rows.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRow(row.id)}
                                            className="p-1.5 text-gray-400 hover:text-[var(--leak)] hover:bg-[var(--leak)]/10 rounded-lg transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                    {/* Client */}
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                            Client <span className="text-[var(--leak)]">*</span>
                                        </label>
                                        <select
                                            value={row.client_id}
                                            onChange={(e) => handleRowChange(row.id, 'client_id', e.target.value)}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                            required
                                        >
                                            <option value="">Select client...</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>{client.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                            Date <span className="text-[var(--leak)]">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={row.date}
                                            onChange={(e) => handleRowChange(row.id, 'date', e.target.value)}
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                            required
                                        />
                                    </div>

                                    {/* Hours */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                            Hours <span className="text-[var(--leak)]">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={row.hours}
                                            onChange={(e) => handleRowChange(row.id, 'hours', e.target.value)}
                                            placeholder="0.0"
                                            min="0"
                                            step="0.25"
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                            required
                                        />
                                    </div>

                                    {/* Team Member */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                            Team Member
                                        </label>
                                        <input
                                            type="text"
                                            value={row.team_member}
                                            onChange={(e) => handleRowChange(row.id, 'team_member', e.target.value)}
                                            placeholder="Name"
                                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                        />
                                    </div>

                                    {/* Billable */}
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-2 cursor-pointer py-2">
                                            <input
                                                type="checkbox"
                                                checked={row.billable}
                                                onChange={(e) => handleRowChange(row.id, 'billable', e.target.checked)}
                                                className="rounded border-[var(--border)] bg-[var(--background)] text-[var(--profit)]"
                                            />
                                            <span className="text-sm text-[var(--foreground)]">Billable</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={row.description}
                                        onChange={(e) => handleRowChange(row.id, 'description', e.target.value)}
                                        placeholder="What did you work on?"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Row Button */}
                    <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]/50">
                        <button
                            type="button"
                            onClick={addRow}
                            className="w-full py-2.5 border border-dashed border-[var(--border)] rounded-lg text-sm font-medium text-gray-400 hover:text-[var(--foreground)] hover:border-[var(--neutral-metric)] transition-colors inline-flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Another Entry
                        </button>
                    </div>
                </div>

                {/* Quick Add Presets */}
                {clients.length > 0 && (
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                        <p className="text-sm text-gray-400 mb-3">Quick Add (common durations)</p>
                        <div className="flex flex-wrap gap-2">
                            {[0.5, 1, 2, 4, 8].map(hours => (
                                <button
                                    key={hours}
                                    type="button"
                                    onClick={() => {
                                        const currentRow = rows[rows.length - 1];
                                        if (currentRow && !currentRow.hours) {
                                            handleRowChange(currentRow.id, 'hours', hours.toString());
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-gray-400 hover:text-[var(--foreground)] hover:border-[var(--neutral-metric)] transition-colors"
                                >
                                    {hours}h
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit */}
                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/app/time-entries"
                        className="px-6 py-2.5 text-gray-400 hover:text-[var(--foreground)] font-medium rounded-lg text-sm transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting || rows.every(r => !r.client_id || !r.hours)}
                        className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--card)] font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Saving...' : `Save ${rows.filter(r => r.client_id && r.hours).length} Entr${rows.filter(r => r.client_id && r.hours).length === 1 ? 'y' : 'ies'}`}
                    </button>
                </div>
            </form>
        </div>
    );
}
