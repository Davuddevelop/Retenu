// src/app/components/landing/Pricing.tsx
'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small agencies getting started',
    price: 49,
    billing: '/month',
    features: [
      'Up to 25 clients',
      'Basic leak detection',
      'Email alerts',
      '1 integration',
      'Email support',
      '30-day history',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing agencies with advanced needs',
    price: 149,
    billing: '/month',
    features: [
      'Up to 100 clients',
      'Automated detection',
      'Real-time alerts',
      'Unlimited integrations',
      'Priority support',
      '1-year history',
      'Custom dashboards',
      'Team collaboration',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large agencies with custom requirements',
    price: null,
    billing: 'Custom',
    features: [
      'Unlimited clients',
      'Advanced AI models',
      'White-label options',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom integrations',
      'On-premise option',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--card)]/20 to-[var(--background)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Simple Pricing
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight"
          >
            Pricing That
            <span className="block bg-gradient-to-r from-[var(--neutral-metric)] to-cyan-400 bg-clip-text text-transparent">
              Pays for Itself
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-400"
          >
            Most agencies recover their subscription cost within the first month.
            <br />
            Start free, upgrade when you&apos;re ready.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={`relative p-8 rounded-2xl border ${
                plan.popular
                  ? 'border-[var(--neutral-metric)] bg-gradient-to-b from-[var(--card)] to-[var(--neutral-metric)]/5'
                  : 'border-[var(--border)] bg-[var(--card)]'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="success">
                    <Zap className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-[var(--foreground)]">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                {plan.price !== null ? (
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-[var(--foreground)]">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500 ml-1">{plan.billing}</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-[var(--foreground)]">Custom</div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[var(--profit)] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href="/login" className="block">
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-12"
        >
          All plans include a 14-day free trial. No credit card required.
          <br />
          <span className="text-[var(--profit)]">30-day money-back guarantee</span> on all
          paid plans.
        </motion.p>
      </div>
    </section>
  );
}
