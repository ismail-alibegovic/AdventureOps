import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useTranslation } from '../../locales/i18n';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { DepartureStatus, BookingStatus } from '../../types';
import {
  X,
  Ship,
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Shield,
  Phone,
  MessageCircle,
} from 'lucide-react';

interface DepartureDetailModalProps {
  departureId: string;
  onClose: () => void;
  onRefresh: () => void;
  onOpenBookingDetail: (bookingId: string) => void;
}

export const DepartureDetailModal: React.FC<DepartureDetailModalProps> = ({
  departureId,
  onClose,
  onRefresh,
  onOpenBookingDetail,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { currentUser, canDispatch, isAdminOrAbove } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [boats, setBoats] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  // Modals for adding boat
  const [selectedBoatId, setSelectedBoatId] = useState<string>('');
  const [selectedGuideId, setSelectedGuideId] = useState<string>('');

  // Allocation modal
  const [allocatingBooking, setAllocatingBooking] = useState<any | null>(null);
  const [allocTargetBaId, setAllocTargetBaId] = useState<string>('');
  const [allocGuestCount, setAllocGuestCount] = useState<number>(1);

  const loadDepartureData = async () => {
    try {
      setLoading(true);
      const [depData, boatsList, staffList] = await Promise.all([
        apiClient.getDepartureDetail(departureId),
        apiClient.getBoats(),
        apiClient.getStaff(),
      ]);
      setData(depData);
      setBoats(boatsList);
      setStaff(staffList);
      if (boatsList.length > 0) setSelectedBoatId(boatsList[0].id);
    } catch (err: any) {
      toast.error('Failed to load departure details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartureData();
  }, [departureId]);

  const handleAssignBoat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoatId) return;

    try {
      await apiClient.assignBoat(departureId, {
        boat_id: selectedBoatId,
        guide_id: selectedGuideId || undefined,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success('Čamac uspješno dodijeljen polasku');
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Neuspjelo dodjeljivanje čamca');
    }
  };

  const handleRemoveBoat = async (baId: string) => {
    if (!confirm('Ukloniti ovaj čamac sa polaska? Sve postojeće alokacije na ovaj čamac će biti obrisane.')) return;
    try {
      await apiClient.removeBoatAssignment(baId);
      toast.success('Čamac uklonjen sa polaska');
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Neuspjelo uklanjanje čamca');
    }
  };

  const handleUpdateGuide = async (baId: string, guideId: string) => {
    try {
      await apiClient.updateAssignmentGuide(baId, {
        guide_id: guideId || undefined,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success('Skiper ažuriran');
      loadDepartureData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAllocateGuests = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingBooking || !allocTargetBaId) return;

    try {
      await apiClient.allocateGuests({
        booking_id: allocatingBooking.id,
        boat_assignment_id: allocTargetBaId,
        guest_count: allocGuestCount,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success(`Alocirano ${allocGuestCount} gostiju u čamac`);
      setAllocatingBooking(null);
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Neuspjela alokacija');
    }
  };

  const handleRemoveAllocation = async (allocId: string) => {
    try {
      await apiClient.removeAllocation(allocId);
      toast.success('Alokacija uklonjena');
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdateStatus = async (newStatus: DepartureStatus) => {
    try {
      await apiClient.updateDeparture(departureId, { status: newStatus });
      toast.success(`Status polaska postavljen na: ${newStatus}`);
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCheckInToggle = async (bookingId: string, currentStatus: BookingStatus) => {
    try {
      const nextStatus =
        currentStatus === BookingStatus.CHECKED_IN
          ? BookingStatus.CONFIRMED
          : BookingStatus.CHECKED_IN;

      await apiClient.updateBookingStatus(bookingId, {
        status: nextStatus,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success(`Status gosta: ${nextStatus}`);
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400" />
      </div>
    );
  }

  const { departure, boat_assignments, unassigned_bookings, total_reserved_guests, available_capacity } = data;
  const startTime = new Date(departure.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const startDate = new Date(departure.start_at).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const meetTime = departure.meeting_at ? new Date(departure.meeting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-extrabold text-white">{startTime}</span>
              <span className="text-sm font-semibold text-emerald-400">({startDate})</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sastanak na bazi: <strong className="text-slate-200">{meetTime}</strong> • Paket: <strong className="text-white">{departure.package?.name_bs || 'Rafting Neretva'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status switcher */}
            <select
              value={departure.status}
              onChange={(e) => handleUpdateStatus(e.target.value as DepartureStatus)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              <option value={DepartureStatus.OPEN}>OPEN (Otvoreno)</option>
              <option value={DepartureStatus.FULL}>FULL (Popunjeno)</option>
              <option value={DepartureStatus.CLOSED}>CLOSED (Zatvoreno)</option>
              <option value={DepartureStatus.COMPLETED}>COMPLETED (Završeno)</option>
              <option value={DepartureStatus.CANCELLED}>CANCELLED (Otkazano)</option>
            </select>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Capacity summary banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Ukupno Rezervisano:</span>
            <strong className="text-base text-white font-extrabold">
              {total_reserved_guests} / {departure.capacity_limit} gostiju
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block">Slobodnih Mjesta:</span>
            <strong className="text-base text-emerald-400 font-extrabold">
              {available_capacity}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block">Flota na Vodi:</span>
            <strong className="text-base text-sky-400 font-extrabold">
              {boat_assignments.length} čamaca
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block">Nealocirano:</span>
            <strong className="text-base text-amber-400 font-extrabold">
              {unassigned_bookings.reduce((sum: number, b: any) => sum + b.unallocated_guests, 0)} gostiju
            </strong>
          </div>
        </div>

        {/* Section 1: Assigned Boats & Allocations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Ship className="w-4 h-4 text-emerald-400" />
              <span>Raspoređeni Čamci ({boat_assignments.length})</span>
            </h4>
          </div>

          {/* Form to assign new boat */}
          {canDispatch && (
            <form
              onSubmit={handleAssignBoat}
              className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
            >
              <span className="font-bold text-slate-300">Dodaj Čamac na Polazak:</span>
              <select
                value={selectedBoatId}
                onChange={(e) => setSelectedBoatId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {boats
                  .filter((b) => !boat_assignments.some((ba: any) => ba.boat_id === b.id))
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Kapacitet: {b.capacity} os.)
                    </option>
                  ))}
              </select>

              <select
                value={selectedGuideId}
                onChange={(e) => setSelectedGuideId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Izaberi Skipera --</option>
                {staff
                  .filter((s) => s.role === 'guide')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.license_level || 'IRF Guide'})
                    </option>
                  ))}
              </select>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold transition-all shadow-xs cursor-pointer"
              >
                Dodaj Čamac
              </button>
            </form>
          )}

          {/* Boat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boat_assignments.map((ba: any) => {
              const allocatedGuests = ba.allocations.reduce((sum: number, a: any) => sum + a.guest_count, 0);
              const maxCap = ba.boat?.capacity || 8;

              return (
                <div
                  key={ba.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-base font-bold text-white">{ba.boat?.name || 'Rafting Čamac'}</h5>
                      <span className="text-xs text-slate-400">
                        Model: {ba.boat?.model || 'Gumotex Pulsar 420'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                          allocatedGuests > maxCap
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {allocatedGuests} / {maxCap} mjesta
                      </span>

                      {canDispatch && (
                        <button
                          onClick={() => handleRemoveBoat(ba.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Ukloni čamac"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Guide assignment */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-850">
                    <span className="text-slate-400">Skiper:</span>
                    <select
                      value={ba.guide_id || ''}
                      onChange={(e) => handleUpdateGuide(ba.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-semibold focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Nema Skipera --</option>
                      {staff
                        .filter((s) => s.role === 'guide')
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.first_name} {s.last_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Allocations inside this boat */}
                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Gosti u čamcu ({ba.allocations.length} grupa):
                    </span>

                    {ba.allocations.length === 0 ? (
                      <span className="text-xs text-slate-600 block italic">Čamac je prazan</span>
                    ) : (
                      <div className="space-y-1.5">
                        {ba.allocations.map((alloc: any) => (
                          <div
                            key={alloc.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                          >
                            <div>
                              <span className="font-semibold text-white">
                                {alloc.booking ? `${alloc.booking.first_name} ${alloc.booking.last_name}` : 'Gost'}
                              </span>
                              <span className="text-slate-400 ml-2">
                                ({alloc.guest_count} os.)
                              </span>
                            </div>

                            {canDispatch && (
                              <button
                                onClick={() => handleRemoveAllocation(alloc.id)}
                                className="text-slate-500 hover:text-rose-400 p-1"
                                title="Ukloni iz ovog čamca"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Bookings Manifest & Check-In */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Spisak Rezervacija & Check-In ({departure.bookings?.length || 0})</span>
          </h4>

          <div className="space-y-2">
            {departure.bookings?.map((b: any) => {
              const isCheckedIn = b.booking_status === BookingStatus.CHECKED_IN;
              const unallocated = b.guest_count - (b.allocated_guests_count || 0);

              return (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {b.booking_code}
                      </span>
                      <span className="font-bold text-white text-sm">
                        {b.first_name} {b.last_name}
                      </span>
                      <span className="text-slate-400">
                        ({b.guest_count} gostiju: {b.adult_count} odr. {b.child_count > 0 ? `+ ${b.child_count} dj.` : ''})
                      </span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-3">
                      <span>{b.phone}</span>
                      <span>•</span>
                      <span>Ukupno: <strong className="text-white">{b.total_amount} BAM</strong></span>
                      <span>•</span>
                      <span className="uppercase text-emerald-400 font-semibold">{b.payment_status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Allocate button if unallocated guests remain */}
                    {unallocated > 0 && boat_assignments.length > 0 && (
                      <button
                        onClick={() => {
                          setAllocatingBooking(b);
                          setAllocTargetBaId(boat_assignments[0].id);
                          setAllocGuestCount(unallocated);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-950 text-sky-300 border border-sky-800 hover:bg-sky-900 font-semibold cursor-pointer"
                      >
                        Dodijeli u Čamac ({unallocated} preostalo)
                      </button>
                    )}

                    {/* Check In toggle */}
                    <button
                      onClick={() => handleCheckInToggle(b.id, b.booking_status)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isCheckedIn
                          ? 'bg-emerald-500 text-slate-950 shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCheckedIn ? 'Checked-In' : 'Prijavi Dolazak'}</span>
                    </button>

                    <button
                      onClick={() => onOpenBookingDetail(b.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
                    >
                      Detalji
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Subdialog: Allocate Guest Count to Boat */}
        {allocatingBooking && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white text-sm">
                  Alokacija Gostiju u Čamac ({allocatingBooking.first_name} {allocatingBooking.last_name})
                </h4>
                <button onClick={() => setAllocatingBooking(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAllocateGuests} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Izaberite Čamac:</label>
                  <select
                    value={allocTargetBaId}
                    onChange={(e) => setAllocTargetBaId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {boat_assignments.map((ba: any) => (
                      <option key={ba.id} value={ba.id}>
                        {ba.boat?.name} (Skiper: {ba.guide ? ba.guide.first_name : 'Nema'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Broj gostiju za ovaj čamac:</label>
                  <input
                    type="number"
                    min={1}
                    max={allocatingBooking.guest_count}
                    value={allocGuestCount}
                    onChange={(e) => setAllocGuestCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Možete podijeliti grupu (npr. 14 gostiju: 8 u Čamac A, 6 u Čamac B).
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAllocatingBooking(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                  >
                    Odustani
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold"
                  >
                    Potvrdi Alokaciju
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
