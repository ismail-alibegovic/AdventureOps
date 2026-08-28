import React from 'react';
import { useTranslation } from '../../locales/i18n';
import { ShieldCheck, Award, HeartPulse, UserCheck, CheckCircle } from 'lucide-react';

export const EquipmentSafetySection: React.FC = () => {
  const { t, language } = useTranslation();

  const features = [
    {
      icon: UserCheck,
      title: t('safety_f1_title'),
      desc: t('safety_f1_desc'),
    },
    {
      icon: ShieldCheck,
      title: t('safety_f2_title'),
      desc: t('safety_f2_desc'),
    },
    {
      icon: HeartPulse,
      title: t('safety_f3_title'),
      desc: t('safety_f3_desc'),
    },
    {
      icon: Award,
      title: t('safety_f4_title'),
      desc: t('safety_f4_desc'),
    },
  ];

  const gearItems = [
    { name: 'Neoprensko odijelo 5mm', desc: 'Long-john kroj sa ojačanim koljenima za optimalnu termo-izolaciju i slobodu pokreta.' },
    { name: 'Neoprenske čizmice sa gumenim đonom', desc: 'Čuvaju stopala od hladne vode i omogućavaju stabilno kretanje po klizavim stijenama.' },
    { name: 'Sigurnosni prsluk (PFD 70N+)', desc: 'CE atestirani prsluci sa integrisanim spasilačkim pojasom i visokom plovnošću.' },
    { name: 'Vodootporna kaciga', desc: 'Lagana i prozračna zaštita glave sa podešavanjem veličine.' },
    { name: 'Aluminijumsko veslo sa ojačanim perom', desc: 'Ergonomski rukohvat prilagođen svim učesnicima.' },
    { name: 'Spasilačko uže i prva pomoć u čamcu', desc: 'Standardna oprema svakog našeg skipera instruktora.' },
  ];

  return (
    <section id="safety" className="py-20 bg-slate-900 text-slate-100 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            100% Posvećenost Bezbjednosti
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('safety_title')}
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            {t('safety_desc')}
          </p>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((f, idx) => {
            const IconComp = f.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-emerald-700/60 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center text-emerald-400">
                  <IconComp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Gear Breakdown Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="max-w-3xl mb-8 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Homologovana Oprema za Svakog Gosta
            </span>
            <h3 className="text-2xl font-bold text-white">
              Šta tačno zadužujete prije polaska na rijeku?
            </h3>
            <p className="text-sm text-slate-400">
              Sva oprema se dezinfikuje, pere i suši nakon svakog spusta. Na bazi posjedujemo veličine od dječijih XS do 4XL.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gearItems.map((gear, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">{gear.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{gear.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
