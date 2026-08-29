import React from 'react';
import { useTranslation } from '../../locales/i18n';
import {
  Compass,
  Waves,
  Coffee,
  Utensils,
  Shield,
  ArrowRight,
  Gauge,
  Thermometer,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { ASSET_IMAGES } from '../../lib/imageAssets';

interface RakitnicaRouteSectionProps {
  onBookRakitnica?: () => void;
}

export const RakitnicaRouteSection: React.FC<RakitnicaRouteSectionProps> = ({
  onBookRakitnica,
}) => {
  const { t, language } = useTranslation();

  const steps = [
    {
      icon: Coffee,
      title: t('route_step1_title'),
      desc: t('route_step1_desc'),
      tag: 'Base Džajići',
      time: '09:00',
    },
    {
      icon: Compass,
      title: t('route_step2_title'),
      desc: t('route_step2_desc'),
      tag: 'Glavatičevo',
      time: '10:00',
    },
    {
      icon: Shield,
      title: t('route_step3_title'),
      desc: t('route_step3_desc'),
      tag: 'Launch & Briefing',
      time: '10:45',
    },
    {
      icon: Waves,
      title: t('route_step4_title'),
      desc: t('route_step4_desc'),
      tag: 'Rakitnica Canyon',
      time: '12:30',
    },
    {
      icon: Utensils,
      title: t('route_step5_title'),
      desc: t('route_step5_desc'),
      tag: 'Riverside BBQ Lunch',
      time: '15:00',
    },
  ];

  return (
    <section id="route" className="py-24 bg-[#07110F] text-slate-100 border-t border-[#162622]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Narrative Timeline */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <SectionHeader
                eyebrow={language === 'en' ? '23 km Epic River Journey' : 'Itinerar & Kanjon Avantura'}
                title={t('route_title')}
                description={t('route_subtitle')}
                align="left"
                className="mb-6"
              />
            </motion.div>

            <div className="space-y-3 pt-2 relative">
              {/* Connecting line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-[#1F332C] hidden sm:block pointer-events-none" />

              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.4, delay: idx * 0.08, ease: 'easeOut' }}
                    className="relative flex items-start gap-4 p-4.5 rounded-2xl bg-[#0E1A17] border border-[#1F332C] hover:border-[#2C473E] transition-all hover:translate-x-1 duration-150 group shadow-sm"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#13211D] border border-[#1F332C] flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-950/60 group-hover:border-emerald-500/40 transition-colors z-10">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-emerald-400 font-bold">
                            {step.time}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-white font-display">
                            {step.title}
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#13211D] text-emerald-300 border border-[#1F332C]">
                          {step.tag}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: River Facts & Visual Landscape */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="relative rounded-2xl overflow-hidden border border-[#1F332C] shadow-2xl bg-[#0E1A17] group">
              <img
                src={ASSET_IMAGES.routeCanyon}
                alt="Neretva River Glavatičevo to Konjic"
                className="w-full h-88 object-cover brightness-65 group-hover:scale-103 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07110F] via-[#07110F]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  {language === 'en' ? 'Neretva River Canyon' : 'Kanjon Rijeke Neretve'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                  {language === 'en'
                    ? '23 Kilometres of Crystal-Clear Alpine Water'
                    : '23 Kilometra Kristalno Čiste Vode'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'en'
                    ? 'Protected nature reserve featuring untouched wilderness, deep emerald pools, Džajića Buk rapid, and the dramatic canyon of the Rakitnica tributary.'
                    : 'Zaštićeni prirodni rezervat netaknute flore i faune sa brzakom Džajića Buk i čuvenim ušćem rijeke Rakitnice.'}
                </p>
              </div>
            </div>

            {/* Logistical Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#0E1A17] border border-[#1F332C] space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <Thermometer className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'en' ? 'Water Temperature' : 'Temperatura Vode'}</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-400 font-display pt-1">
                  12°C – 16°C
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'en'
                    ? '5mm professional neoprene wetsuits provide 100% warmth, insulation, and full comfort.'
                    : '5mm profesionalna neopren odijela pružaju stopostotnu toplotu i udobnost.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0E1A17] border border-[#1F332C] space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'en' ? 'Rapids Classification' : 'Klasa Brzaka'}</span>
                </div>
                <div className="text-2xl font-extrabold text-emerald-400 font-display pt-1">
                  Class II – IV
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'en'
                    ? 'Exhilarating, dynamic white-water suitable for beginners, families, and seasoned adventurers.'
                    : 'Uzbudljivo, dinamično i prilagođeno i porodicama i iskusnim rafterima.'}
                </p>
              </div>
            </div>

            {onBookRakitnica && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onBookRakitnica}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full justify-center shadow-lg font-bold"
                >
                  {language === 'en' ? 'Book Canyon Explorer Tour' : 'Rezerviši Rakitnica Kanjon Turu'}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
