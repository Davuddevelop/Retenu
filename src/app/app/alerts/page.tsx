// src/app/app/alerts/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useData } from '../../providers/DataProvider';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { NoAlertsEmpty } from '../../components/EmptyStates';

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(val);
};

const getAlertLabel = (type: string) => {
    switch (type) {
        case 'underbilling': return 'Unbilled hours';
        case 'scope_creep': return 'Scope creep';
        case 'missing_invoice': return 'Missing invoice';
        case 'late_payment': return 'Late payment';
        case 'low_margin': return 'Low margin';
        case 'negative_margin': return 'Negative margin';
        default: return (type as string).replace(/_/g, ' ');
    }
};

const getSeverityLabel = (severity: string) => {
    switch (severity) {
        case 'critical': return { label: 'Critical', color: 'text-red-400' };
        case 'high': return { label: 'High', color: 'text-[#FF5733]' };
        case 'medium': return { label: 'Medium', color: 'text-yellow-500' };
        default: return { label: 'Low', color: 'text-gray-500' };
    }
};

export default function AlertsPage() {
    const { alerts, clients, isLoading } = useData();

    const [filterType, setFilterType] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterClient, setFilterClient] = useState<string>('all');

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Unknown';
    };

    const filteredAlerts = useMemo(() => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return alerts
            .filter(alert => {
                if (filterType !== 'all' && alert.alert_type !== filterType) return false;
                if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
                if (filterClient !== 'all' && alert.client_id !== filterClient) return false;
                return true;
            })
            .sort((a, b) => {
                const severityDiff = (severityOrder[a.severity as keyof typeof severityOrder] || 3) -
                                     (severityOrder[b.severity as keyof typeof severityOrder] || 3);
                if (severityDiff !== 0) return severityDiff;
                return b.estimated_leakage - a.estimated_leakage;
            });
    }, [alerts, filterType, filterSeverity, filterClient]);

    const stats = useMemo(() => {
        const totalLeakage = filteredAlerts.reduce((sum, a) => sum + a.estimated_leakage, 0);
        const criticalCount = filteredAlerts.filter(a => a.severity === 'critical').length;
        const highCount = filteredAlerts.filter(a => a.severity === 'high').length;
        const affectedClients = new Set(filteredAlerts.map(a => a.client_id)).size;
        return { totalLeakage, criticalCount, highCount, affectedClients };
    }, [filteredAlerts]);

    const alertsByType = useMemo(() => {
        return alerts.reduce((acc, alert) => {
            acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [alerts]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Bar */}
            {alerts.length > 0 && (
                <div className="flex items-center gap-8 text-base">
                    <div>
                        <span className="text-gray-500">Total at risk</span>
                        <span className="ml-3 text-[#FF5733] font-semibold tabular-nums text-lg">{formatCurrency(stats.totalLeakage)}</span>
                    </div>
                    <div className="w-px h-5 bg-[#222]" />
                    <div>
                        <span className="text-gray-500">Critical</span>
                        <span className={`ml-3 font-semibold tabular-nums text-lg ${stats.criticalCount > 0 ? 'text-red-400' : 'text-white'}`}>{stats.criticalCount}</span>
                    </div>
                    <div className="w-px h-5 bg-[#222]" />
                    <div>
                        <span className="text-gray-500">High</span>
                        <span className={`ml-3 font-semibold tabular-nums text-lg ${stats.highCount > 0 ? 'text-[#FF5733]' : 'text-white'}`}>{stats.highCount}</span>
                    </div>
                    <div className="w-px h-5 bg-[#222]" />
                    <div>
                        <span className="text-gray-500">Clients affected</span>
                        <span className="ml-3 text-white font-semibold tabular-nums text-lg">{stats.affectedClients}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-base text-gray-500">
                    {alerts.length > 0
                        ? `${filteredAlerts.length} issue${filteredAlerts.length !== 1 ? 's' : ''}`
                        : 'No issues detected'}
                </p>

                {/* Filters */}
                {alerts.length > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                                className="appearance-none bg-[#111113] border border-[#1c1c1f] rounded-lg pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#333]"
                            >
                                <option value="all">All severity</option>
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
                                className="appearance-none bg-[#111113] border border-[#1c1c1f] rounded-lg pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#333]"
                            >
                                <option value="all">All clients</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>

                        {(filterSeverity !== 'all' || filterClient !== 'all') && (
                            <button
                                onClick={() => {
                                    setFilterSeverity('all');
                                    setFilterClient('all');
                                }}
                                className="text-sm text-gray-500 hover:text-white transition-colors px-2"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Type Filters */}
            {alerts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            filterType === 'all'
                                ? 'bg-white text-black'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        All
                    </button>
                    {[
                        { type: 'underbilling', label: 'Unbilled' },
                        { type: 'scope_creep', label: 'Scope creep' },
                        { type: 'missing_invoice', label: 'Missing invoice' },
                        { type: 'late_payment', label: 'Late payment' },
                        { type: 'low_margin', label: 'Low margin' },
                    ].map(item => {
                        const count = alertsByType[item.type] || 0;
                        if (count === 0) return null;
                        return (
                            <button
                                key={item.type}
                                onClick={() => setFilterType(filterType === item.type ? 'all' : item.type)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    filterType === item.type
                                        ? 'bg-white text-black'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {item.label} ({count})
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Alerts List */}
            {alerts.length === 0 ? (
                <div className="bg-[#111113] rounded-lg border border-[#1c1c1f]">
                    <NoAlertsEmpty />
                </div>
            ) : filteredAlerts.length === 0 ? (
                <div className="bg-[#111113] rounded-lg border border-[#1c1c1f] p-12 text-center">
                    <p className="text-base text-gray-500">No alerts match your filters.</p>
                </div>
            ) : (
                <div className="bg-[#111113] rounded-lg border border-[#1c1c1f] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="border-b border-[#1c1c1f]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Issue</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Client</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Severity</th>
                                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Impact</th>
                                <th className="px-6 py-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1c1f]">
                            {filteredAlerts.map((alert) => {
                                const severity = getSeverityLabel(alert.severity);
                                return (
                                    <tr key={alert.id} className="hover:bg-[#0a0a0b] transition-colors group">
                                        <td className="px-6 py-5">
                                            <div>
                                                <span className="text-white font-medium text-base">{getAlertLabel(alert.alert_type)}</span>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-1 max-w-lg">{alert.message}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-[#1c1c1f] flex items-center justify-center text-gray-400 text-xs font-medium">
                                                    {getClientName(alert.client_id).slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-gray-300">{getClientName(alert.client_id)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`text-base font-medium ${severity.color}`}>{severity.label}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {alert.estimated_leakage > 0 ? (
                                                <span className="text-[#FF5733] font-semibold tabular-nums text-base">{formatCurrency(alert.estimated_leakage)}</span>
                                            ) : (
                                                <span className="text-gray-500">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <Link
                                                href={`/app/clients/${alert.client_id}`}
                                                className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Critical warning */}
            {stats.criticalCount > 0 && (
                <p className="text-base text-gray-500">
                    <span className="text-red-400 font-medium">{stats.criticalCount} critical</span> issue{stats.criticalCount !== 1 ? 's' : ''} requiring immediate attention.
                </p>
            )}
        </div>
    );
}
