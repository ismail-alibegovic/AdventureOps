import React, { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { motion } from 'motion/react';
import {
  Calendar,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Users,
} from 'lucide-react';
import { Package } from '../../types';
import { Button } from '../ui/Button';

interface HeroProps {
  packages?: Package[];
  onStartBooking?: (packageId?: string, date?: string) => void;
  onBookNow?: (packageId?: string, date?: string) => void;
  onExplorePackages?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  packages = [],
  onStartBooking,
  onBookNow,
  onExplorePackages = () => {},
}) => {
  const { t, language } = useTranslation();
  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  // Sync selectedPkgId when packages load
  React.useEffect(() => {
    if (!selectedPkgId && packages.length > 0) {
      setSelectedPkgId(packages[0].id);
    }
  }, [packages, selectedPkgId]);

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (onStartBooking) {
      onStartBooking(selectedPkgId, selectedDate);
    } else if (onBookNow) {
      onBookNow(selectedPkgId, selectedDate);
    }
  };

  const selectedPkgObj = packages.find((p) => p.id === selectedPkgId) || packages[0];

  return (
    <div className="relative overflow-hidden bg-[#07110F] text-slate-100 min-h-[90vh] flex items-center">
      {/* Background Image with Initial Load Cinematic Scale */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          initial={{ scale: 1.035, opacity: 0.7 }}
          animate={{ scale: 1.0, opacity: 0.8 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=2200&q=85"
          alt="Neretva River Rafting in Konjic Canyon"
          className="w-full h-full object-cover object-center brightness-45"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07110F] via-[#07110F]/85 to-[#07110F]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07110F] via-transparent to-[#07110F]/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Main Hero Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Season Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E1A17]/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold tracking-wide backdrop-blur-md shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t('hero_tagline')}</span>
            </motion.div>

            {/* Editorial Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] font-display"
            >
              {t('hero_title')}
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed"
            >
              {t('hero_subtitle')}
            </motion.p>

            {/* Feature Points Grid */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: 'easeOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{t('hero_badge_guides')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{t('hero_badge_gear')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{t('hero_badge_experience')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">
                  {language === 'en'
                    ? 'Pay on arrival at the base (no credit card required)'
                    : 'Plaćanje na bazi po dolasku (bez kreditne kartice)'}
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => (onStartBooking ? onStartBooking() : onBookNow?.())}
                leftIcon={<Calendar className="w-5 h-5 text-slate-950" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-xl shadow-emerald-950/60 font-bold"
              >
                {t('hero_cta_book')}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={onExplorePackages}
                rightIcon={<ChevronRight className="w-4 h-4 text-slate-400" />}
              >
                {t('hero_cta_packages')}
              </Button>
            </motion.div>
          </div>

          {/* Quick Booking Availability Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5"
          >
            <div className="bg-[#0E1A17]/95 border border-[#1F332C] rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
              <div className="border-b border-[#1F332C] pb-4 mb-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                    {language === 'en' ? 'Departure Availability' : 'Provjera Termina'}
                  </span>
                  <h3 className="text-xl font-bold text-white font-display">
                    {language === 'en' ? 'Check Available Dates' : 'Slobodni Termini'}
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#13211D] border border-[#1F332C] flex items-center justify-center text-emerald-400">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <form onSubmit={handleQuickCheck} className="space-y-4">
                {/* Select Package */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {language === 'en' ? 'Select Tour Experience' : 'Izaberite Paket'}
                  </label>
                  <select
                    value={selectedPkgId}
                    onChange={(e) => setSelectedPkgId(e.target.value)}
                    className="w-full bg-[#081210] border border-[#1F332C] hover:border-[#2C473E] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all cursor-pointer"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {language === 'en' ? pkg.name_en : pkg.name_bs} – {pkg.adult_price} BAM (~{Math.round(pkg.adult_price / 1.95583)}€)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Package quick spec preview */}
                {selectedPkgObj && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#091412] border border-[#1F332C] text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{Math.round(selectedPkgObj.duration_minutes / 60)}h tour</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{selectedPkgObj.river_length_km} km</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Min. {selectedPkgObj.minimum_age}+ yrs</span>
                    </div>
                  </div>
                )}

                {/* Select Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {language === 'en' ? 'Preferred Rafting Date' : 'Željeni Datum'}
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-[#081210] border border-[#1F332C] hover:border-[#2C473E] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full justify-center shadow-lg shadow-emerald-950/40 font-bold"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {language === 'en' ? 'View Available Departures' : 'Pogledaj Slobodne Polaske'}
                  </Button>
                </div>

                <div className="text-center pt-1">
                  <span className="text-xs text-slate-400 leading-relaxed block">
                    {language === 'en'
                      ? '✓ Instant confirmation code • No credit card required'
                      : '✓ Trenutna šifra rezervacije • Bez unosa kreditne kartice'}
                  </span>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Bottom Trust Metrics Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mt-16 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[#1F332C] pt-8"
        >
          <div className="bg-[#0E1A17]/80 border border-[#1F332C] rounded-2xl p-5 text-center transition-transform hover:-translate-y-0.5 duration-150">
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
              {t('stat_length')}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-1 block">
              {t('stat_length_label')}
            </span>
          </div>
          <div className="bg-[#0E1A17]/80 border border-[#1F332C] rounded-2xl p-5 text-center transition-transform hover:-translate-y-0.5 duration-150">
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
              {t('stat_duration')}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-1 block">
              {t('stat_duration_label')}
            </span>
          </div>
          <div className="bg-[#0E1A17]/80 border border-[#1F332C] rounded-2xl p-5 text-center transition-transform hover:-translate-y-0.5 duration-150">
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
              {t('stat_rapids')}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-1 block">
              {t('stat_rapids_label')}
            </span>
          </div>
          <div className="bg-[#0E1A17]/80 border border-[#1F332C] rounded-2xl p-5 text-center transition-transform hover:-translate-y-0.5 duration-150">
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
              {t('stat_guests')}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-1 block">
              {t('stat_guests_label')}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
