// src/app/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Settings, AlertTriangle, Clock, CreditCard, Plug } from 'lucide-react';
import { runDetectionEngine } from '../lib/detectionEngine';

const navItems = [
    { href: '/app', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview' },
    { href: '/app/clients', label: 'Clients', icon: Users, description: 'Your clients' },
    { href: '/app/time-entries', label: 'Time', icon: Clock, description: 'Track hours' },
    { href: '/app/invoices', label: 'Invoices', icon: CreditCard, description: 'Billing' },
    { href: '/app/alerts', label: 'Alerts', icon: AlertTriangle, description: 'Issues', showBadge: true },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [alertCount, setAlertCount] = useState(0);

    useEffect(() => {
        const alerts = runDetectionEngine();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAlertCount(alerts.length);
    }, []);

    const isActive = (href: string) => {
        if (href === '/app') {
            return pathname === '/app';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)] hidden md:flex flex-col h-screen fixed left-0 top-0">
            {/* Logo Header */}
            <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
                <Link href="/app" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] rounded-lg">
                    <div className="relative">
                        <Image src="/logo-removebg-preview.png" alt="OBSIDIAN Logo" width={32} height={32} className="h-8 w-8 object-contain" />
                        <div className="absolute inset-0 bg-[var(--neutral-metric)]/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                        OBSIDIAN
                    </span>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1" data-tutorial="sidebar">
                <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Main
                </p>
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    const showAlertBadge = item.showBadge && alertCount > 0;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            data-tutorial={item.label === 'Clients' ? 'clients' : undefined}
                            className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] ${active
                                    ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                                    : 'text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)]/50'
                                }`}
                        >
                            {/* Active indicator bar */}
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--neutral-metric)] rounded-full" />
                            )}

                            <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                                active
                                    ? 'bg-[var(--neutral-metric)]/20'
                                    : 'bg-transparent group-hover:bg-[var(--background)]'
                            }`}>
                                <Icon className={`w-[18px] h-[18px] transition-colors ${
                                    active ? 'text-[var(--neutral-metric)]' : 'group-hover:text-[var(--foreground)]'
                                }`} />
                            </div>

                            <span className="flex-1">{item.label}</span>

                            {/* Alert badge */}
                            {showAlertBadge && (
                                <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold bg-[var(--leak)] text-white rounded-full animate-pulse">
                                    {alertCount > 9 ? '9+' : alertCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Settings Section */}
            <div className="p-3 border-t border-[var(--border)]">
                <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Settings
                </p>
                <div className="space-y-1">
                    <Link
                        href="/app/settings"
                        className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] ${
                            pathname === '/app/settings'
                                ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                                : 'text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)]/50'
                        }`}
                    >
                        {pathname === '/app/settings' && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--neutral-metric)] rounded-full" />
                        )}
                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                            pathname === '/app/settings'
                                ? 'bg-[var(--neutral-metric)]/20'
                                : 'bg-transparent group-hover:bg-[var(--background)]'
                        }`}>
                            <Settings className={`w-[18px] h-[18px] transition-colors ${
                                pathname === '/app/settings' ? 'text-[var(--neutral-metric)]' : 'group-hover:text-[var(--foreground)]'
                            }`} />
                        </div>
                        <span>Settings</span>
                    </Link>
                    <Link
                        href="/app/settings/integrations"
                        className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] ${
                            pathname === '/app/settings/integrations'
                                ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                                : 'text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)]/50'
                        }`}
                    >
                        {pathname === '/app/settings/integrations' && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--neutral-metric)] rounded-full" />
                        )}
                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                            pathname === '/app/settings/integrations'
                                ? 'bg-[var(--neutral-metric)]/20'
                                : 'bg-transparent group-hover:bg-[var(--background)]'
                        }`}>
                            <Plug className={`w-[18px] h-[18px] transition-colors ${
                                pathname === '/app/settings/integrations' ? 'text-[var(--neutral-metric)]' : 'group-hover:text-[var(--foreground)]'
                            }`} />
                        </div>
                        <span>Integrations</span>
                    </Link>
                </div>
            </div>

            {/* Footer with subtle branding */}
            <div className="px-6 py-4 border-t border-[var(--border)]">
                <p className="text-[10px] text-gray-600">
                    v1.0.0 · Built for agencies
                </p>
            </div>
        </aside>
    );
}
