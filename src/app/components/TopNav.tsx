// src/app/components/TopNav.tsx
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Bell, Calendar, TrendingUp, AlertTriangle, Clock, Menu, X, LayoutDashboard, Users, CreditCard, Settings, Plug, Play, ArrowRight } from 'lucide-react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { useAuth } from '../providers/AuthProvider';

const viewTabs = [
    { title: 'Today', icon: Clock },
    { title: 'This Week', icon: Calendar },
    { type: 'separator' as const },
    { title: 'Trending', icon: TrendingUp },
    { title: 'Alerts', icon: AlertTriangle },
];

const navItems = [
    { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/app/clients', label: 'Clients', icon: Users },
    { href: '/app/time-entries', label: 'Time Entries', icon: Clock },
    { href: '/app/invoices', label: 'Invoices', icon: CreditCard },
    { href: '/app/alerts', label: 'Alerts', icon: AlertTriangle },
    { href: '/app/settings', label: 'Settings', icon: Settings },
    { href: '/app/settings/integrations', label: 'Integrations', icon: Plug },
];

const pageTitles: Record<string, string> = {
    '/app': 'Dashboard',
    '/app/clients': 'Clients',
    '/app/clients/new': 'Add Client',
    '/app/time-entries': 'Time Entries',
    '/app/time-entries/new': 'Add Time Entry',
    '/app/time-entries/upload': 'Upload Time Entries',
    '/app/invoices': 'Invoices',
    '/app/invoices/new': 'Add Invoice',
    '/app/alerts': 'Alerts',
    '/app/settings': 'Settings',
    '/app/settings/integrations': 'Integrations',
};

export default function TopNav() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [guestBannerDismissed, setGuestBannerDismissed] = useState(false);
    const pathname = usePathname();
    const { isGuest } = useAuth();

    // Get page title based on current path
    const getPageTitle = () => {
        // Check for exact match first
        if (pageTitles[pathname]) {
            return pageTitles[pathname];
        }
        // Check for client detail/edit pages
        if (pathname.match(/^\/app\/clients\/[^/]+$/)) {
            return 'Client Details';
        }
        if (pathname.match(/^\/app\/clients\/[^/]+\/edit$/)) {
            return 'Edit Client';
        }
        return 'Overview';
    };

    const isActive = (href: string) => {
        if (href === '/app') {
            return pathname === '/app';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Guest Mode Banner */}
            {isGuest && !guestBannerDismissed && (
                <div className="bg-gradient-to-r from-[var(--neutral-metric)]/10 via-[var(--profit)]/10 to-[var(--neutral-metric)]/10 border-b border-[var(--border)] sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 bg-[var(--neutral-metric)]/20 rounded-lg flex-shrink-0">
                                <Play className="w-4 h-4 text-[var(--neutral-metric)]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                    You&apos;re viewing a live demo with sample data
                                </p>
                                <p className="text-xs text-gray-500 hidden sm:block">
                                    Sign up to track your real revenue and detect leaks
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Link href="/login">
                                <button className="px-4 py-1.5 bg-[var(--foreground)] hover:bg-white/90 text-[var(--card)] text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap">
                                    <span className="hidden sm:inline">Sign Up Free</span>
                                    <span className="sm:hidden">Sign Up</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </Link>
                            <button
                                onClick={() => setGuestBannerDismissed(true)}
                                className="p-1.5 text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--card)] rounded-lg transition-colors"
                                aria-label="Dismiss banner"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="h-16 bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-4 md:px-6 z-20 sticky top-0">
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 -ml-2 text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--card)] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)]"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    {/* Logo on mobile */}
                    <Link href="/app" className="md:hidden text-lg font-bold tracking-tight text-[var(--foreground)]">
                        RevenueLeak
                    </Link>

                    {/* Page title on desktop */}
                    <h2 className="hidden md:block text-lg font-semibold text-[var(--foreground)] tracking-tight">{getPageTitle()}</h2>

                    {/* Expandable Tabs for view switching */}
                    <div className="hidden lg:block">
                        <ExpandableTabs
                            tabs={viewTabs}
                            activeColor="text-[var(--neutral-metric)]"
                            onChange={(index) => console.log('Selected tab:', index)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    <button className="p-2 text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--card)] rounded-lg transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)]">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--leak)] rounded-full"></span>
                    </button>
                    <div className="h-8 w-8 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[var(--neutral-metric)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neutral-metric)]">
                        <User className="w-4 h-4 text-gray-300" />
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Overlay */}
            <div
                className={`md:hidden fixed inset-0 z-10 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
                    mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Navigation Drawer - Side Slide */}
            <nav
                className={`md:hidden fixed top-0 left-0 bottom-0 w-72 z-20 bg-[var(--card)] border-r border-[var(--border)] transform transition-transform duration-300 ease-out ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Mobile Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)]">
                    <Link
                        href="/app"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xl font-bold tracking-tight text-[var(--foreground)]"
                    >
                        RevenueLeak
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)] rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="p-4 space-y-1">
                    {navItems.slice(0, 5).map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                    active
                                        ? 'bg-[var(--background)] text-[var(--foreground)]'
                                        : 'text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-[var(--neutral-metric)]' : ''}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Settings Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)] space-y-1">
                    {navItems.slice(5).map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                    active
                                        ? 'bg-[var(--background)] text-[var(--foreground)]'
                                        : 'text-gray-400 hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-[var(--neutral-metric)]' : ''}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
