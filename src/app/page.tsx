// src/app/page.tsx
import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { LogoCloud } from './components/landing/LogoCloud';
import { Features } from './components/landing/Features';
import { LeakExamples } from './components/landing/LeakExamples';
import { ROICalculator } from './components/landing/ROICalculator';
import { HowItWorks } from './components/landing/HowItWorks';
import { Testimonials } from './components/landing/Testimonials';
import { Pricing } from './components/landing/Pricing';
import { FAQ } from './components/landing/FAQ';
import { CTA } from './components/landing/CTA';
import { Footer } from './components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main>
        <Hero />
        <LogoCloud />
        <Features />
        <LeakExamples />
        <ROICalculator />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
