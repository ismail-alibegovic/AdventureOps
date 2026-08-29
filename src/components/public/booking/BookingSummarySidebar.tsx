import React from 'react';
import { Package, Addon, Departure } from '../../../types';
import {
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  HelpCircle,
  Edit3,
} from 'lucide-react';

interface BookingSummarySidebarProps {
  selectedPkg?: Package;
  selectedDate: string;
  selectedDep?: Departure;
  adultCount: number;
  childCount: number;
  selectedAddonIds: string[];
  addons: Addon[];
  language: 'bs' | 'en';
  onEditSection?: (step: number) => void;
  isMobileDrawer?: boolean;
}

export const BookingSummarySidebar: React.FC<BookingSummarySidebarProps> = ({
  selectedPkg,
  selectedDate,
  selectedDep,
  adultCount,
  childCount,
  selectedAddonIds,
  addons,
  language,
  onEditSection,
  isMobileDrawer = false,
}) => {
  const totalGuests = adultCount + childCount;

  // Calculation
  const adultSubtotal = selectedPkg ? adultCount * selectedPkg.adult_price : 0;
  const childSubtotal = selectedPkg ? childCount * selectedPkg.child_price : 0;
  const selectedAddonsList = addons.filter((a) => selectedAddonIds.includes(a.id));
  const addonsSubtotal = selectedAddonsList.reduce((sum, a) => {
    const mult = a.pricing_type === 'per_booking' ? 1 : totalGuests;
    return sum + a.price * mult;
  }, 0);

  const grandTotal = adultSubtotal + childSubtotal + addonsSubtotal;
  const grandTotalEur = Math.round(grandTotal / 1.95583);

  const pkgName = selectedPkg
    ? language === 'en'
      ? selectedPkg.name_en
      : selectedPkg.name_bs
    : language === 'en'
    ? 'Choose your adventure'
    : 'Izaberite paket';

  const depTime = selectedDep?.start_at
    ? new Date(selectedDep.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const meetTime = selectedDep?.meeting_at
    ? new Date(selectedDep.meeting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString(language === 'en' ? 'en-US' : 'bs-BA', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div
      className={`bg-[#071310] border border-[#182C24] rounded-2xl p-5 sm:p-6 space-y-6 ${
        isMobileDrawer ? 'shadow-xl' : 'sticky top-28 shadow-2xl shadow-emerald-950/20'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#182C24] pb-4">
        <div>
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
            {language === 'en' ? 'Booking Summary' : 'Sažetak Rezervacije'}
          </span>
          <h3 className="text-lg font-bold text-white font-display">
            {language === 'en' ? 'Your Adventure' : 'Vaša Avantura'}
          </h3>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Selected Tour Card Preview */}
      <div className="bg-[#0D1E18] border border-[#1F382E] rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
              {language === 'en' ? 'Selected Tour' : 'Odabrana Tura'}
            </span>
            <h4 className="text-sm font-bold text-white truncate font-display">{pkgName}</h4>
            {selectedPkg && (
              <p className="text-[11px] text-slate-400">
                {Math.round(selectedPkg.duration_minutes / 60)}h • {selectedPkg.difficulty} • {selectedPkg.river_length_km} km
              </p>
            )}
          </div>
          {onEditSection && (
            <button
              type="button"
              onClick={() => onEditSection(1)}
              className="text-xs text-slate-400 hover:text-emerald-400 p-1 transition-colors"
              title="Edit Package"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Schedule & Guests Pill List */}
      <div className="space-y-2 text-xs">
        {/* Date & Time */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0A1814] border border-[#182C24]">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-white font-medium block">{formattedDate || '—'}</span>
              {depTime && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400 inline" />
                  {language === 'en' ? 'Launch:' : 'Polazak:'} {depTime}{' '}
                  {meetTime && `(${language === 'en' ? 'Meet' : 'Baza'} ${meetTime})`}
                </span>
              )}
            </div>
          </div>
          {onEditSection && (
            <button
              type="button"
              onClick={() => onEditSection(2)}
              className="text-slate-400 hover:text-emerald-400 p-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Guests */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0A1814] border border-[#182C24]">
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-white font-medium block">
                {totalGuests} {language === 'en' ? (totalGuests === 1 ? 'Guest' : 'Guests') : 'Učesnika'}
              </span>
              <span className="text-[11px] text-slate-400">
                {adultCount} {language === 'en' ? 'Adults' : 'Odrasli'}
                {childCount > 0 && ` • ${childCount} ${language === 'en' ? 'Children' : 'Djece'}`}
              </span>
            </div>
          </div>
          {onEditSection && (
            <button
              type="button"
              onClick={() => onEditSection(2)}
              className="text-slate-400 hover:text-emerald-400 p-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Add-ons breakdown */}
      {selectedAddonsList.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-[#182C24]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            {language === 'en' ? 'Extras Included' : 'Dodatne Usluge'}
          </span>
          {selectedAddonsList.map((addon) => {
            const isPerPerson = addon.pricing_type === 'per_person';
            const cost = isPerPerson ? addon.price * totalGuests : addon.price;
            const name = language === 'en' ? addon.name_en : addon.name_bs;
            return (
              <div key={addon.id} className="flex justify-between text-xs text-slate-300">
                <span className="truncate pr-2">• {name}</span>
                <span className="text-emerald-400 font-mono shrink-0">+{cost} BAM</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Price Calculations */}
      <div className="space-y-2 pt-3 border-t border-[#182C24] text-xs">
        {selectedPkg && (
          <>
            <div className="flex justify-between text-slate-400">
              <span>
                {language === 'en' ? 'Adults' : 'Odrasli'} ({adultCount} × {selectedPkg.adult_price} BAM)
              </span>
              <span className="text-slate-200 font-mono">{adultSubtotal} BAM</span>
            </div>
            {childCount > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>
                  {language === 'en' ? 'Children' : 'Djeca'} ({childCount} × {selectedPkg.child_price} BAM)
                </span>
                <span className="text-slate-200 font-mono">{childSubtotal} BAM</span>
              </div>
            )}
            {addonsSubtotal > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>{language === 'en' ? 'Extras Subtotal' : 'Dodaci Ukupno'}</span>
                <span className="text-slate-200 font-mono">{addonsSubtotal} BAM</span>
              </div>
            )}
          </>
        )}

        {/* Total Price Display */}
        <div className="pt-3 border-t border-[#1F382E] flex items-baseline justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {language === 'en' ? 'Total to Pay' : 'Ukupno za Plaćanje'}
            </span>
            <span className="text-[11px] text-emerald-400/80">
              {language === 'en' ? 'Pay upon arrival' : 'Plaćanje na bazi'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-emerald-400 font-display font-mono">
              {grandTotal} <span className="text-sm font-semibold text-slate-300">BAM</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              (~{grandTotalEur} €)
            </span>
          </div>
        </div>
      </div>

      {/* Payment terms badge */}
      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300/90 flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <span className="leading-snug">
          {language === 'en'
            ? 'No advance online deposit required. Pay easily by cash or card on-site.'
            : 'Plaćanje na bazi Džajića Buk (gotovinom ili karticom). Bez online uplate depozita.'}
        </span>
      </div>

      {/* Trust & Guarantee points */}
      <div className="space-y-2 pt-2 border-t border-[#182C24] text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{language === 'en' ? 'Free cancellation up to 48h before trip' : 'Besplatno otkazivanje do 48h prije polaska'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{language === 'en' ? 'Base Džajića Buk • Free safe parking' : 'Baza Džajića Buk • Besplatan parking'}</span>
        </div>
      </div>
    </div>
  );
};
