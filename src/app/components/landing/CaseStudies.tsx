// src/app/components/landing/CaseStudies.tsx
'use client';

import { motion } from 'framer-motion';
import { caseStudies } from '@/lib/case-studies-data';
import { CaseStudyCard } from './CaseStudyCard';
import { Badge } from '../ui/Badge';
import { FileText } from 'lucide-react';

export function CaseStudies() {
  return (
    <section id="case-studies" className="py-24 relative overflow-hidden bg-black/50">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <Badge variant="success" className="bg-[#FF5733]/10 text-[#FF5733] border-[#FF5733]/20">
              <FileText className="w-3 h-3 mr-1.5" />
              Evidence of Impact
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4"
          >
            Real Stories.
            <span className="block text-gray-500">Real Revenue Recovered.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            See how top-tier agencies are using RETENU to automate revenue intelligence and eliminate scope creep.
          </motion.p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 gap-12">
          {caseStudies.map((study, index) => (
            <CaseStudyCard key={study.id} study={study} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="inline-block p-[1px] rounded-xl bg-gradient-to-r from-white/10 via-[#FF5733]/50 to-white/10">
            <div className="bg-[#0C0C0E] rounded-xl px-8 py-6 flex flex-col md:flex-row items-center gap-6">
              <div className="text-left">
                <p className="text-white font-bold text-lg">Ready to find your own hidden revenue?</p>
                <p className="text-gray-400 text-sm">Join 500+ agencies recovering $2.8M+ monthly.</p>
              </div>
              <button className="px-6 py-3 bg-[#FF5733] hover:bg-[#E84118] text-white font-semibold rounded-lg transition-colors whitespace-nowrap">
                Start Your Audit
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
