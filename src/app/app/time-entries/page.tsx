// src/app/app/time-entries/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { dataStore } from '../../lib/dataStore';
import { getDataStatus } from '../../lib/detectionEngine';
import { TimeEntry, Client } from '../../lib/types';
import Link from 'next/link';
import { Plus, Trash2, Upload, ChevronDown, Search, Clock, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { DemoModeBanner, NoTimeEntriesEmpty } from '../../components/EmptyStates';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';

export default function TimeEntriesPage() {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
    const [filterClient, setFilterClient] = useState<string>('all');
    const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
    const [searchQuery, setSearchQuery] = useState('');

    const loadEntries = () => {
        setEntries(dataStore.getTimeEntries());
    };

    useEffect(() => {
        const initializeData = () => {
            const status = getDataStatus();
            setIsDemoMode(status.isDemoMode);
            setClients(dataStore.getClients());
            setEntries(dataStore.getTimeEntries());
            setIsLoading(false);
        };
        initializeData();
    }, []);

    const handleDisableDemo = () => {
        dataStore.disableDemoMode();
        window.location.reload();
    };

    const handleDeleteEntry = (id: string) => {
        if (confirm('Are you sure you want to delete this time entry?')) {
            dataStore.deleteTimeEntry(id);
            loadEntries();
            setSelectedEntries(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleDeleteSelected = () => {
        if (selectedEntries.size === 0) return;
        if (confirm(`Are you sure you want to delete ${selectedEntries.size} time entries?`)) {
            dataStore.deleteTimeEntries(Array.from(selectedEntries));
            loadEntries();
            setSelectedEntries(new Set());
        }
    };

    const toggleSelectEntry = (id: string) => {
        setSelectedEntries(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedEntries.size === filteredEntries.length) {
            setSelectedEntries(new Set());
        } else {
            setSelectedEntries(new Set(filteredEntries.map(e => e.id)));
        }
    };

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Unknown Client';
    };

    // Filter entries
    const filteredEntries = entries.filter(entry => {
        // Filter by client
        if (filterClient !== 'all' && entry.client_id !== filterClient) {
            return false;
        }

        // Filter by month
        if (filterMonth) {
            const [year, month] = filterMonth.split('-');
            const entryDate = parseISO(entry.date);
            const start = startOfMonth(new Date(parseInt(year), parseInt(month) - 1));
            const end = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));
            if (entryDate < start || entryDate > end) {
                return false;
            }
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const clientName = getClientName(entry.client_id).toLowerCase();
            const teamMember = entry.team_member.toLowerCase();
            const description = entry.description?.toLowerCase() || '';
            if (!clientName.includes(query) && !teamMember.includes(query) && !description.includes(query)) {
                return false;
            }
        }

        return true;
    }).sort((a, b) => b.date.localeCompare(a.date));

    // Calculate totals with more detail
    const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
    const billableHours = filteredEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0);
    const nonBillableHours = totalHours - billableHours;
    const billablePercent = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

    // Get settings for value calculation
    const settings = dataStore.getSettings();
    const estimatedValue = billableHours * (settings?.default_internal_hourly_rate || 150);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {isDemoMode && <DemoModeBanner onDisable={handleDisableDemo} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-tutorial="time-entries-header">
                <div>
                    <p className="text-sm text-gray-400">
                        {entries.length > 0
                            ? `${totalHours.toFixed(1)} hrs tracked · ${billablePercent.toFixed(0)}% billable`
                            : 'Start tracking your time'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/app/time-entries/upload"
                        className="px-4 py-2.5 border border-[var(--border)] text-[var(--foreground)] font-medium rounded-xl text-sm transition-all hover:bg-[var(--background)] hover:border-[var(--neutral-metric)]/30 inline-flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Import CSV
                    </Link>
                    <Link
                        href="/app/time-entries/new"
                        className="px-4 py-2.5 bg-[var(--foreground)] text-[var(--card)] font-medium rounded-xl text-sm transition-all hover:bg-white/90 hover:scale-[1.02] inline-flex items-center gap-2 shadow-lg shadow-white/5"
                    >
                        <Plus className="w-4 h-4" />
                        Add Entry
                    </Link>
                </div>
            </div>

            {entries.length === 0 ? (
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
                    <NoTimeEntriesEmpty />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-[var(--neutral-metric)]/20 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-[var(--neutral-metric)]" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
                            </div>
                            <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums">
                                {totalHours.toFixed(1)}h
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{filteredEntries.length} entries</p>
                        </div>

                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Billable</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-500 tabular-nums">
                                {billableHours.toFixed(1)}h
                            </p>
                            <div className="mt-2">
                                <div className="h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all"
                                        style={{ width: `${billablePercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-gray-500/20 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Non-Billable</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-400 tabular-nums">
                                {nonBillableHours.toFixed(1)}h
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{(100 - billablePercent).toFixed(0)}% of total</p>
                        </div>

                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-[var(--profit)]/20 flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-[var(--profit)]" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Est. Value</span>
                            </div>
                            <p className="text-2xl font-bold text-[var(--profit)] tabular-nums">
                                ${estimatedValue.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">at ${settings?.default_internal_hourly_rate || 150}/hr</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by client, team member, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)] transition-all"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <select
                                    value={filterClient}
                                    onChange={(e) => setFilterClient(e.target.value)}
                                    className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-xl pl-4 pr-10 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)] transition-all"
                                >
                                    <option value="all">All Clients</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                            <input
                                type="month"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)] transition-all"
                            />
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedEntries.size > 0 && (
                        <div className="bg-[var(--leak)]/10 border border-[var(--leak)]/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
                            <span className="text-sm font-medium text-[var(--foreground)]">
                                {selectedEntries.size} entr{selectedEntries.size === 1 ? 'y' : 'ies'} selected
                            </span>
                            <button
                                onClick={handleDeleteSelected}
                                className="px-4 py-2 bg-[var(--leak)] text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors inline-flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Selected
                            </button>
                        </div>
                    )}

                    {/* Time Entries Table */}
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[800px]">
                                <thead className="border-b border-[var(--border)] bg-[var(--background)]/50">
                                    <tr>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-400 w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedEntries.size === filteredEntries.length && filteredEntries.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-[var(--border)] bg-[var(--background)]"
                                            />
                                        </th>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Team Member</th>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Hours</th>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Billable</th>
                                        <th className="px-4 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {filteredEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                                                No time entries match your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEntries.map(entry => (
                                            <tr key={entry.id} className="hover:bg-[var(--background)]/50 transition-colors group">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEntries.has(entry.id)}
                                                        onChange={() => toggleSelectEntry(entry.id)}
                                                        className="rounded border-[var(--border)] bg-[var(--background)]"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-[var(--foreground)]">
                                                    {format(parseISO(entry.date), 'MMM d, yyyy')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded bg-[var(--neutral-metric)]/20 flex items-center justify-center text-[var(--neutral-metric)] font-bold text-[10px]">
                                                            {getClientName(entry.client_id).charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-[var(--foreground)]">
                                                            {getClientName(entry.client_id)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-400">
                                                    {entry.team_member}
                                                </td>
                                                <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate">
                                                    {entry.description || <span className="text-gray-600">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-bold text-[var(--foreground)] tabular-nums">
                                                        {entry.hours.toFixed(1)}h
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {entry.billable ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 rounded-full">
                                                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                                            Billable
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-gray-500/10 text-gray-500 rounded-full">
                                                            Internal
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteEntry(entry.id)}
                                                        className="p-2 text-gray-400 hover:text-[var(--leak)] hover:bg-[var(--leak)]/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Delete entry"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
