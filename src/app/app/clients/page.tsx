// src/app/app/clients/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { runDetectionEngine, getDataStatus } from '../../lib/detectionEngine';
import { dataStore } from '../../lib/dataStore';
import { Client, RevenueAlert, TimeEntry } from '../../lib/types';
import Link from 'next/link';
import { ArrowRight, Plus, Users, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DemoModeBanner, NoClientsEmpty } from '../../components/EmptyStates';

// Format currency with specific cents for human-touch feel
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [alerts, setAlerts] = useState<RevenueAlert[]>([]);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const status = getDataStatus();
        setIsDemoMode(status.isDemoMode);
        setClients(dataStore.getClients());
        setAlerts(runDetectionEngine());
        setTimeEntries(dataStore.getTimeEntries());
        setIsLoading(false);
    }, []);

    // Calculate stats for summary cards
    const stats = useMemo(() => {
        const activeClients = clients.filter(c => c.status === 'active');
        const totalRetainer = activeClients.reduce((sum, c) => sum + c.agreed_monthly_retainer, 0);
        const clientsWithAlerts = new Set(alerts.map(a => a.client_id)).size;
        const healthyClients = activeClients.length - clientsWithAlerts;

        return {
            activeCount: activeClients.length,
            totalRetainer,
            healthyClients,
            clientsWithAlerts,
        };
    }, [clients, alerts]);

    // Get hours worked for a client this month
    const getClientHoursThisMonth = (clientId: string) => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return timeEntries
            .filter(e => e.client_id === clientId && new Date(e.date) >= startOfMonth)
            .reduce((sum, e) => sum + e.hours, 0);
    };

    const handleDisableDemo = () => {
        dataStore.disableDemoMode();
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)]" />
            </div>
        );
    }

    const activeClients = clients.filter(c => c.status === 'active');
    const inactiveClients = clients.filter(c => c.status !== 'active');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {isDemoMode && <DemoModeBanner onDisable={handleDisableDemo} />}

            {/* Summary Cards */}
            {clients.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-[var(--neutral-metric)]/20 flex items-center justify-center">
                                <Users className="w-4 h-4 text-[var(--neutral-metric)]" />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Active</span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums">
                            {stats.activeCount}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.activeCount === 1 ? 'client' : 'clients'}
                        </p>
                    </div>

                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-[var(--profit)]/20 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-[var(--profit)]" />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">MRR</span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums">
                            {formatCurrency(stats.totalRetainer)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">monthly recurring</p>
                    </div>

                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Healthy</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-500 tabular-nums">
                            {stats.healthyClients}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">no issues</p>
                    </div>

                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-[var(--leak)]/20 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-[var(--leak)]" />
                            </div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Attention</span>
                        </div>
                        <p className="text-2xl font-bold text-[var(--leak)] tabular-nums">
                            {stats.clientsWithAlerts}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">need review</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-400">
                        {clients.length > 0
                            ? `Showing ${activeClients.length} active client${activeClients.length !== 1 ? 's' : ''}`
                            : 'Get started by adding your first client'}
                    </p>
                </div>
                <Link
                    href="/app/clients/new"
                    className="px-4 py-2.5 bg-[var(--foreground)] text-[var(--card)] font-medium rounded-xl text-sm transition-all hover:bg-white/90 hover:scale-[1.02] inline-flex items-center gap-2 shadow-lg shadow-white/5"
                >
                    <Plus className="w-4 h-4" />
                    Add Client
                </Link>
            </div>

            {/* Client List */}
            {clients.length === 0 ? (
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]" data-tutorial="clients-list">
                    <NoClientsEmpty />
                </div>
            ) : (
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden" data-tutorial="clients-list">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[700px]">
                            <thead className="border-b border-[var(--border)] bg-[var(--background)]/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Retainer</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Hours This Month</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Health</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {activeClients.map(client => {
                                    const clientAlerts = alerts.filter(a => a.client_id === client.id);
                                    const hoursThisMonth = getClientHoursThisMonth(client.id);
                                    const hourLimit = client.hour_limit;
                                    const hoursPercent = hourLimit ? (hoursThisMonth / hourLimit) * 100 : 0;
                                    const isOverHours = hourLimit && hoursThisMonth > hourLimit;

                                    return (
                                        <tr key={client.id} className="hover:bg-[var(--background)]/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neutral-metric)]/20 to-[var(--neutral-metric)]/5 flex items-center justify-center text-[var(--neutral-metric)] font-bold text-sm">
                                                        {client.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[var(--foreground)]">{client.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {clientAlerts.length > 0 ? `${clientAlerts.length} issue${clientAlerts.length > 1 ? 's' : ''} found` : 'No issues'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-[var(--foreground)] tabular-nums">
                                                    {formatCurrency(client.agreed_monthly_retainer)}
                                                </p>
                                                <p className="text-xs text-gray-500">per month</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 max-w-[100px]">
                                                        <p className={`font-semibold tabular-nums ${isOverHours ? 'text-[var(--leak)]' : 'text-[var(--foreground)]'}`}>
                                                            {hoursThisMonth.toFixed(1)}h
                                                        </p>
                                                        {hourLimit && (
                                                            <div className="mt-1.5">
                                                                <div className="h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all ${
                                                                            hoursPercent > 100 ? 'bg-[var(--leak)]' :
                                                                            hoursPercent > 80 ? 'bg-amber-500' :
                                                                            'bg-[var(--profit)]'
                                                                        }`}
                                                                        style={{ width: `${Math.min(hoursPercent, 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        / {hourLimit !== null ? `${hourLimit}h` : '∞'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {clientAlerts.length > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[var(--leak)]/10 text-[var(--leak)] rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--leak)] animate-pulse" />
                                                        {clientAlerts.length} alert{clientAlerts.length !== 1 ? 's' : ''}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-500 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        Healthy
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/app/clients/${client.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)] rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    View
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Inactive Clients Section */}
            {inactiveClients.length > 0 && (
                <div>
                    <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-500" />
                        Inactive Clients ({inactiveClients.length})
                    </p>
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden opacity-60 hover:opacity-80 transition-opacity">
                        <table className="w-full text-left text-sm">
                            <tbody className="divide-y divide-[var(--border)]">
                                {inactiveClients.map(client => (
                                    <tr key={client.id} className="hover:bg-[var(--background)]/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-500 font-medium text-sm">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-400">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 tabular-nums">
                                            {formatCurrency(client.agreed_monthly_retainer)}/mo
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-500 capitalize px-2 py-0.5 bg-gray-500/10 rounded">
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/app/clients/${client.id}`}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                View
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
