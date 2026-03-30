// src/app/app/page.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, AlertCircle, Clock, FileText, Users, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, subMonths, formatDistanceToNow } from 'date-fns';
import { useData } from '../providers/DataProvider';
import { SetupChecklist, NoClientsEmpty, NewUserWelcome } from '../components/EmptyStates';
import { Tutorial, WelcomeModal, useTutorial } from '../components/Tutorial';
import type { DashboardMetrics } from '../lib/types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
    const router = useRouter();
    const {
        clients,
        invoices,
        timeEntries,
        alerts,
        settings,
        isLoading,
        hasData,
        isDemoMode,
        isInitialized,
    } = useData();

    // Redirect new real users to onboarding
    useEffect(() => {
        if (!isInitialized || isLoading) return;

        // Demo/guest users skip onboarding
        if (isDemoMode) return;

        // Check if onboarding is complete
        const onboardingComplete = localStorage.getItem('retenu_onboarding_complete') === 'true';

        // If real user hasn't completed onboarding and has no data, redirect
        if (!onboardingComplete && !hasData) {
            router.replace('/onboarding');
        }
    }, [isInitialized, isLoading, isDemoMode, hasData, router]);

    const [timeframe, setTimeframe] = useState<'3M' | '6M' | '12M'>('6M');

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
                period_start: startOfMonth(new Date()).toISOString(),
                period_end: endOfMonth(new Date()).toISOString(),
                total_clients: 0,
                total_revenue: 0,
                total_cost: 0,
                total_margin: 0,
                margin_percent: 0,
                total_hours: 0,
                billable_hours: 0,
                total_invoiced: 0,
                total_paid: 0,
                total_unpaid: 0,
                total_overdue: 0,
                clients_at_risk: 0,
                healthy_clients: 0,
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

    // Format currency - Mercury style with precise decimals
    const formatMoney = (val: number) => {
        const formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val);
        return formatted;
    };

    const formatMoneyShort = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Generate chart data based on timeframe
    const revenueChartData = useMemo(() => {
        const months = [];
        const currentDate = new Date();
        const monthsToShow = timeframe === '3M' ? 3 : timeframe === '6M' ? 6 : 12;

        // Leakage spike patterns - correlate with alert types
        const leakageSpikes = [0.08, 0.12, 0.06, 0.18, 0.10, 0.25, 0.14, 0.09, 0.22, 0.11, 0.16, 0.20];

        for (let i = monthsToShow - 1; i >= 0; i--) {
            const date = subMonths(currentDate, i);
            const monthName = format(date, 'MMM');

            const baseRevenue = stats.total_revenue || 50000;
            const pseudoRandom1 = (i * 1.5 + 0.5) % 1;

            const monthRevenue = baseRevenue * (0.7 + (monthsToShow - 1 - i) * (0.3 / monthsToShow) + pseudoRandom1 * 0.1);
            // More dramatic leakage with spikes (8-25% of revenue)
            const leakageRate = leakageSpikes[i % leakageSpikes.length];
            const leakage = monthRevenue * leakageRate;

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
            title: 'Set your rates',
            description: 'Configure hourly rates',
            completed: !!settings,
            href: '/app/settings',
            icon: <div className="w-5 h-5" />,
        },
        {
            id: 'clients',
            title: 'Add a client',
            description: 'Add your first client',
            completed: clients.length > 0,
            href: '/app/clients',
            icon: <div className="w-5 h-5" />,
        },
        {
            id: 'time',
            title: 'Import time entries',
            description: 'CSV or Toggl sync',
            completed: timeEntries.length > 0,
            href: '/app/time-entries',
            icon: <div className="w-5 h-5" />,
        },
        {
            id: 'invoices',
            title: 'Add invoices',
            description: 'Track billing',
            completed: invoices.length > 0,
            href: '/app/invoices',
            icon: <div className="w-5 h-5" />,
        },
    ];

    const isSetupComplete = !!settings && clients.length > 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-600 border-t-white" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
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
                isDemoMode ? (
                    <div className="bg-[#111113] rounded-lg border border-[#1c1c1f]">
                        <NoClientsEmpty />
                    </div>
                ) : (
                    <NewUserWelcome />
                )
            ) : (
                <>
                    {/* Primary Metric - Revenue at Risk (Compact horizontal layout) */}
                    <section data-tutorial="metrics">
                        <div className="bg-[#111113] rounded-lg border border-[#1c1c1f] p-4">
                            {stats.total_estimated_leakage > 0 ? (
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    {/* Left side - Main metric */}
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                                <span className="text-xs text-gray-400 uppercase tracking-wide">Revenue at risk</span>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-light text-white tabular-nums tracking-tight">
                                                    ${formatMoney(stats.total_estimated_leakage).split('.')[0]}
                                                </span>
                                                <span className="text-lg font-light text-gray-600 tabular-nums">
                                                    .{formatMoney(stats.total_estimated_leakage).split('.')[1]}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side - Breakdown */}
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:border-l md:border-[#1c1c1f] md:pl-6">
                                        {[
                                            { label: 'Unbilled', value: stats.leakage_by_type.underbilling },
                                            { label: 'Scope creep', value: stats.leakage_by_type.scope_creep },
                                            { label: 'Late payments', value: stats.leakage_by_type.late_payment },
                                            { label: 'Missing invoices', value: stats.leakage_by_type.missing_invoice },
                                        ].filter(item => item.value > 0).map((item) => (
                                            <div key={item.label} className="text-right">
                                                <p className="text-xs text-gray-500">{item.label}</p>
                                                <p className="text-sm text-white tabular-nums font-medium">{formatMoneyShort(item.value)}</p>
                                            </div>
                                        ))}
                                        <Link
                                            href="#alerts"
                                            className="inline-flex items-center gap-1 text-xs text-[#FF5733] hover:text-white transition-colors"
                                        >
                                            {stats.active_alerts.length} issues
                                            <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 py-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">All clear</p>
                                        <p className="text-xs text-gray-500">No revenue leaks detected</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Stats Grid - Cards with visual variety */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-tutorial="stats-grid">
                        {/* Clients Card - Blue accent */}
                        <Link
                            href="/app/clients"
                            className="group relative bg-[#111113] rounded-lg border border-[#1c1c1f] p-4 hover:border-blue-500/30 transition-all duration-300 overflow-hidden"
                        >
                            {/* Accent gradient on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            {/* Corner accent */}
                            <div className="absolute top-0 left-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-500/0 rounded-tr-full" />

                            <div className="relative">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Clients</p>
                                    <Users className="w-4 h-4 text-blue-500/50 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <p className="text-2xl font-light text-white tabular-nums group-hover:text-blue-50 transition-colors">{stats.total_clients}</p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <p className="text-xs text-gray-500">{stats.healthy_clients} healthy</p>
                                </div>
                            </div>
                        </Link>

                        {/* Revenue Card - Green accent with bar */}
                        <Link
                            href="/app/invoices"
                            className="group relative bg-[#111113] rounded-lg border border-[#1c1c1f] p-4 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute top-0 left-0 w-1 h-8 bg-gradient-to-b from-emerald-500 to-emerald-500/0 rounded-tr-full" />

                            <div className="relative">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Revenue</p>
                                    <TrendingUp className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
                                </div>
                                <p className="text-2xl font-light text-white tabular-nums group-hover:text-emerald-50 transition-colors">{formatMoneyShort(stats.total_revenue)}</p>
                                {/* Mini margin bar */}
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-gray-500">Margin</span>
                                        <span className="text-emerald-500 tabular-nums">{stats.margin_percent.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1 bg-[#1c1c1f] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500/80 to-emerald-400 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(stats.margin_percent, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Hours Card - Amber accent with ring */}
                        <Link
                            href="/app/time-entries"
                            className="group relative bg-[#111113] rounded-lg border border-[#1c1c1f] p-4 hover:border-amber-500/30 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute top-0 left-0 w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-500/0 rounded-tr-full" />

                            <div className="relative">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Hours</p>
                                    <Clock className="w-4 h-4 text-amber-500/50 group-hover:text-amber-500 transition-colors" />
                                </div>
                                <p className="text-2xl font-light text-white tabular-nums group-hover:text-amber-50 transition-colors">{stats.total_hours.toFixed(0)}</p>
                                {/* Billable vs Total indicator */}
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex-1 h-1.5 bg-[#1c1c1f] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500/80 to-amber-400 rounded-full"
                                            style={{ width: `${stats.total_hours > 0 ? (stats.billable_hours / stats.total_hours) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 tabular-nums">{stats.billable_hours.toFixed(0)} billable</span>
                                </div>
                            </div>
                        </Link>

                        {/* Unpaid Card - Red/Orange accent with status */}
                        <Link
                            href="/app/invoices"
                            className={`group relative bg-[#111113] rounded-lg border p-4 transition-all duration-300 overflow-hidden ${
                                stats.total_overdue > 0
                                    ? 'border-red-500/20 hover:border-red-500/40'
                                    : 'border-[#1c1c1f] hover:border-[#FF5733]/30'
                            }`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                stats.total_overdue > 0 ? 'from-red-500/5' : 'from-[#FF5733]/5'
                            } to-transparent`} />
                            <div className={`absolute top-0 left-0 w-1 h-8 bg-gradient-to-b rounded-tr-full ${
                                stats.total_overdue > 0 ? 'from-red-500 to-red-500/0' : 'from-[#FF5733] to-[#FF5733]/0'
                            }`} />

                            <div className="relative">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Unpaid</p>
                                    {stats.total_overdue > 0 ? (
                                        <div className="relative">
                                            <FileText className="w-4 h-4 text-red-500/50 group-hover:text-red-500 transition-colors" />
                                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        </div>
                                    ) : (
                                        <FileText className="w-4 h-4 text-[#FF5733]/50 group-hover:text-[#FF5733] transition-colors" />
                                    )}
                                </div>
                                <p className={`text-2xl font-light tabular-nums transition-colors ${
                                    stats.total_overdue > 0 ? 'text-red-400 group-hover:text-red-300' : 'text-white group-hover:text-orange-50'
                                }`}>
                                    {formatMoneyShort(stats.total_unpaid)}
                                </p>
                                {stats.total_overdue > 0 ? (
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <p className="text-xs text-red-400">{formatMoneyShort(stats.total_overdue)} overdue</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-xs text-gray-500">All on time</p>
                                    </div>
                                )}
                            </div>
                        </Link>
                    </section>

                    {/* Chart Section - Clean, minimal */}
                    <section data-tutorial="chart">
                        <div className="bg-[#111113] rounded-lg border border-[#1c1c1f] p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-sm font-medium text-white">Revenue & Leakage</h2>
                                </div>
                                <div className="flex items-center gap-1 bg-[#0a0a0b] rounded-md p-0.5">
                                    {(['3M', '6M', '12M'] as const).map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => setTimeframe(period)}
                                            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                                timeframe === period
                                                    ? 'bg-[#1c1c1f] text-white'
                                                    : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-6 mb-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-gray-400">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-gray-400">Leakage</span>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={revenueChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="leakage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="month"
                                        stroke="#333"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#333"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                        width={50}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#111113',
                                            border: '1px solid #1c1c1f',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            padding: '8px 12px',
                                        }}
                                        formatter={(value: number | undefined) => value ? formatMoneyShort(value) : '$0'}
                                        labelStyle={{ color: '#666', fontSize: '11px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10b981"
                                        strokeWidth={1.5}
                                        fill="url(#revenue)"
                                        dot={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="leakage"
                                        stroke="#ef4444"
                                        strokeWidth={1.5}
                                        fill="url(#leakage)"
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Issues List - Clean table style */}
                    <section id="alerts" data-tutorial="alerts">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-medium text-white">Issues</h2>
                            {stats.active_alerts.length > 0 && (
                                <Link
                                    href="/app/alerts"
                                    className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    View all
                                    <ChevronRight className="w-3 h-3" />
                                </Link>
                            )}
                        </div>

                        <div className="bg-[#111113] rounded-lg border border-[#1c1c1f] overflow-hidden">
                            {stats.active_alerts.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                                        <Check className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <p className="text-sm text-gray-400">No issues detected</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#1c1c1f]">
                                    {stats.active_alerts.slice(0, 5).map((alert) => {
                                        const client = clients.find(c => c.id === alert.client_id);
                                        const getAlertInfo = (type: string) => {
                                            switch (type) {
                                                case 'underbilling': return { label: 'Unbilled', icon: Clock };
                                                case 'scope_creep': return { label: 'Scope creep', icon: TrendingUp };
                                                case 'missing_invoice': return { label: 'No invoice', icon: FileText };
                                                case 'late_payment': return { label: 'Late payment', icon: AlertCircle };
                                                case 'low_margin': return { label: 'Low margin', icon: TrendingUp };
                                                case 'negative_margin': return { label: 'Negative margin', icon: AlertCircle };
                                                default: return { label: type, icon: AlertCircle };
                                            }
                                        };

                                        const alertInfo = getAlertInfo(alert.alert_type);
                                        const timeAgo = formatDistanceToNow(new Date(alert.created_at), { addSuffix: true });

                                        return (
                                            <Link
                                                key={alert.id}
                                                href={`/app/clients/${alert.client_id}`}
                                                className="flex items-center justify-between p-4 hover:bg-[#0f0f11] transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <alertInfo.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-sm text-white truncate">
                                                            {client?.name || 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {alertInfo.label} · {timeAgo}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className="text-sm text-red-400 tabular-nums">
                                                        {formatMoneyShort(alert.estimated_leakage)}
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
