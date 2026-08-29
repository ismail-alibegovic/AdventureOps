import { DatabaseSchema, getDatabase, withTransaction } from '../db/database';
import { Departure, DepartureStatus, OperationalStatus, BookingStatus } from '../../src/types';
import { AvailabilityService } from './availability.service';

export interface CreateDepartureInput {
  organization_id: string;
  package_id: string;
  start_at: string;
  meeting_at: string;
  expected_end_at: string;
  capacity_limit: number;
  public_message_bs?: string;
  public_message_en?: string;
  internal_notes?: string;
}

export class DepartureService {
  /**
   * Get operations daily board with live calculated metrics for each departure
   */
  static getDailyOperationsBoard(orgId: string, dateStr: string) {
    const db = getDatabase();

    const dayDepartures = db.departures
      .filter((d) => d.organization_id === orgId && d.start_at.startsWith(dateStr))
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

    return dayDepartures.map((dep) => {
      const pkg = db.packages.find((p) => p.id === dep.package_id);
      const avail = AvailabilityService.getDepartureAvailability(db, dep);

      // Bookings in this departure
      const bookings = db.bookings.filter((b) => b.departure_id === dep.id);
      const activeBookings = bookings.filter((b) =>
        [BookingStatus.REQUESTED, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN].includes(b.booking_status)
      );

      const checkedInGuests = bookings
        .filter((b) => b.booking_status === BookingStatus.CHECKED_IN)
        .reduce((sum, b) => sum + b.guest_count, 0);

      const unpaidGuests = activeBookings
        .filter((b) => b.payment_status === 'unpaid' || b.payment_status === 'partial')
        .reduce((sum, b) => sum + b.guest_count, 0);

      // Boat assignments
      const assignments = db.boat_assignments.filter((ba) => ba.departure_id === dep.id);
      const assignedGuides = assignments.filter((ba) => !!ba.guide_id);
      const enrichedAssignments = assignments.map((ba) => {
        const boat = db.boats.find((b) => b.id === ba.boat_id);
        const guide = db.staff_members.find((s) => s.id === ba.guide_id);
        const allocs = db.booking_allocations.filter((al) => al.boat_assignment_id === ba.id);
        const allocCount = allocs.reduce((s, a) => s + a.guest_count, 0);
        return {
          ...ba,
          boat,
          guide,
          allocated_guests_count: allocCount,
          allocations: allocs.map((al) => {
            const b = db.bookings.find((bk) => bk.id === al.booking_id);
            return {
              ...al,
              booking: b,
            };
          }),
        };
      });

      return {
        ...dep,
        package: pkg,
        booked_guests: avail.reserved_guests,
        available_capacity: avail.available_capacity,
        bookings_count: activeBookings.length,
        assigned_boats_count: assignments.length,
        assigned_guides_count: assignedGuides.length,
        checked_in_guests: checkedInGuests,
        unpaid_guests: unpaidGuests,
        boat_assignments: enrichedAssignments,
        bookings: activeBookings,
      };
    });
  }

  /**
   * Create a single departure record
   */
  static async createDeparture(input: CreateDepartureInput): Promise<Departure> {
    return withTransaction((db) => {
      const now = new Date().toISOString();
      const depId = `dep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      const dep: Departure = {
        id: depId,
        organization_id: input.organization_id,
        package_id: input.package_id,
        start_at: input.start_at,
        meeting_at: input.meeting_at,
        expected_end_at: input.expected_end_at,
        capacity_limit: input.capacity_limit,
        status: DepartureStatus.OPEN,
        operational_status: OperationalStatus.NORMAL,
        public_message_bs: input.public_message_bs,
        public_message_en: input.public_message_en,
        internal_notes: input.internal_notes,
        created_at: now,
        updated_at: now,
      };

      db.departures.push(dep);
      return dep;
    });
  }

  /**
   * Update departure details (capacity limit, public message, notes, operational status)
   */
  static async updateDeparture(
    orgId: string,
    departureId: string,
    updates: Partial<Departure>
  ): Promise<Departure> {
    return withTransaction((db) => {
      const departure = db.departures.find((d) => d.id === departureId && d.organization_id === orgId);
      if (!departure) throw new Error('Departure not found');

      if (updates.capacity_limit !== undefined) {
        const reserved = AvailabilityService.getReservedGuestCount(db, departure.id);
        if (updates.capacity_limit < reserved) {
          throw new Error(
            `Cannot set capacity to ${updates.capacity_limit}. There are currently ${reserved} reserved guests.`
          );
        }
        departure.capacity_limit = updates.capacity_limit;
      }

      if (updates.operational_status !== undefined) {
        departure.operational_status = updates.operational_status;
      }
      if (updates.status !== undefined) {
        departure.status = updates.status;
      }
      if (updates.public_message_bs !== undefined) {
        departure.public_message_bs = updates.public_message_bs;
      }
      if (updates.public_message_en !== undefined) {
        departure.public_message_en = updates.public_message_en;
      }
      if (updates.internal_notes !== undefined) {
        departure.internal_notes = updates.internal_notes;
      }

      departure.updated_at = new Date().toISOString();
      return departure;
    });
  }

  /**
   * Generate departures from recurring templates for a given date range
   */
  static async generateFromTemplates(
    orgId: string,
    startDateStr: string, // YYYY-MM-DD
    endDateStr: string // YYYY-MM-DD
  ): Promise<{ generated_count: number }> {
    return withTransaction((db) => {
      const templates = db.departure_templates.filter((t) => t.organization_id === orgId && t.active);
      if (templates.length === 0) return { generated_count: 0 };

      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      let count = 0;

      for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
        const dayOfWeek = cur.getDay(); // 0 = Sunday ... 6 = Saturday
        const dateStr = cur.toISOString().split('T')[0];

        templates.forEach((tmpl) => {
          if (tmpl.days_of_week.includes(dayOfWeek)) {
            const [h, m] = tmpl.time_of_day.split(':').map(Number);
            const startAt = new Date(cur);
            startAt.setHours(h, m, 0, 0);

            const meetingAt = new Date(startAt);
            meetingAt.setMinutes(meetingAt.getMinutes() - 45);

            const endAt = new Date(startAt);
            endAt.setMinutes(endAt.getMinutes() + 360);

            // Check if already exists for this exact time and package
            const isoStart = startAt.toISOString();
            const exists = db.departures.find(
              (d) => d.organization_id === orgId && d.package_id === tmpl.package_id && d.start_at === isoStart
            );

            if (!exists) {
              const now = new Date().toISOString();
              db.departures.push({
                id: `dep-${dateStr}-${tmpl.time_of_day.replace(':', '')}-${Math.random().toString(36).substr(2, 4)}`,
                organization_id: orgId,
                package_id: tmpl.package_id,
                start_at: isoStart,
                meeting_at: meetingAt.toISOString(),
                expected_end_at: endAt.toISOString(),
                capacity_limit: tmpl.capacity_limit,
                status: DepartureStatus.OPEN,
                operational_status: OperationalStatus.NORMAL,
                public_message_bs: 'Redovni polazak sa baze.',
                public_message_en: 'Scheduled regular departure from base.',
                created_at: now,
                updated_at: now,
              });
              count++;
            }
          }
        });
      }

      return { generated_count: count };
    });
  }
}
