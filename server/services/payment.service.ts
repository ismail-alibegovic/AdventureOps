import { DatabaseSchema, getDatabase, withTransaction } from '../db/database';
import { Payment, PaymentMethod, PaymentStatus, AuditLog } from '../../src/types';

export interface RecordPaymentInput {
  organization_id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  collected_by_user_id?: string;
  collected_by_user_name?: string;
}

export class PaymentService {
  /**
   * Record a payment against a booking (offline cash, card terminal, bank transfer, etc.)
   * Supports partial payments and updates payment_status derived from sum of payments.
   */
  static async recordPayment(input: RecordPaymentInput): Promise<{ payment: Payment; payment_status: PaymentStatus; total_paid: number; balance_due: number }> {
    return withTransaction((db: DatabaseSchema) => {
      const booking = db.bookings.find((b) => b.id === input.booking_id && b.organization_id === input.organization_id);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (input.amount <= 0) {
        throw new Error('Payment amount must be greater than 0 BAM.');
      }

      const now = new Date().toISOString();
      const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      const newPayment: Payment = {
        id: paymentId,
        organization_id: input.organization_id,
        booking_id: input.booking_id,
        amount: input.amount,
        currency: booking.currency || 'BAM',
        method: input.method,
        reference: input.reference?.trim(),
        notes: input.notes?.trim(),
        collected_by_user_id: input.collected_by_user_id,
        collected_by_user_name: input.collected_by_user_name || 'Staff',
        collected_at: now,
        created_at: now,
      };

      db.payments.push(newPayment);

      // Recompute payment status for this booking
      const allPayments = db.payments.filter((p) => p.booking_id === booking.id);
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

      let newStatus: PaymentStatus = PaymentStatus.UNPAID;
      if (totalPaid >= booking.total_amount) {
        newStatus = PaymentStatus.PAID;
      } else if (totalPaid > 0) {
        newStatus = PaymentStatus.PARTIAL;
      }

      booking.payment_status = newStatus;
      booking.updated_at = now;

      // Audit log
      db.audit_logs.push({
        id: `audit-${Date.now()}`,
        organization_id: input.organization_id,
        actor_user_id: input.collected_by_user_id || 'system',
        actor_name: input.collected_by_user_name || 'Staff',
        action: 'PAYMENT_RECORDED',
        entity_type: 'Payment',
        entity_id: paymentId,
        after_data: {
          booking_id: booking.id,
          amount: input.amount,
          method: input.method,
          total_paid: totalPaid,
          total_booking: booking.total_amount,
          new_payment_status: newStatus,
        },
        created_at: now,
      });

      const balanceDue = Math.max(0, booking.total_amount - totalPaid);

      return {
        payment: newPayment,
        payment_status: newStatus,
        total_paid: totalPaid,
        balance_due: balanceDue,
      };
    });
  }

  /**
   * Get payments for a booking
   */
  static getBookingPayments(orgId: string, bookingId: string): Payment[] {
    const db = getDatabase();
    return db.payments
      .filter((p) => p.booking_id === bookingId && p.organization_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
