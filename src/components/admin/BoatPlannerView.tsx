import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient } from '../../api/client';
import { useTranslation } from '../../locales/i18n';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Ship,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Utensils,
  RefreshCw,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { PageLoader } from '../ui/loading';

interface BoatPlannerViewProps {
  onSelectDeparture?: (depId: string) => void;
}

export const BoatPlannerView: React.FC<BoatPlannerViewProps> = ({ onSelectDeparture }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { currentUser, canDispatch } = useAuth();

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [board, setBoard] = useState<any[]>([]);
  const [selectedDepId, setSelectedDepId] = useState<string>('');
  const [departureData, setDepartureData] = useState<any>(null);
  const [allBoats, setAllBoats] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Modals / Dialog state
  const [isAddBoatOpen, setIsAddBoatOpen] = useState<boolean>(false);
  const [addBoatId, setAddBoatId] = useState<string>('');
  const [addGuideId, setAddGuideId] = useState<string>('');
  const [submittingBoat, setSubmittingBoat] = useState<boolean>(false);

  // Group Allocation Modal state
  const [allocatingGroup, setAllocatingGroup] = useState<any | null>(null);
  const [targetAssignmentId, setTargetAssignmentId] = useState<string>('');
  const [allocGuestCount, setAllocGuestCount] = useState<number>(1);
  const [submittingAlloc, setSubmittingAlloc] = useState<boolean>(false);

  // Load daily departures list
  const loadDayDepartures = async (targetDate: string, preserveSelectedId?: string) => {
    try {
      setLoadingList(true);
      const res = await apiClient.getDailyBoard(targetDate);
      const departures = res || [];
      setBoard(departures);

      if (departures.length > 0) {
        if (preserveSelectedId && departures.some((d: any) => d.id === preserveSelectedId)) {
          setSelectedDepId(preserveSelectedId);
        } else {
          setSelectedDepId(departures[0].id);
        }
      } else {
        setSelectedDepId('');
        setDepartureData(null);
      }
    } catch (err: any) {
      toast.error('Failed to load departures for the selected date.');
    } finally {
      setLoadingList(false);
    }
  };

  // Load specific departure allocation board details
  const loadDepartureDetails = async (depId: string) => {
    if (!depId) {
      setDepartureData(null);
      return;
    }
    try {
      setLoadingDetail(true);
      const [depDetail, boatsRes, staffRes] = await Promise.all([
        apiClient.getDepartureDetail(depId),
        apiClient.getBoats().catch(() => []),
        apiClient.getStaff().catch(() => []),
      ]);
      setDepartureData(depDetail);
      setAllBoats(boatsRes);
      setAllStaff(staffRes);
    } catch (err: any) {
      toast.error('Failed to load departure allocations.');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadDayDepartures(date);
  }, [date]);

  useEffect(() => {
    if (selectedDepId) {
      loadDepartureDetails(selectedDepId);
    }
  }, [selectedDepId]);

  const changeDateByDays = (delta: number) => {
    try {
      const d = new Date(date + 'T12:00:00');
      d.setDate(d.getDate() + delta);
      setDate(d.toISOString().split('T')[0]);
    } catch {
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  // Add Boat Handler
  const handleAssignBoat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addBoatId || !selectedDepId) return;

    try {
      setSubmittingBoat(true);
      await apiClient.assignBoat(selectedDepId, {
        boat_id: addBoatId,
        guide_id: addGuideId || undefined,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success('Boat successfully assigned to departure.');
      setIsAddBoatOpen(false);
      setAddBoatId('');
      setAddGuideId('');
      loadDepartureDetails(selectedDepId);
      loadDayDepartures(date, selectedDepId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign boat.');
    } finally {
      setSubmittingBoat(false);
    }
  };

  // Update Guide Handler
  const handleUpdateGuide = async (assignmentId: string, guideId: string) => {
    try {
      await apiClient.updateAssignmentGuide(assignmentId, {
        guide_id: guideId || undefined,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success('Guide updated successfully.');
      loadDepartureDetails(selectedDepId);
      loadDayDepartures(date, selectedDepId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update guide.');
    }
  };

  // Remove Boat Handler
  const handleRemoveBoat = async (assignmentId: string, boatName: string) => {
    if (!confirm(`Are you sure you want to remove ${boatName} from this departure? Any existing guest allocations on this boat will be unallocated.`)) {
      return;
    }
    try {
      await apiClient.removeBoatAssignment(assignmentId);
      toast.success(`${boatName} removed from departure.`);
      loadDepartureDetails(selectedDepId);
      loadDayDepartures(date, selectedDepId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove boat.');
    }
  };

  // Allocate Guests Handler
  const handleAllocateGuests = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingGroup || !targetAssignmentId) return;

    try {
      setSubmittingAlloc(true);
      await apiClient.allocateGuests({
        booking_id: allocatingGroup.id,
        boat_assignment_id: targetAssignmentId,
        guest_count: allocGuestCount,
        user_id: currentUser?.id,
        user_name: currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : undefined,
      });
      toast.success(`Allocated ${allocGuestCount} guest${allocGuestCount === 1 ? '' : 's'} to boat.`);
      setAllocatingGroup(null);
      loadDepartureDetails(selectedDepId);
      loadDayDepartures(date, selectedDepId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to allocate guests.');
    } finally {
      setSubmittingAlloc(false);
    }
  };

  // Remove Allocation Handler
  const handleRemoveAllocation = async (allocationId: string) => {
    try {
      await apiClient.removeAllocation(allocationId);
      toast.success('Guest allocation removed.');
      loadDepartureDetails(selectedDepId);
      loadDayDepartures(date, selectedDepId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove allocation.');
    }
  };

  // Formatted date string (e.g. "Saturday, August 29")
  const getFormattedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Selected departure metrics
  const selectedDepSummary = board.find((d) => d.id === selectedDepId);
  const currentDeparture = departureData?.departure || selectedDepSummary;
  const boatAssignments = departureData?.boat_assignments || [];
  const bookings = departureData?.bookings || [];

  const unassignedGroups = bookings.filter((b: any) => {
    const unallocated = b.unallocated_count ?? (b.guest_count - (b.allocated_guests_count || 0));
    return unallocated > 0;
  });

  const totalDepGuests = currentDeparture
    ? (currentDeparture.booked_guests ?? currentDeparture.total_guests ?? 0)
    : 0;
  const capacityLimit = currentDeparture?.capacity_limit || 40;
  const spotsAvailable = currentDeparture
    ? (currentDeparture.available_capacity ?? Math.max(0, capacityLimit - totalDepGuests))
    : 0;
  const packageName = currentDeparture
    ? (currentDeparture.package?.name_en || currentDeparture.package?.name_bs || 'Classic Neretva Rafting')
    : '';
  const startTime = currentDeparture?.start_at
    ? new Date(currentDeparture.start_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '';

  // Filter available boats not yet assigned
  const availableBoatsToAdd = allBoats.filter(
    (b) => !boatAssignments.some((ba: any) => ba.boat_id === b.id)
  );

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. BOAT PLANNER HEADER */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1"
      >
        <div>
          <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase block mb-0.5">
            Fleet Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Boat Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Assign guests, boats and guides for each departure.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-[#091613] border border-[#183027] p-1 shadow-sm">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-1.5 rounded-lg hover:bg-[#132620] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs font-bold text-slate-100 min-w-[140px] text-center select-none font-display">
              {getFormattedDate(date)}
            </span>

            <button
              onClick={() => changeDateByDays(1)}
              className="p-1.5 rounded-lg hover:bg-[#132620] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDate(new Date().toISOString().split('T')[0])}
            className="text-xs"
          >
            Today
          </Button>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* 2. DEPARTURE SELECTOR & SELECTED SUMMARY STRIP */}
      {/* ------------------------------------------------------------- */}
      {board.length > 0 && (
        <div className="space-y-3">
          {/* Departure Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {board.map((dep) => {
              const depTime = new Date(dep.start_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              const isSelected = dep.id === selectedDepId;
              const depBooked = dep.booked_guests ?? dep.total_guests ?? 0;
              const depCap = dep.capacity_limit || 40;

              return (
                <button
                  key={dep.id}
                  onClick={() => setSelectedDepId(dep.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500/80 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-[#091613] border-[#182F26] text-slate-400 hover:text-slate-200 hover:bg-[#0E201B]'
                  }`}
                >
                  <span className="font-mono font-bold text-emerald-400">{depTime}</span>
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {dep.package?.name_en || dep.package?.name_bs || 'Departure'}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-extrabold'
                        : 'bg-[#12241E] text-slate-400'
                    }`}
                  >
                    {depBooked}/{depCap}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Departure Summary Strip */}
          {selectedDepSummary && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#091512] border border-[#172C24] text-xs">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <span className="font-mono text-emerald-400 font-extrabold text-sm">
                  {startTime}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-white font-bold font-display">
                  {packageName}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">
                  <strong className="text-white font-bold">{totalDepGuests}</strong> guests
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">
                  <strong className="text-white font-bold">{boatAssignments.length}</strong> boats
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-semibold">
                  {spotsAvailable} seats available
                </span>
              </div>

              {canDispatch && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddBoatOpen(true)}
                  leftIcon={<Plus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />}
                  className="text-xs"
                >
                  Add Boat to Departure
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MAIN WORKSPACE (LEFT 35% UNALLOCATED, RIGHT 65% BOATS) */}
      {/* ------------------------------------------------------------- */}
      {loadingList ? (
        <PageLoader
          message="Loading fleet departures & boat manifests"
          subtext="Checking available rafts and scheduled runs"
          size="md"
        />
      ) : board.length === 0 ? (
        /* Empty departures state */
        <div className="rounded-2xl bg-[#0A1714] border border-[#192F26] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#11241E] border border-[#1E392E] flex items-center justify-center text-emerald-400 mx-auto">
            <Ship className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white font-display">
              No departures scheduled on {getFormattedDate(date)}
            </h3>
            <p className="text-xs text-slate-400">
              Select another date or switch to Daily Operations to generate runs from seasonal templates.
            </p>
          </div>
        </div>
      ) : loadingDetail ? (
        <PageLoader
          message="Syncing boat seat allocations"
          subtext="Assigning guides and organizing group seating"
          size="sm"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN (~35%): UNALLOCATED GUEST GROUPS */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#142620]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white font-display">
                  Unallocated Guests
                </h2>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                  unassignedGroups.length > 0
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50'
                    : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                }`}
              >
                {unassignedGroups.reduce(
                  (sum: number, b: any) =>
                    sum + (b.unallocated_count ?? (b.guest_count - (b.allocated_guests_count || 0))),
                  0
                )}{' '}
                guests
              </span>
            </div>

            {/* Unallocated Group Cards List */}
            {unassignedGroups.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#0A1714] border border-[#192F26] text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-white font-display">
                  All guests allocated
                </h3>
                <p className="text-[11px] text-slate-400">
                  Every booked guest in this departure is assigned to a boat.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unassignedGroups.map((b: any) => {
                  const unallocated =
                    b.unallocated_count ?? (b.guest_count - (b.allocated_guests_count || 0));
                  const groupName = `${b.first_name} ${b.last_name}`;
                  const bookingCode = b.booking_code;
                  const dietaryNotes = b.customer_note || b.internal_note;

                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-[#0A1714] hover:bg-[#0E201B] border border-[#192F26] hover:border-[#224436] space-y-3 transition-colors group shadow-sm shadow-black/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-white font-display group-hover:text-emerald-300 transition-colors">
                            {groupName}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                            {bookingCode}
                          </span>
                        </div>

                        {/* Prominent guest count pill */}
                        <span className="px-2.5 py-1 rounded-lg bg-[#11261F] border border-[#1E3E33] text-emerald-300 font-bold font-mono text-xs shrink-0">
                          {unallocated} {unallocated === 1 ? 'guest' : 'guests'}
                        </span>
                      </div>

                      {/* Dietary / Special note */}
                      {dietaryNotes && (
                        <div className="flex items-start gap-1.5 text-[11px] text-amber-300/90 bg-[#122119] border border-amber-900/30 rounded-lg p-2">
                          <Utensils className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                          <span className="line-clamp-2">{dietaryNotes}</span>
                        </div>
                      )}

                      {/* Allocation Trigger Button */}
                      {canDispatch && (
                        <div className="pt-1">
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            disabled={boatAssignments.length === 0}
                            onClick={() => {
                              setAllocatingGroup(b);
                              if (boatAssignments.length > 0) {
                                setTargetAssignmentId(boatAssignments[0].id);
                              }
                              setAllocGuestCount(unallocated);
                            }}
                            className="text-xs font-semibold py-1.5"
                          >
                            {boatAssignments.length === 0 ? 'Add a boat first' : 'Assign to Boat'}
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN (~65%): BOAT ASSIGNMENTS (OPERATIONAL CONTAINERS) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#142620]">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white font-display">
                  Boat Assignments ({boatAssignments.length})
                </h2>
              </div>

              {canDispatch && availableBoatsToAdd.length > 0 && (
                <button
                  onClick={() => setIsAddBoatOpen(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Boat</span>
                </button>
              )}
            </div>

            {/* Boat Assignments List */}
            {boatAssignments.length === 0 ? (
              <div className="p-8 sm:p-12 rounded-2xl bg-[#0A1714] border border-[#192F26] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#11241E] border border-[#1E392E] flex items-center justify-center text-slate-400 mx-auto">
                  <Ship className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white font-display">
                  No boats assigned to this departure
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Add rafts to this departure from your active fleet and assign licensed guides to begin placing guest groups.
                </p>
                {canDispatch && (
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAddBoatOpen(true)}
                      leftIcon={<Plus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />}
                    >
                      Add First Boat
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boatAssignments.map((ba: any) => {
                  const boatName = ba.boat?.name || 'Rafting Boat';
                  const boatModel = ba.boat?.model || 'Gumotex Pulsar 420';
                  const boatCap = ba.capacity || ba.boat?.capacity || 8;
                  const allocatedGuests = ba.total_allocated_guests ?? (ba.allocated_guests_count || 0);
                  const isFull = allocatedGuests >= boatCap;
                  const occupancyPct = Math.min(100, Math.round((allocatedGuests / boatCap) * 100));

                  const guide = ba.guide;
                  const allocations = ba.allocations || [];

                  return (
                    <motion.div
                      key={ba.id}
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl bg-[#0A1714] border border-[#192F26] p-5 space-y-4 shadow-sm shadow-black/30 flex flex-col justify-between"
                    >
                      {/* Top Bar: Boat Name & Capacity */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-white font-display tracking-tight">
                                {boatName}
                              </h3>
                              {isFull && (
                                <StatusBadge status="confirmed" label="FULL" size="sm" />
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {boatModel}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                                isFull
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

                        {/* Capacity Progress Bar */}
                        <div className="w-full bg-[#081210] h-2 rounded-full overflow-hidden border border-[#182C24]">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isFull ? 'bg-rose-500' : occupancyPct >= 75 ? 'bg-teal-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${occupancyPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Guide Section */}
                      <div className="p-2.5 rounded-xl bg-[#0D1F1A] border border-[#1A342B] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <UserCheck
                            className={`w-4 h-4 ${
                              guide ? 'text-emerald-400' : 'text-amber-400/80'
                            }`}
                          />
                          <span className="text-slate-400 font-medium">Guide:</span>
                        </div>

                        {canDispatch ? (
                          <select
                            value={ba.guide_id || ''}
                            onChange={(e) => handleUpdateGuide(ba.id, e.target.value)}
                            aria-label={`Assign guide for ${boatName}`}
                            className="bg-[#091512] border border-[#1C3A30] focus:border-emerald-500 rounded-lg px-2 py-1 text-xs text-white font-semibold focus:outline-none"
                          >
                            <option value="">-- Guide not assigned --</option>
                            {allStaff
                              .filter((s) => s.role === 'guide')
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.first_name} {s.last_name} ({s.license_level || 'IRF'})
                                </option>
                              ))}
                          </select>
                        ) : (
                          <span
                            className={
                              guide
                                ? 'text-white font-semibold'
                                : 'text-amber-400 font-medium'
                            }
                          >
                            {guide ? `${guide.first_name} ${guide.last_name}` : 'Guide not assigned'}
                          </span>
                        )}
                      </div>

                      {/* Allocated Groups List */}
                      <div className="space-y-2 pt-1 border-t border-[#142620]">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Allocated Groups ({allocations.length}):
                        </span>

                        {allocations.length === 0 ? (
                          <span className="text-xs text-slate-500 block italic py-2">
                            No guests allocated to this boat yet.
                          </span>
                        ) : (
                          <div className="space-y-1.5">
                            {allocations.map((alloc: any) => {
                              const bInfo = alloc.booking;
                              const guestName = bInfo
                                ? `${bInfo.first_name} ${bInfo.last_name}`
                                : 'Guest';

                              return (
                                <div
                                  key={alloc.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-[#0E201B] border border-[#1B362C] text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">
                                      {guestName}
                                    </span>
                                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#132A22] text-emerald-400 font-mono font-bold">
                                      {alloc.guest_count} {alloc.guest_count === 1 ? 'guest' : 'guests'}
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
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL: ADD BOAT TO DEPARTURE */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isAddBoatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1714] border border-[#192F26] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[#142620] pb-3">
                <div className="flex items-center gap-2">
                  <Ship className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-base font-display">
                    Assign Boat to Departure
                  </h3>
                </div>
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
                    Select Boat / Raft:
                  </label>
                  <select
                    value={addBoatId}
                    onChange={(e) => setAddBoatId(e.target.value)}
                    required
                    className="w-full bg-[#081210] border border-[#182F26] focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="">-- Choose active boat --</option>
                    {availableBoatsToAdd.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.capacity} seats • {b.model || 'Standard Raft'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Assign Guide (Optional):
                  </label>
                  <select
                    value={addGuideId}
                    onChange={(e) => setAddGuideId(e.target.value)}
                    className="w-full bg-[#081210] border border-[#182F26] focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="">-- Assign Later --</option>
                    {allStaff
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
                    disabled={!addBoatId || submittingBoat}
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

      {/* ------------------------------------------------------------- */}
      {/* 5. MODAL: ALLOCATE GROUP TO BOAT */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {allocatingGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1714] border border-[#192F26] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[#142620] pb-3">
                <div>
                  <h3 className="font-bold text-white text-base font-display">
                    Allocate Guests to Boat
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {allocatingGroup.first_name} {allocatingGroup.last_name} ({allocatingGroup.booking_code})
                  </p>
                </div>
                <button
                  onClick={() => setAllocatingGroup(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAllocateGuests} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Select Target Boat:
                  </label>
                  <select
                    value={targetAssignmentId}
                    onChange={(e) => setTargetAssignmentId(e.target.value)}
                    required
                    className="w-full bg-[#081210] border border-[#182F26] focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    {boatAssignments.map((ba: any) => {
                      const bCap = ba.capacity || ba.boat?.capacity || 8;
                      const freeSeats = Math.max(0, bCap - (ba.total_allocated_guests ?? (ba.allocated_guests_count || 0)));
                      const gName = ba.guide ? `${ba.guide.first_name} ${ba.guide.last_name}` : 'No Guide';

                      return (
                        <option key={ba.id} value={ba.id}>
                          {ba.boat?.name} ({freeSeats} seats free • Guide: {gName})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Guest Count for this Boat:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={allocatingGroup.unallocated_count ?? allocatingGroup.guest_count}
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
                    onClick={() => setAllocatingGroup(null)}
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
    </div>
  );
};
