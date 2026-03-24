// src/app/app/alerts/page.tsx
'use client';

import { useState } from 'react';
import { useData } from '../../providers/DataProvider';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { NoAlertsEmpty } from '../../components/EmptyStates';
import { format, parseISO } from 'date-fns';
import type { RevenueAlert } from '../../lib/types';

export default function AlertsPage() {
    const { alerts, clients, isLoading } = useData();

    const [filterType, setFilterType] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterClient, setFilterClient] = useState<string>('all');

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Unknown Client';
    };

    const getAlertLabel = (type: RevenueAlert['alert_type']) => {
        switch (type) {
            case 'underbilling':
                return 'Underbilling';
            case 'scope_creep':
                return 'Scope Creep';
            case 'missing_invoice':
                return 'Missing Invoice';
            case 'late_payment':
                return 'Late Payment';
            case 'low_margin':
                return 'Low Margin';
            case 'negative_margin':
                return 'Negative Margin';
            default:
                return (type as string).replace(/_/g, ' ');
        }
    };

    // Filter alerts
    const filteredAlerts = alerts.filter(alert => {
        if (filterType !== 'all' && alert.alert_type !== filterType) return false;
        if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
        if (filterClient !== 'all' && alert.client_id !== filterClient) return false;
        return true;
    });

    // Calculate summary stats
    const totalLeakage = filteredAlerts.reduce((sum, a) => sum + a.estimated_leakage, 0);
    const criticalCount = filteredAlerts.filter(a => a.severity === 'critical').length;
    const highCount = filteredAlerts.filter(a => a.severity === 'high').length;

    // Group alerts by type
    const alertsByType = alerts.reduce((acc, alert) => {
        acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-sm text-gray-500">
                    {alerts.length > 0
                        ? `${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}`
                        : 'No revenue leaks detected'}
                </p>
            </div>

            {alerts.length === 0 ? (
                <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
                    <NoAlertsEmpty />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
                            <p className="text-xs text-gray-500 mb-2">Total Leakage</p>
                            <p className="text-2xl font-semibold text-red-500">{formatCurrency(totalLeakage)}</p>
                        </div>

                        <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
                            <p className="text-xs text-gray-500 mb-2">Critical</p>
                            <p className="text-2xl font-semibold text-[var(--foreground)]">{criticalCount}</p>
                        </div>

                        <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
                            <p className="text-xs text-gray-500 mb-2">High Priority</p>
                            <p className="text-2xl font-semibold text-[var(--foreground)]">{highCount}</p>
                        </div>
                    </div>

                    {/* Alert Type Filters */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filterType === 'all'
                                    ? 'bg-[var(--foreground)] text-[var(--card)]'
                                    : 'bg-[var(--card)] text-gray-400 hover:text-[var(--foreground)] border border-[var(--border)]'
                                }`}
                        >
                            All ({alerts.length})
                        </button>
                        {[
                            { type: 'underbilling', label: 'Underbilling' },
                            { type: 'scope_creep', label: 'Scope Creep' },
                            { type: 'missing_invoice', label: 'Missing Invoice' },
                            { type: 'late_payment', label: 'Late Payment' },
                            { type: 'low_margin', label: 'Low Margin' },
                            { type: 'negative_margin', label: 'Negative Margin' },
                        ].map(item => {
                            const count = alertsByType[item.type] || 0;
                            const isActive = filterType === item.type;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={item.type}
                                    onClick={() => setFilterType(isActive ? 'all' : item.type)}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${isActive
                                            ? 'bg-[var(--foreground)] text-[var(--card)]'
                                            : 'bg-[var(--card)] text-gray-400 hover:text-[var(--foreground)] border border-[var(--border)]'
                                        }`}
                                >
                                    {item.label} ({count})
                                </button>
                            );
                        })}
                    </div>

                    {/* Additional Filters */}
                    <div className="flex flex-wrap gap-3">
                        <div className="relative">
                            <select
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                                className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-lg pl-4 pr-10 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                            >
                                <option value="all">All Severity</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <select
                                value={filterClient}
                                onChange={(e) => setFilterClient(e.target.value)}
                                className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-lg pl-4 pr-10 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                            >
                                <option value="all">All Clients</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        {(filterType !== 'all' || filterSeverity !== 'all' || filterClient !== 'all') && (
                            <button
                                onClick={() => {
                                    setFilterType('all');
                                    setFilterSeverity('all');
                                    setFilterClient('all');
                                }}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-[var(--foreground)] transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/* Alerts List */}
                    <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden">
                        {filteredAlerts.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-sm text-gray-400">
                                    No alerts match your current filters.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border)]">
                                {filteredAlerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--background)]/30 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-sm font-medium text-[var(--foreground)]">
                                                    {getAlertLabel(alert.alert_type)}
                                                </h4>
                                                <span className="text-xs text-gray-500 capitalize">
                                                    {alert.severity}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-2">{alert.message}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>{getClientName(alert.client_id)}</span>
                                                <span>·</span>
                                                <span>{format(parseISO(alert.created_at), 'MMM dd, yyyy')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 md:ml-4">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">Est. Impact</p>
                                                <p className="text-lg font-semibold text-red-500">
                                                    {alert.estimated_leakage > 0 ? formatCurrency(alert.estimated_leakage) : '—'}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/app/clients/${alert.client_id}`}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-[var(--foreground)] transition-colors"
                                            >
                                                View
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
