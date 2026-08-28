import { getDatabase } from '../db/database';
import { BookingStatus, PaymentStatus } from '../../src/types';

export interface ReportMetrics {
  period_label: string;
  total_bookings: number;
  total_guests: number;
  average_group_size: number;
  booked_gross_revenue: number;
  expected_revenue: number;
  collected_revenue: number;
  balance_uncollected: number;
  confirmed_bookings_count: number;
  cancelled_bookings_count: number;
  cancellation_rate_percentage: number;
  no_show_bookings_count: number;
  no_show_rate_percentage: number;
  package_breakdown: Array<{ package_id: string; package_name: string; bookings_count: number; guests_count: number; revenue: number }>;
  source_breakdown: Array<{ source: string; bookings_count: number; guests_count: number; revenue: number }>;
  occupancy_summary: {
    total_departures: number;
    total_capacity: number;
    total_booked_seats: number;
    average_occupancy_percentage: number;
  };
}

export class ReportService {
  static getMetrics(orgId: string, startDateStr?: string, endDateStr?: string): ReportMetrics {
    const db = getDatabase();

    let bookings = db.bookings.filter((b) => b.organization_id === orgId);
    let payments = db.payments.filter((p) => p.organization_id === orgId);
    let departures = db.departures.filter((d) => d.organization_id === orgId);

    if (startDateStr && endDateStr) {
      bookings = bookings.filter((b) => {
        const dep = db.departures.find((d) => d.id === b.departure_id);
        const date = dep ? dep.start_at.split('T')[0] : b.created_at.split('T')[0];
        return date >= startDateStr && date <= endDateStr;
      });

      payments = payments.filter((p) => {
        const date = p.collected_at.split('T')[0];
        return date >= startDateStr && date <= endDateStr;
      });

      departures = departures.filter((d) => {
        const date = d.start_at.split('T')[0];
        return date >= startDateStr && date <= endDateStr;
      });
    }

    const totalBookings = bookings.length;
    const totalGuests = bookings.reduce((sum, b) => sum + b.guest_count, 0);
    const avgGroupSize = totalBookings > 0 ? Number((totalGuests / totalBookings).toFixed(1)) : 0;

    // Financial calculations
    const bookedGrossRevenue = bookings.reduce((sum, b) => sum + b.total_amount, 0);

    const activeStatuses = [BookingStatus.REQUESTED, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.COMPLETED];
    const expectedRevenue = bookings
      .filter((b) => activeStatuses.includes(b.booking_status))
      .reduce((sum, b) => sum + b.total_amount, 0);

    const collectedRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const balanceUncollected = Math.max(0, expectedRevenue - collectedRevenue);

    // Rates
    const confirmedCount = bookings.filter((b) => b.booking_status === BookingStatus.CONFIRMED || b.booking_status === BookingStatus.CHECKED_IN || b.booking_status === BookingStatus.COMPLETED).length;
    const cancelledCount = bookings.filter((b) => b.booking_status === BookingStatus.CANCELLED).length;
    const noShowCount = bookings.filter((b) => b.booking_status === BookingStatus.NO_SHOW).length;

    const cancellationRate = totalBookings > 0 ? Number(((cancelledCount / totalBookings) * 100).toFixed(1)) : 0;
    const noShowRate = totalBookings > 0 ? Number(((noShowCount / totalBookings) * 100).toFixed(1)) : 0;

    // Package breakdown
    const pkgMap: Record<string, { count: number; guests: number; revenue: number }> = {};
    bookings.forEach((b) => {
      if (!pkgMap[b.package_id]) {
        pkgMap[b.package_id] = { count: 0, guests: 0, revenue: 0 };
      }
      pkgMap[b.package_id].count += 1;
      pkgMap[b.package_id].guests += b.guest_count;
      if (activeStatuses.includes(b.booking_status)) {
        pkgMap[b.package_id].revenue += b.total_amount;
      }
    });

    const packageBreakdown = Object.entries(pkgMap).map(([pkgId, data]) => {
      const pkg = db.packages.find((p) => p.id === pkgId);
      return {
        package_id: pkgId,
        package_name: pkg?.name_bs || pkg?.name_en || pkgId,
        bookings_count: data.count,
        guests_count: data.guests,
        revenue: data.revenue,
      };
    });

    // Source breakdown
    const srcMap: Record<string, { count: number; guests: number; revenue: number }> = {};
    bookings.forEach((b) => {
      const src = b.source || 'website';
      if (!srcMap[src]) srcMap[src] = { count: 0, guests: 0, revenue: 0 };
      srcMap[src].count += 1;
      srcMap[src].guests += b.guest_count;
      if (activeStatuses.includes(b.booking_status)) {
        srcMap[src].revenue += b.total_amount;
      }
    });

    const sourceBreakdown = Object.entries(srcMap).map(([src, data]) => ({
      source: src,
      bookings_count: data.count,
      guests_count: data.guests,
      revenue: data.revenue,
    }));

    // Occupancy
    const totalCapacity = departures.reduce((sum, d) => sum + d.capacity_limit, 0);
    const activeBookings = bookings.filter((b) => activeStatuses.includes(b.booking_status));
    const totalBookedSeats = activeBookings.reduce((sum, b) => sum + b.guest_count, 0);
    const avgOccupancy = totalCapacity > 0 ? Number(((totalBookedSeats / totalCapacity) * 100).toFixed(1)) : 0;

    return {
      period_label: startDateStr && endDateStr ? `${startDateStr} to ${endDateStr}` : 'All Time Season',
      total_bookings: totalBookings,
      total_guests: totalGuests,
      average_group_size: avgGroupSize,
      booked_gross_revenue: bookedGrossRevenue,
      expected_revenue: expectedRevenue,
      collected_revenue: collectedRevenue,
      balance_uncollected: balanceUncollected,
      confirmed_bookings_count: confirmedCount,
      cancelled_bookings_count: cancelledCount,
      cancellation_rate_percentage: cancellationRate,
      no_show_bookings_count: noShowCount,
      no_show_rate_percentage: noShowRate,
      package_breakdown: packageBreakdown,
      source_breakdown: sourceBreakdown,
      occupancy_summary: {
        total_departures: departures.length,
        total_capacity: totalCapacity,
        total_booked_seats: totalBookedSeats,
        average_occupancy_percentage: avgOccupancy,
      },
    };
  }

