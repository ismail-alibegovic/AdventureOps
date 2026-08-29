import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../locales/i18n';
import { motion, AnimatePresence } from 'motion/react';
import {
  Waves,
  Phone,
  Menu,
  X,
  Search,
  ArrowRight,
  MapPin,
  Calendar,
  Compass,
  ShieldCheck,
  Image as ImageIcon,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string, params?: any) => void;
  onOpenBooking?: () => void;
  onOpenLookup?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onEnterAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView = 'home',
  onNavigate,
  onOpenBooking,
  onOpenLookup,
  onNavigateSection,
  onEnterAdmin,
}) => {
  const { t, language } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // Track scroll position to adjust navbar styling and active section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);

      // Simple active section detection for homepage
      const sections = ['packages', 'route', 'safety', 'gallery', 'faq'];
      const scrollPos = window.scrollY + 160;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          return;
        }
      }
      if (window.scrollY < 300) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    {
      id: 'packages',
      label: t('nav_experiences') || 'Experiences',
      icon: Compass,
    },
    {
      id: 'route',
      label: t('nav_river') || 'The River',
      icon: Waves,
    },
    {
      id: 'safety',
      label: t('nav_safety') || 'Safety',
      icon: ShieldCheck,
    },
    {
      id: 'gallery',
      label: t('nav_gallery') || 'Gallery',
      icon: ImageIcon,
    },
    {
      id: 'faq',
      label: t('nav_faq') || 'FAQ',
      icon: HelpCircle,
    },
  ];

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else if (onNavigate) {
      onNavigate(id);
    }
  };

  const handleBookingClick = () => {
    setMobileMenuOpen(false);
    if (onOpenBooking) {
      onOpenBooking();
    } else if (onNavigate) {
      onNavigate('booking');
    }
  };

  const handleLookupClick = () => {
    setMobileMenuOpen(false);
    if (onOpenLookup) {
      onOpenLookup();
    } else if (onNavigate) {
      onNavigate('lookup');
    }
  };

  const handleHomeClick = () => {
    setMobileMenuOpen(false);
    if (onNavigateSection) {
      onNavigateSection('home');
    } else if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#06100E]/95 backdrop-blur-xl border-b border-[#1A2E27] shadow-xl shadow-black/60 py-0'
            : 'bg-[#06100E]/80 backdrop-blur-md border-b border-[#162822] py-0'
        }`}
      >
        {/* Main Navbar Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 gap-4">
            {/* LEFT: Brand Logo & Title */}
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-xl shrink-0"
              aria-label="Neretva Rafting Konjic Home"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-900 p-0.5 shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                <div className="w-full h-full bg-[#071310]/80 rounded-[10px] flex items-center justify-center text-emerald-300 group-hover:text-white transition-colors">
                  <Waves className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white block leading-tight font-display group-hover:text-emerald-300 transition-colors">
                  AdventureOps
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-emerald-400 uppercase font-mono">
                  Neretva Rafting • Konjic
                </span>
              </div>
            </button>

            {/* CENTER: Navigation Links (Desktop) */}
            <nav
              className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1.5 rounded-full bg-[#0A1814]/80 border border-[#182C24] text-sm font-medium"
              aria-label="Main Navigation"
            >
              {navItems.map((item) => {
                const isCurrent = activeSection === item.id || currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleLinkClick(item.id)}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      isCurrent
                        ? 'text-emerald-300 bg-emerald-950/70 font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-[#11241E]'
                    }`}
                  >
                    {item.label}
                    {isCurrent && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* RIGHT: Actions (Lookup, Book CTA) */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              {/* Find Booking Button */}
              <button
                onClick={handleLookupClick}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#0A1814] hover:bg-[#11241E] border border-[#1A2E27] hover:border-[#28483D] rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                title={t('nav_find_booking')}
              >
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('nav_find_booking')}</span>
              </button>

              {/* Primary Book Button */}
              <button
                onClick={handleBookingClick}
                className="group relative inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-950/70 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <Calendar className="w-4 h-4 stroke-[2.4]" />
                <span>{t('nav_book_adventure')}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] opacity-75 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* MOBILE ACTIONS: Compact CTA + Menu Toggle */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={handleBookingClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-extrabold shadow-sm active:scale-95 transition-transform"
              >
                <Calendar className="w-3.5 h-3.5 stroke-[2.4]" />
                <span>{language === 'en' ? 'Book' : 'Rezerviši'}</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-white rounded-xl bg-[#0A1814] border border-[#1A2E27] active:bg-[#11241E] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-200" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER (Slide down / Fade) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-start">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-h-[92vh] bg-[#071310] border-b border-[#1C332A] shadow-2xl shadow-black/90 p-5 overflow-y-auto flex flex-col justify-between space-y-5"
            >
              {/* Drawer Top Row */}
              <div className="flex items-center justify-between pb-4 border-b border-[#162B23]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-700 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                    <Waves className="w-5 h-5 stroke-[2.4]" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-base font-display block leading-tight">
                      AdventureOps
                    </span>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono font-bold">
                      Neretva Rafting • Konjic
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-xl bg-[#0D2019] border border-[#1C332A] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links with large touch targets (48px+) */}
              <div className="space-y-1 py-1">
                {navItems.map((item, idx) => {
                  const IconComp = item.icon;
                  const isCurrent = activeSection === item.id || currentView === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.2 }}
                      onClick={() => handleLinkClick(item.id)}
                      className={`w-full min-h-[48px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/40 font-bold'
                          : 'text-slate-200 hover:text-white hover:bg-[#0D2019] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isCurrent
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-[#11241E] text-slate-400'
                          }`}
                        >
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </motion.button>
                  );
                })}

                {/* Find Existing Booking in Mobile Menu */}
                <motion.button
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.03, duration: 0.2 }}
                  onClick={handleLookupClick}
                  className="w-full min-h-[48px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-emerald-400 hover:bg-[#0D2019] border border-emerald-900/30 transition-all text-left cursor-pointer mt-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <span>{t('nav_find_booking')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </motion.button>
              </div>

              {/* Primary Mobile CTA Button */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleBookingClick}
                  className="w-full h-13 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/80 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Calendar className="w-4.5 h-4.5 stroke-[2.4]" />
                  <span>{t('nav_book_adventure')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Contact & Base Operations Footer inside drawer */}
              <div className="pt-4 border-t border-[#162B23] space-y-2.5 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <a
                    href="tel:+38761123456"
                    className="flex items-center gap-2 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors py-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>+387 61 123 456</span>
                  </a>
                  <span className="text-[11px] text-slate-500">Base Operations: 08:00 – 19:00</span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 py-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Džajići bb, 88400 Konjic</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

