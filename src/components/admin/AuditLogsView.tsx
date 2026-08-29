import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { AuditLog } from '../../types';
import {
  Shield,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  FileCode,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const AuditLogsView: React.FC = () => {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAuditLogs(entityFilter || undefined);
      setLogs(res);
    } catch {
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter]);

  // Format raw action identifiers into human-friendly English labels
  const formatActionLabel = (action: string): { label: string; badgeColor: string } => {
    const act = action.toUpperCase();

    if (act.includes('CONFIRMED')) {
      return { label: 'Booking confirmed', badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' };
    }
    if (act.includes('CHECKED_IN')) {
      return { label: 'Guests checked in', badgeColor: 'bg-sky-950/60 text-sky-300 border-sky-800/40' };
    }
    if (act.includes('COMPLETED')) {
      return { label: 'Trip completed', badgeColor: 'bg-slate-900 text-slate-300 border-slate-700' };
    }
    if (act.includes('CANCELLED') || act.includes('REJECTED')) {
      return { label: act.includes('DEPARTURE') ? 'Departure cancelled' : 'Booking cancelled', badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-800/40' };
    }
    if (act.includes('NO_SHOW')) {
      return { label: 'Marked as no-show', badgeColor: 'bg-orange-950/60 text-orange-300 border-orange-800/40' };
    }
    if (act.includes('PAYMENT')) {
      return { label: 'Payment recorded', badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' };
    }
    if (act.includes('ALLOCAT') || act.includes('GUEST')) {
      return { label: act.includes('REMOVED') ? 'Allocation removed' : 'Guests allocated to boat', badgeColor: 'bg-teal-950/60 text-teal-300 border-teal-800/40' };
    }
    if (act.includes('BOAT')) {
      return { label: act.includes('REMOVED') ? 'Boat removed' : 'Boat assigned to departure', badgeColor: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40' };
    }
    if (act.includes('DEPARTURE')) {
      return { label: 'Departure updated', badgeColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40' };
    }

    // Default clean fallback
    const friendly = action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return { label: friendly, badgeColor: 'bg-[#13211D] text-slate-300 border-[#1F332C]' };
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const actionMatch = log.action.toLowerCase().includes(q);
    const userMatch = (log.actor_name || '').toLowerCase().includes(q);
    const entityMatch = log.entity_id.toLowerCase().includes(q);
    return actionMatch || userMatch || entityMatch;
  });

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">Audit Logs</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Track important operational changes, staff allocations and financial events.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, user, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Entities</option>
            <option value="Booking">Bookings</option>
            <option value="boat_assignment">Boat Assignments</option>
            <option value="guest_allocation">Guest Allocations</option>
            <option value="payment">Payments</option>
            <option value="departure">Departures</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
          <span className="text-xs">Loading audit records...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card variant="elevated" padding="lg" className="text-center py-16 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#13211D] border border-[#1F332C] flex items-center justify-center mx-auto text-slate-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">No audit activity yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Operational actions such as bookings, confirmations, payments and allocations will automatically log here.
            </p>
          </div>
          {(entityFilter || searchQuery) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEntityFilter('');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="bg-[#0E1A17] border border-[#1F332C] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#081210] border-b border-[#1F332C] text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-display">
                <tr>
                  <th className="px-5 py-3.5">Time</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Target Entity</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F332C]">
                {filteredLogs.map((log) => {
                  const { label, badgeColor } = formatActionLabel(log.action);
                  const isExpanded = expandedLogId === log.id;
                  const dateFormatted = new Date(log.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                  const timeFormatted = new Date(log.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpand(log.id)}
                        className="hover:bg-[#13211D] transition-colors cursor-pointer"
                      >
                        {/* Time */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-mono text-white text-xs font-semibold">
                            {timeFormatted}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {dateFormatted}
                          </div>
                        </td>

                        {/* Action Label */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium ${badgeColor}`}
                          >
                            {label}
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono mt-1">
                            {log.action}
                          </span>
                        </td>

                        {/* Entity & ID */}
                        <td className="px-5 py-4">
                          <div className="font-mono text-xs text-emerald-400 font-bold">
                            {log.entity_id}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                            {log.entity_type}
                          </div>
                        </td>

                        {/* Actor */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 font-medium text-white">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>{log.actor_name || 'System / Guest'}</span>
                          </div>
                        </td>

                        {/* Expand Trigger */}
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#081210] transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Technical Details Drawer/Row */}
                      {isExpanded && (
                        <tr className="bg-[#081210]">
                          <td colSpan={5} className="px-6 py-4 border-b border-[#1F332C]">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Audit Payload Snapshot</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                {log.before_data && (
                                  <div className="bg-[#0E1A17] border border-[#1F332C] rounded-xl p-3 space-y-1">
                                    <span className="text-slate-500 text-[10px] font-semibold block uppercase">
                                      Previous State
                                    </span>
                                    <pre className="font-mono text-[11px] text-amber-300 overflow-x-auto whitespace-pre-wrap">
                                      {JSON.stringify(log.before_data, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {log.after_data && (
                                  <div className="bg-[#0E1A17] border border-[#1F332C] rounded-xl p-3 space-y-1">
                                    <span className="text-slate-500 text-[10px] font-semibold block uppercase">
                                      Resulting State
                                    </span>
                                    <pre className="font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                                      {JSON.stringify(log.after_data, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {!log.before_data && !log.after_data && (
                                  <div className="text-slate-500 italic text-xs py-1">
                                    No state mutations recorded for this event.
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
