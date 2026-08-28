import {
  Package,
  Addon,
  Departure,
  Booking,
  Customer,
  Boat,
  StaffMember,
  AuditLog,
  NotificationRecord,
  CMSContent,
  FAQItem,
  GalleryItem,
  OrganizationSettings,
  UserAccount,
} from '../types';

export const apiClient = {
  // Public
  async getCms(): Promise<{
    content: CMSContent;
    faqs: FAQItem[];
    gallery: GalleryItem[];
    packages: Package[];
    addons: Addon[];
    settings: OrganizationSettings;
  }> {
    const res = await fetch('/api/public/cms');
    if (!res.ok) throw new Error('Failed to fetch CMS');
    return res.json();
  },

  async getPackages(): Promise<Package[]> {
    const res = await fetch('/api/public/packages');
    if (!res.ok) throw new Error('Failed to fetch packages');
    return res.json();
  },

  async getAddons(): Promise<Addon[]> {
    const res = await fetch('/api/public/addons');
    if (!res.ok) throw new Error('Failed to fetch add-ons');
    return res.json();
  },

  async getDepartures(packageId?: string, date?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (packageId) params.append('packageId', packageId);
    if (date) params.append('date', date);
    const res = await fetch(`/api/public/departures?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch departures');
    return res.json();
  },

  async getCalendarAvailability(packageId: string, year: number, month: number): Promise<Array<{ date: string; has_availability: boolean; spots_left: number }>> {
    const res = await fetch(`/api/public/calendar-availability?packageId=${packageId}&year=${year}&month=${month}`);
    if (!res.ok) throw new Error('Failed to fetch calendar availability');
    return res.json();
  },

  async createPublicBooking(data: any): Promise<Booking> {
    const res = await fetch('/api/public/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Booking failed');
    return json;
  },

  async getPublicBooking(codeOrId: string): Promise<Booking> {
    const res = await fetch(`/api/public/bookings/${encodeURIComponent(codeOrId)}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Booking not found');
    return json;
  },

  // Admin
  async getAdminUsers(): Promise<UserAccount[]> {
    const res = await fetch('/api/admin/auth/users');
    return res.json();
  },

  async getAdminDashboard(): Promise<any> {
    const res = await fetch('/api/admin/dashboard');
    return res.json();
  },

  async getDailyBoard(date?: string): Promise<any[]> {
    const url = date ? `/api/admin/departures/daily-board?date=${date}` : '/api/admin/departures/daily-board';
    const res = await fetch(url);
    return res.json();
  },

  async getDepartureDetail(id: string): Promise<any> {
    const res = await fetch(`/api/admin/departures/${id}`);
    if (!res.ok) throw new Error('Departure not found');
    return res.json();
  },

  async createDeparture(data: any): Promise<Departure> {
    const res = await fetch('/api/admin/departures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create departure');
    return json;
  },

  async updateDeparture(id: string, updates: any): Promise<Departure> {
    const res = await fetch(`/api/admin/departures/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update departure');
    return json;
  },

  async cancelDeparture(id: string, data: { reason: string; user_id?: string; user_name?: string }): Promise<any> {
    const res = await fetch(`/api/admin/departures/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to cancel departure');
    return json;
  },

  async generateFromTemplates(start_date: string, end_date: string): Promise<any> {
    const res = await fetch('/api/admin/departures/generate-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_date, end_date }),
    });
    return res.json();
  },

  async assignBoat(departureId: string, data: { boat_id: string; guide_id?: string; user_id?: string; user_name?: string }): Promise<any> {
    const res = await fetch(`/api/admin/departures/${departureId}/assign-boat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to assign boat');
    return json;
  },

  async updateAssignmentGuide(assignmentId: string, data: { guide_id?: string; user_id?: string; user_name?: string }): Promise<any> {
    const res = await fetch(`/api/admin/boat-assignments/${assignmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update guide');
    return json;
  },

  async removeBoatAssignment(assignmentId: string): Promise<any> {
    const res = await fetch(`/api/admin/boat-assignments/${assignmentId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async allocateGuests(data: { booking_id: string; boat_assignment_id: string; guest_count: number; user_id?: string; user_name?: string }): Promise<any> {
    const res = await fetch('/api/admin/allocations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Allocation failed');
    return json;
  },

  async removeAllocation(allocationId: string): Promise<any> {
    const res = await fetch(`/api/admin/allocations/${allocationId}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async getBookings(filters?: any): Promise<Booking[]> {
    const params = new URLSearchParams(filters || {});
    const res = await fetch(`/api/admin/bookings?${params.toString()}`);
    return res.json();
  },

  async getBookingDetail(id: string): Promise<Booking> {
    const res = await fetch(`/api/admin/bookings/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Booking not found');
    return json;
  },

  async createManualBooking(data: any): Promise<Booking> {
    const res = await fetch('/api/admin/bookings/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create manual booking');
    return json;
  },

  async createAdminBooking(data: any): Promise<Booking> {
    return this.createManualBooking(data);
  },

  async updateBookingStatus(id: string, data: { status: string; user_id?: string; user_name?: string; internal_note?: string }): Promise<Booking> {
    const res = await fetch(`/api/admin/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update booking status');
    return json;
  },

  async recordPayment(bookingId: string, data: any): Promise<any> {
    const res = await fetch(`/api/admin/bookings/${bookingId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Payment recording failed');
    return json;
  },

  async cancelBooking(bookingId: string, data: any): Promise<any> {
    const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Cancellation failed');
    return json;
  },

  async getBoats(): Promise<Boat[]> {
    const res = await fetch('/api/admin/boats');
    return res.json();
  },

  async saveBoat(data: Partial<Boat>): Promise<Boat> {
    const res = await fetch('/api/admin/boats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async createBoat(data: any): Promise<Boat> {
    return this.saveBoat(data);
  },

  async getStaff(): Promise<StaffMember[]> {
    const res = await fetch('/api/admin/staff');
    return res.json();
  },

  async saveStaff(data: Partial<StaffMember>): Promise<StaffMember> {
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async createStaff(data: any): Promise<StaffMember> {
    return this.saveStaff(data);
  },

  async getCustomers(search?: string): Promise<Customer[]> {
    const url = search ? `/api/admin/customers?search=${encodeURIComponent(search)}` : '/api/admin/customers';
    const res = await fetch(url);
    return res.json();
  },

  async getCustomerDetail(id: string): Promise<any> {
    const res = await fetch(`/api/admin/customers/${id}`);
    return res.json();
  },

  async getReports(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const res = await fetch(`/api/admin/reports?${params.toString()}`);
    return res.json();
  },

  async getReportsSummary(startDate?: string, endDate?: string): Promise<any> {
    return this.getReports(startDate, endDate);
  },

  async getAuditLogs(entityFilter?: string): Promise<AuditLog[]> {
    const url = entityFilter ? `/api/admin/audit-logs?entityType=${encodeURIComponent(entityFilter)}` : '/api/admin/audit-logs';
    const res = await fetch(url);
    return res.json();
  },

  async getNotifications(bookingId?: string): Promise<NotificationRecord[]> {
    const url = bookingId ? `/api/admin/notifications?bookingId=${bookingId}` : '/api/admin/notifications';
    const res = await fetch(url);
    return res.json();
  },

  async getSettings(): Promise<OrganizationSettings | any> {
    const cms = await this.getCms();
    return cms.settings || {};
  },

  async updateCmsContent(content: any): Promise<any> {
    const res = await fetch('/api/admin/cms/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    return res.json();
  },

  async updateSettings(settings: any): Promise<any> {
    const res = await fetch('/api/admin/cms/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  async saveFaq(data: any): Promise<any> {
    const res = await fetch('/api/admin/cms/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteFaq(id: string): Promise<any> {
    const res = await fetch(`/api/admin/cms/faqs/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async runTests(): Promise<any> {
    const res = await fetch('/api/tests/run', { method: 'POST' });
    return res.json();
  },
};
