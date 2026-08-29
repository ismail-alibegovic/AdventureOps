import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from '../../locales/i18n';

export interface BackToTopProps {
  /** Scroll threshold in pixels after which the button becomes visible */
  threshold?: number;
  /** Optional custom CSS classes for placement or styling */
  className?: string;
}

/**
 * Custom spring easing function (easeOutBack with buoyant harmonic damping).
 * Starts with strong initial velocity, sweeps smoothly up the page, and settles
 * with a subtle, tactile spring cushion upon arrival at the top.
 */
const springEaseOut = (t: number): number => {
  const c = 0.85; // Spring bounce coefficient
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

export const BackToTop: React.FC<BackToTopProps> = ({
  threshold = 320,
  className = '',
}) => {
  const { language } = useTranslation();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isSpringing, setIsSpringing] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Check reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Track scroll position & calculate scroll percentage
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsVisible(currentScrollY > threshold);

          // Calculate total scrollable height
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight > 0) {
            const progress = Math.min(100, Math.max(0, (currentScrollY / docHeight) * 100));
            setScrollProgress(progress);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  // Clean up any running animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const scrollToTop = useCallback(() => {
    // Cancel any previous scroll animation
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (prefersReducedMotion) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    const startY = window.scrollY;
    if (startY <= 0) return;

    setIsSpringing(true);

    // Duration adapted to distance: responsive range 650ms to 950ms
    const duration = Math.min(950, Math.max(650, Math.sqrt(startY) * 24));
    const startTime = performance.now();

    // User interrupt handler to stop auto-scroll if manual wheel/touch occurs
    const interruptEvents = ['wheel', 'touchstart', 'touchmove'];
    const handleInterrupt = () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
        setIsSpringing(false);
      }
      interruptEvents.forEach((ev) => window.removeEventListener(ev, handleInterrupt));
    };
    interruptEvents.forEach((ev) => window.addEventListener(ev, handleInterrupt, { passive: true }));

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Custom spring easing
      const eased = springEaseOut(progress);
      const targetY = Math.max(0, startY * (1 - Math.min(1, eased)));

      window.scrollTo(0, targetY);

      if (progress < 1) {
        animFrameRef.current = window.requestAnimationFrame(step);
      } else {
        window.scrollTo(0, 0);
        animFrameRef.current = null;
        setIsSpringing(false);
        interruptEvents.forEach((ev) => window.removeEventListener(ev, handleInterrupt));
      }
    };

    animFrameRef.current = window.requestAnimationFrame(step);
  }, [prefersReducedMotion]);

  const label = language === 'en' ? 'Back to top' : 'Povratak na vrh';

  // SVG Circular progress math (radius 18, circumference ~113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 12 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`fixed bottom-6 right-6 z-40 ${className}`}
        >
          <button
            id="back-to-top-button"
            type="button"
            onClick={scrollToTop}
            aria-label={label}
            title={label}
            className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-[#071310]/90 hover:bg-[#0C1E19] text-emerald-400 hover:text-emerald-300 border border-[#162D24] hover:border-emerald-500/50 shadow-xl shadow-black/60 backdrop-blur-md transition-all duration-300 hover:shadow-emerald-950/40 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050D0B] cursor-pointer"
          >
            {/* Subtle Progress Track Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-[2px]"
              viewBox="0 0 44 44"
            >
              {/* Background Track */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="text-emerald-950/40 stroke-current"
                strokeWidth="2"
                fill="transparent"
              />
              {/* Active Dynamic Progress Track */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="text-emerald-400/70 transition-all duration-150 stroke-current"
                strokeWidth="2"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Subtle Ambient Pulse on Hover / Springing */}
            <div
              className={`absolute -inset-1 rounded-full bg-emerald-500/15 blur-sm transition-opacity duration-300 pointer-events-none ${
                isSpringing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            />

            {/* Icon with Spring Micro-Animation on Click */}
            <motion.div
              animate={
                isSpringing && !prefersReducedMotion
                  ? { y: [0, -6, 2, -1, 0] }
                  : {}
              }
              transition={{
                duration: 0.7,
                times: [0, 0.3, 0.65, 0.85, 1],
                ease: 'easeOut',
              }}
            >
              <ArrowUp className="w-5 h-5 stroke-[2.3] transition-transform duration-200 group-hover:-translate-y-0.5" />
            </motion.div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

