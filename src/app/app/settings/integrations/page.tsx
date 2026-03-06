// src/app/app/settings/integrations/page.tsx
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Plug,
    CheckCircle,
    XCircle,
    RefreshCw,
    ExternalLink,
    Eye,
    EyeOff,
    Clock,
    CreditCard,
    Timer,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { useData } from '../../../providers/DataProvider';

interface Integration {
    id: string;
    provider: 'stripe' | 'toggl' | 'clockify';
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
        description: 'Sync invoices and payments via Stripe Connect',
        icon: CreditCard,
        color: 'purple',
        useOAuth: true, // Uses Stripe Connect OAuth
        docsUrl: 'https://stripe.com/docs/connect',
    },
    toggl: {
        name: 'Toggl Track',
        description: 'Import time entries from Toggl',
        icon: Timer,
        color: 'pink',
        useOAuth: true, // Uses OAuth 2.0
        fields: [
            { key: 'api_key', label: 'API Token', placeholder: 'Your Toggl API token', secret: true },
            { key: 'workspace_id', label: 'Workspace ID', placeholder: '1234567', secret: false },
        ],
        docsUrl: 'https://track.toggl.com/profile',
    },
    clockify: {
        name: 'Clockify',
        description: 'Import time entries from Clockify',
        icon: Clock,
        color: 'blue',
        useOAuth: false, // Uses API key
        fields: [
            { key: 'api_key', label: 'API Key', placeholder: 'Your Clockify API key', secret: true },
            { key: 'workspace_id', label: 'Workspace ID', placeholder: 'abc123def456', secret: false },
        ],
        docsUrl: 'https://clockify.me/user/settings',
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

    // Handle OAuth callback messages from URL
    useEffect(() => {
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (success) {
            const messages: Record<string, string> = {
                stripe_connected: 'Stripe account connected successfully!',
                toggl_connected: 'Toggl account connected successfully!',
            };
            setNotification({
                type: 'success',
                message: messages[success] || 'Integration connected successfully!',
            });
            // Clean URL
            window.history.replaceState({}, '', '/app/settings/integrations');
        }

        if (error) {
            setNotification({
                type: 'error',
                message: decodeURIComponent(error),
            });
            window.history.replaceState({}, '', '/app/settings/integrations');
        }

        // Auto-dismiss notification
        const timer = setTimeout(() => setNotification(null), 5000);
        return () => clearTimeout(timer);
    }, [searchParams]);

    // Load integrations
    useEffect(() => {
        loadIntegrations();
    }, [organizationId, mode]);

    const loadIntegrations = useCallback(async () => {
        setIsLoading(true);

        if (mode === 'local') {
            // Load from localStorage
            const stored = localStorage.getItem('revenueLeak_integrations');
            if (stored) {
                setIntegrations(JSON.parse(stored));
            } else {
                const initial: Integration[] = [
                    { id: 'stripe', provider: 'stripe', enabled: false },
                    { id: 'toggl', provider: 'toggl', enabled: false },
                    { id: 'clockify', provider: 'clockify', enabled: false },
                ];
                setIntegrations(initial);
            }
        } else if (organizationId) {
            // Fetch from Supabase via API
            try {
                const response = await fetch(`/api/integrations?organization_id=${organizationId}`);
                if (response.ok) {
                    const data = await response.json();
                    // Ensure all providers are represented
                    const providers = ['stripe', 'toggl', 'clockify'] as const;
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
        // In Supabase mode, the API handles saving
    };

    // ============================================
    // OAUTH CONNECTION HANDLERS
    // ============================================

    const handleStripeConnect = () => {
        if (!organizationId) {
            setNotification({ type: 'error', message: 'Organization not found' });
            return;
        }
        setConnectingProvider('stripe');
        // Redirect to Stripe Connect OAuth
        window.location.href = `/api/auth/stripe/connect?organization_id=${organizationId}`;
    };

    const handleTogglConnect = () => {
        if (!organizationId) {
            setNotification({ type: 'error', message: 'Organization not found' });
            return;
        }

        // Check if OAuth is configured
        if (process.env.NEXT_PUBLIC_TOGGL_OAUTH_ENABLED === 'true') {
            setConnectingProvider('toggl');
            window.location.href = `/api/auth/toggl/connect?organization_id=${organizationId}`;
        } else {
            // Fall back to API key entry
            setEditingId('toggl');
        }
    };

    // ============================================
    // API KEY CONNECTION HANDLERS
    // ============================================

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

            // Update local state
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
            setNotification({ type: 'success', message: 'Clockify connected successfully!' });
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

    const handleTogglApiConnect = async () => {
        if (!formData.api_key) {
            setNotification({ type: 'error', message: 'API token is required' });
            return;
        }

        setConnectingProvider('toggl');

        try {
            // Validate the API key by fetching user info
            const auth = btoa(`${formData.api_key}:api_token`);
            const response = await fetch('https://api.track.toggl.com/api/v9/me', {
                headers: { 'Authorization': `Basic ${auth}` },
            });

            if (!response.ok) {
                throw new Error('Invalid API token');
            }

            const userData = await response.json();

            // Save to local state (or Supabase in production)
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
            setNotification({ type: 'success', message: 'Toggl connected successfully!' });
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

    // ============================================
    // SYNC HANDLERS
    // ============================================

    const handleSync = async (provider: 'toggl' | 'clockify') => {
        const integration = integrations.find(i => i.provider === provider);
        if (!integration?.enabled) return;

        setSyncStatus(prev => ({ ...prev, [provider]: { loading: true } }));

        try {
            // Get client mapping
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
                    success: `Synced ${data.imported} entries (${data.skipped} skipped, ${data.unmapped} unmapped)`,
                },
            }));

            // Update last sync time
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

            // Load existing mapping
            const mapping = localStorage.getItem(`revenueLeak_mapping_${provider}`);
            if (mapping) {
                setClientMapping(JSON.parse(mapping));
            }
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            setNotification({
                type: 'error',
                message: 'Failed to fetch projects from ' + INTEGRATION_CONFIG[provider].name,
            });
        }
    };

    const handleDisconnect = async (provider: string) => {
        const updated: Integration = {
            id: provider,
            provider: provider as 'stripe' | 'toggl' | 'clockify',
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
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
            <div className="flex items-center gap-4">
                <Link
                    href="/app/settings"
                    className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Integrations</h1>
                    <p className="text-gray-400 mt-1">Connect external services to sync data automatically.</p>
                </div>
            </div>

            {/* Global Notification */}
            {notification && (
                <div
                    className={`p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}
                >
                    {notification.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertTriangle className="w-5 h-5" />
                    )}
                    {notification.message}
                </div>
            )}

            {/* Integration Cards */}
            <div className="space-y-4">
                {integrations.map(integration => {
                    const config = INTEGRATION_CONFIG[integration.provider];
                    const Icon = config.icon;
                    const isEditing = editingId === integration.id;
                    const status = syncStatus[integration.provider];
                    const isConnecting = connectingProvider === integration.provider;

                    return (
                        <div
                            key={integration.id}
                            className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color === 'purple'
                                            ? 'bg-purple-500/20'
                                            : config.color === 'pink'
                                                ? 'bg-pink-500/20'
                                                : 'bg-blue-500/20'
                                            }`}
                                    >
                                        <Icon
                                            className={`w-6 h-6 ${config.color === 'purple'
                                                ? 'text-purple-400'
                                                : config.color === 'pink'
                                                    ? 'text-pink-400'
                                                    : 'text-blue-400'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-semibold text-[var(--foreground)]">
                                                {config.name}
                                            </h3>
                                            {integration.enabled ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Connected
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs font-medium rounded-full">
                                                    <XCircle className="w-3 h-3" />
                                                    Not Connected
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{config.description}</p>
                                    </div>
                                </div>
                                <a
                                    href={config.docsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                                    title="View documentation"
                                >
                                    <ExternalLink className="w-4 h-4 text-gray-500" />
                                </a>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Stripe - OAuth Connect */}
                                {integration.provider === 'stripe' && !integration.enabled && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Connect your Stripe account using Stripe Connect. This securely links your Stripe account to automatically sync invoices and payments.
                                        </p>
                                        <button
                                            onClick={handleStripeConnect}
                                            disabled={isConnecting}
                                            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg text-sm hover:bg-purple-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isConnecting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Plug className="w-4 h-4" />
                                            )}
                                            Connect with Stripe
                                        </button>
                                    </div>
                                )}

                                {/* Toggl - OAuth or API Key */}
                                {integration.provider === 'toggl' && !integration.enabled && !isEditing && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Connect your Toggl Track account to import time entries automatically.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleTogglConnect}
                                                disabled={isConnecting}
                                                className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg text-sm hover:bg-pink-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isConnecting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Plug className="w-4 h-4" />
                                                )}
                                                Connect Toggl
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Clockify - API Key */}
                                {integration.provider === 'clockify' && !integration.enabled && !isEditing && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Enter your Clockify API key to import time entries.
                                        </p>
                                        <button
                                            onClick={() => setEditingId('clockify')}
                                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                        >
                                            <Plug className="w-4 h-4" />
                                            Connect Clockify
                                        </button>
                                    </div>
                                )}

                                {/* API Key Entry Form */}
                                {isEditing && 'fields' in config && (
                                    <div className="space-y-4">
                                        {config.fields?.map(field => (
                                            <div key={field.key}>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
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
                                                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)] pr-10"
                                                    />
                                                    {field.secret && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSecret(field.key)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                                        >
                                                            {showSecrets[field.key] ? (
                                                                <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                <Eye className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={integration.provider === 'clockify' ? handleClockifyConnect : handleTogglApiConnect}
                                                disabled={isConnecting}
                                                className="px-4 py-2 bg-[var(--foreground)] text-[var(--card)] font-medium rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                            >
                                                {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                                                Save & Connect
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setFormData({});
                                                }}
                                                className="px-4 py-2 bg-[var(--background)] text-[var(--foreground)] font-medium rounded-lg text-sm hover:bg-[var(--border)] transition-colors border border-[var(--border)]"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Connected State */}
                                {integration.enabled && (
                                    <div className="space-y-4">
                                        {/* Connection Details */}
                                        {integration.api_key && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">API Key</span>
                                                <span className="text-gray-300 font-mono">
                                                    ••••••••{integration.api_key.slice(-4)}
                                                </span>
                                            </div>
                                        )}
                                        {!!(integration.config as any)?.stripe_user_id && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Account ID</span>
                                                <span className="text-gray-300 font-mono">
                                                    {String((integration.config as any)?.stripe_user_id).slice(0, 20)}...
                                                </span>
                                            </div>
                                        )}
                                        {integration.workspace_id && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Workspace</span>
                                                <span className="text-gray-300">
                                                    {(integration.config?.workspace_name as string) || integration.workspace_id}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Last Synced</span>
                                            <span className="text-gray-300">{formatLastSync(integration.last_sync_at)}</span>
                                        </div>

                                        {/* Sync Status */}
                                        {status?.error && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-400">
                                                <AlertTriangle className="w-4 h-4" />
                                                {status.error}
                                            </div>
                                        )}
                                        {status?.success && (
                                            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-sm text-green-400">
                                                <CheckCircle className="w-4 h-4" />
                                                {status.success}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-3 pt-2">
                                            {(integration.provider === 'toggl' || integration.provider === 'clockify') && (
                                                <>
                                                    <button
                                                        onClick={() => handleSync(integration.provider as any)}
                                                        disabled={status?.loading}
                                                        className="px-4 py-2 bg-[var(--foreground)] text-[var(--card)] font-medium rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                                    >
                                                        <RefreshCw className={`w-4 h-4 ${status?.loading ? 'animate-spin' : ''}`} />
                                                        {status?.loading ? 'Syncing...' : 'Sync Now'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleFetchProjects(integration.provider as any)}
                                                        className="px-4 py-2 bg-[var(--background)] text-[var(--foreground)] font-medium rounded-lg text-sm hover:bg-[var(--border)] transition-colors border border-[var(--border)]"
                                                    >
                                                        Configure Mapping
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDisconnect(integration.provider)}
                                                className="px-4 py-2 bg-red-500/10 text-red-400 font-medium rounded-lg text-sm hover:bg-red-500/20 transition-colors border border-red-500/30"
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">
                                Map {INTEGRATION_CONFIG[showMapping as keyof typeof INTEGRATION_CONFIG].name} Projects to Clients
                            </h3>
                            <button
                                onClick={() => {
                                    setShowMapping(null);
                                    setExternalProjects([]);
                                }}
                                className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                            >
                                <XCircle className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            <p className="text-sm text-gray-500">
                                Map your external projects to RevenueLeak clients. Time entries from mapped projects will be synced to the corresponding client.
                            </p>
                            {externalProjects.length > 0 ? (
                                externalProjects.map(project => (
                                    <div key={project.id} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <span className="text-sm text-[var(--foreground)]">{project.name}</span>
                                        </div>
                                        <div className="w-48">
                                            <select
                                                value={clientMapping[String(project.id)] || ''}
                                                onChange={(e) =>
                                                    setClientMapping(prev => ({
                                                        ...prev,
                                                        [String(project.id)]: e.target.value,
                                                    }))
                                                }
                                                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--neutral-metric)]"
                                            >
                                                <option value="">Skip this project</option>
                                                {clients.map((client: any) => (
                                                    <option key={client.id} value={client.id}>
                                                        {client.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                                    <p>Loading projects...</p>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowMapping(null);
                                    setExternalProjects([]);
                                }}
                                className="px-4 py-2 bg-[var(--background)] text-[var(--foreground)] font-medium rounded-lg text-sm hover:bg-[var(--border)] transition-colors border border-[var(--border)]"
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
                                className="px-4 py-2 bg-[var(--foreground)] text-[var(--card)] font-medium rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            >
                                Save Mapping
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Section */}
            <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] p-6">
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Getting Started</h3>
                <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-start gap-2">
                        <span className="font-mono text-xs bg-[var(--card)] px-1.5 py-0.5 rounded">1</span>
                        <span>For Stripe, click &quot;Connect with Stripe&quot; to securely link your account via Stripe Connect</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-mono text-xs bg-[var(--card)] px-1.5 py-0.5 rounded">2</span>
                        <span>For time tracking, connect Toggl or Clockify with your API key/token</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-mono text-xs bg-[var(--card)] px-1.5 py-0.5 rounded">3</span>
                        <span>Configure project-to-client mapping to route time entries correctly</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-mono text-xs bg-[var(--card)] px-1.5 py-0.5 rounded">4</span>
                        <span>Click &quot;Sync Now&quot; to import your time entries</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default function IntegrationsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-[var(--foreground)]" /></div>}>
            <IntegrationsContent />
        </Suspense>
    );
}
