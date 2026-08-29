import React, { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { FAQItem } from '../../types';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';

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
    <section id="faq" className="py-24 bg-[#07110F] text-slate-100 border-t border-[#162622]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <SectionHeader
            eyebrow={language === 'en' ? 'Frequently Asked Questions' : 'Često Postavljana Pitanja'}
            title={t('faq_title')}
            description={t('faq_subtitle')}
            align="center"
          />
        </motion.div>

        <div className="space-y-3.5 mt-10">
          {faqs.map((faq, idx) => {
            const isOpen = openId === faq.id;
            const q = language === 'en' ? faq.question_en : faq.question_bs;
            const a = language === 'en' ? faq.answer_en : faq.answer_bs;

            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className={`rounded-2xl bg-[#0E1A17] border transition-all duration-200 overflow-hidden shadow-sm ${
                  isOpen
                    ? 'border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                    : 'border-[#1F332C] hover:border-[#2C473E]'
                }`}
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-white cursor-pointer focus:outline-none select-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="leading-snug font-display">{q}</span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-lg bg-[#13211D] border border-[#1F332C] flex items-center justify-center text-emerald-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-emerald-950/80 border-emerald-500/40' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 border-t border-[#1F332C]/60 leading-relaxed">
                        <p className="pl-4.5">{a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
