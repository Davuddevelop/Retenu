// src/app/components/landing/Testimonials.tsx
'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Badge } from '../ui/Badge';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CEO',
    company: 'Pixel Perfect Agency',
    avatar: 'SC',
    content:
      'OBSIDIAN found $32,000 in missed invoices in our first week. The ROI was immediate and the setup was surprisingly simple.',
    stats: { recovered: '$32K', time: '1 week' },
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Finance Director',
    company: 'Creative Collective',
    avatar: 'MR',
    content:
      'We were skeptical at first, but the AI detection is incredibly accurate. It caught billing errors we never would have noticed manually.',
    stats: { recovered: '$67K', time: '3 months' },
  },
  {
    name: 'Emily Watson',
    role: 'Operations Lead',
    company: 'Digital First Co',
    avatar: 'EW',
    content:
      'The real-time alerts have transformed how we handle client billing. No more end-of-quarter surprises. Our margins have improved by 15%.',
    stats: { recovered: '$48K', time: '6 months' },
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[var(--profit)]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[var(--neutral-metric)]/10 to-transparent rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="success" className="mb-4">
              <Star className="w-3 h-3 mr-1.5 fill-current" />
              Customer Stories
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight"
          >
            Trusted by Leading
            <span className="block bg-gradient-to-r from-[var(--profit)] to-emerald-400 bg-clip-text text-transparent">
              Agencies Worldwide
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-400"
          >
            See how agencies are recovering lost revenue and improving their bottom line.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] group hover:border-[var(--profit)]/30 transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-[var(--border)] group-hover:text-[var(--profit)]/20 transition-colors" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--neutral-metric)] to-blue-600 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-4 border-t border-[var(--border)]">
                <div>
                  <p className="text-lg font-bold text-[var(--profit)]">
                    {testimonial.stats.recovered}
                  </p>
                  <p className="text-xs text-gray-500">Recovered</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--foreground)]">
                    {testimonial.stats.time}
                  </p>
                  <p className="text-xs text-gray-500">Time Period</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <div className="flex -space-x-3">
              {['JD', 'AK', 'LS', 'MP', 'RW'].map((initials, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 border-2 border-[var(--card)] flex items-center justify-center"
                >
                  <span className="text-xs font-medium text-white">{initials}</span>
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
                <span className="text-sm font-semibold text-[var(--foreground)] ml-2">
                  4.9/5
                </span>
              </div>
              <p className="text-xs text-gray-500">From 500+ agency reviews</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
