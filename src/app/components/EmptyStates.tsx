// src/app/components/EmptyStates.tsx
'use client';

import { Users, FileText, Clock, Settings, TrendingUp, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        href: string;
    };
    variant?: 'default' | 'success' | 'warning';
}

export function EmptyState({ icon, title, description, action, variant = 'default' }: EmptyStateProps) {
    const bgColor = variant === 'success'
        ? 'bg-[var(--profit)]/10'
        : variant === 'warning'
        ? 'bg-amber-500/10'
        : 'bg-[var(--background)]';

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-500">
            <div className={`w-16 h-16 rounded-2xl ${bgColor} border border-[var(--border)] flex items-center justify-center mb-6 relative`}>
                {icon}
                {variant === 'default' && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-[var(--neutral-metric)]" />
                    </div>
                )}
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
            <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">{description}</p>
            {action && (
                <Link
                    href={action.href}
                    className="px-5 py-2.5 bg-[var(--foreground)] text-[var(--card)] font-medium rounded-lg text-sm hover:bg-gray-200 transition-all duration-200 inline-flex items-center gap-2 group"
                >
                    {action.label}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            )}
        </div>
    );
}

// ============================================
// PRE-BUILT EMPTY STATES
// ============================================

export function NoClientsEmpty() {
    return (
        <EmptyState
            icon={<Users className="w-8 h-8 text-[var(--neutral-metric)]" />}
            title="No clients added yet"
            description="Add your first client to start tracking revenue and detecting leaks. It only takes a minute to get started."
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
            icon={<Settings className="w-8 h-8 text-gray-500" />}
            title="Configure your settings"
            description="Set up your financial assumptions like hourly rates, cost rates, and alert thresholds to get accurate leak detection."
            action={{
                label: 'Configure Settings',
                href: '/app/settings',
            }}
        />
    );
}

export function NoTimeEntriesEmpty() {
    return (
        <EmptyState
            icon={<Clock className="w-8 h-8 text-blue-500" />}
            title="No time entries"
            description="Upload time entries to calculate margins and detect scope creep. Import from your favorite time tracker."
            action={{
                label: 'Upload Time Entries',
                href: '/app/time-entries/upload',
            }}
        />
    );
}

export function NoInvoicesEmpty() {
    return (
        <EmptyState
            icon={<FileText className="w-8 h-8 text-[var(--profit)]" />}
            title="No invoices"
            description="Connect Stripe or manually add invoices to track payments and detect late payment issues."
            action={{
                label: 'Add Invoice',
                href: '/app/invoices/new',
            }}
        />
    );
}

export function NoAlertsEmpty() {
    return (
        <EmptyState
            icon={<CheckCircle2 className="w-8 h-8 text-[var(--profit)]" />}
            title="No revenue leaks detected"
            description="Great job! All your clients are healthy with no detected issues. Keep up the good work."
            variant="success"
        />
    );
}

export function NoDataEmpty() {
    return (
        <EmptyState
            icon={<TrendingUp className="w-8 h-8 text-gray-500" />}
            title="No data to display"
            description="Add clients, time entries, and invoices to see your revenue analytics and leak detection."
            action={{
                label: 'Get Started',
                href: '/app/settings',
            }}
        />
    );
}

// ============================================
// DEMO MODE BANNER
// ============================================

export function DemoModeBanner({ onDisable }: { onDisable?: () => void }) {
    return (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-amber-400">Demo Mode Active</h4>
                        <p className="text-xs text-amber-400/70">
                            Exploring with sample data. Add real clients to get started.
                        </p>
                    </div>
                </div>
                {onDisable && (
                    <button
                        onClick={onDisable}
                        className="px-4 py-2 text-sm font-medium text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/10 transition-all duration-200"
                    >
                        Exit Demo
                    </button>
                )}
            </div>
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
        <div className="bg-gradient-to-br from-[var(--card)] to-[var(--background)] border border-[var(--border)] rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">Get Started</h3>
                    <p className="text-sm text-gray-500">Complete setup to unlock all features</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[var(--foreground)]">{completedCount}</span>
                    <span className="text-sm text-gray-500">/ {steps.length}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[var(--background)] rounded-full h-2 mb-6 border border-[var(--border)] overflow-hidden">
                <div
                    className="h-2 rounded-full bg-gradient-to-r from-[var(--profit)] to-emerald-400 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {steps.map((step, index) => (
                    <Link
                        key={step.id}
                        href={step.href}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 group ${
                            step.completed
                                ? 'border-[var(--profit)]/30 bg-[var(--profit)]/5'
                                : 'border-[var(--border)] hover:bg-[var(--background)] hover:border-[var(--neutral-metric)]/30'
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                step.completed
                                    ? 'bg-[var(--profit)]/20 text-[var(--profit)]'
                                    : 'bg-[var(--background)] text-gray-500 group-hover:bg-[var(--neutral-metric)]/10 group-hover:text-[var(--neutral-metric)]'
                            }`}
                        >
                            {step.completed ? (
                                <CheckCircle2 className="w-5 h-5" />
                            ) : (
                                step.icon
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium truncate ${step.completed ? 'text-[var(--profit)]' : 'text-[var(--foreground)]'}`}>
                                {step.title}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">{step.description}</p>
                        </div>
                        {!step.completed && (
                            <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
