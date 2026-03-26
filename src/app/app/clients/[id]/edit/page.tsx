// src/app/app/clients/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Users, Trash2 } from 'lucide-react';
import { dataStore } from '../../../../lib/dataStore';
import { Client } from '../../../../lib/types';

export default function EditClientPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.id as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        agreed_monthly_retainer: '',
        agreed_deliverables: '',
        hour_limit: '',
        custom_hourly_rate: '',
        custom_cost_rate: '',
        custom_margin_threshold: '',
        start_date: '',
        status: 'active' as Client['status'],
    });

    useEffect(() => {
        const foundClient = dataStore.getClientById(clientId);
        if (foundClient) {
            setClient(foundClient);
            setFormData({
                name: foundClient.name,
                agreed_monthly_retainer: foundClient.agreed_monthly_retainer.toString(),
                agreed_deliverables: foundClient.agreed_deliverables,
                hour_limit: foundClient.hour_limit?.toString() || '',
                custom_hourly_rate: foundClient.custom_hourly_rate?.toString() || '',
                custom_cost_rate: foundClient.custom_cost_rate?.toString() || '',
                custom_margin_threshold: foundClient.custom_margin_threshold?.toString() || '',
                start_date: foundClient.start_date,
                status: foundClient.status,
            });
        }
        setIsLoading(false);
    }, [clientId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Validate required fields
            if (!formData.name.trim()) {
                throw new Error('Client name is required');
            }
            if (!formData.agreed_monthly_retainer || parseFloat(formData.agreed_monthly_retainer) <= 0) {
                throw new Error('Monthly retainer must be greater than 0');
            }

            const updates: Partial<Client> = {
                name: formData.name.trim(),
                agreed_monthly_retainer: parseFloat(formData.agreed_monthly_retainer),
                agreed_deliverables: formData.agreed_deliverables.trim(),
                hour_limit: formData.hour_limit ? parseFloat(formData.hour_limit) : null,
                custom_hourly_rate: formData.custom_hourly_rate ? parseFloat(formData.custom_hourly_rate) : null,
                custom_cost_rate: formData.custom_cost_rate ? parseFloat(formData.custom_cost_rate) : null,
                custom_margin_threshold: formData.custom_margin_threshold ? parseFloat(formData.custom_margin_threshold) : null,
                start_date: formData.start_date,
                status: formData.status,
            };

            dataStore.updateClient(clientId, updates);

            // Redirect to client detail
            router.push(`/app/clients/${clientId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update client');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${client?.name}"? This will also delete all associated time entries and invoices. This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);

        try {
            dataStore.deleteClient(clientId);
            router.push('/app/clients');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete client');
            setIsDeleting(false);
        }
    };

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

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
            {/* Back Link */}
            <Link
                href={`/app/clients/${clientId}`}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-[var(--foreground)] transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Client
            </Link>

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--neutral-metric)]/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[var(--neutral-metric)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Edit Client</h1>
                    <p className="text-gray-400">Update {client.name}&apos;s settings and financial configuration.</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-[var(--leak)]/10 border border-[var(--leak)]/20 rounded-lg">
                        <p className="text-sm text-[var(--leak)]">{error}</p>
                    </div>
                )}

                {/* Basic Info */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)]">
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Basic Information</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Client Name <span className="text-[var(--leak)]">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="churned">Churned</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Agreed Deliverables
                            </label>
                            <textarea
                                name="agreed_deliverables"
                                value={formData.agreed_deliverables}
                                onChange={handleChange}
                                placeholder="e.g., 4 Blog Posts, 2 Newsletters per month"
                                rows={3}
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)] resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)]">
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Financial Settings</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Monthly Retainer <span className="text-[var(--leak)]">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        name="agreed_monthly_retainer"
                                        value={formData.agreed_monthly_retainer}
                                        onChange={handleChange}
                                        min="0"
                                        step="100"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Monthly Hour Limit
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="hour_limit"
                                        value={formData.hour_limit}
                                        onChange={handleChange}
                                        placeholder="Unlimited"
                                        min="0"
                                        step="1"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-4 pr-12 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">hrs</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rate Overrides */}
                <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)]">
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">Rate Overrides</h2>
                        <p className="text-sm text-gray-500 mt-1">Optional. Leave empty to use organization defaults.</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Custom Hourly Rate
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        name="custom_hourly_rate"
                                        value={formData.custom_hourly_rate}
                                        onChange={handleChange}
                                        placeholder="Use default"
                                        min="0"
                                        step="1"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Custom Cost Rate
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        name="custom_cost_rate"
                                        value={formData.custom_cost_rate}
                                        onChange={handleChange}
                                        placeholder="Use default"
                                        min="0"
                                        step="1"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Min Margin Threshold
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="custom_margin_threshold"
                                        value={formData.custom_margin_threshold}
                                        onChange={handleChange}
                                        placeholder="Use default"
                                        min="0"
                                        max="100"
                                        step="1"
                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-4 pr-10 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-[var(--leak)]/5 rounded-xl border border-[var(--leak)]/20 overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--leak)]/20">
                        <h2 className="text-lg font-semibold text-[var(--leak)]">Danger Zone</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--foreground)]">Delete this client</p>
                                <p className="text-sm text-gray-400">This will permanently delete the client and all associated data.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-[var(--leak)] text-white font-medium rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isDeleting ? 'Deleting...' : 'Delete Client'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4">
                    <Link
                        href={`/app/clients/${clientId}`}
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
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
