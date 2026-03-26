// src/app/app/invoices/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { dataStore } from '../../../lib/dataStore';
import { Client, Invoice } from '../../../lib/types';
import { addDays, format } from 'date-fns';
import { useData } from '../../../providers/DataProvider';
import { createBrowserClient } from '@supabase/ssr';

export default function NewInvoicePage() {
    const router = useRouter();
    const { mode, organizationId: orgIdFromContext, clients: allClients, refreshInvoices } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get active clients from context or datastore based on mode
    const clients = mode === 'supabase' 
        ? allClients.filter(c => c.status === 'active')
        : dataStore.getActiveClients();

    const today = new Date().toISOString().split('T')[0];
    const defaultDueDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

    const [formData, setFormData] = useState({
        client_id: '',
        amount: '',
        issue_date: today,
        due_date: defaultDueDate,
        status: 'sent' as Invoice['status'],
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Validate required fields
            if (!formData.client_id) {
                throw new Error('Please select a client');
            }
            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                throw new Error('Invoice amount must be greater than 0');
            }

            // Determine status based on dates
            let status = formData.status;
            if (status === 'sent') {
                const invoiceDate = new Date();
                const dueDateObj = new Date(formData.due_date);
                if (dueDateObj < invoiceDate) {
                    status = 'overdue';
                }
            }

            if (mode === 'supabase') {
                if (!orgIdFromContext) throw new Error('Organization not found');

                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { error: insertError } = await supabase.from('invoices').insert({
                    client_id: formData.client_id,
                    organization_id: orgIdFromContext,
                    amount: parseFloat(formData.amount),
                    status: status,
                    issue_date: formData.issue_date,
                    due_date: formData.due_date,
                    paid_date: status === 'paid' ? today : null,
                });
                
                if (insertError) throw insertError;
                
                await refreshInvoices();
            } else {
                const org = dataStore.getOrganization();
                const organizationId = org?.id || 'default-org';
                
                dataStore.createInvoice({
                    client_id: formData.client_id,
                    organization_id: organizationId,
                    amount: parseFloat(formData.amount),
                    status: status,
                    issue_date: formData.issue_date,
                    due_date: formData.due_date,
                    paid_date: status === 'paid' ? today : null,
                    stripe_invoice_id: null,
                });
            }

            // Redirect to invoices list
            router.push('/app/invoices');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create invoice');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto-fill amount from selected client's retainer
    const handleClientChange = (clientId: string) => {
        setFormData(prev => ({ ...prev, client_id: clientId }));
        if (clientId && !formData.amount) {
            const client = clients.find(c => c.id === clientId);
            if (client) {
                setFormData(prev => ({
                    ...prev,
                    amount: client.agreed_monthly_retainer.toString(),
                }));
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
            {/* Back Link */}
            <Link
                href="/app/invoices"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-[var(--foreground)] transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Invoices
            </Link>

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--profit)]/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[var(--profit)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">New Invoice</h1>
                    <p className="text-gray-400">Create an invoice to track payments and detect leakage.</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-[var(--leak)]/10 border border-[var(--leak)]/20 rounded-lg">
                        <p className="text-sm text-[var(--leak)]">{error}</p>
                    </div>
                )}

                {/* Client & Amount */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)]">
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Invoice Details</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Client <span className="text-[var(--leak)]">*</span>
                            </label>
                            <select
                                name="client_id"
                                value={formData.client_id}
                                onChange={(e) => handleClientChange(e.target.value)}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                required
                            >
                                <option value="">Select a client...</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.name} (${client.agreed_monthly_retainer.toLocaleString()}/mo)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Amount <span className="text-[var(--leak)]">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="5000"
                                    min="0"
                                    step="0.01"
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)]">
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Dates</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Issue Date <span className="text-[var(--leak)]">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="issue_date"
                                    value={formData.issue_date}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Due Date <span className="text-[var(--leak)]">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="due_date"
                                    value={formData.due_date}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Quick Due Date Options */}
                        <div>
                            <p className="text-xs text-gray-500 mb-2">Quick set due date:</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Net 15', days: 15 },
                                    { label: 'Net 30', days: 30 },
                                    { label: 'Net 45', days: 45 },
                                    { label: 'Net 60', days: 60 },
                                ].map(option => (
                                    <button
                                        key={option.days}
                                        type="button"
                                        onClick={() => {
                                            const dueDate = format(addDays(new Date(formData.issue_date), option.days), 'yyyy-MM-dd');
                                            setFormData(prev => ({ ...prev, due_date: dueDate }));
                                        }}
                                        className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-gray-400 hover:text-[var(--foreground)] hover:border-[var(--neutral-metric)] transition-colors"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)]">
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Status</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { value: 'draft', label: 'Draft', description: 'Not sent yet' },
                                { value: 'sent', label: 'Sent', description: 'Awaiting payment' },
                                { value: 'paid', label: 'Paid', description: 'Payment received' },
                                { value: 'overdue', label: 'Overdue', description: 'Past due date' },
                            ].map(option => (
                                <label
                                    key={option.value}
                                    className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                                        formData.status === option.value
                                            ? 'border-[var(--neutral-metric)] bg-[var(--neutral-metric)]/10'
                                            : 'border-[var(--border)] hover:border-gray-500'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={option.value}
                                        checked={formData.status === option.value}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <span className={`text-sm font-medium ${
                                        formData.status === option.value ? 'text-[var(--foreground)]' : 'text-gray-400'
                                    }`}>
                                        {option.label}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-0.5">{option.description}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/app/invoices"
                        className="px-6 py-2.5 text-gray-400 hover:text-[var(--foreground)] font-medium rounded-lg text-sm transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--card)] font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Creating...' : 'Create Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );
}
