// src/app/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, AlertTriangle, Clock, CreditCard, Plug } from 'lucide-react';

const navItems = [
    { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/app/clients', label: 'Clients', icon: Users },
    { href: '/app/time-entries', label: 'Time Entries', icon: Clock },
    { href: '/app/invoices', label: 'Invoices', icon: CreditCard },
    { href: '/app/alerts', label: 'Alerts', icon: AlertTriangle },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/app') {
            return pathname === '/app';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)] hidden md:flex flex-col h-screen fixed left-0 top-0">
            <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
                <Link href="/app" className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] rounded-lg">
                    <Image src="/logo.png" alt="RevenueLeak Logo" width={32} height={32} className="h-8 w-8 object-contain" />
                    RevenueLeak
                </Link>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            data-tutorial={item.label === 'Clients' ? 'clients' : undefined}
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] ${active
                                    ? 'bg-[var(--background)] text-[var(--foreground)]'
                                    : 'text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-[var(--neutral-metric)]' : ''}`} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[var(--border)] space-y-1">
                <Link
                    href="/app/settings"
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] ${pathname === '/app/settings'
                            ? 'bg-[var(--background)] text-[var(--foreground)]'
                            : 'text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                        }`}
                >
                    <Settings className={`w-5 h-5 ${pathname === '/app/settings' ? 'text-[var(--neutral-metric)]' : ''}`} />
                    Settings
                </Link>
                <Link
                    href="/app/settings/integrations"
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)] ${pathname === '/app/settings/integrations'
                            ? 'bg-[var(--background)] text-[var(--foreground)]'
                            : 'text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                        }`}
                >
                    <Plug className={`w-5 h-5 ${pathname === '/app/settings/integrations' ? 'text-[var(--neutral-metric)]' : ''}`} />
                    Integrations
                </Link>
            </div>
        </aside>
    );
}
