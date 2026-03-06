// src/app/components/landing/FAQ.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn } from '@/app/lib/utils';

const faqs = [
  {
    question: 'How does RevenueLeak detect billing errors?',
    answer:
      'Our AI-powered engine analyzes your billing data, contracts, time tracking, and invoicing patterns. It compares expected vs. actual billing, identifies anomalies, and flags potential issues like undercharging, missed invoices, scope creep without billing adjustments, and more.',
  },
  {
    question: 'How long does setup take?',
    answer:
      'Most agencies are up and running in under 5 minutes. Simply connect your billing and invoicing platforms through our secure OAuth integrations, and our AI starts analyzing immediately. No technical expertise required.',
  },
  {
    question: 'What integrations do you support?',
    answer:
      'We integrate with 50+ platforms including Stripe, QuickBooks, Xero, FreshBooks, HubSpot, Salesforce, Harvest, Toggl, and many more. Can\'t find yours? Contact us - we\'re adding new integrations weekly.',
  },
  {
    question: 'Is my financial data secure?',
    answer:
      'Absolutely. We\'re SOC 2 Type II certified, use bank-level encryption (AES-256), and never store raw financial data. All connections use read-only API access. Your data is never sold or shared.',
  },
  {
    question: 'What\'s the average ROI?',
    answer:
      'Agencies typically recover 3-5% of their annual revenue, with an average of $47,000 per year. Most customers see positive ROI within the first month, often within the first week.',
  },
  {
    question: 'Can I try it before committing?',
    answer:
      'Yes! We offer a 14-day free trial with full access to all features. No credit card required. If you\'re not satisfied, there\'s also a 30-day money-back guarantee on all paid plans.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4">
              <HelpCircle className="w-3 h-3 mr-1.5" />
              FAQ
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-400"
          >
            Everything you need to know about RevenueLeak.
          </motion.p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-medium text-[var(--foreground)]">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-gray-400 transition-transform duration-200',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
