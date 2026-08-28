import React from 'react';
import { useTranslation } from '../../locales/i18n';
import { MapPin, Navigation, Phone, Mail, Clock, Car, Compass, Waves } from 'lucide-react';

export const MeetingPointSection: React.FC = () => {
  const { t, language } = useTranslation();

  return (
    <section id="contact" className="py-20 bg-slate-900 text-slate-100 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Lokacija & Dolazak
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('base_title')}
          </h2>
          <p className="text-slate-400 text-base">
            {t('base_desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Base Info Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Rafting Baza Džajića Buk
                </span>
                <h3 className="text-2xl font-bold text-white">Neretva Rafting Konjic</h3>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Adresa:</strong>
                    <span>Džajići bb, 88400 Konjic, Bosna i Hercegovina</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Compass className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">GPS Koordinate:</strong>
                    <span className="font-mono text-xs text-emerald-300">43.6492° N, 17.9628° E</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Telefon / WhatsApp:</strong>
                    <a href="tel:+38761123456" className="text-emerald-400 hover:underline">
                      +387 61 123 456
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Email:</strong>
                    <a href="mailto:info@neretvaraftingkonjic.ba" className="text-emerald-400 hover:underline">
                      info@neretvaraftingkonjic.ba
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Car className="w-4 h-4 text-emerald-400" />
                  <span>Sadržaji na bazi:</span>
                </div>
                <p className="leading-relaxed">
                  {t('base_amenities')}
                </p>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Dzajica+Buk+Konjic+Rafting"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
            >
              <Navigation className="w-4 h-4" />
              <span>{t('base_open_maps')}</span>
            </a>
          </div>

          {/* Interactive Map Visual */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative min-h-[350px]">
            <iframe
              title="Base Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d46241.13768297475!2d17.930491873839217!3d43.64920677468165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x134b7f58e458bc79%3A0x6b093e7f6eb07123!2sKonjic!5e0!3m2!1sen!2sba!4v1700000000000!5m2!1sen!2sba"
              className="w-full h-full min-h-[400px] border-0 grayscale invert contrast-125 opacity-80"
              loading="lazy"
            />
            <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 backdrop-blur-md px-3 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Baza Džajića Buk • 5 km od centra Konjica</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