  /**
   * Export Bookings to CSV
   */
  static exportBookingsCsv(orgId: string): string {
    const db = getDatabase();
    const bookings = db.bookings.filter((b) => b.organization_id === orgId);

    const headers = [
      'Reservation Code',
      'Customer Name',
      'Email',
      'Phone',
      'Country',
      'Departure Date',
      'Departure Time',
      'Package',
      'Adults',
      'Children',
      'Total Guests',
      'Subtotal (BAM)',
      'Total (BAM)',
      'Booking Status',
      'Payment Status',
      'Source',
      'Created At',
    ];

    const rows = bookings.map((b) => {
      const cust = db.customers.find((c) => c.id === b.customer_id);
      const dep = db.departures.find((d) => d.id === b.departure_id);
      const pkg = db.packages.find((p) => p.id === b.package_id);

      const depDate = dep ? dep.start_at.split('T')[0] : '';
      const depTime = dep ? dep.start_at.slice(11, 16) : '';

      return [
        `"${b.reservation_code}"`,
        `"${cust ? `${cust.first_name} ${cust.last_name}` : ''}"`,
        `"${cust?.email || ''}"`,
        `"${cust?.phone || ''}"`,
        `"${cust?.country_code || ''}"`,
        `"${depDate}"`,
        `"${depTime}"`,
        `"${pkg?.name_en || ''}"`,
        b.adult_count,
        b.child_count,
        b.guest_count,
        b.subtotal,
        b.total_amount,
        `"${b.booking_status}"`,
        `"${b.payment_status}"`,
        `"${b.source}"`,
        `"${b.created_at}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Export Payments to CSV
   */
  static exportPaymentsCsv(orgId: string): string {
    const db = getDatabase();
    const payments = db.payments.filter((p) => p.organization_id === orgId);

    const headers = ['Payment ID', 'Reservation Code', 'Amount (BAM)', 'Currency', 'Method', 'Reference', 'Collected By', 'Collected At'];

    const rows = payments.map((p) => {
      const b = db.bookings.find((bk) => bk.id === p.booking_id);
      return [
        `"${p.id}"`,
        `"${b?.reservation_code || ''}"`,
        p.amount,
        `"${p.currency}"`,
        `"${p.method}"`,
        `"${p.reference || ''}"`,
        `"${p.collected_by_user_name || ''}"`,
        `"${p.collected_at}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
