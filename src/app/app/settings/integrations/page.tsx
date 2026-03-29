// src/app/app/settings/integrations/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Check,
    X,
    RefreshCw,
    ExternalLink,
    Eye,
    EyeOff,
    Loader2,
} from 'lucide-react';
import { useData } from '../../../providers/DataProvider';

// Official Brand Logos as SVG components
// Stripe - from stripe.com brand assets
const StripeLogo = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
);

// Toggl Track - official icon from toggl.com/track/media-toolkit
const TogglLogo = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm-.883 4.322h1.766v8.757h-1.766zm-.74 2.053v1.789a4.448 4.448 0 1 0 3.247 0V6.375a6.146 6.146 0 1 1-5.669 10.552 6.145 6.145 0 0 1 2.421-10.552z" />
    </svg>
);

// Clockify - official icon from clockify.me/brand-assets
const ClockifyLogo = () => (
    <svg viewBox="0 0 64 64" className="w-6 h-6">
        <path d="M35.606 54.4c2.964 0 5.8-.6 8.377-1.642l7.183 7.185C46.56 62.522 41.258 64 35.606 64 17.932 64 3.602 49.672 3.602 32S17.932 0 35.606 0A31.85 31.85 0 0 1 51.03 3.964l-7.063 7.065a22.25 22.25 0 0 0-8.359-1.636c-12.378 0-22.412 10.077-22.412 22.5S23.228 54.4 35.606 54.4z" fill="#03A9F4"/>
        <path d="M41.413 21.997L56.12 7.293l4.2 4.206-14.706 14.704zm-5.96 15.026a5.22 5.22 0 0 1-5.21-5.23c0-2.886 2.332-5.23 5.2-5.23s5.2 2.343 5.2 5.23a5.22 5.22 0 0 1-5.21 5.23zM60.398 52.2l-4.2 4.2-14.706-14.704 4.2-4.2z" fill="#222"/>
    </svg>
);

// Shopify - official icon
const ShopifyLogo = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M21.282 10.428l-3.328-8.239A1.785 1.785 0 0016.29 1.07l-4.542 1.554-4.558-1.554a1.769 1.769 0 00-1.666 1.119L2.196 10.428a1.69 1.69 0 00.322 1.848l7.522 8.35c.91.996 2.457.996 3.367 0l7.553-8.35a1.69 1.69 0 00.322-1.848zm-8.814-6.307l3.65 6.13H8.818l3.65-6.13zm-5.071 6.13L4.542 4.965a.286.286 0 01.272-.18l2.583.88v4.586H7.397zm10.141 0h-2.584V5.666l2.584-.881a.28.28 0 01.27.182L17.538 10.25zM11.734 19.38L5.613 11.838h12.24L11.734 19.38z" />
    </svg>
);

interface Integration {
    id: string;
    provider: 'stripe' | 'toggl' | 'clockify' | 'shopify';
    enabled: boolean;
    api_key?: string;
    workspace_id?: string;
    last_sync_at?: string;
    config?: Record<string, unknown>;
}

interface SyncStatus {
    loading: boolean;
    error?: string;
    success?: string;
}

const INTEGRATION_CONFIG = {
    stripe: {
        name: 'Stripe',
        description: 'Sync invoices and payments',
        logo: StripeLogo,
        color: '#635BFF',
        useOAuth: true,
        docsUrl: 'https://stripe.com/docs/connect',
    },
    toggl: {
        name: 'Toggl Track',
        description: 'Import time entries',
        logo: TogglLogo,
        color: '#E57CD8',
        useOAuth: true,
        fields: [
            { key: 'api_key', label: 'API Token', placeholder: 'Your Toggl API token', secret: true },
            { key: 'workspace_id', label: 'Workspace ID', placeholder: '1234567', secret: false },
        ],
        docsUrl: 'https://track.toggl.com/profile',
    },
    clockify: {
        name: 'Clockify',
        description: 'Import time entries',
        logo: ClockifyLogo,
        color: '#03A9F4',
        useOAuth: false,
        fields: [
            { key: 'api_key', label: 'API Key', placeholder: 'Your Clockify API key', secret: true },
            { key: 'workspace_id', label: 'Workspace ID', placeholder: 'abc123def456', secret: false },
        ],
        docsUrl: 'https://clockify.me/user/settings',
    },
    shopify: {
        name: 'Shopify',
        description: 'Sync store orders and revenue',
        logo: ShopifyLogo,
        color: '#95BF47',
        useOAuth: false,
        fields: [
            { key: 'shop_url', label: 'Shop URL', placeholder: 'your-store.myshopify.com', secret: false },
            { key: 'api_key', label: 'Admin Access Token', placeholder: 'shpat_...', secret: true },
        ],
        docsUrl: 'https://help.shopify.com',
    },
};

