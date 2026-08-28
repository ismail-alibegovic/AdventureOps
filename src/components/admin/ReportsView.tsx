import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Download, DollarSign, Calendar, Users, TrendingUp, BarChart3 } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getReportsSummary();
        setData(res);
      } catch (err) {
        toast.error('Failed to load financial reports');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 flex justify-center text-emerald-400">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  const { metrics, departures_occupancy, popular_packages } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Finansijska Analitika & Sezonski Izvještaji
          </span>
          <h2 className="text-2xl font-bold text-white">Pregled Poslovanja i Popunjenosti</h2>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/reports/export/bookings.csv"
            download="bookings_report.csv"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>Preuzmi Rezervacije (CSV)</span>
          </a>
          <a
            href="/api/admin/reports/export/payments.csv"
            download="payments_report.csv"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Preuzmi Uplate (CSV)</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Naplaćeni Prihodi</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {metrics.total_revenue_collected} BAM
          </div>
          <div className="text-[11px] text-slate-400">
            Očekivano: {metrics.total_revenue_booked} BAM
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Broj Rezervacija</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics.total_bookings_count}
          </div>
          <div className="text-[11px] text-slate-400">
            Uspješno realizovano / aktivno
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Ukupno Gostiju</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {metrics.total_guests_count}
          </div>
          <div className="text-[11px] text-slate-400">
            Prosjek po grupi: {metrics.average_group_size} os.
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Prosječna Popunjenost</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">
            {departures_occupancy.length > 0
              ? Math.round(
                  departures_occupancy.reduce((acc: number, d: any) => acc + d.occupancy_rate, 0) /
                    departures_occupancy.length
                )
              : 0}
            %
          </div>
          <div className="text-[11px] text-slate-400">Na svim aktivnim polascima</div>
        </div>
      </div>

      {/* Popular Packages */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Popularnost Paketa & Prihodi</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {popular_packages.map((pkg: any) => (
            <div
              key={pkg.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs"
            >
              <h4 className="font-bold text-white text-sm">{pkg.name_bs}</h4>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-400">Ukupno rezervacija:</span>
                <strong className="text-white">{pkg.bookings_count}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-400">Ukupno gostiju:</span>
                <strong className="text-white">{pkg.guests_count}</strong>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Prihod:</span>
                <strong className="text-emerald-400 text-sm font-extrabold">{pkg.revenue} BAM</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
