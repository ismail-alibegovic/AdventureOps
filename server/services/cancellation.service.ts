import { DatabaseSchema, getDatabase, withTransaction } from '../db/database';
import {
  BookingStatus,
  Cancellation,
  CancellationFeeStatus,
  CancellationReason,
  DepartureStatus,
  OperationalStatus,
  NotificationType,
} from '../../src/types';
import { AvailabilityService } from './availability.service';
import { NotificationService } from './notification.service';

export interface CancelBookingInput {
  organization_id: string;
  booking_id: string;
  cancelled_by_type: 'customer' | 'company' | 'admin';
  cancelled_by_user_id?: string;
  cancelled_by_user_name?: string;
  reason_code: CancellationReason;
  reason_text?: string;
  fee_amount?: number;
  fee_status?: CancellationFeeStatus;
}

export class CancellationService {
  /**
   * Cancel an individual booking
   */
  static async cancelBooking(input: CancelBookingInput): Promise<{ booking: any; cancellation: Cancellation }> {
    return withTransaction((db: DatabaseSchema) => {
      const booking = db.bookings.find((b) => b.id === input.booking_id && b.organization_id === input.organization_id);
      if (!booking) throw new Error('Booking not found');

      if (booking.booking_status === BookingStatus.CANCELLED) {
        throw new Error('This booking is already cancelled.');
      }
      if (booking.booking_status === BookingStatus.COMPLETED) {
        throw new Error('Completed trips cannot be cancelled.');
      }

      const prevStatus = booking.booking_status;
      const now = new Date().toISOString();

      booking.booking_status = BookingStatus.CANCELLED;
      booking.updated_at = now;

      // Remove any boat allocations
      db.booking_allocations = db.booking_allocations.filter((al) => al.booking_id === booking.id);

      // Create cancellation entity
      const cancellationId = `cnc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const cancellation: Cancellation = {
        id: cancellationId,
        organization_id: input.organization_id,
        booking_id: booking.id,
        cancelled_by_type: input.cancelled_by_type,
        cancelled_by_user_id: input.cancelled_by_user_id,
        reason_code: input.reason_code,
        reason_text: input.reason_text,
        fee_amount: input.fee_amount || 0,
        fee_status: input.fee_status || CancellationFeeStatus.WAIVED,
        cancelled_at: now,
        created_at: now,
      };

      db.cancellations.push(cancellation);

      // Re-evaluate departure status (if full, reopen)
      const departure = db.departures.find((d) => d.id === booking.departure_id);
      if (departure && departure.status === 'full') {
        const reserved = AvailabilityService.getReservedGuestCount(db, departure.id);
        if (reserved < departure.capacity_limit) {
          departure.status = DepartureStatus.OPEN;
          departure.updated_at = now;
        }
      }

      // Audit Log
      db.audit_logs.push({
        id: `audit-${Date.now()}`,
        organization_id: input.organization_id,
        actor_user_id: input.cancelled_by_user_id || 'system',
        actor_name: input.cancelled_by_user_name || (input.cancelled_by_type === 'customer' ? 'Customer' : 'Staff'),
        action: 'BOOKING_CANCELLED',
        entity_type: 'Booking',
        entity_id: booking.id,
        before_data: { booking_status: prevStatus },
        after_data: {
          booking_status: BookingStatus.CANCELLED,
          cancellation_id: cancellation.id,
          reason_code: input.reason_code,
          fee_amount: input.fee_amount,
        },
        created_at: now,
      });

      // Transactional email notification
      const customer = db.customers.find((c) => c.id === booking.customer_id);
      const pkg = db.packages.find((p) => p.id === booking.package_id);
      if (customer && departure && pkg) {
        NotificationService.queueBookingNotification(
          db,
          booking,
          customer,
          departure,
          pkg,
          NotificationType.BOOKING_CANCELLED
        );
      }

      return { booking, cancellation };
    });
  }

  /**
   * Cancel an entire departure (e.g. weather, high river discharge, water conditions)
   */
  static async cancelDeparture(
    orgId: string,
    departureId: string,
    reason: string,
    actorUserId?: string,
    actorName?: string
  ): Promise<{ affected_bookings_count: number; affected_guests_count: number }> {
    return withTransaction((db) => {
      const departure = db.departures.find((d) => d.id === departureId && d.organization_id === orgId);
      if (!departure) throw new Error('Departure not found');

      const now = new Date().toISOString();
      departure.status = DepartureStatus.CANCELLED;
      departure.operational_status = OperationalStatus.CANCELLED;
      departure.internal_notes = departure.internal_notes
        ? `${departure.internal_notes}\n[${now.slice(0, 16)}] CANCELLED: ${reason}`
        : `CANCELLED: ${reason}`;
      departure.updated_at = now;

      // Identify active affected bookings
      const activeStatuses = [BookingStatus.REQUESTED, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN];
      const affectedBookings = db.bookings.filter(
        (b) => b.departure_id === departureId && activeStatuses.includes(b.booking_status)
      );

      let totalAffectedGuests = 0;
      affectedBookings.forEach((b) => {
        totalAffectedGuests += b.guest_count;
        b.booking_status = BookingStatus.CANCELLED;
        b.internal_note = b.internal_note
          ? `${b.internal_note}\n[${now.slice(0, 16)}] Tura otkazana od strane organizatora: ${reason}`
          : `Tura otkazana: ${reason}`;
        b.updated_at = now;

        // Create cancellation record
        db.cancellations.push({
          id: `cnc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          organization_id: orgId,
          booking_id: b.id,
          cancelled_by_type: 'company',
          cancelled_by_user_id: actorUserId,
          reason_code: CancellationReason.WEATHER,
          reason_text: reason,
          fee_amount: 0,
          fee_status: CancellationFeeStatus.WAIVED,
          cancelled_at: now,
          created_at: now,
        });

        // Queue notification
        const customer = db.customers.find((c) => c.id === b.customer_id);
        const pkg = db.packages.find((p) => p.id === b.package_id);
        if (customer && pkg) {
          NotificationService.queueBookingNotification(
            db,
            b,
            customer,
            departure,
            pkg,
            NotificationType.DEPARTURE_CANCELLED
          );
        }
      });

      // Clear boat assignments allocations for this cancelled departure
      const depAssignments = db.boat_assignments.filter((ba) => ba.departure_id === departureId);
      const baIds = new Set(depAssignments.map((ba) => ba.id));
      db.booking_allocations = db.booking_allocations.filter((al) => !baIds.has(al.boat_assignment_id));

      db.audit_logs.push({
        id: `audit-${Date.now()}`,
        organization_id: orgId,
        actor_user_id: actorUserId || 'system',
        actor_name: actorName || 'Admin',
        action: 'DEPARTURE_CANCELLED',
        entity_type: 'Departure',
        entity_id: departureId,
        after_data: {
          reason,
          affected_bookings: affectedBookings.length,
          affected_guests: totalAffectedGuests,
        },
        created_at: now,
      });

      return {
        affected_bookings_count: affectedBookings.length,
        affected_guests_count: totalAffectedGuests,
      };
    });
  }
}
