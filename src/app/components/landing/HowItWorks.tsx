// src/app/components/landing/HowItWorks.tsx
'use client';

import { motion } from 'framer-motion';
import { Plug, Search, Bell, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/Badge';

const steps = [
  {
    number: '01',
    icon: Plug,
    title: 'Connect Your Tools',
    description:
      'Link your billing platforms like Stripe, QuickBooks, or Xero in just a few clicks. Secure OAuth means no passwords stored.',
    color: 'from-[var(--neutral-metric)] to-cyan-400',
  },
  {
    number: '02',
    icon: Search,
    title: 'AI Scans Your Data',
    description:
      'Our machine learning engine analyzes billing patterns, contracts, and invoices to identify anomalies and potential leaks.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: '03',
    icon: Bell,
    title: 'Get Instant Alerts',
    description:
      'Receive real-time notifications when potential Obsidians are detected, with detailed insights on each issue.',
    color: 'from-[var(--leak)] to-orange-500',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Recover Revenue',
    description:
      'Take action on flagged issues and watch your recovered revenue grow. Track your ROI with detailed analytics.',
    color: 'from-[var(--profit)] to-emerald-400',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4">How It Works</Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight"
          >
            Get Started in
            <span className="block bg-gradient-to-r from-[var(--neutral-metric)] to-cyan-400 bg-clip-text text-transparent">
              4 Simple Steps
            </span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="relative p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] group hover:border-gray-600 transition-all duration-300">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 px-3 py-1 rounded-full bg-[var(--background)] border border-[var(--border)] text-sm font-mono text-gray-500">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mt-4 mb-5`}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (hidden on mobile/tablet) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
