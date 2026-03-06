// src/app/app/clients/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { dataStore } from '../../../lib/dataStore';
import { Client } from '../../../lib/types';

export default function NewClientPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        agreed_monthly_retainer: '',
        agreed_deliverables: '',
        hour_limit: '',
        custom_hourly_rate: '',
        custom_cost_rate: '',
        custom_margin_threshold: '',
        start_date: new Date().toISOString().split('T')[0],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

            const org = dataStore.getOrganization();
            const organizationId = org?.id || 'default-org';

            const newClient: Client = {
                id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                organization_id: organizationId,
                name: formData.name.trim(),
                agreed_monthly_retainer: parseFloat(formData.agreed_monthly_retainer),
                agreed_deliverables: formData.agreed_deliverables.trim(),
                hour_limit: formData.hour_limit ? parseFloat(formData.hour_limit) : null,
                custom_hourly_rate: formData.custom_hourly_rate ? parseFloat(formData.custom_hourly_rate) : null,
                custom_cost_rate: formData.custom_cost_rate ? parseFloat(formData.custom_cost_rate) : null,
                custom_margin_threshold: formData.custom_margin_threshold ? parseFloat(formData.custom_margin_threshold) : null,
                start_date: formData.start_date,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            dataStore.addClient(newClient);

            // Redirect to clients list
            router.push('/app/clients');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add client');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
            {/* Back Link */}
            <Link
                href="/app/clients"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-[var(--foreground)] transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Clients
            </Link>

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--neutral-metric)]/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[var(--neutral-metric)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Add New Client</h1>
                    <p className="text-gray-400">Create a new client to track revenue and detect leaks.</p>
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
                                placeholder="e.g., Acme Corp"
                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                required
                            />
                        </div>

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
                                        placeholder="5000"
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
                                        placeholder="40"
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

                {/* Rate Overrides (Optional) */}
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

                {/* Submit */}
                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/app/clients"
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
                        {isSubmitting ? 'Adding...' : 'Add Client'}
                    </button>
                </div>
            </form>
        </div>
    );
}
