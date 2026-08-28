import {
  Booking,
  Customer,
  Departure,
  Package,
  NotificationChannel,
  NotificationRecord,
  NotificationStatus,
  NotificationType,
} from '../../src/types';
import { DatabaseSchema, getDatabase, withTransaction } from '../db/database';

export class NotificationService {
  /**
   * Queue an email notification with bilingual template generation
   */
  static queueBookingNotification(
    db: DatabaseSchema,
    booking: Booking,
    customer: Customer,
    departure: Departure,
    pkg: Package,
    type: NotificationType
  ): NotificationRecord {
    const lang = booking.preferred_language || 'bs';
    const isEn = lang === 'en';

    const depDate = departure.start_at.split('T')[0];
    const depTime = departure.start_at.slice(11, 16);
    const meetingTime = departure.meeting_at.slice(11, 16);

    let subject = '';
    let body = '';

    switch (type) {
      case NotificationType.BOOKING_RECEIVED:
        subject = isEn
          ? `Booking Request Received: ${booking.reservation_code} - Neretva Rafting Konjic`
          : `Zahtjev za rezervaciju primljen: ${booking.reservation_code} - Neretva Rafting Konjic`;
        body = isEn
          ? `Dear ${customer.first_name} ${customer.last_name},\n\n` +
            `Thank you for choosing Neretva Rafting Konjic! We have received your booking request.\n\n` +
            `Reservation Reference: ${booking.reservation_code}\n` +
            `Tour: ${pkg.name_en}\n` +
            `Date: ${depDate}\n` +
            `Meeting Time: ${meetingTime} (Base Džajića Buk, Konjic)\n` +
            `Launch Time: ${depTime}\n` +
            `Guests: ${booking.guest_count} (${booking.adult_count} Adults, ${booking.child_count} Children)\n` +
            `Total Amount: ${booking.total_amount} BAM (Payment on site upon arrival)\n\n` +
            `Our dispatch team is reviewing your date and will confirm your booking shortly. If you have any urgent questions, feel free to reach out via WhatsApp at +387 61 123 456.`
          : `Poštovani ${customer.first_name} ${customer.last_name},\n\n` +
            `Hvala vam na ukazanom povjerenju! Vaš zahtjev za rezervaciju je uspješno zaprimljen.\n\n` +
            `Broj rezervacije: ${booking.reservation_code}\n` +
            `Tura: ${pkg.name_bs}\n` +
            `Datum: ${depDate}\n` +
            `Vrijeme dolaska na bazu: ${meetingTime} (Baza Džajića Buk, Konjic)\n` +
            `Vrijeme polaska na rijeku: ${depTime}\n` +
            `Broj gostiju: ${booking.guest_count} (${booking.adult_count} odraslih, ${booking.child_count} djece)\n` +
            `Ukupan iznos: ${booking.total_amount} BAM (Plaćanje na bazi prije spusta)\n\n` +
            `Naš tim će ubrzo potvrditi vaš termin. Za sva pitanja stojimo vam na raspolaganju na WhatsApp +387 61 123 456.`;
        break;

      case NotificationType.BOOKING_CONFIRMED:
        subject = isEn
          ? `Booking Confirmed: ${booking.reservation_code} - See you on the Neretva!`
          : `Rezervacija POTVRĐENA: ${booking.reservation_code} - Vidimo se na Neretvi!`;
        body = isEn
          ? `Dear ${customer.first_name},\n\n` +
            `Great news! Your rafting reservation has been CONFIRMED.\n\n` +
            `Reservation Code: ${booking.reservation_code}\n` +
            `Adventure: ${pkg.name_en}\n` +
            `Date: ${depDate}\n` +
            `Meeting Time at Base: ${meetingTime}\n` +
            `Launch Time: ${depTime}\n` +
            `Total Guests: ${booking.guest_count}\n` +
            `Total Price: ${booking.total_amount} BAM\n` +
            `Location: Neretva Rafting Base (Džajići bb, 88400 Konjic)\n` +
            `Google Maps: https://maps.google.com/?q=43.6492,17.9628\n\n` +
            `What to bring: Swimwear, dry towel, sunscreen, and dry clothes for after the trip. Neoprene suits, booties, life vests, and helmets are fully provided.\n\n` +
            `See you on the river!`
          : `Poštovani ${customer.first_name},\n\n` +
            `Vaša rezervacija za rafting je zvanično POTVRĐENA!\n\n` +
            `Broj rezervacije: ${booking.reservation_code}\n` +
            `Izabrana tura: ${pkg.name_bs}\n` +
            `Datum: ${depDate}\n` +
            `Dolazak na bazu: ${meetingTime}\n` +
            `Polazak na rafting: ${depTime}\n` +
            `Broj osoba: ${booking.guest_count}\n` +
            `Ukupna cijena: ${booking.total_amount} BAM\n` +
            `Lokacija: Baza Džajića Buk (Džajići bb, 88400 Konjic)\n` +
            `Google Maps link: https://maps.google.com/?q=43.6492,17.9628\n\n` +
            `Šta ponijeti: Kupaći kostim, peškir, suhu presvlaku i kremu za sunčanje. Kompletna neoprenska oprema, čizmice, kacige i prsluci vas čekaju na bazi.\n\n` +
            `Radujemo se druženju na Neretvi!`;
        break;

      case NotificationType.BOOKING_REJECTED:
        subject = isEn
          ? `Update regarding your booking request ${booking.reservation_code}`
          : `Obavijest o vašem zahtjevu za rezervaciju ${booking.reservation_code}`;
        body = isEn
          ? `Dear ${customer.first_name},\n\n` +
            `Unfortunately, we are unable to accommodate your booking request for ${depDate} at ${depTime} due to fully booked capacity or operational constraints.\n\n` +
            `We sincerely apologize for the inconvenience. Please contact us via WhatsApp at +387 61 123 456 to check alternative departure slots.`
          : `Poštovani ${customer.first_name},\n\n` +
            `Nažalost, nismo u mogućnosti potvrditi vaš zahtjev za termin ${depDate} u ${depTime} zbog popunjenosti kapaciteta ili operativnih razloga.\n\n` +
            `Izvinjavamo se na neprijatnosti. Javite nam se na WhatsApp +387 61 123 456 kako bismo pronašli odgovarajući alternativni termin.`;
        break;

      case NotificationType.BOOKING_CANCELLED:
        subject = isEn
          ? `Booking Cancelled: ${booking.reservation_code}`
          : `Rezervacija otkazana: ${booking.reservation_code}`;
        body = isEn
          ? `Dear ${customer.first_name},\n\n` +
            `Your booking ${booking.reservation_code} for ${depDate} has been cancelled.\n\n` +
            `If this was done in error or you wish to rebook, please visit our website or contact us.`
          : `Poštovani ${customer.first_name},\n\n` +
            `Vaša rezervacija ${booking.reservation_code} za datum ${depDate} je otkazana.\n\n` +
            `Ako je došlo do greške ili želite novi termin, slobodno nas kontaktirajte.`;
        break;

      case NotificationType.DEPARTURE_CANCELLED:
        subject = isEn
          ? `URGENT: River Trip Cancelled due to conditions - ${booking.reservation_code}`
          : `VAŽNO: Otkazivanje rafting polaska usljed uslova na rijeci - ${booking.reservation_code}`;
        body = isEn
          ? `Dear ${customer.first_name},\n\n` +
            `Due to adverse weather or water discharge conditions on the Neretva River, the scheduled departure on ${depDate} at ${depTime} has been cancelled for guest safety.\n\n` +
            `Please contact our team at +387 61 123 456 for rescheduling options.`
          : `Poštovani ${customer.first_name},\n\n` +
            `Zbog vremenskih prilika ili vodostaja na rijeci Neretvi, polazak na dan ${depDate} u ${depTime} je otkazan radi sigurnosti svih učesnika.\n\n` +
            `Molimo vas da nas kontaktirate na +387 61 123 456 radi dogovora o novom terminu.`;
        break;

      default:
        subject = `Neretva Rafting Konjic - Update for ${booking.reservation_code}`;
        body = `Booking update for ${booking.reservation_code}.`;
    }

    const now = new Date().toISOString();
    const notification: NotificationRecord = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      organization_id: booking.organization_id,
      booking_id: booking.id,
      departure_id: departure.id,
      channel: NotificationChannel.EMAIL,
      notification_type: type,
      recipient: customer.email,
      subject,
      content: body,
      status: NotificationStatus.SENT, // marked as sent in transactional outbox
      scheduled_for: now,
      sent_at: now,
      created_at: now,
    };

    db.notifications.push(notification);
    return notification;
  }

  /**
   * Generate one-click WhatsApp action URL with pre-filled localized message
   */
  static generateWhatsAppUrl(booking: Booking, customer: Customer, departure?: Departure): string {
    const rawPhone = customer.phone.replace(/[^0-9]/g, '');
    const lang = booking.preferred_language || 'bs';
    const isEn = lang === 'en';

    const depDate = departure?.start_at.split('T')[0] || '';
    const depTime = departure?.start_at.slice(11, 16) || '';

    const text = isEn
      ? `Hello ${customer.first_name}, this is Neretva Rafting Konjic regarding your booking ${booking.reservation_code} for ${depDate} at ${depTime}. How can we assist you?`
      : `Pozdrav ${customer.first_name}, ovdje Neretva Rafting Konjic u vezi vaše rezervacije ${booking.reservation_code} za datum ${depDate} u ${depTime}. Kako vam možemo pomoći?`;

    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Get all notification history
   */
  static listNotifications(orgId: string, bookingId?: string): NotificationRecord[] {
    const db = getDatabase();
    return db.notifications
      .filter((n) => {
        if (n.organization_id !== orgId) return false;
        if (bookingId && n.booking_id !== bookingId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
