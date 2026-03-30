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
    Sparkles
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    tip?: string;
    page: string;
    target?: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    icon: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to RETENU',
        description: 'Let\'s take a quick tour of your revenue leak detection dashboard. This will only take about 2 minutes.',
        tip: 'You can skip this tour anytime and access it later from Settings.',
        page: '/app',
        position: 'center',
        icon: <Sparkles className="w-5 h-5" />,
    },
    {
        id: 'revenue-at-risk',
        title: 'Revenue at Risk',
        description: 'This is your most important metric. It shows the total revenue currently at risk from unbilled work, scope creep, and overdue payments.',
        tip: 'Click the breakdown to see where your money is leaking.',
        page: '/app',
        target: '[data-tutorial="metrics"]',
        position: 'bottom',
        icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
        id: 'stats-overview',
        title: 'Quick Stats',
        description: 'Overview of your business health: clients, revenue, hours logged, and unpaid invoices. Red numbers need your attention.',
        page: '/app',
        target: '[data-tutorial="stats-grid"]',
        position: 'bottom',
        icon: <BarChart3 className="w-5 h-5" />,
    },
    {
        id: 'chart',
        title: 'Trends Over Time',
        description: 'Track your revenue (green) and detected leakage (red) over time. Spikes in red indicate billing issues.',
        tip: 'Toggle between 3M, 6M, and 12M views.',
        page: '/app',
        target: '[data-tutorial="chart"]',
        position: 'top',
        icon: <TrendingUp className="w-5 h-5" />,
    },
    {
        id: 'alerts-section',
        title: 'Active Issues',
        description: 'Each alert represents money you can recover. We detect unbilled hours, scope creep, missing invoices, and late payments.',
        page: '/app',
        target: '[data-tutorial="alerts"]',
        position: 'top',
        icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
        id: 'clients-page',
        title: 'Your Clients',
        description: 'Manage all your clients here. Set retainers, hour limits, and custom rates. We track profitability for each client.',
        tip: 'Click any client to see their full details and history.',
        page: '/app/clients',
        target: '[data-tutorial="clients-list"]',
        position: 'bottom',
        icon: <Users className="w-5 h-5" />,
    },
    {
        id: 'time-entries',
        title: 'Time Tracking',
        description: 'Log hours manually or import from CSV. We compare logged hours against retainers to detect underbilling.',
        page: '/app/time-entries',
        target: '[data-tutorial="time-entries-header"]',
        position: 'bottom',
        icon: <Clock className="w-5 h-5" />,
    },
    {
        id: 'invoices',
        title: 'Invoices',
        description: 'Track sent, paid, and overdue invoices. We detect missing invoices and late payments automatically.',
        page: '/app/invoices',
        target: '[data-tutorial="invoices-header"]',
        position: 'bottom',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        id: 'settings',
        title: 'Settings',
        description: 'Configure your default hourly rates, cost rates, and alert thresholds. These affect how we calculate margins.',
        page: '/app/settings',
        target: '[data-tutorial="settings-form"]',
        position: 'bottom',
        icon: <Settings className="w-5 h-5" />,
    },
    {
        id: 'integrations',
        title: 'Integrations',
        description: 'Connect Stripe for automatic invoice sync, or Toggl/Clockify for time entries. Set it once, stay updated.',
        page: '/app/settings/integrations',
        target: '[data-tutorial="integrations-list"]',
        position: 'bottom',
        icon: <Plug className="w-5 h-5" />,
    },
    {
        id: 'complete',
        title: 'You\'re Ready!',
        description: 'Start by adding a client, then import your time entries and invoices. RETENU will automatically detect any revenue leaks.',
        tip: 'Questions? Check Settings for help or replay this tour.',
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
    const pathname = usePathname();
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [isNavigating, setIsNavigating] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const step = tutorialSteps[currentStep];

    // Handle page navigation
    useEffect(() => {
        if (step.page && pathname !== step.page) {
            setIsNavigating(true);
            setIsReady(false);
            router.push(step.page);
        } else if (pathname === step.page && !isReady) {
            // Already on the right page, just wait for render
            const timer = setTimeout(() => {
                setIsNavigating(false);
                setIsReady(true);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [currentStep, step.page, pathname, router, isReady]);

    // Wait for page to be ready after navigation
    useEffect(() => {
        if (pathname === step.page && isNavigating) {
            const timer = setTimeout(() => {
                setIsNavigating(false);
                setIsReady(true);
            }, 800); // Give page time to render
            return () => clearTimeout(timer);
        }
    }, [pathname, step.page, isNavigating]);

    // Update highlight position
    const updatePosition = useCallback(() => {
        if (!step.target || !isReady) return;

        const element = document.querySelector(step.target);
        if (element) {
            const rect = element.getBoundingClientRect();
            setHighlightPosition({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
        } else {
            // Element not found - reset to center mode
            setHighlightPosition({ top: 0, left: 0, width: 0, height: 0 });
        }
    }, [step.target, isReady]);

    // Position and scroll to target element
    useEffect(() => {
        if (!step.target || !isReady || isNavigating) return;

        // Retry finding element with exponential backoff
        let retryCount = 0;
        const maxRetries = 5;

        const tryFindElement = () => {
            const element = document.querySelector(step.target!);
            if (element) {
                updatePosition();
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Update position after scroll completes
                setTimeout(updatePosition, 400);
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(tryFindElement, 200 * retryCount);
            }
        };

        // Initial positioning with delay
        const initTimer = setTimeout(tryFindElement, 200);

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(initTimer);
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [currentStep, step.target, isReady, isNavigating, updatePosition]);

    const handleNext = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setIsReady(false);
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setIsReady(false);
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

        const padding = 24;
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
                if (top > viewportHeight - 300) {
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
                if (left > viewportWidth - 440) {
                    left = highlightPosition.left - padding;
                    transform = 'translate(-100%, -50%)';
                }
                break;
            case 'left':
                top = highlightPosition.top + highlightPosition.height / 2;
                left = highlightPosition.left - padding;
                transform = 'translate(-100%, -50%)';
                if (left < 440) {
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

    const hasHighlight = step.target && highlightPosition.width > 0 && isReady && !isNavigating;
    const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

    return (
        <AnimatePresence mode="wait">
            <div className="fixed inset-0 z-[100] pointer-events-none">
                {/* Dark overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-black/70"
                />

                {/* Highlight cutout */}
                {hasHighlight && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bg-transparent"
                        style={{
                            top: `${highlightPosition.top - 8}px`,
                            left: `${highlightPosition.left - 8}px`,
                            width: `${highlightPosition.width + 16}px`,
                            height: `${highlightPosition.height + 16}px`,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                            borderRadius: '12px',
                        }}
                    />
                )}

                {/* Highlight border with glow */}
                {hasHighlight && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="absolute rounded-xl pointer-events-none"
                        style={{
                            top: `${highlightPosition.top - 8}px`,
                            left: `${highlightPosition.left - 8}px`,
                            width: `${highlightPosition.width + 16}px`,
                            height: `${highlightPosition.height + 16}px`,
                            border: '2px solid #FF5733',
                            boxShadow: '0 0 20px rgba(255, 87, 51, 0.4), inset 0 0 20px rgba(255, 87, 51, 0.1)',
                        }}
                    />
                )}

                {/* Loading indicator during navigation */}
                {isNavigating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                        <div className="w-8 h-8 border-2 border-[#FF5733] border-t-transparent rounded-full animate-spin" />
                    </motion.div>
                )}

                {/* Tooltip Card */}
                <AnimatePresence mode="wait">
                    {isReady && !isNavigating && (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="absolute w-[420px] max-w-[calc(100vw-32px)] pointer-events-auto"
                            style={getTooltipStyle()}
                        >
                            <div className="bg-[#0f0f11] border border-[#2a2a2f] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1f] bg-[#111113]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF5733] to-[#E84118] flex items-center justify-center text-white shadow-lg shadow-[#FF5733]/20">
                                            {step.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-white">{step.title}</h3>
                                            <p className="text-xs text-gray-500">
                                                Step {currentStep + 1} of {tutorialSteps.length}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onSkip}
                                        className="p-2 text-gray-500 hover:text-white hover:bg-[#1c1c1f] rounded-lg transition-all"
                                        aria-label="Close tutorial"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="px-5 py-5">
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {step.description}
                                    </p>
                                    {step.tip && (
                                        <div className="mt-4 flex items-start gap-2.5 px-3.5 py-3 bg-[#FF5733]/5 rounded-lg border border-[#FF5733]/10">
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold text-[#FF5733] bg-[#FF5733]/10 rounded uppercase tracking-wider">
                                                Tip
                                            </span>
                                            <p className="text-xs text-gray-400 leading-relaxed">{step.tip}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Progress bar */}
                                <div className="px-5 pb-2">
                                    <div className="h-1.5 bg-[#1c1c1f] rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[#FF5733] to-[#FF8F33] rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.4, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between px-5 py-4 bg-[#0a0a0c]">
                                    <button
                                        onClick={onSkip}
                                        className="text-xs text-gray-500 hover:text-white transition-colors"
                                    >
                                        Skip tour
                                    </button>
                                    <div className="flex items-center gap-2">
                                        {currentStep > 0 && (
                                            <button
                                                onClick={handlePrevious}
                                                className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1c1c1f] rounded-lg transition-all inline-flex items-center gap-1.5"
                                            >
                                                <ArrowLeft className="w-3.5 h-3.5" />
                                                Back
                                            </button>
                                        )}
                                        <button
                                            onClick={handleNext}
                                            className="px-5 py-2.5 bg-gradient-to-r from-[#FF5733] to-[#E84118] hover:from-[#E84118] hover:to-[#D63C0E] text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-[#FF5733]/20 inline-flex items-center gap-2"
                                        >
                                            {currentStep === tutorialSteps.length - 1 ? (
                                                <>
                                                    Get Started
                                                    <Check className="w-4 h-4" />
                                                </>
                                            ) : (
                                                <>
                                                    Next
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onSkip}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative w-full max-w-md bg-[#0f0f11] border border-[#2a2a2f] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            >
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF5733] via-[#FF8F33] to-[#FF5733]" />

                {/* Header */}
                <div className="px-6 pt-8 pb-4 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF5733] to-[#E84118] flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[#FF5733]/30"
                    >
                        <DollarSign className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                        Welcome to RETENU
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
                            text: 'Find unbilled hours, scope creep, and late payments',
                            color: '#EF4444'
                        },
                        {
                            icon: <BarChart3 className="w-4 h-4" />,
                            title: 'Track Profitability',
                            text: 'Monitor margins and revenue health per client',
                            color: '#10B981'
                        },
                        {
                            icon: <Plug className="w-4 h-4" />,
                            title: 'Sync Automatically',
                            text: 'Connect Stripe, Toggl, or Clockify',
                            color: '#3B82F6'
                        },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className="flex items-start gap-3 p-3.5 bg-[#111113] rounded-xl border border-[#1c1c1f] hover:border-[#2a2a2f] transition-colors"
                        >
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                            >
                                {feature.icon}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{feature.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{feature.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Actions */}
                <div className="px-6 py-6 space-y-3 bg-[#0a0a0c]">
                    <button
                        onClick={onStart}
                        className="w-full px-4 py-3.5 bg-gradient-to-r from-[#FF5733] to-[#E84118] hover:from-[#E84118] hover:to-[#D63C0E] text-white font-medium rounded-xl transition-all shadow-lg shadow-[#FF5733]/20 inline-flex items-center justify-center gap-2 group"
                    >
                        Take a Quick Tour
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <button
                        onClick={onSkip}
                        className="w-full px-4 py-2.5 text-gray-500 hover:text-white text-sm transition-colors"
                    >
                        I&apos;ll explore on my own
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// Local storage key for tutorial completion
const TUTORIAL_COMPLETED_KEY = 'obsidian_tutorial_completed';
const TUTORIAL_COMPLETED_GUEST_KEY = 'obsidian_tutorial_completed_guest';

// Hook to manage tutorial state
export function useTutorial() {
    const [showWelcome, setShowWelcome] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (initialized) return;

        // Check if tutorial was completed
        const hasCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true';
        const isGuestMode = document.cookie.includes('guest_mode=true');
        const guestCompleted = isGuestMode && sessionStorage.getItem(TUTORIAL_COMPLETED_GUEST_KEY) === 'true';

        // Mark as initialized first
        setInitialized(true);

        // Only show welcome if tutorial hasn't been completed
        if (!hasCompleted && !guestCompleted) {
            // Small delay for page to settle
            const timer = setTimeout(() => {
                setShowWelcome(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [initialized]);

    const startTutorial = useCallback(() => {
        setShowWelcome(false);
        setTimeout(() => {
            setShowTutorial(true);
        }, 100);
    }, []);

    const completeTutorial = useCallback(() => {
        setShowTutorial(false);

        // Mark as completed
        const isGuestMode = document.cookie.includes('guest_mode=true');
        if (isGuestMode) {
            sessionStorage.setItem(TUTORIAL_COMPLETED_GUEST_KEY, 'true');
        } else {
            localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
        }
    }, []);

    const skipTutorial = useCallback(() => {
        setShowWelcome(false);
        setShowTutorial(false);

        // Mark as completed (skipping counts as completing)
        const isGuestMode = document.cookie.includes('guest_mode=true');
        if (isGuestMode) {
            sessionStorage.setItem(TUTORIAL_COMPLETED_GUEST_KEY, 'true');
        } else {
            localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
        }
    }, []);

    const replayTutorial = useCallback(() => {
        // Clear completion status
        localStorage.removeItem(TUTORIAL_COMPLETED_KEY);
        sessionStorage.removeItem(TUTORIAL_COMPLETED_GUEST_KEY);
        setShowWelcome(true);
    }, []);

    return {
        showWelcome,
        showTutorial,
        startTutorial,
        completeTutorial,
        skipTutorial,
        replayTutorial,
    };
}
