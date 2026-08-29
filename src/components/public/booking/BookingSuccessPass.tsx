import React, { useState } from 'react';
import { Booking, BookingStatus } from '../../../types';
import {
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Printer,
  MapPin,
  ExternalLink,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  ArrowRight,
  Home,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../ui/Button';

interface BookingSuccessPassProps {
  booking: Booking;
  language: 'bs' | 'en';
  onReturnHome: () => void;
}

export const BookingSuccessPass: React.FC<BookingSuccessPassProps> = ({
  booking,
  language,
  onReturnHome,
}) => {
  const [copied, setCopied] = useState(false);

  const isRequested = booking.booking_status === BookingStatus.REQUESTED;
  const reservationCode = booking.reservation_code || (booking as any).booking_code || 'NR-2026';
  const pkgName = language === 'en' ? booking.package?.name_en : booking.package?.name_bs;

  const depDate = booking.departure
    ? new Date(booking.departure.start_at).toLocaleDateString(language === 'en' ? 'en-US' : 'bs-BA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const depTime = booking.departure
    ? new Date(booking.departure.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const meetTime = booking.departure?.meeting_at
    ? new Date(booking.departure.meeting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const guestName = `${booking.customer?.first_name || (booking as any).first_name || ''} ${
    booking.customer?.last_name || (booking as any).last_name || ''
  }`.trim();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(reservationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    isRequested
      ? (language === 'en'
          ? `Hello Neretva Rafting Konjic! My booking request reference is ${reservationCode} for ${guestName} (${booking.guest_count} guests) on ${depDate}. Following up on availability and confirmation.`
          : `Pozdrav Neretva Rafting Konjic! Moja šifra zahtjeva za rezervaciju je ${reservationCode} za ${guestName} (${booking.guest_count} osoba) na datum ${depDate}. Želim provjeriti status potvrde.`)
      : (language === 'en'
          ? `Hello Neretva Rafting Konjic! My booking reference is ${reservationCode} for ${guestName} (${booking.guest_count} guests) on ${depDate}. Looking forward to confirming arrival details.`
          : `Pozdrav Neretva Rafting Konjic! Moja šifra rezervacije je ${reservationCode} za ${guestName} (${booking.guest_count} osoba) na datum ${depDate}. Želim potvrditi detalje dolaska.`)
  );

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6 space-y-8 animate-fadeIn">
      {/* Header Badge & Title */}
      <div className="text-center space-y-3">
        {isRequested ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 mx-auto shadow-2xl shadow-amber-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-[#141006] rounded-[22px] flex items-center justify-center text-amber-400">
              <Clock className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto shadow-2xl shadow-emerald-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#071310] rounded-[22px] flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
            </div>
          </div>
        )}

        {isRequested ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Booking Request Received' : 'Zahtjev za Rezervaciju Zaprimljen'}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Reservation Confirmed' : 'Rezervacija Potvrđena'}</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
          {isRequested
            ? (language === 'en' ? 'Booking Request Received' : 'Zahtjev za Rezervaciju Zaprimljen')
            : (language === 'en' ? 'Reservation Confirmed' : 'Rezervacija Potvrđena')}
        </h1>

        <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          {isRequested
            ? (language === 'en'
                ? 'Your booking request has been received successfully. Our team will review availability and confirm your reservation shortly.'
                : 'Vaš zahtjev za rezervaciju je uspješno zaprimljen. Naš tim će pregledati dostupnost i ubrzo potvrditi vašu rezervaciju.')
            : (language === 'en'
                ? 'Your booking is confirmed and your places are secured. A full confirmation summary has been registered.'
                : 'Vaša rezervacija je potvrđena i vaša mjesta su osigurana. Sačuvajte vašu šifru rezervacije.')}
        </p>
      </div>

      {/* Digital Boarding Pass / Ticket Card */}
      <div
        className={`bg-[#071310] border-2 rounded-3xl overflow-hidden shadow-2xl ${
          isRequested
            ? 'border-amber-500/40 shadow-amber-950/40'
            : 'border-emerald-500/40 shadow-emerald-950/60'
        }`}
      >
        {/* Ticket Header: Reservation Code */}
        <div
          className={`p-6 text-center sm:flex sm:items-center sm:justify-between border-b ${
            isRequested
              ? 'bg-gradient-to-r from-[#201807] via-[#2A1E0A] to-[#201807] border-[#3D2D10]'
              : 'bg-gradient-to-r from-[#0C241B] via-[#0E2C22] to-[#0C241B] border-[#1F3E32]'
          }`}
        >
          <div className="text-left">
            <span
              className={`text-[11px] font-bold uppercase tracking-widest block ${
                isRequested ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {language === 'en' ? 'Reservation Reference' : 'Šifra Rezervacije'}
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-white">
              {reservationCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className={`mt-3 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              isRequested
                ? 'bg-[#2A200B] hover:bg-[#382B0E] text-amber-300'
                : 'bg-[#143327] hover:bg-[#1B4434] text-emerald-300'
            }`}
          >
            {copied ? (
              <>
                <Check className={`w-4 h-4 ${isRequested ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span>{language === 'en' ? 'Copied to Clipboard!' : 'Kopirano!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{language === 'en' ? 'Copy Code' : 'Kopiraj Šifru'}</span>
              </>
            )}
          </button>
        </div>

        {/* Ticket Body Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            {/* Tour & Route */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block">
                {language === 'en' ? 'Selected Tour' : 'Odabrani Paket'}
              </span>
              <strong className="text-white text-lg font-bold font-display block">
                {pkgName}
              </strong>
              <span className="text-xs text-slate-400">
                {booking.package?.river_length_km ? `${booking.package.river_length_km} km` : '23 km'} • {language === 'en' ? 'Full Canyon Route' : 'Kompletna Kanjonska Tura'}
              </span>
            </div>

            {/* Date & Departure */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block">
                {language === 'en' ? 'Date & Launch Schedule' : 'Datum & Satnica'}
              </span>
              <strong className="text-white text-lg font-bold font-display block">
                {depDate}
              </strong>
              <div
                className={`text-xs flex items-center gap-1.5 font-semibold ${
                  isRequested ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {language === 'en' ? 'Launch:' : 'Polazak:'} {depTime} {meetTime && `(${language === 'en' ? 'Meet at' : 'Sastanak u'} ${meetTime})`}
                </span>
              </div>
            </div>

            {/* Guests */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block">
                {language === 'en' ? 'Group Size & Lead Guest' : 'Broj Učesnika & Vođa Grupe'}
              </span>
              <strong className="text-white text-base block font-display">
                {guestName}
              </strong>
              <span className="text-xs text-slate-300">
                {booking.adult_count} {language === 'en' ? 'Adults' : 'odraslih'}{' '}
                {booking.child_count > 0 && `+ ${booking.child_count} ${language === 'en' ? 'children' : 'djece'}`}{' '}
                ({booking.guest_count} {language === 'en' ? 'total' : 'ukupno'})
              </span>
            </div>

            {/* Total Price & Payment */}
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block">
                {language === 'en' ? 'Total Payable at Base' : 'Ukupan Iznos za Plaćanje'}
              </span>
              <div className="flex items-baseline gap-2">
                <strong
                  className={`text-2xl sm:text-3xl font-black font-display font-mono ${
                    isRequested ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {booking.total_amount} <span className="text-sm text-slate-300">BAM</span>
                </strong>
                <span className="text-xs text-slate-400 font-mono">
                  (~{Math.round(booking.total_amount / 1.95583)} €)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                {language === 'en' ? 'Pay cash or card upon arrival' : 'Plaćanje gotovinom ili karticom na bazi'}
              </span>
            </div>
          </div>

          {/* Meeting Point Box */}
          <div className="p-4 rounded-2xl bg-[#0B1C16] border border-[#1C3A2E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  {language === 'en' ? 'Meeting Point: Base Džajića Buk' : 'Lokacija: Baza Džajića Buk, Konjic'}
                </span>
                <p className="text-xs text-slate-300">
                  Džajići bb, 88400 Konjic (5 km {language === 'en' ? 'upstream from Konjic center' : 'uzvodno od centra Konjica'})
                </p>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Dzajica+Buk+Konjic"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#143327] hover:bg-[#1B4434] text-emerald-300 text-xs font-bold transition-colors shrink-0"
            >
              <span>{language === 'en' ? 'Open in Google Maps' : 'Otvori Navigaciju'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* What Happens Next Roadmap */}
          <div className="space-y-3 pt-4 border-t border-[#182C24]">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${isRequested ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span>{language === 'en' ? 'What Happens Next?' : 'Šta Dalje? Koraci do Raftinga:'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-300">
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isRequested
                    ? 'bg-[#181308] border-[#382B10]'
                    : 'bg-[#091612] border-[#182C24]'
                }`}
              >
                <span className={`font-bold block ${isRequested ? 'text-amber-400' : 'text-emerald-400'}`}>
                  1. {isRequested ? (language === 'en' ? 'Availability Review' : 'Pregled Zahtjeva') : (language === 'en' ? 'Dispatch Scheduled' : 'Evidencija')}
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {isRequested
                    ? (language === 'en' ? 'Operations desk reviews your dates & confirms reservation.' : 'Dispečer pregledava zahtjev i potvrđuje rezervaciju.')
                    : (language === 'en' ? 'Our operations desk reserves your boats & guide.' : 'Rezervacija je zabilježena u rasporedu čamaca.')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#091612] border border-[#182C24] space-y-1">
                <span className="text-emerald-400 font-bold block">2. {language === 'en' ? 'Arrive at Base' : 'Dolazak na Bazu'}</span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {language === 'en' ? 'Arrive at meeting time for coffee, check-in & parking.' : 'Dolazak na bazu Džajići, jutarnja kafa i parking.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#091612] border border-[#182C24] space-y-1">
                <span className="text-emerald-400 font-bold block">3. {language === 'en' ? 'Gear & Briefing' : 'Oprema & Brifing'}</span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {language === 'en' ? 'Fitted with 5mm neoprene suit, boots, vest & helmet.' : 'Zaduživanje neoprena, prsluka, kacige i skiper brifing.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#091612] border border-[#182C24] space-y-1">
                <span className="text-emerald-400 font-bold block">4. {language === 'en' ? 'Neretva Spust' : 'Spust Neretvom'}</span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {language === 'en' ? '23 km of emerald canyon, rapids, waterfalls & lunch!' : '23 km brzaka, kanjon Rakitnice i domaći roštilj!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="bg-[#050E0C] border-t border-[#182C24] p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-3">
          <a
            href={`https://wa.me/38761123456?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1"
          >
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              leftIcon={<MessageCircle className="w-4 h-4 text-slate-950 fill-slate-950" />}
            >
              {language === 'en' ? 'WhatsApp Concierge Support' : 'WhatsApp Kontakt & Podrška'}
            </Button>
          </a>

          <Button
            variant="secondary"
            size="md"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            {language === 'en' ? 'Print / Save Pass' : 'Sačuvaj / Štampaj'}
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={onReturnHome}
            leftIcon={<Home className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            {language === 'en' ? 'Homepage' : 'Početna'}
          </Button>
        </div>
      </div>
    </div>
  );
};
