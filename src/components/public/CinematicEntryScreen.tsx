import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Waves } from 'lucide-react';

export interface CinematicEntryScreenProps {
  /** Called when the user clicks 'Begin the Journey' or presses Enter/Space */
  onEnter: () => void;
}

export const CinematicEntryScreen: React.FC<CinematicEntryScreenProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

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

  const handleBeginJourney = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    // Smooth cinematic exit duration ~750ms before unlocking main UI
    setTimeout(() => {
      onEnter();
    }, 750);
  }, [isExiting, onEnter]);

  // Keyboard navigation support (Enter / Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        // Prevent default space scroll
        if (e.key === ' ') e.preventDefault();
        handleBeginJourney();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBeginJourney]);

  return (
    <div
      id="cinematic-entry-screen"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050D0B] text-slate-100 overflow-hidden select-none"
      role="region"
      aria-label="AdventureOps Journey Entrance"
    >
      {/* 1. Subtle Environmental Topographic Background with Vignette */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 0.28 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      >
        <svg
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="topoRiverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Topographic organic canyon contours */}
          <path
            d="M-50,150 Q320,60 700,210 T1480,120"
            fill="none"
            stroke="url(#topoRiverGrad)"
            strokeWidth="1.2"
            strokeDasharray="4 6"
          />
          <path
            d="M-50,280 Q360,200 740,340 T1480,240"
            fill="none"
            stroke="url(#topoRiverGrad)"
            strokeWidth="1.5"
          />
          <path
            d="M-50,420 Q400,320 800,480 T1480,380"
            fill="none"
            stroke="url(#topoRiverGrad)"
            strokeWidth="1.8"
          />
          <path
            d="M-50,560 Q350,480 750,620 T1480,520"
            fill="none"
            stroke="url(#topoRiverGrad)"
            strokeWidth="1.5"
          />
          <path
            d="M-50,700 Q380,620 820,760 T1480,660"
            fill="none"
            stroke="url(#topoRiverGrad)"
            strokeWidth="1.2"
            strokeDasharray="6 8"
          />
        </svg>
      </motion.div>

      {/* 2. Soft Ambient Lighting & Deep Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030807] via-transparent to-[#030807]/90 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030807]/80 via-transparent to-[#030807]/80 pointer-events-none" />
      
      {/* Soft atmospheric radial glow centered behind content */}
      <motion.div
        animate={
          prefersReducedMotion
            ? { opacity: 0.12 }
            : {
                opacity: isExiting ? 0.25 : [0.12, 0.2, 0.12],
                scale: isExiting ? 1.2 : [1, 1.08, 1],
              }
        }
        transition={{
          duration: isExiting ? 0.7 : 6,
          repeat: isExiting ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[850px] h-[500px] sm:h-[650px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-[140px] pointer-events-none"
      />

      {/* 3. Central Cinematic Composition */}
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
        animate={
          isExiting
            ? { opacity: 0, y: -20, scale: 0.98 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{
          duration: isExiting ? 0.65 : 0.9,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto px-6 py-8 sm:py-12"
      >
        {/* Brand Emblem */}
        <div className="relative mb-6">
          {!prefersReducedMotion && (
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.08, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-2 rounded-2xl bg-emerald-400/20 blur-md pointer-events-none"
            />
          )}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-950 p-[1.5px] shadow-2xl shadow-emerald-950/80">
            <div className="w-full h-full bg-[#071310] rounded-[14px] flex items-center justify-center text-emerald-400 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              <Waves className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
            </div>
          </div>
        </div>

        {/* Small Eyebrow */}
        <div className="mb-3">
          <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.28em] text-emerald-400 font-mono">
            NERETVA • KONJIC • BOSNIA & HERZEGOVINA
          </span>
        </div>

        {/* Brand Wordmark */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-300 font-display mb-3">
          AdventureOps
        </h2>

        {/* Main Cinematic Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-display leading-[1.15] max-w-xl mb-4">
          Adventure begins where the road ends.
        </h1>

        {/* Supporting Copy */}
        <p className="text-sm sm:text-base text-slate-300/90 font-sans max-w-lg leading-relaxed mb-8">
          Booking, operations and unforgettable river experiences — connected in one journey.
        </p>

        {/* 4. Signature Organic River Route Vector Animation */}
        <div className="w-full max-w-[300px] sm:max-w-[380px] h-16 relative mb-10">
          <svg
            viewBox="0 0 380 64"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="entryRiverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#065f46" stopOpacity="0.4" />
                <stop offset="45%" stopColor="#10b981" stopOpacity="0.95" />
                <stop offset="75%" stopColor="#0d9488" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
              </linearGradient>

              <filter id="entryBeaconGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base River Bed Channel */}
            <path
              d="M 12,32 C 80,6 130,58 200,28 C 260,4 310,54 368,32"
              stroke="#132620"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Flowing Organic River Line */}
            <motion.path
              d="M 12,32 C 80,6 130,58 200,28 C 260,4 310,54 368,32"
              stroke="url(#entryRiverGradient)"
              strokeWidth={isExiting ? '4' : '2.8'}
              strokeLinecap="round"
              initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0.35, pathOffset: 0 }}
              animate={
                prefersReducedMotion
                  ? { pathLength: 1 }
                  : {
                      pathLength: isExiting ? 1 : [0.3, 0.8, 0.3],
                      pathOffset: isExiting ? 0 : [0, 1, 2],
                    }
              }
              transition={
                prefersReducedMotion
                  ? {}
                  : {
                      duration: isExiting ? 0.6 : 3.4,
                      repeat: isExiting ? 0 : Infinity,
                      ease: isExiting ? 'easeOut' : 'linear',
                    }
              }
            />

            {/* Glavatičevo Waypoint */}
            <circle cx="12" cy="32" r="3.5" fill="#10b981" />
            <circle cx="12" cy="32" r="7" fill="#10b981" fillOpacity="0.2" />

            {/* Rakitnica Confluence Waypoint */}
            <circle cx="200" cy="28" r="3" fill="#34d399" />

            {/* Old Bridge Konjic Waypoint */}
            <circle cx="368" cy="32" r="3.5" fill="#38bdf8" />
            <circle cx="368" cy="32" r="7" fill="#38bdf8" fillOpacity="0.2" />

            {/* Expedition Beacon / Flowing Marker */}
            {!prefersReducedMotion && (
              <motion.g
                animate={
                  isExiting
                    ? { x: 356, y: 0, opacity: [1, 0] }
                    : {
                        x: [0, 95, 188, 280, 356, 0],
                        y: [0, -21, -4, 6, 0, 0],
                      }
                }
                transition={
                  isExiting
                    ? { duration: 0.6, ease: 'easeOut' }
                    : {
                        duration: 4.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                }
              >
                <circle
                  cx="12"
                  cy="32"
                  r="4"
                  fill="#ffffff"
                  filter="url(#entryBeaconGlow)"
                />
                <circle
                  cx="12"
                  cy="32"
                  r="8.5"
                  fill="#34d399"
                  fillOpacity="0.45"
                />
              </motion.g>
            )}
          </svg>

          {/* Canyon Markers */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono tracking-wider px-1 -mt-1">
            <span>Glavatičevo</span>
            <span className="text-emerald-400/90">Rakitnica Canyon</span>
            <span>Konjic</span>
          </div>
        </div>

        {/* 5. Primary Focal Interaction CTA: "Begin the Journey →" */}
        <div className="relative group">
          {/* Subtle button ambient glow */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-40 group-hover:opacity-75 blur-md transition duration-300 pointer-events-none" />

          <button
            id="begin-journey-cta"
            type="button"
            onClick={handleBeginJourney}
            disabled={isExiting}
            aria-label="Begin the Journey to AdventureOps"
            className="relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-slate-950 font-bold text-base sm:text-lg tracking-tight shadow-xl shadow-emerald-950/60 hover:shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050D0B] cursor-pointer"
          >
            <span>Begin the Journey</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1.5 stroke-[2.4]" />
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-[11px] text-slate-400 font-mono mt-4 opacity-75">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[#10231D] text-slate-300 text-[10px] border border-[#1A382E]">Enter</kbd> or click to explore
        </p>
      </motion.div>
    </div>
  );
};
