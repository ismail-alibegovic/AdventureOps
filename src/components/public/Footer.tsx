import React from 'react';
import { useTranslation } from '../../locales/i18n';
import { Waves, Shield, Phone, Mail, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
                <Waves className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-base font-bold text-white block">NERETVA RAFTING</span>
                <span className="text-[10px] font-semibold text-emerald-400 tracking-widest uppercase">
                  Konjic • Džajića Buk
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Vodeći rafting operater na rijeci Neretvi. Preko 18 godina tradicije, certificirani IRF skiperi,
              homologovana zaštitna oprema i najukusniji hercegovački roštilj na obali rijeke.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <Shield className="w-4 h-4" />
              <span>International Rafting Federation (IRF) Partner</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Brzi Linkovi</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">
                  {t('nav_home')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('packages')} className="hover:text-emerald-400 transition-colors">
                  {t('nav_packages')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('route')} className="hover:text-emerald-400 transition-colors">
                  {t('nav_rafting')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-emerald-400 transition-colors">
                  {t('nav_safety')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-emerald-400 transition-colors">
                  {t('nav_gallery')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-emerald-400 transition-colors">
                  {t('nav_faq')}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Policies */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Informacije & Pravila</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-emerald-400 transition-colors">
                  Uslovi Korištenja
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cancellation-policy')} className="hover:text-emerald-400 transition-colors">
                  Pravila Otkazivanja
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-emerald-400 transition-colors">
                  Politika Privatnosti
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('lookup')} className="hover:text-emerald-400 transition-colors">
                  Pronađi Svoju Rezervaciju
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="text-emerald-400 hover:underline">
                  Portal za Osoblje
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Kontakt Baza</h4>
            <div className="space-y-2 text-slate-400">
              <p>Džajići bb, 88400 Konjic, BiH</p>
              <p>
                <a href="tel:+38761123456" className="hover:text-emerald-400">
                  +387 61 123 456
                </a>
              </p>
              <p>
                <a href="mailto:info@neretvaraftingkonjic.ba" className="hover:text-emerald-400">
                  info@neretvaraftingkonjic.ba
                </a>
              </p>
              <p className="text-emerald-400 font-medium">Radno vrijeme: Svaki dan 08:00 – 20:00</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 Neretva Rafting Konjic d.o.o. Sva prava zadržana.</p>
          <p className="flex items-center gap-1">
            <span>Rafting Konjic • Bosna i Hercegovina</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
