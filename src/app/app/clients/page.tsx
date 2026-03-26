// src/app/app/clients/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { runDetectionEngine, getDataStatus } from '../../lib/detectionEngine';
import { dataStore } from '../../lib/dataStore';
import { Client, RevenueAlert, TimeEntry } from '../../lib/types';
import Link from 'next/link';
import { Plus, ChevronRight } from 'lucide-react';
import { DemoModeBanner, NoClientsEmpty } from '../../components/EmptyStates';

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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400" />
            </div>
        );
    }

    const activeClients = clients.filter(c => c.status === 'active');
    const inactiveClients = clients.filter(c => c.status !== 'active');

    return (
        <div className="space-y-6">
            {isDemoMode && <DemoModeBanner onDisable={handleDisableDemo} />}

            {/* Compact Stats Bar */}
            {clients.length > 0 && (
                <div className="flex items-center gap-6 text-sm">
                    <div>
                        <span className="text-gray-500">Active</span>
                        <span className="ml-2 text-white font-medium tabular-nums">{stats.activeCount}</span>
                    </div>
                    <div className="w-px h-4 bg-[#222]" />
                    <div>
                        <span className="text-gray-500">MRR</span>
                        <span className="ml-2 text-white font-medium tabular-nums">{formatCurrency(stats.totalRetainer)}</span>
                    </div>
                    <div className="w-px h-4 bg-[#222]" />
                    <div>
                        <span className="text-gray-500">Healthy</span>
                        <span className="ml-2 text-white font-medium tabular-nums">{stats.healthyClients}</span>
                    </div>
                    {stats.clientsWithAlerts > 0 && (
                        <>
                            <div className="w-px h-4 bg-[#222]" />
                            <div>
                                <span className="text-gray-500">Attention</span>
                                <span className="ml-2 text-[#FF5733] font-medium tabular-nums">{stats.clientsWithAlerts}</span>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                    {clients.length > 0
                        ? `${activeClients.length} active client${activeClients.length !== 1 ? 's' : ''}`
                        : 'Get started by adding your first client'}
                </p>
                <Link
                    href="/app/clients/new"
                    className="px-3 py-1.5 bg-white text-black font-medium rounded-md text-sm hover:bg-gray-100 transition-colors inline-flex items-center gap-1.5"
                >
                    <Plus className="w-4 h-4" />
                    Add Client
                </Link>
            </div>

            {/* Client List */}
            {clients.length === 0 ? (
                <div className="bg-[#111113] rounded-lg border border-[#1c1c1f]" data-tutorial="clients-list">
                    <NoClientsEmpty />
                </div>
            ) : (
                <div className="bg-[#111113] rounded-lg border border-[#1c1c1f] overflow-hidden" data-tutorial="clients-list">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-[#1c1c1f]">
                            <tr>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Client</th>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Retainer</th>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Hours</th>
                                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1c1f]">
                            {activeClients.map(client => {
                                const clientAlerts = alerts.filter(a => a.client_id === client.id);
                                const hoursThisMonth = getClientHoursThisMonth(client.id);
                                const hourLimit = client.hour_limit;
                                const isOverHours = hourLimit && hoursThisMonth > hourLimit;

                                return (
                                    <tr key={client.id} className="hover:bg-[#0a0a0b] transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-[#1c1c1f] flex items-center justify-center text-gray-400 text-xs font-medium">
                                                    {client.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-white">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-white tabular-nums">{formatCurrency(client.agreed_monthly_retainer)}</span>
                                            <span className="text-gray-500">/mo</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`tabular-nums ${isOverHours ? 'text-[#FF5733]' : 'text-white'}`}>
                                                {hoursThisMonth.toFixed(1)}
                                            </span>
                                            <span className="text-gray-500">
                                                {hourLimit ? ` / ${hourLimit}h` : 'h'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {clientAlerts.length > 0 ? (
                                                <span className="text-[#FF5733] text-sm">
                                                    {clientAlerts.length} alert{clientAlerts.length !== 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-sm">Healthy</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/app/clients/${client.id}`}
                                                className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Inactive Clients */}
            {inactiveClients.length > 0 && (
                <div>
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                        Inactive ({inactiveClients.length})
                    </p>
                    <div className="bg-[#111113] rounded-lg border border-[#1c1c1f] overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <tbody className="divide-y divide-[#1c1c1f]">
                                {inactiveClients.map(client => (
                                    <tr key={client.id} className="hover:bg-[#0a0a0b] transition-colors group opacity-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-[#1c1c1f] flex items-center justify-center text-gray-500 text-xs font-medium">
                                                    {client.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-gray-400">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 tabular-nums">
                                            {formatCurrency(client.agreed_monthly_retainer)}/mo
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-gray-500 capitalize">{client.status}</span>
                                        </td>
                                        <td className="px-4 py-3 w-10">
                                            <Link
                                                href={`/app/clients/${client.id}`}
                                                className="text-gray-600 hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <ChevronRight className="w-4 h-4" />
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
