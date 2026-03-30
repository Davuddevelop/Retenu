// src/app/landing-test/page.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Play, FileText, Bell, Target, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

// Animated counter for numbers
function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
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

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Calculator component
function LeakCalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(50000);
  const [teamSize, setTeamSize] = useState(5);
  const [clients, setClients] = useState(10);

  // Calculate estimated leaks based on industry averages
  const leakRate = 0.07; // 7% average
  const totalLeak = Math.round(monthlyRevenue * leakRate);

  // Breakdown (rough estimates based on typical distribution)
  const unbilledHours = Math.round(totalLeak * 0.35);
  const scopeCreep = Math.round(totalLeak * 0.30);
  const missedInvoices = Math.round(totalLeak * 0.20);
  const latePayments = Math.round(totalLeak * 0.15);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left side - inputs */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Monthly Revenue</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={monthlyRevenue}
              onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 pl-8 pr-4 text-white text-lg focus:outline-none focus:border-[#FF5733]/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Team Size</label>
          <input
            type="number"
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 px-4 text-white text-lg focus:outline-none focus:border-[#FF5733]/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Active Clients</label>
          <input
            type="number"
            value={clients}
            onChange={(e) => setClients(Number(e.target.value))}
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-4 px-4 text-white text-lg focus:outline-none focus:border-[#FF5733]/50 transition-colors"
          />
        </div>

        <p className="text-xs text-gray-500">
          * Estimates based on industry research showing agencies lose 4-10% of revenue to billing gaps.
        </p>
      </div>

      {/* Right side - results */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-400 uppercase tracking-wider">Total Leakage Estimated</span>
          <span className="text-3xl font-bold text-[#FF5733]">
            ${totalLeak.toLocaleString()}<span className="text-lg text-gray-400">/mo</span>
          </span>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Unbilled Hours', value: unbilledHours, desc: 'Time worked but never invoiced', color: '#FF5733' },
            { label: 'Scope Creep', value: scopeCreep, desc: 'Work beyond contract limits', color: '#FF8C00' },
            { label: 'Missed Invoices', value: missedInvoices, desc: 'Projects completed without billing', color: '#FFB84D' },
            { label: 'Late Payments', value: latePayments, desc: 'Cash flow impact from delays', color: '#FFCC80' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className="text-xs text-gray-500">{item.desc}</span>
              </div>
              <span className="text-lg font-semibold">${item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <Link
          href="/login"
          className="mt-6 w-full py-4 bg-gradient-to-r from-[#FF5733] to-[#FF8C00] rounded-xl text-center font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          Find Your Leaks
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

// Mini dashboard preview
function DashboardPreview() {
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-b from-[#FF5733]/20 to-transparent blur-3xl opacity-30" />

      <div className="relative bg-[#0D0D0D] border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#FF5733]" />
            <span className="text-sm font-medium text-gray-400">Leakage Detected</span>
          </div>
          <span className="text-xs text-gray-500">Live</span>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main stat */}
          <div className="mb-6">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Total Leakage Detected</span>
            <div className="text-4xl font-bold text-[#FF5733] mt-1">
              $<AnimatedNumber value={12847} />
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-3">
              <span className="text-xs text-gray-500">Ongoing</span>
              <div className="text-lg font-semibold">7 <span className="text-xs text-gray-400">alerts</span></div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <span className="text-xs text-gray-500">Pending</span>
              <div className="text-lg font-semibold">-4.5<span className="text-xs text-gray-400">%</span></div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <span className="text-xs text-gray-500">Status</span>
              <div className="text-sm font-semibold text-[#FF5733]">Processing...</div>
            </div>
          </div>

          {/* Chart visualization */}
          <div className="h-32 flex items-end gap-1">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="flex-1 bg-gradient-to-t from-[#FF5733] to-[#FF8C00] rounded-t opacity-80"
              />
            ))}
          </div>

          {/* Alert preview */}
          <div className="mt-4 p-3 bg-[#FF5733]/10 border border-[#FF5733]/20 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF5733] mt-0.5" />
            <div>
              <div className="font-medium text-sm">Scope Creep Detected</div>
              <div className="text-xs text-gray-400">Acme Corp exceeded 15 hours over limit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A0A]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">REVENUE</span>
              <span className="text-xl font-bold text-[#FF5733]">LEAK</span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#calculator" className="text-gray-400 hover:text-white transition-colors">Calculator</a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-[#FF5733] to-[#FF8C00] rounded-lg text-sm font-medium hover:brightness-110 transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF5733]/10 border border-[#FF5733]/20 rounded-full text-sm mb-6"
              >
                <span className="text-[#FF5733]">●</span>
                <span className="text-gray-300">Revenue Leak Detection for Agencies</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
              >
                Stop leaking revenue.
                <br />
                <span className="text-transparent bg-gradient-to-r from-[#FF5733] to-[#FF8C00] bg-clip-text">
                  Start recovering it.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-400 mb-8 max-w-lg"
              >
                Built for agencies to detect unbilled hours, scope creep, and late payments automatically.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/login"
                  className="px-8 py-4 bg-gradient-to-r from-[#FF5733] to-[#FF8C00] rounded-xl font-semibold hover:brightness-110 transition-all flex items-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/demo"
                  className="px-8 py-4 border border-white/10 rounded-xl font-medium hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Try Live Demo
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-6 mt-8 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#FF5733]" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#FF5733]" />
                  <span>5 minute setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#FF5733]" />
                  <span>No credit card</span>
                </div>
              </motion.div>
            </div>

            {/* Right - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm text-[#FF5733] uppercase tracking-wider">Built for Agencies</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">
              Infrastructure for your bottom line.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: 'Scope Tracking',
                desc: 'Detects when work exceeds contract limits before it becomes free work.'
              },
              {
                icon: DollarSign,
                title: 'Revenue Recovery',
                desc: 'Automated reconciliation of time logs against billing records.'
              },
              {
                icon: FileText,
                title: 'Invoice Tracking',
                desc: 'Complete financial timeline per client with full transparency.'
              },
              {
                icon: Bell,
                title: 'Real-Time Alerts',
                desc: 'Instant notifications when potential leaks are detected.'
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 bg-[#111] border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FF5733]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#FF5733]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-24 px-6 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                See How Money Slips Through the Cracks
              </h2>
              <p className="text-gray-400 max-w-xl">
                Enter your numbers to estimate how much revenue your agency might be losing to billing gaps.
              </p>
            </div>
          </div>

          <LeakCalculator />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Your Data',
                desc: 'Import time entries via CSV or connect Toggl. Add your clients and invoices.'
              },
              {
                step: '02',
                title: 'We Analyze Everything',
                desc: 'Our detection engine compares hours logged vs invoiced, checks limits, finds gaps.'
              },
              {
                step: '03',
                title: 'Recover Lost Revenue',
                desc: 'See exactly where money is leaking. Generate invoices with one click.'
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-white/5 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8">
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to secure
              <br />
              <span className="text-transparent bg-gradient-to-r from-[#FF5733] to-[#FF8C00] bg-clip-text">
                your revenue?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Built for agencies who refuse to leave money on the table.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-[#FF5733] to-[#FF8C00] rounded-xl text-lg font-semibold hover:brightness-110 transition-all"
            >
              Get Early Access Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-bold">REVENUE</span>
              <span className="font-bold text-[#FF5733]">LEAK</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/security" className="hover:text-white transition-colors">Security</Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 RETENU. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
