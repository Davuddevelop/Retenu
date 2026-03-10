// src/app/app/alerts/page.tsx
'use client';

import { useState } from 'react';
import { useData } from '../../providers/DataProvider';
import Link from 'next/link';
import { AlertTriangle, ChevronRight, Filter, ChevronDown, Clock, DollarSign, TrendingDown, FileText, Users } from 'lucide-react';
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

    const getAlertIcon = (type: RevenueAlert['alert_type']) => {
        switch (type) {
            case 'underbilling':
                return <DollarSign className="w-5 h-5" />;
            case 'scope_creep':
                return <Clock className="w-5 h-5" />;
            case 'missing_invoice':
                return <FileText className="w-5 h-5" />;
            case 'late_payment':
                return <AlertTriangle className="w-5 h-5" />;
            case 'low_margin':
            case 'negative_margin':
                return <TrendingDown className="w-5 h-5" />;
            default:
                return <AlertTriangle className="w-5 h-5" />;
        }
    };

    const getAlertColor = (type: RevenueAlert['alert_type']) => {
        switch (type) {
            case 'underbilling':
                return 'text-orange-500 bg-orange-500/10';
            case 'scope_creep':
                return 'text-yellow-500 bg-yellow-500/10';
            case 'missing_invoice':
                return 'text-purple-500 bg-purple-500/10';
            case 'late_payment':
                return 'text-[var(--leak)] bg-[var(--leak)]/10';
            case 'low_margin':
                return 'text-amber-500 bg-amber-500/10';
            case 'negative_margin':
                return 'text-[var(--leak)] bg-[var(--leak)]/10';
            default:
                return 'text-gray-500 bg-gray-500/10';
        }
    };

    const getSeverityBadge = (severity: RevenueAlert['severity']) => {
        switch (severity) {
            case 'critical':
                return <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--leak)]/20 text-[var(--leak)] font-medium">Critical</span>;
            case 'high':
                return <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-500 font-medium">High</span>;
            case 'medium':
                return <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-500 font-medium">Medium</span>;
            case 'low':
                return <span className="text-xs px-2.5 py-1 rounded-full bg-gray-500/20 text-gray-400 font-medium">Low</span>;
            default:
                return null;
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
                <h1 className="text-3xl font-bold text-[var(--foreground)]">Revenue Alerts</h1>
                <p className="text-gray-400 mt-2">
                    {alerts.length > 0
                        ? `${alerts.length} active alert${alerts.length !== 1 ? 's' : ''} requiring attention`
                        : 'No revenue leaks detected'}
                </p>
            </div>

            {alerts.length === 0 ? (
                <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)]">
                    <NoAlertsEmpty />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--leak)]/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-[var(--leak)]" />
                                </div>
                                <span className="text-sm text-gray-400">Total Leakage</span>
                            </div>
                            <p className="text-3xl font-bold text-[var(--foreground)]">{formatCurrency(totalLeakage)}</p>
                        </div>

                        <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--leak)]/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-[var(--leak)]" />
                                </div>
                                <span className="text-sm text-gray-400">Critical</span>
                            </div>
                            <p className="text-3xl font-bold text-[var(--foreground)]">{criticalCount}</p>
                        </div>

                        <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                                </div>
                                <span className="text-sm text-gray-400">High Priority</span>
                            </div>
                            <p className="text-3xl font-bold text-[var(--foreground)]">{highCount}</p>
                        </div>
                    </div>

                    {/* Alert Type Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        {[
                            { type: 'underbilling', label: 'Underbilling', icon: <DollarSign className="w-4 h-4" /> },
                            { type: 'scope_creep', label: 'Scope Creep', icon: <Clock className="w-4 h-4" /> },
                            { type: 'missing_invoice', label: 'Missing Invoice', icon: <FileText className="w-4 h-4" /> },
                            { type: 'late_payment', label: 'Late Payment', icon: <AlertTriangle className="w-4 h-4" /> },
                            { type: 'low_margin', label: 'Low Margin', icon: <TrendingDown className="w-4 h-4" /> },
                            { type: 'negative_margin', label: 'Negative Margin', icon: <TrendingDown className="w-4 h-4" /> },
                        ].map(item => {
                            const count = alertsByType[item.type] || 0;
                            const isActive = filterType === item.type;
                            return (
                                <button
                                    key={item.type}
                                    onClick={() => setFilterType(isActive ? 'all' : item.type)}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                        isActive
                                            ? 'border-[var(--neutral-metric)] bg-[var(--neutral-metric)]/10'
                                            : count > 0
                                            ? 'border-[var(--border)] hover:border-gray-500 bg-[var(--card)]'
                                            : 'border-[var(--border)] bg-[var(--card)] opacity-40'
                                    }`}
                                    disabled={count === 0}
                                >
                                    <div className={`${getAlertColor(item.type as RevenueAlert['alert_type']).split(' ')[0]} mb-1`}>
                                        {item.icon}
                                    </div>
                                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                                    <p className="text-lg font-bold text-[var(--foreground)]">{count}</p>
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
                                className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-xl pl-4 pr-10 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
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
                                className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-xl pl-4 pr-10 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
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
                                className="px-4 py-2.5 text-sm text-[var(--neutral-metric)] hover:text-[var(--foreground)] transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                    {/* Alerts List */}
                    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                        {filteredAlerts.length === 0 ? (
                            <div className="p-12 text-center">
                                <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Matching Alerts</h3>
                                <p className="text-sm text-gray-400">
                                    No alerts match your current filters.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--border)]">
                                {filteredAlerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--background)]/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`p-3 rounded-xl ${getAlertColor(alert.alert_type)}`}>
                                                {getAlertIcon(alert.alert_type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-base font-semibold text-[var(--foreground)] capitalize">
                                                        {alert.alert_type.replace(/_/g, ' ')}
                                                    </h4>
                                                    {getSeverityBadge(alert.severity)}
                                                </div>
                                                <p className="text-sm text-gray-400 mb-3">{alert.message}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1.5">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {getClientName(alert.client_id)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {format(parseISO(alert.created_at), 'MMM dd, yyyy')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 md:ml-4">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">Est. Impact</p>
                                                <p className="text-xl font-bold text-[var(--leak)]">
                                                    {alert.estimated_leakage > 0 ? formatCurrency(alert.estimated_leakage) : '—'}
                                                </p>
                                            </div>
                                            <Link
                                                href={`/app/clients/${alert.client_id}`}
                                                className="px-4 py-2.5 bg-[var(--foreground)] hover:bg-gray-200 text-[var(--card)] text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-2"
                                            >
                                                View Client
                                                <ChevronRight className="w-4 h-4" />
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
