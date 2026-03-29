// src/app/components/EmptyStates.tsx
'use client';

import { Users, FileText, Clock, Settings, TrendingUp, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
    secondaryAction?: {
        label: string;
        href: string;
    };
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-lg bg-[#1c1c1f] flex items-center justify-center mb-5">
                {icon}
            </div>
            <h3 className="text-base font-medium text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
            <div className="flex items-center gap-3">
                {action && (
                    <Link
                        href={action.href}
                        className="px-4 py-2 bg-white text-black font-medium rounded-md text-sm hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
                    >
                        {action.label}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
                {secondaryAction && (
                    <Link
                        href={secondaryAction.href}
                        className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        {secondaryAction.label}
                    </Link>
                )}
            </div>
        </div>
    );
}

// ============================================
// PRE-BUILT EMPTY STATES
// ============================================

export function NoClientsEmpty() {
    return (
        <EmptyState
            icon={<Users className="w-5 h-5 text-gray-400" />}
            title="Add your first client"
            description="Start tracking retainers, time entries, and invoices to catch revenue leaks."
            action={{
                label: 'Add Client',
                href: '/app/clients/new',
            }}
        />
    );
}

export function NoSettingsEmpty() {
    return (
        <EmptyState
            icon={<Settings className="w-5 h-5 text-gray-400" />}
            title="Configure your rates"
            description="Set your hourly rates and cost structure to calculate margins accurately."
            action={{
                label: 'Settings',
                href: '/app/settings',
            }}
        />
    );
}

export function NoTimeEntriesEmpty() {
    return (
        <EmptyState
            icon={<Clock className="w-5 h-5 text-gray-400" />}
            title="No time entries"
            description="Import from Toggl, Clockify, or CSV to detect scope creep and calculate margins."
            action={{
                label: 'Import',
                href: '/app/time-entries/upload',
            }}
            secondaryAction={{
                label: 'Add manually',
                href: '/app/time-entries/new',
            }}
        />
    );
}

export function NoInvoicesEmpty() {
    return (
        <EmptyState
            icon={<FileText className="w-5 h-5 text-gray-400" />}
            title="No invoices"
            description="Track invoices to catch late payments. Connect Stripe or add manually."
            action={{
                label: 'Add Invoice',
                href: '/app/invoices/new',
            }}
            secondaryAction={{
                label: 'Connect Stripe',
                href: '/app/settings/integrations',
            }}
        />
    );
}

export function NoAlertsEmpty() {
    return (
        <EmptyState
            icon={<Check className="w-5 h-5 text-emerald-500" />}
            title="All clear"
            description="No revenue leaks detected. Projects on track, margins healthy, payments on time."
        />
    );
}

export function NoDataEmpty() {
    return (
        <EmptyState
            icon={<TrendingUp className="w-5 h-5 text-gray-400" />}
            title="Nothing to show"
            description="Add clients, log time, and create invoices to see your analytics."
            action={{
                label: 'Get Started',
                href: '/app/clients/new',
            }}
        />
    );
}

// ============================================
// DEMO MODE BANNER
// ============================================

export function DemoModeBanner({ onDisable }: { onDisable?: () => void }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 bg-[#111113] border border-[#1c1c1f] rounded-lg">
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#FF5733]" />
                <span className="text-sm text-gray-400">
                    Demo mode — exploring with sample data
                </span>
            </div>
            {onDisable && (
                <button
                    onClick={onDisable}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                    Exit demo
                </button>
            )}
        </div>
    );
}

// ============================================
// SETUP CHECKLIST
// ============================================

interface SetupStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    href: string;
    icon: React.ReactNode;
}

export function SetupChecklist({ steps }: { steps: SetupStep[] }) {
    const completedCount = steps.filter(s => s.completed).length;
    const progress = (completedCount / steps.length) * 100;

    return (
        <div className="bg-[#111113] border border-[#1c1c1f] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-medium text-white">Get Started</h3>
                    <p className="text-sm text-gray-500">Complete setup to unlock features</p>
                </div>
                <span className="text-sm text-gray-400">
                    {completedCount}/{steps.length}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#0a0a0b] rounded h-1 mb-5">
                <div
                    className="h-1 rounded bg-white transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {steps.map((step) => (
                    <Link
                        key={step.id}
                        href={step.href}
                        className={`flex items-center gap-3 p-3 rounded-md transition-colors group ${
                            step.completed
                                ? 'bg-[#0a0a0b]'
                                : 'hover:bg-[#0a0a0b]'
                        }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                step.completed
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-[#1c1c1f] text-gray-500'
                            }`}
                        >
                            {step.completed ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                step.icon
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium ${step.completed ? 'text-gray-400' : 'text-white'}`}>
                                {step.title}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">{step.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
