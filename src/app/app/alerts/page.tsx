// src/app/app/alerts/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { useData } from '../../providers/DataProvider';
import Link from 'next/link';
import { ArrowRight, ChevronDown, AlertTriangle, TrendingDown, Clock, FileWarning, DollarSign, Flame } from 'lucide-react';
import { NoAlertsEmpty } from '../../components/EmptyStates';
import { parseISO, formatDistanceToNow } from 'date-fns';
import type { RevenueAlert } from '../../lib/types';

// Format currency with cents for human touch
const formatCurrency = (val: number, showCents = false) => {
    if (showCents) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(val);
};

// Get icon for alert type
const getAlertIcon = (type: RevenueAlert['alert_type']) => {
    switch (type) {
        case 'underbilling':
            return DollarSign;
        case 'scope_creep':
            return TrendingDown;
        case 'missing_invoice':
            return FileWarning;
        case 'late_payment':
            return Clock;
        case 'low_margin':
        case 'negative_margin':
            return AlertTriangle;
        default:
            return AlertTriangle;
    }
};

// Get severity color
const getSeverityStyles = (severity: string) => {
    switch (severity) {
        case 'critical':
            return {
                bg: 'bg-red-500/10',
                border: 'border-red-500/30',
                text: 'text-red-500',
                dot: 'bg-red-500',
                label: 'Critical'
            };
        case 'high':
            return {
                bg: 'bg-orange-500/10',
                border: 'border-orange-500/30',
                text: 'text-orange-500',
                dot: 'bg-orange-500',
                label: 'High'
            };
        case 'medium':
            return {
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/30',
                text: 'text-amber-500',
                dot: 'bg-amber-500',
                label: 'Medium'
            };
        default:
            return {
                bg: 'bg-gray-500/10',
                border: 'border-gray-500/30',
                text: 'text-gray-400',
                dot: 'bg-gray-400',
                label: 'Low'
            };
    }
};

