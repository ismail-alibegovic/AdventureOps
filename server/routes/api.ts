import { Router, Request, Response } from 'express';
import { DEFAULT_ORG_ID, getDatabase } from '../db/database';
import { AvailabilityService } from '../services/availability.service';
import { BookingService } from '../services/booking.service';
import { AllocationService } from '../services/allocation.service';
import { PaymentService } from '../services/payment.service';
import { CancellationService } from '../services/cancellation.service';
import { DepartureService } from '../services/departure.service';
import { NotificationService } from '../services/notification.service';
import { ReportService } from '../services/report.service';
import { CmsService } from '../services/cms.service';
import { AuthService } from '../services/auth.service';
import { BookingStatus, BookingSource, PaymentMethod, CancellationReason, CancellationFeeStatus } from '../../src/types';
import { runAllTests } from '../tests/suite';

export const apiRouter = Router();

// Middleware helper to extract orgId
function getOrgId(req: Request): string {
  return (req.query.orgId as string) || (req.headers['x-organization-id'] as string) || DEFAULT_ORG_ID;
}

// -------------------------------------------------------------
// PUBLIC ENDPOINTS
// -------------------------------------------------------------

apiRouter.get('/public/cms', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const data = CmsService.getCmsData(orgId);
  res.json(data);
});

apiRouter.get('/public/packages', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDatabase();
  const pkgs = db.packages.filter((p) => p.organization_id === orgId && p.active).sort((a, b) => a.sort_order - b.sort_order);
  res.json(pkgs);
});

apiRouter.get('/public/addons', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDatabase();
  const addons = db.addons.filter((a) => a.organization_id === orgId && a.active).sort((a, b) => a.sort_order - b.sort_order);
  res.json(addons);
});

apiRouter.get('/public/departures', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const packageId = req.query.packageId as string;
  const date = req.query.date as string;
  const departures = AvailabilityService.getPublicDepartures(orgId, packageId, date);
  res.json(departures);
});

apiRouter.get('/public/calendar-availability', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const packageId = req.query.packageId as string;
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

  const dates = AvailabilityService.getAvailableDatesForMonth(orgId, packageId, year, month);
  res.json(dates);
});

apiRouter.post('/public/bookings', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const body = req.body;

    // Honeypot spam check
    if (body.website_trap_honeypot) {
      return res.status(400).json({ error: 'Bot detected' });
    }

    const booking = await BookingService.createBooking({
      organization_id: orgId,
      package_id: body.package_id,
      departure_id: body.departure_id,
      source: BookingSource.WEBSITE,
      adult_count: Number(body.adult_count),
      child_count: Number(body.child_count || 0),
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      country_code: body.country_code || 'BA',
      preferred_language: body.preferred_language || 'bs',
      customer_note: body.customer_note,
      selected_addon_ids: body.selected_addon_ids,
      terms_version: body.terms_version || 'v1.0-2026',
      marketing_consent: !!body.marketing_consent,
      idempotency_key: body.idempotency_key || req.headers['idempotency-key'] as string,
    });

    const fullDetail = BookingService.getBookingDetail(orgId, booking.id);
    res.status(201).json(fullDetail);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create reservation' });
  }
});

apiRouter.get('/public/bookings/:codeOrId', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const codeOrId = req.params.codeOrId;
  const booking = BookingService.getBookingDetail(orgId, codeOrId);

  if (!booking) {
    return res.status(404).json({ error: 'Booking reservation not found' });
  }

  // Sanitize internal staff notes from public query
  const safeBooking = {
    ...booking,
    internal_note: undefined,
  };

  res.json(safeBooking);
});

// -------------------------------------------------------------
// ADMIN AUTH & USERS
// -------------------------------------------------------------

apiRouter.get('/admin/auth/users', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const users = AuthService.listUsers(orgId);
  res.json(users);
});

// -------------------------------------------------------------
// ADMIN DASHBOARD & DAILY BOARD
// -------------------------------------------------------------

