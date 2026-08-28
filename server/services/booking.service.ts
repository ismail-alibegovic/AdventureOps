import {
  Booking,
  BookingStatus,
  PaymentStatus,
  BookingSource,
  Customer,
  BookingAddonSelection,
  AuditLog,
  SupportedLanguage,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  DepartureStatus,
} from '../../src/types';
import { DatabaseSchema, generateReservationCode, withTransaction, getDatabase } from '../db/database';
import { AvailabilityService } from './availability.service';
import { NotificationService } from './notification.service';

export interface CreateBookingInput {
  organization_id: string;
  package_id: string;
  departure_id: string;
  source?: BookingSource;
  adult_count: number;
  child_count: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  preferred_language: SupportedLanguage;
  customer_note?: string;
  internal_note?: string;
  selected_addon_ids?: Array<{ addon_id: string; quantity: number }>;
  terms_version: string;
  marketing_consent?: boolean;
  idempotency_key?: string;
  created_by_user_id?: string;
  created_by_user_name?: string;
  discount_amount?: number;
}

export class BookingService {
  /**
   * ATOMIC RESERVATION CREATION
   * Guarantees capacity safety under high concurrency using database mutex lock
   */
  static async createBooking(input: CreateBookingInput): Promise<Booking> {
    return withTransaction((db: DatabaseSchema) => {
      // 1. Check idempotency key
      if (input.idempotency_key) {
        const existing = db.bookings.find(
          (b) => b.organization_id === input.organization_id && b.idempotency_key === input.idempotency_key
        );
        if (existing) {
          return existing;
        }
      }

      // 2. Validate package
      const pkg = db.packages.find((p) => p.id === input.package_id && p.organization_id === input.organization_id);
      if (!pkg || !pkg.active) {
        throw new Error('Selected rafting package is not available or active.');
      }

      // 3. Validate guest count
      const totalGuests = Number(input.adult_count) + Number(input.child_count);
      if (totalGuests <= 0) {
        throw new Error('Total guest count must be at least 1.');
      }
      if (input.adult_count < 1) {
        throw new Error('At least 1 adult is required for the reservation.');
      }
      if (pkg.min_guests && totalGuests < pkg.min_guests) {
        throw new Error(`Minimum group size for ${pkg.name_en} is ${pkg.min_guests} guests.`);
      }
      if (pkg.max_guests && totalGuests > pkg.max_guests) {
        throw new Error(`Maximum group size for single booking is ${pkg.max_guests} guests.`);
      }

      // 4. Validate departure and lock/check atomic capacity
      const departure = db.departures.find(
        (d) => d.id === input.departure_id && d.organization_id === input.organization_id
      );
      if (!departure) {
        throw new Error('Selected departure does not exist.');
      }
      if (departure.status !== 'open') {
        throw new Error(`This departure is currently ${departure.status} and not accepting new bookings.`);
      }
      if (departure.operational_status === 'cancelled') {
        throw new Error('This departure has been cancelled due to river/weather conditions.');
      }

      // Check current reserved capacity
      const currentReserved = AvailabilityService.getReservedGuestCount(db, departure.id);
      const remainingCapacity = departure.capacity_limit - currentReserved;

      if (totalGuests > remainingCapacity) {
        throw new Error(
          `Insufficient capacity. Requested ${totalGuests} seats, but only ${remainingCapacity} seats remain for this departure.`
        );
      }

      // 5. Lookup or create normalized customer
      const emailNorm = input.email.trim().toLowerCase();
      const phoneNorm = input.phone.replace(/[^0-9+]/g, '');

      let customer = db.customers.find(
        (c) =>
          c.organization_id === input.organization_id &&
          (c.email_normalized === emailNorm || (phoneNorm && c.phone_normalized === phoneNorm))
      );

      const now = new Date().toISOString();

      if (!customer) {
        customer = {
          id: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          organization_id: input.organization_id,
          first_name: input.first_name.trim(),
          last_name: input.last_name.trim(),
          email: input.email.trim(),
          email_normalized: emailNorm,
          phone: input.phone.trim(),
          phone_normalized: phoneNorm,
          country_code: input.country_code || 'BA',
          preferred_language: input.preferred_language || 'bs',
          bookings_count: 1,
          no_show_count: 0,
          created_at: now,
          updated_at: now,
        };
        db.customers.push(customer);
      } else {
        customer.bookings_count += 1;
        customer.first_name = input.first_name.trim() || customer.first_name;
        customer.last_name = input.last_name.trim() || customer.last_name;
        customer.phone = input.phone.trim() || customer.phone;
        customer.updated_at = now;
      }

      // 6. Calculate Price Snapshots (Packages and Addons)
      const adultPriceSnap = pkg.adult_price;
      const childPriceSnap = pkg.child_price;
      const subtotalBase = input.adult_count * adultPriceSnap + input.child_count * childPriceSnap;

      let addonsTotal = 0;
      const bookingId = `bk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const addonSelections: BookingAddonSelection[] = [];

      if (input.selected_addon_ids && input.selected_addon_ids.length > 0) {
        input.selected_addon_ids.forEach((item) => {
          const addon = db.addons.find((a) => a.id === item.addon_id && a.organization_id === input.organization_id);
          if (addon && addon.active) {
            const qty = item.quantity > 0 ? item.quantity : 1;
            const unitPrice = addon.price;
            const lineTotal = addon.pricing_type === 'per_person' ? unitPrice * totalGuests : unitPrice * qty;
            addonsTotal += lineTotal;

            const selection: BookingAddonSelection = {
              id: `bka-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              organization_id: input.organization_id,
              booking_id: bookingId,
              addon_id: addon.id,
              quantity: addon.pricing_type === 'per_person' ? totalGuests : qty,
              unit_price_snapshot: unitPrice,
              total_price: lineTotal,
            };
            addonSelections.push(selection);
            db.booking_addons.push(selection);
          }
        });
      }

      const discount = input.discount_amount || 0;
      const finalTotal = Math.max(0, subtotalBase + addonsTotal - discount);

      // Check organization settings for confirmation mode (manual vs automatic)
      const orgSettings = db.organization_settings.find((s) => s.organization_id === input.organization_id);
      const isAutoConfirm = orgSettings?.booking_confirmation_mode === 'automatic';
      const initialStatus = isAutoConfirm ? BookingStatus.CONFIRMED : BookingStatus.REQUESTED;

      const reservationCode = generateReservationCode(db);

      const booking: Booking = {
        id: bookingId,
        organization_id: input.organization_id,
        reservation_code: reservationCode,
        customer_id: customer.id,
        departure_id: departure.id,
        package_id: pkg.id,
        source: input.source || BookingSource.WEBSITE,
        adult_count: input.adult_count,
        child_count: input.child_count,
        guest_count: totalGuests,
        adult_price_snapshot: adultPriceSnap,
        child_price_snapshot: childPriceSnap,
        subtotal: subtotalBase + addonsTotal,
        discount_amount: discount,
        total_amount: finalTotal,
        currency: 'BAM',
        booking_status: initialStatus,
        payment_status: PaymentStatus.UNPAID,
        customer_note: input.customer_note,
        internal_note: input.internal_note,
        preferred_language: input.preferred_language || 'bs',
        terms_version: input.terms_version || 'v1.0-2026',
        terms_accepted_at: now,
        marketing_consent: !!input.marketing_consent,
        marketing_consent_at: input.marketing_consent ? now : undefined,
        created_by_user_id: input.created_by_user_id,
        idempotency_key: input.idempotency_key,
        created_at: now,
        updated_at: now,
      };

      db.bookings.push(booking);

      // Update departure status if full
      const newTotalReserved = currentReserved + totalGuests;
      if (newTotalReserved >= departure.capacity_limit) {
        departure.status = DepartureStatus.FULL;
        departure.updated_at = now;
      }

      // Log Audit Entry
      const audit: AuditLog = {
        id: `audit-${Date.now()}`,
        organization_id: input.organization_id,
        actor_user_id: input.created_by_user_id || 'system',
        actor_name: input.created_by_user_name || (input.source === BookingSource.WEBSITE ? 'Online Customer' : 'Staff'),
        action: 'BOOKING_CREATED',
        entity_type: 'Booking',
        entity_id: booking.id,
        after_data: {
          reservation_code: booking.reservation_code,
          guest_count: booking.guest_count,
          total_amount: booking.total_amount,
          booking_status: booking.booking_status,
        },
        created_at: now,
      };
      db.audit_logs.push(audit);

      // Create notification record
      NotificationService.queueBookingNotification(db, booking, customer, departure, pkg, initialStatus === BookingStatus.CONFIRMED ? NotificationType.BOOKING_CONFIRMED : NotificationType.BOOKING_RECEIVED);

      return booking;
    });
  }

  /**
   * Update booking status with validation of allowed state transitions
   */
  static async updateBookingStatus(
    orgId: string,
    bookingId: string,
    newStatus: BookingStatus,
    userId?: string,
    userName?: string,
    internalNote?: string
  ): Promise<Booking> {
    return withTransaction((db) => {
      const booking = db.bookings.find((b) => b.id === bookingId && b.organization_id === orgId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      const prevStatus = booking.booking_status;
      if (prevStatus === newStatus) return booking;

      // Validate transitions
      const allowed: Record<BookingStatus, BookingStatus[]> = {
        [BookingStatus.REQUESTED]: [BookingStatus.CONFIRMED, BookingStatus.REJECTED, BookingStatus.CANCELLED],
        [BookingStatus.CONFIRMED]: [BookingStatus.CHECKED_IN, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
        [BookingStatus.CHECKED_IN]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
        [BookingStatus.COMPLETED]: [],
        [BookingStatus.CANCELLED]: [],
        [BookingStatus.REJECTED]: [],
        [BookingStatus.NO_SHOW]: [],
      };

      if (!allowed[prevStatus].includes(newStatus)) {
        throw new Error(`Invalid status transition from ${prevStatus} to ${newStatus}`);
      }

      const now = new Date().toISOString();
      booking.booking_status = newStatus;
      booking.updated_at = now;
      if (internalNote) {
        booking.internal_note = booking.internal_note
          ? `${booking.internal_note}\n[${now.slice(0, 16)}] ${internalNote}`
          : internalNote;
      }

      // Check if customer no-show count should be incremented
      if (newStatus === BookingStatus.NO_SHOW) {
        const cust = db.customers.find((c) => c.id === booking.customer_id);
        if (cust) {
          cust.no_show_count += 1;
          cust.updated_at = now;
        }
      }

      // Re-evaluate departure status if capacity was freed
      const departure = db.departures.find((d) => d.id === booking.departure_id);
      if (departure) {
        const reserved = AvailabilityService.getReservedGuestCount(db, departure.id);
        if (reserved < departure.capacity_limit && departure.status === DepartureStatus.FULL) {
          departure.status = DepartureStatus.OPEN;
          departure.updated_at = now;
        }
      }

      // Audit log
      db.audit_logs.push({
        id: `audit-${Date.now()}`,
        organization_id: orgId,
        actor_user_id: userId || 'system',
        actor_name: userName || 'Admin',
        action: `BOOKING_STATUS_${newStatus.toUpperCase()}`,
        entity_type: 'Booking',
        entity_id: booking.id,
        before_data: { booking_status: prevStatus },
        after_data: { booking_status: newStatus },
        created_at: now,
      });

      // Send transactional notification if confirmed, rejected or cancelled
      const customer = db.customers.find((c) => c.id === booking.customer_id);
      const pkg = db.packages.find((p) => p.id === booking.package_id);
      if (customer && departure && pkg) {
        if (newStatus === BookingStatus.CONFIRMED) {
          NotificationService.queueBookingNotification(db, booking, customer, departure, pkg, NotificationType.BOOKING_CONFIRMED);
        } else if (newStatus === BookingStatus.REJECTED) {
          NotificationService.queueBookingNotification(db, booking, customer, departure, pkg, NotificationType.BOOKING_REJECTED);
        }
      }

      return booking;
    });
  }

  /**
   * Get rich booking detail with all joined entities
   */
  static getBookingDetail(orgId: string, bookingIdOrCode: string): Booking | null {
    const db = getDatabase();
    const booking = db.bookings.find(
      (b) =>
        b.organization_id === orgId &&
        (b.id === bookingIdOrCode || b.reservation_code.toLowerCase() === bookingIdOrCode.toLowerCase())
    );
    if (!booking) return null;

    const customer = db.customers.find((c) => c.id === booking.customer_id);
    const departure = db.departures.find((d) => d.id === booking.departure_id);
    const pkg = db.packages.find((p) => p.id === booking.package_id);
    const addons = db.booking_addons
      .filter((a) => a.booking_id === booking.id)
      .map((a) => ({
        ...a,
        addon: db.addons.find((ad) => ad.id === a.addon_id),
      }));
    const payments = db.payments.filter((p) => p.booking_id === booking.id);
    const allocations = db.booking_allocations
      .filter((al) => al.booking_id === booking.id)
      .map((al) => ({
        ...al,
        boat_assignment: db.boat_assignments.find((ba) => ba.id === al.boat_assignment_id),
      }));
    const cancellation = db.cancellations.find((c) => c.booking_id === booking.id);

    return {
      ...booking,
      customer,
      departure,
      package: pkg,
      addons,
      payments,
      allocations,
      cancellation,
    };
  }

  /**
   * List bookings with search and filters
   */
  static listBookings(
    orgId: string,
    filters?: {
      search?: string;
      status?: string;
      payment_status?: string;
      source?: string;
      package_id?: string;
      departure_id?: string;
      date?: string;
    }
  ): Booking[] {
    const db = getDatabase();
    let list = db.bookings.filter((b) => b.organization_id === orgId);

    if (filters) {
      if (filters.status) {
        list = list.filter((b) => b.booking_status === filters.status);
      }
      if (filters.payment_status) {
        list = list.filter((b) => b.payment_status === filters.payment_status);
      }
      if (filters.source) {
        list = list.filter((b) => b.source === filters.source);
      }
      if (filters.package_id) {
        list = list.filter((b) => b.package_id === filters.package_id);
      }
      if (filters.departure_id) {
        list = list.filter((b) => b.departure_id === filters.departure_id);
      }
      if (filters.date) {
        list = list.filter((b) => {
          const dep = db.departures.find((d) => d.id === b.departure_id);
          return dep && dep.start_at.startsWith(filters.date!);
        });
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter((b) => {
          if (b.reservation_code.toLowerCase().includes(q)) return true;
          const cust = db.customers.find((c) => c.id === b.customer_id);
          if (cust) {
            if (cust.first_name.toLowerCase().includes(q)) return true;
            if (cust.last_name.toLowerCase().includes(q)) return true;
            if (cust.email.toLowerCase().includes(q)) return true;
            if (cust.phone.includes(q)) return true;
          }
          return false;
        });
      }
    }

    // Enrich items
    return list
      .map((b) => {
        const customer = db.customers.find((c) => c.id === b.customer_id);
        const departure = db.departures.find((d) => d.id === b.departure_id);
        const pkg = db.packages.find((p) => p.id === b.package_id);
        const payments = db.payments.filter((p) => p.booking_id === b.id);
        return {
          ...b,
          customer,
          departure,
          package: pkg,
          payments,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
