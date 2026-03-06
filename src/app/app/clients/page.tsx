// src/app/app/clients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { runDetectionEngine, getDataStatus } from '../../lib/detectionEngine';
import { dataStore } from '../../lib/dataStore';
import { Client, RevenueAlert } from '../../lib/types';
import Link from 'next/link';
import { ChevronRight, ShieldAlert, ShieldCheck, Plus, Users } from 'lucide-react';
import { DemoModeBanner, NoClientsEmpty } from '../../components/EmptyStates';

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [alerts, setAlerts] = useState<RevenueAlert[]>([]);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const status = getDataStatus();
        setIsDemoMode(status.isDemoMode);
        setClients(dataStore.getClients());
        setAlerts(runDetectionEngine());
        setIsLoading(false);
    }, []);

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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {isDemoMode && <DemoModeBanner onDisable={handleDisableDemo} />}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Clients</h1>
                    <p className="text-gray-400 mt-1">
                        {clients.length > 0
                            ? `Managing ${clients.length} client${clients.length !== 1 ? 's' : ''}`
                            : 'Manage your service accounts and monitor revenue health.'}
                    </p>
                </div>
                <Link
                    href="/app/clients/new"
                    className="px-4 py-2 bg-[var(--foreground)] text-[var(--card)] font-bold rounded-lg text-sm transition-colors hover:bg-gray-200 inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Client
                </Link>
            </div>

            {clients.length === 0 ? (
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
                    <NoClientsEmpty />
                </div>
            ) : (
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--background)]/50 border-b border-[var(--border)] text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Client Name</th>
                                <th className="px-6 py-4 font-medium">Retainer</th>
                                <th className="px-6 py-4 font-medium">Hour Limit</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {clients.filter(c => c.status === 'active').map(client => {
                                const clientAlerts = alerts.filter(a => a.client_id === client.id);
                                return (
                                    <tr key={client.id} className="hover:bg-[var(--background)]/50 transition-colors">
                                        <td className="px-6 py-4 font-medium border-l-2 border-transparent hover:border-l-[var(--neutral-metric)] text-[var(--foreground)]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-gray-500" />
                                                </div>
                                                {client.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            ${client.agreed_monthly_retainer.toLocaleString()}/mo
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {client.hour_limit !== null ? `${client.hour_limit} hrs` : 'Unlimited'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {clientAlerts.length > 0 ? (
                                                <div className="flex items-center gap-1.5 text-[var(--leak)] font-medium text-xs bg-[var(--leak)]/10 w-fit px-2 py-1 rounded-md">
                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                    {clientAlerts.length} Alert{clientAlerts.length !== 1 ? 's' : ''}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-[var(--profit)] font-medium text-xs bg-[var(--profit)]/10 w-fit px-2 py-1 rounded-md">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    Healthy
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/app/clients/${client.id}`}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-[var(--foreground)] transition-colors"
                                            >
                                                View
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

            {/* Inactive Clients Section */}
            {clients.filter(c => c.status !== 'active').length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-400 mb-4">Inactive Clients</h2>
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden opacity-60">
                        <table className="w-full text-left text-sm">
                            <tbody className="divide-y divide-[var(--border)]">
                                {clients.filter(c => c.status !== 'active').map(client => (
                                    <tr key={client.id} className="hover:bg-[var(--background)]/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-400">{client.name}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            ${client.agreed_monthly_retainer.toLocaleString()}/mo
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs px-2 py-1 rounded-md bg-gray-700 text-gray-400 capitalize">
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/app/clients/${client.id}`}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-400 transition-colors"
                                            >
                                                View
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
