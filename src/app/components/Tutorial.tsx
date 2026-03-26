// src/app/components/Tutorial.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ArrowRight,
    ArrowLeft,
    TrendingUp,
    AlertTriangle,
    Users,
    Check,
    Settings,
    BarChart3,
    DollarSign,
    Clock,
    FileText,
    Plug,
    PieChart
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    tip?: string;
    page: string;
    target?: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    icon: React.ReactNode;
    action?: string;
}

const tutorialSteps: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to OBSIDIAN',
        description: 'OBSIDIAN detects revenue leaks in your agency—unbilled hours, scope creep, late payments, and missing invoices. Most agencies lose 4-10% of revenue to these gaps.',
        tip: 'This quick tour will show you how to find and recover lost revenue.',
        page: '/app',
        position: 'center',
        icon: <DollarSign className="w-5 h-5" />,
    },
    {
        id: 'revenue-at-risk',
        title: 'Revenue at Risk',
        description: 'This is your primary metric. It shows the total amount of money currently at risk across all your clients—from unbilled work, scope creep, and overdue payments.',
        tip: 'Click on the breakdown to see where the leakage is coming from.',
        page: '/app',
        target: '[data-tutorial="metrics"]',
        position: 'bottom',
        icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
        id: 'stats-overview',
        title: 'Key Metrics',
        description: 'Quick overview of your business health: active clients, total revenue, logged hours, and unpaid invoices. Click any card to drill down.',
        tip: 'Red numbers indicate issues that need attention.',
        page: '/app',
        target: '[data-tutorial="stats-grid"]',
        position: 'bottom',
        icon: <BarChart3 className="w-5 h-5" />,
    },
    {
        id: 'chart',
        title: 'Revenue Trends',
        description: 'Track revenue and leakage over time. The red area shows detected leakage each month—spikes indicate periods with billing issues.',
        tip: 'Use the timeframe buttons (3M, 6M, 12M) to adjust the view.',
        page: '/app',
        target: '[data-tutorial="chart"]',
        position: 'top',
        icon: <TrendingUp className="w-5 h-5" />,
    },
    {
        id: 'alerts-section',
        title: 'Active Alerts',
        description: 'Every alert represents recoverable revenue. We detect: unbilled hours, scope creep (over hour limits), missing invoices, and late payments.',
        tip: 'Alerts are sorted by severity and impact. Address critical ones first.',
        page: '/app',
        target: '[data-tutorial="alerts"]',
        position: 'top',
        icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
        id: 'sidebar-nav',
        title: 'Navigation',
        description: 'Access all sections from the sidebar: Dashboard for overview, Clients to manage accounts, Time Entries for hours, Invoices for billing, and Alerts for issues.',
        page: '/app',
        target: '[data-tutorial="sidebar"]',
        position: 'right',
        icon: <PieChart className="w-5 h-5" />,
    },
    {
        id: 'clients-page',
        title: 'Client Management',
        description: 'Add and manage your clients here. Each client has a retainer amount, hour limit, and custom rates. We track profitability and detect issues per client.',
        tip: 'Click "Add Client" to create your first client, or click a client row to see details.',
        page: '/app/clients',
        target: '[data-tutorial="clients-list"]',
        position: 'bottom',
        icon: <Users className="w-5 h-5" />,
        action: 'View clients',
    },
    {
        id: 'time-entries',
        title: 'Time Tracking',
        description: 'Log hours manually or import from CSV, Toggl, or Clockify. We compare logged hours against retainers to detect underbilling and scope creep.',
        tip: 'Billable vs non-billable hours affect your margin calculations.',
        page: '/app/time-entries',
        target: '[data-tutorial="time-entries-header"]',
        position: 'bottom',
        icon: <Clock className="w-5 h-5" />,
        action: 'View time entries',
    },
    {
        id: 'invoices',
        title: 'Invoice Management',
        description: 'Track all invoices—sent, paid, and overdue. We detect missing invoices (work done but not billed) and late payments automatically.',
        tip: 'The collection rate shows what percentage of invoiced amount has been paid.',
        page: '/app/invoices',
        target: '[data-tutorial="invoices-header"]',
        position: 'bottom',
        icon: <FileText className="w-5 h-5" />,
        action: 'View invoices',
    },
    {
        id: 'alerts-page',
        title: 'All Alerts',
        description: 'See every detected issue across all clients. Filter by type (unbilled, scope creep, etc.) or severity (critical, high, medium).',
        tip: 'Each alert shows the estimated dollar impact—this is money you can recover.',
        page: '/app/alerts',
        target: '[data-tutorial="alerts-table"]',
        position: 'bottom',
        icon: <AlertTriangle className="w-5 h-5" />,
        action: 'View all alerts',
    },
    {
        id: 'settings',
        title: 'Settings',
        description: 'Configure your default rates (hourly billing and cost rates), currency, and alert thresholds. These settings affect how we calculate margins and detect leaks.',
        tip: 'Set your margin warning threshold to get alerted when client profitability drops.',
        page: '/app/settings',
        target: '[data-tutorial="settings-form"]',
        position: 'bottom',
        icon: <Settings className="w-5 h-5" />,
        action: 'Open settings',
    },
    {
        id: 'integrations',
        title: 'Integrations',
        description: 'Connect Stripe to sync invoices automatically, or Toggl/Clockify to import time entries. This keeps your data up-to-date without manual work.',
        tip: 'After connecting, map your external projects to OBSIDIAN clients.',
        page: '/app/settings/integrations',
        target: '[data-tutorial="integrations-list"]',
        position: 'bottom',
        icon: <Plug className="w-5 h-5" />,
        action: 'View integrations',
    },
    {
        id: 'complete',
        title: 'You\'re all set!',
        description: 'Start by adding your first client, then import time entries and invoices. OBSIDIAN will automatically analyze your data and surface revenue leaks.',
        tip: 'You can replay this tutorial anytime from Settings.',
        page: '/app',
        position: 'center',
        icon: <Check className="w-5 h-5" />,
    },
];

