// src/app/components/TopNav.tsx
'use client';

import { User, Bell, Calendar, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';

const viewTabs = [
    { title: 'Today', icon: Clock },
    { title: 'This Week', icon: Calendar },
    { type: 'separator' as const },
    { title: 'Trending', icon: TrendingUp },
    { title: 'Alerts', icon: AlertTriangle },
];

export default function TopNav() {
    return (
        <header className="h-16 bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-6 z-10 sticky top-0">
            <div className="flex items-center gap-6">
                <h2 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">Overview</h2>

                {/* Expandable Tabs for view switching */}
                <div className="hidden lg:block">
                    <ExpandableTabs
                        tabs={viewTabs}
                        activeColor="text-[var(--neutral-metric)]"
                        onChange={(index) => console.log('Selected tab:', index)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-[var(--foreground)] relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[var(--leak)] rounded-full"></span>
                </button>
                <div className="h-8 w-8 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[var(--neutral-metric)] transition-all">
                    <User className="w-4 h-4 text-gray-300" />
                </div>
            </div>
        </header>
    );
}
