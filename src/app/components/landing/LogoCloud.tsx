// src/app/components/landing/LogoCloud.tsx
'use client';

import { motion } from 'framer-motion';

const logos = [
  { name: 'Stripe', initial: 'S' },
  { name: 'QuickBooks', initial: 'Q' },
  { name: 'Xero', initial: 'X' },
  { name: 'FreshBooks', initial: 'F' },
  { name: 'HubSpot', initial: 'H' },
  { name: 'Salesforce', initial: 'SF' },
];

export function LogoCloud() {
  return (
    <section className="py-16 border-y border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-gray-500 mb-8"
        >
          Integrates seamlessly with your existing stack
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8"
        >
          {logos.map((logo, index) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center">
                <span className="text-sm font-bold">{logo.initial}</span>
              </div>
              <span className="font-medium">{logo.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
