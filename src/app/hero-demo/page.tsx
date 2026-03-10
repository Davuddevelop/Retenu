import React from 'react';
import ResponsiveHeroBanner from '../../components/ui/responsive-hero-banner';

export default function HeroDemo() {
    return (
        <ResponsiveHeroBanner
            badgeLabel="New"
            badgeText="AI-Powered Revenue Leak Detection"
            title="Stop Losing Revenue"
            titleLine2="Before It's Too Late"
            description="RevenueLeak automatically detects billing errors, undercharging, and missed invoices in real-time. Agencies recover an average of $47,000/year in lost revenue."
            primaryButtonText="Start Free Trial"
            primaryButtonHref="/login"
            secondaryButtonText="Watch Demo"
            secondaryButtonHref="#demo"
            ctaButtonText="Get Started"
            ctaButtonHref="/login"
            partnersTitle="Trusted by leading agencies worldwide"
            partners={[
                { name: "Stripe", href: "#" },
                { name: "QuickBooks", href: "#" },
                { name: "Toggl", href: "#" },
                { name: "Harvest", href: "#" },
                { name: "Clockify", href: "#" }
            ]}
        />
    );
}
