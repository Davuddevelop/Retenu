// src/app/components/OnboardingCheck.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useData } from '../providers/DataProvider';

interface OnboardingCheckProps {
    children: React.ReactNode;
}

export function OnboardingCheck({ children }: OnboardingCheckProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isDemoMode, hasData, isInitialized, settings } = useData();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Skip check if already on onboarding page
        if (pathname?.startsWith('/app/onboarding')) {
            setIsChecking(false);
            return;
        }

        // Wait for data to initialize
        if (!isInitialized) {
            return;
        }

        // Demo/guest users skip onboarding
        if (isDemoMode) {
            setIsChecking(false);
            return;
        }

        // Check if onboarding is complete
        const onboardingComplete = localStorage.getItem('retenu_onboarding_complete') === 'true';

        // If real user hasn't completed onboarding, redirect
        if (!onboardingComplete && !hasData) {
            // Also check if they have customized settings (rates != defaults)
            const hasCustomizedSettings = settings && (
                settings.default_internal_hourly_rate !== 150 ||
                settings.default_internal_cost_rate !== 60
            );

            if (!hasCustomizedSettings) {
                router.replace('/app/onboarding');
                return;
            }
        }

        setIsChecking(false);
    }, [isInitialized, isDemoMode, hasData, settings, pathname, router]);

    // Show loading state while checking
    if (isChecking && !pathname?.startsWith('/app/onboarding')) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-600 border-t-white" />
            </div>
        );
    }

    return <>{children}</>;
}