interface TutorialProps {
    onComplete: () => void;
    onSkip: () => void;
}

export function Tutorial({ onComplete, onSkip }: TutorialProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [isNavigating, setIsNavigating] = useState(false);
    const step = tutorialSteps[currentStep];

    useEffect(() => {
        if (step.page && window.location.pathname !== step.page) {
            setIsNavigating(true);
            router.push(step.page);
            const timer = setTimeout(() => {
                setIsNavigating(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [currentStep, step.page, router]);

    const updatePosition = useCallback(() => {
        if (!step.target) return;

        const element = document.querySelector(step.target);
        if (element) {
            const rect = element.getBoundingClientRect();
            setHighlightPosition({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
        }
    }, [step.target]);

    useEffect(() => {
        if (step.target && !isNavigating) {
            // Initial position update with delay for page render
            const initTimer = setTimeout(() => {
                updatePosition();
                const element = document.querySelector(step.target!);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(updatePosition, 500);
                }
            }, 500);

            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);

            return () => {
                clearTimeout(initTimer);
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [currentStep, step.target, isNavigating, updatePosition]);

    const handleNext = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getTooltipStyle = (): React.CSSProperties => {
        if (step.position === 'center' || !step.target || highlightPosition.width === 0) {
            return {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        }

        const padding = 20;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

        let top = highlightPosition.top;
        let left = highlightPosition.left;
        let transform = '';

        switch (step.position) {
            case 'bottom':
                top = highlightPosition.top + highlightPosition.height + padding;
                left = highlightPosition.left + highlightPosition.width / 2;
                transform = 'translateX(-50%)';
                if (top > viewportHeight - 280) {
                    top = highlightPosition.top - padding;
                    transform = 'translate(-50%, -100%)';
                }
                break;
            case 'top':
                top = highlightPosition.top - padding;
                left = highlightPosition.left + highlightPosition.width / 2;
                transform = 'translate(-50%, -100%)';
                if (top < 150) {
                    top = highlightPosition.top + highlightPosition.height + padding;
                    transform = 'translateX(-50%)';
                }
                break;
            case 'right':
                top = highlightPosition.top + highlightPosition.height / 2;
                left = highlightPosition.left + highlightPosition.width + padding;
                transform = 'translateY(-50%)';
                if (left > viewportWidth - 420) {
                    left = highlightPosition.left - padding;
                    transform = 'translate(-100%, -50%)';
                }
                break;
            case 'left':
                top = highlightPosition.top + highlightPosition.height / 2;
                left = highlightPosition.left - padding;
                transform = 'translate(-100%, -50%)';
                if (left < 420) {
                    left = highlightPosition.left + highlightPosition.width + padding;
                    transform = 'translateY(-50%)';
                }
                break;
        }

        return {
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            transform,
        };
    };

    const hasHighlight = step.target && highlightPosition.width > 0 && !isNavigating;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 pointer-events-none">
                {/* Overlay with cutout */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80"
                    style={{
                        clipPath: hasHighlight
                            ? `polygon(
                                0% 0%,
                                0% 100%,
                                ${highlightPosition.left - 8}px 100%,
                                ${highlightPosition.left - 8}px ${highlightPosition.top - 8}px,
                                ${highlightPosition.left + highlightPosition.width + 8}px ${highlightPosition.top - 8}px,
                                ${highlightPosition.left + highlightPosition.width + 8}px ${highlightPosition.top + highlightPosition.height + 8}px,
                                ${highlightPosition.left - 8}px ${highlightPosition.top + highlightPosition.height + 8}px,
                                ${highlightPosition.left - 8}px 100%,
                                100% 100%,
                                100% 0%
                            )`
                            : 'none'
                    }}
                />

                {/* Highlight border */}
                {hasHighlight && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute rounded-lg pointer-events-none"
                        style={{
                            top: `${highlightPosition.top - 6}px`,
                            left: `${highlightPosition.left - 6}px`,
                            width: `${highlightPosition.width + 12}px`,
                            height: `${highlightPosition.height + 12}px`,
                            border: '2px solid #FF5733',
                            boxShadow: '0 0 0 4px rgba(255, 87, 51, 0.2)',
                        }}
                    />
                )}

                {/* Tooltip Card */}
                <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: isNavigating ? 0.3 : 0 }}
                    className="absolute w-[400px] max-w-[calc(100vw-32px)] pointer-events-auto"
                    style={getTooltipStyle()}
                >
                    <div className="bg-[#111113] border border-[#2a2a2f] rounded-lg shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1f]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-md bg-[#1c1c1f] flex items-center justify-center text-[#FF5733]">
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white">{step.title}</h3>
                                    <p className="text-xs text-gray-500">Step {currentStep + 1} of {tutorialSteps.length}</p>
                                </div>
                            </div>
                            <button
                                onClick={onSkip}
                                className="p-1.5 text-gray-500 hover:text-white hover:bg-[#1c1c1f] rounded-md transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-5 py-4">
                            <p className="text-sm text-gray-300 leading-relaxed mb-3">
                                {step.description}
                            </p>
                            {step.tip && (
                                <div className="flex items-start gap-2 px-3 py-2.5 bg-[#0a0a0b] rounded-md border border-[#1c1c1f]">
                                    <span className="text-[#FF5733] text-xs font-medium mt-0.5">TIP</span>
                                    <p className="text-xs text-gray-400 leading-relaxed">{step.tip}</p>
                                </div>
                            )}
                        </div>

                        {/* Progress bar */}
                        <div className="px-5">
                            <div className="h-1 bg-[#1c1c1f] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#FF5733] transition-all duration-300"
                                    style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-5 py-4">
                            <button
                                onClick={onSkip}
                                className="text-xs text-gray-500 hover:text-white transition-colors"
                            >
                                Skip tutorial
                            </button>
                            <div className="flex items-center gap-2">
                                {currentStep > 0 && (
                                    <button
                                        onClick={handlePrevious}
                                        className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1c1c1f] rounded-md transition-colors inline-flex items-center gap-1.5"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="px-4 py-2 bg-[#FF5733] hover:bg-[#E84118] text-white text-sm font-medium rounded-md transition-colors inline-flex items-center gap-1.5"
                                >
                                    {currentStep === tutorialSteps.length - 1 ? (
                                        <>
                                            Get Started
                                            <Check className="w-3.5 h-3.5" />
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// Welcome Modal
interface WelcomeModalProps {
    onStart: () => void;
    onSkip: () => void;
}

export function WelcomeModal({ onStart, onSkip }: WelcomeModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80"
                onClick={onSkip}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md bg-[#111113] border border-[#2a2a2f] rounded-lg shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 text-center">
                    <div className="w-14 h-14 rounded-lg bg-[#1c1c1f] flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-7 h-7 text-[#FF5733]" />
                    </div>
                    <h2 className="text-xl font-medium text-white mb-2">
                        Welcome to OBSIDIAN
                    </h2>
                    <p className="text-sm text-gray-400">
                        Revenue leak detection for agencies
                    </p>
                </div>

                {/* Features */}
                <div className="px-6 py-4 space-y-3">
                    {[
                        {
                            icon: <AlertTriangle className="w-4 h-4" />,
                            title: 'Detect Revenue Leaks',
                            text: 'Find unbilled hours, scope creep, and late payments'
                        },
                        {
                            icon: <BarChart3 className="w-4 h-4" />,
                            title: 'Track Profitability',
                            text: 'Monitor margins and revenue health per client'
                        },
                        {
                            icon: <Plug className="w-4 h-4" />,
                            title: 'Sync Your Data',
                            text: 'Connect Stripe, Toggl, or Clockify automatically'
                        },
                    ].map((feature, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-[#0a0a0b] rounded-md border border-[#1c1c1f]">
                            <div className="w-8 h-8 rounded-md bg-[#1c1c1f] flex items-center justify-center text-[#FF5733] flex-shrink-0">
                                {feature.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{feature.title}</p>
                                <p className="text-xs text-gray-500">{feature.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="px-6 py-5 border-t border-[#1c1c1f] space-y-2">
                    <button
                        onClick={onStart}
                        className="w-full px-4 py-3 bg-[#FF5733] hover:bg-[#E84118] text-white font-medium rounded-md transition-colors inline-flex items-center justify-center gap-2"
                    >
                        Take a Quick Tour
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onSkip}
                        className="w-full px-4 py-2.5 text-gray-500 hover:text-white text-sm transition-colors"
                    >
                        Skip for now
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// Hook to manage tutorial state
export function useTutorial() {
    const [showWelcome, setShowWelcome] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (initialized) return;

        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        const isGuestMode = document.cookie.includes('guest_mode=true');
        const guestHasSeenTutorial = isGuestMode && sessionStorage.getItem('guestSeenTutorial');

        if (!hasSeenTutorial && !guestHasSeenTutorial) {
            setTimeout(() => {
                setShowWelcome(true);
            }, 600);
        }

        setInitialized(true);
    }, [initialized]);

    const startTutorial = () => {
        setShowWelcome(false);
        setShowTutorial(true);
    };

    const completeTutorial = () => {
        setShowTutorial(false);
        const isGuestMode = document.cookie.includes('guest_mode=true');

        if (isGuestMode) {
            sessionStorage.setItem('guestSeenTutorial', 'true');
        } else {
            localStorage.setItem('hasSeenTutorial', 'true');
        }
    };

    const skipTutorial = () => {
        setShowWelcome(false);
        setShowTutorial(false);
        const isGuestMode = document.cookie.includes('guest_mode=true');

        if (isGuestMode) {
            sessionStorage.setItem('guestSeenTutorial', 'true');
        } else {
            localStorage.setItem('hasSeenTutorial', 'true');
        }
    };

    const replayTutorial = () => {
        setShowWelcome(true);
    };

    return {
        showWelcome,
        showTutorial,
        startTutorial,
        completeTutorial,
        skipTutorial,
        replayTutorial,
    };
}
