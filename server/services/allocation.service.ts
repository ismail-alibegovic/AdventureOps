import { DatabaseSchema, getDatabase, withTransaction } from '../db/database';
import { Boat, BoatAssignment, BookingAllocation, StaffMember, BoatStatus, AuditLog } from '../../src/types';

export class AllocationService {
  /**
   * Assign a boat and optional guide to a departure
   * Validates:
   * 1. Boat must be active and not in maintenance
   * 2. Boat cannot be assigned to overlapping departures
   * 3. Guide cannot be assigned to overlapping departures
   */
  static async assignBoatToDeparture(
    orgId: string,
    departureId: string,
    boatId: string,
    guideId?: string,
    actorUserId?: string,
    actorName?: string
  ): Promise<BoatAssignment> {
    return withTransaction((db: DatabaseSchema) => {
      const departure = db.departures.find((d) => d.id === departureId && d.organization_id === orgId);
      if (!departure) throw new Error('Departure not found');

      const boat = db.boats.find((b) => b.id === boatId && b.organization_id === orgId);
      if (!boat) throw new Error('Boat not found');
      if (boat.status !== BoatStatus.AVAILABLE) {
        throw new Error(`Boat ${boat.code} (${boat.name}) is currently in '${boat.status}' state and cannot be assigned.`);
      }

      // Check if boat already assigned to this exact departure
      const existingInSame = db.boat_assignments.find(
        (ba) => ba.departure_id === departureId && ba.boat_id === boatId
      );
      if (existingInSame) {
        throw new Error(`Boat ${boat.code} is already assigned to this departure.`);
      }

      // Check resource collision across overlapping departures
      const depStart = new Date(departure.start_at).getTime();
      const depEnd = new Date(departure.expected_end_at).getTime();

      const overlappingDepartures = db.departures.filter((d) => {
        if (d.id === departureId || d.organization_id !== orgId) return false;
        if (d.status === 'cancelled' || d.operational_status === 'cancelled') return false;
        const dStart = new Date(d.start_at).getTime();
        const dEnd = new Date(d.expected_end_at).getTime();
        return depStart < dEnd && depEnd > dStart;
      });

      const overlappingDepIds = new Set(overlappingDepartures.map((d) => d.id));

      const conflictingBoatAssignment = db.boat_assignments.find(
        (ba) => overlappingDepIds.has(ba.departure_id) && ba.boat_id === boatId
      );
      if (conflictingBoatAssignment) {
        const confDep = db.departures.find((d) => d.id === conflictingBoatAssignment.departure_id);
        throw new Error(
          `Boat ${boat.code} is already assigned to an overlapping departure (${confDep?.start_at.slice(11, 16)}).`
        );
      }

      if (guideId) {
        const guide = db.staff_members.find((s) => s.id === guideId && s.organization_id === orgId);
        if (!guide || !guide.active) {
          throw new Error('Selected guide is inactive or not found.');
        }

        const conflictingGuideAssignment = db.boat_assignments.find(
          (ba) => overlappingDepIds.has(ba.departure_id) && ba.guide_id === guideId
        );
        if (conflictingGuideAssignment) {
          const confDep = db.departures.find((d) => d.id === conflictingGuideAssignment.departure_id);
          throw new Error(
            `Guide ${guide.first_name} ${guide.last_name} is already assigned to an overlapping departure (${confDep?.start_at.slice(11, 16)}).`
          );
        }
      }

      const now = new Date().toISOString();
      const assignmentId = `ba-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newAssignment: BoatAssignment = {
        id: assignmentId,
        organization_id: orgId,
        departure_id: departureId,
        boat_id: boatId,
        guide_id: guideId || undefined,
        created_at: now,
        updated_at: now,
      };

      db.boat_assignments.push(newAssignment);

      // Audit
      db.audit_logs.push({
        id: `audit-${Date.now()}`,
        organization_id: orgId,
        actor_user_id: actorUserId || 'system',
        actor_name: actorName || 'Dispatcher',
        action: 'BOAT_ASSIGNED_TO_DEPARTURE',
        entity_type: 'BoatAssignment',
        entity_id: assignmentId,
        after_data: { departure_id: departureId, boat_id: boatId, guide_id: guideId },
        created_at: now,
      });

      return newAssignment;
    });
  }

  /**
   * Update guide on an existing boat assignment
   */
  static async updateAssignmentGuide(
    orgId: string,
    assignmentId: string,
    guideId?: string,
    actorUserId?: string,
    actorName?: string
  ): Promise<BoatAssignment> {
    return withTransaction((db) => {
      const assignment = db.boat_assignments.find((ba) => ba.id === assignmentId && ba.organization_id === orgId);
      if (!assignment) throw new Error('Boat assignment not found');

      const departure = db.departures.find((d) => d.id === assignment.departure_id);
      if (!departure) throw new Error('Departure not found');

      if (guideId) {
        const guide = db.staff_members.find((s) => s.id === guideId && s.organization_id === orgId);
        if (!guide || !guide.active) throw new Error('Guide is inactive or not found.');

        // Overlap check
        const depStart = new Date(departure.start_at).getTime();
        const depEnd = new Date(departure.expected_end_at).getTime();
        const overlappingDepartures = db.departures.filter((d) => {
          if (d.id === departure.id || d.organization_id !== orgId) return false;
          if (d.status === 'cancelled' || d.operational_status === 'cancelled') return false;
          const dStart = new Date(d.start_at).getTime();
          const dEnd = new Date(d.expected_end_at).getTime();
          return depStart < dEnd && depEnd > dStart;
        });
        const overlappingDepIds = new Set(overlappingDepartures.map((d) => d.id));

        const conf = db.boat_assignments.find(
          (ba) => ba.id !== assignmentId && overlappingDepIds.has(ba.departure_id) && ba.guide_id === guideId
        );
        if (conf) {
          throw new Error(`Guide is already assigned to another departure at the same time.`);
        }
      }

      const prevGuide = assignment.guide_id;
      assignment.guide_id = guideId || undefined;
      assignment.updated_at = new Date().toISOString();

      db.audit_logs.push({
        id: `audit-${Date.now()}`,
        organization_id: orgId,
        actor_user_id: actorUserId || 'system',
        actor_name: actorName || 'Dispatcher',
        action: 'ASSIGNMENT_GUIDE_UPDATED',
        entity_type: 'BoatAssignment',
        entity_id: assignmentId,
        before_data: { guide_id: prevGuide },
        after_data: { guide_id: guideId },
        created_at: new Date().toISOString(),
      });

      return assignment;
    });
  }

  /**
   * Remove a boat assignment (and any guest allocations mapped to it)
   */
  static async removeBoatAssignment(
    orgId: string,
    assignmentId: string,
    actorUserId?: string,
    actorName?: string
  ): Promise<void> {
    return withTransaction((db) => {
      const idx = db.boat_assignments.findIndex((ba) => ba.id === assignmentId && ba.organization_id === orgId);
      if (idx === -1) throw new Error('Boat assignment not found');

      // Remove dependent booking allocations
      db.booking_allocations = db.booking_allocations.filter((al) => al.boat_assignment_id !== assignmentId);
      db.boat_assignments.splice(idx, 1);

      db.audit_logs.push({
        id: `audit-${Date.now()}`,
        organization_id: orgId,
        actor_user_id: actorUserId || 'system',
        actor_name: actorName || 'Dispatcher',
        action: 'BOAT_ASSIGNMENT_REMOVED',
        entity_type: 'BoatAssignment',
        entity_id: assignmentId,
        created_at: new Date().toISOString(),
      });
    });
  }

  /**
   * GROUP ALLOCATION & SPLITTING
   * Allocates `guestCount` from a booking to a specific `boatAssignmentId`
   * Enforces:
   * 1. Sum of allocations for this booking <= booking.guest_count
   * 2. Sum of allocations on the target boat <= boat.capacity
   */
  static async allocateGuestsToBoat(
    orgId: string,
    bookingId: string,
    boatAssignmentId: string,
    guestCount: number,
    actorUserId?: string,
    actorName?: string
  ): Promise<BookingAllocation> {
    return withTransaction((db) => {
      if (guestCount <= 0) {
        throw new Error('Guest allocation count must be greater than 0.');
      }

      const booking = db.bookings.find((b) => b.id === bookingId && b.organization_id === orgId);
      if (!booking) throw new Error('Booking not found');

      const assignment = db.boat_assignments.find((ba) => ba.id === boatAssignmentId && ba.organization_id === orgId);
      if (!assignment) throw new Error('Boat assignment not found');

      if (booking.departure_id !== assignment.departure_id) {
        throw new Error('Booking departure does not match the boat assignment departure.');
      }

      const boat = db.boats.find((b) => b.id === assignment.boat_id);
      if (!boat) throw new Error('Boat not found');

      // Check current allocations for this booking
      const existingBookingAllocations = db.booking_allocations.filter(
        (al) => al.booking_id === bookingId && al.boat_assignment_id !== boatAssignmentId
      );
      const alreadyAllocatedGuestsOtherBoats = existingBookingAllocations.reduce((s, al) => s + al.guest_count, 0);

      if (alreadyAllocatedGuestsOtherBoats + guestCount > booking.guest_count) {
        const maxAssignable = booking.guest_count - alreadyAllocatedGuestsOtherBoats;
        throw new Error(
          `Cannot allocate ${guestCount} guests. Booking total is ${booking.guest_count} (${alreadyAllocatedGuestsOtherBoats} allocated to other boats). Maximum you can allocate here is ${maxAssignable}.`
        );
      }

      // Check target boat capacity
      const otherAllocationsOnBoat = db.booking_allocations.filter(
        (al) => al.boat_assignment_id === boatAssignmentId && al.booking_id !== bookingId
      );
      const currentBoatOccupancy = otherAllocationsOnBoat.reduce((s, al) => s + al.guest_count, 0);

      if (currentBoatOccupancy + guestCount > boat.capacity) {
        const boatFreeSeats = boat.capacity - currentBoatOccupancy;
        throw new Error(
          `Boat ${boat.code} exceeds capacity (${boat.capacity} seats). Current occupancy: ${currentBoatOccupancy}. Free seats: ${boatFreeSeats}.`
        );
      }

      // Upsert or insert allocation
      let existingAlloc = db.booking_allocations.find(
        (al) => al.booking_id === bookingId && al.boat_assignment_id === boatAssignmentId
      );

      const now = new Date().toISOString();

      if (existingAlloc) {
        existingAlloc.guest_count = guestCount;
      } else {
        existingAlloc = {
          id: `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          organization_id: orgId,
          booking_id: bookingId,
          boat_assignment_id: boatAssignmentId,
          guest_count: guestCount,
          created_at: now,
        };
        db.booking_allocations.push(existingAlloc);
      }

      db.audit_logs.push({
        id: `audit-${Date.now()}`,
        organization_id: orgId,
        actor_user_id: actorUserId || 'system',
        actor_name: actorName || 'Dispatcher',
        action: 'BOOKING_GUESTS_ALLOCATED',
        entity_type: 'BookingAllocation',
        entity_id: existingAlloc.id,
        after_data: {
          booking_id: bookingId,
          boat_assignment_id: boatAssignmentId,
          guest_count: guestCount,
        },
        created_at: now,
      });

      return existingAlloc;
    });
  }

  /**
   * Remove a booking allocation from a boat
   */
  static async removeAllocation(
    orgId: string,
    allocationId: string,
    actorUserId?: string,
    actorName?: string
  ): Promise<void> {
    return withTransaction((db) => {
      const idx = db.booking_allocations.findIndex((al) => al.id === allocationId && al.organization_id === orgId);
      if (idx === -1) throw new Error('Allocation not found');

      db.booking_allocations.splice(idx, 1);

      db.audit_logs.push({
        id: `audit-${Date.now()}`,
        organization_id: orgId,
        actor_user_id: actorUserId || 'system',
        actor_name: actorName || 'Dispatcher',
        action: 'BOOKING_ALLOCATION_REMOVED',
        entity_type: 'BookingAllocation',
        entity_id: allocationId,
        created_at: new Date().toISOString(),
      });
    });
  }

  /**
   * Get departure allocation board data (unassigned groups, boat cards with guides and allocated guests)
   */
  static getDepartureAllocationBoard(orgId: string, departureId: string) {
    const db = getDatabase();
    const departure = db.departures.find((d) => d.id === departureId && d.organization_id === orgId);
    if (!departure) return null;

    const pkg = db.packages.find((p) => p.id === departure.package_id);

    // Active bookings in this departure
    const validStatuses = ['requested', 'confirmed', 'checked_in'];
    const bookings = db.bookings
      .filter((b) => b.departure_id === departureId && validStatuses.includes(b.booking_status))
      .map((b) => {
        const customer = db.customers.find((c) => c.id === b.customer_id);
        const allocations = db.booking_allocations.filter((al) => al.booking_id === b.id);
        const allocatedSum = allocations.reduce((sum, al) => sum + al.guest_count, 0);
        const unallocatedGuests = Math.max(0, b.guest_count - allocatedSum);

        return {
          ...b,
          customer,
          allocated_count: allocatedSum,
          unallocated_count: unallocatedGuests,
          is_fully_allocated: unallocatedGuests === 0,
        };
      });

    // Boat assignments
    const boatAssignments = db.boat_assignments
      .filter((ba) => ba.departure_id === departureId)
      .map((ba) => {
        const boat = db.boats.find((b) => b.id === ba.boat_id);
        const guide = db.staff_members.find((s) => s.id === ba.guide_id);
        const allocations = db.booking_allocations
          .filter((al) => al.boat_assignment_id === ba.id)
          .map((al) => {
            const booking = db.bookings.find((b) => b.id === al.booking_id);
            const cust = booking ? db.customers.find((c) => c.id === booking.customer_id) : undefined;
            return {
              ...al,
              booking: booking ? { ...booking, customer: cust } : undefined,
            };
          });

        const totalAllocated = allocations.reduce((sum, al) => sum + al.guest_count, 0);

        return {
          ...ba,
          boat,
          guide,
          allocations,
          total_allocated_guests: totalAllocated,
          capacity: boat?.capacity || 8,
          free_seats: Math.max(0, (boat?.capacity || 8) - totalAllocated),
        };
      });

    const allBoats = db.boats.filter((b) => b.organization_id === orgId);
    const allGuides = db.staff_members.filter((s) => s.organization_id === orgId && s.active);

    return {
      departure: {
        ...departure,
        package: pkg,
      },
      bookings,
      unassigned_groups: bookings.filter((b) => b.unallocated_count > 0),
      boat_assignments: boatAssignments,
      available_boats: allBoats,
      available_guides: allGuides,
    };
  }
}
