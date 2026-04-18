// src/app/components/landing/EarlyAdopters.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Users, Eye } from 'lucide-react';
import { Badge } from '../ui/Badge';

const cards = [
  {
    icon: Users,
    title: 'Design Partner Program',
    body: "We're onboarding 5 agencies as design partners. You get Pro features free for 6 months. In exchange: weekly 20-min feedback calls and permission to share results as a case study when we find your first leak.",
  },
  {
    icon: Sparkles,
    title: 'Built in Baku, for agencies everywhere',
    body: "RETENU is built by a small team that spent months inside real agency billing data. We'd rather show you our detection engine on your actual data than quote testimonials we made up.",
  },
  {
    icon: Eye,
    title: 'What early users actually see',
    body: "Most agencies find their first leak within the first session — usually 15 minutes after uploading data. If we don't find anything recoverable in 30 days, you shouldn't be paying us.",
  },
];

export function EarlyAdopters() {
  return (
    <section id="early-adopters" className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#FF5733]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[var(--neutral-metric)]/10 to-transparent rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="default" className="mb-4 bg-[#FF5733]/10 text-[#FF5733] border-[#FF5733]/20">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Launching 2025
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight"
          >
            We're new.
            <span className="block text-gray-500">Be one of our first.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-400"
          >
            RETENU launched in 2025. Instead of fake testimonials, here's the honest pitch:
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] group hover:border-[#FF5733]/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#FF5733]/10 flex items-center justify-center mb-4">
                <card.icon className="w-6 h-6 text-[#FF5733]" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                {card.title}
              </h3>

              {/* Body */}
              <p className="text-gray-400 text-sm leading-relaxed">
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF5733] hover:bg-[#E84118] text-white font-semibold rounded-xl transition-colors"
          >
            Apply to be a design partner
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
