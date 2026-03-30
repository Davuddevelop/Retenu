// src/app/components/landing/ROICalculator.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import Link from 'next/link';

interface CalculatorInputs {
  annualRevenue: number;
  numberOfClients: number;
  avgHourlyRate: number;
  teamSize: number;
}

export function ROICalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    annualRevenue: 500000,
    numberOfClients: 15,
    avgHourlyRate: 150,
    teamSize: 5,
  });

  const [showResults, setShowResults] = useState(false);

  // Calculate potential Leaks based on industry averages
  const calculateLeaks = () => {
    const { annualRevenue, avgHourlyRate, teamSize } = inputs;

    // Industry average: 3-7% Leakage
    const leakagePercentage = 0.05; // 5% average
    const totalLeakage = annualRevenue * leakagePercentage;

    // Breakdown by leak type (percentages of total leakage)
    const unbilledTime = totalLeakage * 0.35; // 35% from unbilled hours
    const scopeCreep = totalLeakage * 0.25; // 25% from scope creep
    const missedInvoices = totalLeakage * 0.20; // 20% from missed invoices
    const outdatedRates = totalLeakage * 0.12; // 12% from outdated rates
    const expenses = totalLeakage * 0.08; // 8% from unreimbursed expenses

    // Time saved (hours per month)
    const hoursSavedPerMonth = teamSize * 4; // 4 hours per team member per month
    const timeSavingsValue = hoursSavedPerMonth * avgHourlyRate * 12;

    // Recovery rate with RETENU (assume 80% of leaks can be recovered)
    const recoveryRate = 0.80;
    const potentialRecovery = totalLeakage * recoveryRate;

    // ROI calculation
    const annualCost = 149 * 12; // Professional plan
    const netBenefit = potentialRecovery + timeSavingsValue - annualCost;
    const roi = ((netBenefit / annualCost) * 100);

    return {
      totalLeakage,
      breakdown: {
        unbilledTime,
        scopeCreep,
        missedInvoices,
        outdatedRates,
        expenses,
      },
      potentialRecovery,
      timeSavingsValue,
      hoursSavedPerMonth,
      annualCost,
      netBenefit,
      roi,
      paybackPeriod: annualCost / (potentialRecovery / 12), // months
    };
  };

  const results = calculateLeaks();

  const handleCalculate = () => {
    setShowResults(true);
  };

  const updateInput = (field: keyof CalculatorInputs, value: string) => {
    const numValue = parseInt(value) || 0;
    setInputs(prev => ({ ...prev, [field]: numValue }));
    setShowResults(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const leakBreakdown = [
    {
      label: 'Unbilled Time',
      value: results.breakdown.unbilledTime,
      color: 'from-red-500 to-orange-500',
      icon: Clock
    },
    {
      label: 'Scope Creep',
      value: results.breakdown.scopeCreep,
      color: 'from-orange-500 to-amber-500',
      icon: TrendingUp
    },
    {
      label: 'Missed Invoices',
      value: results.breakdown.missedInvoices,
      color: 'from-purple-500 to-pink-500',
      icon: AlertCircle
    },
    {
      label: 'Outdated Rates',
      value: results.breakdown.outdatedRates,
      color: 'from-cyan-500 to-blue-500',
      icon: DollarSign
    },
    {
      label: 'Unreimbursed Expenses',
      value: results.breakdown.expenses,
      color: 'from-emerald-500 to-teal-500',
      icon: Users
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--card)]/20 to-[var(--background)]" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-[var(--profit)]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-[var(--neutral-metric)]/10 to-transparent rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="success" className="mb-4">
              <Calculator className="w-3 h-3 mr-1.5" />
              Free ROI Calculator
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--foreground)] tracking-tight"
          >
            Calculate Your
            <span className="relative inline-block ml-3">
              <span className="bg-gradient-to-r from-[var(--profit)] to-emerald-400 bg-clip-text text-transparent">
                Revenue Recovery
              </span>
              {/* Sparkle decoration */}
              <Sparkles className="absolute -top-2 -right-6 w-5 h-5 text-[var(--profit)] animate-pulse" />
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-400"
          >
            Service businesses lose <span className="text-[var(--foreground)] font-semibold">4-10% of revenue</span> annually.
            See exactly how much you&apos;re losing—and what you could recover.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20, rotate: -1 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative"
          >
            <div className="sticky top-8 p-8 rounded-3xl border-2 border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)] shadow-2xl">
              {/* Paper texture */}
              <div className="absolute inset-0 rounded-3xl opacity-[0.02] pointer-events-none"
                   style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                   }}
              />

              <div className="relative space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--profit)] to-emerald-400 flex items-center justify-center shadow-lg"
                  >
                    <Calculator className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--foreground)]">Your Agency Details</h3>
                    <p className="text-sm text-gray-500">Adjust the sliders to match your business</p>
                  </div>
                </div>

                {/* Annual Revenue Input */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[var(--profit)]" />
                      Annual Revenue
                    </label>
                    <span className="text-lg font-bold text-[var(--foreground)]">
                      {formatCurrency(inputs.annualRevenue)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="5000000"
                    step="50000"
                    value={inputs.annualRevenue}
                    onChange={(e) => updateInput('annualRevenue', e.target.value)}
                    className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>$100K</span>
                    <span>$5M</span>
                  </div>
                </div>

                {/* Number of Clients */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--neutral-metric)]" />
                      Number of Clients
                    </label>
                    <span className="text-lg font-bold text-[var(--foreground)]">
                      {inputs.numberOfClients}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={inputs.numberOfClients}
                    onChange={(e) => updateInput('numberOfClients', e.target.value)}
                    className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>5</span>
                    <span>100+</span>
                  </div>
                </div>

                {/* Average Hourly Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Avg Hourly Rate
                    </label>
                    <span className="text-lg font-bold text-[var(--foreground)]">
                      ${inputs.avgHourlyRate}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    step="10"
                    value={inputs.avgHourlyRate}
                    onChange={(e) => updateInput('avgHourlyRate', e.target.value)}
                    className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>$50</span>
                    <span>$300</span>
                  </div>
                </div>

                {/* Team Size */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Team Size
                    </label>
                    <span className="text-lg font-bold text-[var(--foreground)]">
                      {inputs.teamSize} people
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={inputs.teamSize}
                    onChange={(e) => updateInput('teamSize', e.target.value)}
                    className="w-full h-2 bg-[var(--background)] rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>50+</span>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleCalculate}
                    size="lg"
                    className="w-full mt-4 rounded-2xl shadow-lg shadow-[var(--profit)]/20"
                  >
                    Calculate My Savings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20, rotate: 1 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              {showResults ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Main Result Card */}
                  <motion.div
                    initial={{ scale: 0.9, rotate: -2 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="p-8 rounded-3xl bg-gradient-to-br from-[var(--leak)]/20 via-orange-500/10 to-amber-500/5 border-2 border-[var(--leak)]/30 shadow-2xl relative overflow-hidden"
                  >
                    {/* Shine effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl" />

                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Estimated Annual RETENU</p>
                          <motion.p
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                            className="text-5xl font-bold bg-gradient-to-r from-[var(--leak)] via-orange-500 to-amber-500 bg-clip-text text-transparent"
                          >
                            {formatCurrency(results.totalLeakage)}
                          </motion.p>
                        </div>
                        <Badge variant="warning" className="whitespace-nowrap">
                          ~5% of revenue
                        </Badge>
                      </div>

                      <div className="mt-6 p-4 rounded-2xl bg-[var(--profit)]/10 border border-[var(--profit)]/20">
                        <p className="text-sm text-gray-400 mb-1">Potential Recovery with RETENU</p>
                        <p className="text-3xl font-bold text-[var(--profit)]">
                          {formatCurrency(results.potentialRecovery)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Up to 80% of leaks can be recovered and prevented
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Leak Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[var(--leak)]" />
                      RETENU Breakdown
                    </h4>
                    {leakBreakdown.map((leak, index) => (
                      <motion.div
                        key={leak.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-gray-600 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${leak.color} flex items-center justify-center shadow-lg`}>
                              <leak.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--foreground)]">{leak.label}</p>
                              <p className="text-xs text-gray-500">
                                {((leak.value / results.totalLeakage) * 100).toFixed(0)}% of total
                              </p>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-[var(--leak)]">
                            {formatCurrency(leak.value)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* ROI Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-[var(--card)] to-[var(--background)] border-2 border-[var(--border)] shadow-xl"
                  >
                    <h4 className="text-lg font-semibold text-[var(--foreground)] mb-4">Your ROI Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-xl bg-[var(--background)]">
                        <p className="text-xs text-gray-500 mb-1">ROI</p>
                        <p className="text-2xl font-bold text-[var(--profit)]">{results.roi.toFixed(0)}%</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-[var(--background)]">
                        <p className="text-xs text-gray-500 mb-1">Payback Period</p>
                        <p className="text-2xl font-bold text-[var(--foreground)]">
                          {results.paybackPeriod.toFixed(1)} mo
                        </p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-[var(--background)]">
                        <p className="text-xs text-gray-500 mb-1">Time Saved</p>
                        <p className="text-2xl font-bold text-[var(--foreground)]">
                          {results.hoursSavedPerMonth}h/mo
                        </p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-[var(--background)]">
                        <p className="text-xs text-gray-500 mb-1">Net Benefit (Year 1)</p>
                        <p className="text-2xl font-bold text-[var(--profit)]">
                          {formatCurrency(results.netBenefit)}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-[var(--profit)]/10 to-emerald-500/5 border-2 border-[var(--profit)]/20 text-center"
                  >
                    <p className="text-lg font-semibold text-[var(--foreground)] mb-2">
                      Ready to recover {formatCurrency(results.potentialRecovery)}?
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Start your free 14-day trial and see your actual leaks in real-time
                    </p>
                    <Link href="/login">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" className="rounded-2xl shadow-lg shadow-[var(--profit)]/20">
                          Start Free Trial
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center p-12 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--card)]/30"
                >
                  <div className="text-center">
                    <Calculator className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-500 text-lg">
                      Adjust your details and click<br />
                      <span className="font-semibold text-[var(--foreground)]">&quot;Calculate My Savings&quot;</span><br />
                      to see your results
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-600 mt-12 max-w-3xl mx-auto"
        >
          * Calculations based on industry averages and typical Leakage patterns in creative agencies and professional services firms.
          Actual results may vary based on your specific business practices and implementation.
        </motion.p>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--profit), #10b981);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--profit), #10b981);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: none;
          transition: transform 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </section>
  );
}
