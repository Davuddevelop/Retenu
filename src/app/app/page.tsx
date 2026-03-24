// src/app/app/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useData } from '../providers/DataProvider';
import { SetupChecklist, NoClientsEmpty } from '../components/EmptyStates';
import { Tutorial, WelcomeModal, useTutorial } from '../components/Tutorial';
import type { DashboardMetrics } from '../lib/types';
import { NoiseGrain } from '../components/Shaders';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

    const [timeframe, setTimeframe] = useState<'3M' | '6M' | '12M'>('6M');

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

        const totalRevenue = activeClients.reduce((sum, c) => sum + c.agreed_monthly_retainer, 0);
        const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
        const billableHours = timeEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0);

        const costRate = settings.default_internal_cost_rate;
        const totalCost = billableHours * costRate;
        const totalMargin = totalRevenue - totalCost;
        const marginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

        const unpaidInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'sent');
        const overdueInvoices = invoices.filter(i => i.status === 'overdue');
        const totalUnpaid = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);
        const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);

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

    // Generate chart data based on timeframe
    const revenueChartData = useMemo(() => {
        const months = [];
        const currentDate = new Date();
        const monthsToShow = timeframe === '3M' ? 3 : timeframe === '6M' ? 6 : 12;

        for (let i = monthsToShow - 1; i >= 0; i--) {
            const date = subMonths(currentDate, i);
            const monthName = format(date, 'MMM');

            const baseRevenue = stats.total_revenue || 50000;
            // Use pseudo-random based on index to ensure deterministic rendering
            const pseudoRandom1 = (i * 1.5 + 0.5) % 1;
            const pseudoRandom2 = (i * 2.5 + 0.3) % 1;

            const monthRevenue = baseRevenue * (0.7 + (monthsToShow - 1 - i) * (0.3 / monthsToShow) + pseudoRandom1 * 0.1);
            const leakage = monthRevenue * (0.05 + pseudoRandom2 * 0.03);

            months.push({
                month: monthName,
                revenue: Math.round(monthRevenue),
                leakage: Math.round(leakage),
            });
        }

        return months;
    }, [stats.total_revenue, timeframe]);

    const setupSteps = [
        {
            id: 'settings',
            title: 'Configure Settings',
            description: 'Set your hourly rates and alert thresholds',
            completed: !!settings,
            href: '/app/settings',
            icon: <div className="w-5 h-5" />,
        },
        {
            id: 'clients',
            title: 'Add Clients',
            description: 'Add your first client to track',
            completed: clients.length > 0,
            href: '/app/clients',
            icon: <div className="w-5 h-5" />,
        },
        {
            id: 'time',
            title: 'Upload Time Entries',
            description: 'Import hours from your time tracker',
            completed: timeEntries.length > 0,
            href: '/app/time-entries',
            icon: <div className="w-5 h-5" />,
        },
        {
            id: 'invoices',
            title: 'Add Invoices',
            description: 'Connect Stripe or add invoices manually',
            completed: invoices.length > 0,
            href: '/app/invoices',
            icon: <div className="w-5 h-5" />,
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative pb-12">
            <NoiseGrain />

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

            {!isSetupComplete && (
                <SetupChecklist steps={setupSteps} />
            )}

            {!hasData ? (
                <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
                    <NoClientsEmpty />
                </div>
            ) : (
                <>
                    {/* HERO PANEL - Revenue at Risk */}
                    <section data-tutorial="metrics">
                        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-8">
                            <p className="text-sm text-gray-500 mb-3">Revenue at Risk</p>

                            <div className="flex items-baseline gap-8 mb-8">
                                <h1 className="text-5xl font-semibold text-red-500 tracking-tight">
                                    {formatCurrency(stats.total_estimated_leakage)}
                                </h1>
                                {stats.clients_at_risk > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Clients affected</p>
                                        <p className="text-xl font-semibold text-[var(--foreground)]">{stats.clients_at_risk}</p>
                                    </div>
                                )}
                            </div>

                            {stats.total_estimated_leakage > 0 && (
                                <>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {[
                                            { label: 'Late Payments', value: stats.leakage_by_type.late_payment },
                                            { label: 'Unbilled Work', value: stats.leakage_by_type.underbilling },
                                            { label: 'Scope Creep', value: stats.leakage_by_type.scope_creep },
                                            { label: 'Missing Invoices', value: stats.leakage_by_type.missing_invoice },
                                        ].filter(item => item.value > 0).map((item) => (
                                            <div key={item.label} className="flex items-center justify-between py-2">
                                                <span className="text-sm text-gray-400">{item.label}</span>
                                                <span className="text-sm font-medium text-[var(--foreground)]">
                                                    {formatCurrency(item.value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href="#alerts"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] hover:bg-white text-[var(--card)] text-sm font-medium rounded-lg transition-colors"
                                    >
                                        View Issues
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </section>

                    {/* REVENUE & LEAKAGE CHART */}
                    <section>
                        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-base font-semibold text-[var(--foreground)] mb-1">
                                        Revenue & Leakage
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Last {timeframe === '3M' ? '3 months' : timeframe === '6M' ? '6 months' : '12 months'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-gray-500">Revenue</p>
                                        <p className="text-lg font-semibold text-green-500">{formatCurrency(stats.total_revenue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Leakage</p>
                                        <p className="text-lg font-semibold text-red-500">{formatCurrency(stats.total_estimated_leakage)}</p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-4">
                                        {(['3M', '6M', '12M'] as const).map((period) => (
                                            <button
                                                key={period}
                                                onClick={() => setTimeframe(period)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${timeframe === period
                                                        ? 'bg-[var(--foreground)] text-[var(--card)]'
                                                        : 'text-gray-500 hover:text-[var(--foreground)]'
                                                    }`}
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={340}>
                                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="leakage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} opacity={0.5} />
                                    <XAxis
                                        dataKey="month"
                                        stroke="#555"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#555"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '3 3' }}
                                        contentStyle={{
                                            background: 'rgba(10, 10, 10, 0.95)',
                                            border: '1px solid #333',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            padding: '12px 16px',
                                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                                        }}
                                        formatter={(value: number | undefined) => value ? formatCurrency(value) : '$0'}
                                        labelStyle={{ color: '#888', fontSize: '11px', marginBottom: '6px', fontWeight: 500 }}
                                        itemStyle={{ padding: '2px 0' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10b981"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#revenue)"
                                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#10b981', fill: '#0a0a0a' }}
                                        dot={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="leakage"
                                        stroke="#ef4444"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#leakage)"
                                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#ef4444', fill: '#0a0a0a' }}
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* KEY ISSUES GRID */}
                    <section>
                        <h2 className="text-base font-semibold text-[var(--foreground)] mb-3">Key Issues</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Unbilled Work', value: stats.leakage_by_type.underbilling, count: stats.alerts_by_type.underbilling, href: '/app/time-entries' },
                                { label: 'Late Invoices', value: stats.total_overdue, count: stats.alerts_by_type.late_payment, href: '/app/invoices' },
                                { label: 'Scope Creep', value: stats.leakage_by_type.scope_creep, count: stats.alerts_by_type.scope_creep, href: '/app/clients' },
                            ].map((item) => (
                                <div key={item.label} className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-5">
                                    <p className="text-xs text-gray-500 mb-2">{item.label}</p>
                                    <p className="text-2xl font-bold text-[var(--foreground)] mb-3">
                                        {item.value > 0 ? formatCurrency(item.value) : '—'}
                                    </p>
                                    {item.count > 0 && (
                                        <>
                                            <p className="text-xs text-gray-500 mb-3">
                                                {item.count} {item.count === 1 ? 'client' : 'clients'} affected
                                            </p>
                                            <Link
                                                href={item.href}
                                                className="text-xs font-medium text-gray-400 hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-1"
                                            >
                                                Review
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* RECENT ISSUES LIST */}
                    <section id="alerts" data-tutorial="alerts">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-semibold text-[var(--foreground)]">Recent Issues</h2>
                            {stats.active_alerts.length > 0 && (
                                <span className="text-xs text-gray-500">
                                    {stats.active_alerts.length} active
                                </span>
                            )}
                        </div>

                        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
                            {stats.active_alerts.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {stats.total_clients > 0
                                            ? 'No issues detected'
                                            : 'Add clients to start detecting revenue leaks'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {stats.active_alerts.slice(0, 10).map((alert) => {
                                        const client = clients.find(c => c.id === alert.client_id);
                                        const getAlertLabel = (type: string) => {
                                            switch (type) {
                                                case 'underbilling': return 'Unbilled Work';
                                                case 'scope_creep': return 'Scope Creep';
                                                case 'missing_invoice': return 'Missing Invoice';
                                                case 'late_payment': return 'Late Payment';
                                                case 'low_margin': return 'Low Margin';
                                                case 'negative_margin': return 'Negative Margin';
                                                default: return type;
                                            }
                                        };

                                        return (
                                            <div
                                                key={alert.id}
                                                className="p-5 hover:bg-[var(--background)] transition-colors"
                                            >
                                                <div className="flex items-center justify-between gap-6">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium text-sm text-[var(--foreground)]">
                                                                {client?.name || 'Unknown Client'}
                                                            </h4>
                                                            <span className="text-gray-600">•</span>
                                                            <span className="text-xs text-gray-500">
                                                                {getAlertLabel(alert.alert_type)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 truncate">{alert.message}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 flex-shrink-0">
                                                        <div className="text-right">
                                                            <p className="text-base font-semibold text-red-500">
                                                                {formatCurrency(alert.estimated_leakage)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">at risk</p>
                                                        </div>
                                                        <Link
                                                            href={`/app/clients/${alert.client_id}`}
                                                            className="px-4 py-2 bg-[var(--foreground)] hover:bg-white text-[var(--card)] text-xs font-medium rounded-lg transition-colors"
                                                        >
                                                            Review
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {stats.active_alerts.length > 10 && (
                                        <div className="p-4 text-center">
                                            <Link
                                                href="/app/alerts"
                                                className="text-xs font-medium text-gray-500 hover:text-[var(--foreground)] transition-colors"
                                            >
                                                View all {stats.active_alerts.length} issues
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
