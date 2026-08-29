import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  Download,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Globe,
  RefreshCw,
  CreditCard,
  Anchor,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../ui/MetricCard';
import { PageLoader, MetricCardSkeleton } from '../ui/loading';

export const ReportsView: React.FC = () => {
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const loadReports = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      const res = await apiClient.getReports(start || undefined, end || undefined);
      setData(res);
    } catch {
      toast.error('Failed to load performance reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReports(startDate, endDate);
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    loadReports('', '');
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCardSkeleton count={4} />
        </div>
        <PageLoader
          message="Generating analytical reports & financial summaries"
          subtext="Calculating revenue yields, guest distributions, and occupancy trends"
          size="md"
        />
      </div>
    );
  }

  const {
    total_bookings = 0,
    total_guests = 0,
    average_group_size = 0,
    booked_gross_revenue = 0,
    expected_revenue = 0,
    collected_revenue = 0,
    balance_uncollected = 0,
    confirmed_bookings_count = 0,
    cancelled_bookings_count = 0,
    cancellation_rate_percentage = 0,
    no_show_bookings_count = 0,
    no_show_rate_percentage = 0,
    package_breakdown: packageBreakdown = [],
    source_breakdown: sourceBreakdown = [],
    occupancy_summary = {
      total_departures: 0,
      total_capacity: 0,
      total_booked_seats: 0,
      average_occupancy_percentage: 0,
    },
  } = data;

  const collectionRate = expected_revenue > 0
    ? Math.round((collected_revenue / expected_revenue) * 100)
    : 100;

  const maxPackageRevenue = Math.max(
    ...packageBreakdown.map((p: any) => p.revenue || 0),
    1
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">Reports</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Revenue, bookings and operating performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/reports/export/bookings.csv"
            download="bookings_report.csv"
          >
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Bookings (CSV)
            </Button>
          </a>

          <a
            href="/api/admin/reports/export/payments.csv"
            download="payments_report.csv"
          >
            <Button
              variant="primary"
              size="md"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Payments (CSV)
            </Button>
          </a>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <Card variant="elevated" padding="md">
        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-medium">Reporting Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            />
            <Button type="submit" variant="secondary" size="sm">
              Apply
            </Button>
            {(startDate || endDate) && (
              <Button type="button" variant="ghost" size="sm" onClick={handleResetFilter}>
                Clear
              </Button>
            )}
          </div>

          <div className="text-slate-400 font-mono text-[11px]">
            {data.period_label || 'All Time Season'}
          </div>
        </form>
      </Card>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Collected Revenue"
          value={`${collected_revenue.toLocaleString()} BAM`}
          subtitle={`${collectionRate}% collected (${balance_uncollected.toLocaleString()} BAM balance)`}
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="emerald"
        />

        <MetricCard
          title="Total Bookings"
          value={total_bookings}
          subtitle={`${confirmed_bookings_count} confirmed / active`}
          icon={<Calendar className="w-5 h-5" />}
          accentColor="blue"
        />

        <MetricCard
          title="Total Guests"
          value={total_guests}
          subtitle={`Avg group size: ${average_group_size} guests`}
          icon={<Users className="w-5 h-5" />}
          accentColor="emerald"
        />

        <MetricCard
          title="Fleet Occupancy"
          value={`${occupancy_summary.average_occupancy_percentage}%`}
          subtitle={`${occupancy_summary.total_booked_seats} of ${occupancy_summary.total_capacity} seats filled`}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="amber"
        />
      </div>

      {/* Operational Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Package Performance */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="elevated" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F332C] pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-display">
                  Adventure Packages Performance
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {packageBreakdown.length} active packages
              </span>
            </div>

            <div className="space-y-4">
              {packageBreakdown.map((pkg: any) => {
                const percentage = Math.round((pkg.revenue / maxPackageRevenue) * 100);
                return (
                  <div
                    key={pkg.package_id}
                    className="p-3.5 rounded-xl bg-[#081210] border border-[#1F332C] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-white text-sm font-display">
                          {pkg.package_name}
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {pkg.bookings_count} {pkg.bookings_count === 1 ? 'booking' : 'bookings'} •{' '}
                          <strong className="text-slate-300">{pkg.guests_count} guests</strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">
                          {pkg.revenue.toLocaleString()} BAM
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#13211D] h-2 rounded-full overflow-hidden border border-[#1F332C]">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right 5 cols: Booking Sources & Operational Health */}
        <div className="lg:col-span-5 space-y-6">
          {/* Booking Sources Card */}
          <Card variant="elevated" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F332C] pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-display">
                  Booking Channels
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {sourceBreakdown.map((src: any) => {
                const share = total_bookings > 0 ? Math.round((src.bookings_count / total_bookings) * 100) : 0;
                return (
                  <div
                    key={src.source}
                    className="flex items-center justify-between py-2 border-b border-[#1F332C]/60 last:border-0 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-[#081210] text-slate-300 border border-[#1F332C]">
                        {src.source}
                      </span>
                      <span className="text-slate-400">{src.bookings_count} bookings</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-300">{src.revenue.toLocaleString()} BAM</span>
                      <span className="font-bold text-emerald-400 text-[11px] w-8 text-right">
                        {share}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Operational Quality & Risk Card */}
          <Card variant="elevated" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-white font-display border-b border-[#1F332C] pb-3">
              Operating Health
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#081210] border border-[#1F332C] space-y-1">
                <span className="text-slate-500 block text-[11px]">Cancellation Rate</span>
                <strong className="text-base font-bold text-white font-mono block">
                  {cancellation_rate_percentage}%
                </strong>
                <span className="text-[10px] text-slate-400">
                  {cancelled_bookings_count} total cancelled
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#081210] border border-[#1F332C] space-y-1">
                <span className="text-slate-500 block text-[11px]">No-Show Rate</span>
                <strong className="text-base font-bold text-white font-mono block">
                  {no_show_rate_percentage}%
                </strong>
                <span className="text-[10px] text-slate-400">
                  {no_show_bookings_count} total no-shows
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#081210] border border-[#1F332C] space-y-1">
                <span className="text-slate-500 block text-[11px]">Total Departures</span>
                <strong className="text-base font-bold text-emerald-400 font-mono block">
                  {occupancy_summary.total_departures}
                </strong>
                <span className="text-[10px] text-slate-400">
                  Scheduled rafting runs
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#081210] border border-[#1F332C] space-y-1">
                <span className="text-slate-500 block text-[11px]">Collection Ratio</span>
                <strong className="text-base font-bold text-emerald-400 font-mono block">
                  {collectionRate}%
                </strong>
                <span className="text-[10px] text-slate-400">
                  Paid vs Booked
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
