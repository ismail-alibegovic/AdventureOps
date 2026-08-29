import React from 'react';
import { useTranslation } from '../../locales/i18n';
import { Package } from '../../types';
import { Clock, Users, Check, Star, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { resolveImageUrl } from '../../lib/imageAssets';

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
    <section id="packages" className="py-24 bg-[#07110F] text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <SectionHeader
            eyebrow={language === 'en' ? 'Authentic Neretva Experiences' : 'Neretva Rafting Doživljaj'}
            title={t('pkg_section_title')}
            description={t('pkg_section_subtitle')}
            align="center"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {packages.map((pkg, index) => {
            const isFeatured = pkg.featured;
            const name = language === 'en' ? pkg.name_en : pkg.name_bs;
            const shortDesc = language === 'en' ? pkg.short_description_en : pkg.short_description_bs;
            const eurAdult = Math.round(pkg.adult_price / 1.95583);
            const eurChild = Math.round(pkg.child_price / 1.95583);

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: index * 0.1, ease: 'easeOut' }}
                whileHover={{ y: -5 }}
                className={`relative flex flex-col rounded-2xl bg-[#0E1A17] border transition-all duration-200 overflow-hidden ${
                  isFeatured
                    ? 'border-emerald-500/80 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : 'border-[#1F332C] hover:border-[#2C473E] shadow-lg'
                }`}
              >
                {/* Image Header with Badge Overlay */}
                <div className="relative h-60 overflow-hidden bg-slate-900 group">
                  <img
                    src={resolveImageUrl(pkg.image_url)}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1A17] via-[#0E1A17]/30 to-transparent" />

                  {isFeatured && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{t('pkg_featured_badge')}</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#07110F]/90 text-emerald-300 border border-[#1F332C] backdrop-blur-xs">
                      {pkg.difficulty}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#07110F]/90 text-slate-200 border border-[#1F332C] backdrop-blur-xs">
                      {pkg.river_length_km} km
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 leading-snug font-display">
                        {name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {shortDesc}
                      </p>
                    </div>

                    {/* Metadata specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-3 border-y border-[#1F332C]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium">
                          {Math.round(pkg.duration_minutes / 60)}h {language === 'en' ? 'duration' : 'tura'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium">
                          Min. {pkg.minimum_age}+ {language === 'en' ? 'years' : 'god.'}
                        </span>
                      </div>
                    </div>

                    {/* Inclusions List */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        {t('pkg_includes')}
                      </span>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {pkg.included_items_json.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-snug text-slate-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-5 border-t border-[#1F332C] space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                          {pkg.adult_price} BAM
                        </span>
                        <span className="text-xs text-slate-400 ml-1.5 font-medium">
                          (~{eurAdult} €)
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{t('pkg_per_adult')}</span>
                    </div>

                    {pkg.child_price > 0 && (
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold bg-[#091412] px-3 py-1.5 rounded-lg border border-[#1F332C]">
                        <span>{language === 'en' ? 'Children (under 12):' : 'Djeca (do 12 god):'}</span>
                        <span>{pkg.child_price} BAM (~{eurChild} €)</span>
                      </div>
                    )}

                    <Button
                      variant={isFeatured ? 'primary' : 'secondary'}
                      size="md"
                      onClick={() => onSelectPackage(pkg.id)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="w-full justify-center font-bold shadow-md"
                    >
                      {t('pkg_book_btn')}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
