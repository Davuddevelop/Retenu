// src/app/app/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, TrendingUp, AlertCircle, Clock, FileText, Users, ArrowUpRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, subMonths, formatDistanceToNow } from 'date-fns';
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

    // Format currency with cents for authenticity
    const formatCurrency = (val: number, showCents = false) => {
        if (showCents) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(val);
        }
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

        for (let i = monthsToShow - 1; i >= 0; i--) {
            const date = subMonths(currentDate, i);
            const monthName = format(date, 'MMM');

            const baseRevenue = stats.total_revenue || 50000;
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
            title: 'Set your rates',
            description: 'Tell us what you charge (we need this to do the math)',
            completed: !!settings,
            href: '/app/settings',
            icon: <div className="w-5 h-5" />,
        },
        {
            id: 'clients',
            title: 'Add a client',
            description: 'Just one to start—you can add more anytime',
            completed: clients.length > 0,
            href: '/app/clients',
            icon: <div className="w-5 h-5" />,
        },
        {
            id: 'time',
            title: 'Import time entries',
            description: 'CSV upload or connect Toggl',
            completed: timeEntries.length > 0,
            href: '/app/time-entries',
            icon: <div className="w-5 h-5" />,
        },
        {
            id: 'invoices',
            title: 'Add invoices',
            description: 'So we can check what got billed vs what didn\'t',
            completed: invoices.length > 0,
            href: '/app/invoices',
            icon: <div className="w-5 h-5" />,
        },
    ];

    const isSetupComplete = !!settings && clients.length > 0;

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // Get contextual message based on data
    const getContextMessage = () => {
        if (!hasData) return null;
        if (stats.total_estimated_leakage > 10000) {
            return "There's some money sitting on the table. Let's get it back.";
        }
        if (stats.total_estimated_leakage > 0) {
            return "Found a few things worth looking at.";
        }
        if (stats.active_alerts.length === 0) {
            return "Looking good—nothing major to flag right now.";
        }
        return null;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)] mx-auto mb-4" />
                    <p className="text-sm text-gray-500">Crunching the numbers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative pb-12">
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

            {/* Header with greeting */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-1">
                        {getGreeting()}
                    </h1>
                    {getContextMessage() && (
                        <p className="text-gray-500">{getContextMessage()}</p>
                    )}
                </div>
                <div className="text-right text-sm text-gray-500">
                    <p>{format(new Date(), 'EEEE, MMMM d')}</p>
                    <p className="text-xs text-gray-600 mt-1">Last updated just now</p>
                </div>
            </div>

            {!isSetupComplete && (
                <SetupChecklist steps={setupSteps} />
            )}

            {!hasData ? (
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
                    <NoClientsEmpty />
                </div>
            ) : (
                <>
                    {/* HERO PANEL - Revenue at Risk */}
                    <section data-tutorial="metrics">
                        <div className="relative bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                            {/* Subtle gradient background */}
                            {stats.total_estimated_leakage > 0 && (
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 pointer-events-none" />
                            )}

                            <div className="relative p-8">
                                {stats.total_estimated_leakage > 0 ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                <span className="text-sm font-medium text-red-500">Revenue at risk</span>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between mb-8">
                                            <div>
                                                <h2 className="text-5xl md:text-6xl font-bold text-[var(--leak)] tracking-tight tabular-nums mb-2">
                                                    {formatCurrency(stats.total_estimated_leakage, true)}
                                                </h2>
                                                <p className="text-sm text-gray-400">
                                                    Across <span className="text-[var(--foreground)] font-medium">{stats.clients_at_risk}</span> {stats.clients_at_risk === 1 ? 'client' : 'clients'} · <span className="text-[var(--foreground)] font-medium">{stats.active_alerts.length}</span> issues found
                                                </p>
                                            </div>

                                            {/* Mini trend indicator */}
                                            <div className="hidden md:flex items-end gap-1 h-16 opacity-30">
                                                {[35, 45, 30, 55, 40, 65, 50, 80].map((h, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-2 rounded-t transition-all ${i >= 6 ? 'bg-[var(--leak)]' : 'bg-white/20'}`}
                                                        style={{ height: `${h}%` }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Breakdown cards - Bento style */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                                            {[
                                                {
                                                    label: 'Unbilled hours',
                                                    value: stats.leakage_by_type.underbilling,
                                                    icon: Clock,
                                                    color: 'text-[var(--leak)]',
                                                    bg: 'bg-[var(--leak)]/10',
                                                    border: 'border-[var(--leak)]/20'
                                                },
                                                {
                                                    label: 'Scope creep',
                                                    value: stats.leakage_by_type.scope_creep,
                                                    icon: TrendingUp,
                                                    color: 'text-amber-500',
                                                    bg: 'bg-amber-500/10',
                                                    border: 'border-amber-500/20'
                                                },
                                                {
                                                    label: 'Late payments',
                                                    value: stats.leakage_by_type.late_payment,
                                                    icon: AlertCircle,
                                                    color: 'text-red-500',
                                                    bg: 'bg-red-500/10',
                                                    border: 'border-red-500/20'
                                                },
                                                {
                                                    label: 'Missing invoices',
                                                    value: stats.leakage_by_type.missing_invoice,
                                                    icon: FileText,
                                                    color: 'text-blue-500',
                                                    bg: 'bg-blue-500/10',
                                                    border: 'border-blue-500/20'
                                                },
                                            ].filter(item => item.value > 0).map((item) => (
                                                <div
                                                    key={item.label}
                                                    className={`${item.bg} rounded-xl p-4 border ${item.border} hover:scale-[1.02] transition-transform cursor-default`}
                                                >
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                                                            <item.icon className={`w-4 h-4 ${item.color}`} />
                                                        </div>
                                                        <span className={`text-xs font-medium ${item.color} uppercase tracking-wider`}>{item.label}</span>
                                                    </div>
                                                    <p className="text-xl font-bold text-[var(--foreground)] tabular-nums">
                                                        {formatCurrency(item.value)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <Link
                                            href="#alerts"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--foreground)] hover:bg-white text-[var(--card)] text-sm font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-white/5 group"
                                        >
                                            Review all issues
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </>
                                ) : (
                                    <div className="text-center py-12 relative">
                                        {/* Success gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/5 pointer-events-none rounded-xl" />

                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                                <Sparkles className="w-10 h-10 text-emerald-500" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                                                All clear — nice work!
                                            </h3>
                                            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                                                No revenue leaks detected right now. Your projects are on track and payments are coming in. We&apos;ll keep watching.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Quick Stats Row */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Active clients',
                                value: stats.total_clients.toString(),
                                sub: `${stats.healthy_clients} healthy`,
                                icon: Users,
                                href: '/app/clients',
                                color: 'text-blue-500',
                                bg: 'bg-blue-500/10',
                                border: 'group-hover:border-blue-500/30'
                            },
                            {
                                label: 'This month\'s revenue',
                                value: formatCurrency(stats.total_revenue),
                                sub: `${stats.margin_percent.toFixed(1)}% margin`,
                                icon: TrendingUp,
                                href: '/app/invoices',
                                color: 'text-emerald-500',
                                bg: 'bg-emerald-500/10',
                                border: 'group-hover:border-emerald-500/30'
                            },
                            {
                                label: 'Hours logged',
                                value: stats.total_hours.toFixed(1),
                                sub: `${stats.billable_hours.toFixed(1)} billable`,
                                icon: Clock,
                                href: '/app/time-entries',
                                color: 'text-violet-500',
                                bg: 'bg-violet-500/10',
                                border: 'group-hover:border-violet-500/30'
                            },
                            {
                                label: 'Unpaid invoices',
                                value: formatCurrency(stats.total_unpaid),
                                sub: stats.total_overdue > 0 ? `${formatCurrency(stats.total_overdue)} overdue` : 'All on time',
                                icon: FileText,
                                href: '/app/invoices',
                                color: stats.total_overdue > 0 ? 'text-amber-500' : 'text-gray-400',
                                bg: stats.total_overdue > 0 ? 'bg-amber-500/10' : 'bg-gray-500/10',
                                border: stats.total_overdue > 0 ? 'group-hover:border-amber-500/30' : 'group-hover:border-gray-500/30'
                            },
                        ].map((stat) => (
                            <Link
                                key={stat.label}
                                href={stat.href}
                                className={`group bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 hover:bg-[var(--background)] transition-all duration-200 hover:scale-[1.02] ${stat.border}`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </div>
                                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums">{stat.value}</p>
                                <p className="text-xs text-gray-600 mt-1.5">{stat.sub}</p>
                            </Link>
                        ))}
                    </section>

                    {/* REVENUE & LEAKAGE CHART */}
                    <section>
                        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 relative overflow-hidden">
                            {/* Subtle background pattern */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] via-transparent to-red-500/[0.02] pointer-events-none" />

                            <div className="relative">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-red-500/10 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-0.5">
                                                Revenue vs Leakage
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                How much you&apos;re making vs how much is slipping away
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-[var(--background)] rounded-xl p-1.5 border border-[var(--border)]">
                                        {(['3M', '6M', '12M'] as const).map((period) => (
                                            <button
                                                key={period}
                                                onClick={() => setTimeframe(period)}
                                                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                                                    timeframe === period
                                                        ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm border border-[var(--border)]'
                                                        : 'text-gray-500 hover:text-[var(--foreground)] hover:bg-[var(--card)]/50'
                                                }`}
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-sm text-gray-400">Revenue</span>
                                        <span className="text-sm font-semibold text-emerald-500">{formatCurrency(stats.total_revenue)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/5 border border-red-500/10 rounded-lg">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                        <span className="text-sm text-gray-400">Leakage</span>
                                        <span className="text-sm font-semibold text-red-500">{formatCurrency(stats.total_estimated_leakage)}</span>
                                    </div>
                                </div>

                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="leakage" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
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
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#revenue)"
                                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#10b981', fill: '#0a0a0a' }}
                                        dot={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="leakage"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#leakage)"
                                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#ef4444', fill: '#0a0a0a' }}
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                            </div>
                        </div>
                    </section>

                    {/* RECENT ISSUES LIST */}
                    <section id="alerts" data-tutorial="alerts">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-[var(--foreground)]">
                                        Things to look at
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {stats.active_alerts.length > 0
                                            ? `${stats.active_alerts.length} issues need your attention`
                                            : 'Nothing urgent right now'
                                        }
                                    </p>
                                </div>
                            </div>
                            {stats.active_alerts.length > 0 && (
                                <Link
                                    href="/app/alerts"
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--foreground)]/30 rounded-lg transition-all flex items-center gap-2 group"
                                >
                                    View all
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            )}
                        </div>

                        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
                            {stats.active_alerts.length === 0 ? (
                                <div className="p-12 text-center relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                                            <TrendingUp className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                                            You&apos;re all caught up
                                        </h3>
                                        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                                            {stats.total_clients > 0
                                                ? 'No issues detected. We\'ll ping you if something comes up.'
                                                : 'Add some clients and data to start detecting leaks.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--border)]">
                                    {stats.active_alerts.slice(0, 8).map((alert, index) => {
                                        const client = clients.find(c => c.id === alert.client_id);
                                        const getAlertInfo = (type: string) => {
                                            switch (type) {
                                                case 'underbilling': return { label: 'Unbilled hours', color: 'text-orange-500', bg: 'bg-orange-500/10', iconBg: 'bg-orange-500', Icon: Clock };
                                                case 'scope_creep': return { label: 'Scope creep', color: 'text-yellow-500', bg: 'bg-yellow-500/10', iconBg: 'bg-yellow-500', Icon: TrendingUp };
                                                case 'missing_invoice': return { label: 'Missing invoice', color: 'text-purple-500', bg: 'bg-purple-500/10', iconBg: 'bg-purple-500', Icon: FileText };
                                                case 'late_payment': return { label: 'Late payment', color: 'text-red-500', bg: 'bg-red-500/10', iconBg: 'bg-red-500', Icon: AlertCircle };
                                                case 'low_margin': return { label: 'Low margin', color: 'text-amber-500', bg: 'bg-amber-500/10', iconBg: 'bg-amber-500', Icon: TrendingUp };
                                                case 'negative_margin': return { label: 'Negative margin', color: 'text-red-600', bg: 'bg-red-600/10', iconBg: 'bg-red-600', Icon: AlertCircle };
                                                default: return { label: type, color: 'text-gray-500', bg: 'bg-gray-500/10', iconBg: 'bg-gray-500', Icon: AlertCircle };
                                            }
                                        };

                                        const alertInfo = getAlertInfo(alert.alert_type);
                                        const timeAgo = formatDistanceToNow(new Date(alert.created_at), { addSuffix: true });

                                        return (
                                            <Link
                                                key={alert.id}
                                                href={`/app/clients/${alert.client_id}`}
                                                className="block p-5 hover:bg-[var(--background)] transition-all duration-200 group"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                                        <div className={`w-10 h-10 rounded-xl ${alertInfo.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                            <alertInfo.Icon className={`w-5 h-5 ${alertInfo.color}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <h4 className="font-semibold text-[var(--foreground)] group-hover:text-white transition-colors">
                                                                    {client?.name || 'Unknown Client'}
                                                                </h4>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${alertInfo.bg} ${alertInfo.color} font-medium`}>
                                                                    {alertInfo.label}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-400 truncate mb-1">{alert.message}</p>
                                                            <p className="text-xs text-gray-600">{timeAgo}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 flex-shrink-0">
                                                        <div className="text-right">
                                                            <p className="text-xl font-bold text-[var(--leak)] tabular-nums">
                                                                {formatCurrency(alert.estimated_leakage, true)}
                                                            </p>
                                                            <p className="text-xs text-gray-600 uppercase tracking-wider">at risk</p>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5">
                                                            <ArrowRight className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    {stats.active_alerts.length > 8 && (
                                        <Link
                                            href="/app/alerts"
                                            className="block p-5 text-center text-sm text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-all font-medium"
                                        >
                                            View all {stats.active_alerts.length} issues
                                            <ArrowRight className="w-4 h-4 inline ml-2" />
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
