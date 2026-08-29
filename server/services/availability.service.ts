import { DatabaseSchema, getDatabase } from '../db/database';
import { Departure, BookingStatus, DepartureStatus, OperationalStatus } from '../../src/types';

export interface DepartureAvailability {
  id?: string;
  departure_id: string;
  package_id: string;
  start_at: string;
  meeting_at: string;
  expected_end_at: string;
  capacity_limit: number;
  reserved_guests: number;
  available_capacity: number;
  spots_left?: number;
  status: DepartureStatus;
  operational_status: OperationalStatus;
  is_available: boolean;
  public_message_bs?: string;
  public_message_en?: string;
}

export class AvailabilityService {
  /**
   * Calculate reserved guest count for a specific departure in a database state
   * Only includes capacity-consuming statuses: requested, confirmed, checked_in
   */
  static getReservedGuestCount(db: DatabaseSchema, departureId: string, excludeBookingId?: string): number {
    return db.bookings
      .filter((b) => {
        if (b.departure_id !== departureId) return false;
        if (excludeBookingId && b.id === excludeBookingId) return false;
        return (
          b.booking_status === BookingStatus.REQUESTED ||
          b.booking_status === BookingStatus.CONFIRMED ||
          b.booking_status === BookingStatus.CHECKED_IN
        );
      })
      .reduce((sum, b) => sum + (b.guest_count || (b.adult_count + b.child_count)), 0);
  }

  /**
   * Get availability metrics for a departure
   */
  static getDepartureAvailability(db: DatabaseSchema, departure: Departure, excludeBookingId?: string): DepartureAvailability {
    const reserved = this.getReservedGuestCount(db, departure.id, excludeBookingId);
    const available = Math.max(0, departure.capacity_limit - reserved);
    const isAvailable =
      departure.status === DepartureStatus.OPEN &&
      departure.operational_status !== OperationalStatus.CANCELLED &&
      available > 0;

    return {
      id: departure.id,
      departure_id: departure.id,
      package_id: departure.package_id,
      start_at: departure.start_at,
      meeting_at: departure.meeting_at,
      expected_end_at: departure.expected_end_at,
      capacity_limit: departure.capacity_limit,
      reserved_guests: reserved,
      available_capacity: available,
      spots_left: available,
      status: departure.status,
      operational_status: departure.operational_status,
      is_available: isAvailable,
      public_message_bs: departure.public_message_bs,
      public_message_en: departure.public_message_en,
    };
  }

  /**
   * Search availability by date and package
   */
  static getPublicDepartures(
    orgId: string,
    packageId?: string,
    date?: string // YYYY-MM-DD
  ): DepartureAvailability[] {
    const db = getDatabase();
    const now = new Date();
    return db.departures
      .filter((dep) => {
        if (dep.organization_id !== orgId) return false;
        if (packageId && dep.package_id !== packageId) return false;
        if (date) {
          const depDate = dep.start_at.split('T')[0];
          if (depDate !== date) return false;
        }
        // Exclude departures whose start time has already passed for public booking
        const depStart = new Date(dep.start_at);
        if (depStart.getTime() <= now.getTime()) {
          return false;
        }
        // Only return open or full departures (filter out completely cancelled or completed if in the past)
        return dep.status === DepartureStatus.OPEN || dep.status === DepartureStatus.FULL;
      })
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
      .map((dep) => this.getDepartureAvailability(db, dep));
  }

  /**
   * Get dates with active departures for a given package and month
   */
  static getAvailableDatesForMonth(orgId: string, packageId: string, year: number, month: number): Array<{ date: string; has_availability: boolean; spots_left: number }> {
    const db = getDatabase();
    const result: Record<string, { totalSpots: number; hasOpen: boolean }> = {};
    const now = new Date();

    db.departures.forEach((dep) => {
      if (dep.organization_id !== orgId) return;
      if (packageId && dep.package_id !== packageId) return;

      const d = new Date(dep.start_at);
      // Skip past departure times
      if (d.getTime() <= now.getTime()) return;

      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        const dateKey = dep.start_at.split('T')[0];
        const avail = this.getDepartureAvailability(db, dep);

        if (!result[dateKey]) {
          result[dateKey] = { totalSpots: 0, hasOpen: false };
        }

        result[dateKey].totalSpots += avail.available_capacity;
        if (avail.is_available) {
          result[dateKey].hasOpen = true;
        }
      }
    });

    return Object.entries(result).map(([date, info]) => ({
      date,
      has_availability: info.hasOpen && info.totalSpots > 0,
      spots_left: info.totalSpots,
    }));
  }
}
