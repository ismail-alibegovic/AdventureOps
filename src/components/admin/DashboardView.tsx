import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiClient } from '../../api/client';
import { useTranslation } from '../../locales/i18n';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  ChevronRight,
  Plus,
  Ship,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  ClipboardList,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';

interface DashboardViewProps {
  onSelectDeparture: (depId: string) => void;
  onOpenBookings: () => void;
  onOpenDailyBoard: () => void;
  onOpenManualBooking: () => void;
  onOpenBoatPlanner?: () => void;
}

interface AttentionItem {
  id: string;
  type: 'pending' | 'capacity' | 'allocation' | 'payment';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectDeparture,
  onOpenBookings,
  onOpenDailyBoard,
  onOpenManualBooking,
  onOpenBoatPlanner,
}) => {
  const { t } = useTranslation();
  const { currentUser, role } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getAdminDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError('We could not load today’s operational data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Time-aware greeting
  const getGreeting = (firstName?: string) => {
    const hour = new Date().getHours();
    let prefix = 'Good morning';
    if (hour >= 12 && hour < 17) {
      prefix = 'Good afternoon';
    } else if (hour >= 17) {
      prefix = 'Good evening';
    }
    return firstName ? `${prefix}, ${firstName}` : `${prefix}`;
  };

  // Formatted date string
  const getFormattedDate = (dateStr?: string) => {
    try {
      const d = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  // -------------------------------------------------------------
  // LOADING SKELETON STATE
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard operations">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
          <div className="space-y-2">
            <div className="h-3.5 w-36 bg-[#13211D] rounded" />
            <div className="h-7 w-64 bg-[#182C24] rounded-lg" />
            <div className="h-4 w-72 bg-[#13211D] rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-36 bg-[#13211D] rounded-xl" />
            <div className="h-9 w-32 bg-[#182C24] rounded-xl" />
          </div>
        </div>

        {/* Overview Strip Skeleton */}
        <div className="h-11 w-full bg-[#0A1814] border border-[#162922] rounded-xl" />

        {/* 4 KPI Cards Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#0B1714] border border-[#162922] p-4.5 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-[#142620] rounded" />
                <div className="h-7 w-7 bg-[#142620] rounded-lg" />
              </div>
              <div className="h-7 w-20 bg-[#1A3129] rounded" />
              <div className="h-3 w-28 bg-[#142620] rounded" />
            </div>
          ))}
        </div>

        {/* Main Content Layout Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Departures Skeleton */}
          <div className="lg:col-span-8 space-y-3.5">
            <div className="h-6 w-44 bg-[#142620] rounded" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[#0B1714] border border-[#162922] rounded-2xl p-4" />
            ))}
          </div>

          {/* Sidebar Skeletons */}
          <div className="lg:col-span-4 space-y-4">
            <div className="h-48 bg-[#0B1714] border border-[#162922] rounded-2xl p-4" />
            <div className="h-44 bg-[#0B1714] border border-[#162922] rounded-2xl p-4" />
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ERROR STATE
  // -------------------------------------------------------------
  if (error || !data) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-950/70 border border-rose-800/50 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white font-display">We couldn't load today's operations.</h2>
          <p className="text-xs text-slate-400 mt-1">
            There was a problem retrieving current bookings and departure manifests from the server.
          </p>
        </div>
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={loadData} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DATA PARSING & PREPARATION
  // -------------------------------------------------------------
  const {
    today_date,
    today_departures = [],
    today_guests_count = 0,
    today_bookings_count = 0,
    pending_confirmations = 0,
    report_metrics = {},
  } = data;

  // Financial calculations
  const collectedRev = Number(report_metrics.collected_revenue ?? report_metrics.total_revenue_collected ?? 0);
  const expectedRev = Number(
    report_metrics.expected_revenue ??
      report_metrics.booked_gross_revenue ??
      report_metrics.total_revenue_booked ??
      collectedRev
  );
  const revenueCollectedPct = expectedRev > 0 ? Math.min(100, Math.round((collectedRev / expectedRev) * 100)) : (collectedRev > 0 ? 100 : 0);

  // Total bookings metric
  const totalBookings = Number(report_metrics.total_bookings ?? report_metrics.total_bookings_count ?? today_bookings_count);
  const avgGroupSize = Number(report_metrics.average_group_size ?? 0);

  // Departures aggregation
  const departuresCount = today_departures.length;
  const totalSeatsToday = today_departures.reduce((acc: number, d: any) => acc + (d.capacity_limit || 40), 0);
  const occupancyPctToday = totalSeatsToday > 0 ? Math.min(100, Math.round((today_guests_count / totalSeatsToday) * 100)) : 0;

  // -------------------------------------------------------------
  // NEEDS ATTENTION ITEMS (Data-Driven signals only)
  // -------------------------------------------------------------
  const attentionItems: AttentionItem[] = [];

  // 1. Pending Booking Requests
  if (pending_confirmations > 0) {
    attentionItems.push({
      id: 'pending-confirmations',
      type: 'pending',
      severity: 'warning',
      title: `${pending_confirmations} booking ${
        pending_confirmations === 1 ? 'request is' : 'requests are'
      } waiting for review.`,
      actionLabel: 'Review Bookings',
      onAction: onOpenBookings,
    });
  }

  // 2. Departures inspection for high occupancy / full / allocation issues
  today_departures.forEach((dep: any) => {
    const startTime = new Date(dep.start_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const booked = dep.booked_guests ?? dep.total_guests ?? 0;
    const cap = dep.capacity_limit || 40;
    const spotsLeft = dep.available_capacity ?? Math.max(0, cap - booked);
    const boatsCount = dep.assigned_boats_count ?? dep.boat_assignments?.length ?? 0;

    // Full departure
    if (spotsLeft === 0 && booked > 0) {
      attentionItems.push({
        id: `dep-full-${dep.id}`,
        type: 'capacity',
        severity: 'info',
        title: `${startTime} departure is fully booked (${booked}/${cap} capacity).`,
        actionLabel: 'Manifest',
        onAction: () => onSelectDeparture(dep.id),
      });
    }
    // Almost full (<= 4 seats remaining)
    else if (spotsLeft > 0 && spotsLeft <= 4 && booked >= 6) {
      attentionItems.push({
        id: `dep-tight-${dep.id}`,
        type: 'capacity',
        severity: 'warning',
        title: `${startTime} departure has only ${spotsLeft} ${spotsLeft === 1 ? 'seat' : 'seats'} remaining.`,
        actionLabel: 'Details',
        onAction: () => onSelectDeparture(dep.id),
      });
    }

    // Booked guests without assigned boats
    if (booked > 0 && boatsCount === 0) {
      attentionItems.push({
        id: `dep-no-boats-${dep.id}`,
        type: 'allocation',
        severity: 'critical',
        title: `${startTime} departure has ${booked} guests with 0 boats assigned.`,
        actionLabel: 'Assign Boats',
        onAction: () => onSelectDeparture(dep.id),
      });
    }

    // Pending payment balances on departure
    if (dep.unpaid_guests && dep.unpaid_guests > 0) {
      attentionItems.push({
        id: `dep-unpaid-${dep.id}`,
        type: 'payment',
        severity: 'info',
        title: `${startTime} departure has ${dep.unpaid_guests} guests with payment due on arrival.`,
        actionLabel: 'View Manifest',
        onAction: () => onSelectDeparture(dep.id),
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------- */}
      {/* 1. PAGE HEADER (Clean premium header in content canvas) */}
      {/* ----------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1"
      >
        <div>
          <span className="text-xs font-semibold text-emerald-400 tracking-wide block mb-0.5">
            {getFormattedDate(today_date)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            {getGreeting(currentUser?.first_name)}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {departuresCount === 0 ? (
              <span>No departures are scheduled for today.</span>
            ) : (
              <span>
                <strong className="text-slate-200 font-semibold">{departuresCount}</strong>{' '}
                {departuresCount === 1 ? 'departure' : 'departures'} and{' '}
                <strong className="text-slate-200 font-semibold">{today_guests_count}</strong>{' '}
                {today_guests_count === 1 ? 'guest are' : 'guests are'} scheduled today.
                {pending_confirmations > 0 && (
                  <span className="text-amber-400 font-medium ml-1.5">
                    • {pending_confirmations} pending {pending_confirmations === 1 ? 'request' : 'requests'}
                  </span>
                )}
              </span>
            )}
          </p>
        </div>

        {/* Aligned Compact Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={onOpenDailyBoard}
            leftIcon={<CalendarDays className="w-4 h-4 text-emerald-400" />}
            className="text-xs"
          >
            Open Daily Board
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onOpenManualBooking}
            leftIcon={<Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />}
            className="text-xs"
          >
            New Booking
          </Button>
        </div>
      </motion.div>

      {/* ----------------------------------------------------------- */}
      {/* 2. TODAY OPERATIONAL STRIP (Fact-based summary overview) */}
      {/* ----------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.04 }}
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#091512] border border-[#172C24] text-xs"
      >
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#0F221D] border border-[#1C362C] text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
            Today
          </span>
          <div className="flex items-center gap-3 sm:gap-4 text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <strong className="text-white font-bold">{today_guests_count}</strong> Guests
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <strong className="text-white font-bold">{departuresCount}</strong> Departures
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${pending_confirmations > 0 ? 'bg-amber-400' : 'bg-slate-500'}`} />
              <strong className={pending_confirmations > 0 ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                {pending_confirmations}
              </strong>{' '}
              Pending Requests
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="hidden md:inline">
            Fleet Capacity: <strong className="text-slate-200">{occupancyPctToday}%</strong> booked today
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 font-semibold uppercase text-[10px] tracking-wider">
            Active
          </span>
        </div>
      </motion.div>

      {/* ----------------------------------------------------------- */}
      {/* 3. FOUR PRIMARY KPI CARDS */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Guests Today */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.06 }}
          className="rounded-2xl bg-[#0A1714] border border-[#192F26] p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-[#223E33] transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Guests Today
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1 font-display tracking-tight">
                {today_guests_count}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#0F231D] border border-[#1E372D] flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#142620] flex items-center justify-between text-xs text-slate-400">
            <span>
              Across <strong className="text-slate-300 font-semibold">{departuresCount}</strong> {departuresCount === 1 ? 'departure' : 'departures'}
            </span>
            <span className="text-emerald-400 text-[11px] font-medium">Scheduled</span>
          </div>
        </motion.div>

        {/* KPI 2: Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.09 }}
          onClick={onOpenBookings}
          className={`rounded-2xl bg-[#0A1714] border p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all cursor-pointer ${
            pending_confirmations > 0
              ? 'border-amber-900/50 hover:border-amber-700/70 shadow-sm shadow-amber-950/20'
              : 'border-[#192F26] hover:border-[#223E33]'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pending Requests
              </p>
              <p className={`text-2xl sm:text-3xl font-black mt-1 font-display tracking-tight ${
                pending_confirmations > 0 ? 'text-amber-300' : 'text-slate-200'
              }`}>
                {pending_confirmations}
              </p>
            </div>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
              pending_confirmations > 0
                ? 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                : 'bg-[#0F231D] border-[#1E372D] text-slate-400'
            }`}>
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#142620] flex items-center justify-between text-xs">
            <span className={pending_confirmations > 0 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
              {pending_confirmations > 0 ? 'Require review' : 'All requests reviewed'}
            </span>
            <span className="text-slate-400 group-hover:text-emerald-400 text-xs flex items-center gap-0.5">
              <span>View</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </motion.div>

        {/* KPI 3: Collected Revenue with subtle progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.12 }}
          className="rounded-2xl bg-[#0A1714] border border-[#192F26] p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-[#223E33] transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Collected Revenue
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1 font-display tracking-tight">
                {collectedRev.toLocaleString()} <span className="text-sm font-bold text-emerald-400 font-sans">BAM</span>
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#0F231D] border border-[#1E372D] flex items-center justify-center text-emerald-400 shrink-0">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#142620] space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {expectedRev.toLocaleString()} BAM booked
              </span>
              <span className="font-bold text-emerald-400">
                {revenueCollectedPct}%
              </span>
            </div>
            {/* Revenue progress bar */}
            <div className="w-full h-1.5 bg-[#142620] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${revenueCollectedPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full bg-emerald-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* KPI 4: Total Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="rounded-2xl bg-[#0A1714] border border-[#192F26] p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-[#223E33] transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Bookings
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1 font-display tracking-tight">
                {totalBookings}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#0E2028] border border-[#1A343F] flex items-center justify-center text-sky-400 shrink-0">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#142620] flex items-center justify-between text-xs text-slate-400">
            <span>
              Average group: <strong className="text-slate-300 font-semibold">{avgGroupSize}</strong> guests
            </span>
            <span className="text-sky-400 text-[11px] font-medium">All season</span>
          </div>
        </motion.div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 4. MAIN CONTENT TWO-COLUMN GRID */}
      {/* ----------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (~68% on Desktop): Today's Departures */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
                <Ship className="w-4.5 h-4.5 text-emerald-400" />
                <span>Today's Departures</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#12241E] border border-[#1E3A30] text-emerald-400 text-xs font-bold font-mono">
                {departuresCount}
              </span>
            </div>

            <button
              onClick={onOpenDailyBoard}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors focus:outline-none focus-visible:underline"
            >
              <span>Daily Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Departures List or Empty State */}
          {departuresCount === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl bg-[#0A1714] border border-[#192F26] p-8 sm:p-12 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#11241E] border border-[#1E392E] flex items-center justify-center text-slate-400 mx-auto">
                <Ship className="w-6 h-6 text-emerald-400/80" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-base font-bold text-white font-display">No departures today</h3>
                <p className="text-xs text-slate-400">
                  You're clear for today. You can review the upcoming season schedule or create a new booking reservation.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Button variant="secondary" size="sm" onClick={onOpenDailyBoard}>
                  Open Daily Board
                </Button>
                <Button variant="primary" size="sm" onClick={onOpenManualBooking} leftIcon={<Plus className="w-3.5 h-3.5 text-slate-950" />}>
                  New Booking
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {today_departures.map((dep: any, idx: number) => {
                const startTime = new Date(dep.start_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });
                const meetingTime = dep.meeting_at
                  ? new Date(dep.meeting_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })
                  : undefined;

                const packageName =
                  dep.package?.name_en || dep.package?.name_bs || dep.package?.title_en || 'Classic Neretva Rafting';
                const bookedGuests = dep.booked_guests ?? dep.total_guests ?? 0;
                const capacityLimit = dep.capacity_limit || 40;
                const spotsLeft = dep.available_capacity ?? Math.max(0, capacityLimit - bookedGuests);
                const occupancyPct = capacityLimit > 0 ? Math.min(100, Math.round((bookedGuests / capacityLimit) * 100)) : 0;
                const boatsCount = dep.assigned_boats_count ?? dep.boat_assignments?.length ?? 0;
                const guidesCount = dep.assigned_guides_count ?? 0;
                const isFull = spotsLeft <= 0;

                // Capacity bar color thresholds
                const getCapacityColor = (pct: number) => {
                  if (pct >= 100) return 'bg-rose-500';
                  if (pct >= 90) return 'bg-amber-400';
                  if (pct >= 75) return 'bg-teal-400';
                  return 'bg-emerald-400';
                };

                // Badge status configuration
                const getStatusBadge = () => {
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: idx * 0.04 }}
                    onClick={() => onSelectDeparture(dep.id)}
                    className="rounded-2xl bg-[#0A1714] hover:bg-[#0F201C] border border-[#192F26] hover:border-emerald-500/40 p-4 sm:p-5 transition-all duration-150 cursor-pointer group shadow-sm shadow-black/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                      {/* Left: Time & Experience */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-14 sm:w-16 h-12 sm:h-14 rounded-xl bg-[#0E201B] border border-[#1D372D] group-hover:border-emerald-500/40 flex flex-col items-center justify-center shrink-0 transition-colors">
                          <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight leading-none">
                            {startTime}
                          </span>
                          {meetingTime && (
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                              Meet {meetingTime}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                              {packageName}
                            </h3>
                            {getStatusBadge()}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                            <span className="text-slate-300">
                              <strong className="text-white font-bold">{bookedGuests}</strong> / {capacityLimit} guests
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-300">
                              <strong className="text-emerald-400 font-bold">{boatsCount}</strong> {boatsCount === 1 ? 'boat' : 'boats'}
                            </span>
                            {guidesCount > 0 && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span>{guidesCount} {guidesCount === 1 ? 'guide' : 'guides'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Capacity visualization & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#142620]">
                        {/* Capacity meter */}
                        <div className="w-32 sm:w-36 space-y-1 text-right">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={isFull ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                              {isFull ? 'Sold out' : `${spotsLeft} seats available`}
                            </span>
                            <span className="font-mono text-slate-400 font-semibold">{occupancyPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#142620] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${getCapacityColor(occupancyPct)}`}
                              style={{ width: `${occupancyPct}%` }}
                            />
                          </div>
                        </div>

                        {/* View Arrow CTA */}
                        <div className="w-8 h-8 rounded-xl bg-[#0F221D] border border-[#1B342B] group-hover:bg-emerald-500 group-hover:border-emerald-400 text-slate-400 group-hover:text-slate-950 flex items-center justify-center transition-all shrink-0">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (~32% on Desktop): Needs Attention & Quick Actions */}
        <div className="lg:col-span-4 space-y-5">
          {/* Panel 1: Needs Attention */}
          <div className="rounded-2xl bg-[#0A1714] border border-[#192F26] p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-[#142620]">
              <h2 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 ${attentionItems.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span>Needs Attention</span>
              </h2>
              {attentionItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/40 text-amber-300 text-[10px] font-bold font-mono">
                  {attentionItems.length}
                </span>
              )}
            </div>

            {attentionItems.length === 0 ? (
              <div className="py-4 text-center space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <p className="text-xs font-bold text-white">Everything looks good</p>
                <p className="text-[11px] text-slate-400">No urgent operational issues today.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {attentionItems.map((item) => {
                  const severityDot = {
                    critical: 'bg-rose-400',
                    warning: 'bg-amber-400',
                    info: 'bg-sky-400',
                  }[item.severity];

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#0D1F1A] border border-[#193229] space-y-1.5"
                    >
                      <div className="flex items-start gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${severityDot}`} />
                        <p className="text-xs text-slate-200 leading-snug flex-1">
                          {item.title}
                        </p>
                      </div>
                      {item.actionLabel && item.onAction && (
                        <div className="pl-3.5">
                          <button
                            onClick={item.onAction}
                            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{item.actionLabel}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel 2: Quick Actions */}
          <div className="rounded-2xl bg-[#0A1714] border border-[#192F26] p-4 sm:p-5 space-y-3.5">
            <h2 className="text-sm font-bold text-white font-display flex items-center gap-2 pb-3 border-b border-[#142620]">
              <ClipboardList className="w-4 h-4 text-emerald-400" />
              <span>Quick Actions</span>
            </h2>

            <div className="space-y-2">
              {/* Primary Action */}
              <button
                onClick={onOpenManualBooking}
                className="w-full h-10 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-between shadow-md shadow-emerald-950/60 active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Booking</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Secondary Action 1: Daily Board */}
              <button
                onClick={onOpenDailyBoard}
                className="w-full h-9 px-3.5 rounded-xl bg-[#0D1F1A] hover:bg-[#132B24] border border-[#1B362C] hover:border-[#285041] text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Daily Board</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Secondary Action 2: Boat Planner */}
              <button
                onClick={() => {
                  if (onOpenBoatPlanner) {
                    onOpenBoatPlanner();
                  } else {
                    onOpenDailyBoard();
                  }
                }}
                className="w-full h-9 px-3.5 rounded-xl bg-[#0D1F1A] hover:bg-[#132B24] border border-[#1B362C] hover:border-[#285041] text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Ship className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Boat Planner</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Secondary Action 3: Review Bookings */}
              <button
                onClick={onOpenBookings}
                className="w-full h-9 px-3.5 rounded-xl bg-[#0D1F1A] hover:bg-[#132B24] border border-[#1B362C] hover:border-[#285041] text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-3.5 h-3.5 text-sky-400" />
                  <span>Review Bookings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
