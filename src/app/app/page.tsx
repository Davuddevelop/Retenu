// src/app/app/page.tsx
'use client';

import { useMemo } from 'react';
import { DollarSign, AlertTriangle, Activity, CreditCard, ChevronRight, Settings, Users, Clock, FileText, TrendingUp, TrendingDown, ArrowUpRight, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useData } from '../providers/DataProvider';
import { SetupChecklist, NoClientsEmpty } from '../components/EmptyStates';
import { Tutorial, WelcomeModal, useTutorial } from '../components/Tutorial';
import type { DashboardMetrics } from '../lib/types';
import { NoiseGrain } from '../components/Shaders';

export default function DashboardPage() {
    const {
        clients,
        invoices,
        timeEntries,
        alerts,
        settings,
        isLoading,
        hasData,
    } = useData();

    // Tutorial state
    const {
        showWelcome,
        showTutorial,
        startTutorial,
        completeTutorial,
        skipTutorial,
    } = useTutorial();

    // Calculate dashboard metrics from context data
    const stats = useMemo<DashboardMetrics>(() => {
        if (!clients.length || !settings) {
            return {
                total_clients: 0,
                total_revenue: 0,
                total_margin: 0,
                margin_percent: 0,
                total_hours: 0,
                billable_hours: 0,
                total_unpaid: 0,
                total_overdue: 0,
                clients_at_risk: 0,
                total_estimated_leakage: 0,
                leakage_by_type: {
                    underbilling: 0,
                    scope_creep: 0,
                    missing_invoice: 0,
                    late_payment: 0,
                    low_margin: 0,
                    negative_margin: 0,
                },
                active_alerts: [],
                alerts_by_type: {
                    underbilling: 0,
                    scope_creep: 0,
                    missing_invoice: 0,
                    late_payment: 0,
                    low_margin: 0,
                    negative_margin: 0,
                },
                period_start: startOfMonth(new Date()).toISOString(),
                period_end: endOfMonth(new Date()).toISOString(),
                total_cost: 0,
                total_invoiced: 0,
                total_paid: 0,
                healthy_clients: 0,
            };
        }

        const activeClients = clients.filter(c => c.status === 'active');
        const activeAlerts = alerts.filter(a => a.status === 'active');

        // Calculate revenue from client retainers
        const totalRevenue = activeClients.reduce((sum, c) => sum + c.agreed_monthly_retainer, 0);

        // Calculate hours
        const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
        const billableHours = timeEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0);

        // Calculate costs and margin
        const hourlyRate = settings.default_internal_hourly_rate;
        const costRate = settings.default_internal_cost_rate;
        const totalCost = billableHours * costRate;
        const totalMargin = totalRevenue - totalCost;
        const marginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

        // Calculate invoice totals
        const unpaidInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'sent');
        const overdueInvoices = invoices.filter(i => i.status === 'overdue');
        const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);
        const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);

        // Calculate leakage by type
        const leakageByType = {
            underbilling: 0,
            scope_creep: 0,
            missing_invoice: 0,
            late_payment: 0,
            low_margin: 0,
            negative_margin: 0,
        };

        activeAlerts.forEach(alert => {
            const type = alert.alert_type as keyof typeof leakageByType;
            if (type in leakageByType) {
                leakageByType[type] += alert.estimated_leakage;
            }
        });

        const totalLeakage = Object.values(leakageByType).reduce((sum, v) => sum + v, 0);
        const clientsAtRisk = new Set(activeAlerts.map(a => a.client_id)).size;

        const alertsByType = { ...leakageByType };
        activeAlerts.forEach(alert => {
            const type = alert.alert_type as keyof typeof alertsByType;
            if (type in alertsByType) {
                alertsByType[type] = (alertsByType[type] || 0) + 1;
            }
        });

        return {
            total_clients: activeClients.length,
            healthy_clients: activeClients.length - clientsAtRisk,
            total_revenue: totalRevenue,
            total_cost: totalCost,
            total_margin: totalMargin,
            margin_percent: marginPercent,
            total_hours: totalHours,
            billable_hours: billableHours,
            total_invoiced: invoices.reduce((sum, i) => sum + i.amount, 0),
            total_paid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
            total_unpaid: totalUnpaid,
            total_overdue: totalOverdue,
            clients_at_risk: clientsAtRisk,
            total_estimated_leakage: totalLeakage,
            leakage_by_type: leakageByType,
            active_alerts: activeAlerts,
            alerts_by_type: alertsByType,
            period_start: startOfMonth(new Date()).toISOString(),
            period_end: endOfMonth(new Date()).toISOString(),
        };
    }, [clients, invoices, timeEntries, alerts, settings]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const formatPercent = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(val / 100);

    // Setup steps for onboarding
    const setupSteps = [
        {
            id: 'settings',
            title: 'Configure Settings',
            description: 'Set your hourly rates and alert thresholds',
            completed: !!settings,
            href: '/app/settings',
            icon: <Settings className="w-5 h-5" />,
        },
        {
            id: 'clients',
            title: 'Add Clients',
            description: 'Add your first client to track',
            completed: clients.length > 0,
            href: '/app/clients',
            icon: <Users className="w-5 h-5" />,
        },
        {
            id: 'time',
            title: 'Upload Time Entries',
            description: 'Import hours from your time tracker',
            completed: timeEntries.length > 0,
            href: '/app/time-entries',
            icon: <Clock className="w-5 h-5" />,
        },
        {
            id: 'invoices',
            title: 'Add Invoices',
            description: 'Connect Stripe or add invoices manually',
            completed: invoices.length > 0,
            href: '/app/invoices',
            icon: <FileText className="w-5 h-5" />,
        },
    ];

    const isSetupComplete = !!settings && clients.length > 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)]" />
            </div>
        );
    }

    // Calculate health score (inverse of leakage as percentage of revenue)
    const healthScore = stats.total_revenue > 0
        ? Math.max(0, Math.round(100 - (stats.total_estimated_leakage / stats.total_revenue) * 100))
        : 100;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            <NoiseGrain />
            {/* Tutorial Components */}
            {showWelcome && (
                <WelcomeModal
                    onStart={startTutorial}
                    onSkip={skipTutorial}
                />
            )}
            {showTutorial && (
                <Tutorial
                    onComplete={completeTutorial}
                    onSkip={skipTutorial}
                />
            )}

            {/* Setup Checklist (if not complete) */}
            {!isSetupComplete && (
                <SetupChecklist steps={setupSteps} />
            )}

            {/* Show empty state if no data */}
            {!hasData ? (
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
                    <NoClientsEmpty />
                </div>
            ) : (
                <>
                    {/* Bento Grid Layout - F-Pattern with North Star Metric */}
                    <div className="grid grid-cols-12 gap-4" data-tutorial="metrics">
                        {/* North Star Metric - Total Estimated Leakage (Top-Left Priority) */}
                        <div className="col-span-12 lg:col-span-5 row-span-2">
                            <div className="h-full bg-gradient-to-br from-[var(--leak)]/10 via-[var(--card)] to-[var(--card)] p-6 rounded-2xl border border-[var(--leak)]/20 relative overflow-hidden group">
                                {/* Animated background pulse */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--leak)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Decorative element */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--leak)]/5 rounded-full blur-3xl transform translate-x-8 -translate-y-8" />

                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 bg-[var(--leak)]/20 rounded-xl">
                                            <AlertTriangle className="w-6 h-6 text-[var(--leak)]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-[var(--leak)]">Money You&apos;re Losing</p>
                                            <h3 className="text-base font-semibold text-gray-400">Estimated Lost Revenue</h3>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-5xl font-black text-[var(--foreground)] tracking-tight">
                                            {stats.total_estimated_leakage > 0 ? formatCurrency(stats.total_estimated_leakage) : '$0'}
                                        </p>
                                        {stats.clients_at_risk > 0 && (
                                            <p className="text-sm text-[var(--leak)] mt-2 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-[var(--leak)] animate-pulse" />
                                                {stats.clients_at_risk} client{stats.clients_at_risk !== 1 ? 's' : ''} at risk
                                            </p>
                                        )}
                                    </div>

                                    {/* Quick Breakdown */}
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Unbilled Work', value: stats.leakage_by_type.underbilling },
                                            { label: 'Over-Hours', value: stats.leakage_by_type.scope_creep },
                                            { label: 'Missing Invoices', value: stats.leakage_by_type.missing_invoice },
                                            { label: 'Overdue Payments', value: stats.leakage_by_type.late_payment },
                                        ].filter(item => item.value > 0).slice(0, 3).map((item) => (
                                            <div key={item.label} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">{item.label}</span>
                                                <span className="font-medium text-[var(--foreground)]">{formatCurrency(item.value)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {stats.active_alerts.length > 0 && (
                                        <Link
                                            href="#alerts"
                                            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--leak)] hover:text-[var(--leak)]/80 transition-colors"
                                        >
                                            View {stats.active_alerts.length} active alert{stats.active_alerts.length !== 1 ? 's' : ''}
                                            <ArrowUpRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Revenue Card */}
                        <div className="col-span-6 lg:col-span-4">
                            <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-[var(--profit)]/10 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-[var(--profit)]" />
                                    </div>
                                    {stats.total_revenue > 0 && (
                                        <span className="text-xs font-medium text-[var(--profit)] bg-[var(--profit)]/10 px-2 py-1 rounded-full flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            Active
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                                <p className="text-3xl font-bold text-[var(--foreground)]">
                                    {stats.total_revenue > 0 ? formatCurrency(stats.total_revenue) : '—'}
                                </p>
                                {stats.total_clients > 0 && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        From {stats.total_clients} active client{stats.total_clients !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Margin Card */}
                        <div className="col-span-6 lg:col-span-3">
                            <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${stats.margin_percent >= 25 ? 'bg-[var(--profit)]/10' : stats.margin_percent >= 0 ? 'bg-yellow-500/10' : 'bg-[var(--leak)]/10'}`}>
                                        <Activity className={`w-5 h-5 ${stats.margin_percent >= 25 ? 'text-[var(--profit)]' : stats.margin_percent >= 0 ? 'text-yellow-500' : 'text-[var(--leak)]'}`} />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mb-1">Profit %</p>
                                <p className={`text-3xl font-bold ${stats.margin_percent >= 0 ? 'text-[var(--foreground)]' : 'text-[var(--leak)]'}`}>
                                    {stats.total_revenue > 0 ? formatPercent(stats.margin_percent) : '—'}
                                </p>
                                {stats.total_revenue > 0 && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {formatCurrency(stats.total_margin)} profit
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Unpaid Invoices */}
                        <div className="col-span-6 lg:col-span-4">
                            <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-[var(--neutral-metric)]/10 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-[var(--neutral-metric)]" />
                                    </div>
                                    {stats.total_overdue > 0 && (
                                        <span className="text-xs font-medium text-[var(--leak)] bg-[var(--leak)]/10 px-2 py-1 rounded-full">
                                            {formatCurrency(stats.total_overdue)} overdue
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-400 mb-1">Unpaid Invoices</p>
                                <p className="text-3xl font-bold text-[var(--foreground)]">
                                    {stats.total_unpaid + stats.total_overdue > 0
                                        ? formatCurrency(stats.total_unpaid + stats.total_overdue)
                                        : '—'}
                                </p>
                            </div>
                        </div>

                        {/* Health Score Card */}
                        <div className="col-span-6 lg:col-span-3">
                            <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${healthScore >= 80 ? 'bg-[var(--profit)]/10' : healthScore >= 60 ? 'bg-yellow-500/10' : 'bg-[var(--leak)]/10'}`}>
                                        <ShieldCheck className={`w-5 h-5 ${healthScore >= 80 ? 'text-[var(--profit)]' : healthScore >= 60 ? 'text-yellow-500' : 'text-[var(--leak)]'}`} />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mb-1">Revenue Health</p>
                                <p className="text-3xl font-bold text-[var(--foreground)]">
                                    {stats.total_clients > 0 ? `${healthScore}%` : '—'}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link
                            href="/app/clients/new"
                            className="bg-[var(--card)] hover:bg-[var(--background)] border border-[var(--border)] hover:border-[var(--neutral-metric)]/50 p-4 rounded-xl transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--neutral-metric)]/10 rounded-lg group-hover:bg-[var(--neutral-metric)]/20 transition-colors">
                                    <Users className="w-4 h-4 text-[var(--neutral-metric)]" />
                                </div>
                                <span className="text-sm font-medium text-[var(--foreground)]">Add Client</span>
                            </div>
                        </Link>
                        <Link
                            href="/app/invoices"
                            className="bg-[var(--card)] hover:bg-[var(--background)] border border-[var(--border)] hover:border-[var(--neutral-metric)]/50 p-4 rounded-xl transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--profit)]/10 rounded-lg group-hover:bg-[var(--profit)]/20 transition-colors">
                                    <FileText className="w-4 h-4 text-[var(--profit)]" />
                                </div>
                                <span className="text-sm font-medium text-[var(--foreground)]">Add Invoice</span>
                            </div>
                        </Link>
                        <Link
                            href="/app/time-entries"
                            className="bg-[var(--card)] hover:bg-[var(--background)] border border-[var(--border)] hover:border-[var(--neutral-metric)]/50 p-4 rounded-xl transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="text-sm font-medium text-[var(--foreground)]">Log Time</span>
                            </div>
                        </Link>
                        <Link
                            href="/app/settings"
                            className="bg-[var(--card)] hover:bg-[var(--background)] border border-[var(--border)] hover:border-[var(--neutral-metric)]/50 p-4 rounded-xl transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-500/10 rounded-lg group-hover:bg-gray-500/20 transition-colors">
                                    <Settings className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-sm font-medium text-[var(--foreground)]">Settings</span>
                            </div>
                        </Link>
                    </div>

                    {/* Leak Alerts Feed */}
                    <div id="alerts" data-tutorial="alerts">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--leak)]/10 rounded-lg">
                                    <Zap className="w-5 h-5 text-[var(--leak)]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-[var(--foreground)]">Active Alerts</h2>
                                    <p className="text-sm text-gray-500">Revenue leaks that need attention</p>
                                </div>
                            </div>
                            {stats.active_alerts.length > 0 && (
                                <span className="text-sm font-medium text-[var(--leak)] bg-[var(--leak)]/10 px-3 py-1.5 rounded-full">
                                    {stats.active_alerts.length} alert{stats.active_alerts.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                            {stats.active_alerts.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-[var(--profit)]/10 flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck className="w-8 h-8 text-[var(--profit)]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">All Clear</h3>
                                    <p className="text-sm text-gray-400 max-w-sm mx-auto">
                                        {stats.total_clients > 0
                                            ? 'No revenue leaks detected. Your clients are performing well.'
                                            : 'Add clients and data to start detecting revenue leaks.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--border)]">
                                    {stats.active_alerts.slice(0, 5).map((alert, index) => {
                                        // Get specific action text, tip, and friendly name based on alert type
                                        const getAlertInfo = (type: string) => {
                                            switch (type) {
                                                case 'underbilling':
                                                    return { name: 'Unbilled Work', action: 'Review Hours', tip: 'Check if all billable hours are invoiced' };
                                                case 'scope_creep':
                                                    return { name: 'Over-Hours', action: 'Check Contract', tip: 'Hours exceed the agreed limit' };
                                                case 'missing_invoice':
                                                    return { name: 'Missing Invoice', action: 'Send Invoice', tip: 'Work completed but not invoiced' };
                                                case 'late_payment':
                                                    return { name: 'Overdue Payment', action: 'Follow Up', tip: 'Invoice is past due date' };
                                                case 'low_margin':
                                                    return { name: 'Low Profit', action: 'Review Rates', tip: 'Profit margin below target' };
                                                case 'negative_margin':
                                                    return { name: 'Losing Money', action: 'Stop Work', tip: 'This client is costing you money' };
                                                default:
                                                    return { name: type.replace(/_/g, ' '), action: 'View Details', tip: '' };
                                            }
                                        };
                                        const { name, action, tip } = getAlertInfo(alert.alert_type);

                                        return (
                                            <div
                                                key={alert.id}
                                                className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-[var(--background)]/50 transition-colors"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className="flex items-start gap-4 mb-4 md:mb-0">
                                                    <div className="p-2.5 bg-[var(--leak)]/10 rounded-xl">
                                                        <AlertTriangle className="w-5 h-5 text-[var(--leak)]" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-semibold text-[var(--foreground)]">
                                                            {name}
                                                        </h4>
                                                        <p className="text-sm text-gray-400 mt-0.5">{alert.message}</p>
                                                        {tip && (
                                                            <p className="text-xs text-[var(--neutral-metric)] mt-1 flex items-center gap-1">
                                                                <Zap className="w-3 h-3" />
                                                                {tip}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-1.5">
                                                            {format(new Date(alert.created_at), 'MMM dd, yyyy')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 mb-0.5">Impact</p>
                                                        <p className="text-lg font-bold text-[var(--leak)]">
                                                            {alert.estimated_leakage > 0 ? formatCurrency(alert.estimated_leakage) : '—'}
                                                        </p>
                                                    </div>
                                                    <Link
                                                        href={`/app/clients/${alert.client_id}`}
                                                        className="px-4 py-2 bg-[var(--foreground)] hover:bg-white/90 active:bg-white/80 text-[var(--card)] text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
                                                    >
                                                        {action}
                                                        <ChevronRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {stats.active_alerts.length > 5 && (
                                        <div className="p-4 text-center bg-[var(--background)]/50">
                                            <Link
                                                href="/app/alerts"
                                                className="text-sm font-medium text-[var(--neutral-metric)] hover:text-[var(--foreground)] transition-colors"
                                            >
                                                View all {stats.active_alerts.length} alerts
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Leakage Breakdown - Enhanced Bento Cards */}
                    {stats.total_estimated_leakage > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-[var(--leak)]/10 rounded-lg">
                                    <TrendingDown className="w-5 h-5 text-[var(--leak)]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-[var(--foreground)]">Leakage Breakdown</h2>
                                    <p className="text-sm text-gray-500">Where you&apos;re losing money</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    {
                                        label: 'Unbilled Work',
                                        value: stats.leakage_by_type.underbilling,
                                        description: 'Hours worked but not yet invoiced',
                                        color: 'var(--leak)'
                                    },
                                    {
                                        label: 'Over-Hours',
                                        value: stats.leakage_by_type.scope_creep,
                                        description: 'Work exceeding agreed hours',
                                        color: '#f59e0b'
                                    },
                                    {
                                        label: 'Missing Invoices',
                                        value: stats.leakage_by_type.missing_invoice,
                                        description: 'Work done, invoice not sent',
                                        color: '#8b5cf6'
                                    },
                                    {
                                        label: 'Overdue Payments',
                                        value: stats.leakage_by_type.late_payment,
                                        description: 'Clients who haven\'t paid yet',
                                        color: '#ec4899'
                                    },
                                ].map((item) => {
                                    const percentage = stats.total_estimated_leakage > 0
                                        ? Math.round((item.value / stats.total_estimated_leakage) * 100)
                                        : 0;
                                    return (
                                        <div
                                            key={item.label}
                                            className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] relative overflow-hidden"
                                        >
                                            {/* Progress bar background */}
                                            <div
                                                className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--border)]"
                                            >
                                                <div
                                                    className="h-full transition-all duration-500"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor: item.color
                                                    }}
                                                />
                                            </div>

                                            <p className="text-sm font-medium text-gray-400 mb-1">{item.label}</p>
                                            <p className="text-2xl font-bold text-[var(--foreground)] mb-1">
                                                {item.value > 0 ? formatCurrency(item.value) : '—'}
                                            </p>
                                            <p className="text-xs text-gray-500">{item.description}</p>
                                            {item.value > 0 && (
                                                <span
                                                    className="absolute top-4 right-4 text-xs font-medium px-2 py-0.5 rounded-full"
                                                    style={{
                                                        backgroundColor: `${item.color}20`,
                                                        color: item.color
                                                    }}
                                                >
                                                    {percentage}%
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
