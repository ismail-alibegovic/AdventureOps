import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useTranslation } from '../../locales/i18n';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Ship,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface BoatPlannerViewProps {
  onSelectDeparture: (depId: string) => void;
}

export const BoatPlannerView: React.FC<BoatPlannerViewProps> = ({ onSelectDeparture }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { currentUser, canDispatch } = useAuth();

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadPlanner = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getDailyBoard(date);
      setBoard(res);
    } catch (err) {
      toast.error('Failed to load boat planner data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanner();
  }, [date]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Planer Flote i Skipera
          </span>
          <h2 className="text-2xl font-bold text-white">Raspored Čamaca & Podjela Grupa</h2>
          <p className="text-xs text-slate-400 mt-1">
            Podijelite velike grupe (npr. 14 osoba na 2 čamca) i dodijelite licencirane IRF skipere.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-semibold focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => setDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition-colors cursor-pointer"
          >
            Danas
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-emerald-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
        </div>
      ) : board.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">
          Nema otvorenih polazaka za {date}.
        </div>
      ) : (
        <div className="space-y-8">
          {board.map((dep) => {
            const startTime = new Date(dep.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const totalAssignedGuests = dep.boat_assignments.reduce(
              (sum: number, ba: any) => sum + (ba.allocated_guests_count || 0),
              0
            );
            const unallocatedTotal = dep.total_guests - totalAssignedGuests;

            return (
              <div
                key={dep.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm"
              >
                {/* Departure header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-extrabold text-emerald-400 text-lg">
                      {startTime}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {dep.package?.name_bs || 'Rafting Neretva'}
                      </h3>
                      <span className="text-xs text-slate-400">
                        Ukupno gostiju: <strong className="text-white">{dep.total_guests}</strong> • Nealocirano:{' '}
                        <strong className={unallocatedTotal > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                          {unallocatedTotal} gostiju
                        </strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectDeparture(dep.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Uredi Alokacije</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Fleet Cards for this departure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dep.boat_assignments.map((ba: any) => {
                    const allocatedCount = ba.allocated_guests_count || 0;
                    const boatCap = ba.boat?.capacity || 8;
                    const fillPct = Math.round((allocatedCount / boatCap) * 100);

                    return (
                      <div
                        key={ba.id}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-white text-base block">{ba.boat?.name}</span>
                            <span className="text-xs text-slate-400">
                              Skiper: <strong className="text-emerald-400">{ba.guide ? `${ba.guide.first_name} ${ba.guide.last_name}` : 'Nije dodijeljen'}</strong>
                            </span>
                          </div>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              allocatedCount > boatCap
                                ? 'bg-rose-950 text-rose-300 border-rose-800'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            }`}
                          >
                            {allocatedCount} / {boatCap} os.
                          </span>
                        </div>

                        {/* Occupancy bar */}
                        <div className="space-y-1">
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                            <div
                              className={`h-full ${fillPct > 100 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                              style={{ width: `${Math.min(100, fillPct)}%` }}
                            />
                          </div>
                        </div>

                        {/* Group list inside boat */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-850 text-xs">
                          {ba.allocations.length === 0 ? (
                            <span className="text-slate-600 block italic">Nema alociranih gostiju</span>
                          ) : (
                            ba.allocations.map((a: any) => (
                              <div
                                key={a.id}
                                className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
                              >
                                <span className="font-semibold text-white">
                                  {a.booking?.first_name} {a.booking?.last_name}
                                </span>
                                <span className="text-emerald-400 font-bold">{a.guest_count} os.</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
