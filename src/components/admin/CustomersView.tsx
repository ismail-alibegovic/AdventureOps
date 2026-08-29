import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Customer } from '../../types';
import {
  Search,
  Phone,
  Mail,
  MessageCircle,
  Users,
  AlertCircle,
  Calendar,
  DollarSign,
  X,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TableSkeleton } from '../ui/loading';

export const CustomersView: React.FC = () => {
  const toast = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const loadCustomers = async (searchQuery?: string) => {
    try {
      setLoading(true);
      const res = await apiClient.getCustomers(searchQuery || undefined);
      setCustomers(res);
    } catch {
      toast.error('Failed to load customer directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers(search);
  };

  const clearSearch = () => {
    setSearch('');
    loadCustomers('');
  };

  const getInitials = (firstName: string, lastName: string) => {
    const f = firstName ? firstName[0].toUpperCase() : '';
    const l = lastName ? lastName[0].toUpperCase() : '';
    return `${f}${l}` || 'G';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">Customers</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Guest profiles, contact history and booking frequency.
          </p>
        </div>

        {/* Live Search */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guests by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E1A17] border border-[#1F332C] focus:border-emerald-500 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Customer Directory */}
      {loading ? (
        <TableSkeleton rows={6} columns={4} />
      ) : customers.length === 0 ? (
        <Card variant="elevated" padding="lg" className="text-center py-16 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#13211D] border border-[#1F332C] flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">No customers found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search
                ? `No guests matched "${search}". Try searching with a different name, email or phone.`
                : 'There are no customer records in the database yet.'}
            </p>
          </div>
          {search && (
            <Button variant="secondary" size="sm" onClick={clearSearch}>
              Clear Search
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => {
            const initials = getInitials(c.first_name, c.last_name);
            const totalBookings = c.bookings_count ?? (c as any).total_bookings_count ?? 1;
            const totalSpent = (c as any).total_spent_amount;
            const noShows = c.no_show_count || 0;
            const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
            const country = c.country_code || 'BA';
            const lastVisit = (c as any).last_booking_date || (c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent');

            return (
              <Card
                key={c.id}
                variant="elevated"
                padding="md"
                className="space-y-4 hover:border-emerald-800/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Customer Info & Avatar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Subdued Initials Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-[#13211D] border border-[#1F332C] text-emerald-400 font-bold text-xs font-mono flex items-center justify-center shrink-0">
                        {initials}
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-base font-display">
                          {c.first_name} {c.last_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#081210] text-slate-400 border border-[#1F332C]">
                            {country}
                          </span>
                          <span className="text-[11px] text-slate-400 uppercase">
                            {c.preferred_language || 'EN'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bookings telemetry */}
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-400 block font-display">
                        {totalBookings} {totalBookings === 1 ? 'trip' : 'trips'}
                      </span>
                      {totalSpent !== undefined && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {totalSpent} BAM
                        </span>
                      )}
                    </div>
                  </div>

                  {/* No-shows Warning (Only if > 0) */}
                  {noShows > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/30 text-amber-300 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{noShows} {noShows === 1 ? 'no-show incident' : 'no-shows recorded'}</span>
                    </div>
                  )}

                  {/* Contact Methods */}
                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-[#1F332C]">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a href={`tel:${c.phone}`} className="hover:text-emerald-400 font-mono text-[11px]">
                        {c.phone || 'No phone'}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a href={`mailto:${c.email}`} className="text-slate-300 hover:text-white truncate text-[11px]">
                        {c.email || 'No email'}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#1F332C] flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Last active: {lastVisit}</span>
                  </div>

                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
