import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { AuditLog } from '../../types';
import { History, Shield, Clock, UserCheck, Search, Filter } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [entityFilter, setEntityFilter] = useState<string>('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAuditLogs(entityFilter || undefined);
      setLogs(res);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Sigurnost & Nadzor Sistema
          </span>
          <h2 className="text-2xl font-bold text-white">Dnevnik Aktivnosti (Audit Trail)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Nepromjenjiv zapis svih operacija, plaćanja, dispečerskih alokacija i promjena stanja.
          </p>
        </div>

        <div className="max-w-xs w-full">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">-- Svi Entiteti --</option>
            <option value="booking">Rezervacije (booking)</option>
            <option value="boat_assignment">Čamci & Skiperi (boat_assignment)</option>
            <option value="guest_allocation">Alokacije gostiju (guest_allocation)</option>
            <option value="payment">Uplate & Plaćanja (payment)</option>
            <option value="departure">Polasci (departure)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-emerald-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
          Nema zabilježenih logova.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-4">Vrijeme</th>
                  <th className="px-5 py-4">Korisnik</th>
                  <th className="px-5 py-4">Akcija</th>
                  <th className="px-5 py-4">Entitet & ID</th>
                  <th className="px-5 py-4">Detalji</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850 transition-colors">
                    <td className="px-5 py-4 text-slate-400 font-sans">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="px-5 py-4 font-sans font-semibold text-white">
                      {log.user_name || 'System / Guest'}
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-300 font-bold border border-emerald-900/50">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      <span className="text-slate-500 uppercase mr-1">{log.entity_type}:</span>
                      <span>{log.entity_id}</span>
                    </td>

                    <td className="px-5 py-4 text-slate-400 font-sans max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
