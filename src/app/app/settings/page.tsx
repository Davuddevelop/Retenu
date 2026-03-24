// src/app/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Save, DollarSign, AlertTriangle, Plug, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { FinancialSettings, EMPTY_FINANCIAL_SETTINGS } from '../../lib/types';
import { dataStore } from '../../lib/dataStore';

type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
    { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<Omit<FinancialSettings, 'id' | 'organization_id' | 'updated_at'>>(EMPTY_FINANCIAL_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    useEffect(() => {
        // Load current settings
        const currentSettings = dataStore.getSettings();
        if (currentSettings) {
            setSettings({
                default_internal_hourly_rate: currentSettings.default_internal_hourly_rate,
                default_internal_cost_rate: currentSettings.default_internal_cost_rate,
                currency: currentSettings.currency,
                margin_warning_threshold_percent: currentSettings.margin_warning_threshold_percent,
                scope_creep_threshold_percent: currentSettings.scope_creep_threshold_percent,
                underbilling_threshold_percent: currentSettings.underbilling_threshold_percent,
                late_payment_days_threshold: currentSettings.late_payment_days_threshold,
            });
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            const fullSettings: FinancialSettings = {
                id: dataStore.getSettings()?.id || `settings-${Date.now()}`,
                organization_id: dataStore.getOrganization()?.id || '',
                ...settings,
                updated_at: new Date().toISOString(),
            };

            dataStore.setSettings(fullSettings);
            setSaveMessage('Settings saved successfully!');

            setTimeout(() => setSaveMessage(null), 3000);
        } catch {
            setSaveMessage('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReplayTutorial = () => {
        localStorage.removeItem('hasSeenTutorial');
        window.location.href = '/app';
    };

    const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const currencySymbol = CURRENCIES.find(c => c.value === settings.currency)?.symbol || '$';

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
                <p className="text-gray-400 mt-1">Configure your financial assumptions and alert thresholds.</p>
            </div>

            {/* Rate Settings */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden" data-tutorial="settings-form">
                <div className="px-6 py-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--neutral-metric)]/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[var(--neutral-metric)]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">Rate Settings</h2>
                            <p className="text-sm text-gray-500">Default billing and cost rates for your organization</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    {/* Currency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                        <select
                            value={settings.currency}
                            onChange={(e) => updateSetting('currency', e.target.value as Currency)}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                        >
                            {CURRENCIES.map(currency => (
                                <option key={currency.value} value={currency.value}>
                                    {currency.symbol} - {currency.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Hourly Rate */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Default Hourly Billing Rate
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={settings.default_internal_hourly_rate}
                                    onChange={(e) => updateSetting('default_internal_hourly_rate', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">What you charge clients per hour</p>
                        </div>

                        {/* Cost Rate */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Default Internal Cost Rate
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={settings.default_internal_cost_rate}
                                    onChange={(e) => updateSetting('default_internal_cost_rate', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Your internal cost per hour (labor + overhead)</p>
                        </div>
                    </div>

                    {/* Calculated Margin Preview */}
                    <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                        <p className="text-sm text-gray-400">
                            Default Gross Margin:{' '}
                            <span className="font-semibold text-[var(--profit)]">
                                {settings.default_internal_hourly_rate > 0
                                    ? (((settings.default_internal_hourly_rate - settings.default_internal_cost_rate) / settings.default_internal_hourly_rate) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Alert Thresholds */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--leak)]/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-[var(--leak)]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">Alert Thresholds</h2>
                            <p className="text-sm text-gray-500">Define when to trigger revenue leak alerts</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Margin Threshold */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Minimum Margin Warning
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={settings.margin_warning_threshold_percent}
                                    onChange={(e) => updateSetting('margin_warning_threshold_percent', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-4 pr-10 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Alert when client margin falls below this</p>
                        </div>

                        {/* Scope Creep Threshold */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Scope Creep Tolerance
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={settings.scope_creep_threshold_percent}
                                    onChange={(e) => updateSetting('scope_creep_threshold_percent', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-4 pr-10 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Alert when hours exceed limit by this %</p>
                        </div>

                        {/* Underbilling Threshold */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Underbilling Tolerance
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={settings.underbilling_threshold_percent}
                                    onChange={(e) => updateSetting('underbilling_threshold_percent', parseFloat(e.target.value) || 0)}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-4 pr-10 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Alert when underbilled by more than this %</p>
                        </div>

                        {/* Late Payment Days */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Late Payment Grace Period
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={settings.late_payment_days_threshold}
                                    onChange={(e) => updateSetting('late_payment_days_threshold', parseInt(e.target.value) || 0)}
                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-4 pr-14 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">days</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Alert after invoice is overdue by this many days</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrations Link */}
            <Link
                href="/app/settings/integrations"
                className="block bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden hover:border-[var(--neutral-metric)]/50 transition-colors group"
            >
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Plug className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">Integrations</h2>
                            <p className="text-sm text-gray-500">Connect Stripe, Toggl, Clockify, and more</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[var(--foreground)] transition-colors" />
                </div>
            </Link>

            {/* Tutorial */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--neutral-metric)]/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-[var(--neutral-metric)]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--foreground)]">Tutorial</h2>
                            <p className="text-sm text-gray-500">Learn how to use RevenueLeak</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-400 mb-4">
                        Take a guided tour of the dashboard and learn how to detect revenue leaks,
                        manage clients, and set up alerts.
                    </p>
                    <button
                        onClick={handleReplayTutorial}
                        className="px-4 py-2 bg-gradient-to-r from-[var(--neutral-metric)] to-blue-400 text-white font-medium rounded-lg text-sm hover:opacity-90 transition-opacity"
                    >
                        Replay Tutorial
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between">
                {saveMessage && (
                    <p className={`text-sm ${saveMessage.includes('success') ? 'text-[var(--profit)]' : 'text-[var(--leak)]'}`}>
                        {saveMessage}
                    </p>
                )}
                <div className="flex-1" />
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[var(--foreground)] text-[var(--card)] font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
}
