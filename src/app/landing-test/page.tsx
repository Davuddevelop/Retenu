// src/app/landing-test/page.tsx
'use client';

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check, TrendingUp, Shield, Zap, Clock, ChevronRight } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

// Animated number counter
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
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

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// Magnetic button effect
function MagneticButton({ children, className, href }: { children: React.ReactNode; className?: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.a>
  );
}

export default function LandingTest() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(heroProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 0.5], [1, 0.95]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <div className="relative bg-[#0A0A0A] text-white min-h-screen">
      {/* Grain Overlay */}
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none z-50">
        <svg className="w-full h-full">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)"/>
        </svg>
      </div>

      {/* Gradient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          style={{ y: parallaxY }}
          className="absolute -top-1/4 left-1/4 w-[1000px] h-[1000px] rounded-full"
        >
          <div className="absolute inset-0 bg-[#FF5733]/8 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        </motion.div>
        <motion.div
          style={{ y: parallaxY }}
          className="absolute top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full"
        >
          <div className="absolute inset-0 bg-[#FF8C00]/6 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Navigation - Ultra Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-40">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="h-20 flex items-center justify-between border-b border-white/[0.03]">
            <Link href="/" className="relative group">
              <span className="font-semibold text-lg tracking-tight">RevenueLeak</span>
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-[#FF5733] to-[#FF8C00] group-hover:w-full transition-all duration-300" />
            </Link>

            <div className="hidden md:flex items-center gap-10 text-[15px]">
              <a href="#how" className="text-white/40 hover:text-white transition-colors duration-300">How it works</a>
              <a href="#pricing" className="text-white/40 hover:text-white transition-colors duration-300">Pricing</a>
              <a href="#customers" className="text-white/40 hover:text-white transition-colors duration-300">Customers</a>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-[15px] text-white/60 hover:text-white transition-colors">
                Sign in
              </Link>
              <MagneticButton
                href="/login"
                className="relative px-5 py-2.5 text-[15px] font-medium overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#FF5733] to-[#FF8C00] rounded-full" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#FF8C00] to-[#FFB84D] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Get Started</span>
              </MagneticButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Asymmetric Layout */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center pt-32 pb-20"
      >
        <div className="max-w-[1400px] mx-auto px-8 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column - 7 cols */}
            <div className="lg:col-span-7 space-y-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-3 text-sm text-white/40 mb-8">
                  <div className="px-3 py-1 rounded-full bg-[#FF5733]/10 border border-[#FF5733]/20">
                    <span className="text-[#FF5733]">Early Access</span>
                  </div>
                  <span>Now in beta</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(3rem,8vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.03em]"
              >
                Find the money
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-gradient-to-r from-[#FF5733] via-[#FF8C00] to-[#FFB84D] bg-clip-text">
                    you&apos;re leaving
                  </span>
                </span>
                <br />
                on the table
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl text-white/40 leading-relaxed max-w-lg"
              >
                Agencies lose 4-10% of revenue to unbilled hours,
                scope creep, and missed invoices. We help you find it.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                <MagneticButton
                  href="/login"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 text-lg font-medium"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#FF5733] to-[#FF8C00] rounded-xl" />
                  <span className="absolute inset-0 bg-gradient-to-r from-[#FF8C00] to-[#FFB84D] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute inset-[1px] bg-gradient-to-b from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-3">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </MagneticButton>

                <a href="#demo" className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors">
                    <div className="w-0 h-0 border-l-[8px] border-l-white/80 border-y-[5px] border-y-transparent ml-1" />
                  </div>
                  <span>Watch demo</span>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex items-center gap-8 pt-8 border-t border-white/[0.03]"
              >
                {[
                  { icon: Check, text: '14-day free trial' },
                  { icon: Check, text: 'No credit card' },
                  { icon: Check, text: '5-minute setup' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/30">
                    <item.icon className="w-4 h-4 text-[#FF5733]" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column - 5 cols - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              {/* Floating Card */}
              <div className="relative">
                {/* Outer glow */}
                <div className="absolute -inset-4 bg-gradient-to-b from-[#FF5733]/20 to-transparent blur-3xl opacity-50" />

                {/* Card */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-2xl" />
                  <div className="relative bg-[#111]/90 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden">
                    {/* Card Header */}
                    <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-[#FF5733]/80" />
                        <span className="text-sm font-medium text-white/60">Revenue Analysis</span>
                      </div>
                      <div className="text-xs text-white/30">Live</div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-6">
                      {/* Main Metric */}
                      <div className="space-y-1">
                        <div className="text-sm text-white/40">Revenue at Risk</div>
                        <div className="text-4xl font-bold tracking-tight">
                          $<AnimatedCounter value={12847} />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#FF5733]">+23%</span>
                          <span className="text-white/30">vs last month</span>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-3">
                        {[
                          { label: 'Unbilled Hours', amount: 4230, percent: 33, color: '#FF5733' },
                          { label: 'Scope Creep', amount: 3890, percent: 30, color: '#FF8C00' },
                          { label: 'Late Payments', amount: 2940, percent: 23, color: '#FFB84D' },
                          { label: 'Missing Invoices', amount: 1787, percent: 14, color: '#FFCC80' },
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                            className="group"
                          >
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="text-white/50 group-hover:text-white/70 transition-colors">{item.label}</span>
                              <span className="font-medium">${item.amount.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percent}%` }}
                                transition={{ duration: 1, delay: 1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Action */}
                      <button className="w-full py-3 bg-gradient-to-r from-[#FF5733] to-[#FF8C00] rounded-lg text-sm font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2 group">
                        <span>Recover Now</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <motion.div
                  initial={{ opacity: 0, y: 20, x: -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                  className="absolute -left-8 bottom-24 bg-[#111]/95 backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 shadow-2xl shadow-black/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Issue Resolved</div>
                      <div className="text-xs text-white/40">$2,340 recovered</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Logo Cloud - Subtle Trust Indicators */}
      <section className="relative py-20 border-y border-white/[0.03]">
        <div className="max-w-[1400px] mx-auto px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-sm text-white/30 uppercase tracking-wider">Trusted by leading agencies</p>
          </motion.div>
          <div className="flex items-center justify-center gap-16 flex-wrap opacity-40">
            {['Acme Co', 'Globex', 'Initech', 'Umbrella', 'Stark'].map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-xl font-semibold tracking-tight"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Visual Flow */}
      <section id="how" className="relative py-32">
        <div className="max-w-[1400px] mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Three steps to
              <br />
              <span className="text-transparent bg-gradient-to-r from-[#FF5733] to-[#FF8C00] bg-clip-text">
                recovered revenue
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {[
              {
                step: '01',
                icon: Zap,
                title: 'Connect',
                desc: 'Link your tools in 5 minutes. Stripe, QuickBooks, Harvest, and more.',
              },
              {
                step: '02',
                icon: TrendingUp,
                title: 'Analyze',
                desc: 'Our AI scans every transaction, time entry, and invoice for leaks.',
              },
              {
                step: '03',
                icon: Shield,
                title: 'Recover',
                desc: 'Get alerts and one-click recovery for every dollar at risk.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="relative"
              >
                <div className="relative bg-gradient-to-b from-white/[0.03] to-transparent rounded-2xl p-8 border border-white/[0.04] hover:border-white/[0.08] transition-colors group">
                  {/* Step number */}
                  <div className="text-6xl font-bold text-white/[0.03] absolute top-4 right-6">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF5733]/10 to-[#FF8C00]/5 border border-[#FF5733]/10 flex items-center justify-center mb-6 group-hover:border-[#FF5733]/20 transition-colors">
                    <item.icon className="w-6 h-6 text-[#FF5733]" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats - Large Numbers */}
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: '4-10', suffix: '%', label: 'Typical Revenue Loss', prefix: '' },
              { value: '5', suffix: '', label: 'Leak Types Detected', prefix: '' },
              { value: '5', suffix: 'min', label: 'Setup Time', prefix: '' },
              { value: '100', suffix: '%', label: 'Free to Try', prefix: '' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold mb-2">
                  <span className="text-transparent bg-gradient-to-r from-white to-white/60 bg-clip-text">
                    {stat.value}{stat.suffix}
                  </span>
                </div>
                <div className="text-white/40">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial - Single Focus */}
      <section className="relative py-32">
        <div className="max-w-[900px] mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Quote mark */}
            <div className="text-[200px] font-serif text-white/[0.02] absolute -top-20 -left-8 select-none">
              &ldquo;
            </div>

            <blockquote className="text-3xl md:text-4xl font-medium leading-relaxed mb-10 relative">
              RevenueLeak found $67,000 we didn&apos;t know we were missing.
              <span className="text-white/40"> It paid for itself in the first week.</span>
            </blockquote>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10" />
              <div>
                <div className="font-semibold">Sarah Chen</div>
                <div className="text-sm text-white/40">CEO, Quantum Digital</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid - Minimal */}
      <section className="relative py-32 border-t border-white/[0.03]">
        <div className="max-w-[1400px] mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Built for agencies who
              <span className="text-white/30"> refuse to leave money behind.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'AI-Powered Detection',
                desc: 'Machine learning that gets smarter with every transaction, spotting patterns humans miss.',
              },
              {
                icon: Clock,
                title: 'Real-Time Monitoring',
                desc: 'Continuous scanning means you catch issues in hours, not weeks.',
              },
              {
                icon: Zap,
                title: 'One-Click Recovery',
                desc: 'Generate invoices, send reminders, and resolve issues without leaving the dashboard.',
              },
              {
                icon: Shield,
                title: 'Your Data, Your Control',
                desc: 'Data stored securely via Supabase. Export or delete anytime. No data sold or shared.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-8 bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl border border-white/[0.04] hover:border-white/[0.08] transition-all cursor-default"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-[#FF5733]/5 border border-[#FF5733]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF5733]/10 transition-colors">
                    <feature.icon className="w-5 h-5 text-[#FF5733]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-white/40 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Full Width */}
      <section className="relative py-32">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF5733]/10 via-[#0A0A0A] to-[#FF8C00]/10 rounded-3xl" />
            <div className="absolute inset-0 bg-[#0A0A0A]/80 rounded-3xl" />
            <div className="absolute inset-[1px] bg-gradient-to-b from-white/[0.05] to-transparent rounded-3xl pointer-events-none" />

            <div className="relative px-8 py-20 md:py-28 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-2xl mx-auto"
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                  Stop losing money.
                  <br />
                  <span className="text-transparent bg-gradient-to-r from-[#FF5733] to-[#FF8C00] bg-clip-text">
                    Start today.
                  </span>
                </h2>
                <p className="text-xl text-white/40 mb-10">
                  Try it free. See what you&apos;re missing.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <MagneticButton
                    href="/login"
                    className="group relative inline-flex items-center gap-3 px-10 py-5 text-lg font-medium"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FF5733] to-[#FF8C00] rounded-xl" />
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FF8C00] to-[#FFB84D] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center gap-3">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </MagneticButton>

                  <a href="#demo" className="text-white/40 hover:text-white transition-colors flex items-center gap-2">
                    <span>Schedule demo</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-sm text-white/30 mt-8">
                  14-day free trial &bull; No credit card required &bull; Cancel anytime
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="relative border-t border-white/[0.03] py-16">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="font-semibold text-lg mb-4">RevenueLeak</div>
              <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                Helping agencies recover lost revenue through intelligent automation.
                Stop leaving money on the table.
              </p>
            </div>
            <div>
              <div className="text-sm font-medium mb-4 text-white/60">Product</div>
              <div className="space-y-3 text-sm text-white/40">
                <a href="#" className="block hover:text-white transition-colors">Features</a>
                <a href="#" className="block hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block hover:text-white transition-colors">Integrations</a>
                <a href="#" className="block hover:text-white transition-colors">Changelog</a>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-4 text-white/60">Company</div>
              <div className="space-y-3 text-sm text-white/40">
                <a href="#" className="block hover:text-white transition-colors">About</a>
                <a href="#" className="block hover:text-white transition-colors">Blog</a>
                <a href="/privacy" className="block hover:text-white transition-colors">Privacy</a>
                <a href="/security" className="block hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-white/30">
              &copy; 2024 RevenueLeak. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-white/30">
              <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