export default function AlertsPage() {
    const { alerts, clients, isLoading } = useData();

    const [filterType, setFilterType] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterClient, setFilterClient] = useState<string>('all');

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

    // Filter and sort alerts (critical first)
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

    // Calculate summary stats
    const stats = useMemo(() => {
        const totalLeakage = filteredAlerts.reduce((sum, a) => sum + a.estimated_leakage, 0);
        const criticalCount = filteredAlerts.filter(a => a.severity === 'critical').length;
        const highCount = filteredAlerts.filter(a => a.severity === 'high').length;
        const affectedClients = new Set(filteredAlerts.map(a => a.client_id)).size;

        return { totalLeakage, criticalCount, highCount, affectedClients };
    }, [filteredAlerts]);

    // Group alerts by type
    const alertsByType = useMemo(() => {
        return alerts.reduce((acc, alert) => {
            acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [alerts]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <p className="text-sm text-gray-400">
                    {alerts.length > 0
                        ? `${alerts.length} issue${alerts.length !== 1 ? 's' : ''} detected · ${stats.affectedClients} client${stats.affectedClients !== 1 ? 's' : ''} affected`
                        : 'All clear — no issues detected'}
                </p>
            </div>

            {alerts.length === 0 ? (
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
                    <NoAlertsEmpty />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-[var(--leak)]/20 flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-[var(--leak)]" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Leakage</span>
                            </div>
                            <p className="text-2xl font-bold text-[var(--leak)] tabular-nums">
                                {formatCurrency(stats.totalLeakage)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">potential revenue loss</p>
                        </div>

                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
                                    <Flame className="w-4 h-4 text-red-500" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Critical</span>
                            </div>
                            <p className={`text-2xl font-bold tabular-nums ${stats.criticalCount > 0 ? 'text-red-500' : 'text-[var(--foreground)]'}`}>
                                {stats.criticalCount}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.criticalCount > 0 ? 'need immediate action' : 'none right now'}
                            </p>
                        </div>

                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">High</span>
                            </div>
                            <p className={`text-2xl font-bold tabular-nums ${stats.highCount > 0 ? 'text-orange-500' : 'text-[var(--foreground)]'}`}>
                                {stats.highCount}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">high priority issues</p>
                        </div>

                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-[var(--neutral-metric)]/20 flex items-center justify-center">
                                    <TrendingDown className="w-4 h-4 text-[var(--neutral-metric)]" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Clients</span>
                            </div>
                            <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums">
                                {stats.affectedClients}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">need attention</p>
                        </div>
                    </div>

                    {/* Alert Type Filters */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${filterType === 'all'
                                    ? 'bg-[var(--foreground)] text-[var(--card)] shadow-lg shadow-white/10'
                                    : 'bg-[var(--card)] text-gray-400 hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--neutral-metric)]/30'
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
                                    className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${isActive
                                            ? 'bg-[var(--foreground)] text-[var(--card)] shadow-lg shadow-white/10'
                                            : 'bg-[var(--card)] text-gray-400 hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--neutral-metric)]/30'
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
                                className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-xl pl-4 pr-10 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)] transition-all"
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
                                className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-xl pl-4 pr-10 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)] transition-all"
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
                                className="px-4 py-2.5 text-sm text-gray-400 hover:text-[var(--foreground)] transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/* Alerts List */}
                    <div className="space-y-3">
                        {filteredAlerts.length === 0 ? (
                            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
                                <p className="text-sm text-gray-400">
                                    No alerts match your current filters.
                                </p>
                            </div>
                        ) : (
                            filteredAlerts.map((alert) => {
                                const severityStyles = getSeverityStyles(alert.severity);
                                const AlertIcon = getAlertIcon(alert.alert_type);

                                return (
                                    <div
                                        key={alert.id}
                                        className={`bg-[var(--card)] rounded-xl border ${severityStyles.border} overflow-hidden hover:border-[var(--neutral-metric)]/30 transition-all group`}
                                    >
                                        <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                {/* Icon */}
                                                <div className={`w-10 h-10 rounded-xl ${severityStyles.bg} flex items-center justify-center flex-shrink-0`}>
                                                    <AlertIcon className={`w-5 h-5 ${severityStyles.text}`} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                        <h4 className="text-sm font-semibold text-[var(--foreground)]">
                                                            {getAlertLabel(alert.alert_type)}
                                                        </h4>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold ${severityStyles.bg} ${severityStyles.text} rounded-full`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${severityStyles.dot} ${alert.severity === 'critical' ? 'animate-pulse' : ''}`} />
                                                            {severityStyles.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{alert.message}</p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="w-5 h-5 rounded bg-[var(--neutral-metric)]/20 flex items-center justify-center text-[var(--neutral-metric)] font-bold text-[9px]">
                                                                {getClientName(alert.client_id).charAt(0)}
                                                            </span>
                                                            {getClientName(alert.client_id)}
                                                        </span>
                                                        <span className="text-gray-600">·</span>
                                                        <span>{formatDistanceToNow(parseISO(alert.created_at), { addSuffix: true })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Impact & Action */}
                                            <div className="flex items-center gap-4 lg:ml-4">
                                                {alert.estimated_leakage > 0 && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Impact</p>
                                                        <p className="text-lg font-bold text-[var(--leak)] tabular-nums">
                                                            {formatCurrency(alert.estimated_leakage, true)}
                                                        </p>
                                                    </div>
                                                )}
                                                <Link
                                                    href={`/app/clients/${alert.client_id}`}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)] rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    Review
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Summary tip */}
                    {stats.criticalCount > 0 && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <Flame className="w-4 h-4 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[var(--foreground)]">
                                        You have {stats.criticalCount} critical issue{stats.criticalCount !== 1 ? 's' : ''} requiring immediate attention
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        These issues are actively costing you money. Address them first.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
