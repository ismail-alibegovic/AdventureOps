import React from 'react';
import { useTranslation } from '../../locales/i18n';
import {
  ShieldCheck,
  Award,
  HeartPulse,
  UserCheck,
  CheckCircle2,
  LifeBuoy,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';

export const EquipmentSafetySection: React.FC = () => {
  const { t, language } = useTranslation();

  const features = [
    {
      icon: UserCheck,
      title: t('safety_f1_title'),
      desc: t('safety_f1_desc'),
      badge: 'IRF Certified',
    },
    {
      icon: ShieldCheck,
      title: t('safety_f2_title'),
      desc: t('safety_f2_desc'),
      badge: 'CE EN ISO',
    },
    {
      icon: HeartPulse,
      title: t('safety_f3_title'),
      desc: t('safety_f3_desc'),
      badge: 'Rescue 3 Pro',
    },
    {
      icon: Award,
      title: t('safety_f4_title'),
      desc: t('safety_f4_desc'),
      badge: '18+ Years Heritage',
    },
  ];

  const gearItems = [
    {
      name: language === 'en' ? '5mm Neoprene Wetsuit' : 'Neoprensko odijelo 5mm',
      desc:
        language === 'en'
          ? 'Reinforced knee pads, full thermal insulation, and complete movement flexibility.'
          : 'Long-john kroj sa ojačanim koljenima za potpunu termo-izolaciju i slobodu kretanja.',
      tag: 'Sizes XS to 4XL',
    },
    {
      name:
        language === 'en'
          ? 'High-Traction River Booties'
          : 'Neoprenske čizmice sa profilom',
      desc:
        language === 'en'
          ? 'Protects feet from cold and provides maximum grip on wet, slippery river rocks.'
          : 'Štite stopala od hladnoće i pružaju maksimalnu stabilnost na vlažnim i klizavim stijenama.',
      tag: 'Sizes EU 34 to 48',
    },
    {
      name:
        language === 'en'
          ? 'Certified Life Jacket (PFD 70N+)'
          : 'Spasilački prsluk (PFD 70N+)',
      desc:
        language === 'en'
          ? 'CE-tested high buoyancy vests with integrated chest harnesses and rescue collars.'
          : 'CE atestirani prsluci visoke plovnosti sa sigurnosnim pojasevima i spasilačkom omčom.',
      tag: 'CE EN ISO 12402',
    },
    {
      name:
        language === 'en'
          ? 'White-Water Safety Helmet'
          : 'Zaštitna kaciga za divlje vode',
      desc:
        language === 'en'
          ? 'Lightweight, impact-resistant ABS shell with rapid dial fit adjustment.'
          : 'Lagana, čvrsta i ventilirana konstrukcija sa brzim podešavanjem obima glave.',
      tag: 'CE EN 1385',
    },
    {
      name:
        language === 'en'
          ? 'Ergonomic T-Grip Paddle'
          : 'Ergonomsko veslo sa ojačanim perom',
      desc:
        language === 'en'
          ? 'Balanced composite shaft with high-durability polymer blade.'
          : 'Balansirana težina sa neklizajućim rukohvatom prilagođena svim učesnicima raftinga.',
      tag: 'Anodized Aluminum',
    },
    {
      name:
        language === 'en'
          ? 'Rescue Throwbag & Trauma Kit'
          : 'Spasilačko uže i prva pomoć',
      desc:
        language === 'en'
          ? 'Carried aboard every boat, operated by our certified swiftwater rescue guides.'
          : 'Obavezna oprema u svakom čamcu kojom rukuje naš licencirani IRF instruktor.',
      tag: 'Rescue 3 Standard',
    },
  ];

  return (
    <section id="safety" className="py-24 bg-[#07110F] text-slate-100 border-t border-[#162622]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <SectionHeader
            eyebrow={language === 'en' ? 'Uncompromising Safety Standards' : '100% Posvećenost Bezbjednosti'}
            title={t('safety_title')}
            description={t('safety_desc')}
            align="center"
          />
        </motion.div>

        {/* 4 Pillars of Safety */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 mt-12">
          {features.map((f, idx) => {
            const IconComp = f.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: idx * 0.08, ease: 'easeOut' }}
                whileHover={{ y: -4 }}
              >
                <Card
                  variant="elevated"
                  padding="md"
                  className="space-y-4 hover:border-emerald-500/50 transition-all duration-150 relative overflow-hidden h-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#13211D] border border-[#1F332C] flex items-center justify-center text-emerald-400">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#091412] text-emerald-300 border border-[#1F332C]">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug font-display">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Complete Gear Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Card variant="elevated" padding="lg" className="border-[#1F332C] bg-[#0E1A17]/90">
            <div className="max-w-3xl mb-8 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                {language === 'en' ? 'Certified Equipment for Every Guest' : 'Homologovana Oprema za Svakog Gosta'}
              </span>
              <h3 className="text-2xl font-bold text-white font-display">
                {language === 'en'
                  ? 'What equipment do you receive before launching?'
                  : 'Šta tačno zadužujete prije polaska na rijeku?'}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {language === 'en'
                  ? 'All gear is disinfected, washed, and dried in our heated drying room after each descent. We maintain full size ranges from children’s XS to 4XL, ensuring every guest is fitted securely.'
                  : 'Sva oprema se dezinfikuje, temeljito pere i suši nakon svakog spusta. Na bazi posjedujemo veličine od dječijih XS do 4XL, tako da je svaki gost savršeno opremljen.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gearItems.map((gear, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between p-4.5 rounded-xl bg-[#091412] border border-[#1F332C] hover:border-[#2C473E] transition-colors space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{gear.name}</span>
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-6">
                      {gear.desc}
                    </p>
                  </div>
                  <div className="pl-6">
                    <span className="inline-block text-[10px] font-semibold text-emerald-300 bg-[#13211D] px-2 py-0.5 rounded border border-[#1F332C]">
                      {gear.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Safety Reassurance Notice */}
            <div className="mt-8 pt-6 border-t border-[#1F332C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <LifeBuoy className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>{language === 'en' ? 'Non-swimmer?' : 'Niste plivač?'}</strong>{' '}
                  {language === 'en'
                    ? 'No worries! Our CE-certified high buoyancy vests keep your head effortlessly above water.'
                    : 'Nema problema! Naši certificirani prsluci visoke plovnosti drže glavu iznad vode automatski.'}
                </span>
              </div>
              <span className="text-emerald-400 font-semibold shrink-0">
                {language === 'en' ? '✓ 100% Safety Track Record' : '✓ 100% Bezbednost garantovana'}
              </span>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
