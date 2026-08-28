import React, { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { FAQItem } from '../../types';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqSectionProps {
  faqs?: FAQItem[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs = [] }) => {
  const { t, language } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  React.useEffect(() => {
    if (!openId && faqs.length > 0) {
      setOpenId(faqs[0].id);
    }
  }, [faqs, openId]);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-slate-950 text-slate-100 border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Odgovori na Vaša Pitanja
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('faq_title')}
          </h2>
          <p className="text-slate-400 text-base">
            {t('faq_subtitle')}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            const q = language === 'en' ? faq.question_en : faq.question_bs;
            const a = language === 'en' ? faq.answer_en : faq.answer_bs;

            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors hover:border-slate-700"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left text-base font-bold text-white cursor-pointer"
                >
                  <span className="pr-4">{q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-emerald-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-300 border-t border-slate-800/60 leading-relaxed">
                    {a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
