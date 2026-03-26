// src/app/app/clients/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { dataStore } from '../../../lib/dataStore';
import { Client } from '../../../lib/types';
import { useData } from '../../../providers/DataProvider';
import { createBrowserClient } from '@supabase/ssr';

export default function NewClientPage() {
    const router = useRouter();
    const { mode, organizationId, refreshClients } = useData();
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
            if (!formData.name.trim()) {
                throw new Error('Client name is required');
            }
            if (!formData.agreed_monthly_retainer || parseFloat(formData.agreed_monthly_retainer) <= 0) {
                throw new Error('Monthly retainer must be greater than 0');
            }

            if (mode === 'supabase') {
                if (!organizationId) throw new Error('Organization not found');

                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { error: insertError } = await supabase.from('clients').insert({
                    organization_id: organizationId,
                    name: formData.name.trim(),
                    agreed_monthly_retainer: parseFloat(formData.agreed_monthly_retainer),
                    agreed_deliverables: formData.agreed_deliverables.trim(),
                    hour_limit: formData.hour_limit ? parseFloat(formData.hour_limit) : null,
                    custom_hourly_rate: formData.custom_hourly_rate ? parseFloat(formData.custom_hourly_rate) : null,
                    custom_cost_rate: formData.custom_cost_rate ? parseFloat(formData.custom_cost_rate) : null,
                    custom_margin_threshold: formData.custom_margin_threshold ? parseFloat(formData.custom_margin_threshold) : null,
                    start_date: formData.start_date,
                    status: 'active'
                });

                if (insertError) throw insertError;
                
                await refreshClients();
            } else {
                const org = dataStore.getOrganization();
                const orgId = org?.id || 'default-org';

                const newClient: Client = {
                    id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    organization_id: orgId,
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
            }
            
            router.push('/app/clients');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add client');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            {/* Back Link */}
            <Link
                href="/app/clients"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Clients
            </Link>

            {/* Header */}
            <div>
                <h1 className="text-xl font-medium text-white">Add Client</h1>
                <p className="text-sm text-gray-500 mt-1">Create a new client to track revenue.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Basic Info */}
                <div className="bg-[#111113] rounded-lg border border-[#1c1c1f]">
                    <div className="px-4 py-3 border-b border-[#1c1c1f]">
                        <h2 className="text-sm font-medium text-white">Basic Information</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">
                                Client Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Acme Corp"
                                className="w-full bg-[#0a0a0b] border border-[#1c1c1f] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#333]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className="w-full bg-[#0a0a0b] border border-[#1c1c1f] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#333]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">
                                Agreed Deliverables
                            </label>
                            <textarea
                                name="agreed_deliverables"
                                value={formData.agreed_deliverables}
                                onChange={handleChange}
                                placeholder="e.g., 4 Blog Posts, 2 Newsletters per month"
                                rows={2}
                                className="w-full bg-[#0a0a0b] border border-[#1c1c1f] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#333] resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="bg-[#111113] rounded-lg border border-[#1c1c1f]">
                    <div className="px-4 py-3 border-b border-[#1c1c1f]">
                        <h2 className="text-sm font-medium text-white">Financials</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    Monthly Retainer <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        name="agreed_monthly_retainer"
                                        value={formData.agreed_monthly_retainer}
                                        onChange={handleChange}
                                        placeholder="5000"
                                        min="0"
                                        step="100"
                                        className="w-full bg-[#0a0a0b] border border-[#1c1c1f] rounded-md pl-7 pr-3 py-2 text-white text-sm focus:outline-none focus:border-[#333]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    Hour Limit
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
                                        className="w-full bg-[#0a0a0b] border border-[#1c1c1f] rounded-md pl-3 pr-10 py-2 text-white text-sm focus:outline-none focus:border-[#333]"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">hrs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rate Overrides (Optional) */}
                <div className="bg-[#111113] rounded-lg border border-[#1c1c1f]">
                    <div className="px-4 py-3 border-b border-[#1c1c1f]">
                        <h2 className="text-sm font-medium text-white">Rate Overrides</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Optional. Leave empty for defaults.</p>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">
                                    Hourly Rate
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        name="custom_hourly_rate"
                                        value={formData.custom_hourly_rate}
                                        onChange={handleChange}
                                        placeholder="—"
                                        min="0"
                                        step="1"
                                        className="w-full bg-[#0a0a0b] border border-[#1c1c1f] rounded-md pl-7 pr-3 py-2 text-white text-sm focus:outline-none focus:border-[#333]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">
                                    Cost Rate
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                    <input
                                        type="number"
                                        name="custom_cost_rate"
                                        value={formData.custom_cost_rate}
                                        onChange={handleChange}
                                        placeholder="—"
                                        min="0"
                                        step="1"
                                        className="w-full bg-[#0a0a0b] border border-[#1c1c1f] rounded-md pl-7 pr-3 py-2 text-white text-sm focus:outline-none focus:border-[#333]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">
                                    Min Margin
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="custom_margin_threshold"
                                        value={formData.custom_margin_threshold}
                                        onChange={handleChange}
                                        placeholder="—"
                                        min="0"
                                        max="100"
                                        step="1"
                                        className="w-full bg-[#0a0a0b] border border-[#1c1c1f] rounded-md pl-3 pr-8 py-2 text-white text-sm focus:outline-none focus:border-[#333]"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/app/clients"
                        className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-white text-black font-medium rounded-md text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Client'}
                    </button>
                </div>
            </form>
        </div>
    );
}