apiRouter.get('/admin/dashboard', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const todayStr = new Date().toISOString().split('T')[0];
  const db = getDatabase();

  const dayBoard = DepartureService.getDailyOperationsBoard(orgId, todayStr);
  const metrics = ReportService.getMetrics(orgId);

  const pendingConfirmations = db.bookings.filter(
    (b) => b.organization_id === orgId && b.booking_status === BookingStatus.REQUESTED
  ).length;

  const todayBookings = db.bookings.filter((b) => {
    const dep = db.departures.find((d) => d.id === b.departure_id);
    return dep && dep.start_at.startsWith(todayStr);
  });

  const todayGuests = todayBookings.reduce((sum, b) => sum + b.guest_count, 0);

  res.json({
    today_date: todayStr,
    today_departures: dayBoard,
    today_guests_count: todayGuests,
    today_bookings_count: todayBookings.length,
    pending_confirmations: pendingConfirmations,
    report_metrics: metrics,
  });
});

apiRouter.get('/admin/departures/daily-board', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const board = DepartureService.getDailyOperationsBoard(orgId, dateStr);
  res.json(board);
});

apiRouter.get('/admin/departures/:id', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const boardData = AllocationService.getDepartureAllocationBoard(orgId, req.params.id);
  if (!boardData) return res.status(404).json({ error: 'Departure not found' });
  res.json(boardData);
});