function IntegrationsContent() {
    const searchParams = useSearchParams();
    const { organizationId, clients, mode } = useData();

    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [syncStatus, setSyncStatus] = useState<Record<string, SyncStatus>>({});
    const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
    const [clientMapping, setClientMapping] = useState<Record<string, string>>({});
    const [showMapping, setShowMapping] = useState<string | null>(null);
    const [externalProjects, setExternalProjects] = useState<Array<{ id: string | number; name: string }>>([]);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (success) {
            const messages: Record<string, string> = {
                stripe_connected: 'Stripe connected successfully!',
                toggl_connected: 'Toggl connected! Map your projects to clients.',
                clockify_connected: 'Clockify connected! Map your projects to clients.',
                shopify_connected: 'Shopify connected!',
            };
            setNotification({
                type: 'success',
                message: messages[success] || 'Integration connected!',
            });

            if (success === 'toggl_connected') {
                setTimeout(() => handleFetchProjects('toggl'), 1000);
            } else if (success === 'clockify_connected') {
                setTimeout(() => handleFetchProjects('clockify'), 1000);
            }

            window.history.replaceState({}, '', '/app/settings/integrations');
        }

        if (error) {
            setNotification({
                type: 'error',
                message: decodeURIComponent(error),
            });
            window.history.replaceState({}, '', '/app/settings/integrations');
        }

        const timer = setTimeout(() => setNotification(null), 5000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    useEffect(() => {
        loadIntegrations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizationId, mode]);

    const loadIntegrations = useCallback(async () => {
        setIsLoading(true);

        if (mode === 'local') {
            const stored = localStorage.getItem('revenueLeak_integrations');
            if (stored) {
                setIntegrations(JSON.parse(stored));
            } else {
                const initial: Integration[] = [
                    { id: 'stripe', provider: 'stripe', enabled: false },
                    { id: 'toggl', provider: 'toggl', enabled: false },
                    { id: 'clockify', provider: 'clockify', enabled: false },
                    { id: 'shopify', provider: 'shopify', enabled: false },
                ];
                setIntegrations(initial);
            }
        } else if (organizationId) {
            try {
                const response = await fetch(`/api/integrations?organization_id=${organizationId}`);
                if (response.ok) {
                    const data = await response.json();
                    const providers = ['stripe', 'toggl', 'clockify', 'shopify'] as const;
                    const integrationsMap = new Map(data.integrations?.map((i: Integration) => [i.provider, i]));

                    const allIntegrations: Integration[] = providers.map(provider => {
                        const existing = integrationsMap.get(provider) as Integration | undefined;
                        return existing || { id: provider, provider, enabled: false };
                    });

                    setIntegrations(allIntegrations);
                }
            } catch (err) {
                console.error('Failed to fetch integrations:', err);
            }
        }

        setIsLoading(false);
    }, [organizationId, mode]);

    const saveIntegration = async (integration: Integration) => {
        if (mode === 'local') {
            const updated = integrations.map(i =>
                i.provider === integration.provider ? integration : i
            );
            setIntegrations(updated);
            localStorage.setItem('revenueLeak_integrations', JSON.stringify(updated));
        }
    };

    const handleStripeConnect = () => {
        if (!organizationId) {
            setNotification({ type: 'error', message: 'Organization not found' });
            return;
        }
        setConnectingProvider('stripe');
        window.location.href = `/api/auth/stripe/connect?organization_id=${organizationId}`;
    };

    const handleTogglConnect = () => {
        if (!organizationId) {
            setNotification({ type: 'error', message: 'Organization not found' });
            return;
        }
        setConnectingProvider('toggl');
        window.location.href = `/api/auth/toggl/connect?organization_id=${organizationId}`;
    };

    const handleClockifyConnect = async () => {
        if (!formData.api_key) {
            setNotification({ type: 'error', message: 'API key is required' });
            return;
        }

        setConnectingProvider('clockify');

        try {
            const response = await fetch('/api/auth/clockify/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organization_id: organizationId,
                    api_key: formData.api_key,
                    workspace_id: formData.workspace_id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Connection failed');
            }

            const updated: Integration = {
                id: 'clockify',
                provider: 'clockify',
                enabled: true,
                api_key: formData.api_key,
                workspace_id: data.workspace?.id,
                config: {
                    user_email: data.user?.email,
                    workspace_name: data.workspace?.name,
                },
            };

            await saveIntegration(updated);
            setEditingId(null);
            setFormData({});
            setNotification({ type: 'success', message: 'Clockify connected!' });
            loadIntegrations();
            setTimeout(() => handleFetchProjects('clockify'), 500);
        } catch (err) {
            setNotification({
                type: 'error',
                message: err instanceof Error ? err.message : 'Connection failed',
            });
        } finally {
            setConnectingProvider(null);
        }
    };

    const handleTogglApiConnect = async () => {
        if (!formData.api_key) {
            setNotification({ type: 'error', message: 'API token is required' });
            return;
        }

        setConnectingProvider('toggl');

        try {
            const auth = btoa(`${formData.api_key}:api_token`);
            const response = await fetch('https://api.track.toggl.com/api/v9/me', {
                headers: { 'Authorization': `Basic ${auth}` },
            });

            if (!response.ok) {
                throw new Error('Invalid API token');
            }

            const userData = await response.json();

            const updated: Integration = {
                id: 'toggl',
                provider: 'toggl',
                enabled: true,
                api_key: formData.api_key,
                workspace_id: formData.workspace_id || String(userData.default_workspace_id),
                config: {
                    user_email: userData.email,
                    user_id: userData.id,
                },
            };

            await saveIntegration(updated);
            setEditingId(null);
            setFormData({});
            setNotification({ type: 'success', message: 'Toggl connected!' });
            loadIntegrations();
            setTimeout(() => handleFetchProjects('toggl'), 500);
        } catch (err) {
            setNotification({
                type: 'error',
                message: err instanceof Error ? err.message : 'Connection failed',
            });
        } finally {
            setConnectingProvider(null);
        }
    };

    const handleShopifyConnect = async () => {
        if (!formData.api_key || !formData.shop_url) {
            setNotification({ type: 'error', message: 'Shop URL and Access Token are required' });
            return;
        }

        setConnectingProvider('shopify');

        try {
            const response = await fetch('/api/auth/shopify/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organization_id: organizationId,
                    api_key: formData.api_key,
                    shop_url: formData.shop_url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Connection failed');
            }

            const updated: Integration = {
                id: 'shopify',
                provider: 'shopify',
                enabled: true,
                api_key: formData.api_key,
                config: {
                    shop_url: data.shop.domain,
                    shop_name: data.shop.name,
                },
            };

            await saveIntegration(updated);
            setEditingId(null);
            setFormData({});
            setNotification({ type: 'success', message: 'Shopify connected!' });
            loadIntegrations();
        } catch (err) {
            setNotification({
                type: 'error',
                message: err instanceof Error ? err.message : 'Connection failed',
            });
        } finally {
            setConnectingProvider(null);
        }
    };

    const handleSync = async (provider: 'toggl' | 'clockify') => {
        const integration = integrations.find(i => i.provider === provider);
        if (!integration?.enabled) return;

        setSyncStatus(prev => ({ ...prev, [provider]: { loading: true } }));

        try {
            const mapping = localStorage.getItem(`revenueLeak_mapping_${provider}`);
            const clientMappingData = mapping ? JSON.parse(mapping) : {};

            const response = await fetch(`/api/integrations/${provider}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    organization_id: organizationId,
                    client_mapping: clientMappingData,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Sync failed');
            }

            setSyncStatus(prev => ({
                ...prev,
                [provider]: {
                    loading: false,
                    success: `Synced ${data.imported} entries`,
                },
            }));

            const updated: Integration = {
                ...integration,
                last_sync_at: new Date().toISOString(),
            };
            await saveIntegration(updated);

            setTimeout(() => {
                setSyncStatus(prev => ({ ...prev, [provider]: { loading: false } }));
            }, 5000);
        } catch (err) {
            setSyncStatus(prev => ({
                ...prev,
                [provider]: {
                    loading: false,
                    error: err instanceof Error ? err.message : 'Sync failed',
                },
            }));
        }
    };

    const handleFetchProjects = async (provider: 'toggl' | 'clockify') => {
        const integration = integrations.find(i => i.provider === provider);
        if (!integration?.enabled) return;

        setShowMapping(provider);
        setExternalProjects([]);

        try {
            const response = await fetch(
                `/api/integrations/${provider}?organization_id=${organizationId}`
            );

            if (!response.ok) throw new Error('Failed to fetch projects');

            const data = await response.json();
            setExternalProjects(data.projects || []);

            const mapping = localStorage.getItem(`revenueLeak_mapping_${provider}`);
            if (mapping) {
                setClientMapping(JSON.parse(mapping));
            }
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            setNotification({
                type: 'error',
                message: 'Failed to fetch projects',
            });
        }
    };

    const handleDisconnect = async (provider: string) => {
        const updated: Integration = {
            id: provider,
            provider: provider as 'stripe' | 'toggl' | 'clockify' | 'shopify',
            enabled: false,
        };
        await saveIntegration(updated);
        loadIntegrations();
        setNotification({ type: 'success', message: `${INTEGRATION_CONFIG[provider as keyof typeof INTEGRATION_CONFIG].name} disconnected` });
    };

    const toggleSecret = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const formatLastSync = (dateStr?: string) => {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/app/settings"
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-medium text-white">Integrations</h1>
                    <p className="text-sm text-gray-500">Connect services to sync data automatically.</p>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div
                    className={`px-4 py-3 rounded-lg flex items-center gap-3 text-sm ${
                        notification.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}
                >
                    {notification.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {notification.message}
                </div>
            )}

            {/* Integration Cards */}
            <div className="space-y-3" data-tutorial="integrations-list">
                {integrations.map(integration => {
                    const config = INTEGRATION_CONFIG[integration.provider];
                    const Logo = config.logo;
                    const isEditing = editingId === integration.id;
                    const status = syncStatus[integration.provider];
                    const isConnecting = connectingProvider === integration.provider;

                    return (
                        <div
                            key={integration.id}
                            className="bg-[#111113] rounded-lg border border-[#1c1c1f] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-md flex items-center justify-center"
                                        style={{ backgroundColor: `${config.color}15`, color: config.color }}
                                    >
                                        <Logo />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-white">{config.name}</h3>
                                            {integration.enabled ? (
                                                <span className="text-xs text-emerald-400">Connected</span>
                                            ) : (
                                                <span className="text-xs text-gray-500">Not connected</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{config.description}</p>
                                    </div>
                                </div>
                                <a
                                    href={config.docsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>

                            {/* Content */}
                            <div className="px-5 pb-5">
                                {/* Stripe */}
                                {integration.provider === 'stripe' && !integration.enabled && (
                                    <button
                                        onClick={handleStripeConnect}
                                        disabled={isConnecting}
                                        className="px-4 py-2 bg-white text-black font-medium rounded-md text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                    >
                                        {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Connect Stripe
                                    </button>
                                )}

                                {/* Toggl */}
                                {integration.provider === 'toggl' && !integration.enabled && !isEditing && (
                                    <button
                                        onClick={handleTogglConnect}
                                        disabled={isConnecting}
                                        className="px-4 py-2 bg-white text-black font-medium rounded-md text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                    >
                                        {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Connect Toggl
                                    </button>
                                )}

                                {/* Clockify */}
                                {integration.provider === 'clockify' && !integration.enabled && !isEditing && (
                                    <button
                                        onClick={() => setEditingId('clockify')}
                                        className="px-4 py-2 bg-white text-black font-medium rounded-md text-sm hover:bg-gray-100 transition-colors"
                                    >
                                        Connect Clockify
                                    </button>
                                )}

                                {/* Shopify */}
                                {integration.provider === 'shopify' && !integration.enabled && !isEditing && (
                                    <button
                                        onClick={() => setEditingId('shopify')}
                                        className="px-4 py-2 bg-white text-black font-medium rounded-md text-sm hover:bg-gray-100 transition-colors"
                                    >
                                        Connect Shopify
                                    </button>
                                )}

                                {/* API Key Form */}
                                {isEditing && 'fields' in config && (
                                    <div className="space-y-4">
                                        {config.fields?.map(field => (
                                            <div key={field.key}>
                                                <label className="block text-sm text-gray-400 mb-1.5">
                                                    {field.label}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                                                        value={formData[field.key] || ''}
                                                        onChange={(e) =>
                                                            setFormData(prev => ({ ...prev, [field.key]: e.target.value }))
                                                        }
                                                        placeholder={field.placeholder}
                                                        className="w-full bg-[#0a0a0b] border border-[#1c1c1f] rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-[#333] pr-10"
                                                    />
                                                    {field.secret && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSecret(field.key)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                                        >
                                                            {showSecrets[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={
                                                    integration.provider === 'shopify' ? handleShopifyConnect :
                                                    integration.provider === 'clockify' ? handleClockifyConnect :
                                                    handleTogglApiConnect
                                                }
                                                disabled={isConnecting}
                                                className="px-4 py-2 bg-white text-black font-medium rounded-md text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                            >
                                                {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                                                Connect
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setFormData({});
                                                }}
                                                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Connected State */}
                                {integration.enabled && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-6 text-sm">
                                            {integration.api_key && (
                                                <div>
                                                    <span className="text-gray-500">API Key</span>
                                                    <span className="ml-2 text-gray-300 font-mono">••••{integration.api_key.slice(-4)}</span>
                                                </div>
                                            )}
                                            {integration.workspace_id && (
                                                <div>
                                                    <span className="text-gray-500">Workspace</span>
                                                    <span className="ml-2 text-gray-300">
                                                        {(integration.config?.workspace_name as string) || integration.workspace_id}
                                                    </span>
                                                </div>
                                            )}
                                            {!!integration.config?.shop_url && (
                                                <div>
                                                    <span className="text-gray-500">Shop URL</span>
                                                    <span className="ml-2 text-gray-300">
                                                        {integration.config.shop_url as string}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-gray-500">Last sync</span>
                                                <span className="ml-2 text-gray-300">{formatLastSync(integration.last_sync_at)}</span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        {status?.error && (
                                            <p className="text-sm text-red-400">{status.error}</p>
                                        )}
                                        {status?.success && (
                                            <p className="text-sm text-emerald-400">{status.success}</p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            {(integration.provider === 'toggl' || integration.provider === 'clockify') && (
                                                <>
                                                    <button
                                                        onClick={() => handleSync(integration.provider as any)}
                                                        disabled={status?.loading}
                                                        className="px-4 py-2 bg-white text-black font-medium rounded-md text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                                    >
                                                        <RefreshCw className={`w-4 h-4 ${status?.loading ? 'animate-spin' : ''}`} />
                                                        {status?.loading ? 'Syncing...' : 'Sync'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleFetchProjects(integration.provider as any)}
                                                        className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                                                    >
                                                        Configure Mapping
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDisconnect(integration.provider)}
                                                className="px-4 py-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                                            >
                                                Disconnect
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Client Mapping Modal */}
            {showMapping && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111113] rounded-lg border border-[#1c1c1f] w-full max-w-xl max-h-[80vh] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#1c1c1f] flex items-center justify-between">
                            <h3 className="font-medium text-white">
                                Map {INTEGRATION_CONFIG[showMapping as keyof typeof INTEGRATION_CONFIG].name} Projects
                            </h3>
                            <button
                                onClick={() => {
                                    setShowMapping(null);
                                    setExternalProjects([]);
                                }}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
                            {externalProjects.length > 0 ? (
                                externalProjects.map(project => (
                                    <div key={project.id} className="flex items-center gap-4">
                                        <span className="flex-1 text-sm text-white truncate">{project.name}</span>
                                        <select
                                            value={clientMapping[String(project.id)] || ''}
                                            onChange={(e) =>
                                                setClientMapping(prev => ({
                                                    ...prev,
                                                    [String(project.id)]: e.target.value,
                                                }))
                                            }
                                            className="w-40 bg-[#0a0a0b] border border-[#1c1c1f] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#333]"
                                        >
                                            <option value="">Skip</option>
                                            {clients.map((client: any) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                                    <p className="text-sm">Loading projects...</p>
                                </div>
                            )}
                        </div>
                        <div className="px-5 py-4 border-t border-[#1c1c1f] flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowMapping(null);
                                    setExternalProjects([]);
                                }}
                                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem(
                                        `revenueLeak_mapping_${showMapping}`,
                                        JSON.stringify(clientMapping)
                                    );
                                    setShowMapping(null);
                                    setExternalProjects([]);
                                    setNotification({ type: 'success', message: 'Mapping saved!' });
                                }}
                                className="px-4 py-2 bg-white text-black font-medium rounded-md text-sm hover:bg-gray-100 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function IntegrationsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>}>
            <IntegrationsContent />
        </Suspense>
    );
}
