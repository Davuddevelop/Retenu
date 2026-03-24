// src/app/app/clients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { runDetectionEngine, getDataStatus } from '../../lib/detectionEngine';
import { dataStore } from '../../lib/dataStore';
import { Client, RevenueAlert } from '../../lib/types';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { DemoModeBanner, NoClientsEmpty } from '../../components/EmptyStates';

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [alerts, setAlerts] = useState<RevenueAlert[]>([]);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const status = getDataStatus();
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <div className="space-y-6">
            {isDemoMode && <DemoModeBanner onDisable={handleDisableDemo} />}

            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-500">
                        {clients.length > 0
                            ? `${clients.length} client${clients.length !== 1 ? 's' : ''}`
                            : 'No clients yet'}
                    </p>
                </div>
                <Link
                    href="/app/clients/new"
                    className="px-4 py-2 bg-[var(--foreground)] text-[var(--card)] font-medium rounded-lg text-sm transition-colors hover:bg-white/90 inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Client
                </Link>
            </div>

            {clients.length === 0 ? (
                <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]" data-tutorial="clients-list">
                    <NoClientsEmpty />
                </div>
            ) : (
                <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden overflow-x-auto" data-tutorial="clients-list">
                    <table className="w-full text-left text-sm min-w-[600px]">
                        <thead className="border-b border-[var(--border)]">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500">Client</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500">Retainer</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500">Hours</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500">Status</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {clients.filter(c => c.status === 'active').map(client => {
                                const clientAlerts = alerts.filter(a => a.client_id === client.id);
                                return (
                                    <tr key={client.id} className="hover:bg-[var(--background)]/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                                            {client.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            ${client.agreed_monthly_retainer.toLocaleString()}/mo
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {client.hour_limit !== null ? `${client.hour_limit}` : '∞'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {clientAlerts.length > 0 ? (
                                                <span className="text-xs font-medium text-red-500">
                                                    {clientAlerts.length} alert{clientAlerts.length !== 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-green-500">
                                                    Healthy
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/app/clients/${client.id}`}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-[var(--foreground)] transition-colors"
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
            )}

            {/* Inactive Clients Section */}
            {clients.filter(c => c.status !== 'active').length > 0 && (
                <div>
                    <p className="text-sm text-gray-500 mb-3">Inactive Clients</p>
                    <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden opacity-50">
                        <table className="w-full text-left text-sm">
                            <tbody className="divide-y divide-[var(--border)]">
                                {clients.filter(c => c.status !== 'active').map(client => (
                                    <tr key={client.id} className="hover:bg-[var(--background)]/30 transition-colors">
                                        <td className="px-6 py-3 font-medium text-gray-400">{client.name}</td>
                                        <td className="px-6 py-3 text-gray-500">
                                            ${client.agreed_monthly_retainer.toLocaleString()}/mo
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="text-xs text-gray-500 capitalize">
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <Link
                                                href={`/app/clients/${client.id}`}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-400 transition-colors"
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
