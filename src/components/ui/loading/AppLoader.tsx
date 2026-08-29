import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Waves, Compass, Sparkles, Activity } from 'lucide-react';

export interface AppLoaderProps {
  /** Optional custom title text */
  title?: string;
  /** Optional array of rotating status messages */
  messages?: string[];
  /** Fullscreen overlay or inline contained view */
  variant?: 'fullscreen' | 'contained';
  /** Public or Admin context customization */
  context?: 'public' | 'admin';
  /** Optional fixed message instead of rotating */
  staticMessage?: string;
}

const DEFAULT_PUBLIC_MESSAGES = [
  'Preparing your river adventure',
  'Loading expedition routes & packages',
  'Checking departures & canyon water levels',
  'Syncing live availability & bookings',
  'Calibrating safety standards & gear telemetry',
];

const DEFAULT_ADMIN_MESSAGES = [
  "Loading today's river operations",
  'Checking departure schedules & fleet status',
  'Syncing reservation manifests',
  'Assigning guides & safety equipment',
  'Calibrating canyon river telemetry',
];

export const AppLoader: React.FC<AppLoaderProps> = ({
  title = 'AdventureOps',
  messages,
  variant = 'fullscreen',
  context = 'public',
  staticMessage,
}) => {
  const activeMessages = messages || (context === 'admin' ? DEFAULT_ADMIN_MESSAGES : DEFAULT_PUBLIC_MESSAGES);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Rotate messages every 2.2 seconds if not reduced motion and not static
  useEffect(() => {
    if (staticMessage || prefersReducedMotion || activeMessages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % activeMessages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [activeMessages.length, staticMessage, prefersReducedMotion]);

  const displayedMessage = staticMessage || activeMessages[currentMessageIndex];

  const containerClasses =
    variant === 'fullscreen'
      ? 'fixed inset-0 z-50 flex items-center justify-center bg-[#050D0B] text-slate-100 overflow-hidden select-none'
      : 'w-full min-h-[420px] rounded-2xl flex items-center justify-center bg-[#050D0B] text-slate-100 border border-[#162622] p-8 overflow-hidden select-none relative';

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-label="AdventureOps loading screen"
    >
      {/* Background Topographic / River Contour Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="topoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <path
            d="M-100,200 Q200,100 450,250 T900,180 T1100,300"
            fill="none"
            stroke="url(#topoGrad)"
            strokeWidth="1"
          />
          <path
            d="M-100,320 Q180,240 480,380 T920,300 T1100,420"
            fill="none"
            stroke="url(#topoGrad)"
            strokeWidth="1"
          />
          <path
            d="M-100,450 Q220,380 520,500 T950,420 T1100,550"
            fill="none"
            stroke="url(#topoGrad)"
            strokeWidth="1.2"
          />
          <path
            d="M-100,600 Q200,520 500,640 T900,580 T1100,700"
            fill="none"
            stroke="url(#topoGrad)"
            strokeWidth="1"
          />
          <path
            d="M-100,750 Q250,680 550,800 T950,720 T1100,850"
            fill="none"
            stroke="url(#topoGrad)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] bg-teal-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Centered Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto px-6 py-8">
        {/* Brand Emblem */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-6"
        >
          {/* Subtle Ambient Pulse Ring */}
          {!prefersReducedMotion && (
            <motion.div
              animate={{
                scale: [1, 1.18, 1],
                opacity: [0.35, 0.1, 0.35],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-2.5 rounded-2xl bg-emerald-500/20 blur-md pointer-events-none"
            />
          )}

          {/* Logo Card */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-950 p-[1.5px] shadow-2xl shadow-emerald-950/80">
            <div className="w-full h-full bg-[#071310] rounded-[14px] flex items-center justify-center text-emerald-400 relative overflow-hidden">
              {/* Inner ambient shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              <Waves className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.2]" />
            </div>
          </div>
        </motion.div>

        {/* Brand Name & Tagline */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-1 mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            {title}
          </h1>
          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-emerald-400/90 font-mono">
            {context === 'admin' ? 'Operations Dispatch & Logistics' : 'Neretva River Expeditions • Konjic'}
          </p>
        </motion.div>

        {/* Interactive River Route Vector Flow Animation */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] h-14 relative mb-6">
          <svg
            viewBox="0 0 320 60"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gradient for River Track */}
            <defs>
              <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#065f46" stopOpacity="0.4" />
                <stop offset="40%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#0d9488" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
              </linearGradient>

              <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base River Bed Channel (faint guide track) */}
            <path
              d="M 10,30 C 70,5 110,55 170,25 C 220,2 260,50 310,30"
              stroke="#132620"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Flowing Canyon River Path */}
            <motion.path
              d="M 10,30 C 70,5 110,55 170,25 C 220,2 260,50 310,30"
              stroke="url(#riverGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0.2, pathOffset: 0 }}
              animate={
                prefersReducedMotion
                  ? { pathLength: 1 }
                  : {
                      pathLength: [0.25, 0.75, 0.25],
                      pathOffset: [0, 1, 2],
                    }
              }
              transition={
                prefersReducedMotion
                  ? {}
                  : {
                      duration: 2.8,
                      repeat: Infinity,
                      ease: 'linear',
                    }
              }
            />

            {/* Waypoint 1: Glavatičevo Start */}
            <circle cx="10" cy="30" r="3" fill="#10b981" />
            <circle cx="10" cy="30" r="6" fill="#10b981" fillOpacity="0.2" />

            {/* Waypoint 2: Rakitnica Confluence */}
            <circle cx="170" cy="25" r="2.5" fill="#34d399" />

            {/* Waypoint 3: Old Bridge Konjic Finish */}
            <circle cx="310" cy="30" r="3" fill="#38bdf8" />
            <circle cx="310" cy="30" r="6" fill="#38bdf8" fillOpacity="0.2" />

            {/* Moving Raft / Expedition Beacon */}
            {!prefersReducedMotion && (
              <motion.g
                animate={{
                  x: [0, 75, 160, 240, 300, 0],
                  y: [0, -18, -4, 5, 0, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <circle
                  cx="10"
                  cy="30"
                  r="3.5"
                  fill="#ffffff"
                  filter="url(#beaconGlow)"
                />
                <circle
                  cx="10"
                  cy="30"
                  r="7"
                  fill="#34d399"
                  fillOpacity="0.4"
                />
              </motion.g>
            )}
          </svg>

          {/* Waypoint Labels */}
          <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono tracking-wider px-1 -mt-1">
            <span>Glavatičevo</span>
            <span className="text-emerald-500/80">Rakitnica Canyon</span>
            <span>Konjic</span>
          </div>
        </div>

        {/* Rotating Loading Status Messages */}
        <div className="h-9 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayedMessage}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>{displayedMessage}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Operational Status Pill */}
        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E1E19] border border-[#1C362C] text-[10px] text-slate-400 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-300 font-semibold uppercase tracking-wider">
            Telemetry Online
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400">Class II-IV Rapids</span>
        </div>
      </div>
    </div>
  );
};
