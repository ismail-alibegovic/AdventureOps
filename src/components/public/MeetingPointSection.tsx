import React from 'react';
import { useTranslation } from '../../locales/i18n';
import {
  MapPin,
  Navigation,
  Phone,
  Mail,
  Car,
  Compass,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const MeetingPointSection: React.FC = () => {
  const { t, language } = useTranslation();

  return (
    <section id="meeting-point" className="py-24 bg-[#07110F] text-slate-100 border-t border-[#162622]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <SectionHeader
            eyebrow={language === 'en' ? 'Base Location & Directions' : 'Lokacija & Dolazak'}
            title={t('base_title')}
            description={t('base_desc')}
            align="center"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-12">
          {/* Base Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-5 flex"
          >
            <Card
              variant="elevated"
              padding="lg"
              className="w-full flex flex-col justify-between space-y-6 bg-[#0E1A17]/95 border-[#1F332C]"
            >
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    {language === 'en' ? 'Riverfront Operations Base' : 'Rafting Baza Džajića Buk'}
                  </span>
                  <h3 className="text-2xl font-bold text-white font-display">
                    AdventureOps • Neretva Rafting
                  </h3>
                </div>

                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#13211D] border border-[#1F332C] flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-white block font-medium text-xs uppercase tracking-wider text-slate-400">
                        {language === 'en' ? 'Physical Address:' : 'Adresa:'}
                      </strong>
                      <span className="text-slate-200">
                        Džajići bb, 88400 Konjic, Bosnia and Herzegovina
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#13211D] border border-[#1F332C] flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-white block font-medium text-xs uppercase tracking-wider text-slate-400">
                        GPS Coordinates:
                      </strong>
                      <span className="font-mono text-xs text-emerald-400 font-bold">
                        43.6492° N, 17.9628° E
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#13211D] border border-[#1F332C] flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-white block font-medium text-xs uppercase tracking-wider text-slate-400">
                        {language === 'en' ? 'Phone / WhatsApp Desk:' : 'Telefon / WhatsApp:'}
                      </strong>
                      <a
                        href="tel:+38761123456"
                        className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                      >
                        +387 61 123 456
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#13211D] border border-[#1F332C] flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-white block font-medium text-xs uppercase tracking-wider text-slate-400">
                        Email:
                      </strong>
                      <a
                        href="mailto:info@neretvaraftingkonjic.ba"
                        className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                      >
                        info@neretvaraftingkonjic.ba
                      </a>
                    </div>
                  </div>
                </div>

                {/* Base Amenities */}
                <div className="p-4 rounded-xl bg-[#091412] border border-[#1F332C] space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-white font-bold font-display">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'en' ? 'Base Amenities:' : 'Sadržaji na Bazi:'}</span>
                  </div>
                  <p className="leading-relaxed text-slate-400">
                    {t('base_amenities')}
                  </p>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Dzajica+Buk+Konjic+Rafting"
                target="_blank"
                rel="noopener noreferrer"
                className="block pt-2"
              >
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center shadow-lg font-bold"
                  leftIcon={<Navigation className="w-4 h-4" />}
                >
                  {t('base_open_maps')}
                </Button>
              </a>
            </Card>
          </motion.div>

          {/* Interactive Map Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 rounded-2xl overflow-hidden border border-[#1F332C] bg-[#0E1A17] relative min-h-[380px] shadow-2xl"
          >
            <iframe
              title="Base Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46241.13768297475!2d17.930491873839217!3d43.64920677468165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x134b7f58e458bc79%3A0x6b093e7f6eb07123!2sKonjic!5e0!3m2!1sen!2sba!4v1700000000000!5m2!1sen!2sba"
              className="w-full h-full min-h-[420px] border-0 grayscale invert contrast-125 opacity-75"
              loading="lazy"
            />
            <div className="absolute top-4 left-4 bg-[#07110F]/95 border border-[#1F332C] backdrop-blur-md px-4 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center gap-2.5 shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="font-bold block">Base Džajića Buk</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  5 km upstream from Konjic center
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
