// src/app/components/landing/CaseStudyCard.tsx
'use client';

import { motion } from 'framer-motion';
import { CaseStudy } from '@/lib/case-studies-data';
import { ArrowUpRight, Quote } from 'lucide-react';
import Image from 'next/image';

interface CaseStudyCardProps {
  study: CaseStudy;
  index: number;
}

export function CaseStudyCard({ study, index }: CaseStudyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-[#0C0C0E] border border-white/10 rounded-2xl overflow-hidden hover:border-[#FF5733]/30 transition-all duration-500"
    >
      <div className="grid md:grid-cols-2 gap-0">
        {/* Image Section */}
        <div className="relative h-64 md:h-full">
          <Image
            src={study.image}
            alt={study.company}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0E] via-transparent to-transparent md:bg-gradient-to-r" />
          
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {study.results.map((result, i) => (
              <div key={i} className="bg-emerald-500/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-400/20">
                <p className="text-xs text-emerald-50 font-bold leading-none">{result.amount}</p>
                <p className="text-[10px] text-emerald-100 font-medium">{result.metric}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest text-[#FF5733] uppercase">
                {study.industry}
              </span>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-[#FF5733] transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-[#FF5733] transition-colors">
              {study.title}
            </h3>
            
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {study.challenge}
            </p>

            <div className="relative mb-8 pl-6 border-l-2 border-[#FF5733]/30">
              <Quote className="absolute -left-1 -top-2 w-4 h-4 text-[#FF5733]/20" />
              <p className="text-sm italic text-gray-300 mb-2">
                &ldquo;{study.quote.text}&rdquo;
              </p>
              <p className="text-xs font-medium text-white/70">
                — {study.quote.author}, {study.quote.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-white/5">
            <span className="text-xs text-gray-500">Case Study: {study.company}</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
