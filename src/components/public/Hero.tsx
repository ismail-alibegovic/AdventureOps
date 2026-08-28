import React, { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { Shield, Sparkles, Award, Users, Calendar, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Package } from '../../types';

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

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100 min-h-[85vh] flex items-center">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=2000&q=85"
          alt="Neretva River Rafting in Konjic Canyon"
          className="w-full h-full object-cover object-center brightness-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold tracking-wide backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('hero_tagline')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t('hero_title')}
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
              {t('hero_subtitle')}
            </p>

            {/* Feature points */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('hero_badge_guides')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('hero_badge_gear')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('hero_badge_experience')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Plaćanje na bazi (bez kartice online)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => onStartBooking()}
                className="flex items-center gap-2 px-7 py-3.5 text-base font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Calendar className="w-5 h-5" />
                <span>{t('hero_cta_book')}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={onExplorePackages}
                className="flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors backdrop-blur-xs cursor-pointer"
              >
                <span>{t('hero_cta_packages')}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Quick Booking Availability Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md">
              <div className="border-b border-slate-800 pb-4 mb-5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Brza Provjera Termina
                </span>
                <h3 className="text-xl font-bold text-white">
                  {language === 'en' ? 'Check Live River Availability' : 'Provjeri Slobodne Termine'}
                </h3>
              </div>

              <form onSubmit={handleQuickCheck} className="space-y-4">
                {/* Select Package */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'en' ? 'Choose Rafting Package' : 'Izaberite Paket'}
                  </label>
                  <select
                    value={selectedPkgId}
                    onChange={(e) => setSelectedPkgId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {language === 'en' ? pkg.name_en : pkg.name_bs} – {pkg.adult_price} BAM (~{Math.round(pkg.adult_price / 1.95583)}€)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'en' ? 'Preferred Rafting Date' : 'Željeni Datum'}
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <span>{language === 'en' ? 'View Available Departures' : 'Pogledaj Slobodne Polaske'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center pt-1">
                  <span className="text-xs text-slate-400">
                    {language === 'en'
                      ? 'No prepayment needed • Instant human-readable booking code'
                      : 'Bez online kartičnog plaćanja • Trenutna potvrda sa šifrom'}
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Trust Metric Ribbon */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800/80 pt-8">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400">{t('stat_length')}</span>
            <span className="text-xs text-slate-400 font-medium">{t('stat_length_label')}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400">{t('stat_duration')}</span>
            <span className="text-xs text-slate-400 font-medium">{t('stat_duration_label')}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400">{t('stat_rapids')}</span>
            <span className="text-xs text-slate-400 font-medium">{t('stat_rapids_label')}</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400">{t('stat_guests')}</span>
            <span className="text-xs text-slate-400 font-medium">{t('stat_guests_label')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
