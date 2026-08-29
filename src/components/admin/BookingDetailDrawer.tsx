import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Booking,
  BookingStatus,
  PaymentMethod,
  CancellationReason,
  CancellationFeeStatus,
  NotificationRecord,
} from '../../types';
import {
  X,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  Users,
  Shield,
  CreditCard,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Anchor,
  Send,
  FileText,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

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
  const toast = useToast();
  const { currentUser } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Payment Recording Modal State
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<CancellationReason>(CancellationReason.CUSTOMER_CANCELLED);
  const [cancelNotes, setCancelNotes] = useState<string>('');
  const [cancelFee, setCancelFee] = useState<number>(0);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Internal Note State
  const [newInternalNote, setNewInternalNote] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getBookingDetail(bookingId);
      setBooking(res);

      const paid = res.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
      setPayAmount(Math.max(0, res.total_amount - paid));

      // Fetch transactional communications
      try {
        const notifRes = await apiClient.getNotifications(res.id);
        setNotifications(notifRes || []);
      } catch {
        // Non-blocking
      }
    } catch (err: any) {
      toast.error('Failed to load reservation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const handleUpdateStatus = async (newStatus: BookingStatus, customNote?: string) => {
    try {
      await apiClient.updateBookingStatus(bookingId, {
        status: newStatus,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
        internal_note: customNote,
      });

      const readableStatus = newStatus.replace('_', ' ').toUpperCase();
      toast.success(`Booking status updated to ${readableStatus}`);
      await loadBooking();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update booking status');
    }
  };

  const handleSaveInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInternalNote.trim() || !booking) return;

    try {
      setIsSavingNote(true);
      await apiClient.updateBookingStatus(bookingId, {
        status: booking.booking_status,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
        internal_note: newInternalNote.trim(),
      });
      toast.success('Internal note added');
      setNewInternalNote('');
      await loadBooking();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      toast.error('Payment amount must be greater than 0 BAM');
      return;
    }

    try {
      setIsSubmittingPayment(true);
      await apiClient.recordPayment(bookingId, {
        amount: Number(payAmount),
        method: payMethod,
        reference: payRef || undefined,
        notes: payNotes || undefined,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });

      toast.success(`Recorded payment of ${payAmount} BAM`);
      setShowPaymentModal(false);
      setPayRef('');
      setPayNotes('');
      await loadBooking();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payment');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleCancelBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingCancel(true);
      await apiClient.cancelBooking(bookingId, {
        reason_code: cancelReason,
        reason_text: cancelNotes || undefined,
        fee_amount: Number(cancelFee || 0),
        fee_status: cancelFee > 0 ? CancellationFeeStatus.DUE : CancellationFeeStatus.WAIVED,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });

      toast.success('Booking cancelled and departure capacity released');
      setShowCancelModal(false);
      await loadBooking();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  if (loading || !booking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07110F]/80 backdrop-blur-md">
        <div className="bg-[#0E1A17] border border-[#1F332C] rounded-2xl p-6 flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
          <span className="text-xs text-slate-400">Loading reservation workspace...</span>
        </div>
      </div>
    );
  }

  const reservationCode = booking.reservation_code || (booking as any).booking_code || 'NR-BOOKING';
  const customerName = booking.customer
    ? `${booking.customer.first_name} ${booking.customer.last_name}`
    : `${(booking as any).first_name || ''} ${(booking as any).last_name || ''}`.trim() || 'Guest';
  const customerPhone = booking.customer?.phone || (booking as any).phone || '';
  const customerEmail = booking.customer?.email || (booking as any).email || '';
  const customerCountry = booking.customer?.country_code || (booking as any).country_code || 'BA';
  const customerLang = booking.preferred_language || 'en';
  const customerNote = booking.customer_note;
  const internalNote = booking.internal_note;

  const pkgName = booking.package?.name_en || booking.package?.name_bs || 'Classic Neretva Rafting';
  const depDate = booking.departure
    ? new Date(booking.departure.start_at).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Scheduled Departure';
  const depTime = booking.departure
    ? new Date(booking.departure.start_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '09:00';
  const meetingTime = booking.departure
    ? new Date(booking.departure.meeting_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '08:15';

  const totalPaid = booking.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const remainingDue = Math.max(0, booking.total_amount - totalPaid);

  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  const whatsappGreeting = encodeURIComponent(
    `Hello ${customerName}! We are contacting you from Neretva Rafting Konjic regarding your reservation ${reservationCode}.`
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#07110F]/80 backdrop-blur-sm animate-fadeIn">
      {/* Slide-over Container */}
      <div className="bg-[#0E1A17] border-l border-[#1F332C] w-full max-w-xl h-full flex flex-col justify-between shadow-2xl overflow-y-auto">
        {/* Top Header */}
        <div className="p-6 border-b border-[#1F332C] bg-[#081210]/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold text-emerald-400 tracking-wider">
                  {reservationCode}
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#13211D] text-slate-300 border border-[#1F332C]">
                  {booking.source}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-display">
                {customerName}
              </h2>
              <div className="flex items-center gap-2 pt-0.5">
                <StatusBadge status={booking.booking_status} size="sm" />
                <StatusBadge status={booking.payment_status} size="sm" />
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#13211D] border border-transparent hover:border-[#1F332C] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtitle Summary */}
          <div className="mt-3 pt-3 border-t border-[#1F332C]/60 flex items-center justify-between text-xs text-slate-300">
            <span className="font-medium text-slate-200 truncate max-w-[240px]">{pkgName}</span>
            <span className="text-slate-400 font-mono">
              {depDate} • {depTime} • <strong className="text-white">{booking.guest_count} guests</strong>
            </span>
          </div>
        </div>

        {/* Drawer Body Sections */}
        <div className="p-6 space-y-6 flex-1">
          {/* Action Bar (Valid transitions only) */}
          <div className="p-3.5 rounded-2xl bg-[#081210] border border-[#1F332C] space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Actions
            </span>

            <div className="flex flex-wrap items-center gap-2">
              {/* Confirm action (If Requested) */}
              {booking.booking_status === BookingStatus.REQUESTED && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(BookingStatus.CONFIRMED)}
                >
                  Confirm Reservation
                </Button>
              )}

              {/* Check-In Toggle */}
              {booking.booking_status === BookingStatus.CONFIRMED && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(BookingStatus.CHECKED_IN)}
                >
                  Check In Guests
                </Button>
              )}

              {booking.booking_status === BookingStatus.CHECKED_IN && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdateStatus(BookingStatus.COMPLETED)}
                >
                  Mark Completed
                </Button>
              )}

              {/* Record Payment Button (If remaining balance) */}
              {remainingDue > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPaymentModal(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
                >
                  Record Payment
                </Button>
              )}

              {/* Mark No Show */}
              {(booking.booking_status === BookingStatus.CONFIRMED ||
                booking.booking_status === BookingStatus.CHECKED_IN) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateStatus(BookingStatus.NO_SHOW, 'Marked as no-show at base')}
                >
                  No Show
                </Button>
              )}

              {/* Communication Links */}
              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone}?text=${whatsappGreeting}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  >
                    WhatsApp
                  </Button>
                </a>
              )}

              {/* Cancel Booking (Danger separated) */}
              {booking.booking_status !== BookingStatus.CANCELLED &&
                booking.booking_status !== BookingStatus.COMPLETED && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Cancel Booking
                  </Button>
                )}
            </div>
          </div>

          {/* Customer Details Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-display">
                Customer Information
              </h3>
              <span className="text-[11px] text-slate-400 font-mono uppercase">
                {customerCountry} • {customerLang}
              </span>
            </div>

            <div className="bg-[#081210] border border-[#1F332C] rounded-2xl p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[11px]">Primary Contact</span>
                  <strong className="text-white text-sm font-display block mt-0.5">{customerName}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Phone Number</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <a href={`tel:${customerPhone}`} className="text-white hover:text-emerald-300 font-mono">
                      {customerPhone || 'Not provided'}
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Email Address</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${customerEmail}`} className="text-slate-200 hover:text-white truncate">
                      {customerEmail || 'Not provided'}
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Preferred Language</span>
                  <span className="text-slate-200 uppercase font-medium mt-0.5 block">
                    {customerLang === 'bs' ? 'Bosnian / Local' : 'English'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trip & Departure Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-display">
              Trip Details
            </h3>

            <div className="bg-[#081210] border border-[#1F332C] rounded-2xl p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[11px]">Adventure Package</span>
                  <strong className="text-white font-medium block mt-0.5">{pkgName}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Departure & Meeting</span>
                  <div className="mt-0.5 space-y-0.5">
                    <div className="text-emerald-400 font-medium font-mono">{depDate} at {depTime}</div>
                    <div className="text-slate-400 text-[11px]">Meeting at base: {meetingTime}</div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Party Breakdown</span>
                  <span className="text-white font-medium block mt-0.5">
                    {booking.adult_count} {booking.adult_count === 1 ? 'adult' : 'adults'}
                    {booking.child_count > 0 ? `, ${booking.child_count} children` : ''} ({booking.guest_count} total)
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Raft Allocation Status</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Anchor className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    {booking.allocations && booking.allocations.length > 0 ? (
                      <span className="text-sky-300 font-medium">
                        Allocated to {booking.allocations.length} {booking.allocations.length === 1 ? 'boat' : 'boats'}
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium">
                        Unallocated to raft
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons Section (if any) */}
          {booking.addons && booking.addons.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-display">
                Selected Add-ons
              </h3>

              <div className="bg-[#081210] border border-[#1F332C] rounded-2xl p-4 space-y-2 text-xs">
                {booking.addons.map((addon) => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between py-1.5 border-b border-[#1F332C] last:border-0 text-slate-300"
                  >
                    <div>
                      <span className="font-medium text-white">
                        {addon.addon?.name_en || addon.addon?.name_bs || 'Custom Add-on'}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Qty: {addon.quantity} × {addon.unit_price_snapshot} BAM
                      </span>
                    </div>
                    <span className="font-bold text-white font-mono">{addon.total_price} BAM</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment & Financial Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-display">
                Payment & Financials
              </h3>
              <StatusBadge status={booking.payment_status} size="sm" />
            </div>

            <div className="bg-[#081210] border border-[#1F332C] rounded-2xl p-4 space-y-4 text-xs">
              {/* Financial 3-column block */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-[#0E1A17] border border-[#1F332C]">
                <div>
                  <span className="text-slate-500 block text-[11px]">Total Booked</span>
                  <strong className="text-base text-white font-extrabold font-display">{booking.total_amount} BAM</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Paid Amount</span>
                  <strong className="text-base text-emerald-400 font-extrabold font-display">{totalPaid} BAM</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Remaining Due</span>
                  <strong className={`text-base font-extrabold font-display ${remainingDue > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {remainingDue} BAM
                  </strong>
                </div>
              </div>

              {/* Payment History List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Payment History ({booking.payments?.length || 0})
                  </span>
                  {remainingDue > 0 && (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Payment</span>
                    </button>
                  )}
                </div>

                {!booking.payments || booking.payments.length === 0 ? (
                  <p className="text-slate-500 italic text-[11px] py-1">
                    No payments recorded yet. Guest pays at base on arrival.
                  </p>
                ) : (
                  booking.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#0E1A17] border border-[#1F332C] text-slate-300"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-sm font-display">{p.amount} BAM</strong>
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#081210] text-emerald-400 border border-[#1F332C]">
                            {p.method.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {new Date(p.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          • Handled by: {p.collected_by_user_name || 'System'}
                        </span>
                      </div>

                      {p.reference && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Ref / Receipt:</span>
                          <span className="font-mono text-xs text-slate-300">{p.reference}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Notes Section (Customer & Internal) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-display">
              Notes & Instructions
            </h3>

            <div className="space-y-3 text-xs">
              {/* Customer Note */}
              {customerNote && (
                <div className="bg-[#081210] border border-[#1F332C] rounded-2xl p-4 space-y-1">
                  <span className="text-slate-500 text-[11px] font-semibold block">
                    Customer Note (from Booking Form)
                  </span>
                  <p className="text-slate-200 italic bg-[#0E1A17] p-2.5 rounded-xl border border-[#1F332C]">
                    "{customerNote}"
                  </p>
                </div>
              )}

              {/* Internal Staff Notes */}
              <div className="bg-[#081210] border border-amber-900/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Internal Staff Notes</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                    Staff Only
                  </span>
                </div>

                {internalNote ? (
                  <div className="text-slate-300 bg-[#0E1A17] p-3 rounded-xl border border-[#1F332C] whitespace-pre-line text-xs font-mono">
                    {internalNote}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">
                    No internal staff notes recorded for this reservation.
                  </p>
                )}

                {/* Add Internal Note Form */}
                <form onSubmit={handleSaveInternalNote} className="space-y-2 pt-2 border-t border-[#1F332C]">
                  <textarea
                    rows={2}
                    value={newInternalNote}
                    onChange={(e) => setNewInternalNote(e.target.value)}
                    placeholder="Add internal dispatcher note (e.g. Needs XXL wetsuit, VIP partner)..."
                    className="w-full bg-[#0E1A17] border border-[#1F332C] focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      disabled={!newInternalNote.trim() || isSavingNote}
                    >
                      {isSavingNote ? 'Saving...' : 'Add Note'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Communication History Section */}
          {notifications.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-display">
                Communication History
              </h3>

              <div className="bg-[#081210] border border-[#1F332C] rounded-2xl p-4 space-y-2 text-xs">
                {notifications.map((notif) => {
                  const typeLabel = notif.notification_type.replace(/_/g, ' ');
                  return (
                    <div
                      key={notif.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#0E1A17] border border-[#1F332C] text-slate-300"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-[#081210] border border-[#1F332C] text-emerald-400">
                          {notif.channel === 'whatsapp' ? (
                            <MessageCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Mail className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-white capitalize block">{typeLabel}</span>
                          <span className="text-[10px] text-slate-500">
                            To: {notif.recipient} • {new Date(notif.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                          {notif.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="p-4 border-t border-[#1F332C] bg-[#081210]/80 flex justify-between items-center text-xs text-slate-400">
          <span>Created on {new Date(booking.created_at).toLocaleDateString('en-US')}</span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Drawer
          </Button>
        </div>
      </div>

      {/* Subdialog: Record Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#07110F]/80 backdrop-blur-sm">
          <div className="bg-[#0E1A17] border border-[#1F332C] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#1F332C] pb-3">
              <div>
                <h4 className="font-bold text-white text-base font-display">
                  Record Payment
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {customerName} • {reservationCode}
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Amount (BAM) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-4 py-2.5 text-base font-bold text-white focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Remaining balance due for this reservation: {remainingDue} BAM
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Method *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-4 py-2 text-white font-semibold focus:outline-none"
                >
                  <option value={PaymentMethod.CASH}>Cash (Base Džajići)</option>
                  <option value={PaymentMethod.CARD_TERMINAL}>POS Terminal / Credit Card</option>
                  <option value={PaymentMethod.BANK_TRANSFER}>Bank Wire / Invoice</option>
                  <option value={PaymentMethod.OTHER}>Other / Hotel Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Receipt / Transaction Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. REC-2026-089"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-4 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash at reception"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-4 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1F332C]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingPayment}
                >
                  {isSubmittingPayment ? 'Recording...' : 'Save Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subdialog: Cancel Booking */}
      {showCancelModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#07110F]/80 backdrop-blur-sm">
          <div className="bg-[#0E1A17] border border-rose-900/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#1F332C] pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold text-white text-base font-display">
                  Cancel Reservation
                </h4>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelBooking} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cancellation Reason *</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value as CancellationReason)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-rose-500 rounded-xl px-4 py-2 text-white font-semibold focus:outline-none"
                >
                  <option value={CancellationReason.CUSTOMER_CANCELLED}>Customer Requested Cancellation</option>
                  <option value={CancellationReason.COMPANY_CANCELLED}>Agency / Operator Cancelled</option>
                  <option value={CancellationReason.WEATHER}>Adverse Weather / Storm</option>
                  <option value={CancellationReason.WATER_CONDITIONS}>High Water Level / River Conditions</option>
                  <option value={CancellationReason.SAFETY}>Safety / Equipment Precaution</option>
                  <option value={CancellationReason.OTHER}>Other / Administrative</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Explanation / Notes</label>
                <textarea
                  rows={2}
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-rose-500 rounded-xl px-4 py-2 text-white resize-none focus:outline-none"
                  placeholder="e.g. Guest notified via WhatsApp regarding road closure..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cancellation Fee (BAM, if applicable)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={cancelFee}
                  onChange={(e) => setCancelFee(Number(e.target.value))}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-rose-500 rounded-xl px-4 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1F332C]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancelModal(false)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  disabled={isSubmittingCancel}
                >
                  {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
