// src/app/components/landing/LeakExamples.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Clock,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  FileText,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import Link from 'next/link';

const leakScenarios = [
  {
    id: 'unbilled-overtime',
    title: 'Unbilled Overtime',
    icon: Clock,
    color: 'from-red-500 to-orange-500',
    problem: 'Developer worked 47 hours of overtime on urgent bug fixes, but only 40 hours were logged in the billing system.',
    detection: 'RETENU compares time tracking data (Toggl/Clockify) with invoiced hours and flags discrepancies in real-time.',
    impact: '$7,050',
    impactLabel: 'Lost Revenue',
    stats: {
      timeframe: '1 month',
      frequency: 'Common',
      severity: 'High',
    },
    visual: {
      tracked: 47,
      billed: 40,
      rate: 150,
    },
  },
  {
    id: 'scope-creep',
    title: 'Scope Creep',
    icon: TrendingDown,
    color: 'from-orange-500 to-amber-500',
    problem: 'Client requested "small tweaks" that turned into 23 hours of additional work outside the original project scope.',
    detection: 'AI monitors project hours against initial estimates and alerts when time exceeds contracted scope by >15%.',
    impact: '$3,450',
    impactLabel: 'Unbilled Work',
    stats: {
      timeframe: '2 weeks',
      frequency: 'Very Common',
      severity: 'Medium',
    },
    visual: {
      estimated: 40,
      actual: 63,
      rate: 150,
    },
  },
  {
    id: 'missed-milestone',
    title: 'Missed Milestone Billing',
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
    problem: 'Project milestone completed 2 weeks ago, but invoice was never sent due to team member being on vacation.',
    detection: 'RETENU tracks project status updates and automatically flags completed milestones without corresponding invoices.',
    impact: '$12,500',
    impactLabel: 'Delayed Payment',
    stats: {
      timeframe: '2 weeks',
      frequency: 'Common',
      severity: 'High',
    },
    visual: {
      milestoneValue: 12500,
      daysDelayed: 14,
      interestLost: 47,
    },
  },
  {
    id: 'outdated-rates',
    title: 'Outdated Rates',
    icon: DollarSign,
    color: 'from-cyan-500 to-blue-500',
    problem: 'Monthly retainer should have increased to $8,000 after 6-month review, but old rate of $6,000 continued for 4 months.',
    detection: 'Monitors contract renewal dates and rate changes, alerting when invoices don\'t match current rate sheets.',
    impact: '$8,000',
    impactLabel: 'Undercharged',
    stats: {
      timeframe: '4 months',
      frequency: 'Uncommon',
      severity: 'Critical',
    },
    visual: {
      oldRate: 6000,
      newRate: 8000,
      months: 4,
    },
  },
  {
    id: 'missed-expenses',
    title: 'Unreimbursed Expenses',
    icon: FileText,
    color: 'from-emerald-500 to-teal-500',
    problem: 'Team purchased $2,840 in stock photos, fonts, and plugins for client projects but expenses were never billed.',
    detection: 'Integrates with expense tracking and flags unbilled third-party costs older than 30 days.',
    impact: '$2,840',
    impactLabel: 'Out-of-Pocket',
    stats: {
      timeframe: '3 months',
      frequency: 'Common',
      severity: 'Medium',
    },
    visual: {
      expenses: [
        { item: 'Stock Photos', amount: 1200 },
        { item: 'Premium Fonts', amount: 890 },
        { item: 'Plugins & Tools', amount: 750 },
      ],
    },
  },
  {
    id: 'multi-client-time',
    title: 'Multi-Client Time Split',
    icon: Users,
    color: 'from-pink-500 to-rose-500',
    problem: 'Designer worked on shared asset library benefiting 3 clients, but time was only billed to one client.',
    detection: 'AI analyzes time entries and flags when work descriptions suggest multiple beneficiaries but billing is single-client.',
    impact: '$1,600',
    impactLabel: 'Missed Charges',
    stats: {
      timeframe: '1 week',
      frequency: 'Uncommon',
      severity: 'Medium',
    },
    visual: {
      totalHours: 16,
      hourlyRate: 150,
      clientsBilled: 1,
      clientsBenefited: 3,
    },
  },
];

