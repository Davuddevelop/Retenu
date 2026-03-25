// src/app/components/landing/FAQ.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn } from '@/app/lib/utils';

const faqs = [
  {
    question: 'How does Obsidian detect billing errors?',
    answer:
      'Our detection engine compares your time tracking data against invoices to find gaps. It checks for unbilled hours, clients exceeding their hour limits, overdue invoices, and months without invoices. Simple logic that catches real problems.',
  },
  {
    question: 'How long does setup take?',
    answer:
      'About 5 minutes. Add your clients, import time entries (CSV upload or manual), and add your invoices. The system immediately starts analyzing for issues. No technical expertise required.',
  },
  {
    question: 'What integrations do you support?',
    answer:
      'Currently: CSV import for time entries, Toggl (in progress), and Stripe for payments. More integrations are on the roadmap based on user requests.',
  },
  {
    question: 'Is my financial data secure?',
    answer:
      'Data is stored via Supabase with encryption. You can export or delete all your data anytime. We don\'t sell or share your data. Note: We\'re an early-stage product without formal security certifications yet.',
  },
  {
    question: 'How much can I recover?',
    answer:
      'Industry research suggests agencies lose 4-10% of revenue to billing issues. Actual recovery depends on your specific situation. Try the demo with your real data to see what it finds.',
  },
  {
    question: 'Can I try it before committing?',
    answer:
      'Yes! The demo mode lets you explore with sample data immediately. You can also use it with your own data completely free during beta.',
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
            Everything you need to know about Obsidian.
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
