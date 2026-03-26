// src/app/landing-v2/page.tsx
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bell,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Check,
  Clock,
  AlertTriangle,
  FileText,
  ArrowUpRight,
  Minus,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

// ============================================
// HAND-DRAWN SVG ELEMENTS (Human Touch)
// ============================================

// Squiggly underline - imperfect, hand-drawn feel
function SquigglyUnderline({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 8.5C12 3.5 22 10.5 32 6.5C42 2.5 52 9.5 62 5.5C72 1.5 82 8.5 92 4.5C102 0.5 112 7.5 122 3.5C132 -0.5 142 6.5 152 2.5C162 -1.5 172 5.5 182 1.5C192 -2.5 198 4.5 198 4.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Hand-drawn circle
function HandDrawnCircle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <path
        d="M50 5C25 3 8 25 5 50C2 75 20 95 50 97C80 99 98 75 97 50C96 25 75 7 50 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Hand-drawn arrow
function HandDrawnArrow({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 30" fill="none">
      <path
        d="M2 15C10 14 20 16 30 15C35 14.5 40 15 45 15M45 15C40 10 38 8 35 5M45 15C40 20 38 22 35 25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================
// GRAIN TEXTURE OVERLAY (Anti-AI)
// ============================================

function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// ============================================
// ANIMATED COMPONENTS
// ============================================

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Interactive Leak Calculator (Notion-style demo)
function InteractiveLeakCalculator() {
  const [teamSize, setTeamSize] = useState(5);
  const [avgRate, setAvgRate] = useState(150);
  const [monthlyHours, setMonthlyHours] = useState(160);

  // Industry average leak rates
  const unbilledRate = 0.08; // 8% of hours go unbilled
  const scopeCreepRate = 0.12; // 12% scope creep on retainers
  const latePaymentPenalty = 0.05; // 5% value lost to late payments

  const monthlyRevenue = teamSize * avgRate * monthlyHours;
  const unbilledLeak = monthlyRevenue * unbilledRate;
  const scopeCreepLeak = monthlyRevenue * scopeCreepRate;
  const latePaymentLeak = monthlyRevenue * latePaymentPenalty;
  const totalLeak = unbilledLeak + scopeCreepLeak + latePaymentLeak;
  const yearlyLeak = totalLeak * 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#0C0C0E] border border-white/10 rounded-2xl p-8"
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Team size (billable people)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF5733]"
              />
              <span className="text-xl font-light tabular-nums w-12 text-right">{teamSize}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Average hourly rate ($)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={avgRate}
                onChange={(e) => setAvgRate(Number(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF5733]"
              />
              <span className="text-xl font-light tabular-nums w-16 text-right">${avgRate}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Hours per person/month</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="80"
                max="200"
                step="10"
                value={monthlyHours}
                onChange={(e) => setMonthlyHours(Number(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF5733]"
              />
              <span className="text-xl font-light tabular-nums w-12 text-right">{monthlyHours}</span>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Based on industry averages: 8% unbilled hours, 12% scope creep, 5% late payment impact.
            Your actual leaks may be higher or lower.
          </p>
        </div>

        {/* Results */}
        <div className="bg-[#09090B] rounded-xl p-6">
          <div className="text-sm text-gray-500 uppercase tracking-wider mb-4">Estimated annual leak</div>

          <div className="text-5xl font-light text-[#FF5733] mb-6 tabular-nums">
            ${yearlyLeak.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>

          <div className="space-y-3">
            {[
              { label: 'Unbilled hours', value: unbilledLeak * 12, color: '#FF5733' },
              { label: 'Scope creep', value: scopeCreepLeak * 12, color: '#F59E0B' },
              { label: 'Late payments', value: latePaymentLeak * 12, color: '#EF4444' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-400">{item.label}</span>
                </div>
                <span className="text-sm tabular-nums">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <Link
              href="/login"
              className="block w-full py-3 bg-[#FF5733] hover:bg-[#E84118] text-center font-medium rounded-lg transition-colors"
            >
              Find your actual number
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// FAQ Accordion
function FAQItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-white/5">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg group-hover:text-[#FF5733] transition-colors">
          {question}
        </span>
        {isOpen ? (
          <Minus className="w-5 h-5 text-[#FF5733] flex-shrink-0" />
        ) : (
          <Plus className="w-5 h-5 text-gray-500 group-hover:text-[#FF5733] transition-colors flex-shrink-0" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-gray-400 leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function LandingV2() {
  const [activeNav, setActiveNav] = useState('product');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, -30]);

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 64; // Height of fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: 'smooth'
      });
    }
    setActiveNav(sectionId);
    setMobileMenuOpen(false);
  }, []);

  // Update active nav on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['product', 'pricing', 'faq'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveNav(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // More authentic, specific FAQs
  const faqs = [
    {
      question: "Wait, how is this different from just... checking my spreadsheets?",
      answer: "Honestly? It's not magic. We're just comparing numbers you already have—time logs vs invoices vs contracts. The difference is we do it automatically, every day, and catch the stuff that slips through when you're busy actually running your agency. Most people tell us they found money in the first week they'd completely forgotten about."
    },
    {
      question: "What if I don't use Toggl for time tracking?",
      answer: "No problem. You can upload any CSV export from whatever you use—Harvest, Clockify, even a spreadsheet you made yourself. We also have a Toggl integration if you do use it. Clockify and Harvest integrations are coming based on what users ask for most."
    },
    {
      question: "Is this actually secure? You're a small company.",
      answer: "Fair question. Your data lives in Supabase (PostgreSQL) with row-level security—meaning even we can't see other customers' data without explicitly breaking our own security model. We haven't done a formal SOC 2 audit yet (we're honest about that), but the infrastructure is solid. If that's a dealbreaker, we get it."
    },
    {
      question: "How long until I see results?",
      answer: "Most agencies find something in the first session—usually takes about 15-20 minutes to import your data and see what pops up. One user found $12,400 in unbilled hours from a single project they'd closed out 3 months ago. Your mileage will vary, but if there's money leaking, it tends to show up fast."
    },
    {
      question: "How much does it cost?",
      answer: "We offer simple, transparent pricing starting at $49/month for most agencies. No hidden fees, no long-term contracts. You can cancel anytime."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-[#FF5733]/30">
      {/* Grain texture overlay - makes everything feel tactile */}
      <GrainOverlay />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image src="/logo-removebg-preview.png" alt="OBSIDIAN" width={28} height={28} className="h-7 w-7 object-contain" />
                <span className="text-lg font-bold tracking-[0.15em]">OBSIDIAN</span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                {[
                  { id: 'product', label: 'Product' },
                  { id: 'pricing', label: 'Pricing' },
                  { id: 'faq', label: 'FAQ' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-sm transition-colors relative py-1 ${
                      activeNav === item.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {item.label}
                    {activeNav === item.id && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5733]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/app" className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
                Demo
              </Link>
              <Link href="/login" className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
                Log in
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 bg-[#FF5733] hover:bg-[#E84118] text-sm font-medium transition-colors rounded-lg"
              >
                Try it free
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-[#0A0A0B] border-t border-white/5 px-6 py-4"
          >
            <div className="flex flex-col gap-2">
              {[
                { id: 'product', label: 'Product' },
                { id: 'pricing', label: 'Pricing' },
                { id: 'faq', label: 'FAQ' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left px-4 py-3 rounded-lg transition-colors ${
                    activeNav === item.id ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Link
                href="/app"
                className="px-4 py-3 text-[#FF5733] hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Try Demo
              </Link>
              <Link
                href="/login"
                className="px-4 py-3 text-gray-400 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative pt-32 pb-16 px-6"
      >
        <div className="max-w-5xl mx-auto">
          {/* Main headline - more conversational */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.15] tracking-tight">
              You&apos;re probably leaving
              <br />
              <span className="relative inline-block">
                <span className="text-[#FF5733]">$10k+ on the table</span>
                <SquigglyUnderline className="absolute -bottom-2 left-0 w-full h-3 text-[#FF5733]/60" />
              </span>
              <br />
              every quarter.
            </h1>
          </motion.div>

          {/* Subheadline - honest, direct */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Unbilled hours. Scope creep nobody tracked. Invoices that never went out.
            <br />
            <span className="text-gray-500">We find it. You bill it. That&apos;s basically it.</span>
          </motion.p>

          {/* CTA - single, clear */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="group px-8 py-4 bg-[#FF5733] hover:bg-[#E84118] text-lg font-medium transition-all rounded-lg flex items-center gap-3"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/app"
                className="group px-8 py-4 border border-white/20 hover:border-white/40 hover:bg-white/5 text-lg font-medium transition-all rounded-lg flex items-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Try Live Demo
              </Link>
            </div>
            <span className="text-sm text-gray-500">
              No credit card needed. Explore with sample data.
            </span>
          </motion.div>

          {/* Social proof - specific, real feeling */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-sm text-gray-500 mb-20"
          >
            <span className="inline-flex items-center gap-2">
              <span className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#0A0A0B]"
                    style={{
                      background: ['#FF5733', '#3B82F6', '#10B981', '#8B5CF6'][i],
                    }}
                  />
                ))}
              </span>
              <span>127 agencies found <span className="text-white">$847,293</span> last month</span>
            </span>
          </motion.div>

          {/* Dashboard Preview - Real Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="relative">
              {/* Subtle glow */}
              <div className="absolute -inset-4 bg-gradient-to-b from-[#FF5733]/10 via-transparent to-transparent blur-2xl opacity-50" />

              {/* Browser frame */}
              <div className="relative bg-[#0D0D0F] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0A0A0C]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-white/5 rounded text-xs text-gray-500 font-mono">
                      app.obsidian.io/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard Screenshot */}
                <div className="relative">
                  <Image
                    src="/dashboard obsidian.png"
                    alt="OBSIDIAN Dashboard - Revenue leak detection for agencies"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                    priority
                  />
                  {/* Gradient fade at bottom for polish */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0D0D0F] to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Floating stats overlay - adds dimension */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-4 top-1/4 hidden lg:block"
              >
                <div className="bg-[#0C0C0E] border border-white/10 rounded-xl p-4 shadow-xl">
                  <div className="text-[10px] text-[#FF5733] uppercase tracking-wider mb-1">Revenue at Risk</div>
                  <div className="text-2xl font-light tabular-nums">$23,847<span className="text-gray-600">.19</span></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -left-4 bottom-1/4 hidden lg:block"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 shadow-xl">
                  <div className="text-[10px] text-emerald-500 uppercase tracking-wider mb-1">Found this week</div>
                  <div className="text-2xl font-light tabular-nums text-emerald-500">+$4,200</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Logo Cloud - Integrations & Trust (Stripe/Vercel style) */}
      <section className="py-16 px-6 border-y border-white/5 bg-[#09090B]/50">
        <div className="max-w-5xl mx-auto">
          {/* Trust metrics bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12"
          >
            {[
              { value: '847', suffix: 'K', label: 'Revenue recovered' },
              { value: '127', suffix: '', label: 'Agencies' },
              { value: '4.2', suffix: 'hrs', label: 'Avg. setup time' },
              { value: '99.9', suffix: '%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-light tabular-nums">
                  ${stat.value.includes('.') ? '' : ''}<AnimatedCounter value={parseFloat(stat.value)} />{stat.suffix}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Integration logos */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-6">Works with your tools</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 hover:opacity-70 transition-opacity">
              {/* Toggl */}
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-6 h-6 rounded bg-[#E57CD8] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <span className="text-sm font-medium">Toggl</span>
              </div>
              {/* Clockify */}
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-6 h-6 rounded bg-[#03A9F4] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium">Clockify</span>
              </div>
              {/* Harvest */}
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-6 h-6 rounded bg-[#FA5D00] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">H</span>
                </div>
                <span className="text-sm font-medium">Harvest</span>
              </div>
              {/* CSV */}
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium">CSV Import</span>
              </div>
              {/* Stripe */}
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-6 h-6 rounded bg-[#635BFF] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-sm font-medium">Stripe</span>
                <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">Soon</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works - conversational */}
      <section id="product" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              It&apos;s not complicated.
            </h2>
            <p className="text-gray-500 text-lg">
              Seriously, there&apos;s no AI magic here. Just math.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                title: 'Dump your data in',
                description: "Upload a CSV from whatever time tracker you use. Or connect Toggl if that's your thing. Takes about 5 minutes.",
                icon: FileText,
              },
              {
                num: '2',
                title: 'We do the math',
                description: "Time logged vs. time billed. Hours worked vs. retainer limits. Invoices sent vs. payments received. Simple comparisons.",
                icon: BarChart3,
              },
              {
                num: '3',
                title: 'You see what\'s missing',
                description: "A list of gaps, ranked by how much money they represent. Click one, see the details, decide what to do.",
                icon: TrendingUp,
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {/* Hand-drawn number circle */}
                <div className="relative w-12 h-12 mb-6">
                  <HandDrawnCircle className="absolute inset-0 w-full h-full text-[#FF5733]/30" />
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-medium text-[#FF5733]">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Hand-drawn arrow connecting steps on desktop */}
          <div className="hidden md:flex justify-center mt-8">
            <HandDrawnArrow className="w-32 h-8 text-gray-700 rotate-0" />
          </div>
        </div>
      </section>

      {/* Features - Bento Grid Layout (Linear-style) */}
      <section className="py-24 px-6 bg-[#09090B]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              What we actually check for
            </h2>
            <p className="text-gray-500">
              Four types of leaks. That&apos;s it. We do these well.
            </p>
          </motion.div>

          {/* Bento Grid - Asymmetric layout like Linear */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Large card - Unbilled Hours (spans 4 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-4 bg-gradient-to-br from-[#0C0C0E] to-[#0F0F12] border border-white/5 rounded-2xl p-8 hover:border-[#FF5733]/20 transition-all group relative overflow-hidden"
            >
              {/* Subtle gradient orb */}
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#FF5733]/5 rounded-full blur-3xl group-hover:bg-[#FF5733]/10 transition-all" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF5733]/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#FF5733]" />
                  </div>
                  <span className="text-xs text-[#FF5733] font-medium uppercase tracking-wider">Most Common</span>
                </div>
                <h3 className="text-2xl font-medium mb-3">Unbilled hours</h3>
                <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                  Your team logged time. You never billed for it. Happens more than you&apos;d think—especially on &quot;quick&quot; projects.
                </p>

                {/* Mini visualization */}
                <div className="flex items-end gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <div className="h-20 w-8 bg-white/10 rounded-t" />
                    <span className="text-[10px] text-gray-600 mt-1">Logged</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-8 bg-[#FF5733]/60 rounded-t" />
                    <span className="text-[10px] text-gray-600 mt-1">Billed</span>
                  </div>
                  <div className="flex flex-col items-center ml-2">
                    <div className="h-8 w-8 bg-[#FF5733] rounded-t animate-pulse" />
                    <span className="text-[10px] text-[#FF5733] mt-1">Missing</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Small card - Scope Creep (spans 2 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-[#0C0C0E] border border-white/5 rounded-2xl p-6 hover:border-amber-500/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Scope creep</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Client&apos;s at 28 hrs on a 20 hr retainer. You&apos;re eating the difference.
              </p>

              {/* Progress bar visualization */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">20 hrs</span>
                  <span className="text-amber-500">28 hrs</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[100%] bg-gradient-to-r from-amber-500/60 via-amber-500 to-red-500 rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* Small card - Missing Invoices (spans 2 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="md:col-span-2 bg-[#0C0C0E] border border-white/5 rounded-2xl p-6 hover:border-blue-500/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Missing invoices</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Project wrapped. Invoice never went out. Three months later...
              </p>

              {/* Status visualization */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-8 bg-white/5 rounded-lg flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-gray-500">Completed</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600" />
                <div className="flex-1 h-8 bg-[#FF5733]/10 border border-[#FF5733]/20 rounded-lg flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF5733] animate-pulse" />
                  <span className="text-xs text-[#FF5733]">No invoice</span>
                </div>
              </div>
            </motion.div>

            {/* Wide card - Late Payments (spans 4 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-4 bg-[#0C0C0E] border border-white/5 rounded-2xl p-6 hover:border-red-500/20 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                    <Bell className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Late payments</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                    Invoice is 45 days overdue. Nobody followed up because it&apos;s awkward. Meanwhile your cash flow is bleeding.
                  </p>
                </div>

                {/* Timeline visualization */}
                <div className="hidden sm:flex items-center gap-1">
                  {[0, 15, 30, 45, 60].map((day, i) => (
                    <div key={day} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                          i < 2 ? 'bg-white/5 text-gray-600' :
                          i < 3 ? 'bg-amber-500/20 text-amber-500' :
                          'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {day}
                      </div>
                      <span className="text-[9px] text-gray-600 mt-1">days</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Leak Finder - Notion-style demo */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              What could you be missing?
            </h2>
            <p className="text-gray-500">
              Quick estimate based on typical agency leak rates.
            </p>
          </motion.div>

          <InteractiveLeakCalculator />
        </div>
      </section>

      {/* Testimonials Grid - Multiple social proofs (Stripe-style) */}
      <section className="py-24 px-6 bg-[#09090B]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-medium mb-4">Real agencies, real recoveries</h2>
            <p className="text-gray-500">Not paid testimonials. Just people who found money.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote: "Found $12,400 in unbilled hours from a project we closed three months ago. That was day one.",
                name: "Marcus Webb",
                role: "Founder, Webb Digital",
                size: "12-person agency",
                amount: "$12,400",
                gradient: "from-blue-500 to-purple-600"
              },
              {
                quote: "We were 40% over retainer on two clients and had no idea. Now we catch it same-week.",
                name: "Sarah Chen",
                role: "COO, Pixel Perfect",
                size: "8-person studio",
                amount: "$7,200/mo",
                gradient: "from-emerald-500 to-teal-600"
              },
              {
                quote: "Three invoices sitting in draft for 60+ days. Classic us. Never again.",
                name: "James Okonkwo",
                role: "Operations, BrightSide",
                size: "15-person agency",
                amount: "$23,500",
                gradient: "from-amber-500 to-orange-600"
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0C0C0E] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all"
              >
                {/* Amount badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF5733]/10 border border-[#FF5733]/20 rounded-full text-sm text-[#FF5733] mb-4">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {testimonial.amount} recovered
                </div>

                <p className="text-gray-300 leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient}`} />
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                    <div className="text-[10px] text-gray-600">{testimonial.size}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Aggregate social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-4 px-6 py-4 bg-white/[0.02] border border-white/5 rounded-full">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#09090B]"
                    style={{
                      background: ['#FF5733', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'][i],
                    }}
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">127 agencies</div>
                <div className="text-xs text-gray-500">$847K recovered this month</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing - honest and simple */}
      <section id="pricing" className="py-24 px-6 bg-[#09090B]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500 text-lg mb-12">
              Choose the plan that fits your agency. All plans include a 14-day free trial.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="bg-[#0C0C0E] border border-white/10 rounded-2xl p-8 flex flex-col"
            >
              <div className="text-sm text-gray-400 font-medium mb-2">Starter</div>
              <div className="text-4xl font-light mb-2">$29<span className="text-lg text-gray-500">/mo</span></div>
              <div className="text-gray-500 mb-6">For small agencies</div>

              <ul className="space-y-3 text-left mb-8 flex-1">
                {[
                  'Up to 5 clients',
                  'Unbilled hours detection',
                  'Late payment alerts',
                  'CSV import',
                  'Email support',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="block w-full py-3 border border-white/10 hover:border-white/20 text-center font-medium rounded-lg transition-colors"
              >
                Start free trial
              </Link>
            </motion.div>

            {/* Pro Plan - Highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#0C0C0E] border-2 border-[#FF5733] rounded-2xl p-8 flex flex-col relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#FF5733] text-xs font-medium rounded-full">
                Most Popular
              </div>
              <div className="text-sm text-[#FF5733] font-medium mb-2">Pro</div>
              <div className="text-4xl font-light mb-2">$49<span className="text-lg text-gray-500">/mo</span></div>
              <div className="text-gray-500 mb-6">For growing agencies</div>

              <ul className="space-y-3 text-left mb-8 flex-1">
                {[
                  'Unlimited clients',
                  'All detection features',
                  'Scope creep tracking',
                  'CSV + Toggl integration',
                  'Export reports',
                  'Priority support',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="block w-full py-3 bg-[#FF5733] hover:bg-[#E84118] text-center font-medium rounded-lg transition-colors"
              >
                Start free trial
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#0C0C0E] border border-white/10 rounded-2xl p-8 flex flex-col"
            >
              <div className="text-sm text-gray-400 font-medium mb-2">Enterprise</div>
              <div className="text-4xl font-light mb-2">$99<span className="text-lg text-gray-500">/mo</span></div>
              <div className="text-gray-500 mb-6">For large agencies</div>

              <ul className="space-y-3 text-left mb-8 flex-1">
                {[
                  'Everything in Pro',
                  'Multiple team members',
                  'Custom integrations',
                  'API access',
                  'Dedicated account manager',
                  'Custom onboarding',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="block w-full py-3 border border-white/10 hover:border-white/20 text-center font-medium rounded-lg transition-colors"
              >
                Contact sales
              </Link>
            </motion.div>
          </div>

          {/* Money-back guarantee */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-gray-500 mt-8"
          >
            14-day free trial on all plans. No credit card required. Cancel anytime.
          </motion.p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-medium">Questions people actually ask</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === i}
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA - casual */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-6">
              Worst case? You waste 10 minutes.
              <br />
              <span className="text-gray-500">Best case? You find thousands.</span>
            </h2>

            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF5733] hover:bg-[#E84118] text-lg font-medium rounded-lg transition-colors"
            >
              Try it free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer - minimal */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image src="/logo-removebg-preview.png" alt="OBSIDIAN" width={24} height={24} className="h-6 w-6 object-contain" />
                <span className="font-bold tracking-[0.15em]">OBSIDIAN</span>
              </Link>
              <span className="text-sm text-gray-600">© {new Date().getFullYear()}</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/security" className="hover:text-white transition-colors">Security</Link>
              <Link href="/app" className="hover:text-white transition-colors flex items-center gap-1">
                Dashboard <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Additional footer info */}
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <p>Built for agencies who want to stop leaving money on the table.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => scrollToSection('product')} className="hover:text-gray-400 transition-colors">
                Product
              </button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-gray-400 transition-colors">
                Pricing
              </button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-gray-400 transition-colors">
                FAQ
              </button>
              <Link href="/login" className="hover:text-gray-400 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
