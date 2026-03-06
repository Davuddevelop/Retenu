// src/app/app/time-entries/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { dataStore } from '../../lib/dataStore';
import { getDataStatus } from '../../lib/detectionEngine';
import { TimeEntry, Client } from '../../lib/types';
import Link from 'next/link';
import { Plus, Clock, Trash2, Calendar, User, FileText, Upload, ChevronDown, Filter, Search } from 'lucide-react';
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

    useEffect(() => {
        const status = getDataStatus();
        setIsDemoMode(status.isDemoMode);
        setClients(dataStore.getClients());
        loadEntries();
        setIsLoading(false);
    }, []);

    const loadEntries = () => {
        setEntries(dataStore.getTimeEntries());
    };

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

    // Calculate totals
    const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
    const billableHours = filteredEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0);

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Time Entries</h1>
                    <p className="text-gray-400 mt-1">
                        {entries.length > 0
                            ? `${totalHours.toFixed(1)} total hours (${billableHours.toFixed(1)} billable)`
                            : 'Track hours to calculate margins and detect scope creep.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/app/time-entries/upload"
                        className="px-4 py-2 border border-[var(--border)] text-[var(--foreground)] font-medium rounded-lg text-sm transition-colors hover:bg-[var(--background)] inline-flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Import CSV
                    </Link>
                    <Link
                        href="/app/time-entries/new"
                        className="px-4 py-2 bg-[var(--foreground)] text-[var(--card)] font-bold rounded-lg text-sm transition-colors hover:bg-gray-200 inline-flex items-center gap-2"
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
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by client, team member, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <select
                                    value={filterClient}
                                    onChange={(e) => setFilterClient(e.target.value)}
                                    className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-lg pl-4 pr-10 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
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
                                className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                            />
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedEntries.size > 0 && (
                        <div className="bg-[var(--leak)]/10 border border-[var(--leak)]/20 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-[var(--foreground)]">
                                {selectedEntries.size} entr{selectedEntries.size === 1 ? 'y' : 'ies'} selected
                            </span>
                            <button
                                onClick={handleDeleteSelected}
                                className="px-3 py-1.5 bg-[var(--leak)] text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors inline-flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Selected
                            </button>
                        </div>
                    )}

                    {/* Time Entries Table */}
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[var(--background)]/50 border-b border-[var(--border)] text-gray-400">
                                <tr>
                                    <th className="px-4 py-4 font-medium w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedEntries.size === filteredEntries.length && filteredEntries.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-[var(--border)] bg-[var(--background)]"
                                        />
                                    </th>
                                    <th className="px-4 py-4 font-medium">Date</th>
                                    <th className="px-4 py-4 font-medium">Client</th>
                                    <th className="px-4 py-4 font-medium">Team Member</th>
                                    <th className="px-4 py-4 font-medium">Description</th>
                                    <th className="px-4 py-4 font-medium text-right">Hours</th>
                                    <th className="px-4 py-4 font-medium text-center">Billable</th>
                                    <th className="px-4 py-4 font-medium text-right">Actions</th>
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
                                        <tr key={entry.id} className="hover:bg-[var(--background)]/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEntries.has(entry.id)}
                                                    onChange={() => toggleSelectEntry(entry.id)}
                                                    className="rounded border-[var(--border)] bg-[var(--background)]"
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-[var(--foreground)]">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    {format(parseISO(entry.date), 'MMM dd, yyyy')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 font-medium text-[var(--foreground)]">
                                                {getClientName(entry.client_id)}
                                            </td>
                                            <td className="px-4 py-4 text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    {entry.team_member}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-400 max-w-xs truncate">
                                                {entry.description || '—'}
                                            </td>
                                            <td className="px-4 py-4 text-right font-medium text-[var(--foreground)]">
                                                {entry.hours.toFixed(1)}h
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {entry.billable ? (
                                                    <span className="text-xs px-2 py-1 rounded-md bg-[var(--profit)]/10 text-[var(--profit)] font-medium">
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="text-xs px-2 py-1 rounded-md bg-gray-500/10 text-gray-500 font-medium">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                    className="p-2 text-gray-400 hover:text-[var(--leak)] hover:bg-[var(--leak)]/10 rounded-lg transition-colors"
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

                    {/* Summary Footer */}
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-400">Total Entries</p>
                                <p className="text-xl font-bold text-[var(--foreground)]">{filteredEntries.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Hours</p>
                                <p className="text-xl font-bold text-[var(--foreground)]">{totalHours.toFixed(1)}h</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Billable Hours</p>
                                <p className="text-xl font-bold text-[var(--profit)]">{billableHours.toFixed(1)}h</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Non-Billable</p>
                                <p className="text-xl font-bold text-gray-400">{(totalHours - billableHours).toFixed(1)}h</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
