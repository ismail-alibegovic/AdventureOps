import React from 'react';
import { useTranslation } from '../../locales/i18n';
import { Package } from '../../types';
import { Clock, Users, Shield, Check, Star, ArrowRight } from 'lucide-react';

interface PackagesSectionProps {
  packages?: Package[];
  onSelectPackage?: (pkgId: string) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  packages = [],
  onSelectPackage = (_pkgId: string) => {},
}) => {
  const { t, language } = useTranslation();

  return (
    <section id="packages" className="py-20 bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Neretva Adventure
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('pkg_section_title')}
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            {t('pkg_section_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const isFeatured = pkg.featured;
            const name = language === 'en' ? pkg.name_en : pkg.name_bs;
            const shortDesc = language === 'en' ? pkg.short_description_en : pkg.short_description_bs;
            const desc = language === 'en' ? pkg.description_en : pkg.description_bs;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl bg-slate-950 border transition-all hover:translate-y-[-4px] overflow-hidden ${
                  isFeatured
                    ? 'border-emerald-500 shadow-xl shadow-emerald-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Image Header */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={pkg.image_url}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {isFeatured && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{t('pkg_featured_badge')}</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900/80 text-emerald-300 border border-slate-700">
                      {pkg.difficulty} • {pkg.river_length_km} km
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 leading-snug">{name}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{shortDesc}</p>
                    </div>

                    {/* Metadata tags */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-2 border-y border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{Math.round(pkg.duration_minutes / 60)} sati tura</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Min. {pkg.minimum_age}+ god.</span>
                      </div>
                    </div>

                    {/* Included list */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                        {t('pkg_includes')}
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {pkg.included_items_json.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl sm:text-3xl font-extrabold text-white">
                          {pkg.adult_price} BAM
                        </span>
                        <span className="text-xs text-slate-400 ml-1.5">
                          (~{Math.round(pkg.adult_price / 1.95583)} €)
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{t('pkg_per_adult')}</span>
                    </div>

                    {pkg.child_price > 0 && (
                      <div className="text-xs text-emerald-400 font-medium">
                        Djeca (do 12 god): {pkg.child_price} BAM (~{Math.round(pkg.child_price / 1.95583)} €)
                      </div>
                    )}

                    <button
                      onClick={() => onSelectPackage(pkg.id)}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                        isFeatured
                          ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>{t('pkg_book_btn')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
