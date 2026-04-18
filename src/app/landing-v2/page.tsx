// src/app/landing-v2/page.tsx
'use client';

import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bell,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Check,
  Clock,
  AlertTriangle,
  FileText,
  ArrowUpRight,
  Minus,
  Plus,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Upload,
  Search,
  Zap,
  Star,
  Command,
  ArrowDown
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { EarlyAdopters } from '../components/landing/EarlyAdopters';

// ============================================
// HAND-DRAWN SVG ELEMENTS (Human Touch)
// ============================================

// Squiggly underline - imperfect, hand-drawn feel
function SquigglyUnderline({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 8.5C12 3.5 22 10.5 32 6.5C42 2.5 52 9.5 62 5.5C72 1.5 82 8.5 92 4.5C102 0.5 112 7.5 122 3.5C132 -0.5 142 6.5 152 2.5C162 -1.5 172 5.5 182 1.5C192 -2.5 198 4.5 198 4.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Hand-drawn circle
function HandDrawnCircle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <path
        d="M50 5C25 3 8 25 5 50C2 75 20 95 50 97C80 99 98 75 97 50C96 25 75 7 50 5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Hand-drawn arrow
function HandDrawnArrow({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 30" fill="none">
      <path
        d="M2 15C10 14 20 16 30 15C35 14.5 40 15 45 15M45 15C40 10 38 8 35 5M45 15C40 20 38 22 35 25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================
// TYPEWRITER EFFECT
// ============================================

const typewriterWords = ['unbilled hours', 'scope creep', 'late invoices', 'missing payments'];

function TypewriterText() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const word = typewriterWords[currentWordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < word.length) {
          setCurrentText(word.slice(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % typewriterWords.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, mounted]);

  // Scalable wavy underline
  const WavyUnderline = () => (
    <svg
      className="absolute -bottom-1 left-0 h-3 text-[#FF5733]/60"
      style={{ width: '100%' }}
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M0 4C5 2 10 6 15 4C20 2 25 6 30 4C35 2 40 6 45 4C50 2 55 6 60 4C65 2 70 6 75 4C80 2 85 6 90 4C95 2 100 4 100 4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );

  if (!mounted) {
    return (
      <span className="relative inline-block">
        <span className="text-[#FF5733]">unbilled hours</span>
        <WavyUnderline />
      </span>
    );
  }

  return (
    <span className="relative inline-block min-w-[2ch]">
      <span className="text-[#FF5733]">
        {currentText}
        <span className="animate-pulse text-[#FF5733]/70">|</span>
      </span>
      {currentText.length > 0 && <WavyUnderline />}
    </span>
  );
}


// ============================================
// STICKY CTA BAR
// ============================================

function StickyCTABar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (roughly 600px)
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-xl border-b border-white/5"
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo-removebg-preview.png" alt="RETENU" width={24} height={24} className="h-6 w-6 object-contain" />
          <span className="text-sm text-gray-400 hidden sm:block">Stop losing money to revenue leaks</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden md:block">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded">
              <Command className="w-3 h-3" /> K
            </span>
            {' '}to quick start
          </span>
          <Link
            href="/login"
            className="px-4 py-2 bg-[#FF5733] hover:bg-[#E84118] text-sm font-medium rounded-lg transition-colors"
          >
            Try It Free
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// INTERACTIVE PRODUCT TOUR
// ============================================

const tourSteps = [
  {
    step: 1,
    title: "Import your data",
    description: "Connect Toggl, upload CSV, or paste from any time tracker. Takes about 2 minutes.",
    icon: Upload,
    color: "#3B82F6"
  },
  {
    step: 2,
    title: "We scan for leaks",
    description: "Our engine cross-references hours logged, invoices sent, and contracts signed.",
    icon: Search,
    color: "#8B5CF6"
  },
  {
    step: 3,
    title: "Review what we found",
    description: "See exactly where money is slipping through, sorted by recoverable amount.",
    icon: AlertTriangle,
    color: "#F59E0B"
  },
  {
    step: 4,
    title: "Take action",
    description: "One-click invoice generation, client follow-ups, and scope adjustments.",
    icon: Zap,
    color: "#10B981"
  }
];

function ProductTour() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % tourSteps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <div
      className="grid md:grid-cols-2 gap-8 items-center"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Steps list */}
      <div className="space-y-4">
        {tourSteps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          return (
            <motion.button
              key={i}
              onClick={() => setActiveStep(i)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isActive
                  ? 'bg-white/5 border-[#FF5733]/50'
                  : 'bg-transparent border-white/5 hover:border-white/10'
              }`}
              animate={{ scale: isActive ? 1.02 : 1 }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${step.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: step.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">Step {step.step}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-1.5 h-1.5 rounded-full bg-[#FF5733]"
                      />
                    )}
                  </div>
                  <h4 className="font-medium text-white mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Visual preview */}
      <div className="relative">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0C0C0E] border border-white/10 rounded-xl p-6 aspect-[4/3] flex items-center justify-center"
        >
          {activeStep === 0 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#E57CD8]/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#E57CD8]">T</span>
                  </div>
                  <div className="w-8 h-8 rounded bg-[#03A9F4]/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#03A9F4]" />
                  </div>
                  <div className="w-8 h-8 rounded bg-[#FA5D00]/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#FA5D00]">H</span>
                  </div>
                  <div className="w-8 h-8 rounded bg-gray-500/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-500">Drop your files or connect</p>
              </div>
            </div>
          )}
          {activeStep === 1 && (
            <div className="w-full">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-400">Scanning 847 time entries...</span>
              </div>
              <div className="space-y-2">
                {[85, 92, 78, 100].map((progress, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-24">
                      {['Hours logged', 'Invoices', 'Contracts', 'Payments'][i]}
                    </span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className="h-full bg-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeStep === 2 && (
            <div className="w-full space-y-3">
              {[
                { client: 'Acme Corp', issue: '23.5h unbilled', amount: '$3,525', color: '#FF5733' },
                { client: 'TechStart', issue: 'Scope +40%', amount: '$2,800', color: '#F59E0B' },
                { client: 'MediaFlow', issue: 'Invoice overdue', amount: '$4,200', color: '#EF4444' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-sm text-white">{item.client}</p>
                      <p className="text-xs text-gray-500">{item.issue}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium" style={{ color: item.color }}>{item.amount}</span>
                </motion.div>
              ))}
            </div>
          )}
          {activeStep === 3 && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-8 h-8 text-emerald-500" />
              </motion.div>
              <p className="text-2xl font-light text-emerald-500 mb-2">$10,525</p>
              <p className="text-sm text-gray-500">Ready to recover</p>
              <div className="flex justify-center gap-2 mt-4">
                <button className="px-4 py-2 bg-[#FF5733] text-sm rounded-lg">Send invoices</button>
                <button className="px-4 py-2 bg-white/5 text-sm rounded-lg">Export report</button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}


// ============================================
// LIVE LEAK DETECTION FEED (Mercury/Ramp style)
// ============================================

const leakTypes = [
  { type: 'unbilled', icon: Clock, label: 'Unbilled hours', color: '#FF5733' },
  { type: 'scope', icon: AlertTriangle, label: 'Scope creep', color: '#F59E0B' },
  { type: 'overdue', icon: FileText, label: 'Overdue invoice', color: '#EF4444' },
  { type: 'missing', icon: Bell, label: 'Missing invoice', color: '#8B5CF6' },
];

const clientNames = ['Acme Corp', 'TechStart Inc', 'MediaFlow', 'DataDrive', 'CloudNine', 'PixelPerfect', 'GrowthLabs', 'ScaleUp Co'];

function generateFakeLeak() {
  const type = leakTypes[Math.floor(Math.random() * leakTypes.length)];
  const client = clientNames[Math.floor(Math.random() * clientNames.length)];
  const amount = Math.floor(Math.random() * 8000) + 500;
  const minutesAgo = Math.floor(Math.random() * 30) + 1;
  return { ...type, client, amount, minutesAgo, id: Math.random() };
}

export function LiveLeakFeed() {
  const [leaks, setLeaks] = useState<ReturnType<typeof generateFakeLeak>[]>([]);
  const [mounted, setMounted] = useState(false);

  // Initialize on client only to prevent hydration mismatch
  useEffect(() => {
    setLeaks(Array.from({ length: 4 }, generateFakeLeak));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setLeaks(prev => {
        const newLeak = generateFakeLeak();
        return [newLeak, ...prev.slice(0, 3)];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [mounted]);

  return (
    <div className="bg-[#0C0C0E] border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5733] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5733]"></span>
          </span>
          <span className="text-xs font-medium text-gray-400">Live Detection Feed</span>
        </div>
        <span className="text-[10px] text-gray-600">Simulated data</span>
      </div>
      <div className="divide-y divide-white/5">
        {!mounted ? (
          // Loading skeleton for SSR
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
                <div className="space-y-1">
                  <div className="w-20 h-3 bg-white/5 rounded animate-pulse" />
                  <div className="w-16 h-2 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="w-14 h-3 bg-white/5 rounded animate-pulse ml-auto" />
                <div className="w-10 h-2 bg-white/5 rounded animate-pulse ml-auto" />
              </div>
            </div>
          ))
        ) : (
          leaks.map((leak) => {
            const Icon = leak.icon;
            return (
              <motion.div
                key={leak.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${leak.color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: leak.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-white">{leak.client}</p>
                    <p className="text-xs text-gray-500">{leak.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums" style={{ color: leak.color }}>
                    ${leak.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-600">{leak.minutesAgo}m ago</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================
// LIVE MONEY COUNTER (Ramp style)
// ============================================

export function LiveMoneyCounter() {
  const [amount, setAmount] = useState(2847392);

  useEffect(() => {
    const interval = setInterval(() => {
      // Add random amount between $10-$500 every few seconds
      setAmount(prev => prev + Math.floor(Math.random() * 490) + 10);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-full"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs text-gray-400">Recovered by agencies</span>
      </div>
      <motion.span
        key={amount}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="text-lg font-semibold text-emerald-500 tabular-nums"
      >
        ${amount.toLocaleString()}
      </motion.span>
    </motion.div>
  );
}

// ============================================
// BEFORE/AFTER COMPARISON SLIDER
// ============================================

export function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  useEffect(() => {
    const handleGlobalMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Labels */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-gray-400">With RETENU</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Without RETENU</span>
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
        </div>
      </div>

      {/* Slider Container */}
      <div
        ref={containerRef}
        className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden cursor-ew-resize select-none border border-white/10"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchMove={handleTouchMove}
      >
        {/* BEFORE: Messy spreadsheet chaos */}
        <div className="absolute inset-0 bg-[#0C0C0E]">
          <div className="h-full p-4 md:p-6">
            {/* Fake messy spreadsheet */}
            <div className="bg-[#1a1a1f] rounded-lg p-3 h-full overflow-hidden">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="text-[10px] text-gray-600 ml-2">agency_billing_tracker_FINAL_v3_UPDATED.xlsx</span>
              </div>
              {/* Spreadsheet rows */}
              <div className="space-y-1 text-[10px] font-mono">
                {[
                  { client: 'Acme Corp', hours: '47.5', billed: '32', status: '❌ MISSING', color: 'text-red-400' },
                  { client: 'TechStart', hours: '28', billed: '28', status: '✓', color: 'text-gray-500' },
                  { client: 'MediaFlow', hours: '156', billed: '120', status: '⚠️ CHECK', color: 'text-yellow-400' },
                  { client: '???', hours: '12', billed: '-', status: '???', color: 'text-red-400' },
                  { client: 'CloudNine', hours: '89', billed: '45', status: '❌ OVERDUE', color: 'text-red-400' },
                  { client: 'DataDrive', hours: '#REF!', billed: '#N/A', status: 'ERROR', color: 'text-red-400' },
                  { client: 'PixelPerfect', hours: '200', billed: '180', status: '⚠️', color: 'text-yellow-400' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 px-2 bg-white/[0.02] rounded">
                    <span className="w-20 text-gray-400 truncate">{row.client}</span>
                    <span className="w-12 text-gray-500">{row.hours}h</span>
                    <span className="w-12 text-gray-500">{row.billed}h</span>
                    <span className={`flex-1 ${row.color}`}>{row.status}</span>
                  </div>
                ))}
              </div>
              {/* Red highlights */}
              <div className="absolute top-1/3 left-1/4 w-32 h-8 border-2 border-red-500/40 rounded animate-pulse" />
              <div className="absolute top-1/2 right-1/4 w-24 h-6 border-2 border-yellow-500/40 rounded animate-pulse" />
              {/* Sticky notes */}
              <div className="absolute top-4 right-4 w-20 h-16 bg-yellow-400/90 rounded shadow-lg transform rotate-3 p-2">
                <p className="text-[8px] text-yellow-900 font-handwriting">CHECK WITH SARAH!!!</p>
              </div>
            </div>
          </div>
        </div>

        {/* AFTER: Clean RETENU dashboard */}
        <div
          className="absolute inset-0 bg-[#09090B]"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <div className="h-full p-4 md:p-6">
            <div className="bg-[#111113] rounded-lg border border-white/10 p-4 h-full">
              {/* Clean header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#FF5733]/20 flex items-center justify-center">
                    <BarChart3 className="w-3 h-3 text-[#FF5733]" />
                  </div>
                  <span className="text-xs font-medium text-white">Revenue Overview</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded-full">All synced</span>
              </div>
              {/* Clean stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500">At Risk</p>
                  <p className="text-lg font-light text-[#FF5733]">$12,450</p>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500">Recovered</p>
                  <p className="text-lg font-light text-emerald-500">$8,200</p>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500">Clients</p>
                  <p className="text-lg font-light text-white">12</p>
                </div>
              </div>
              {/* Clean list */}
              <div className="space-y-2">
                {[
                  { client: 'Acme Corp', issue: '15.5h unbilled', amount: '$2,325', status: 'action' },
                  { client: 'MediaFlow', issue: 'Scope creep', amount: '$4,200', status: 'action' },
                  { client: 'CloudNine', issue: 'Invoice overdue', amount: '$3,400', status: 'pending' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF5733]" />
                      <div>
                        <p className="text-xs text-white">{item.client}</p>
                        <p className="text-[10px] text-gray-500">{item.issue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#FF5733] tabular-nums">{item.amount}</span>
                      <ChevronRight className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex items-center gap-0.5">
              <ChevronLeft className="w-3 h-3 text-gray-800" />
              <ChevronRight className="w-3 h-3 text-gray-800" />
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-600 mt-3">Drag to compare</p>
    </motion.div>
  );
}

// ============================================
// REAL INTEGRATION LOGOS (SVG)
// ============================================

function TogglLogo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#E57CD8"/>
      <path d="M12 6V18M12 6L8 10M12 6L16 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ClockifyLogo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#03A9F4"/>
      <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.5"/>
      <path d="M12 8V12L15 14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function HarvestLogo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#FA5D00"/>
      <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2"/>
      <circle cx="12" cy="12" r="2" fill="white"/>
    </svg>
  );
}

function StripeLogo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#635BFF"/>
      <path d="M13.5 9.5C12.5 9 11 9.2 10.5 10.5C10 12 11.5 12.5 12.5 13C13.5 13.5 14 14.5 13.5 15.5C13 16.5 11 16.8 10 16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 7V8.5M12 17V15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function QuickBooksLogo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#2CA01C"/>
      <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="1.5"/>
      <path d="M10 10V14L14 12L10 10Z" fill="white"/>
    </svg>
  );
}

// ============================================
// GRAIN TEXTURE OVERLAY (Anti-AI)
// ============================================

function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-10 opacity-[0.015]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// ============================================
// SPECIAL EFFECTS (Kept: Cursor + Dashboard Tilt)
// ============================================

// Cursor Spotlight Effect
function CursorSpotlight() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-30"
      animate={{
        x: mousePosition.x - 200,
        y: mousePosition.y - 200,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
      style={{
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(255,87,51,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
      }}
    />
  );
}

// 3D Tilt Card Component for Dashboard
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        transformPerspective: 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// ANIMATED COMPONENTS
// ============================================

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Stepper button component
const StepperInput = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix = '',
  suffix = ''
}: {
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) => (
  <div className="flex items-center gap-1">
    <button
      onClick={() => onChange(Math.max(min, value - step))}
      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF5733]/50 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"
    >
      <Minus className="w-4 h-4" />
    </button>
    <div className="w-24 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
      <span className="text-lg font-medium tabular-nums text-white">
        {prefix}{value.toLocaleString()}{suffix}
      </span>
    </div>
    <button
      onClick={() => onChange(Math.min(max, value + step))}
      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF5733]/50 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"
    >
      <Plus className="w-4 h-4" />
    </button>
  </div>
);

// Interactive Leak Calculator - redesigned to look obviously usable
function InteractiveLeakCalculator() {
  const [teamSize, setTeamSize] = useState(5);
  const [avgRate, setAvgRate] = useState(150);
  const [monthlyHours, setMonthlyHours] = useState(160);

  // Industry average leak rates
  const unbilledRate = 0.08; // 8% of hours go unbilled
  const scopeCreepRate = 0.12; // 12% scope creep on retainers
  const latePaymentPenalty = 0.05; // 5% value lost to late payments

  const monthlyRevenue = teamSize * avgRate * monthlyHours;
  const unbilledLeak = monthlyRevenue * unbilledRate;
  const scopeCreepLeak = monthlyRevenue * scopeCreepRate;
  const latePaymentLeak = monthlyRevenue * latePaymentPenalty;
  const totalLeak = unbilledLeak + scopeCreepLeak + latePaymentLeak;
  const yearlyLeak = totalLeak * 12;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#0C0C0E] border border-white/10 rounded-2xl overflow-hidden"
    >
      {/* Calculator Header */}
      <div className="bg-gradient-to-r from-[#FF5733]/10 to-transparent border-b border-white/5 px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF5733]/20 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-[#FF5733]" />
          </div>
          <div>
            <h3 className="font-medium text-white">Leak Calculator</h3>
            <p className="text-xs text-gray-500">Adjust the values to estimate your revenue leak</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs - more interactive looking */}
          <div className="space-y-6">
            {/* Team Size */}
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white">Team Size</label>
                <span className="text-xs text-gray-500">billable people</span>
              </div>
              <div className="flex items-center justify-between">
                <StepperInput
                  value={teamSize}
                  onChange={setTeamSize}
                  min={1}
                  max={50}
                  step={1}
                />
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="flex-1 ml-4 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF5733] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#FF5733]/30 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                />
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white">Hourly Rate</label>
                <span className="text-xs text-gray-500">average across team</span>
              </div>
              <div className="flex items-center justify-between">
                <StepperInput
                  value={avgRate}
                  onChange={setAvgRate}
                  min={50}
                  max={500}
                  step={10}
                  prefix="$"
                />
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={avgRate}
                  onChange={(e) => setAvgRate(Number(e.target.value))}
                  className="flex-1 ml-4 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF5733] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#FF5733]/30 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                />
              </div>
            </div>

            {/* Monthly Hours */}
            <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white">Monthly Hours</label>
                <span className="text-xs text-gray-500">per person</span>
              </div>
              <div className="flex items-center justify-between">
                <StepperInput
                  value={monthlyHours}
                  onChange={setMonthlyHours}
                  min={80}
                  max={200}
                  step={10}
                  suffix="h"
                />
                <input
                  type="range"
                  min="80"
                  max="200"
                  step="10"
                  value={monthlyHours}
                  onChange={(e) => setMonthlyHours(Number(e.target.value))}
                  className="flex-1 ml-4 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF5733] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#FF5733]/30 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                />
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed px-1">
              Based on industry averages: 8% unbilled hours, 12% scope creep, 5% late payment impact.
            </p>
          </div>

          {/* Results */}
          <div className="bg-[#09090B] rounded-xl p-6 border border-white/5">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-4">Estimated annual leak</div>

            <motion.div
              key={yearlyLeak}
              initial={{ scale: 1.05, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-light text-[#FF5733] mb-6 tabular-nums"
            >
              ${yearlyLeak.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </motion.div>

            <div className="space-y-3">
              {[
                { label: 'Unbilled hours', value: unbilledLeak * 12, color: '#FF5733' },
                { label: 'Scope creep', value: scopeCreepLeak * 12, color: '#F59E0B' },
                { label: 'Late payments', value: latePaymentLeak * 12, color: '#EF4444' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-400">{item.label}</span>
                  </div>
                  <span className="text-sm tabular-nums">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <Link
                href="/login"
                className="block w-full py-3 bg-[#FF5733] hover:bg-[#E84118] text-center font-medium rounded-lg transition-colors"
              >
                Find your actual number
              </Link>
            </div>

            {/* Extra content to fill space */}
            <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Design partner program</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>See real numbers in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// FAQ Accordion
function FAQItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-white/5">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg group-hover:text-[#FF5733] transition-colors">
          {question}
        </span>
        {isOpen ? (
          <Minus className="w-5 h-5 text-[#FF5733] flex-shrink-0" />
        ) : (
          <Plus className="w-5 h-5 text-gray-500 group-hover:text-[#FF5733] transition-colors flex-shrink-0" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-gray-400 leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function LandingV2() {
  const [activeNav, setActiveNav] = useState('product');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  // Dashboard stays fully visible longer before fading
  const heroOpacity = useTransform(scrollYProgress, [0.4, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0.4, 1], [0, -50]);

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 64; // Height of fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: 'smooth'
      });
    }
    setActiveNav(sectionId);
    setMobileMenuOpen(false);
  }, []);

  // Update active nav on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['product', 'pricing', 'faq'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveNav(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // More authentic, specific FAQs
  const faqs = [
    {
      question: "Wait, how is this different from just... checking my spreadsheets?",
      answer: "Honestly? It's not magic. We're just comparing numbers you already have—time logs vs invoices vs contracts. The difference is we do it automatically, every day, and catch the stuff that slips through when you're busy actually running your agency. Most people tell us they found money in the first week they'd completely forgotten about."
    },
    {
      question: "What if I don't use Toggl for time tracking?",
      answer: "No problem. You can upload any CSV export from whatever you use—Harvest, Clockify, even a spreadsheet you made yourself. We also have a Toggl integration if you do use it. Clockify and Harvest integrations are coming based on what users ask for most."
    },
    {
      question: "Is this actually secure? You're a small company.",
      answer: "Fair question. Your data lives in Supabase (PostgreSQL) with row-level security—meaning even we can't see other customers' data without explicitly breaking our own security model. We haven't done a formal SOC 2 audit yet (we're honest about that), but the infrastructure is solid. If that's a dealbreaker, we get it."
    },
    {
      question: "How long until I see results?",
      answer: "Most agencies find something in the first session—usually takes about 15-20 minutes to import your data and see what pops up. One user found $12,400 in unbilled hours from a single project they'd closed out 3 months ago. Your mileage will vary, but if there's money leaking, it tends to show up fast."
    },
    {
      question: "How much does it cost?",
      answer: "We offer simple, transparent pricing starting at $49/month for most agencies. No hidden fees, no long-term contracts. You can cancel anytime."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-[#FF5733]/30">
      {/* Sticky CTA bar - appears on scroll */}
      <StickyCTABar />

      {/* Cursor spotlight effect */}
      <CursorSpotlight />

      {/* Grain texture overlay - makes everything feel tactile */}
      <GrainOverlay />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image src="/logo-removebg-preview.png" alt="RETENU" width={28} height={28} className="h-7 w-7 object-contain" />
                <span className="text-lg font-bold tracking-[0.15em]">RETENU</span>
              </Link>

              <div className="hidden md:flex items-center gap-6">
                {[
                  { id: 'product', label: 'Product' },
                  { id: 'pricing', label: 'Pricing' },
                  { id: 'faq', label: 'FAQ' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-sm transition-colors relative py-1 ${
                      activeNav === item.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {item.label}
                    {activeNav === item.id && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF5733]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/api/demo" className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
                Demo
              </Link>
              <Link href="/login" className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
                Log in
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 bg-[#FF5733] hover:bg-[#E84118] text-sm font-medium transition-colors rounded-lg"
              >
                Try it free
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-[#0A0A0B] border-t border-white/5 px-6 py-4"
          >
            <div className="flex flex-col gap-2">
              {[
                { id: 'product', label: 'Product' },
                { id: 'pricing', label: 'Pricing' },
                { id: 'faq', label: 'FAQ' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left px-4 py-3 rounded-lg transition-colors ${
                    activeNav === item.id ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <Link
                href="/api/demo"
                className="px-4 py-3 text-[#FF5733] hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Try Demo
              </Link>
              <Link
                href="/login"
                className="px-4 py-3 text-gray-400 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative pt-32 pb-16 px-6 overflow-hidden"
      >
        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating dollar signs - subtle animation */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-32 left-[10%] text-4xl text-[#FF5733]/10 font-bold select-none"
          >
            $
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-48 right-[15%] text-3xl text-emerald-500/10 font-bold select-none"
          >
            $
          </motion.div>
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-64 left-[20%] text-2xl text-amber-500/10 font-bold select-none hidden md:block"
          >
            $
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-40 right-[25%] text-5xl text-[#FF5733]/5 font-bold select-none hidden lg:block"
          >
            $
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Main headline - with typewriter effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.15] tracking-tight">
              Stop losing money to
              <br />
              <TypewriterText />
            </h1>
          </motion.div>

          {/* Subheadline - honest, direct */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Unbilled hours. Scope creep nobody mentioned. Invoices sitting in &quot;draft&quot; limbo.
            <br />
            <span className="text-gray-500">We spot the gaps. You recover the money. Simple as that.</span>
          </motion.p>

          {/* CTA - single, clear */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="group px-8 py-4 bg-[#FF5733] hover:bg-[#E84118] text-lg font-medium transition-all rounded-lg flex items-center gap-3"
              >
                Try It Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/api/demo"
                className="group px-8 py-4 border border-white/20 hover:border-white/40 hover:bg-white/5 text-lg font-medium transition-all rounded-lg flex items-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Try Live Demo
              </Link>
            </div>
            <span className="text-sm text-gray-500">
              No credit card needed. Explore with sample data.
            </span>
          </motion.div>

          {/* Value proposition badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 text-sm text-gray-500 mb-20"
          >
            {[
              { icon: Clock, text: '5 min setup' },
              { icon: FileText, text: 'No integrations required' },
              { icon: Check, text: 'Design partner program' },
            ].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-full">
                <item.icon className="w-4 h-4 text-gray-600" />
                <span>{item.text}</span>
              </span>
            ))}
          </motion.div>

          {/* Dashboard Preview - Real Screenshot with 3D Tilt */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.2 }}
            className="max-w-5xl mx-auto perspective-1000"
          >
            <TiltCard className="relative">
              {/* Subtle glow - behind the dashboard */}
              <div className="absolute -inset-4 bg-gradient-to-b from-[#FF5733]/5 via-transparent to-transparent blur-3xl opacity-30 -z-10" />

              {/* Browser frame */}
              <div className="relative bg-[#0D0D0F] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0A0A0C]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-white/5 rounded text-xs text-gray-500 font-mono">
                      app.obsidian.io/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard Screenshot */}
                <div className="relative">
                  <Image
                    src="/dashboard obsidian 2.png"
                    alt="RETENU Dashboard - Revenue leak detection for agencies"
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                    priority
                  />
                  {/* Subtle gradient fade at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0D0D0F]/50 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Floating stats overlay - adds dimension */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-4 top-1/4 hidden lg:block"
              >
                <div className="bg-[#0C0C0E] border border-white/10 rounded-xl p-4 shadow-xl">
                  <div className="text-[10px] text-[#FF5733] uppercase tracking-wider mb-1">Revenue at Risk</div>
                  <div className="text-2xl font-light tabular-nums">$23,847<span className="text-gray-600">.19</span></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -left-4 bottom-1/4 hidden lg:block"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 shadow-xl">
                  <div className="text-[10px] text-emerald-500 uppercase tracking-wider mb-1">Found this week</div>
                  <div className="text-2xl font-light tabular-nums text-emerald-500">+$4,200</div>
                </div>
              </motion.div>
            </TiltCard>
          </motion.div>
        </div>
      </motion.section>

      {/* Logo Cloud - Integrations & Features (Stripe/Vercel style) */}
      <section className="pt-16 pb-6 px-6 border-y border-white/5 bg-[#09090B]/50">
        <div className="max-w-5xl mx-auto">
          {/* Features bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12"
          >
            {[
              { value: '4', suffix: '', label: 'Types of leaks we catch', prefix: '' },
              { value: '5', suffix: ' min', label: 'To import your data', prefix: '~' },
              { value: '14', suffix: ' days', label: 'Free trial', prefix: '' },
              { value: '0', suffix: '', label: 'Sales calls required', prefix: '' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-2xl md:text-3xl font-light tabular-nums group-hover:text-[#FF5733] transition-colors">
                  {stat.prefix}<AnimatedCounter value={parseFloat(stat.value)} />{stat.suffix}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Integration logos - Real SVG logos */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-6">Import from tools you already use</p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
              {/* Toggl */}
              <motion.div
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex items-center gap-2.5 text-gray-400 opacity-60 hover:opacity-100 transition-all cursor-default"
              >
                <TogglLogo className="w-7 h-7" />
                <span className="text-sm font-medium">Toggl Track</span>
              </motion.div>
              {/* Clockify */}
              <motion.div
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex items-center gap-2.5 text-gray-400 opacity-60 hover:opacity-100 transition-all cursor-default"
              >
                <ClockifyLogo className="w-7 h-7" />
                <span className="text-sm font-medium">Clockify</span>
              </motion.div>
              {/* Harvest */}
              <motion.div
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex items-center gap-2.5 text-gray-400 opacity-60 hover:opacity-100 transition-all cursor-default"
              >
                <HarvestLogo className="w-7 h-7" />
                <span className="text-sm font-medium">Harvest</span>
              </motion.div>
              {/* QuickBooks */}
              <motion.div
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex items-center gap-2.5 text-gray-400 opacity-60 hover:opacity-100 transition-all cursor-default"
              >
                <QuickBooksLogo className="w-7 h-7" />
                <span className="text-sm font-medium">QuickBooks</span>
                <span className="text-[10px] text-emerald-500/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">New</span>
              </motion.div>
              {/* Stripe */}
              <motion.div
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex items-center gap-2.5 text-gray-400 opacity-60 hover:opacity-100 transition-all cursor-default"
              >
                <StripeLogo className="w-7 h-7" />
                <span className="text-sm font-medium">Stripe</span>
                <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">Soon</span>
              </motion.div>
              {/* CSV Import */}
              <motion.div
                whileHover={{ scale: 1.05, opacity: 1 }}
                className="flex items-center gap-2.5 text-gray-400 opacity-60 hover:opacity-100 transition-all cursor-default"
              >
                <div className="w-7 h-7 rounded bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">Any CSV</span>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* How it works - conversational */}
      <section id="product" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              It&apos;s not complicated.
            </h2>
            <p className="text-gray-500 text-lg">
              Seriously, no AI magic. Just comparing numbers that should match but don&apos;t.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                title: 'Throw your data at us',
                description: "Export from Toggl, Clockify, Harvest—or just upload a CSV. We're not picky. 5 minutes, tops.",
                icon: FileText,
              },
              {
                num: '2',
                title: 'We crunch the numbers',
                description: "Hours logged ≠ hours billed? Retainer at 140%? Invoice from March still unpaid? We flag it all.",
                icon: BarChart3,
              },
              {
                num: '3',
                title: 'You plug the leaks',
                description: "See exactly where money is slipping through. One click to the details. You decide what to chase.",
                icon: TrendingUp,
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {/* Hand-drawn number circle */}
                <div className="relative w-12 h-12 mb-6">
                  <HandDrawnCircle className="absolute inset-0 w-full h-full text-[#FF5733]/30" />
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-medium text-[#FF5733]">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Hand-drawn arrow connecting steps on desktop */}
          <div className="hidden md:flex justify-center mt-8">
            <HandDrawnArrow className="w-32 h-8 text-gray-700 rotate-0" />
          </div>
        </div>
      </section>

      {/* Interactive Product Tour */}
      <section className="py-24 px-6 bg-[#09090B]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              See how it works
            </h2>
            <p className="text-gray-500 text-lg">
              From messy data to recovered revenue in 4 simple steps.
            </p>
          </motion.div>

          <ProductTour />
        </div>
      </section>

      {/* Features - Bento Grid Layout (Linear-style) */}
      <section className="py-24 px-6 bg-[#09090B]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              What we actually check for
            </h2>
            <p className="text-gray-500">
              Four types of leaks. That&apos;s it. We do these well.
            </p>
          </motion.div>

          {/* Bento Grid - Asymmetric layout like Linear */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Large card - Unbilled Hours (spans 4 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-4 bg-gradient-to-br from-[#0C0C0E] to-[#0F0F12] border border-white/5 rounded-2xl p-8 hover:border-[#FF5733]/20 transition-all group relative overflow-hidden"
            >
              {/* Subtle gradient orb */}
              <div className="absolute -right-20 -top-20 w-60 h-60 bg-[#FF5733]/5 rounded-full blur-3xl group-hover:bg-[#FF5733]/10 transition-all" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF5733]/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#FF5733]" />
                  </div>
                  <span className="text-xs text-[#FF5733] font-medium uppercase tracking-wider">Most Common</span>
                </div>
                <h3 className="text-2xl font-medium mb-3">Unbilled hours</h3>
                <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                  Your team logged time. You never billed for it. Happens more than you&apos;d think—especially on &quot;quick&quot; projects.
                </p>

                {/* Mini visualization */}
                <div className="flex items-end gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <div className="h-20 w-8 bg-white/10 rounded-t" />
                    <span className="text-[10px] text-gray-600 mt-1">Logged</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-8 bg-[#FF5733]/60 rounded-t" />
                    <span className="text-[10px] text-gray-600 mt-1">Billed</span>
                  </div>
                  <div className="flex flex-col items-center ml-2">
                    <div className="h-8 w-8 bg-[#FF5733] rounded-t animate-pulse" />
                    <span className="text-[10px] text-[#FF5733] mt-1">Missing</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Small card - Scope Creep (spans 2 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-[#0C0C0E] border border-white/5 rounded-2xl p-6 hover:border-amber-500/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Scope creep</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Client&apos;s at 28 hrs on a 20 hr retainer. You&apos;re eating the difference.
              </p>

              {/* Progress bar visualization */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">20 hrs</span>
                  <span className="text-amber-500">28 hrs</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[100%] bg-gradient-to-r from-amber-500/60 via-amber-500 to-red-500 rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* Small card - Missing Invoices (spans 2 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="md:col-span-2 bg-[#0C0C0E] border border-white/5 rounded-2xl p-6 hover:border-blue-500/20 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Missing invoices</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Project wrapped. Invoice never went out. Three months later...
              </p>

              {/* Status visualization */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-8 bg-white/5 rounded-lg flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-gray-500">Completed</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600" />
                <div className="flex-1 h-8 bg-[#FF5733]/10 border border-[#FF5733]/20 rounded-lg flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#FF5733] animate-pulse" />
                  <span className="text-xs text-[#FF5733]">No invoice</span>
                </div>
              </div>
            </motion.div>

            {/* Wide card - Late Payments (spans 4 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-4 bg-[#0C0C0E] border border-white/5 rounded-2xl p-6 hover:border-red-500/20 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                    <Bell className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Late payments</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                    Invoice is 45 days overdue. Nobody followed up because it&apos;s awkward. Meanwhile your cash flow is bleeding.
                  </p>
                </div>

                {/* Timeline visualization */}
                <div className="hidden sm:flex items-center gap-1">
                  {[0, 15, 30, 45, 60].map((day, i) => (
                    <div key={day} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                          i < 2 ? 'bg-white/5 text-gray-600' :
                          i < 3 ? 'bg-amber-500/20 text-amber-500' :
                          'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {day}
                      </div>
                      <span className="text-[9px] text-gray-600 mt-1">days</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Leak Finder - Notion-style demo */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              What could you be missing?
            </h2>
            <p className="text-gray-500">
              Quick estimate based on typical agency leak rates.
            </p>
          </motion.div>

          <InteractiveLeakCalculator />
        </div>
      </section>

      {/* Before/After + Live Feed Section */}
      <section className="py-24 px-6 bg-[#09090B]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              See the difference
            </h2>
            <p className="text-gray-500">
              From spreadsheet chaos to clarity in minutes.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Before/After Slider - takes more space */}
            <div className="lg:col-span-3">
              <BeforeAfterSlider />
            </div>

            {/* Live Leak Feed */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-medium mb-4 text-gray-300">Live Detection Preview</h3>
                <LiveLeakFeed />
                <p className="text-xs text-gray-600 mt-3 text-center">
                  Simulated feed showing what real-time detection looks like
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases - Example Scenarios */}
      <section className="py-24 px-6 bg-[#09090B]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-medium mb-4">Common scenarios we catch</h2>
            <p className="text-gray-500">Typical leak patterns our detection engine checks for.</p>
            <p className="text-gray-600 italic text-sm mt-3">Example scenarios — representative of what agencies actually encounter.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                scenario: "Unbilled Project Hours",
                description: "A completed project has 47 hours logged but only 32 hours invoiced. The remaining 15 hours at $150/hr = $2,250 left on the table.",
                amount: "$2,250",
                icon: Clock,
                color: "#3B82F6"
              },
              {
                scenario: "Retainer Overage",
                description: "Client on a 20-hour monthly retainer consistently uses 26-28 hours. That's $900-1,200/mo in free work going unnoticed.",
                amount: "$900-1,200/mo",
                icon: AlertTriangle,
                color: "#F59E0B"
              },
              {
                scenario: "Stale Draft Invoices",
                description: "Three invoices have been sitting in 'draft' status for over 45 days. Combined value: $8,400 that's not in your bank.",
                amount: "$8,400",
                icon: FileText,
                color: "#10B981"
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0C0C0E] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all"
              >
                {/* Amount badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF5733]/10 border border-[#FF5733]/20 rounded-full text-sm text-[#FF5733] mb-4">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {item.amount} at risk
                </div>

                <h3 className="text-lg font-medium text-white mb-3">{item.scenario}</h3>
                <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                  {item.description}
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Detection Type</div>
                    <div className="text-sm font-medium text-gray-300">{item.scenario}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA instead of fake social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <p className="text-gray-400 text-sm">See what revenue leaks exist in your agency</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF5733] hover:bg-[#E84118] font-medium rounded-lg transition-colors"
              >
                Start your free analysis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-gray-600">No credit card required</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Early Adopters - Honest pitch */}
      <EarlyAdopters />

      {/* Pricing - with monthly/yearly toggle */}
      <section id="pricing" className="py-24 px-6 bg-[#09090B]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Choose the plan that fits your agency. Design partners get Pro features free for 6 months.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 bg-white/5 rounded-full mb-12">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="bg-[#0C0C0E] border border-white/10 rounded-2xl p-8 flex flex-col"
            >
              <div className="text-sm text-gray-400 font-medium mb-2">Starter</div>
              <div className="text-4xl font-light mb-2">
                <motion.span
                  key={billingPeriod}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ${billingPeriod === 'monthly' ? '29' : '23'}
                </motion.span>
                <span className="text-lg text-gray-500">/mo</span>
              </div>
              {billingPeriod === 'yearly' && (
                <div className="text-xs text-emerald-500 mb-4">Billed $276/year</div>
              )}
              <div className="text-gray-500 mb-6">For small agencies</div>

              <ul className="space-y-3 text-left mb-8 flex-1">
                {[
                  'Up to 5 clients',
                  'Unbilled hours detection',
                  'Late payment alerts',
                  'CSV import',
                  'Email support',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="block w-full py-3 border border-white/10 hover:border-white/20 text-center font-medium rounded-lg transition-colors"
              >
                Try It Free
              </Link>
            </motion.div>

            {/* Pro Plan - Highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#0C0C0E] border-2 border-[#FF5733] rounded-2xl p-8 flex flex-col relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#FF5733] text-xs font-medium rounded-full">
                Most Popular
              </div>
              <div className="text-sm text-[#FF5733] font-medium mb-2">Pro</div>
              <div className="text-4xl font-light mb-2">
                <motion.span
                  key={billingPeriod}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ${billingPeriod === 'monthly' ? '49' : '39'}
                </motion.span>
                <span className="text-lg text-gray-500">/mo</span>
              </div>
              {billingPeriod === 'yearly' && (
                <div className="text-xs text-emerald-500 mb-4">Billed $468/year</div>
              )}
              <div className="text-gray-500 mb-6">For growing agencies</div>

              <ul className="space-y-3 text-left mb-8 flex-1">
                {[
                  'Unlimited clients',
                  'All detection features',
                  'Scope creep tracking',
                  'CSV + Toggl integration',
                  'Export reports',
                  'Priority support',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="block w-full py-3 bg-[#FF5733] hover:bg-[#E84118] text-center font-medium rounded-lg transition-colors"
              >
                Try It Free
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#0C0C0E] border border-white/10 rounded-2xl p-8 flex flex-col"
            >
              <div className="text-sm text-gray-400 font-medium mb-2">Enterprise</div>
              <div className="text-4xl font-light mb-2">
                <motion.span
                  key={billingPeriod}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ${billingPeriod === 'monthly' ? '99' : '79'}
                </motion.span>
                <span className="text-lg text-gray-500">/mo</span>
              </div>
              {billingPeriod === 'yearly' && (
                <div className="text-xs text-emerald-500 mb-4">Billed $948/year</div>
              )}
              <div className="text-gray-500 mb-6">For large agencies</div>

              <ul className="space-y-3 text-left mb-8 flex-1">
                {[
                  'Everything in Pro',
                  'Multiple team members',
                  'Custom integrations',
                  'API access',
                  'Dedicated account manager',
                  'Custom onboarding',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="block w-full py-3 border border-white/10 hover:border-white/20 text-center font-medium rounded-lg transition-colors"
              >
                Contact sales
              </Link>
            </motion.div>
          </div>

          {/* Money-back guarantee */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-gray-500 mt-8"
          >
            Design partners get Pro features free for 6 months — 5 spots available.
          </motion.p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-medium">Questions people actually ask</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === i}
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA - casual */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-4">
              Worst case? You waste 10 minutes.
            </h2>
            <p className="text-xl text-gray-500 mb-8">
              Best case? You recover thousands you didn&apos;t know you were losing.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF5733] hover:bg-[#E84118] text-lg font-medium rounded-lg transition-colors group"
            >
              Find your leaks
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-sm text-gray-600 mt-4">
              Free during design partner program. No credit card needed. No sales calls.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer - minimal */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image src="/logo-removebg-preview.png" alt="RETENU" width={24} height={24} className="h-6 w-6 object-contain" />
                <span className="font-bold tracking-[0.15em]">RETENU</span>
              </Link>
              <span className="text-sm text-gray-600">© {new Date().getFullYear()}</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/security" className="hover:text-white transition-colors">Security</Link>
              <Link href="/app" className="hover:text-white transition-colors flex items-center gap-1">
                Dashboard <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Additional footer info */}
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
            <p>Built by people who got tired of finding unbilled hours in spreadsheets at 2am.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => scrollToSection('product')} className="hover:text-gray-400 transition-colors">
                Product
              </button>
              <button onClick={() => scrollToSection('pricing')} className="hover:text-gray-400 transition-colors">
                Pricing
              </button>
              <button onClick={() => scrollToSection('faq')} className="hover:text-gray-400 transition-colors">
                FAQ
              </button>
              <Link href="/login" className="hover:text-gray-400 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