apiRouter.post('/admin/departures', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const departure = await DepartureService.createDeparture({
      organization_id: orgId,
      ...req.body,
    });
    res.status(201).json(departure);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.patch('/admin/departures/:id', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const updated = await DepartureService.updateDeparture(orgId, req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/departures/generate-templates', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { start_date, end_date } = req.body;
    const result = await DepartureService.generateFromTemplates(orgId, start_date, end_date);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/departures/:id/cancel', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { reason, user_id, user_name } = req.body;
    const result = await CancellationService.cancelDeparture(orgId, req.params.id, reason || 'Weather conditions', user_id, user_name);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// BOAT ASSIGNMENTS & GROUP SPLITTING
// -------------------------------------------------------------

apiRouter.post('/admin/departures/:id/assign-boat', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { boat_id, guide_id, user_id, user_name } = req.body;
    const assignment = await AllocationService.assignBoatToDeparture(orgId, req.params.id, boat_id, guide_id, user_id, user_name);
    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.patch('/admin/boat-assignments/:id', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { guide_id, user_id, user_name } = req.body;
    const updated = await AllocationService.updateAssignmentGuide(orgId, req.params.id, guide_id, user_id, user_name);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/admin/boat-assignments/:id', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { user_id, user_name } = req.body || {};
    await AllocationService.removeBoatAssignment(orgId, req.params.id, user_id, user_name);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/allocations', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { booking_id, boat_assignment_id, guest_count, user_id, user_name } = req.body;
    const alloc = await AllocationService.allocateGuestsToBoat(
      orgId,
      booking_id,
      boat_assignment_id,
      Number(guest_count),
      user_id,
      user_name
    );
    res.json(alloc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/admin/allocations/:id', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { user_id, user_name } = req.body || {};
    await AllocationService.removeAllocation(orgId, req.params.id, user_id, user_name);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN BOOKINGS MANAGEMENT
// -------------------------------------------------------------

apiRouter.get('/admin/bookings', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const bookings = BookingService.listBookings(orgId, req.query as any);
  res.json(bookings);
});

apiRouter.get('/admin/bookings/:id', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const booking = BookingService.getBookingDetail(orgId, req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
});

apiRouter.post('/admin/bookings/manual', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const booking = await BookingService.createBooking({
      organization_id: orgId,
      ...req.body,
      source: req.body.source || BookingSource.PHONE,
    });
    const detail = BookingService.getBookingDetail(orgId, booking.id);
    res.status(201).json(detail);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.patch('/admin/bookings/:id/status', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { status, user_id, user_name, internal_note } = req.body;
    const updated = await BookingService.updateBookingStatus(
      orgId,
      req.params.id,
      status as BookingStatus,
      user_id,
      user_name,
      internal_note
    );
    const detail = BookingService.getBookingDetail(orgId, updated.id);
    res.json(detail);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/bookings/:id/payments', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { amount, method, reference, notes, user_id, user_name } = req.body;
    const result = await PaymentService.recordPayment({
      organization_id: orgId,
      booking_id: req.params.id,
      amount: Number(amount),
      method: (method as PaymentMethod) || PaymentMethod.CASH,
      reference,
      notes,
      collected_by_user_id: user_id,
      collected_by_user_name: user_name,
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/bookings/:id/cancel', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { reason_code, reason_text, fee_amount, fee_status, user_id, user_name } = req.body;
    const result = await CancellationService.cancelBooking({
      organization_id: orgId,
      booking_id: req.params.id,
      cancelled_by_type: 'admin',
      cancelled_by_user_id: user_id,
      cancelled_by_user_name: user_name,
      reason_code: (reason_code as CancellationReason) || CancellationReason.CUSTOMER_CANCELLED,
      reason_text,
      fee_amount: Number(fee_amount || 0),
      fee_status: (fee_status as CancellationFeeStatus) || CancellationFeeStatus.WAIVED,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN BOATS, STAFF & CUSTOMERS
// -------------------------------------------------------------

apiRouter.get('/admin/boats', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDatabase();
  res.json(db.boats.filter((b) => b.organization_id === orgId));
});

apiRouter.post('/admin/boats', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const boat = await CmsService.upsertBoat(orgId, req.body);
    res.status(201).json(boat);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/admin/staff', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDatabase();
  res.json(db.staff_members.filter((s) => s.organization_id === orgId));
});

apiRouter.post('/admin/staff', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const staff = await CmsService.upsertStaff(orgId, req.body);
    res.status(201).json(staff);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/admin/customers', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDatabase();
  res.json(db.customers.filter((c) => c.organization_id === orgId));
});

apiRouter.get('/admin/customers/:id', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDatabase();
  const cust = db.customers.find((c) => c.id === req.params.id && c.organization_id === orgId);
  if (!cust) return res.status(404).json({ error: 'Customer not found' });

  const bookings = db.bookings
    .filter((b) => b.customer_id === cust.id)
    .map((b) => ({
      ...b,
      departure: db.departures.find((d) => d.id === b.departure_id),
      package: db.packages.find((p) => p.id === b.package_id),
      payments: db.payments.filter((p) => p.booking_id === b.id),
    }));

  res.json({
    ...cust,
    bookings,
  });
});

// -------------------------------------------------------------
// NOTIFICATIONS & AUDIT LOGS
// -------------------------------------------------------------

apiRouter.get('/admin/notifications', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const bookingId = req.query.bookingId as string;
  const list = NotificationService.listNotifications(orgId, bookingId);
  res.json(list);
});

apiRouter.get('/admin/audit-logs', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const db = getDatabase();
  const logs = db.audit_logs
    .filter((a) => a.organization_id === orgId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(logs);
});

// -------------------------------------------------------------
// REPORTS & EXPORTS
// -------------------------------------------------------------

apiRouter.get('/admin/reports', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const metrics = ReportService.getMetrics(orgId, startDate, endDate);
  res.json(metrics);
});

apiRouter.get('/admin/reports/export/bookings.csv', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const csv = ReportService.exportBookingsCsv(orgId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="bookings_export.csv"');
  res.send(csv);
});

apiRouter.get('/admin/reports/export/payments.csv', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const csv = ReportService.exportPaymentsCsv(orgId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="payments_export.csv"');
  res.send(csv);
});

// -------------------------------------------------------------
// CMS CONTENT & FAQS & GALLERY
// -------------------------------------------------------------

apiRouter.get('/admin/cms', (req: Request, res: Response) => {
  const orgId = getOrgId(req);
  const data = CmsService.getCmsData(orgId);
  res.json(data);
});

apiRouter.patch('/admin/cms/content', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const updated = await CmsService.updateCmsContent(orgId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.patch('/admin/cms/settings', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const updated = await CmsService.updateSettings(orgId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/cms/faqs', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const faq = await CmsService.upsertFaq(orgId, req.body);
    res.status(201).json(faq);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/admin/cms/faqs/:id', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    await CmsService.deleteFaq(orgId, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/cms/gallery', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const item = await CmsService.addGalleryItem(orgId, req.body);
    res.status(201).json(item);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/admin/cms/gallery/:id', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    await CmsService.deleteGalleryItem(orgId, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/cms/packages', async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const pkg = await CmsService.upsertPackage(orgId, req.body);
    res.status(201).json(pkg);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// TEST RUNNER
// -------------------------------------------------------------

apiRouter.post('/tests/run', async (_req: Request, res: Response) => {
  try {
    const results = await runAllTests();
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
