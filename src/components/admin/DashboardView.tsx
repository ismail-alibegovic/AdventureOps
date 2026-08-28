import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useTranslation } from '../../locales/i18n';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  AlertTriangle,
  ChevronRight,
  PlusCircle,
  Ship,
  CheckCircle2,
  Phone,
  MessageCircle,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardViewProps {
  onSelectDeparture: (depId: string) => void;
  onOpenBookings: () => void;
  onOpenDailyBoard: () => void;
  onOpenManualBooking: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectDeparture,
  onOpenBookings,
  onOpenDailyBoard,
  onOpenManualBooking,
}) => {
  const { t } = useTranslation();
  const { currentUser, role } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAdminDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 flex justify-center text-emerald-400">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  const { report_metrics, today_departures, today_guests_count, pending_confirmations } = data;

  return (
    <div className="space-y-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Današnji Pregled • {data.today_date}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Dobrodošli, {currentUser?.first_name || 'Kolega'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Uloga: <span className="text-emerald-400 font-bold uppercase">{role}</span> • Stanje na rijeci Neretvi je optimalno.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDailyBoard}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Dispečerski Pregled
          </button>
          <button
            onClick={onOpenManualBooking}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Rezervacija</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Guests */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Gostiju Danas</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{today_guests_count}</div>
          <div className="text-[11px] text-slate-400">
            Na {today_departures.length} zakazanih polazaka
          </div>
        </div>

        {/* Pending confirmations */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Zahtjevi na Čekanju</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{pending_confirmations}</div>
          <button
            onClick={onOpenBookings}
            className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Pregledaj nove zahtjeve</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Total Collected Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Naplaćeni Prihodi</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {report_metrics.total_revenue_collected} BAM
          </div>
          <div className="text-[11px] text-slate-400">
            Očekivano: {report_metrics.total_revenue_booked} BAM
          </div>
        </div>

        {/* Confirmed Bookings Total */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Ukupno Rezervacija</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {report_metrics.total_bookings_count}
          </div>
          <div className="text-[11px] text-slate-400">
            Prosjek po grupi: {report_metrics.average_group_size} osoba
          </div>
        </div>
      </div>

      {/* Today's Departures Operational Manifest */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Ship className="w-5 h-5 text-emerald-400" />
            <span>Polasci za Danas ({today_departures.length})</span>
          </h3>
          <button
            onClick={onOpenDailyBoard}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Otvori dispečersku tablu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {today_departures.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
            Nema zakazanih polazaka za danas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {today_departures.map((dep: any) => {
              const startTime = new Date(dep.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isFull = dep.spots_left <= 0;

              return (
                <div
                  key={dep.id}
                  onClick={() => onSelectDeparture(dep.id)}
                  className="cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-600/70 transition-all space-y-4 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-white">{startTime}</span>
                      <span className="text-xs text-slate-400 block font-medium">
                        {dep.package?.name_bs || 'Rafting Neretva'}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        isFull
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {dep.spots_left} slobodno
                    </span>
                  </div>

                  {/* Allocation counts */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Gosti:</span>
                      <strong className="text-white text-sm">{dep.total_guests} prijavljeno</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Čamci / Skiperi:</span>
                      <strong className="text-emerald-400 text-sm">
                        {dep.boat_assignments.length} čamaca
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span>Stanje: <strong className="text-white capitalize">{dep.status}</strong></span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span>Detalji</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
