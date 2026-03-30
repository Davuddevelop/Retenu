// src/app/onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Building2,
    DollarSign,
    Link2,
    Users,
    Sparkles,
    Clock,
    FileText,
    Zap
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useData } from '../providers/DataProvider';

// Step components
interface StepProps {
    onNext: () => void;
    onBack?: () => void;
    onSkip?: () => void;
    data: OnboardingData;
    setData: (data: OnboardingData) => void;
}

interface OnboardingData {
    companyName: string;
    industry: string;
    teamSize: string;
    defaultHourlyRate: string;
    defaultCostRate: string;
    currency: string;
    integrationsConnected: string[];
    firstClientName: string;
    firstClientRetainer: string;
}

// Step 1: Welcome
function WelcomeStep({ onNext }: StepProps) {
    return (
        <div className="text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF5733] to-[#FF8C66] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-white mb-3">
                Welcome to Retenu
            </h1>
            <p className="text-gray-400 text-lg mb-8">
                Let's set up your account in under 2 minutes. We'll help you start
                tracking revenue leaks and protecting your agency's profits.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10 text-left">
                <div className="bg-[#111113] border border-[#1c1c1f] rounded-lg p-4">
                    <Clock className="w-5 h-5 text-[#FF5733] mb-2" />
                    <p className="text-sm text-white font-medium">Track Time</p>
                    <p className="text-xs text-gray-500">Import from Toggl, Clockify</p>
                </div>
                <div className="bg-[#111113] border border-[#1c1c1f] rounded-lg p-4">
                    <FileText className="w-5 h-5 text-[#FF5733] mb-2" />
                    <p className="text-sm text-white font-medium">Monitor Invoices</p>
                    <p className="text-xs text-gray-500">Sync with Stripe</p>
                </div>
                <div className="bg-[#111113] border border-[#1c1c1f] rounded-lg p-4">
                    <Zap className="w-5 h-5 text-[#FF5733] mb-2" />
                    <p className="text-sm text-white font-medium">Detect Leaks</p>
                    <p className="text-xs text-gray-500">Automated alerts</p>
                </div>
            </div>

            <button
                onClick={onNext}
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
                Get Started
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}

// Step 2: Company Profile
function CompanyStep({ onNext, onBack, data, setData }: StepProps) {
    const industries = [
        'Digital Agency',
        'Creative Agency',
        'Development Agency',
        'Marketing Agency',
        'Consulting',
        'Freelancer',
        'Other'
    ];

    const teamSizes = [
        'Just me',
        '2-5 people',
        '6-15 people',
        '16-50 people',
        '50+ people'
    ];

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-2">
                Tell us about your business
            </h2>
            <p className="text-gray-400 mb-8">
                This helps us customize your experience.
            </p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Company / Agency Name
                    </label>
                    <input
                        type="text"
                        value={data.companyName}
                        onChange={(e) => setData({ ...data, companyName: e.target.value })}
                        placeholder="Acme Agency"
                        className="w-full bg-[#111113] border border-[#1c1c1f] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#333] focus:ring-1 focus:ring-[#333]"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        What type of work do you do?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {industries.map((industry) => (
                            <button
                                key={industry}
                                onClick={() => setData({ ...data, industry })}
                                className={`px-4 py-2.5 rounded-lg text-sm text-left transition-all ${
                                    data.industry === industry
                                        ? 'bg-white text-black font-medium'
                                        : 'bg-[#111113] border border-[#1c1c1f] text-gray-300 hover:border-[#333]'
                                }`}
                            >
                                {industry}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Team size
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {teamSizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => setData({ ...data, teamSize: size })}
                                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                                    data.teamSize === size
                                        ? 'bg-white text-black font-medium'
                                        : 'bg-[#111113] border border-[#1c1c1f] text-gray-300 hover:border-[#333]'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-10">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// Step 3: Set Rates
function RatesStep({ onNext, onBack, data, setData }: StepProps) {
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

    const margin = data.defaultHourlyRate && data.defaultCostRate
        ? Math.round((1 - parseFloat(data.defaultCostRate) / parseFloat(data.defaultHourlyRate)) * 100)
        : 0;

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-2">
                Set your default rates
            </h2>
            <p className="text-gray-400 mb-8">
                These are used to calculate margins and detect underbilling. You can customize per-client later.
            </p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Default hourly rate (what you charge clients)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                            type="number"
                            value={data.defaultHourlyRate}
                            onChange={(e) => setData({ ...data, defaultHourlyRate: e.target.value })}
                            placeholder="150"
                            className="w-full bg-[#111113] border border-[#1c1c1f] rounded-lg pl-8 pr-16 py-3 text-white focus:outline-none focus:border-[#333]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/hour</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Internal cost rate (your actual cost per hour)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                            type="number"
                            value={data.defaultCostRate}
                            onChange={(e) => setData({ ...data, defaultCostRate: e.target.value })}
                            placeholder="60"
                            className="w-full bg-[#111113] border border-[#1c1c1f] rounded-lg pl-8 pr-16 py-3 text-white focus:outline-none focus:border-[#333]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/hour</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Include salary, benefits, overhead. Used to calculate true profit margins.
                    </p>
                </div>

                {margin > 0 && (
                    <div className="bg-[#111113] border border-[#1c1c1f] rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Your target margin</span>
                            <span className="text-lg font-medium text-emerald-400">{margin}%</span>
                        </div>
                        <div className="mt-2 h-2 bg-[#1c1c1f] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                                style={{ width: `${Math.min(100, margin)}%` }}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Currency
                    </label>
                    <div className="flex gap-2">
                        {currencies.map((currency) => (
                            <button
                                key={currency}
                                onClick={() => setData({ ...data, currency })}
                                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                                    data.currency === currency
                                        ? 'bg-white text-black font-medium'
                                        : 'bg-[#111113] border border-[#1c1c1f] text-gray-300 hover:border-[#333]'
                                }`}
                            >
                                {currency}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-10">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// Step 4: Connect Integrations
function IntegrationsStep({ onNext, onBack, onSkip, data, setData }: StepProps) {
    const integrations = [
        {
            id: 'toggl',
            name: 'Toggl Track',
            description: 'Import time entries automatically',
            icon: '⏱️',
            color: '#E57CD8'
        },
        {
            id: 'clockify',
            name: 'Clockify',
            description: 'Sync time tracking data',
            icon: '🕐',
            color: '#03A9F4'
        },
        {
            id: 'stripe',
            name: 'Stripe',
            description: 'Sync invoices and payments',
            icon: '💳',
            color: '#635BFF'
        }
    ];

    const toggleIntegration = (id: string) => {
        const current = data.integrationsConnected;
        if (current.includes(id)) {
            setData({ ...data, integrationsConnected: current.filter(i => i !== id) });
        } else {
            setData({ ...data, integrationsConnected: [...current, id] });
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-2">
                Connect your tools
            </h2>
            <p className="text-gray-400 mb-8">
                Import existing data automatically. You can always connect more later.
            </p>

            <div className="space-y-3">
                {integrations.map((integration) => (
                    <button
                        key={integration.id}
                        onClick={() => toggleIntegration(integration.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                            data.integrationsConnected.includes(integration.id)
                                ? 'bg-white/5 border-white/20'
                                : 'bg-[#111113] border-[#1c1c1f] hover:border-[#333]'
                        }`}
                    >
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${integration.color}15` }}
                        >
                            {integration.icon}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-white">{integration.name}</p>
                            <p className="text-sm text-gray-500">{integration.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            data.integrationsConnected.includes(integration.id)
                                ? 'bg-white border-white'
                                : 'border-[#333]'
                        }`}>
                            {data.integrationsConnected.includes(integration.id) && (
                                <Check className="w-4 h-4 text-black" />
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
                You'll configure credentials after completing setup.
            </p>

            <div className="flex items-center justify-between mt-10">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onSkip}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        Skip for now
                    </button>
                    <button
                        onClick={onNext}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Step 5: First Client
function FirstClientStep({ onNext, onBack, onSkip, data, setData }: StepProps) {
    const hoursPerMonth = data.firstClientRetainer && data.defaultHourlyRate
        ? Math.round(parseFloat(data.firstClientRetainer) / parseFloat(data.defaultHourlyRate))
        : 0;

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-2">
                Add your first client
            </h2>
            <p className="text-gray-400 mb-8">
                Start tracking revenue for a client. You can add more anytime.
            </p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Client name
                    </label>
                    <input
                        type="text"
                        value={data.firstClientName}
                        onChange={(e) => setData({ ...data, firstClientName: e.target.value })}
                        placeholder="e.g., Acme Corp"
                        className="w-full bg-[#111113] border border-[#1c1c1f] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#333]"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Monthly retainer
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                            type="number"
                            value={data.firstClientRetainer}
                            onChange={(e) => setData({ ...data, firstClientRetainer: e.target.value })}
                            placeholder="5000"
                            className="w-full bg-[#111113] border border-[#1c1c1f] rounded-lg pl-8 pr-16 py-3 text-white focus:outline-none focus:border-[#333]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/month</span>
                    </div>
                </div>

                {hoursPerMonth > 0 && data.firstClientName && (
                    <div className="bg-[#111113] border border-[#1c1c1f] rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-2">Quick insight</p>
                        <p className="text-white">
                            At ${data.defaultHourlyRate}/hr, this retainer covers{' '}
                            <span className="text-[#FF5733] font-medium">{hoursPerMonth} hours</span>{' '}
                            per month.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-10">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onSkip}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        Skip for now
                    </button>
                    <button
                        onClick={onNext}
                        disabled={!data.firstClientName || !data.firstClientRetainer}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Complete Setup
                        <Check className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main Onboarding Component
export default function OnboardingPage() {
    const router = useRouter();
    const { organizationId, refreshData } = useData();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [data, setData] = useState<OnboardingData>({
        companyName: '',
        industry: '',
        teamSize: '',
        defaultHourlyRate: '150',
        defaultCostRate: '60',
        currency: 'USD',
        integrationsConnected: [],
        firstClientName: '',
        firstClientRetainer: '',
    });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Load existing org data
    useEffect(() => {
        async function loadOrgData() {
            if (!organizationId) return;

            const { data: org } = await supabase
                .from('organizations')
                .select('name')
                .eq('id', organizationId)
                .single();

            if (org?.name && !org.name.includes("'s Agency")) {
                setData(prev => ({ ...prev, companyName: org.name }));
            }
        }
        loadOrgData();
    }, [organizationId, supabase]);

    const steps = [
        { id: 'welcome', label: 'Welcome', icon: Sparkles },
        { id: 'company', label: 'Company', icon: Building2 },
        { id: 'rates', label: 'Rates', icon: DollarSign },
        { id: 'integrations', label: 'Connect', icon: Link2 },
        { id: 'client', label: 'First Client', icon: Users },
    ];

    const handleComplete = async () => {
        setIsSubmitting(true);

        try {
            // Update organization name
            if (organizationId && data.companyName) {
                await supabase
                    .from('organizations')
                    .update({ name: data.companyName })
                    .eq('id', organizationId);
            }

            // Update financial settings
            if (organizationId) {
                await supabase
                    .from('financial_settings')
                    .upsert({
                        organization_id: organizationId,
                        default_internal_hourly_rate: parseFloat(data.defaultHourlyRate) || 150,
                        default_internal_cost_rate: parseFloat(data.defaultCostRate) || 60,
                        currency: data.currency,
                    }, { onConflict: 'organization_id' });
            }

            // Create first client if provided
            if (organizationId && data.firstClientName && data.firstClientRetainer) {
                await supabase.from('clients').insert({
                    organization_id: organizationId,
                    name: data.firstClientName,
                    agreed_monthly_retainer: parseFloat(data.firstClientRetainer),
                    status: 'active',
                    start_date: new Date().toISOString().split('T')[0],
                });
            }

            // Mark onboarding as complete
            localStorage.setItem('retenu_onboarding_complete', 'true');

            // Store integration preferences for later
            if (data.integrationsConnected.length > 0) {
                localStorage.setItem('retenu_pending_integrations', JSON.stringify(data.integrationsConnected));
            }

            await refreshData();

            // Redirect to dashboard or integrations
            if (data.integrationsConnected.length > 0) {
                router.push('/app/settings/integrations?from=onboarding');
            } else {
                router.push('/app');
            }
        } catch (error) {
            console.error('Onboarding error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentStep === steps.length - 1) {
            handleComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    const handleSkip = () => {
        if (currentStep === steps.length - 1) {
            // Skip first client, just complete
            setData(prev => ({ ...prev, firstClientName: '', firstClientRetainer: '' }));
            handleComplete();
        } else {
            handleNext();
        }
    };

    const stepProps: StepProps = {
        onNext: handleNext,
        onBack: handleBack,
        onSkip: handleSkip,
        data,
        setData,
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex flex-col">
            {/* Progress Header */}
            <div className="border-b border-[#1c1c1f] bg-[#0a0a0b]/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#FF5733] to-[#FF8C66] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">R</span>
                            </div>
                            <span className="text-white font-medium">Retenu</span>
                        </div>
                        <span className="text-sm text-gray-500">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex-1 flex items-center">
                                <div className={`flex items-center gap-2 ${
                                    index <= currentStep ? 'text-white' : 'text-gray-600'
                                }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                                        index < currentStep
                                            ? 'bg-emerald-500 text-white'
                                            : index === currentStep
                                                ? 'bg-white text-black'
                                                : 'bg-[#1c1c1f] text-gray-500'
                                    }`}>
                                        {index < currentStep ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <step.icon className="w-4 h-4" />
                                        )}
                                    </div>
                                    <span className="text-xs hidden sm:block">{step.label}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                                        index < currentStep ? 'bg-emerald-500' : 'bg-[#1c1c1f]'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                {isSubmitting ? (
                    <div className="text-center">
                        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Setting up your account...</p>
                    </div>
                ) : (
                    <>
                        {currentStep === 0 && <WelcomeStep {...stepProps} />}
                        {currentStep === 1 && <CompanyStep {...stepProps} />}
                        {currentStep === 2 && <RatesStep {...stepProps} />}
                        {currentStep === 3 && <IntegrationsStep {...stepProps} />}
                        {currentStep === 4 && <FirstClientStep {...stepProps} />}
                    </>
                )}
            </div>
        </div>
    );
}
