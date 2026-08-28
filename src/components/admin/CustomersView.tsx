import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Customer } from '../../types';
import { Users, Search, Phone, Mail, Globe, Calendar, DollarSign, MessageCircle } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const toast = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getCustomers(search || undefined);
      setCustomers(res);
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Gosti & Klijenti (CRM)
          </span>
          <h2 className="text-2xl font-bold text-white">Baza Gostiju ({customers.length})</h2>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Traži po imenu, telefonu ili emailu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </form>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-emerald-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
          Nema pronađenih gostiju u bazi.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">
                    {c.first_name} {c.last_name}
                  </h4>
                  <span className="text-xs text-slate-400">{c.country_code || 'BiH'}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-400 block">
                    {c.total_bookings_count} rezervacija
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {c.total_spent_amount} BAM ukupno
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-850">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <a href={`tel:${c.phone}`} className="hover:text-emerald-400">
                    {c.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{c.email}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-[11px] text-slate-400">
                <span>Zadnja posjeta: {c.last_booking_date || 'Nedavno'}</span>
                <a
                  href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
