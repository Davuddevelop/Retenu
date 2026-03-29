// src/app/app/invoices/page.tsx
'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { dataStore } from '../../lib/dataStore';
import { getDataStatus } from '../../lib/detectionEngine';
import { Invoice, Client } from '../../lib/types';
import Link from 'next/link';
import { Plus, Trash2, ChevronDown, Search, DollarSign, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { DemoModeBanner, NoInvoicesEmpty } from '../../components/EmptyStates';
import { format, parseISO, differenceInDays } from 'date-fns';

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

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [filterClient, setFilterClient] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const loadInvoices = () => {
        setInvoices(dataStore.getInvoices());
    };

    useEffect(() => {
        const initializeData = () => {
            const status = getDataStatus();
            const clientsData = dataStore.getClients();
            const invoicesData = dataStore.getInvoices();

            setIsDemoMode(status.isDemoMode);
            setClients(clientsData);
            setInvoices(invoicesData);
            setIsLoading(false);
        };
        initializeData();
    }, []);

    const handleDisableDemo = () => {
        dataStore.disableDemoMode();
        window.location.reload();
    };

    const handleDeleteInvoice = (id: string) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            dataStore.deleteInvoice(id);
            loadInvoices();
        }
    };

    const handleMarkPaid = (id: string) => {
        dataStore.markInvoicePaid(id);
        loadInvoices();
    };

    const getClientName = useCallback((clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Unknown Client';
    }, [clients]);

    // Filter invoices
    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            if (filterClient !== 'all' && invoice.client_id !== filterClient) {
                return false;
            }
            if (filterStatus !== 'all' && invoice.status !== filterStatus) {
                return false;
            }
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const clientName = getClientName(invoice.client_id).toLowerCase();
                if (!clientName.includes(query)) {
                    return false;
                }
            }
            return true;
        }).sort((a, b) => b.issue_date.localeCompare(a.issue_date));
    }, [invoices, filterClient, filterStatus, searchQuery, clients, getClientName]);

    // Calculate totals with more precision
    const stats = useMemo(() => {
        const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.amount, 0);
        const paidAmount = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
        const pendingAmount = filteredInvoices.filter(i => i.status === 'pending' || i.status === 'sent').reduce((sum, i) => sum + i.amount, 0);
        const overdueAmount = filteredInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
        const overdueCount = filteredInvoices.filter(i => i.status === 'overdue').length;
        const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

        return { totalAmount, paidAmount, pendingAmount, overdueAmount, overdueCount, collectionRate };
    }, [filteredInvoices]);

    const getStatusBadge = (status: Invoice['status'], dueDate: string) => {
        const today = new Date();
        const due = parseISO(dueDate);
        const daysUntilDue = differenceInDays(due, today);
        const daysOverdue = Math.abs(daysUntilDue);

        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-500 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Paid
                    </span>
                );
            case 'overdue':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[var(--leak)]/10 text-[var(--leak)] rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--leak)] animate-pulse" />
                        {daysOverdue}d overdue
                    </span>
                );
            case 'sent':
                if (daysUntilDue <= 0) {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-500 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Due today
                        </span>
                    );
                } else if (daysUntilDue <= 3) {
                    return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-500 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Due in {daysUntilDue}d
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-blue-500/10 text-blue-400 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Sent
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gray-500/10 text-gray-400 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        Draft
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gray-500/10 text-gray-400 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        Pending
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--foreground)]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {isDemoMode && <DemoModeBanner onDisable={handleDisableDemo} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-tutorial="invoices-header">
                <div>
                    <p className="text-sm text-gray-400">
                        {invoices.length > 0
                            ? `${filteredInvoices.length} invoice${filteredInvoices.length !== 1 ? 's' : ''} · ${stats.collectionRate.toFixed(1)}% collected`
                            : 'Start tracking your invoices'}
                    </p>
                </div>
                <Link
                    href="/app/invoices/new"
                    className="px-4 py-2.5 bg-[var(--foreground)] text-[var(--card)] font-medium rounded-xl text-sm transition-all hover:bg-white/90 hover:scale-[1.02] inline-flex items-center gap-2 shadow-lg shadow-white/5"
                >
                    <Plus className="w-4 h-4" />
                    Add Invoice
                </Link>
            </div>

            {invoices.length === 0 ? (
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
                    <NoInvoicesEmpty />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-[var(--neutral-metric)]/20 flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-[var(--neutral-metric)]" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
                            </div>
                            <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums">
                                {formatCurrency(stats.totalAmount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Collected</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-500 tabular-nums">
                                {formatCurrency(stats.paidAmount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.collectionRate.toFixed(1)}% of total
                            </p>
                        </div>

                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Pending</span>
                            </div>
                            <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums">
                                {formatCurrency(stats.pendingAmount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">awaiting payment</p>
                        </div>

                        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-lg bg-[var(--leak)]/20 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-[var(--leak)]" />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Overdue</span>
                            </div>
                            <p className="text-2xl font-bold text-[var(--leak)] tabular-nums">
                                {formatCurrency(stats.overdueAmount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.overdueCount > 0 ? `${stats.overdueCount} need${stats.overdueCount === 1 ? 's' : ''} attention` : 'all good'}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by client name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)] transition-all"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <select
                                    value={filterClient}
                                    onChange={(e) => setFilterClient(e.target.value)}
                                    className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-xl pl-4 pr-10 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)] transition-all"
                                >
                                    <option value="all">All Clients</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-xl pl-4 pr-10 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)] transition-all"
                                >
                                    <option value="all">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Invoices Table */}
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-[750px]">
                                <thead className="border-b border-[var(--border)] bg-[var(--background)]/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Issued</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Due Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {filteredInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                                No invoices match your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInvoices.map(invoice => {
                                            const clientName = getClientName(invoice.client_id);
                                            return (
                                                <tr key={invoice.id} className="hover:bg-[var(--background)]/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--neutral-metric)]/20 to-[var(--neutral-metric)]/5 flex items-center justify-center text-[var(--neutral-metric)] font-bold text-xs">
                                                                {clientName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-[var(--foreground)]">{clientName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-[var(--foreground)] tabular-nums">
                                                            {formatCurrency(invoice.amount, true)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400">
                                                        {format(parseISO(invoice.issue_date), 'MMM d, yyyy')}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400">
                                                        {format(parseISO(invoice.due_date), 'MMM d, yyyy')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(invoice.status, invoice.due_date)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {invoice.status !== 'paid' && (
                                                                <button
                                                                    onClick={() => handleMarkPaid(invoice.id)}
                                                                    className="px-3 py-1.5 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                                >
                                                                    Mark Paid
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteInvoice(invoice.id)}
                                                                className="p-2 text-gray-400 hover:text-[var(--leak)] hover:bg-[var(--leak)]/10 rounded-lg transition-colors"
                                                                title="Delete invoice"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Collection tip */}
                    {stats.overdueCount > 0 && (
                        <div className="bg-[var(--leak)]/5 border border-[var(--leak)]/20 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[var(--leak)]/20 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="w-4 h-4 text-[var(--leak)]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[var(--foreground)]">
                                        You have {formatCurrency(stats.overdueAmount)} in overdue invoices
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Consider sending a friendly reminder to collect these payments.
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
