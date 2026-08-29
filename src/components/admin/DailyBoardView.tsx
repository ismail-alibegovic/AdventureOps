import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiClient } from '../../api/client';
import { useTranslation } from '../../locales/i18n';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Ship,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Users,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

interface DailyBoardViewProps {
  initialDate?: string;
  onSelectDeparture: (depId: string) => void;
}

export const DailyBoardView: React.FC<DailyBoardViewProps> = ({
  initialDate,
  onSelectDeparture,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { canDispatch, isAdminOrAbove } = useAuth();

  const [date, setDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);

  const loadBoard = async (targetDate: string) => {
    try {
      setLoading(true);
      const res = await apiClient.getDailyBoard(targetDate);
      setBoard(res || []);
    } catch (err: any) {
      console.error('Failed to load daily board:', err);
      toast.error('Failed to load daily operations schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard(date);
  }, [date]);

  const changeDateByDays = (delta: number) => {
    try {
      const d = new Date(date + 'T12:00:00');
      d.setDate(d.getDate() + delta);
      setDate(d.toISOString().split('T')[0]);
    } catch {
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
    }
  };

  const handleGenerateTemplates = async () => {
    try {
      setGenerating(true);
      const res = await apiClient.generateFromTemplates(date, date);
      toast.success(
        res.created_count > 0
          ? `Generated ${res.created_count} departure${res.created_count === 1 ? '' : 's'} from seasonal templates.`
          : 'Departures already exist for this date.'
      );
      loadBoard(date);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate departures from templates.');
    } finally {
      setGenerating(false);
    }
  };

  // Formatted date string (e.g. "Saturday, August 29, 2026")
  const getFormattedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Calculate live summary aggregates across departures
  const totalDepartures = board.length;
  const totalGuests = board.reduce(
    (sum, d) => sum + (d.booked_guests ?? d.total_guests ?? 0),
    0
  );
  const totalBoats = board.reduce(
    (sum, d) => sum + (d.assigned_boats_count ?? d.boat_assignments?.length ?? 0),
    0
  );
  const totalGuides = board.reduce(
    (sum, d) => sum + (d.assigned_guides_count ?? 0),
    0
  );

  const isToday = date === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. OPERATIONS HEADER & DATE CONTROLS */}
      {/* ------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1"
      >
        <div>
          <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase block mb-0.5">
            Dispatch Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Daily Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-200">
              {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-slate-200">
              {totalBoats} {totalBoats === 1 ? 'boat' : 'boats'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-slate-200">
              {totalDepartures} {totalDepartures === 1 ? 'departure' : 'departures'}
            </span>
            {totalGuides > 0 && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">
                  {totalGuides} {totalGuides === 1 ? 'guide assigned' : 'guides assigned'}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Date Navigation Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Day Stepper */}
          <div className="flex items-center rounded-xl bg-[#091613] border border-[#183027] p-1 shadow-sm">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-1.5 rounded-lg hover:bg-[#132620] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Previous day"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs font-bold text-slate-100 min-w-[150px] text-center select-none font-display">
              {getFormattedDate(date)}
            </span>

            <button
              onClick={() => changeDateByDays(1)}
              className="p-1.5 rounded-lg hover:bg-[#132620] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Next day"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Date Picker & Today button */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Choose specific date"
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              />
              <button
                type="button"
                className="p-2 rounded-xl bg-[#091613] hover:bg-[#132620] border border-[#183027] text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer flex items-center justify-center"
                title="Select date from calendar"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {!isToday && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDate(new Date().toISOString().split('T')[0])}
                className="text-xs"
              >
                Today
              </Button>
            )}

            {isAdminOrAbove && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateTemplates}
                disabled={generating}
                loading={generating}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                className="text-xs"
              >
                {generating ? 'Generating...' : 'From Templates'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SUMMARY STRIP */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#091512] border border-[#172C24] text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#0F221D] border border-[#1C362C] text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
            {isToday ? 'Today' : getFormattedDate(date)}
          </span>
          <div className="flex items-center gap-3 sm:gap-4 text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <strong className="text-white font-bold">{totalGuests}</strong> Guests
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <strong className="text-white font-bold">{totalBoats}</strong> Boats
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <strong className="text-white font-bold">{totalDepartures}</strong> Departures
            </span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
          Auto-synchronized with Neretva fleet telemetry
        </span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. BOARD CONTENT / LIST */}
      {/* ------------------------------------------------------------- */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-[#0A1714] border border-[#192F26] p-5 space-y-3"
            >
              <div className="flex justify-between">
                <div className="h-6 w-48 bg-[#132620] rounded" />
                <div className="h-6 w-24 bg-[#132620] rounded" />
              </div>
              <div className="h-4 w-72 bg-[#0E1F1A] rounded" />
              <div className="h-2 w-full bg-[#132620] rounded" />
            </div>
          ))}
        </div>
      ) : board.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-[#0A1714] border border-[#192F26] p-8 sm:p-14 text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#11241E] border border-[#1E392E] flex items-center justify-center text-emerald-400 mx-auto">
            <Ship className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-white font-display">
              No departures scheduled on {getFormattedDate(date)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              There are no scheduled river runs for this day. You can generate departures from seasonal templates or navigate to another date.
            </p>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            {!isToday && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setDate(new Date().toISOString().split('T')[0])}
                leftIcon={<CalendarDays className="w-4 h-4" />}
              >
                Go to Today
              </Button>
            )}
            {isAdminOrAbove && (
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerateTemplates}
                disabled={generating}
                loading={generating}
                leftIcon={<Sparkles className="w-4 h-4 text-slate-950" />}
              >
                Generate Departures for {date}
              </Button>
            )}
          </div>
        </motion.div>
      ) : (
        /* Departures List */
        <div className="space-y-4">
          {board.map((dep, idx) => {
            const startTime = new Date(dep.start_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            const meetTime = dep.meeting_at
              ? new Date(dep.meeting_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })
              : undefined;

            const packageName =
              dep.package?.name_en || dep.package?.name_bs || 'Classic Neretva Rafting';
            const bookedGuests = dep.booked_guests ?? dep.total_guests ?? 0;
            const capacityLimit = dep.capacity_limit || 40;
            const spotsLeft = dep.available_capacity ?? Math.max(0, capacityLimit - bookedGuests);
            const occupancyPct =
              capacityLimit > 0
                ? Math.min(100, Math.round((bookedGuests / capacityLimit) * 100))
                : 0;

            const boatAssignments = dep.boat_assignments || [];
            const boatsCount = dep.assigned_boats_count ?? boatAssignments.length;
            const guidesCount = dep.assigned_guides_count ?? 0;
            const isFull = spotsLeft <= 0;

            // Capacity meter color thresholds
            const getCapacityColor = (pct: number) => {
              if (pct >= 100) return 'bg-rose-500';
              if (pct >= 90) return 'bg-amber-400';
              if (pct >= 75) return 'bg-teal-400';
              return 'bg-emerald-400';
            };

            // Badge status
            const renderStatusBadge = () => {
              if (dep.status === 'cancelled') {
                return <StatusBadge status="cancelled" label="Cancelled" size="sm" />;
              }
              if (dep.status === 'completed') {
                return <StatusBadge status="completed" label="Completed" size="sm" />;
              }
              if (dep.status === 'on_river') {
                return <StatusBadge status="checked_in" label="On River" size="sm" />;
              }
              if (dep.status === 'boarding') {
                return <StatusBadge status="checked_in" label="Boarding" size="sm" />;
              }
              if (isFull) {
                return <StatusBadge status="pending" label="Full" size="sm" />;
              }
              return <StatusBadge status="confirmed" label="Open" size="sm" />;
            };

            return (
              <motion.div
                key={dep.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="rounded-2xl bg-[#0A1714] hover:bg-[#0E1F1A] border border-[#192F26] hover:border-[#254639] p-5 sm:p-6 transition-all duration-150 group shadow-md shadow-black/30 space-y-5"
              >
                {/* 1. TOP ROW: TIME, PACKAGE & ACTION */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#142620]">
                  {/* Left: Prominent Time & Package Info */}
                  <div className="flex items-start gap-4">
                    {/* Visual Prominent Time Display */}
                    <div className="w-16 sm:w-20 h-14 sm:h-16 rounded-2xl bg-[#0E221C] border border-[#1F3E33] group-hover:border-emerald-500/50 flex flex-col items-center justify-center shrink-0 transition-colors shadow-inner">
                      <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight leading-none">
                        {startTime}
                      </span>
                      {meetTime && (
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-1 font-medium">
                          Meet {meetTime}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-white font-display group-hover:text-emerald-300 transition-colors">
                          {packageName}
                        </h2>
                        {renderStatusBadge()}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          <strong className="text-white font-bold">{bookedGuests}</strong> /{' '}
                          {capacityLimit} guests
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Ship className="w-3.5 h-3.5 text-sky-400" />
                          <strong className="text-white font-bold">{boatsCount}</strong>{' '}
                          {boatsCount === 1 ? 'boat' : 'boats'}
                        </span>
                        {guidesCount > 0 ? (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                              <strong className="text-white font-bold">{guidesCount}</strong>{' '}
                              {guidesCount === 1 ? 'guide' : 'guides'}
                            </span>
                          </>
                        ) : (
                          bookedGuests > 0 && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-amber-400 font-semibold text-[11px] flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                No guides assigned
                              </span>
                            </>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Available Seats & Action Trigger */}
                  <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span
                        className={`text-xs font-bold block ${
                          isFull ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isFull ? 'Sold out' : `${spotsLeft} seats available`}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {dep.bookings_count ?? dep.bookings?.length ?? 0}{' '}
                        {(dep.bookings_count ?? dep.bookings?.length ?? 0) === 1
                          ? 'reservation'
                          : 'reservations'}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSelectDeparture(dep.id)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5 text-slate-950" />}
                      className="text-xs font-bold"
                    >
                      View Departure
                    </Button>
                  </div>
                </div>

                {/* 2. CAPACITY BAR */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span className="font-medium">
                      Fleet Occupancy: <strong className="text-slate-200">{occupancyPct}%</strong>
                    </span>
                    <span className={isFull ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                      {isFull ? 'Full capacity reached' : `${spotsLeft} seats remaining`}
                    </span>
                  </div>
                  <div className="w-full bg-[#081210] h-2 rounded-full overflow-hidden border border-[#182C24]">
                    <div
                      className={`h-full transition-all duration-300 ${getCapacityColor(occupancyPct)}`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* 3. ASSIGNED BOATS CONTAINER PREVIEW */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned Boats & Skippers ({boatAssignments.length}):
                    </span>
                    {boatAssignments.length > 0 && (
                      <button
                        onClick={() => onSelectDeparture(dep.id)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
                      >
                        Manage allocations
                      </button>
                    )}
                  </div>

                  {boatAssignments.length === 0 ? (
                    <div className="p-3 rounded-xl bg-[#0D1E18] border border-[#193328] text-xs text-amber-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>No boats or skippers are assigned to this departure yet.</span>
                      </div>
                      <button
                        onClick={() => onSelectDeparture(dep.id)}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 shrink-0 cursor-pointer"
                      >
                        Assign Boats →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {boatAssignments.map((ba: any) => {
                        const boatName = ba.boat?.name || 'Rafting Boat';
                        const boatCap = ba.boat?.capacity || 8;
                        const allocCount = ba.allocated_guests_count || 0;
                        const isBoatFull = allocCount >= boatCap;
                        const guideName = ba.guide
                          ? `${ba.guide.first_name} ${ba.guide.last_name}`
                          : null;

                        return (
                          <div
                            key={ba.id}
                            className="p-3 rounded-xl bg-[#0D1E18] border border-[#1B362C] space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs font-display">
                                {boatName}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                  isBoatFull
                                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                                    : 'bg-[#122821] text-emerald-300 border border-[#1F3E33]'
                                }`}
                              >
                                {allocCount} / {boatCap} guests
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Guide:</span>
                              <span className={guideName ? 'text-slate-200 font-semibold' : 'text-amber-400/90 italic'}>
                                {guideName || 'Guide not assigned'}
                              </span>
                            </div>
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
  );
};
