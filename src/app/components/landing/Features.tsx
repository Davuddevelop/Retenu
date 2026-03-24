// src/app/components/landing/Features.tsx
'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  Clock,
  FileSearch,
  Plug,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Detection',
    description:
      'Machine learning algorithms analyze billing patterns to identify anomalies, undercharging, and missed invoices automatically.',
    color: 'from-purple-500 to-pink-500',
    span: 'col-span-2',
  },
  {
    icon: AlertTriangle,
    title: 'Real-Time Alerts',
    description: 'Instant notifications when potential revenue leaks are detected.',
    color: 'from-[var(--leak)] to-orange-500',
    span: 'col-span-1',
  },
  {
    icon: TrendingUp,
    title: 'Revenue Recovery',
    description: 'Track and recover lost revenue with actionable insights.',
    color: 'from-[var(--profit)] to-emerald-400',
    span: 'col-span-1',
  },
  {
    icon: Plug,
    title: 'Seamless Integrations',
    description: 'Connect with Stripe, QuickBooks, Xero, and 50+ billing platforms.',
    color: 'from-[var(--neutral-metric)] to-blue-400',
    span: 'col-span-1',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Comprehensive dashboards showing leak patterns, client profitability, and revenue trends over time.',
    color: 'from-amber-500 to-yellow-400',
    span: 'col-span-2',
  },
  {
    icon: Clock,
    title: '5-Minute Setup',
    description: 'Get started instantly with guided onboarding.',
    color: 'from-cyan-500 to-teal-400',
    span: 'col-span-1',
  },
];

const stats = [
  { value: '4-10%', label: 'Avg Revenue Leakage', icon: TrendingUp },
  { value: '57%', label: 'Agencies Lose $1K-$5K/mo', icon: AlertTriangle },
  { value: '42%', label: 'Face Active Leakage', icon: Shield },
  { value: '99%', label: 'Never Bill All Scope Creep', icon: FileSearch },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--card)]/30 to-[var(--background)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4">
              <Zap className="w-3 h-3 mr-1.5" />
              Powerful Features
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight"
          >
            Everything You Need to
            <span className="block bg-gradient-to-r from-[var(--leak)] to-orange-400 bg-clip-text text-transparent">
              Protect Your Revenue
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-400"
          >
            Built for agencies who refuse to leave money on the table.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${feature.span} group relative p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-gray-600 transition-all duration-300`}
            >
              {/* Gradient Background on Hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]"
            >
              <stat.icon className="w-6 h-6 text-[var(--neutral-metric)] mx-auto mb-3" />
              <div className="text-3xl font-bold text-[var(--foreground)]">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
