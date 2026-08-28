import React, { useState } from 'react';
import { useTranslation } from '../../locales/i18n';
import { Waves, Shield, Calendar, Phone, Menu, X, Globe, UserCheck, Compass } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { t, language, setLanguage } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t('nav_home') },
    { id: 'packages', label: t('nav_packages') },
    { id: 'route', label: t('nav_rafting') },
    { id: 'safety', label: t('nav_safety') },
    { id: 'gallery', label: t('nav_gallery') },
    { id: 'faq', label: t('nav_faq') },
    { id: 'contact', label: t('nav_contact') },
  ];

  const handleNav = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-emerald-900/40 text-slate-100">
      {/* Top micro banner */}
      <div className="bg-emerald-950/80 border-b border-emerald-900/30 px-4 py-1.5 text-xs text-emerald-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              IRF Licencirani Skiperi • Konjic, BiH
            </span>
            <span className="hidden sm:inline-block text-emerald-600">•</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-emerald-300">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Džajića Buk Baza Raftinga
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="tel:+38761123456"
              className="flex items-center gap-1 text-emerald-200 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+387 61 123 456</span>
            </a>
            <button
              onClick={() => onNavigate('lookup')}
              className="text-xs text-emerald-400 hover:text-emerald-200 underline underline-offset-2 transition-colors cursor-pointer"
            >
              {t('nav_lookup_booking')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Waves className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-tight">
                NERETVA RAFTING
              </span>
              <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
                Konjic • Džajića Buk
              </span>
            </div>
          </button>

          {/* Desktop Nav items */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`transition-colors hover:text-emerald-400 cursor-pointer ${
                  currentView === link.id ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1" />
              <button
                onClick={() => setLanguage('bs')}
                className={`px-2 py-0.5 text-xs font-semibold rounded cursor-pointer transition-all ${
                  language === 'bs'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                BS
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-xs font-semibold rounded cursor-pointer transition-all ${
                  language === 'en'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
            </div>

            {/* Admin Switcher */}
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
              title="Staff Portal (Owner, Dispatcher, Guides)"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('nav_admin')}</span>
            </button>

            {/* Book Now Primary Button */}
            <button
              onClick={() => onNavigate('booking')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>{t('nav_book_now')}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'bs' ? 'en' : 'bs')}
              className="px-2.5 py-1 text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 rounded-lg uppercase"
            >
              {language}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  currentView === link.id
                    ? 'bg-emerald-950/60 text-emerald-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => handleNav('booking')}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('nav_book_now')}</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleNav('lookup')}
                className="flex-1 py-2.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg text-center"
              >
                {t('nav_lookup_booking')}
              </button>
              <button
                onClick={() => handleNav('admin')}
                className="flex-1 py-2.5 text-xs font-medium text-emerald-400 bg-slate-900 border border-slate-800 rounded-lg text-center flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t('nav_admin')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
