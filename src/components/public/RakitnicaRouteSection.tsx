import React from 'react';
import { useTranslation } from '../../locales/i18n';
import { Compass, MapPin, CheckCircle2, ChevronRight, Waves, Coffee, Utensils, Shield } from 'lucide-react';

export const RakitnicaRouteSection: React.FC = () => {
  const { t, language } = useTranslation();

  const steps = [
    {
      icon: Coffee,
      title: t('route_step1_title'),
      desc: t('route_step1_desc'),
      tag: 'Baza Džajići',
    },
    {
      icon: Compass,
      title: t('route_step2_title'),
      desc: t('route_step2_desc'),
      tag: 'Glavatičevo',
    },
    {
      icon: Shield,
      title: t('route_step3_title'),
      desc: t('route_step3_desc'),
      tag: 'Start & Briefing',
    },
    {
      icon: Waves,
      title: t('route_step4_title'),
      desc: t('route_step4_desc'),
      tag: 'Rakitnica Canyon',
    },
    {
      icon: Utensils,
      title: t('route_step5_title'),
      desc: t('route_step5_desc'),
      tag: 'BBQ & Baza Konjic',
    },
  ];

  return (
    <section id="route" className="py-20 bg-slate-950 text-slate-100 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text & Steps */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Itinerar Avanture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {t('route_title')}
              </h2>
              <p className="text-slate-400 text-base">
                {t('route_subtitle')}
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-800/60 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-white">{step.title}</h4>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                          {step.tag}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column Visual / River Map Info */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80"
                alt="Neretva River Glavatičevo to Konjic"
                className="w-full h-80 object-cover brightness-75"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Kanjon Rijeke Neretve
                </span>
                <h3 className="text-2xl font-bold text-white">
                  23 Kilometra Kristalno Čiste Vode
                </h3>
                <p className="text-xs text-slate-300">
                  Prirodni rezervat netaknute flore i faune sa brzakom Džajića Buk i čuvenim ušćem rijeke Rakitnice.
                </p>
              </div>
            </div>

            {/* Quick logistical facts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-bold text-slate-400 block mb-1">Temperatura Vode</span>
                <span className="text-xl font-bold text-emerald-400">12°C - 16°C</span>
                <span className="text-xs text-slate-500 block mt-0.5">5mm neopren obezbjeđuje potpunu toplotu</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs font-bold text-slate-400 block mb-1">Klasa Brzaka</span>
                <span className="text-xl font-bold text-emerald-400">WW II – IV</span>
                <span className="text-xs text-slate-500 block mt-0.5">Prilagođeno svim uzrastima i nivoima</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
