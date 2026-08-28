import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../locales/i18n';
import { apiClient } from '../../api/client';
import { Booking } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Search, CheckCircle2, AlertCircle, MessageCircle, Printer, ArrowLeft, Calendar, Users, MapPin } from 'lucide-react';

interface BookingConfirmationViewProps {
  initialCode?: string;
  onBack: () => void;
}

export const BookingConfirmationView: React.FC<BookingConfirmationViewProps> = ({
  initialCode,
  onBack,
}) => {
  const { t, language } = useTranslation();
  const toast = useToast();
  const [lookupInput, setLookupInput] = useState<string>(initialCode || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBooking = async (code: string) => {
    if (!code.trim()) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await apiClient.getPublicBooking(code.trim());
      setBooking(res);
    } catch (err: any) {
      setErrorMsg('Rezervacija sa ovom šifrom nije pronađena. Provjerite uneseni kod (npr. NR-2026-1001).');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchBooking(initialCode);
    }
  }, [initialCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooking(lookupInput);
  };

  const pkgName = booking?.package
    ? language === 'en'
      ? booking.package.name_en
      : booking.package.name_bs
    : '';

  const depDate = booking?.departure
    ? new Date(booking.departure.start_at).toLocaleDateString(language === 'en' ? 'en-US' : 'bs-BA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const depTime = booking?.departure
    ? new Date(booking.departure.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const meetTime = booking?.departure?.meeting_at
    ? new Date(booking.departure.meeting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const whatsappMessage = booking
    ? encodeURIComponent(
        `Pozdrav Neretva Rafting Konjic! Moja šifra rezervacije je ${booking.booking_code} za ${booking.first_name} ${booking.last_name}.`
      )
    : '';

  return (
    <div className="min-h-[80vh] bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to Homepage' : 'Nazad na Početnu'}</span>
        </button>

        {/* Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Pronađite Svoju Rezervaciju</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Unesite jedinstvenu šifru rezervacije (npr. <span className="font-mono text-emerald-400">NR-2026-1001</span>) ili ID broj.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Unesite kod rezervacije..."
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !lookupInput.trim()}
              className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-40"
            >
              {loading ? 'Tražim...' : 'Pronađi'}
            </button>
          </form>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Found Booking Pass */}
        {booking && (
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Status Rezervacije
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-lg font-bold text-white uppercase tracking-wide">
                    {booking.booking_status}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Šifra Rezervacije
                </span>
                <span className="font-mono text-2xl font-extrabold text-emerald-400">
                  {booking.booking_code}
                </span>
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-950 border border-slate-800 rounded-2xl p-6">
              <div>
                <span className="text-xs text-slate-400 block">Paket:</span>
                <strong className="text-white text-base">{pkgName}</strong>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Datum i Satnica:</span>
                <strong className="text-white text-base">{depDate}</strong>
                <div className="text-xs text-emerald-400">
                  Polazak: {depTime} (Sastanak na bazi: {meetTime})
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Gost:</span>
                <strong className="text-white">
                  {booking.first_name} {booking.last_name}
                </strong>
                <div className="text-xs text-slate-400">{booking.phone} • {booking.email}</div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Broj Učesnika:</span>
                <strong className="text-white">
                  {booking.adult_count} odraslih {booking.child_count > 0 ? `+ ${booking.child_count} djece` : ''} ({booking.guest_count} ukupno)
                </strong>
              </div>
            </div>

            {/* Pricing status */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Ukupan Iznos:</span>
                <span className="text-2xl font-extrabold text-white">{booking.total_amount} BAM</span>
                <span className="text-xs text-slate-400 ml-2">(~{Math.round(booking.total_amount / 1.95583)} €)</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Status Plaćanja:</span>
                <span className="text-sm font-bold text-emerald-400 uppercase">
                  {booking.payment_status}
                </span>
                <span className="text-[11px] text-slate-400 block">Plaćanje na bazi Džajića Buk</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`https://wa.me/38761123456?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>WhatsApp Podrška</span>
              </a>

              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Štampaj Potvrdu</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
