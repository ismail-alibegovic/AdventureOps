import React from 'react';
import { useTranslation } from '../../locales/i18n';
import { Star, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { Card } from '../ui/Card';

export const ReviewsSection: React.FC = () => {
  const { t, language } = useTranslation();

  const reviews = [
    {
      id: 'rev-1',
      author: 'Markus Weber',
      country: '🇩🇪 Germany / Munich',
      rating: 5,
      date: 'July 2026',
      title: 'Unbelievable experience in Rakitnica canyon!',
      comment:
        'The water of Neretva is crystal emerald and so pure you can drink it. Our skipper Haris was super experienced and kept the entire boat energized and safe. The lunch at the end was delicious grilled specialties and fresh warm bread.',
      tour: 'Neretva + Rakitnica Explorer',
    },
    {
      id: 'rev-2',
      author: 'Amra & Denis Hadžić',
      country: '🇧🇦 Sarajevo, BiH',
      rating: 5,
      date: 'August 2026',
      title:
        language === 'en'
          ? 'Best family adventure weekend in Herzegovina!'
          : 'Najbolji porodični vikend na Neretvi!',
      comment:
        language === 'en'
          ? 'We joined with two kids (ages 9 and 12). The guides paid attention to every detail, the wetsuits were warm and clean, and cliff jumping in the canyon was unforgettable. Highly recommended!'
          : 'Išli smo sa dvoje djece (9 i 12 godina). Skiperi su pazili na svaki detalj, oprema je bila nova i topla, a skokovi sa stijena u kanjonu su bili nezaboravni. Sve preporuke za organizaciju!',
      tour: 'Neretva Classic Canyon',
    },
    {
      id: 'rev-3',
      author: 'Sophie Dubois',
      country: '🇫🇷 France / Lyon',
      rating: 5,
      date: 'June 2026',
      title: 'Top level safety and breathtaking landscapes',
      comment:
        'We booked the Full Day canyon tour. The rapids around Džajića Buk were exhilarating! The base has clean changing rooms, hot showers, and friendly staff. 10/10 rafting operator.',
      tour: 'VIP Private Rafting & Gourmet',
    },
  ];

  return (
    <section className="py-24 bg-[#07110F] text-slate-100 border-t border-[#162622]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <SectionHeader
            eyebrow={language === 'en' ? 'Guest Testimonials' : 'Iskustva Gostiju'}
            title={t('reviews_title')}
            description={t('reviews_subtitle')}
            align="center"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {reviews.map((rev, idx) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ y: -4 }}
            >
              <Card
                variant="elevated"
                padding="lg"
                className="flex flex-col justify-between space-y-6 hover:border-[#2C473E] transition-all duration-150 relative bg-[#0E1A17]/90 shadow-md h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 gap-1">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-mono font-medium">
                      {rev.date}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white leading-snug font-display">
                      "{rev.title}"
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                      {rev.comment}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1F332C] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{rev.author}</div>
                    <div className="text-xs text-slate-400">{rev.country}</div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded-md bg-[#13211D] border border-[#1F332C]">
                    {rev.tour}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
