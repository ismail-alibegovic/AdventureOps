import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../locales/i18n';
import { SupportedLanguage } from '../../types';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'segmented' | 'dropdown' | 'compact';
  className?: string;
  idPrefix?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'segmented',
  className = '',
  idPrefix = 'lang-switch',
}) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: SupportedLanguage; label: string; fullLabel: string; flag: string }[] = [
    { code: 'bs', label: 'BS', fullLabel: 'Bosanski', flag: '🇧🇦' },
    { code: 'en', label: 'EN', fullLabel: 'English', flag: '🇬🇧' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (variant === 'compact') {
    return (
      <button
        id={`${idPrefix}-compact`}
        onClick={() => setLanguage(language === 'bs' ? 'en' : 'bs')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all shadow-xs cursor-pointer ${className}`}
        title={`Promijeni jezik / Switch language (${language === 'bs' ? 'English' : 'Bosanski'})`}
        aria-label="Toggle language"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-emerald-400 font-extrabold uppercase">{language}</span>
        <span className="text-[11px] text-slate-400">({language === 'bs' ? 'EN' : 'BS'})</span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          id={`${idPrefix}-dropdown-btn`}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl transition-all cursor-pointer shadow-xs"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Select language"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-sm leading-none">{currentLangObj.flag}</span>
          <span className="font-bold text-slate-100">{currentLangObj.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-400' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div
            id={`${idPrefix}-dropdown-menu`}
            role="listbox"
            className="absolute right-0 mt-1.5 w-38 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`${idPrefix}-opt-${lang.code}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-emerald-950/80 text-emerald-400'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-none">{lang.flag}</span>
                    <span>{lang.fullLabel}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default: Segmented Pill Switcher
  return (
    <div
      id={`${idPrefix}-segmented`}
      className={`inline-flex items-center bg-slate-900/90 border border-slate-800 p-0.5 rounded-xl shadow-inner ${className}`}
      role="group"
      aria-label="Language switcher"
    >
      <div className="pl-1.5 pr-1 text-slate-400 flex items-center">
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      {languages.map((lang) => {
        const isSelected = language === lang.code;
        return (
          <button
            key={lang.code}
            id={`${idPrefix}-btn-${lang.code}`}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isSelected
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold scale-[1.02]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            aria-pressed={isSelected}
            aria-label={lang.fullLabel}
          >
            <span className="text-[13px] leading-none">{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
};
