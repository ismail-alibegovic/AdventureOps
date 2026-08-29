import React from 'react';
import { Package, Departure, Addon } from '../../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Sparkles,
  Info,
  Shield,
} from 'lucide-react';

interface Step2DateGuestsProps {
  selectedPkg?: Package;
  selectedDate: string;
  onChangeDate: (date: string) => void;
  calendarDates: Array<{ date: string; has_availability: boolean; spots_left: number }>;
  departures: Departure[];
  selectedDepartureId: string;
  onSelectDeparture: (id: string) => void;
  adultCount: number;
  setAdultCount: React.Dispatch<React.SetStateAction<number>>;
  childCount: number;
  setChildCount: React.Dispatch<React.SetStateAction<number>>;
  addons: Addon[];
  selectedAddonIds: string[];
  onToggleAddon: (id: string) => void;
  language: 'bs' | 'en';
}

export const Step2DateGuests: React.FC<Step2DateGuestsProps> = ({
  selectedPkg,
  selectedDate,
  onChangeDate,
  calendarDates,
  departures,
  selectedDepartureId,
  onSelectDeparture,
  adultCount,
  setAdultCount,
  childCount,
  setChildCount,
  addons,
  selectedAddonIds,
  onToggleAddon,
  language,
}) => {
  const totalGuests = adultCount + childCount;
  const selectedDep = departures.find(
    (d) => d.id === selectedDepartureId || (d as any).departure_id === selectedDepartureId
  );
  const spotsRemaining = selectedDep
    ? selectedDep.spots_left ?? (selectedDep as any).available_capacity ?? Math.max(0, selectedDep.capacity_limit - (selectedDep.booked_guests || 0))
    : 0;
  const isOverCapacity = selectedDep && spotsRemaining < totalGuests;

  const todayStr = new Date().toISOString().split('T')[0];

  // Quick next 6 days suggestions for convenient single-click booking
  const quickDates = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // starting tomorrow
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5 border-b border-[#182C24] pb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          {language === 'en' ? 'Date, Departure & Guests' : 'Datum, Satnica i Broj Učesnika'}
        </h2>
        <p className="text-sm text-slate-400">
          {language === 'en'
            ? 'Choose your adventure date, select an open departure slot, and specify your group size.'
            : 'Izaberite datum raftinga, odgovarajući polazak i navedite broj osoba u vašoj grupi.'}
        </p>
      </div>

      {/* SECTION 1: DATE SELECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <span>1. {language === 'en' ? 'Select Date' : 'Izaberite Datum'}</span>
          </label>
          <span className="text-xs text-emerald-400">
            {language === 'en' ? 'Season open daily' : 'Sezona otvorena svakodnevno'}
          </span>
        </div>

        {/* Quick Date Chips */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {quickDates.map((dateStr, idx) => {
            const isSelected = selectedDate === dateStr;
            const dateObj = new Date(dateStr);
            const dayName = dateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'bs-BA', { weekday: 'short' });
            const dayNum = dateObj.getDate();
            const monthName = dateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'bs-BA', { month: 'short' });

            return (
              <button
                key={`quick-date-${dateStr}-${idx}`}
                type="button"
                onClick={() => onChangeDate(dateStr)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/80 border-emerald-400 text-white ring-2 ring-emerald-400/20 shadow-md'
                    : 'bg-[#0A1612] border-[#182C24] text-slate-300 hover:border-[#2C4E40] hover:bg-[#0D1E18]'
                }`}
              >
                <span className="block text-[10px] uppercase font-semibold text-slate-400">{dayName}</span>
                <span className="block text-base sm:text-lg font-black font-display text-white">{dayNum}</span>
                <span className="block text-[10px] text-emerald-400">{monthName}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Date Input for full calendar range */}
        <div className="bg-[#091612] border border-[#182C24] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-300 block">
              {language === 'en' ? 'Or pick any specific date:' : 'Ili izaberite drugi datum:'}
            </span>
            <span className="text-[11px] text-slate-400">
              {language === 'en' ? 'Departures running from April through October' : 'Polasci se organizuju od aprila do oktobra'}
            </span>
          </div>

          <div className="relative min-w-[220px]">
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => onChangeDate(e.target.value)}
              className="w-full bg-[#0E201A] border border-[#1F382E] focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/20 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: DEPARTURE TIME SLOTS */}
      <div className="space-y-4 pt-4 border-t border-[#182C24]">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>2. {language === 'en' ? 'Choose Departure Time' : 'Odaberite Vrijeme Polaska'}</span>
          </label>
          <span className="text-xs text-slate-400">
            {language === 'en' ? 'Date: ' : 'Za datum: '}
            <strong className="text-white font-mono">{selectedDate}</strong>
          </span>
        </div>

        {departures.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#091612] border border-[#182C24] text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="text-base font-bold text-white font-display">
              {language === 'en' ? 'No scheduled slots found for this date' : 'Nema otvorenih polazaka za ovaj datum'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {language === 'en'
                ? 'Please choose another date above or contact us via WhatsApp for custom group arrangements.'
                : 'Izaberite drugi datum iznad ili nam pošaljite poruku na WhatsApp za vanredni grupni termin.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {departures.map((dep, idx) => {
              const depKey = dep.id || (dep as any).departure_id || `dep-slot-${dep.start_at}-${idx}`;
              const isSelected = selectedDepartureId === dep.id || selectedDepartureId === (dep as any).departure_id;
              const spots = dep.spots_left ?? (dep as any).available_capacity ?? Math.max(0, dep.capacity_limit - (dep.booked_guests || 0));
              const isFull = spots <= 0;
              const isLowCapacity = spots > 0 && spots <= 6;
              const startTime = new Date(dep.start_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const meetTime = dep.meeting_at
                ? new Date(dep.meeting_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : null;

              return (
                <div
                  key={depKey}
                  onClick={() => !isFull && onSelectDeparture(dep.id || (dep as any).departure_id || depKey)}
                  className={`relative p-4 rounded-2xl border transition-all ${
                    isFull
                      ? 'opacity-40 cursor-not-allowed bg-[#08120F] border-[#182C24]'
                      : isSelected
                      ? 'cursor-pointer bg-gradient-to-b from-[#0E241C] to-[#071310] border-emerald-400 shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-400/20'
                      : 'cursor-pointer bg-[#091612] border-[#182C24] hover:border-[#2C4E40] hover:bg-[#0C1C17]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-black text-white font-display tracking-tight">
                        {startTime}
                      </span>
                      {meetTime && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {language === 'en' ? 'Base meeting:' : 'Sastanak na bazi:'}{' '}
                          <strong className="text-emerald-400 font-semibold">{meetTime}</strong>
                        </span>
                      )}
                    </div>

                    <div
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        isFull
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                          : isLowCapacity
                          ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {isFull
                        ? language === 'en' ? 'Sold Out' : 'Popunjeno'
                        : isLowCapacity
                        ? `${spots} ${language === 'en' ? 'seats left!' : 'mjesta!'}`
                        : `${spots} ${language === 'en' ? 'available' : 'slobodno'}`}
                    </div>
                  </div>

                  {/* Occupancy Indicator Bar */}
                  <div className="mt-3 pt-2.5 border-t border-[#182C24] space-y-1">
                    <div className="w-full bg-[#12241E] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLowCapacity ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(5, ((dep.capacity_limit - spots) / dep.capacity_limit) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: GUEST SELECTOR */}
      <div className="space-y-4 pt-4 border-t border-[#182C24]">
        <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>3. {language === 'en' ? 'Number of Guests' : 'Broj Učesnika u Grupi'}</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Adults */}
          <div className="p-5 rounded-2xl bg-[#091612] border border-[#182C24] flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white font-display">
                {language === 'en' ? 'Adults' : 'Odrasli'}
              </h4>
              <span className="text-xs text-slate-400 block">
                {language === 'en' ? 'Age 12+' : '12+ godina'}
              </span>
              <span className="text-xs font-semibold text-emerald-400 font-mono mt-1 block">
                {selectedPkg?.adult_price || 90} BAM / {language === 'en' ? 'pers.' : 'os.'}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-[#0D201A] border border-[#1F382E] rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setAdultCount((c) => Math.max(1, c - 1))}
                disabled={adultCount <= 1}
                className="w-9 h-9 rounded-lg bg-[#142921] hover:bg-[#1C382D] disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-xl font-black text-white font-display">
                {adultCount}
              </span>
              <button
                type="button"
                onClick={() => setAdultCount((c) => c + 1)}
                className="w-9 h-9 rounded-lg bg-[#142921] hover:bg-[#1C382D] text-white flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="p-5 rounded-2xl bg-[#091612] border border-[#182C24] flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white font-display">
                {language === 'en' ? 'Children' : 'Djeca'}
              </h4>
              <span className="text-xs text-slate-400 block">
                {language === 'en' ? 'Under 12 years' : 'Do 12 godina'}
              </span>
              <span className="text-xs font-semibold text-emerald-400 font-mono mt-1 block">
                {selectedPkg?.child_price || 60} BAM / {language === 'en' ? 'pers.' : 'os.'}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-[#0D201A] border border-[#1F382E] rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setChildCount((c) => Math.max(0, c - 1))}
                disabled={childCount <= 0}
                className="w-9 h-9 rounded-lg bg-[#142921] hover:bg-[#1C382D] disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-xl font-black text-white font-display">
                {childCount}
              </span>
              <button
                type="button"
                onClick={() => setChildCount((c) => c + 1)}
                className="w-9 h-9 rounded-lg bg-[#142921] hover:bg-[#1C382D] text-white flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Capacity Warning Message */}
        {isOverCapacity && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              {language === 'en'
                ? `Selected departure only has ${spotsRemaining} seats remaining, but you requested ${totalGuests} guests. Please reduce group size or select another departure time.`
                : `Izabrani termin ima samo ${spotsRemaining} slobodnih mjesta, a unijeli ste ${totalGuests} gostiju. Smanjite broj ili izaberite drugu satnicu.`}
            </span>
          </div>
        )}
      </div>

      {/* SECTION 4: OPTIONAL ADD-ONS */}
      {addons && addons.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#182C24]">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>4. {language === 'en' ? 'Enhance Your Adventure (Optional Extras)' : 'Dodatne Usluge i Oprema (Opcionalno)'}</span>
            </label>
            <span className="text-xs text-slate-400">
              {language === 'en' ? 'Can be added/modified on-site' : 'Može se prilagoditi i na bazi'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addons.map((addon, idx) => {
              const addonKey = addon.id || `addon-extra-${idx}`;
              const isSelected = selectedAddonIds.includes(addon.id);
              const name = language === 'en' ? addon.name_en : addon.name_bs;
              const desc = language === 'en' ? addon.description_en : addon.description_bs;
              const isPerPerson = addon.pricing_type === 'per_person';

              return (
                <div
                  key={addonKey}
                  onClick={() => onToggleAddon(addon.id)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-400 ring-1 ring-emerald-400/20'
                      : 'bg-[#091612] border-[#182C24] hover:border-[#2C4E40]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-emerald-400 border-emerald-400 text-slate-950'
                          : 'border-slate-600 bg-[#0E201A]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="space-y-0.5">
                      <h5 className="text-sm font-bold text-white font-display leading-tight">{name}</h5>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{desc}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-emerald-400 font-mono block">
                      +{addon.price} BAM
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {isPerPerson
                        ? language === 'en' ? '/ person' : 'po osobi'
                        : language === 'en' ? '/ group' : 'po grupi'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
