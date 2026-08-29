import React from 'react';
import { Package, Departure, Addon } from '../../../types';
import {
  Calendar,
  Clock,
  Users,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Edit3,
  MapPin,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '../../ui/Button';

interface Step4ReviewProps {
  selectedPkg?: Package;
  selectedDate: string;
  selectedDep?: Departure;
  adultCount: number;
  childCount: number;
  selectedAddonIds: string[];
  addons: Addon[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customerNote: string;
  termsAgreed: boolean;
  setTermsAgreed: (val: boolean) => void;
  marketingConsent: boolean;
  setMarketingConsent: (val: boolean) => void;
  onEditSection: (step: number) => void;
  onSubmitBooking: () => void;
  submitting: boolean;
  language: 'bs' | 'en';
}

export const Step4Review: React.FC<Step4ReviewProps> = ({
  selectedPkg,
  selectedDate,
  selectedDep,
  adultCount,
  childCount,
  selectedAddonIds,
  addons,
  firstName,
  lastName,
  email,
  phone,
  customerNote,
  termsAgreed,
  setTermsAgreed,
  marketingConsent,
  setMarketingConsent,
  onEditSection,
  onSubmitBooking,
  submitting,
  language,
}) => {
  const totalGuests = adultCount + childCount;
  const adultSubtotal = selectedPkg ? adultCount * selectedPkg.adult_price : 0;
  const childSubtotal = selectedPkg ? childCount * selectedPkg.child_price : 0;
  const selectedAddonsList = addons.filter((a) => selectedAddonIds.includes(a.id));
  const addonsSubtotal = selectedAddonsList.reduce((sum, a) => {
    const mult = a.pricing_type === 'per_booking' ? 1 : totalGuests;
    return sum + a.price * mult;
  }, 0);

  const grandTotal = adultSubtotal + childSubtotal + addonsSubtotal;
  const grandTotalEur = Math.round(grandTotal / 1.95583);

  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString(language === 'en' ? 'en-US' : 'bs-BA', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const depTime = selectedDep?.start_at
    ? new Date(selectedDep.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const meetTime = selectedDep?.meeting_at
    ? new Date(selectedDep.meeting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5 border-b border-[#182C24] pb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          {language === 'en' ? 'Review & Confirm Your Reservation' : 'Pregled i Potvrda Rezervacije'}
        </h2>
        <p className="text-sm text-slate-400">
          {language === 'en'
            ? 'Please review all trip details before confirming. You can jump directly to any step to edit.'
            : 'Molimo pregledajte detalje prije potvrde. Klikom na "Izmijeni" možete prilagoditi bilo koji podatak.'}
        </p>
      </div>

      {/* Review Card Modules */}
      <div className="space-y-4">
        {/* 1. Adventure & Schedule */}
        <div className="bg-[#091612] border border-[#182C24] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#182C24] pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'en' ? '1. Adventure Experience' : '1. Rafting Tura & Satnica'}</span>
            </span>
            <button
              type="button"
              onClick={() => onEditSection(1)}
              className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Edit' : 'Izmijeni'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">{language === 'en' ? 'Selected Package:' : 'Odabrani Paket:'}</span>
              <strong className="text-white text-base font-display">
                {language === 'en' ? selectedPkg?.name_en : selectedPkg?.name_bs}
              </strong>
              <div className="text-xs text-slate-400 mt-0.5">
                {selectedPkg && `${Math.round(selectedPkg.duration_minutes / 60)}h • ${selectedPkg.difficulty} • ${selectedPkg.river_length_km} km`}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">{language === 'en' ? 'Date & Time:' : 'Datum i Satnica:'}</span>
              <strong className="text-white text-base font-display">{formattedDate}</strong>
              <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {language === 'en' ? 'Launch' : 'Polazak'}: {depTime} ({language === 'en' ? 'Base meeting at' : 'Sastanak na bazi u'} {meetTime})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Group Size & Extras */}
        <div className="bg-[#091612] border border-[#182C24] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#182C24] pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'en' ? '2. Group & Extras' : '2. Učesnici & Dodatne Usluge'}</span>
            </span>
            <button
              type="button"
              onClick={() => onEditSection(2)}
              className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Edit' : 'Izmijeni'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">{language === 'en' ? 'Total Guests:' : 'Broj Gostiju:'}</span>
              <strong className="text-white text-base font-display">
                {totalGuests} {language === 'en' ? (totalGuests === 1 ? 'person' : 'people') : 'osoba'}
              </strong>
              <div className="text-xs text-slate-400 mt-0.5">
                {adultCount} {language === 'en' ? 'Adults' : 'odraslih'}{' '}
                {childCount > 0 && `+ ${childCount} ${language === 'en' ? 'children' : 'djece'}`}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">{language === 'en' ? 'Selected Extras:' : 'Izabrane Dodatne Usluge:'}</span>
              {selectedAddonsList.length === 0 ? (
                <span className="text-xs text-slate-500 italic">
                  {language === 'en' ? 'None selected (Standard inclusive gear)' : 'Nema dodatnih usluga (Standardna oprema uključena)'}
                </span>
              ) : (
                <div className="space-y-1 mt-0.5">
                  {selectedAddonsList.map((a) => (
                    <div key={a.id} className="text-xs text-slate-300 flex justify-between">
                      <span>• {language === 'en' ? a.name_en : a.name_bs}</span>
                      <span className="text-emerald-400 font-mono">
                        +{a.pricing_type === 'per_booking' ? a.price : a.price * totalGuests} BAM
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Lead Guest Contact */}
        <div className="bg-[#091612] border border-[#182C24] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#182C24] pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>{language === 'en' ? '3. Lead Guest & Contact' : '3. Vođa Grupe & Kontakt'}</span>
            </span>
            <button
              type="button"
              onClick={() => onEditSection(3)}
              className="text-xs text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Edit' : 'Izmijeni'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">{language === 'en' ? 'Full Name:' : 'Ime i Prezime:'}</span>
              <strong className="text-white text-base font-display">
                {firstName} {lastName}
              </strong>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">{language === 'en' ? 'Contact Details:' : 'Kontakt Podaci:'}</span>
              <div className="text-white font-medium">{phone}</div>
              <div className="text-xs text-slate-400">{email}</div>
            </div>

            {customerNote && (
              <div className="sm:col-span-2 pt-2 border-t border-[#182C24]/60">
                <span className="text-xs text-slate-400 block">{language === 'en' ? 'Note / Special Requests:' : 'Napomena:'}</span>
                <p className="text-xs text-slate-300 italic mt-0.5">"{customerNote}"</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Total Price Box */}
        <div className="bg-gradient-to-b from-[#0E241C] to-[#071310] border border-emerald-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#1F382E] pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                {language === 'en' ? 'Total Amount Payable' : 'Ukupan Iznos za Plaćanje'}
              </span>
              <span className="text-xs text-slate-300">
                {language === 'en'
                  ? 'Payment is made directly on-site at base in cash (BAM/EUR) or card.'
                  : 'Plaćanje se vrši na bazi u Konjicu (gotovinom u BAM/EUR ili karticom).'}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-display font-mono">
                {grandTotal} <span className="text-base font-semibold text-slate-200">BAM</span>
              </div>
              <span className="text-xs text-slate-400 font-mono block">(~{grandTotalEur} €)</span>
            </div>
          </div>

          {/* Legal Checkboxes */}
          <div className="space-y-3 pt-2 text-xs text-slate-300">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                required
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#1F382E] bg-[#0A1612] text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer"
              />
              <span className="group-hover:text-white transition-colors">
                {language === 'en'
                  ? 'I agree to the Terms of Service, rafting safety standards, and cancellation policy.'
                  : 'Prihvatam uslove korištenja, sigurnosna pravila na vodi i pravila otkazivanja.'}{' '}
                <span className="text-emerald-400 font-semibold">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#1F382E] bg-[#0A1612] text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-slate-400 group-hover:text-slate-300 transition-colors">
                {language === 'en'
                  ? 'I would like to receive occasional seasonal offers and river updates (optional).'
                  : 'Želim primati obavještenja o sezonskim popustima i turama (opcionalno).'}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
