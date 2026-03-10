// src/app/components/Tutorial.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, TrendingUp, AlertTriangle, Users, Check, Settings, BarChart3, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    page: string; // Which page to navigate to
    target?: string; // CSS selector for element to highlight
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    icon: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to RevenueLeak',
        description: 'RevenueLeak helps you detect and recover lost revenue from underbilling, scope creep, and late payments. Let\'s explore the key features.',
        page: '/app',
        position: 'center',
        icon: <DollarSign className="w-6 h-6" />,
    },
    {
        id: 'dashboard-metrics',
        title: 'Track Your Revenue Health',
        description: 'See your total revenue, detected leakage, and margin at a glance. The red card shows how much money you\'re losing - this is what we help you recover.',
        page: '/app',
        target: '[data-tutorial="metrics"]',
        position: 'bottom',
        icon: <BarChart3 className="w-6 h-6" />,
    },
    {
        id: 'alerts',
        title: 'Revenue Alerts',
        description: 'Every alert represents money you can recover. Click on alerts to see details and take action. We automatically detect unbilled work, over-hours, missing invoices, and overdue payments.',
        page: '/app',
        target: '[data-tutorial="alerts"]',
        position: 'top',
        icon: <AlertTriangle className="w-6 h-6" />,
    },
    {
        id: 'clients-page',
        title: 'Manage Your Clients',
        description: 'Add clients here to start tracking their revenue health. For each client, you can see their profitability, upload time entries, and track invoices.',
        page: '/app/clients',
        target: '[data-tutorial="clients-list"]',
        position: 'bottom',
        icon: <Users className="w-6 h-6" />,
    },
    {
        id: 'settings',
        title: 'Configure Your Settings',
        description: 'Set your hourly rates, cost rates, and alert thresholds here. These settings help us accurately detect revenue leaks for your business.',
        page: '/app/settings',
        target: '[data-tutorial="settings-form"]',
        position: 'bottom',
        icon: <Settings className="w-6 h-6" />,
    },
    {
        id: 'complete',
        title: 'You\'re Ready to Start!',
        description: 'Add your first client and start detecting revenue leaks. On average, agencies recover $47,000/year using RevenueLeak.',
        page: '/app',
        position: 'center',
        icon: <Check className="w-6 h-6" />,
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
        // Navigate to the page for this step
        if (step.page && window.location.pathname !== step.page) {
            setIsNavigating(true);
            router.push(step.page);
            // Wait for navigation
            setTimeout(() => {
                setIsNavigating(false);
            }, 300);
        }
    }, [currentStep, step.page, router]);

    useEffect(() => {
        if (step.target && !isNavigating) {
            // Wait a bit for the page to render
            setTimeout(() => {
                const element = document.querySelector(step.target!);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    setHighlightPosition({
                        top: rect.top + window.scrollY,
                        left: rect.left + window.scrollX,
                        width: rect.width,
                        height: rect.height,
                    });
                    // Scroll element into view
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 400);
        }
    }, [currentStep, step.target, isNavigating]);

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

    const handleSkip = () => {
        onSkip();
    };

    const getTooltipPosition = () => {
        if (step.position === 'center' || !step.target || highlightPosition.width === 0) {
            return {
                position: 'fixed' as const,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        }

        const baseStyle: React.CSSProperties = {
            position: 'fixed' as const,
        };

        const padding = 20;

        switch (step.position) {
            case 'bottom':
                return {
                    ...baseStyle,
                    top: `${highlightPosition.top + highlightPosition.height + padding}px`,
                    left: `${highlightPosition.left + highlightPosition.width / 2}px`,
                    transform: 'translateX(-50%)',
                };
            case 'top':
                return {
                    ...baseStyle,
                    top: `${highlightPosition.top - padding}px`,
                    left: `${highlightPosition.left + highlightPosition.width / 2}px`,
                    transform: 'translate(-50%, -100%)',
                };
            case 'right':
                return {
                    ...baseStyle,
                    top: `${highlightPosition.top + highlightPosition.height / 2}px`,
                    left: `${highlightPosition.left + highlightPosition.width + padding}px`,
                    transform: 'translateY(-50%)',
                };
            case 'left':
                return {
                    ...baseStyle,
                    top: `${highlightPosition.top + highlightPosition.height / 2}px`,
                    left: `${highlightPosition.left - padding}px`,
                    transform: 'translate(-100%, -50%)',
                };
            default:
                return baseStyle;
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50">
                {/* Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Highlight area */}
                {step.target && highlightPosition.width > 0 && !isNavigating && (
                    <>
                        {/* Animated pulsing ring */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="absolute rounded-2xl"
                            style={{
                                top: `${highlightPosition.top - 8}px`,
                                left: `${highlightPosition.left - 8}px`,
                                width: `${highlightPosition.width + 16}px`,
                                height: `${highlightPosition.height + 16}px`,
                                pointerEvents: 'none',
                                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3)',
                            }}
                        />

                        {/* Clear spotlight */}
                        <div
                            className="absolute rounded-2xl"
                            style={{
                                top: `${highlightPosition.top}px`,
                                left: `${highlightPosition.left}px`,
                                width: `${highlightPosition.width}px`,
                                height: `${highlightPosition.height}px`,
                                pointerEvents: 'none',
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                            }}
                        />
                    </>
                )}

                {/* Tooltip */}
                <motion.div
                    key={step.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: isNavigating ? 0.3 : 0 }}
                    className="absolute max-w-lg w-full px-4"
                    style={getTooltipPosition()}
                >
                    <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl p-6 shadow-2xl relative">
                        {/* Gradient accent */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--neutral-metric)]/5 to-transparent rounded-2xl pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={handleSkip}
                            className="absolute top-4 right-4 text-gray-400 hover:text-[var(--foreground)] transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="relative">
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--leak)] to-orange-400 flex items-center justify-center text-white mb-4 shadow-lg">
                                {step.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3 pr-8">
                                {step.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                {step.description}
                            </p>

                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                    <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
                                    <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {tutorialSteps.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                index === currentStep
                                                    ? 'flex-1 bg-gradient-to-r from-[var(--leak)] to-orange-400'
                                                    : index < currentStep
                                                    ? 'w-1.5 bg-[var(--profit)]'
                                                    : 'w-1.5 bg-[var(--border)]'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between gap-3">
                                <button
                                    onClick={handleSkip}
                                    className="text-sm text-gray-400 hover:text-[var(--foreground)] transition-colors font-medium"
                                >
                                    Skip tutorial
                                </button>
                                <div className="flex items-center gap-2">
                                    {currentStep > 0 && (
                                        <button
                                            onClick={handlePrevious}
                                            className="px-4 py-2.5 text-sm font-medium text-[var(--foreground)] border border-[var(--border)] rounded-xl hover:bg-[var(--background)] transition-all inline-flex items-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-[var(--leak)] to-orange-400 text-white rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-lg"
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
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// Welcome Modal (shown before tutorial)
interface WelcomeModalProps {
    onStart: () => void;
    onSkip: () => void;
}

export function WelcomeModal({ onStart, onSkip }: WelcomeModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onSkip}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-lg w-full bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl p-8 shadow-2xl"
            >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--leak)]/10 via-transparent to-[var(--neutral-metric)]/5 rounded-2xl pointer-events-none" />

                <div className="relative">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--leak)] to-orange-400 flex items-center justify-center text-white mb-6 mx-auto shadow-xl">
                        <DollarSign className="w-10 h-10" />
                    </div>

                    {/* Content */}
                    <h2 className="text-3xl font-bold text-[var(--foreground)] text-center mb-3">
                        Welcome to RevenueLeak
                    </h2>
                    <p className="text-gray-400 text-center mb-8 leading-relaxed text-lg">
                        Recover lost revenue from underbilling, scope creep, and late payments.
                    </p>

                    {/* Features list */}
                    <div className="space-y-4 mb-8">
                        {[
                            {
                                icon: <BarChart3 className="w-5 h-5" />,
                                title: 'Track Revenue Health',
                                text: 'See exactly where money is leaking in real-time'
                            },
                            {
                                icon: <AlertTriangle className="w-5 h-5" />,
                                title: 'Smart Alerts',
                                text: 'Get notified about underbilling and scope creep instantly'
                            },
                            {
                                icon: <TrendingUp className="w-5 h-5" />,
                                title: '$47K Average Recovery',
                                text: 'Agencies recover $47,000/year on average'
                            },
                        ].map((feature, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--leak)] to-orange-400 flex items-center justify-center text-white flex-shrink-0">
                                    {feature.icon}
                                </div>
                                <div className="flex-1 pt-1">
                                    <p className="text-sm font-semibold text-[var(--foreground)] mb-0.5">{feature.title}</p>
                                    <p className="text-sm text-gray-400">{feature.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onStart}
                            className="w-full px-6 py-3.5 bg-gradient-to-r from-[var(--leak)] to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition-all inline-flex items-center justify-center gap-2 group shadow-lg"
                        >
                            Start Quick Tour
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={onSkip}
                            className="w-full px-6 py-3 text-gray-400 hover:text-[var(--foreground)] font-medium rounded-xl transition-colors"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Hook to manage tutorial state
export function useTutorial() {
    const [showWelcome, setShowWelcome] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        // Check if user has seen tutorial
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial) {
            // Small delay to let page load
            setTimeout(() => {
                setShowWelcome(true);
            }, 500);
        }
    }, []);

    const startTutorial = () => {
        setShowWelcome(false);
        setShowTutorial(true);
    };

    const completeTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem('hasSeenTutorial', 'true');
    };

    const skipTutorial = () => {
        setShowWelcome(false);
        setShowTutorial(false);
        localStorage.setItem('hasSeenTutorial', 'true');
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
