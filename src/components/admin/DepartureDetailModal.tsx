import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Trash2,
  Plus,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  ArrowRight,
  FileText,
  Ban,
  Layers,
  Utensils,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

interface DepartureDetailModalProps {
  departureId: string;
  onClose: () => void;
  onRefresh: () => void;
  onOpenBookingDetail: (bookingId: string) => void;
}

type TabType = 'allocations' | 'manifest' | 'actions';

export const DepartureDetailModal: React.FC<DepartureDetailModalProps> = ({
  departureId,
  onClose,
  onRefresh,
  onOpenBookingDetail,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { currentUser, canDispatch, isAdminOrAbove } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('allocations');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [boats, setBoats] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  // Assign boat modal state
  const [isAddBoatOpen, setIsAddBoatOpen] = useState<boolean>(false);
  const [selectedBoatId, setSelectedBoatId] = useState<string>('');
  const [selectedGuideId, setSelectedGuideId] = useState<string>('');
  const [submittingBoat, setSubmittingBoat] = useState<boolean>(false);

  // Allocation modal state
  const [allocatingBooking, setAllocatingBooking] = useState<any | null>(null);
  const [allocTargetBaId, setAllocTargetBaId] = useState<string>('');
  const [allocGuestCount, setAllocGuestCount] = useState<number>(1);
  const [submittingAlloc, setSubmittingAlloc] = useState<boolean>(false);

  // Cancellation modal state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Severe weather & high water level');
  const [cancellingDeparture, setCancellingDeparture] = useState<boolean>(false);

  // Notes update state
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [updatingNotes, setUpdatingNotes] = useState<boolean>(false);

  const loadDepartureData = async () => {
    try {
      setLoading(true);
      const [depData, boatsList, staffList] = await Promise.all([
        apiClient.getDepartureDetail(departureId),
        apiClient.getBoats().catch(() => []),
        apiClient.getStaff().catch(() => []),
      ]);
      setData(depData);
      setBoats(boatsList);
      setStaff(staffList);
      setInternalNotes(depData?.departure?.internal_notes || '');
    } catch (err: any) {
      toast.error('Failed to load departure details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartureData();
  }, [departureId]);

  // Assign Boat Handler
  const handleAssignBoat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoatId) return;

    try {
      setSubmittingBoat(true);
      await apiClient.assignBoat(departureId, {
        boat_id: selectedBoatId,
        guide_id: selectedGuideId || undefined,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success('Boat assigned to departure.');
      setIsAddBoatOpen(false);
      setSelectedBoatId('');
      setSelectedGuideId('');
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign boat.');
    } finally {
      setSubmittingBoat(false);
    }
  };

  // Remove Boat Handler
  const handleRemoveBoat = async (baId: string, boatName: string) => {
    if (!confirm(`Are you sure you want to remove ${boatName} from this departure? All allocations on this boat will be unassigned.`)) {
      return;
    }
    try {
      await apiClient.removeBoatAssignment(baId);
      toast.success(`${boatName} removed from departure.`);
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove boat.');
    }
  };

  // Update Guide Handler
  const handleUpdateGuide = async (baId: string, guideId: string) => {
    try {
      await apiClient.updateAssignmentGuide(baId, {
        guide_id: guideId || undefined,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success('Guide assignment updated.');
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update guide.');
    }
  };

  // Allocate Guests Handler
  const handleAllocateGuests = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingBooking || !allocTargetBaId) return;

    try {
      setSubmittingAlloc(true);
      await apiClient.allocateGuests({
        booking_id: allocatingBooking.id,
        boat_assignment_id: allocTargetBaId,
        guest_count: allocGuestCount,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success(`Allocated ${allocGuestCount} guests to boat.`);
      setAllocatingBooking(null);
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to allocate guests.');
    } finally {
      setSubmittingAlloc(false);
    }
  };

  // Remove Allocation Handler
  const handleRemoveAllocation = async (allocId: string) => {
    try {
      await apiClient.removeAllocation(allocId);
      toast.success('Guest allocation removed.');
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove allocation.');
    }
  };

  // Update Status Handler
  const handleUpdateStatus = async (newStatus: DepartureStatus) => {
    try {
      await apiClient.updateDeparture(departureId, { status: newStatus });
      toast.success(`Departure status updated to ${newStatus.toUpperCase()}`);
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update departure status.');
    }
  };

  // Check-In Toggle Handler
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
      toast.success(
        nextStatus === BookingStatus.CHECKED_IN
          ? 'Guest checked in successfully.'
          : 'Check-in status removed.'
      );
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle check-in status.');
    }
  };

  // Cancel Departure Handler
  const handleCancelDeparture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;

    try {
      setCancellingDeparture(true);
      await apiClient.cancelDeparture(departureId, {
        reason: cancelReason,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success('Departure cancelled and notifications logged.');
      setIsCancelDialogOpen(false);
      loadDepartureData();
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel departure.');
    } finally {
      setCancellingDeparture(false);
    }
  };

  // Save Notes Handler
  const handleSaveNotes = async () => {
    try {
      setUpdatingNotes(true);
      await apiClient.updateDeparture(departureId, { internal_notes: internalNotes });
      toast.success('Internal notes updated.');
      loadDepartureData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save notes.');
    } finally {
      setUpdatingNotes(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3 text-emerald-400">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-400 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-300">Loading departure workspace...</span>
        </div>
      </div>
    );
  }

  const { departure, boat_assignments, bookings = [] } = data;
  const startTime = new Date(departure.start_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const startDate = new Date(departure.start_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const meetTime = departure.meeting_at
    ? new Date(departure.meeting_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '';

  const packageName =
    departure.package?.name_en || departure.package?.name_bs || 'Classic Neretva Rafting';
  const totalGuests = bookings.reduce((sum: number, b: any) => sum + (b.guest_count || 0), 0);
  const capacityLimit = departure.capacity_limit || 40;
  const availableSeats = Math.max(0, capacityLimit - totalGuests);
  const isFull = availableSeats <= 0;

  const unassignedGroups = bookings.filter((b: any) => {
    const unallocated = b.unallocated_count ?? (b.guest_count - (b.allocated_guests_count || 0));
    return unallocated > 0;
  });

  const availableBoatsToAdd = boats.filter(
    (b) => !boat_assignments.some((ba: any) => ba.boat_id === b.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0A1714] border border-[#192F26] rounded-2xl sm:rounded-3xl max-w-5xl w-full p-4 sm:p-6 md:p-8 shadow-2xl space-y-6 my-auto max-h-[92vh] flex flex-col justify-between overflow-hidden"
      >
        {/* ----------------------------------------------------------- */}
        {/* 1. MODAL HEADER & TIME HIERARCHY */}
        {/* ----------------------------------------------------------- */}
        <div className="shrink-0 space-y-4 pb-4 border-b border-[#142620]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-14 sm:w-16 h-14 rounded-2xl bg-[#0E221C] border border-[#1F3E33] flex flex-col items-center justify-center shrink-0 shadow-inner">
                <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight leading-none">
                  {startTime}
                </span>
                {meetTime && (
                  <span className="text-[9px] text-slate-400 font-mono mt-1">
                    Meet {meetTime}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                    {packageName}
                  </h2>
                  <span className="text-xs text-emerald-400 font-semibold">
                    • {startDate}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Base Check-in: <strong className="text-slate-200">{meetTime || startTime}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span>Duration: <strong className="text-slate-200">{departure.package?.duration_minutes ? `${Math.round(departure.package.duration_minutes / 60)}h` : '4.5h'}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              {/* Status Selector */}
              {canDispatch ? (
                <select
                  value={departure.status}
                  onChange={(e) => handleUpdateStatus(e.target.value as DepartureStatus)}
                  aria-label="Update departure status"
                  className="bg-[#081210] border border-[#1C382E] rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={DepartureStatus.OPEN}>OPEN (Accepting)</option>
                  <option value={DepartureStatus.FULL}>FULL (Locked)</option>
                  <option value={DepartureStatus.CLOSED}>CLOSED</option>
                  <option value={DepartureStatus.COMPLETED}>COMPLETED</option>
                  <option value={DepartureStatus.CANCELLED}>CANCELLED</option>
                </select>
              ) : (
                <StatusBadge status={departure.status} size="md" />
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#0E201B] hover:bg-[#152F28] text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close departure workspace"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#091512] border border-[#172C24] text-xs">
            <div className="flex items-center gap-3 sm:gap-4 text-slate-300">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <strong className="text-white font-bold">{totalGuests}</strong> / {capacityLimit} guests
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-sky-400" />
                <strong className="text-white font-bold">{boat_assignments.length}</strong> boats
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                <strong className="text-white font-bold">
                  {boat_assignments.filter((ba: any) => !!ba.guide_id).length}
                </strong> guides
              </span>
            </div>

            <span className={`font-bold ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isFull ? 'Sold Out' : `${availableSeats} seats available`}
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-[#142620] pt-1">
            <button
              onClick={() => setActiveTab('allocations')}
              className={`px-4 py-2 text-xs font-bold font-display border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'allocations'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ship className="w-3.5 h-3.5" />
              <span>Fleet & Allocations</span>
              {unassignedGroups.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px] font-mono border border-amber-800">
                  {unassignedGroups.length} unassigned
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('manifest')}
              className={`px-4 py-2 text-xs font-bold font-display border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'manifest'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Guest Manifest ({bookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-2 text-xs font-bold font-display border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'actions'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Overview & Actions</span>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* 2. TAB BODY (SCROLLABLE) */}
        {/* ----------------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 min-h-[300px] max-h-[55vh]">
          {/* ========================================================= */}
          {/* TAB 1: FLEET & BOAT ALLOCATIONS */}
          {/* ========================================================= */}
          {activeTab === 'allocations' && (
            <div className="space-y-6">
              {/* Unallocated Guests Warning Strip if any */}
              {unassignedGroups.length > 0 && (
                <div className="p-4 rounded-xl bg-[#14231A] border border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong className="text-white font-bold">{unassignedGroups.length} guest group(s)</strong> have unallocated guests waiting for boat assignment.
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">
                    {unassignedGroups.reduce(
                      (s: number, b: any) => s + (b.unallocated_count ?? (b.guest_count - (b.allocated_guests_count || 0))),
                      0
                    )}{' '}
                    guests unallocated
                  </span>
                </div>
              )}

              {/* Boat Header & Add Button */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <Ship className="w-4 h-4 text-emerald-400" />
                  <span>Assigned Boats ({boat_assignments.length})</span>
                </h3>

                {canDispatch && availableBoatsToAdd.length > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddBoatOpen(true)}
                    leftIcon={<Plus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />}
                    className="text-xs"
                  >
                    Assign Boat
                  </Button>
                )}
              </div>

              {/* Boats Grid */}
              {boat_assignments.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#091512] border border-[#172C24] text-center space-y-3">
                  <Ship className="w-8 h-8 text-slate-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white font-display">
                      No boats assigned yet
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Assign active rafts from your fleet to start distributing booked guests.
                    </p>
                  </div>
                  {canDispatch && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAddBoatOpen(true)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Assign First Boat
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {boat_assignments.map((ba: any) => {
                    const boatName = ba.boat?.name || 'Rafting Boat';
                    const boatCap = ba.capacity || ba.boat?.capacity || 8;
                    const allocatedGuests = ba.total_allocated_guests ?? (ba.allocated_guests_count || 0);
                    const isBoatFull = allocatedGuests >= boatCap;
                    const occupancyPct = Math.min(100, Math.round((allocatedGuests / boatCap) * 100));

                    const guide = ba.guide;
                    const allocations = ba.allocations || [];

                    return (
                      <div
                        key={ba.id}
                        className="rounded-2xl bg-[#091512] border border-[#172C24] p-4 sm:p-5 space-y-4 shadow-sm flex flex-col justify-between"
                      >
                        {/* Boat Info */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white font-display">
                                  {boatName}
                                </h4>
                                {isBoatFull && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-mono font-bold border border-rose-800/60">
                                    FULL
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {ba.boat?.model || 'Standard River Raft'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                                  isBoatFull
                                    ? 'bg-rose-950/70 text-rose-300 border-rose-800/60'
                                    : 'bg-[#11241E] text-emerald-300 border-[#1E3E33]'
                                }`}
                              >
                                {allocatedGuests} / {boatCap} guests
                              </span>

                              {canDispatch && (
                                <button
                                  onClick={() => handleRemoveBoat(ba.id, boatName)}
                                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                                  title="Remove boat from departure"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Capacity progress bar */}
                          <div className="w-full bg-[#081210] h-2 rounded-full overflow-hidden border border-[#182C24]">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isBoatFull ? 'bg-rose-500' : occupancyPct >= 75 ? 'bg-teal-400' : 'bg-emerald-400'
                              }`}
                              style={{ width: `${occupancyPct}%` }}
                            />
                          </div>
                        </div>

                        {/* Guide assignment */}
                        <div className="p-2.5 rounded-xl bg-[#0D1F1A] border border-[#1A342B] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <UserCheck className={`w-3.5 h-3.5 ${guide ? 'text-emerald-400' : 'text-amber-400'}`} />
                            <span className="text-slate-400 font-medium">Guide:</span>
                          </div>

                          {canDispatch ? (
                            <select
                              value={ba.guide_id || ''}
                              onChange={(e) => handleUpdateGuide(ba.id, e.target.value)}
                              aria-label={`Guide assignment for ${boatName}`}
                              className="bg-[#091512] border border-[#1C3A30] focus:border-emerald-500 rounded-lg px-2 py-1 text-xs text-white font-semibold focus:outline-none"
                            >
                              <option value="">-- No Guide Assigned --</option>
                              {staff
                                .filter((s) => s.role === 'guide')
                                .map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.first_name} {s.last_name} ({s.license_level || 'IRF'})
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <span className={guide ? 'text-white font-semibold' : 'text-amber-400 font-medium'}>
                              {guide ? `${guide.first_name} ${guide.last_name}` : 'No Guide'}
                            </span>
                          )}
                        </div>

                        {/* Allocated Groups List */}
                        <div className="space-y-1.5 pt-2 border-t border-[#142620]">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Allocated Guests:
                          </span>

                          {allocations.length === 0 ? (
                            <span className="text-[11px] text-slate-500 italic block py-1">
                              No guests allocated to this boat yet.
                            </span>
                          ) : (
                            allocations.map((alloc: any) => {
                              const bInfo = alloc.booking;
                              const gName = bInfo ? `${bInfo.first_name} ${bInfo.last_name}` : 'Guest';

                              return (
                                <div
                                  key={alloc.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-[#0E201B] border border-[#1B362C] text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{gName}</span>
                                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#132A22] text-emerald-400 font-mono font-bold">
                                      {alloc.guest_count} guests
                                    </span>
                                  </div>

                                  {canDispatch && (
                                    <button
                                      onClick={() => handleRemoveAllocation(alloc.id)}
                                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                                      title="Remove from boat"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: GUEST MANIFEST & CHECK-IN */}
          {/* ========================================================= */}
          {activeTab === 'manifest' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-[#142620]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white font-display">
                    Manifest ({bookings.length} reservations • {totalGuests} guests)
                  </h3>
                </div>

                <span className="text-xs text-slate-400">
                  {bookings.filter((b: any) => b.booking_status === BookingStatus.CHECKED_IN).length} of{' '}
                  {bookings.length} checked in
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#091512] border border-[#172C24] text-center space-y-2">
                  <Users className="w-8 h-8 text-slate-500 mx-auto" />
                  <h4 className="text-xs font-bold text-white">No bookings in this departure</h4>
                  <p className="text-[11px] text-slate-400">
                    New website and direct reservations will automatically appear on this manifest.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b: any) => {
                    const isCheckedIn = b.booking_status === BookingStatus.CHECKED_IN;
                    const unallocated =
                      b.unallocated_count ?? (b.guest_count - (b.allocated_guests_count || 0));

                    return (
                      <div
                        key={b.id}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          isCheckedIn
                            ? 'bg-[#0E221C] border-[#1E4336]'
                            : 'bg-[#091512] border-[#172C24] hover:border-[#1F3E33]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h4 className="text-sm font-bold text-white font-display">
                                {b.first_name} {b.last_name}
                              </h4>
                              <span className="px-2 py-0.5 rounded bg-[#11241E] text-slate-300 font-mono text-[11px] font-bold">
                                {b.booking_code}
                              </span>
                              <StatusBadge status={b.payment_status} type="payment" size="sm" />
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                              <span className="text-slate-200 font-semibold">
                                {b.guest_count} guests ({b.adult_count} adults{b.child_count > 0 ? `, ${b.child_count} children` : ''})
                              </span>
                              <span className="text-slate-600">•</span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-500" />
                                {b.phone}
                              </span>
                              <span className="text-slate-600">•</span>
                              <span>Total: <strong className="text-white">{b.total_amount} BAM</strong></span>
                            </div>
                          </div>

                          {/* Manifest Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Allocate trigger if unallocated */}
                            {unallocated > 0 && boat_assignments.length > 0 && canDispatch && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setAllocatingBooking(b);
                                  setAllocTargetBaId(boat_assignments[0].id);
                                  setAllocGuestCount(unallocated);
                                }}
                                className="text-xs"
                              >
                                Allocate ({unallocated} left)
                              </Button>
                            )}

                            {/* 1-Click Check In Toggle */}
                            <Button
                              variant={isCheckedIn ? 'secondary' : 'outline'}
                              size="sm"
                              onClick={() => handleCheckInToggle(b.id, b.booking_status)}
                              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                              className="text-xs font-semibold"
                            >
                              {isCheckedIn ? 'Checked-In' : 'Check In'}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onOpenBookingDetail(b.id)}
                              rightIcon={<ExternalLink className="w-3 h-3" />}
                              className="text-xs text-slate-300 hover:text-white"
                            >
                              Details
                            </Button>
                          </div>
                        </div>

                        {/* Customer note / Dietary info */}
                        {b.customer_note && (
                          <div className="p-2 rounded-lg bg-[#122119] border border-amber-900/30 text-amber-300 text-xs flex items-start gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{b.customer_note}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: OVERVIEW & ACTIONS */}
          {/* ========================================================= */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Departure Configuration Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#091512] border border-[#172C24] space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Run Schedule</span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Start Time: <strong className="text-white">{startTime}</strong></p>
                    <p>Base Meet Time: <strong className="text-white">{meetTime || startTime}</strong></p>
                    <p>Expected Completion: <strong className="text-white">
                      {departure.expected_end_at ? new Date(departure.expected_end_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
                    </strong></p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#091512] border border-[#172C24] space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                    <MapPin className="w-4 h-4 text-sky-400" />
                    <span>Location & Base</span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Meeting Base: <strong className="text-white">AdventureOps Neretva Base Camp</strong></p>
                    <p>River Stretch: <strong className="text-white">Glavatičevo → Konjic (23 km)</strong></p>
                  </div>
                </div>
              </div>

              {/* Internal Dispatcher Notes */}
              <div className="p-4 rounded-xl bg-[#091512] border border-[#172C24] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dispatcher & River Notes</span>
                  </h4>
                  {canDispatch && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={updatingNotes}
                      loading={updatingNotes}
                      className="text-xs"
                    >
                      Save Notes
                    </Button>
                  )}
                </div>

                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add river conditions, VIP client requests, or guide briefing notes..."
                  rows={3}
                  className="w-full bg-[#081210] border border-[#182F26] focus:border-emerald-500 rounded-xl p-3 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Danger Zone: Cancellation */}
              {canDispatch && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-rose-300 font-display flex items-center gap-1.5">
                        <Ban className="w-4 h-4 text-rose-400" />
                        <span>Cancel Departure</span>
                      </h4>
                      <p className="text-[11px] text-rose-400/80 mt-0.5">
                        Cancels this entire departure run and logs notifications for all booked guests.
                      </p>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setIsCancelDialogOpen(true)}
                      className="text-xs font-bold"
                    >
                      Cancel Departure
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------- */}
        {/* 3. MODAL FOOTER */}
        {/* ----------------------------------------------------------- */}
        <div className="shrink-0 pt-4 border-t border-[#142620] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            Departure ID: {departure.id}
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Workspace
          </Button>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* SUBMODAL: ASSIGN BOAT */}
        {/* ----------------------------------------------------------- */}
        <AnimatePresence>
          {isAddBoatOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0A1714] border border-[#192F26] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
              >
                <div className="flex justify-between items-center border-b border-[#142620] pb-3">
                  <h4 className="font-bold text-white text-sm font-display">
                    Assign Boat to Departure
                  </h4>
                  <button
                    onClick={() => setIsAddBoatOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAssignBoat} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Select Boat:
                    </label>
                    <select
                      value={selectedBoatId}
                      onChange={(e) => setSelectedBoatId(e.target.value)}
                      required
                      className="w-full bg-[#081210] border border-[#182F26] focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                    >
                      <option value="">-- Choose active raft --</option>
                      {availableBoatsToAdd.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.capacity} seats • {b.model || 'Standard'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Assign Skipper Guide (Optional):
                    </label>
                    <select
                      value={selectedGuideId}
                      onChange={(e) => setSelectedGuideId(e.target.value)}
                      className="w-full bg-[#081210] border border-[#182F26] focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                    >
                      <option value="">-- Assign Later --</option>
                      {staff
                        .filter((s) => s.role === 'guide')
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.first_name} {s.last_name} ({s.license_level || 'IRF Guide'})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#142620]">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddBoatOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!selectedBoatId || submittingBoat}
                      loading={submittingBoat}
                    >
                      Assign Boat
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ----------------------------------------------------------- */}
        {/* SUBMODAL: ALLOCATE GUESTS TO BOAT */}
        {/* ----------------------------------------------------------- */}
        <AnimatePresence>
          {allocatingBooking && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0A1714] border border-[#192F26] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
              >
                <div className="flex justify-between items-center border-b border-[#142620] pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">
                      Allocate Guests to Boat
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {allocatingBooking.first_name} {allocatingBooking.last_name} ({allocatingBooking.booking_code})
                    </p>
                  </div>
                  <button
                    onClick={() => setAllocatingBooking(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAllocateGuests} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Choose Target Boat:
                    </label>
                    <select
                      value={allocTargetBaId}
                      onChange={(e) => setAllocTargetBaId(e.target.value)}
                      required
                      className="w-full bg-[#081210] border border-[#182F26] focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                    >
                      {boat_assignments.map((ba: any) => {
                        const bCap = ba.capacity || ba.boat?.capacity || 8;
                        const freeSeats = Math.max(0, bCap - (ba.total_allocated_guests ?? (ba.allocated_guests_count || 0)));
                        const gName = ba.guide ? `${ba.guide.first_name} ${ba.guide.last_name}` : 'No Guide';

                        return (
                          <option key={ba.id} value={ba.id}>
                            {ba.boat?.name} ({freeSeats} seats free • Skipper: {gName})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Number of Guests for this Boat:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={allocatingBooking.unallocated_count ?? allocatingBooking.guest_count}
                      value={allocGuestCount}
                      onChange={(e) => setAllocGuestCount(Number(e.target.value))}
                      required
                      className="w-full bg-[#081210] border border-[#182F26] focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 block mt-1">
                      You can split larger groups across multiple boats.
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#142620]">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAllocatingBooking(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={submittingAlloc}
                      loading={submittingAlloc}
                    >
                      Confirm Allocation
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ----------------------------------------------------------- */}
        {/* SUBMODAL: CANCEL DEPARTURE CONFIRMATION */}
        {/* ----------------------------------------------------------- */}
        <AnimatePresence>
          {isCancelDialogOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0A1714] border border-rose-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
              >
                <div className="flex items-center gap-2 text-rose-400 border-b border-rose-900/40 pb-3">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h4 className="font-bold text-white text-base font-display">
                    Confirm Departure Cancellation
                  </h4>
                </div>

                <form onSubmit={handleCancelDeparture} className="space-y-4 text-xs">
                  <p className="text-slate-300">
                    Are you sure you want to cancel the <strong className="text-white">{startTime} {packageName}</strong> departure?
                  </p>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Cancellation Reason (Required):
                    </label>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full bg-[#081210] border border-[#182F26] focus:border-rose-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                    >
                      <option value="Severe weather & high water level">Severe weather & high river flow</option>
                      <option value="Thunderstorm lightning warning">Thunderstorm & lightning alert</option>
                      <option value="Dam water release schedule change">Dam water release schedule change</option>
                      <option value="Equipment or logistics disruption">Equipment or logistics disruption</option>
                      <option value="Client requested group reschedule">Client requested group reschedule</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#142620]">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCancelDialogOpen(false)}
                    >
                      Keep Departure
                    </Button>
                    <Button
                      type="submit"
                      variant="danger"
                      size="sm"
                      disabled={cancellingDeparture}
                      loading={cancellingDeparture}
                    >
                      Confirm Cancellation
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
