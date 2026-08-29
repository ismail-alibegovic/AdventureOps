import React from 'react';
import { useTranslation } from '../../locales/i18n';
import { Waves, Shield, Phone, Mail, MapPin, Search, Calendar, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: string) => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenBooking?: () => void;
  onOpenLookup?: () => void;
  onEnterAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onNavigateSection,
  onOpenBooking,
  onOpenLookup,
  onEnterAdmin,
}) => {
  const { t, language } = useTranslation();

  const handleNav = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
    } else if (onNavigate) {
      onNavigate(id);
    }
  };

  const handleLookup = () => {
    if (onOpenLookup) {
      onOpenLookup();
    } else if (onNavigate) {
      onNavigate('lookup');
    }
  };

  const handleAdmin = () => {
    if (onEnterAdmin) {
      onEnterAdmin();
    } else if (onNavigate) {
      onNavigate('admin');
    }
  };

  const handleBooking = () => {
    if (onOpenBooking) {
      onOpenBooking();
    } else if (onNavigate) {
      onNavigate('booking');
    }
  };

  return (
    <footer className="bg-[#050D0C] text-slate-400 border-t border-[#162622] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* PRIMARY BRAND COLUMN (Col span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-950/60">
                <Waves className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-lg font-bold text-white block font-display tracking-tight leading-tight">
                  AdventureOps
                </span>
                <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
                  Neretva Rafting • Konjic
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md">
              {language === 'en'
                ? 'Adventure on the Neretva, made unforgettable. Certified IRF guides, homologated CE equipment, and authentic riverside barbecue hospitality in the heart of Bosnia & Herzegovina.'
                : 'Avantura na Neretvi napravljena za pamćenje. Certificirani IRF skiperi, provjerena zaštitna oprema i autentično gostoprimstvo u Konjicu.'}
            </p>

            <div className="pt-1 flex flex-col gap-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Shield className="w-4 h-4 shrink-0" />
                <span>International Rafting Federation (IRF) Partner</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Konjic, Bosnia & Herzegovina • Operating since 2008
              </span>
            </div>
          </div>

          {/* GROUP 1: EXPLORE */}
          <div className="space-y-3.5">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider font-display">
              {language === 'en' ? 'Explore' : 'Istraži'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => handleNav('packages')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t('nav_experiences')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('route')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t('nav_river')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('gallery')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t('nav_gallery')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('safety')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t('nav_safety')}
                </button>
              </li>
            </ul>
          </div>

          {/* GROUP 2: YOUR TRIP */}
          <div className="space-y-3.5">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider font-display">
              {language === 'en' ? 'Your Trip' : 'Vaša Avantura'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={handleBooking}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('nav_book_adventure')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleLookup}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Search className="w-3 h-3 text-emerald-400" />
                  <span>{t('nav_find_booking')}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('meeting-point')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t('nav_meeting_point')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('faq')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  {t('nav_faq')}
                </button>
              </li>
            </ul>
          </div>

          {/* GROUP 3: CONTACT */}
          <div className="space-y-3.5">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider font-display">
              {language === 'en' ? 'Contact Base' : 'Kontakt Baza'}
            </h4>
            <div className="space-y-2.5 text-slate-300 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Base Džajića Buk, Džajići bb, 88400 Konjic, BiH</span>
              </p>
              <p>
                <a
                  href="tel:+38761123456"
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>+387 61 123 456</span>
                </a>
              </p>
              <p>
                <a
                  href="mailto:info@neretvaraftingkonjic.ba"
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>info@neretvaraftingkonjic.ba</span>
                </a>
              </p>
              <p>
                <a
                  href="https://wa.me/38761123456"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>WhatsApp: +387 61 123 456</span>
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR: Quiet Divider & Links */}
        <div className="mt-14 pt-8 border-t border-[#162622] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 AdventureOps • Neretva Rafting Konjic. All rights reserved.</p>
          
          <div className="flex items-center gap-4 sm:gap-6 text-slate-500">
            <button
              onClick={() => handleNav('safety')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => handleNav('safety')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms & Safety
            </button>
            <span className="text-slate-700">•</span>
            {/* Low-emphasis Staff Access Link */}
            <button
              onClick={handleAdmin}
              className="text-slate-600 hover:text-slate-400 transition-colors cursor-pointer font-normal"
              title="Internal staff dispatch workspace"
            >
              Staff access
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
