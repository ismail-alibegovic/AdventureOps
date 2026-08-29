import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Package, Departure, BookingSource, PaymentMethod, BookingStatus } from '../../types';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface ManualBookingModalProps {
  onClose: () => void;
  onSuccess: (booking: any) => void;
}

export const ManualBookingModal: React.FC<ManualBookingModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const { currentUser } = useAuth();

  const [packages, setPackages] = useState<Package[]>([]);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [selectedPkgId, setSelectedPkgId] = useState<string>('');
  const [selectedDepId, setSelectedDepId] = useState<string>('');
  const [adultCount, setAdultCount] = useState<number>(2);
  const [childCount, setChildCount] = useState<number>(0);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [source, setSource] = useState<BookingSource>(BookingSource.PHONE);
  const [initialPaymentAmount, setInitialPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [internalNote, setInternalNote] = useState<string>('');

  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);
        const [pkgs, deps] = await Promise.all([
          apiClient.getPackages(),
          apiClient.getDepartures(),
        ]);
        setPackages(pkgs);
        setDepartures(deps);
        if (pkgs.length > 0) setSelectedPkgId(pkgs[0].id);
        if (deps.length > 0) setSelectedDepId(deps[0].id);
      } catch (err) {
        toast.error('Failed to load packages or departures');
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, []);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId);
  const totalGuests = Number(adultCount) + Number(childCount);
  const calculatedTotal = selectedPkg
    ? Number(adultCount) * selectedPkg.base_price_adult +
      Number(childCount) * (selectedPkg.base_price_child || selectedPkg.base_price_adult * 0.7)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepId || !firstName || !lastName || !phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiClient.createAdminBooking({
        departure_id: selectedDepId,
        package_id: selectedPkgId,
        first_name: firstName,
        last_name: lastName,
        email: email || `${phone.replace(/[^0-9]/g, '')}@guest.neretvalive.ba`,
        phone,
        adult_count: Number(adultCount),
        child_count: Number(childCount),
        source,
        initial_status: BookingStatus.CONFIRMED,
        initial_payment:
          initialPaymentAmount > 0
            ? {
                amount: Number(initialPaymentAmount),
                method: paymentMethod,
                reference: 'Manual Entry',
                notes: 'Paid during booking creation',
              }
            : undefined,
        internal_note: internalNote || undefined,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });

      toast.success(`Booking ${res.reservation_code} successfully created!`);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07110F]/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0E1A17] border border-[#1F332C] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-[#1F332C] pb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-display">New Manual Booking (Staff)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Create a reservation for guests calling via phone, sending WhatsApp or walking in directly at the base.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#13211D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-emerald-400">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent mx-auto" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Row 1: Source & Package */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Booking Source *</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as BookingSource)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value={BookingSource.PHONE}>Phone Call</option>
                  <option value={BookingSource.WHATSAPP}>WhatsApp Message</option>
                  <option value={BookingSource.WALK_IN}>Walk-in (Direct at Base)</option>
                  <option value={BookingSource.TOUR_AGENCY}>Tour Agency / Partner</option>
                  <option value={BookingSource.OTHER}>Other / Email</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Package *</label>
                <select
                  value={selectedPkgId}
                  onChange={(e) => setSelectedPkgId(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_en || p.name_bs} ({p.base_price_adult} BAM/person)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Departure Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Departure Schedule *</label>
              <select
                value={selectedDepId}
                onChange={(e) => setSelectedDepId(e.target.value)}
                className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
              >
                {departures.map((d) => {
                  const startTime = new Date(d.start_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <option key={d.id} value={d.id}>
                      {startTime} ({d.package?.name_en || d.package?.name_bs}) - Available Seats: {d.spots_left}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Row 3: Guest Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Adults *</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={adultCount}
                  onChange={(e) => setAdultCount(Number(e.target.value))}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Children (under 14)</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={childCount}
                  onChange={(e) => setChildCount(Number(e.target.value))}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Row 4: Guest Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Miller"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+387 61 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Row 5: Initial Payment on Entry */}
            <div className="p-4 rounded-xl bg-[#081210] border border-[#1F332C] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300">Total Calculated Amount:</span>
                <span className="font-extrabold text-white text-base font-display">{calculatedTotal} BAM</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1F332C]">
                <div>
                  <label className="block text-slate-400 mb-1">Payment Received Now (BAM):</label>
                  <input
                    type="number"
                    min={0}
                    max={calculatedTotal}
                    value={initialPaymentAmount}
                    onChange={(e) => setInitialPaymentAmount(Number(e.target.value))}
                    className="w-full bg-[#0E1A17] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Payment Method:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-[#0E1A17] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value={PaymentMethod.CASH}>Cash (Base Džajići)</option>
                    <option value={PaymentMethod.CARD_TERMINAL}>Card (POS)</option>
                    <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 6: Internal Note */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Internal Staff Note</label>
              <input
                type="text"
                placeholder="e.g. Vegetarian meal requested, arriving by private minibus"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            {/* Submit Bar */}
            <div className="flex justify-end gap-3 pt-3 border-t border-[#1F332C]">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Booking'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
