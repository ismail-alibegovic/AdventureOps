import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useTranslation } from '../../locales/i18n';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Booking, BookingStatus, PaymentMethod, CancellationReason, CancellationFeeStatus } from '../../types';
import {
  X,
  UserCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Clock,
  Printer,
  Shield,
  Trash2,
  DollarSign,
  Plus,
  History,
} from 'lucide-react';

interface BookingDetailDrawerProps {
  bookingId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  bookingId,
  onClose,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { currentUser, canDispatch, isAdminOrAbove } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Payment Recording Modal State
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<CancellationReason>(CancellationReason.CUSTOMER_CANCELLED);
  const [cancelNotes, setCancelNotes] = useState<string>('');
  const [cancelFee, setCancelFee] = useState<number>(0);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getBookingDetail(bookingId);
      setBooking(res);
      const paid = res.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
      setPayAmount(Math.max(0, res.total_amount - paid));
    } catch (err: any) {
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const handleUpdateStatus = async (newStatus: BookingStatus) => {
    try {
      await apiClient.updateBookingStatus(bookingId, {
        status: newStatus,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success(`Status rezervacije: ${newStatus}`);
      loadBooking();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      toast.error('Unesite iznos veći od 0 BAM');
      return;
    }

    try {
      await apiClient.recordPayment(bookingId, {
        amount: Number(payAmount),
        method: payMethod,
        reference: payRef || undefined,
        notes: payNotes || undefined,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success(`Uspješno evidentirana uplata od ${payAmount} BAM`);
      setShowPaymentModal(false);
      loadBooking();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Evidencija uplate nije uspjela');
    }
  };

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.cancelBooking(bookingId, {
        reason_code: cancelReason,
        reason_text: cancelNotes,
        fee_amount: Number(cancelFee),
        fee_status: cancelFee > 0 ? CancellationFeeStatus.DUE : CancellationFeeStatus.WAIVED,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success('Rezervacija otkazana i kapacitet oslobođen');
      setShowCancelModal(false);
      loadBooking();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Neuspjelo otkazivanje');
    }
  };

  if (loading || !booking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400" />
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Pozdrav ${booking.first_name}! Javljamo se iz Neretva Rafting Konjic u vezi vaše rezervacije ${booking.booking_code}.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border-l border-slate-700 w-full max-w-2xl h-full flex flex-col justify-between shadow-2xl p-6 sm:p-8 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Rezervacija
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-extrabold text-emerald-400">
                  {booking.booking_code}
                </span>
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                  {booking.source}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {booking.booking_status !== BookingStatus.CONFIRMED && (
              <button
                onClick={() => handleUpdateStatus(BookingStatus.CONFIRMED)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Potvrdi Rezervaciju
              </button>
            )}

            <button
              onClick={() =>
                handleUpdateStatus(
                  booking.booking_status === BookingStatus.CHECKED_IN
                    ? BookingStatus.CONFIRMED
                    : BookingStatus.CHECKED_IN
                )
              }
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                booking.booking_status === BookingStatus.CHECKED_IN
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              {booking.booking_status === BookingStatus.CHECKED_IN ? '✓ Checked-In' : 'Prijavi Dolazak (Check-in)'}
            </button>

            <a
              href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {booking.booking_status !== BookingStatus.CANCELLED && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 text-xs font-bold cursor-pointer"
              >
                Otkaži
              </button>
            )}
          </div>

          {/* Customer info card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Podaci o Gostu
            </h4>
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 block">Ime i prezime:</span>
                <strong className="text-white text-sm">
                  {booking.first_name} {booking.last_name}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Broj telefona:</span>
                <a href={`tel:${booking.phone}`} className="text-emerald-400 hover:underline">
                  {booking.phone}
                </a>
              </div>
              <div>
                <span className="text-slate-500 block">Email adresa:</span>
                <a href={`mailto:${booking.email}`} className="text-slate-200 hover:underline">
                  {booking.email}
                </a>
              </div>
              <div>
                <span className="text-slate-500 block">Država / Jezik:</span>
                <span className="text-slate-200 uppercase">{booking.country_code} ({booking.preferred_language})</span>
              </div>
            </div>

            {booking.customer_note && (
              <div className="pt-2 border-t border-slate-850">
                <span className="text-slate-500 block mb-0.5">Napomena gosta:</span>
                <p className="text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800 italic">
                  "{booking.customer_note}"
                </p>
              </div>
            )}
          </div>

          {/* Trip & Departure details */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Detalji Polaska & Paket
            </h4>
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 block">Paket:</span>
                <strong className="text-white">
                  {booking.package?.name_bs || 'Rafting Neretva'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Datum & Satnica:</span>
                <strong className="text-emerald-400">
                  {booking.departure ? new Date(booking.departure.start_at).toLocaleString() : ''}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Broj gostiju:</span>
                <strong className="text-white">
                  {booking.adult_count} odraslih {booking.child_count > 0 ? `+ ${booking.child_count} djece` : ''} ({booking.guest_count} ukupno)
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Alocirano u čamce:</span>
                <strong className="text-sky-400">
                  {booking.allocated_guests_count || 0} / {booking.guest_count} gostiju
                </strong>
              </div>
            </div>
          </div>

          {/* Payment & Financial ledger */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Finansijski Ledger & Plaćanja
              </h4>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Evidentiraj Uplatu</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-900 border border-slate-850">
              <div>
                <span className="text-slate-500 block text-[11px]">Ukupno za naplatu:</span>
                <strong className="text-base text-white font-extrabold">{booking.total_amount} BAM</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Do sada uplaćeno:</span>
                <strong className="text-base text-emerald-400 font-extrabold">{booking.paid_amount} BAM</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Preostali dug:</span>
                <strong className="text-base text-amber-400 font-extrabold">{booking.balance_due} BAM</strong>
              </div>
            </div>

            {/* List of recorded payments */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Istorija uplata ({booking.payments?.length || 0}):
              </span>

              {(!booking.payments || booking.payments.length === 0) ? (
                <span className="text-slate-600 block italic">Nema evidentiranih uplata. Gost plaća na bazi.</span>
              ) : (
                booking.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-850 text-slate-300"
                  >
                    <div>
                      <strong className="text-white text-sm">{p.amount} BAM</strong>
                      <span className="text-slate-400 ml-2 uppercase text-[11px]">({p.payment_method})</span>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(p.created_at).toLocaleString()} • Evidentirao: {p.collected_by_user_name || 'Sistem'}
                      </span>
                    </div>
                    {p.transaction_reference && (
                      <span className="font-mono text-[11px] text-slate-400">{p.transaction_reference}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Subdialog: Record Payment */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white text-sm">
                  Evidentiraj Uplatu za {booking.first_name} {booking.last_name}
                </h4>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Iznos (BAM) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-bold text-white"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Preostali dug za ovu rezervaciju: {Math.max(0, booking.total_amount - (booking.payments?.reduce((s, p) => s + p.amount, 0) || 0))} BAM
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Način Plaćanja *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white font-semibold"
                  >
                    <option value={PaymentMethod.CASH}>Gotovina (Baza Džajići)</option>
                    <option value={PaymentMethod.CARD_TERMINAL}>POS Terminal / Kartica</option>
                    <option value={PaymentMethod.BANK_TRANSFER}>Bankovna Doznaka (Virman)</option>
                    <option value={PaymentMethod.OTHER}>Ostalo / Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Broj računa / Broj fiskalnog isječka (opcionalno)</label>
                  <input
                    type="text"
                    placeholder="npr. RN-2026-458"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                  >
                    Odustani
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold"
                  >
                    Sačuvaj Uplatu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Subdialog: Cancel Booking */}
        {showCancelModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white text-sm">
                  Otkaži Rezervaciju ({booking.reservation_code})
                </h4>
                <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCancelBooking} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Razlog Otkazivanja *</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value as CancellationReason)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white font-semibold"
                  >
                    <option value={CancellationReason.CUSTOMER_CANCELLED}>Gost je otkazao dolazak</option>
                    <option value={CancellationReason.COMPANY_CANCELLED}>Otkazano od strane agencije</option>
                    <option value={CancellationReason.WEATHER}>Vremenske neprilike (Vodostaj/Oluja)</option>
                    <option value={CancellationReason.OTHER}>Ostali razlozi / Administracija</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Detaljnije obrazloženje</label>
                  <textarea
                    rows={2}
                    value={cancelNotes}
                    onChange={(e) => setCancelNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white resize-none"
                    placeholder="npr. Otkazano telefonskim pozivom radi kvara na autu..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                  >
                    Nazad
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                  >
                    Potvrdi Otkazivanje
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
