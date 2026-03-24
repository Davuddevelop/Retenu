// src/app/app/invoices/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { dataStore } from '../../lib/dataStore';
import { getDataStatus } from '../../lib/detectionEngine';
import { Invoice, Client } from '../../lib/types';
import Link from 'next/link';
import { Plus, Trash2, ChevronDown, Search } from 'lucide-react';
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
                    <span className="text-xs font-medium text-green-500">
                        Paid
                    </span>
                );
            case 'overdue':
                return (
                    <span className="text-xs font-medium text-red-500">
                        Overdue
                    </span>
                );
            case 'sent':
                return (
                    <span className="text-xs font-medium text-gray-400">
                        {daysUntilDue <= 0 ? 'Due today' : daysUntilDue === 1 ? 'Due tomorrow' : `Due in ${daysUntilDue}d`}
                    </span>
                );
            case 'draft':
                return (
                    <span className="text-xs font-medium text-gray-500">
                        Draft
                    </span>
                );
            default:
                return (
                    <span className="text-xs font-medium text-gray-400">
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
        <div className="space-y-6">
            {isDemoMode && <DemoModeBanner onDisable={handleDisableDemo} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500">
                        {invoices.length > 0
                            ? `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`
                            : 'No invoices yet'}
                    </p>
                </div>
                <Link
                    href="/app/invoices/new"
                    className="px-4 py-2 bg-[var(--foreground)] text-[var(--card)] font-medium rounded-lg text-sm transition-colors hover:bg-white/90 inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Invoice
                </Link>
            </div>

            {invoices.length === 0 ? (
                <div className="bg-[var(--card)] rounded-lg border border-[var(--border)]">
                    <NoInvoicesEmpty />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
                            <p className="text-xs text-gray-500 mb-2">Total</p>
                            <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(totalAmount)}</p>
                        </div>
                        <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
                            <p className="text-xs text-gray-500 mb-2">Paid</p>
                            <p className="text-2xl font-semibold text-green-500">{formatCurrency(paidAmount)}</p>
                        </div>
                        <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
                            <p className="text-xs text-gray-500 mb-2">Pending</p>
                            <p className="text-2xl font-semibold text-[var(--foreground)]">{formatCurrency(pendingAmount)}</p>
                        </div>
                        <div className="bg-[var(--card)] p-6 rounded-lg border border-[var(--border)]">
                            <p className="text-xs text-gray-500 mb-2">Overdue</p>
                            <p className="text-2xl font-semibold text-red-500">{formatCurrency(overdueAmount)}</p>
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
                    <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] overflow-hidden overflow-x-auto">
                        <table className="w-full text-left text-sm min-w-[700px]">
                            <thead className="border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">Client</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">Amount</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">Issued</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">Due</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 text-right"></th>
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
                                        <tr key={invoice.id} className="hover:bg-[var(--background)]/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                                                {getClientName(invoice.client_id)}
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
                                                            className="px-3 py-1.5 text-xs font-medium text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteInvoice(invoice.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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
