// src/app/app/invoices/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { dataStore } from '../../lib/dataStore';
import { getDataStatus } from '../../lib/detectionEngine';
import { Invoice, Client } from '../../lib/types';
import Link from 'next/link';
import { Plus, FileText, Trash2, Calendar, CheckCircle2, Clock, AlertCircle, ChevronDown, Search, DollarSign, CreditCard } from 'lucide-react';
import { DemoModeBanner, NoInvoicesEmpty } from '../../components/EmptyStates';
import { format, parseISO, differenceInDays } from 'date-fns';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [filterClient, setFilterClient] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const status = getDataStatus();
        setIsDemoMode(status.isDemoMode);
        setClients(dataStore.getClients());
        loadInvoices();
        setIsLoading(false);
    }, []);

    const loadInvoices = () => {
        setInvoices(dataStore.getInvoices());
    };

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

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Unknown Client';
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    // Filter invoices
    const filteredInvoices = invoices.filter(invoice => {
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

    // Calculate totals
    const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.amount, 0);
    const paidAmount = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const pendingAmount = filteredInvoices.filter(i => i.status === 'pending' || i.status === 'sent').reduce((sum, i) => sum + i.amount, 0);
    const overdueAmount = filteredInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

    const getStatusBadge = (status: Invoice['status'], dueDate: string) => {
        const today = new Date();
        const due = parseISO(dueDate);
        const daysUntilDue = differenceInDays(due, today);

        switch (status) {
            case 'paid':
                return (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--profit)]/10 text-[var(--profit)] font-medium flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        Paid
                    </span>
                );
            case 'overdue':
                return (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--leak)]/10 text-[var(--leak)] font-medium flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3 h-3" />
                        Overdue
                    </span>
                );
            case 'sent':
                return (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${
                        daysUntilDue <= 7 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                        <Clock className="w-3 h-3" />
                        {daysUntilDue <= 0 ? 'Due Today' : daysUntilDue === 1 ? 'Due Tomorrow' : `Due in ${daysUntilDue}d`}
                    </span>
                );
            case 'draft':
                return (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-400 font-medium flex items-center gap-1 w-fit">
                        <FileText className="w-3 h-3" />
                        Draft
                    </span>
                );
            default:
                return (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-400 font-medium flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Invoices</h1>
                    <p className="text-gray-400 mt-1">
                        {invoices.length > 0
                            ? `${formatCurrency(totalAmount)} total across ${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`
                            : 'Track invoices to detect missing and late payments.'}
                    </p>
                </div>
                <Link
                    href="/app/invoices/new"
                    className="px-4 py-2 bg-[var(--foreground)] text-[var(--card)] font-bold rounded-lg text-sm transition-colors hover:bg-white/90 active:bg-white/80 inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <DollarSign className="w-4 h-4" />
                                <span className="text-xs font-medium">Total</span>
                            </div>
                            <p className="text-xl font-bold text-[var(--foreground)]">{formatCurrency(totalAmount)}</p>
                        </div>
                        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                            <div className="flex items-center gap-2 text-[var(--profit)] mb-2">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs font-medium">Paid</span>
                            </div>
                            <p className="text-xl font-bold text-[var(--foreground)]">{formatCurrency(paidAmount)}</p>
                        </div>
                        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                            <div className="flex items-center gap-2 text-blue-500 mb-2">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-medium">Pending</span>
                            </div>
                            <p className="text-xl font-bold text-[var(--foreground)]">{formatCurrency(pendingAmount)}</p>
                        </div>
                        <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
                            <div className="flex items-center gap-2 text-[var(--leak)] mb-2">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-xs font-medium">Overdue</span>
                            </div>
                            <p className="text-xl font-bold text-[var(--foreground)]">{formatCurrency(overdueAmount)}</p>
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
                                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <select
                                    value={filterClient}
                                    onChange={(e) => setFilterClient(e.target.value)}
                                    className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-lg pl-4 pr-10 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
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
                                    className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-lg pl-4 pr-10 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
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
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[700px]">
                            <thead className="bg-[var(--background)]/50 border-b border-[var(--border)] text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Client</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Issue Date</th>
                                    <th className="px-6 py-4 font-medium">Due Date</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
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
                                    filteredInvoices.map(invoice => (
                                        <tr key={invoice.id} className="hover:bg-[var(--background)]/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
                                                        <FileText className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    {getClientName(invoice.client_id)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-[var(--foreground)]">
                                                {formatCurrency(invoice.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {format(parseISO(invoice.issue_date), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {format(parseISO(invoice.due_date), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(invoice.status, invoice.due_date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {invoice.status !== 'paid' && (
                                                        <button
                                                            onClick={() => handleMarkPaid(invoice.id)}
                                                            className="px-3 py-1.5 text-xs font-medium text-[var(--profit)] bg-[var(--profit)]/10 hover:bg-[var(--profit)]/20 rounded-lg transition-colors"
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
