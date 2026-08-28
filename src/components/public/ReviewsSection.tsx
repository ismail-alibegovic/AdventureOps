import React from 'react';
import { useTranslation } from '../../locales/i18n';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const { t, language } = useTranslation();

  const reviews = [
    {
      id: 'rev-1',
      author: 'Markus Weber',
      country: '🇩🇪 Njemačka / Munich',
      rating: 5,
      date: 'Juli 2026',
      title: 'Unbelievable experience in Rakitnica canyon!',
      comment:
        'The water of Neretva is crystal emerald and so pure you can drink it. Our skipper Haris was super experienced and kept the entire boat energized and safe. The lunch at the end was delicious Bosnian meat and fresh bread.',
    },
    {
      id: 'rev-2',
      author: 'Amra & Denis Hadžić',
      country: '🇧🇦 Sarajevo, BiH',
      rating: 5,
      date: 'Avgust 2026',
      title: 'Najbolji porodični vikend na Neretvi!',
      comment:
        'Išli smo sa dvoje djece (9 i 12 godina). Skiperi su pazili na svaki detalj, oprema je bila nova i topla, a skokovi sa stijena u kanjonu su bili nezaboravni. Sve preporuke za organizaciju!',
    },
    {
      id: 'rev-3',
      author: 'Sophie Dubois',
      country: '🇫🇷 Francuska / Lyon',
      rating: 5,
      date: 'Juni 2026',
      title: 'Top level safety and breathtaking landscapes',
      comment:
        'We booked the Full Day canyon tour. The rapids around Džajića Buk were exhilarating! The base has clean changing rooms, hot showers, and friendly staff. 10/10 rafting operator.',
    },
  ];

  return (
    <section className="py-20 bg-slate-900 text-slate-100 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>5.0 Ocjena • 500+ Verifikovanih Recenzija</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('reviews_title')}
          </h2>
          <p className="text-slate-400 text-base">
            {t('reviews_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-slate-700 transition-colors shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{rev.date}</span>
                </div>
                <h4 className="text-base font-bold text-white leading-snug">"{rev.title}"</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{rev.author}</div>
                  <div className="text-xs text-slate-400">{rev.country}</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verifikovan gost</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
