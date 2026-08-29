import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../locales/i18n';
import { apiClient } from '../../api/client';
import { Booking } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  AlertCircle,
  MessageCircle,
  Printer,
  ArrowLeft,
  Copy,
  Check,
  MapPin,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

interface BookingConfirmationViewProps {
  initialCode?: string;
  onBack: () => void;
}

export const BookingConfirmationView: React.FC<BookingConfirmationViewProps> = ({
  initialCode,
  onBack,
}) => {
  const { language } = useTranslation();
  const toast = useToast();
  const [lookupInput, setLookupInput] = useState<string>(initialCode || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchBooking = async (code: string) => {
    if (!code.trim()) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await apiClient.getPublicBooking(code.trim());
      setBooking(res);
    } catch (err: any) {
      setErrorMsg(
        language === 'en'
          ? 'No booking found with this reference code. Please verify the code (e.g. NR-2026-001).'
          : 'Rezervacija sa ovom šifrom nije pronađena. Provjerite uneseni kod (npr. NR-2026-001).'
      );
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

  const reservationCode =
    booking?.reservation_code || (booking as any)?.booking_code || lookupInput;

  const pkgName = booking?.package
    ? language === 'en'
      ? booking.package.name_en
      : booking.package.name_bs
    : '';

  const depDate = booking?.departure
    ? new Date(booking.departure.start_at).toLocaleDateString(
        language === 'en' ? 'en-US' : 'bs-BA',
        {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      )
    : '';

  const depTime = booking?.departure
    ? new Date(booking.departure.start_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const meetTime = booking?.departure?.meeting_at
    ? new Date(booking.departure.meeting_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const guestName = `${booking?.customer?.first_name || (booking as any)?.first_name || ''} ${
    booking?.customer?.last_name || (booking as any)?.last_name || ''
  }`.trim();

  const handleCopy = () => {
    if (!reservationCode) return;
    navigator.clipboard.writeText(reservationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = booking
    ? encodeURIComponent(
        `Pozdrav Neretva Rafting Konjic! Moja šifra rezervacije je ${reservationCode} za ${guestName}. Želim provjeriti detalje dolaska.`
      )
    : '';

  return (
    <div className="min-h-[85vh] bg-[#050D0B] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4 text-emerald-400" />}
        >
          {language === 'en' ? 'Back to Homepage' : 'Nazad na Početnu'}
        </Button>

        {/* Search Bar Card */}
        <div className="bg-[#071310] border border-[#182C24] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Booking Lookup' : 'Pretraga Rezervacije'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {language === 'en' ? 'Find Your Booking Pass' : 'Pronađite Svoju Rezervaciju'}
            </h2>
            <p className="text-sm text-slate-400">
              {language === 'en'
                ? 'Enter your reservation reference code (e.g. NR-2026-000124) to retrieve trip details and schedule.'
                : 'Unesite jedinstvenu šifru rezervacije (npr. NR-2026-000124) za pregled termina i uputa za dolazak.'}
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Enter reference code (e.g. NR-2026-001)...' : 'Unesite kod rezervacije...'}
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value.toUpperCase())}
                className="w-full bg-[#0E201A] border border-[#1F382E] focus:border-emerald-400 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-mono uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || !lookupInput.trim()}
              loading={loading}
              className="px-6"
            >
              {language === 'en' ? 'Search' : 'Pronađi'}
            </Button>
          </form>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Found Booking Pass Card */}
        {booking && (
          <div className="bg-[#071310] border-2 border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/60 space-y-0">
            {/* Header: Status & Code */}
            <div className="bg-gradient-to-r from-[#0C241B] via-[#0E2C22] to-[#0C241B] border-b border-[#1F3E32] p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {language === 'en' ? 'Reservation Status' : 'Status Rezervacije'}
                </span>
                <StatusBadge status={booking.booking_status} type="booking" size="md" />
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
                  {language === 'en' ? 'Reference Code' : 'Šifra Rezervacije'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-wider">
                    {reservationCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-[#143327] hover:bg-[#1B4434] text-emerald-300 transition-colors"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm bg-[#091612] border border-[#182C24] rounded-2xl p-5 sm:p-6">
                <div>
                  <span className="text-xs text-slate-400 block">{language === 'en' ? 'Tour Package:' : 'Paket:'}</span>
                  <strong className="text-white text-base font-display">{pkgName}</strong>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">{language === 'en' ? 'Date & Time:' : 'Datum i Satnica:'}</span>
                  <strong className="text-white text-base font-display">{depDate}</strong>
                  <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {language === 'en' ? 'Launch:' : 'Polazak:'} {depTime} {meetTime && `(${language === 'en' ? 'Meet' : 'Sastanak'} ${meetTime})`}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">{language === 'en' ? 'Lead Guest:' : 'Gost:'}</span>
                  <strong className="text-white text-base font-display">{guestName}</strong>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {booking.customer?.phone || (booking as any).phone} • {booking.customer?.email || (booking as any).email}
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">{language === 'en' ? 'Total Guests:' : 'Broj Učesnika:'}</span>
                  <strong className="text-white text-base font-display">
                    {booking.guest_count} {language === 'en' ? 'guests' : 'osoba'}
                  </strong>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {booking.adult_count} {language === 'en' ? 'Adults' : 'odraslih'}{' '}
                    {booking.child_count > 0 && `+ ${booking.child_count} ${language === 'en' ? 'children' : 'djece'}`}
                  </div>
                </div>
              </div>

              {/* Price & Payment Status Bar */}
              <div className="p-4 rounded-2xl bg-[#0B1C16] border border-[#1C3A2E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">{language === 'en' ? 'Total Amount Due:' : 'Ukupan Iznos:'}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-display font-mono">
                      {booking.total_amount} <span className="text-sm text-slate-300">BAM</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      (~{Math.round(booking.total_amount / 1.95583)} €)
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block mb-1">
                    {language === 'en' ? 'Payment Status:' : 'Status Plaćanja:'}
                  </span>
                  <StatusBadge status={booking.payment_status} type="payment" size="sm" />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    {language === 'en' ? 'Pay upon arrival at base Džajića Buk' : 'Plaćanje na bazi Džajića Buk'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`https://wa.me/38761123456?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                    leftIcon={<MessageCircle className="w-4 h-4 text-slate-950 fill-slate-950" />}
                  >
                    {language === 'en' ? 'WhatsApp Support' : 'WhatsApp Podrška'}
                  </Button>
                </a>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  {language === 'en' ? 'Print Pass' : 'Štampaj Potvrdu'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
