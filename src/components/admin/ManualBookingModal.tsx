import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Package, Departure, BookingSource, PaymentMethod, BookingStatus } from '../../types';
import { X, Plus, Users, Calendar, Clock, DollarSign, Shield, Phone } from 'lucide-react';

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
      toast.error('Molimo popunite sva obavezna polja');
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
                notes: 'Uplaćeno pri kreiranju rezervacije',
              }
            : undefined,
        internal_note: internalNote || undefined,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });

      toast.success(`Rezervacija ${res.reservation_code} uspješno kreirana!`);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Neuspjelo kreiranje rezervacije');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Unos Ručne Rezervacije (Staff)</h3>
            <p className="text-xs text-slate-400">
              Kreiranje rezervacije za goste koji zovu telefonom, šalju WhatsApp ili dolaze direktno na bazu.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
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
                <label className="block text-slate-300 font-semibold mb-1">Izvor Rezervacije *</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as BookingSource)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value={BookingSource.PHONE}>Telefonski Poziv</option>
                  <option value={BookingSource.WHATSAPP}>WhatsApp Poruka</option>
                  <option value={BookingSource.WALK_IN}>Walk-in (Direktno na bazi)</option>
                  <option value={BookingSource.TOUR_AGENCY}>Turistička Agencija / Partner</option>
                  <option value={BookingSource.OTHER}>Ostalo (Direktno/Email)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Izaberite Paket *</label>
                <select
                  value={selectedPkgId}
                  onChange={(e) => setSelectedPkgId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_bs} ({p.base_price_adult} BAM/os)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Departure Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Termin Polaska *</label>
              <select
                value={selectedDepId}
                onChange={(e) => setSelectedDepId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
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
                      {startTime} ({d.package?.name_bs}) - Slobodno mjesta: {d.spots_left}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Row 3: Guest Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Broj Odraslih *</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={adultCount}
                  onChange={(e) => setAdultCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Broj Djece (do 14 god)</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={childCount}
                  onChange={(e) => setChildCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm"
                />
              </div>
            </div>

            {/* Row 4: Guest Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ime Nosioca Grupe *</label>
                <input
                  type="text"
                  required
                  placeholder="npr. Emir"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prezime *</label>
                <input
                  type="text"
                  required
                  placeholder="npr. Hadžić"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Broj Telefona *</label>
                <input
                  type="tel"
                  required
                  placeholder="+387 61 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Adresa (opcionalno)</label>
                <input
                  type="email"
                  placeholder="gost@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Row 5: Initial Payment on Entry */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300">Ukupan obračunski iznos:</span>
                <span className="font-extrabold text-white text-base">{calculatedTotal} BAM</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-850">
                <div>
                  <label className="block text-slate-400 mb-1">Trenutno Uplaćeno (BAM):</label>
                  <input
                    type="number"
                    min={0}
                    max={calculatedTotal}
                    value={initialPaymentAmount}
                    onChange={(e) => setInitialPaymentAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Način Plaćanja:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={PaymentMethod.CASH}>Gotovina</option>
                    <option value={PaymentMethod.CARD_TERMINAL}>Kartica (POS)</option>
                    <option value={PaymentMethod.BANK_TRANSFER}>Bankovni Prenos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 6: Internal Note */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Interna Dispečerska Napomena</label>
              <input
                type="text"
                placeholder="npr. Tražili vegetarijanski meni, dolaze kombijem iz Sarajeva"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            {/* Submit Bar */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
              >
                Odustani
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold shadow-md transition-all cursor-pointer disabled:opacity-40"
              >
                {submitting ? 'Kreiram...' : 'Kreiraj Rezervaciju'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
