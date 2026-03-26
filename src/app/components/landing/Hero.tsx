// src/app/components/landing/Hero.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, Zap, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AuroraWave } from '../Shaders';
import { useAuth } from '../../providers/AuthProvider';

export function Hero() {
  const { signInAsGuest } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
      {/* Aurora Wave Effect */}
      <AuroraWave />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="success" className="mb-8">
              <Zap className="w-3 h-3 mr-1.5" />
              New: AI-Powered Leak Detection
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--foreground)]"
            style={{ letterSpacing: '0.02em' }}
          >
            Stop Losing Revenue
            <span className="block mt-2 bg-gradient-to-r from-[var(--leak)] via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Before It&apos;s Too Late
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            OBSIDIAN automatically detects billing errors, undercharging, and missed
            invoices in real-time. Service businesses lose{' '}
            <span className="text-[var(--foreground)] font-semibold">4-10% of annual revenue</span> on average—
            and <span className="text-[var(--leak)] font-semibold">57% of agencies</span> lose $1K-$5K monthly to unbilled scope creep alone.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login">
              <Button size="lg" className="min-w-[200px] group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[200px] group"
              onClick={signInAsGuest}
            >
              <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Try Live Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[var(--profit)]" />
              <span>Your Data Stays Yours</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--profit)]" />
              <span>14-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--profit)]" />
              <span>Setup in 5 Minutes</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Image / Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 relative"
        >
          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xl shadow-black/50">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[var(--leak)]/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-[var(--profit)]/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="h-6 rounded-md bg-[var(--card)] max-w-md mx-auto" />
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="p-6 space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Revenue', value: '$284,392', color: 'text-[var(--foreground)]' },
                  { label: 'Leakage Detected', value: '$12,847', color: 'text-[var(--leak)]', hasGlow: true },
                  { label: 'Recovered', value: '$9,234', color: 'text-[var(--profit)]' },
                  { label: 'Active Alerts', value: '7', color: 'text-amber-400' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)]"
                    style={stat.hasGlow ? { boxShadow: '0 0 30px rgba(255, 87, 51, 0.2)' } : {}}
                  >
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="h-48 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-end p-4 gap-2">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[var(--neutral-metric)] to-[var(--neutral-metric)]/50" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="absolute -left-4 top-1/4 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl hidden lg:block"
            style={{ boxShadow: '0 0 30px rgba(255, 87, 51, 0.2)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--leak)]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[var(--leak)]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Leak Detected</p>
                <p className="text-sm font-semibold text-[var(--foreground)]">-$2,340</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="absolute -right-4 top-1/3 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl hidden lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--profit)]/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[var(--profit)]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Auto-Fixed</p>
                <p className="text-sm font-semibold text-[var(--profit)]">+$1,840</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
