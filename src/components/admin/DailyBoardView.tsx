import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useTranslation } from '../../locales/i18n';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Users,
  Ship,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';

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
      setBoard(res);
    } catch (err) {
      toast.error('Failed to load daily board');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoard(date);
  }, [date]);

  const changeDateByDays = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split('T')[0]);
  };

  const handleGenerateTemplates = async () => {
    try {
      setGenerating(true);
      const res = await apiClient.generateFromTemplates(date, date);
      toast.success(`Generisano ${res.created_count} polazaka iz šablona za datum ${date}`);
      loadBoard(date);
    } catch (err: any) {
      toast.error(err.message || 'Neuspjelo generisanje');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Dispečerski Centar
          </span>
          <h2 className="text-2xl font-bold text-white">Dnevni Raspored & Polasci</h2>
        </div>

        {/* Date Selector with quick previous / next */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
            title="Prethodni dan"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-semibold focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={() => changeDateByDays(1)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
            title="Sljedeći dan"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition-colors cursor-pointer"
          >
            Danas
          </button>

          {isAdminOrAbove && (
            <button
              onClick={handleGenerateTemplates}
              disabled={generating}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl transition-all cursor-pointer disabled:opacity-40"
              title="Generiši polaske iz predefinisanih šablona za ovaj dan"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{generating ? 'Generišem...' : 'Iz Šablona'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Board Content */}
      {loading ? (
        <div className="py-20 flex justify-center text-emerald-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
        </div>
      ) : board.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <Ship className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Nema polazaka za datum: {date}</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Za ovaj datum još nisu kreirani polasci. Možete ih generisati iz sezonskih šablona ili unijeti ručnu rezervaciju.
          </p>
          {isAdminOrAbove && (
            <button
              onClick={handleGenerateTemplates}
              className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
            >
              Generiši Polaske za {date}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {board.map((dep) => {
            const startTime = new Date(dep.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const meetTime = dep.meeting_at ? new Date(dep.meeting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            const occupancyPct = Math.round(((dep.capacity_limit - dep.spots_left) / dep.capacity_limit) * 100);

            return (
              <div
                key={dep.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 hover:border-slate-700 transition-all shadow-sm"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl">
                      <span className="text-2xl font-extrabold text-emerald-400 block">{startTime}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Start</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {dep.package?.name_bs || 'Rafting Neretva'}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>Sastanak na bazi: <strong className="text-slate-200">{meetTime}</strong></span>
                        <span>•</span>
                        <span>Stanje: <strong className="text-emerald-400 capitalize">{dep.status}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-white">
                        {dep.total_guests} / {dep.capacity_limit} gostiju
                      </span>
                      <div className="text-[11px] text-slate-400">
                        {dep.spots_left > 0 ? `${dep.spots_left} slobodnih mjesta` : 'Popunjeno'}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectDeparture(dep.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>Upravljaj Čamcima</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Popunjenost kapaciteta ({occupancyPct}%)</span>
                    <span>{dep.bookings.length} rezervacija</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all ${
                        occupancyPct >= 90 ? 'bg-rose-500' : occupancyPct >= 60 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Assigned Boats Row */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Raspoređeni Čamci & Skiperi ({dep.boat_assignments.length}):
                  </span>

                  {dep.boat_assignments.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Za ovaj polazak još nisu dodijeljeni čamci i skiperi. Kliknite "Upravljaj Čamcima" za raspored.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dep.boat_assignments.map((ba: any) => (
                        <div
                          key={ba.id}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">
                              {ba.boat ? ba.boat.name : 'Čamac'}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-semibold">
                              {ba.allocated_guests_count} / {ba.boat?.capacity || 8} gostiju
                            </span>
                          </div>
                          <div className="text-slate-400">
                            Skiper: <strong className="text-white">{ba.guide ? `${ba.guide.first_name} ${ba.guide.last_name}` : 'Nije dodijeljen'}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