export function LeakExamples() {
  const [activeScenario, setActiveScenario] = useState(leakScenarios[0]);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-rotate through scenarios
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setActiveScenario((current) => {
        const currentIndex = leakScenarios.findIndex((s) => s.id === current.id);
        const nextIndex = (currentIndex + 1) % leakScenarios.length;
        return leakScenarios[nextIndex];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  const handleScenarioClick = (scenario: typeof leakScenarios[0]) => {
    setActiveScenario(scenario);
    setAutoPlay(false);
  };

  // Calculate total potential loss
  const totalLoss = leakScenarios.reduce((sum, scenario) => {
    const amount = parseInt(scenario.impact.replace(/[^0-9]/g, ''));
    return sum + amount;
  }, 0);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--card)]/30 via-[var(--background)] to-[var(--card)]/30" />
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-br from-[var(--leak)]/10 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4">
              <AlertTriangle className="w-3 h-3 mr-1.5" />
              Common Leaks
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight"
          >
            See How Money
            <span className="relative inline-block">
              <span className="block bg-gradient-to-r from-[var(--leak)] to-orange-400 bg-clip-text text-transparent">
                Slips Through the Cracks
              </span>
              {/* Hand-drawn style underline */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 6C50 3 100 8 150 5C200 2 250 7 298 4"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-[var(--leak)]/40"
                  style={{
                    filter: 'url(#squiggle)'
                  }}
                />
                <defs>
                  <filter id="squiggle">
                    <feTurbulence baseFrequency="0.02" numOctaves="2" result="turbulence"/>
                    <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="2" />
                  </filter>
                </defs>
              </svg>
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-400"
          >
            <span className="text-[var(--leak)] font-semibold">42% of businesses</span> actively face Leakage.
            Click through real scenarios from agencies like yours—each represents actual loss that RETENU prevents.
          </motion.p>

          {/* Total Loss Counter - Sticky note style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.3,
              type: 'spring',
              stiffness: 200,
              damping: 12
            }}
            whileHover={{
              rotate: -1,
              scale: 1.05,
              transition: { type: 'spring', stiffness: 400 }
            }}
            className="mt-8 inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-br from-amber-50/10 via-orange-50/5 to-red-50/10 border-2 border-[var(--leak)]/20 shadow-lg relative"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Tape effect at top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-gray-400/20 backdrop-blur-sm rounded-sm border border-gray-500/20"
                 style={{ transform: 'translateX(-50%) rotate(-2deg)' }}
            />

            <Zap className="w-5 h-5 text-[var(--leak)] animate-pulse" />
            <div className="text-left">
              <p className="text-xs text-gray-400 font-medium">Combined Examples Show</p>
              <p className="text-xl font-bold bg-gradient-to-r from-[var(--leak)] via-orange-500 to-amber-500 bg-clip-text text-transparent">
                ${totalLoss.toLocaleString()} in Lost Revenue
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scenario Selector */}
          <div className="lg:col-span-1 space-y-3">
            {/* Auto-play indicator */}
            <div className="mb-4 p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {autoPlay ? 'Auto-playing' : 'Manual mode'}
              </span>
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className="text-xs px-2 py-1 rounded bg-[var(--background)] text-gray-300 hover:text-[var(--foreground)] transition-colors"
              >
                {autoPlay ? 'Pause' : 'Play'}
              </button>
            </div>

            {leakScenarios.map((scenario, index) => {
              // Subtle rotation for organic feel - alternating left/right
              const rotation = index % 2 === 0 ? -0.5 : 0.5;
              const hoverRotation = index % 2 === 0 ? -1 : 1;

              return (
              <motion.button
                key={scenario.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.02,
                  rotate: hoverRotation,
                  transition: { type: 'spring', stiffness: 300, damping: 15 }
                }}
                onClick={() => handleScenarioClick(scenario)}
                style={{
                  rotate: activeScenario.id === scenario.id ? 0 : rotation
                }}
                className={`relative w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                  activeScenario.id === scenario.id
                    ? 'border-[var(--leak)] bg-gradient-to-r from-[var(--leak)]/10 to-[var(--leak)]/5 shadow-lg shadow-[var(--leak)]/20'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-gray-600 hover:bg-[var(--card)]/80'
                }`}
              >
                {/* Active Indicator */}
                {activeScenario.id === scenario.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--leak)] to-orange-500 rounded-l-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${scenario.color} flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-300 ${
                      activeScenario.id === scenario.id ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  >
                    <scenario.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--foreground)] mb-1 group-hover:text-white transition-colors">
                      {scenario.title}
                    </h3>
                    <p className="text-sm text-[var(--leak)] font-bold">
                      {scenario.impact} lost
                    </p>
                    <div className="mt-2 flex gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] text-gray-500">
                        {scenario.stats.frequency}
                      </span>
                    </div>
                  </div>
                  {activeScenario.id === scenario.id && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center"
                    >
                      <ArrowRight className="w-5 h-5 text-[var(--leak)]" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
            })}
          </div>

          {/* Scenario Details */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScenario.id}
                initial={{ opacity: 0, y: 20, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -20, rotate: 1 }}
                transition={{
                  duration: 0.4,
                  type: 'spring',
                  stiffness: 200,
                  damping: 20
                }}
                className="rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xl"
                style={{
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)'
                }}
              >
                {/* Header */}
                <div className="relative p-6 border-b border-[var(--border)] overflow-hidden">
                  {/* Animated gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${activeScenario.color} opacity-5`}
                  />
                  <div className="relative flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0.8, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      whileHover={{
                        scale: 1.1,
                        rotate: 5,
                        transition: { type: 'spring', stiffness: 400, damping: 10 }
                      }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeScenario.color} flex items-center justify-center flex-shrink-0 shadow-xl relative`}
                      style={{
                        boxShadow: '0 8px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                      }}
                    >
                      <activeScenario.icon className="w-8 h-8 text-white" />
                      {/* Shine effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                        {activeScenario.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="default" className="text-xs">
                          {activeScenario.stats.frequency}
                        </Badge>
                        <Badge variant="warning" className="text-xs">
                          {activeScenario.stats.severity} Severity
                        </Badge>
                        <Badge variant="default" className="text-xs">
                          {activeScenario.stats.timeframe}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* The Problem */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-[var(--leak)]" />
                      <h4 className="font-semibold text-[var(--foreground)]">The Problem</h4>
                    </div>
                    <p className="text-gray-300 leading-relaxed pl-7">
                      {activeScenario.problem}
                    </p>
                  </div>

                  {/* Visual Representation */}
                  <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[var(--background)] to-[var(--card)] border-2 border-[var(--border)] shadow-inner overflow-hidden">
                    {/* Paper texture overlay */}
                    <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
                         style={{
                           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                           backgroundRepeat: 'repeat'
                         }}
                    />
                    {/* Decorative corner accent */}
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${activeScenario.color} opacity-5 blur-2xl`} />
                    {activeScenario.id === 'unbilled-overtime' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative space-y-4"
                      >
                        {/* Visual bar comparison */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Hours Tracked</span>
                            <span className="font-bold text-[var(--foreground)]">
                              {activeScenario.visual.tracked}h
                            </span>
                          </div>
                          <div className="h-8 rounded-lg bg-[var(--card)] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-[var(--profit)] to-emerald-400 flex items-center justify-end px-3"
                            >
                              <span className="text-xs font-bold text-white">{activeScenario.visual.tracked}h</span>
                            </motion.div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Hours Billed</span>
                            <span className="font-bold text-[var(--leak)]">
                              {activeScenario.visual.billed}h
                            </span>
                          </div>
                          <div className="h-8 rounded-lg bg-[var(--card)] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${((activeScenario.visual.billed ?? 0) / (activeScenario.visual.tracked ?? 1)) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                              className="h-full bg-gradient-to-r from-[var(--leak)] to-orange-500 flex items-center justify-end px-3"
                            >
                              <span className="text-xs font-bold text-white">{activeScenario.visual.billed}h</span>
                            </motion.div>
                          </div>
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-[var(--leak)]/10 border border-[var(--leak)]/20"
                        >
                          <span className="text-sm text-gray-300">Lost Revenue</span>
                          <span className="font-bold text-[var(--leak)] text-2xl">
                            {activeScenario.impact}
                          </span>
                        </motion.div>
                        <p className="text-xs text-center text-gray-500">
                          ({(activeScenario.visual.tracked ?? 0) - (activeScenario.visual.billed ?? 0)}h × ${activeScenario.visual.rate ?? 0}/hr)
                        </p>
                      </motion.div>
                    )}

                    {activeScenario.id === 'scope-creep' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-[var(--profit)]/10 border border-[var(--profit)]/20">
                            <p className="text-xs text-gray-400 mb-1">Estimated</p>
                            <p className="text-2xl font-bold text-[var(--profit)]">
                              {activeScenario.visual.estimated}h
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--leak)]/10 border border-[var(--leak)]/20">
                            <p className="text-xs text-gray-400 mb-1">Actual</p>
                            <p className="text-2xl font-bold text-[var(--leak)]">
                              {activeScenario.visual.actual}h
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Budget Progress</span>
                            <span className="text-[var(--leak)] font-bold">
                              {Math.round(((activeScenario.visual.actual ?? 0) / (activeScenario.visual.estimated ?? 1)) * 100)}%
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-[var(--card)] overflow-hidden relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 0.6, delay: 0.2 }}
                              className="absolute h-full w-full bg-[var(--profit)]/20"
                            />
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(((activeScenario.visual.actual ?? 0) / (activeScenario.visual.estimated ?? 1)) * 100, 100)}%` }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                              className="absolute h-full bg-gradient-to-r from-[var(--profit)] via-amber-500 to-[var(--leak)]"
                            />
                          </div>
                        </div>

                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="p-3 rounded-lg bg-[var(--leak)]/10 border border-[var(--leak)]/20 text-center"
                        >
                          <p className="text-xs text-gray-400 mb-1">Unbilled Work</p>
                          <p className="text-2xl font-bold text-[var(--leak)]">{activeScenario.impact}</p>
                        </motion.div>
                      </motion.div>
                    )}

                    {activeScenario.id === 'missed-milestone' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Milestone Value</span>
                          <span className="font-bold text-[var(--foreground)]">
                            ${(activeScenario.visual.milestoneValue ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Days Delayed</span>
                          <span className="font-bold text-[var(--leak)]">
                            {activeScenario.visual.daysDelayed} days
                          </span>
                        </div>
                        <div className="h-px bg-[var(--border)]" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Interest/Opportunity Cost</span>
                          <span className="font-bold text-amber-400">
                            ${activeScenario.visual.interestLost}
                          </span>
                        </div>
                      </div>
                    )}

                    {activeScenario.id === 'outdated-rates' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Old Rate</span>
                          <span className="font-bold text-[var(--leak)] line-through">
                            ${activeScenario.visual.oldRate}/mo
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">New Rate</span>
                          <span className="font-bold text-[var(--profit)]">
                            ${activeScenario.visual.newRate}/mo
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Months at Old Rate</span>
                          <span className="font-bold text-[var(--foreground)]">
                            {activeScenario.visual.months} months
                          </span>
                        </div>
                        <div className="h-px bg-[var(--border)]" />
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Total Undercharged</span>
                          <span className="font-bold text-[var(--leak)] text-lg">
                            {activeScenario.impact}
                          </span>
                        </div>
                      </div>
                    )}

                    {activeScenario.id === 'missed-expenses' && (
                      <div className="space-y-2">
                        {(activeScenario.visual.expenses ?? []).map((expense, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm p-2 rounded bg-[var(--card)]"
                          >
                            <span className="text-gray-400">{expense.item}</span>
                            <span className="font-bold text-[var(--leak)]">
                              ${expense.amount}
                            </span>
                          </div>
                        ))}
                        <div className="h-px bg-[var(--border)] my-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 font-semibold">Total Unbilled</span>
                          <span className="font-bold text-[var(--leak)] text-lg">
                            {activeScenario.impact}
                          </span>
                        </div>
                      </div>
                    )}

                    {activeScenario.id === 'multi-client-time' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Total Hours</span>
                          <span className="font-bold text-[var(--foreground)]">
                            {activeScenario.visual.totalHours}h
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Clients Benefited</span>
                          <span className="font-bold text-[var(--foreground)]">
                            {activeScenario.visual.clientsBenefited}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Clients Billed</span>
                          <span className="font-bold text-[var(--leak)]">
                            {activeScenario.visual.clientsBilled}
                          </span>
                        </div>
                        <div className="h-px bg-[var(--border)]" />
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Should Have Recovered</span>
                          <span className="font-bold text-[var(--leak)] text-lg">
                            {activeScenario.impact}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* How We Detect It */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-[var(--profit)]" />
                      <h4 className="font-semibold text-[var(--foreground)]">How RETENU Detects It</h4>
                    </div>
                    <p className="text-gray-300 leading-relaxed pl-7">
                      {activeScenario.detection}
                    </p>
                  </div>

                  {/* Impact Badge */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative p-5 rounded-xl bg-gradient-to-r from-[var(--leak)]/10 via-orange-500/5 to-transparent border border-[var(--leak)]/30 overflow-hidden"
                  >
                    {/* Animated pulse effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--leak)]/5 to-transparent animate-pulse" />

                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {activeScenario.impactLabel}
                        </p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-[var(--leak)] to-orange-500 bg-clip-text text-transparent">
                          {activeScenario.impact}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-2">Prevention: Automatic</p>
                        <Badge variant="success" className="shadow-lg shadow-[var(--profit)]/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Real-time Alert
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 relative"
        >
          {/* Glowing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--leak)]/20 via-orange-500/20 to-amber-500/20 blur-3xl rounded-full" />

          <motion.div
            className="relative max-w-4xl mx-auto text-center p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[var(--card)] via-[var(--background)] to-[var(--card)] border-2 border-[var(--border)] shadow-2xl overflow-hidden"
            initial={{ rotate: -0.5 }}
            whileInView={{ rotate: 0.5 }}
            viewport={{ once: true }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 3
            }}
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Decorative corner stamps */}
            <div className="absolute top-4 right-4 w-12 h-12 border-2 border-[var(--leak)]/30 rounded-full flex items-center justify-center rotate-12">
              <span className="text-[10px] font-bold text-[var(--leak)]/50">NEW</span>
            </div>

            {/* Paper texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                 }}
            />

            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="relative"
            >
              <motion.div
                animate={{
                  rotate: [0, -5, 5, -5, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-[var(--leak)] drop-shadow-lg" />
              </motion.div>
              <p className="text-xl text-gray-300 mb-2">
                <span className="text-[var(--leak)] font-semibold">Only 1% of agencies</span> bill all out-of-scope work effectively. The question is:
              </p>
              <h3 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
                How much are{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[var(--leak)] to-orange-500 bg-clip-text text-transparent">
                    you
                  </span>
                  {/* Hand-drawn circle around "you" */}
                  <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.ellipse
                      cx="50"
                      cy="50"
                      rx="48"
                      ry="48"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-[var(--leak)]/40"
                      initial={{ pathLength: 0, rotate: -5 }}
                      animate={{ pathLength: 1, rotate: 5 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                  </svg>
                </span>
                {' '}losing?
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Start your free trial and see exactly where your revenue is leaking in under 5 minutes. No credit card required.
              </p>

              <div className="flex justify-center">
                <Link href="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="min-w-[220px] group shadow-xl shadow-[var(--leak)]/30 rounded-2xl">
                      Find My Leaks
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--profit)]" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--profit)]" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--profit)]" />
                  <span>Setup in 5 minutes</span>
                </div>
              </div>
            </motion.div>  {/* Close inner content wrapper (line 773) */}
          </motion.div>    {/* Close card with rotation (line 744) */}
        </motion.div>      {/* Close outer CTA wrapper (line 734) */}
      </div>
    </section>
  );
}
