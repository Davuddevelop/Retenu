// src/app/app/clients/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useData } from '../../../providers/DataProvider';
import { calculateClientMetrics, generateClientAlerts } from '../../../lib/calculations';
import { ClientMetrics, RevenueAlert } from '../../../lib/types';
import { TrendingUp, Clock, AlertTriangle, ShieldCheck, ArrowLeft, DollarSign, Edit } from 'lucide-react';
import Link from 'next/link';
import { DemoModeBanner } from '../../../components/EmptyStates';
import { startOfMonth, endOfMonth } from 'date-fns';

export default function ClientDetailPage() {
    const params = useParams();
    const clientId = params.id as string;

    const {
        clients,
        contracts,
        invoices,
        timeEntries,
        settings,
        isDemoMode,
        disableDemoMode,
        isLoading,
        organizationId,
    } = useData();

    // Find the client
    const client = useMemo(() => {
        return clients.find(c => c.id === clientId) || null;
    }, [clients, clientId]);

    // Find the contract for this client
    const contract = useMemo(() => {
        return contracts.find(c => c.client_id === clientId && c.status === 'active') || null;
    }, [contracts, clientId]);

    // Calculate metrics
    const metrics: ClientMetrics | null = useMemo(() => {
        if (!client || !settings) return null;

        const now = new Date();
        const periodStart = startOfMonth(now);
        const periodEnd = endOfMonth(now);

        return calculateClientMetrics(
            client,
            contract,
            invoices,
            timeEntries,
            settings,
            periodStart,
            periodEnd
        );
    }, [client, contract, invoices, timeEntries, settings]);

    // Calculate alerts for this client
    const alerts: RevenueAlert[] = useMemo(() => {
        if (!client || !metrics || !settings) return [];

        return generateClientAlerts(
            client,
            metrics,
            settings,
            organizationId || ''
        );
    }, [client, metrics, settings, organizationId]);

    const handleDisableDemo = () => {
        disableDemoMode();
        window.location.reload();
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)]" />
            </div>
        );
    }

    if (!client) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)] text-center">
                    <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Client Not Found</h2>
                    <p className="text-gray-400 mb-4">The requested client could not be found.</p>
                    <Link
                        href="/app/clients"
                        className="inline-flex items-center gap-2 text-[var(--neutral-metric)] hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Clients
                    </Link>
                </div>
            </div>
        );
    }

    const renderRiskBadge = () => {
        if (alerts.length >= 2)
            return <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">High Risk</span>;
        if (alerts.length === 1)
            return <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Medium Risk</span>;
        return <span className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Low Risk</span>;
    };

    // Calculate progress for hour limit
    const hourProgress = client.hour_limit
        ? Math.min((metrics?.total_hours || 0) / client.hour_limit * 100, 100)
        : 0;
    const isOverLimit = client.hour_limit ? (metrics?.total_hours || 0) > client.hour_limit : false;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {isDemoMode && <DemoModeBanner onDisable={handleDisableDemo} />}

            {/* Back Link */}
            <Link
                href="/app/clients"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-[var(--foreground)] transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Clients
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">{client.name}</h1>
                    <p className="text-gray-400 mt-1">
                        Retainer: {formatCurrency(client.agreed_monthly_retainer)} / month
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                        {renderRiskBadge()}
                        <Link
                            href={`/app/clients/${clientId}/edit`}
                            className="p-2 text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)] rounded-lg transition-colors"
                            title="Edit client"
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                    </div>
                    <p className="text-sm text-gray-500">
                        Member since {new Date(client.start_date).getFullYear()}
                    </p>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)]">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                        {metrics ? formatCurrency(metrics.total_revenue) : '—'}
                    </p>
                </div>
                <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)]">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Hours Logged</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                        {metrics ? `${metrics.total_hours.toFixed(1)}h` : '—'}
                    </p>
                </div>
                <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)]">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">Margin</span>
                    </div>
                    <p className={`text-2xl font-bold ${metrics && metrics.margin_percent >= 0 ? 'text-[var(--profit)]' : 'text-[var(--leak)]'}`}>
                        {metrics ? `${metrics.margin_percent.toFixed(1)}%` : '—'}
                    </p>
                </div>
                <div className="bg-[var(--card)] p-5 rounded-xl border border-[var(--border)]">
                    <div className="flex items-center gap-2 text-[var(--leak)] mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Est. Leakage</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                        {metrics && metrics.estimated_leakage > 0 ? formatCurrency(metrics.estimated_leakage) : '—'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Column */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Hours vs Limit
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-2xl font-bold text-[var(--foreground)]">
                                    {metrics?.total_hours.toFixed(1) || 0}
                                    <span className="text-sm font-normal text-gray-500 ml-1">hours logged</span>
                                </p>
                                {client.hour_limit !== null && (
                                    <>
                                        <div className="w-full bg-[var(--background)] rounded-full h-2 mt-3 overflow-hidden border border-[var(--border)]">
                                            <div
                                                className={`h-2 rounded-full transition-all ${isOverLimit ? 'bg-[var(--leak)]' : 'bg-[var(--neutral-metric)]'}`}
                                                style={{ width: `${hourProgress}%` }}
                                            />
                                        </div>
                                        <p className={`text-xs mt-2 ${isOverLimit ? 'text-[var(--leak)]' : 'text-gray-500'}`}>
                                            {isOverLimit
                                                ? `Over limit by ${((metrics?.total_hours || 0) - client.hour_limit).toFixed(1)} hours`
                                                : `${(client.hour_limit - (metrics?.total_hours || 0)).toFixed(1)} hours remaining of ${client.hour_limit}h limit`}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="pt-4 border-t border-[var(--border)]">
                                <p className="text-2xl font-bold text-[var(--foreground)]">
                                    {metrics ? formatCurrency(metrics.billed_revenue) : '—'}
                                    <span className="text-sm font-normal text-gray-500 ml-1">invoiced</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                        <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Profitability
                        </h3>
                        <p className={`text-4xl font-black ${metrics && metrics.margin_percent >= 0 ? 'text-[var(--profit)]' : 'text-[var(--leak)]'}`}>
                            {metrics ? `${metrics.margin_percent.toFixed(1)}%` : '—'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            {metrics && metrics.margin_percent >= 25
                                ? 'Healthy profitability.'
                                : metrics && metrics.margin_percent >= 0
                                    ? 'Below target margin.'
                                    : 'Unprofitable - review costs.'}
                        </p>
                        {metrics && (
                            <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Revenue</span>
                                    <span className="text-[var(--foreground)]">{formatCurrency(metrics.total_revenue)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Cost</span>
                                    <span className="text-[var(--foreground)]">{formatCurrency(metrics.total_cost)}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span className="text-gray-400">Gross Profit</span>
                                    <span className={metrics.gross_margin >= 0 ? 'text-[var(--profit)]' : 'text-[var(--leak)]'}>
                                        {formatCurrency(metrics.gross_margin)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Leakage Breakdown */}
                <div className="md:col-span-2 bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                    <h3 className="text-sm font-medium text-gray-400 mb-6">Leakage Breakdown</h3>
                    {metrics && metrics.estimated_leakage > 0 ? (
                        <div className="space-y-4">
                            {[
                                { label: 'Underbilling', value: metrics.leakage_breakdown.underbilling, description: 'Revenue lost from hours worked but not billed' },
                                { label: 'Scope Creep', value: metrics.leakage_breakdown.scope_creep, description: 'Unbilled work beyond contracted hours' },
                                { label: 'Missing Invoices', value: metrics.leakage_breakdown.missing_invoices, description: 'Expected invoices not sent' },
                                { label: 'Late Payments', value: metrics.leakage_breakdown.late_payments, description: 'Invoices overdue for payment' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                                    <div>
                                        <p className="font-medium text-[var(--foreground)]">{item.label}</p>
                                        <p className="text-xs text-gray-500">{item.description}</p>
                                    </div>
                                    <p className={`text-lg font-bold ${item.value > 0 ? 'text-[var(--leak)]' : 'text-gray-500'}`}>
                                        {item.value > 0 ? formatCurrency(item.value) : '—'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-xl bg-[var(--profit)]/20 flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6 text-[var(--profit)]" />
                            </div>
                            <p className="text-[var(--foreground)] font-medium">No leakage detected</p>
                            <p className="text-sm text-gray-400 mt-1">This client is performing well.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Active Alerts */}
            <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                    {alerts.length > 0
                        ? <AlertTriangle className="w-5 h-5 text-[var(--leak)]" />
                        : <ShieldCheck className="w-5 h-5 text-[var(--profit)]" />}
                    Active Alerts
                </h2>
                {alerts.length === 0 ? (
                    <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[var(--profit)]/20 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-[var(--profit)]" />
                            </div>
                            <div>
                                <p className="text-[var(--foreground)] font-medium">All Clear</p>
                                <p className="text-sm text-gray-400">No active alerts for this client.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {alerts.map(alert => (
                            <div key={alert.id} className="bg-[var(--leak)]/5 border border-[var(--leak)]/20 p-5 rounded-xl">
                                <h4 className="font-semibold text-[var(--leak)] capitalize">
                                    {alert.alert_type.replace(/_/g, ' ')}
                                </h4>
                                <p className="text-sm text-[var(--foreground)] mt-1">{alert.message}</p>
                                {alert.details && (
                                    <p className="text-xs text-gray-400 mt-2">{alert.details}</p>
                                )}
                                {alert.estimated_leakage > 0 && (
                                    <p className="text-xs text-[var(--leak)] mt-3 font-mono">
                                        Impact: {formatCurrency(alert.estimated_leakage)}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
