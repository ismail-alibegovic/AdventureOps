import fs from 'fs';
import path from 'path';
import {
  Organization,
  OrganizationSettings,
  StaffMember,
  UserAccount,
  UserRole,
  MeetingLocation,
  Package,
  Addon,
  Departure,
  DepartureTemplate,
  Customer,
  Booking,
  BookingAddonSelection,
  Boat,
  BoatAssignment,
  BookingAllocation,
  Payment,
  Cancellation,
  NotificationRecord,
  AuditLog,
  FAQItem,
  GalleryItem,
  CMSContent,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  DepartureStatus,
  OperationalStatus,
  BoatStatus,
  BookingSource,
  PricingType,
  CancellationReason,
  CancellationFeeStatus,
  NotificationChannel,
  NotificationType,
  NotificationStatus,
} from '../../src/types';

const DB_FILE_PATH = path.join(process.cwd(), 'data_rafting_konjic.json');

export interface DatabaseSchema {
  version: number;
  organizations: Organization[];
  organization_settings: OrganizationSettings[];
  staff_members: StaffMember[];
  user_accounts: UserAccount[];
  meeting_locations: MeetingLocation[];
  packages: Package[];
  addons: Addon[];
  departure_templates: DepartureTemplate[];
  departures: Departure[];
  customers: Customer[];
  bookings: Booking[];
  booking_addons: BookingAddonSelection[];
  boats: Boat[];
  boat_assignments: BoatAssignment[];
  booking_allocations: BookingAllocation[];
  payments: Payment[];
  cancellations: Cancellation[];
  notifications: NotificationRecord[];
  audit_logs: AuditLog[];
  faqs: FAQItem[];
  gallery_items: GalleryItem[];
  cms_content: Record<string, CMSContent>;
  reservation_counter: number;
}

// In-Memory state with write-through persistence
let dbState: DatabaseSchema | null = null;

// Mutex for atomic capacity checks and booking transactions
class AsyncLock {
  private queue: Array<() => void> = [];
  private locked = false;

  async acquire(): Promise<() => void> {
    return new Promise((resolve) => {
      const run = () => {
        this.locked = true;
        resolve(() => {
          this.locked = false;
          const next = this.queue.shift();
          if (next) next();
        });
      };

      if (!this.locked) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }
}

const dbLock = new AsyncLock();

export const DEFAULT_ORG_ID = 'org-konjic-rafting-01';

export function getInitialSeedData(): DatabaseSchema {
  const now = new Date().toISOString();
  const orgId = DEFAULT_ORG_ID;

  const meetingLoc1: MeetingLocation = {
    id: 'loc-konjic-base-01',
    organization_id: orgId,
    name: 'Neretva Rafting Base Konjic (Baza Džajića Buk)',
    address: 'Džajići bb, 88400 Konjic, Bosna i Hercegovina',
    latitude: 43.6492,
    longitude: 17.9628,
    instructions_bs: 'Doček na našoj bazi pored Neretve 45 minuta prije polaska. Obezbijeđen besplatan siguran parking, svlačionice, tuševi i toaleti.',
    instructions_en: 'Welcome at our rafting base by the Neretva River 45 minutes prior to departure. Free secure parking, dressing rooms, showers, and restrooms provided.',
    maps_url: 'https://maps.google.com/?q=43.6492,17.9628',
    active: true,
  };

  const meetingLoc2: MeetingLocation = {
    id: 'loc-konjic-bridge-02',
    organization_id: orgId,
    name: 'Stari Most Konjic - Meeting Point',
    address: 'Ulica Maršala Tita bb, 88400 Konjic',
    latitude: 43.6508,
    longitude: 17.9614,
    instructions_bs: 'Mjesto sastanka kod Starog mosta za goste sa organizovanim transferom.',
    instructions_en: 'Meeting point at Old Stone Bridge for guests requesting shuttle pickup.',
    maps_url: 'https://maps.google.com/?q=43.6508,17.9614',
    active: true,
  };

  const package1: Package = {
    id: 'pkg-neretva-classic',
    organization_id: orgId,
    slug: 'neretva-classic-canyon-rafting',
    name_bs: 'Klasični Rafting Neretvom (Glavatičevo – Konjic)',
    name_en: 'Classic Neretva Canyon Rafting (Glavatičevo – Konjic)',
    short_description_bs: 'Najpopularnija avantura kroz netaknutu prirodu i veličanstveni kanjon Neretve. 23 km spusta.',
    short_description_en: 'The signature rafting adventure through the pristine Rakitnica confluence and Neretva canyon. 23 km descent.',
    description_bs: 'Iskusite nezaboravno rafting putovanje od Glavatičeva do Konjica u dužini od 23 km. Prolazite kroz impresivne kanjone, ušće rijeke Rakitnice, brzake III-IV kategorije, sa pauzama za kupanje pod vodopadima i tradicionalni BBQ roštilj na obali.',
    description_en: 'Experience an unforgettable 23-kilometer rafting journey from Glavatičevo to Konjic. Navigate through breath-taking canyons, the Rakitnica river mouth, Class III-IV rapids, with swim stops under mountain waterfalls and a riverside barbecue.',
    duration_minutes: 360,
    adult_price: 90, // 90 BAM (~45 EUR)
    child_price: 60, // 60 BAM
    min_guests: 1,
    max_guests: 60,
    minimum_age: 6,
    difficulty: 'Moderate',
    featured: true,
    active: true,
    meeting_location_id: meetingLoc1.id,
    included_items_json: [
      'Kompletna profesionalna oprema (neoprensko odijelo, čizmice, kaciga, prsluk)',
      'Licencirani IRF skiperi i vodiči',
      'Transfer od baze u Konjicu do startne tačke u Glavatičevu',
      'Domaći doručak prije polaska i bogat ručak na Neretvi / bazi',
      'Osiguranje svih učesnika',
      'GoPro fotografije i video zapisi (digitalno dostupno)',
      'Besplatan parking i toaleti na bazi'
    ],
    sort_order: 1,
    image_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=1200&q=80',
    river_length_km: 23,
    created_at: now,
    updated_at: now,
  };

  const package2: Package = {
    id: 'pkg-neretva-adrenaline',
    organization_id: orgId,
    slug: 'neretva-extreme-adrenaline-safari',
    name_bs: 'Adrenalin & Kanjon Safari (Rakitnica & Neretva)',
    name_en: 'Adrenaline & Canyon Safari (Rakitnica & Neretva)',
    short_description_bs: 'Za ljubitelje većeg uzbuđenja – dinamični brzaci, skokovi sa stijena i prolaz kroz kanjon.',
    short_description_en: 'For thrill-seekers – higher volume rapids, cliff jumping spots, and canyon exploration.',
    description_bs: 'Specijalno prilagođena tura sa dodatnim zaustavljanjima na skakaonicama, istraživanjem pećina i prolaskom najuzbudljivijih brzaka sa profesionalnim skiperima.',
    description_en: 'Specially designed adventure tour with cliff jumps, cave explorations, and tackling the most exciting rapids with certified white-water rescue guides.',
    duration_minutes: 420,
    adult_price: 115,
    child_price: 85,
    min_guests: 2,
    max_guests: 40,
    minimum_age: 12,
    difficulty: 'Challenging',
    featured: true,
    active: true,
    meeting_location_id: meetingLoc1.id,
    included_items_json: [
      'Vrhunska IRF spasilačka oprema i neopren 5mm',
      'Skiper instruktor sa licencom divljih voda',
      'Istraživanje ušća Rakitnice i kanjona',
      'Skokovi sa stijena uz nadzor vodiča',
      'Tradicionalni hercegovački ručak i piće dobrodošlice',
      'Osiguranje i turističke takse',
      'Fotografije visoke rezolucije'
    ],
    sort_order: 2,
    image_url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80',
    river_length_km: 25,
    created_at: now,
    updated_at: now,
  };

  const package3: Package = {
    id: 'pkg-neretva-family-chill',
    organization_id: orgId,
    slug: 'family-nature-rafting-tour',
    name_bs: 'Porodični / Sunset Relax Rafting',
    name_en: 'Family & Sunset Relax Rafting',
    short_description_bs: 'Prilagođeno porodicama sa manjom decom, početnicima i timovima koji žele opušteno uživanje.',
    short_description_en: 'Tailored for families with young children, beginners, and corporate teams seeking relaxing nature immersion.',
    description_bs: 'Umirujuća dionica sa pitomijim vodama, prelijepim pješčanim plažama za kupanje, posmatranjem ptica i opuštajućim veslanjem.',
    description_en: 'Gentle river section featuring calmer waters, sandy swim beaches, pristine bird watching, and relaxed paddling through scenic valley.',
    duration_minutes: 240,
    adult_price: 75,
    child_price: 45,
    min_guests: 2,
    max_guests: 50,
    minimum_age: 4,
    difficulty: 'Easy',
    featured: false,
    active: true,
    meeting_location_id: meetingLoc1.id,
    included_items_json: [
      'Sigurnosni prsluci prilagođeni djeci i odraslima',
      'Certificirani porodični skiper vodič',
      'Pauze za kupanje na pješčanim plažama',
      'Voćna zakuska i osvježavajući napici',
      'Transfer i osiguranje'
    ],
    sort_order: 3,
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    river_length_km: 15,
    created_at: now,
    updated_at: now,
  };

  const addons: Addon[] = [
    {
      id: 'addon-bbq-premium',
      organization_id: orgId,
      name_bs: 'Tradicionalni Neretva BBQ Ručak na obali',
      name_en: 'Traditional Neretva Riverside BBQ Lunch',
      description_bs: 'Domaće meso sa roštilja (ćevapi, sudžukice, piletina), hercegovački sir, sezonska salata, somun i kolač.',
      description_en: 'Grilled specialties (cevapi, sausages, chicken), Herzegovina cheese, seasonal salad, freshly baked somun bread & dessert.',
      pricing_type: PricingType.PER_PERSON,
      price: 25,
      active: true,
      sort_order: 1,
    },
    {
      id: 'addon-vegetarian-lunch',
      organization_id: orgId,
      name_bs: 'Vegetarijanski / Veganski Meni',
      name_en: 'Vegetarian / Vegan Riverside Menu',
      description_bs: 'Grilovano povrće, veganski specijaliteti, sir iz ulja, svježe salate i voće.',
      description_en: 'Grilled vegetables, vegan delicacies, traditional cheeses, fresh farm salads, and seasonal fruits.',
      pricing_type: PricingType.PER_PERSON,
      price: 25,
      active: true,
      sort_order: 2,
    },
    {
      id: 'addon-gopro-package',
      organization_id: orgId,
      name_bs: 'Profesionalni GoPro 4K Video + Foto Paket',
      name_en: 'Professional GoPro 4K Video + Photo Package',
      description_bs: 'Kompletna digitalna foto i 4K video galerija vašeg čamca dostavljena na cloud link isti dan.',
      description_en: 'Complete digital photo & 4K video reel of your boat delivered via private cloud download link same day.',
      pricing_type: PricingType.PER_BOOKING,
      price: 40,
      active: true,
      sort_order: 3,
    },
    {
      id: 'addon-sarajevo-transfer',
      organization_id: orgId,
      name_bs: 'Povratni Transfer Sarajevo – Konjic',
      name_en: 'Roundtrip Transfer Sarajevo – Konjic',
      description_bs: 'Klimatizirani kombi prevoz od vašeg hotela ili aerodroma u Sarajevu do naše baze u Konjicu i nazad.',
      description_en: 'Air-conditioned shuttle transfer from your hotel or airport in Sarajevo to our Konjic base and return.',
      pricing_type: PricingType.PER_PERSON,
      price: 35,
      active: true,
      sort_order: 4,
    },
    {
      id: 'addon-mostar-transfer',
      organization_id: orgId,
      name_bs: 'Povratni Transfer Mostar – Konjic',
      name_en: 'Roundtrip Transfer Mostar – Konjic',
      description_bs: 'Klimatizirani kombi prevoz iz Mostara do baze u Konjicu i nazad.',
      description_en: 'Air-conditioned shuttle transfer from Mostar to Konjic base and return.',
      pricing_type: PricingType.PER_PERSON,
      price: 30,
      active: true,
      sort_order: 5,
    },
  ];

  const boats: Boat[] = [
    {
      id: 'boat-01',
      organization_id: orgId,
      code: 'NRT-01',
      name: 'Neretva Eagle (Gumarac 01)',
      capacity: 8,
      status: BoatStatus.AVAILABLE,
      notes: 'Gumar 430 Hypalon, servisiran maj 2026',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'boat-02',
      organization_id: orgId,
      code: 'NRT-02',
      name: 'Boračko Zlato (Gumarac 02)',
      capacity: 8,
      status: BoatStatus.AVAILABLE,
      notes: 'Standardni rafting čamac za 8 osoba',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'boat-03',
      organization_id: orgId,
      code: 'NRT-03',
      name: 'Rakitnica Flash (Gumarac 03)',
      capacity: 8,
      status: BoatStatus.AVAILABLE,
      notes: 'Zodiac Raft 450, ojačano dno',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'boat-04',
      organization_id: orgId,
      code: 'NRT-04',
      name: 'Prenj Explorer (Gumarac 04)',
      capacity: 10,
      status: BoatStatus.AVAILABLE,
      notes: 'Veliki čamac za grupe do 10 osoba',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'boat-05',
      organization_id: orgId,
      code: 'NRT-05',
      name: 'Kanjon Express (Gumarac 05)',
      capacity: 8,
      status: BoatStatus.AVAILABLE,
      notes: 'Hypalon 420',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'boat-06',
      organization_id: orgId,
      code: 'NRT-06',
      name: 'Džajića Buk (Gumarac 06)',
      capacity: 8,
      status: BoatStatus.AVAILABLE,
      notes: 'Standardni 8-sjed',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'boat-07',
      organization_id: orgId,
      code: 'NRT-07',
      name: 'Zelena Rijeka (Gumarac 07)',
      capacity: 6,
      status: BoatStatus.AVAILABLE,
      notes: 'Manji okretni čamac za adrenalinske i porodične ture',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'boat-08',
      organization_id: orgId,
      code: 'NRT-08',
      name: 'Visočica Wave (Gumarac 08)',
      capacity: 8,
      status: BoatStatus.MAINTENANCE,
      notes: 'Zakazana zamjena ventila i provjera komora',
      created_at: now,
      updated_at: now,
    },
  ];

  const staff: StaffMember[] = [
    {
      id: 'staff-01',
      organization_id: orgId,
      first_name: 'Haris',
      last_name: 'Džajić',
      phone: '+387 61 123 456',
      email: 'haris.dzajic@neretvara起こ.ba',
      staff_role: UserRole.OWNER,
      active: true,
      notes: 'Glavni voditelj operacija i licencirani IRF instruktor',
      user_account_id: 'user-01',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'staff-02',
      organization_id: orgId,
      first_name: 'Lejla',
      last_name: 'Hadžić',
      phone: '+387 62 234 567',
      email: 'lejla.hadzic@neretvara起こ.ba',
      staff_role: UserRole.ADMIN,
      active: true,
      notes: 'Voditeljica bookinga, administracije i finansija',
      user_account_id: 'user-02',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'staff-03',
      organization_id: orgId,
      first_name: 'Mirza',
      last_name: 'Kovačević',
      phone: '+387 61 345 678',
      email: 'mirza.kovacevic@neretvara起こ.ba',
      staff_role: UserRole.DISPATCHER,
      active: true,
      notes: 'Glavni dispečer baze, raspored čamaca i opreme',
      user_account_id: 'user-03',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'staff-04',
      organization_id: orgId,
      first_name: 'Tarik',
      last_name: 'Alić',
      phone: '+387 63 456 789',
      email: 'tarik.alic@neretvara起こ.ba',
      staff_role: UserRole.GUIDE,
      active: true,
      notes: 'Senior skiper, 12 godina iskustva na Neretvi i Tari',
      user_account_id: 'user-04',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'staff-05',
      organization_id: orgId,
      first_name: 'Emir',
      last_name: 'Muhić',
      phone: '+387 61 567 890',
      email: 'emir.muhic@neretvara起こ.ba',
      staff_role: UserRole.GUIDE,
      active: true,
      notes: 'IRF Class 4 skiper, gorska služba spašavanja',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'staff-06',
      organization_id: orgId,
      first_name: 'Dino',
      last_name: 'Babić',
      phone: '+387 62 678 901',
      email: 'dino.babic@neretvara起こ.ba',
      staff_role: UserRole.GUIDE,
      active: true,
      notes: 'Skiper vodič, engleski i njemački jezik',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'staff-07',
      organization_id: orgId,
      first_name: 'Adnan',
      last_name: 'Karić',
      phone: '+387 61 789 012',
      email: 'adnan.karic@neretvara起こ.ba',
      staff_role: UserRole.GUIDE,
      active: true,
      notes: 'Skiper vodič i fotograf',
      created_at: now,
      updated_at: now,
    },
  ];

  const userAccounts: UserAccount[] = [
    {
      id: 'user-01',
      organization_id: orgId,
      email: 'owner@neretvara起こ.ba',
      name: 'Haris Džajić (Owner)',
      role: UserRole.OWNER,
      staff_member_id: 'staff-01',
      created_at: now,
    },
    {
      id: 'user-02',
      organization_id: orgId,
      email: 'admin@neretvara起こ.ba',
      name: 'Lejla Hadžić (Admin)',
      role: UserRole.ADMIN,
      staff_member_id: 'staff-02',
      created_at: now,
    },
    {
      id: 'user-03',
      organization_id: orgId,
      email: 'dispatcher@neretvara起こ.ba',
      name: 'Mirza Kovačević (Dispatcher)',
      role: UserRole.DISPATCHER,
      staff_member_id: 'staff-03',
      created_at: now,
    },
    {
      id: 'user-04',
      organization_id: orgId,
      email: 'guide@neretvara起こ.ba',
      name: 'Tarik Alić (Guide)',
      role: UserRole.GUIDE,
      staff_member_id: 'staff-04',
      created_at: now,
    },
  ];

  // Generate departures for today and the next 14 days
  const departures: Departure[] = [];
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);

  const times = [
    { time: '09:30', meetingMinutesBefore: 45, duration: 360, cap: 36, pkg: package1.id },
    { time: '10:30', meetingMinutesBefore: 45, duration: 360, cap: 44, pkg: package1.id },
    { time: '11:30', meetingMinutesBefore: 45, duration: 420, cap: 24, pkg: package2.id },
    { time: '14:00', meetingMinutesBefore: 30, duration: 240, cap: 30, pkg: package3.id },
  ];

  for (let d = -2; d < 14; d++) {
    const curDay = new Date(baseDate);
    curDay.setDate(curDay.getDate() + d);
    const dateStr = curDay.toISOString().split('T')[0];

    times.forEach((t, idx) => {
      const [h, m] = t.time.split(':').map(Number);
      const startAt = new Date(curDay);
      startAt.setHours(h, m, 0, 0);

      const meetingAt = new Date(startAt);
      meetingAt.setMinutes(meetingAt.getMinutes() - t.meetingMinutesBefore);

      const endAt = new Date(startAt);
      endAt.setMinutes(endAt.getMinutes() + t.duration);

      const depId = `dep-${dateStr}-${t.time.replace(':', '')}-${idx}`;

      let depStatus = DepartureStatus.OPEN;
      if (d < 0) {
        depStatus = DepartureStatus.COMPLETED;
      }

      departures.push({
        id: depId,
        organization_id: orgId,
        package_id: t.pkg,
        start_at: startAt.toISOString(),
        meeting_at: meetingAt.toISOString(),
        expected_end_at: endAt.toISOString(),
        capacity_limit: t.cap,
        status: depStatus,
        operational_status: OperationalStatus.NORMAL,
        public_message_bs: 'Polazak po planu sa baze Džajića Buk.',
        public_message_en: 'Scheduled departure from Džajića Buk base.',
        internal_notes: 'Standardni logistički plan, kombi prevoz spreman.',
        created_at: now,
        updated_at: now,
      });
    });
  }

  // Seed sample customers & bookings
  const sampleCustomers: Customer[] = [
    {
      id: 'cust-01',
      organization_id: orgId,
      first_name: 'Stefan',
      last_name: 'Müller',
      email: 'stefan.mueller@example.de',
      email_normalized: 'stefan.mueller@example.de',
      phone: '+49 170 555 1234',
      phone_normalized: '+491705551234',
      country_code: 'DE',
      preferred_language: 'en',
      internal_notes: 'Grupa iz Minhena, ljubitelji prirode, dolaze autom.',
      bookings_count: 1,
      no_show_count: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'cust-02',
      organization_id: orgId,
      first_name: 'Damir',
      last_name: 'Imamović',
      email: 'damir.imamovic@bih.net.ba',
      email_normalized: 'damir.imamovic@bih.net.ba',
      phone: '+387 61 998 877',
      phone_normalized: '+38761998877',
      country_code: 'BA',
      preferred_language: 'bs',
      internal_notes: 'Redovni gost, traži skipera Tarika ako je dostupan.',
      bookings_count: 3,
      no_show_count: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'cust-03',
      organization_id: orgId,
      first_name: 'Elena',
      last_name: 'Rossi',
      email: 'elena.rossi@viaggi.it',
      email_normalized: 'elena.rossi@viaggi.it',
      phone: '+39 340 123 4567',
      phone_normalized: '+393401234567',
      country_code: 'IT',
      preferred_language: 'en',
      internal_notes: 'Veća grupa od 14 osoba - korporativni team building.',
      bookings_count: 1,
      no_show_count: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'cust-04',
      organization_id: orgId,
      first_name: 'Amra',
      last_name: 'Sarić',
      email: 'amra.saric@sarajevo.ba',
      email_normalized: 'amra.saric@sarajevo.ba',
      phone: '+387 62 112 233',
      phone_normalized: '+38762112233',
      country_code: 'BA',
      preferred_language: 'bs',
      internal_notes: 'Porodica sa dvoje djece, traže mirniju turu.',
      bookings_count: 1,
      no_show_count: 0,
      created_at: now,
      updated_at: now,
    },
  ];

  // Find today's departures to attach sample bookings
  const todayStr = baseDate.toISOString().split('T')[0];
  const todayDep1030 = departures.find((d) => d.start_at.includes(todayStr) && d.start_at.includes('10:30')) || departures[1];
  const todayDep0930 = departures.find((d) => d.start_at.includes(todayStr) && d.start_at.includes('09:30')) || departures[0];

  const sampleBookings: Booking[] = [
    {
      id: 'bk-2026-000101',
      organization_id: orgId,
      reservation_code: 'NR-2026-000101',
      customer_id: 'cust-01',
      departure_id: todayDep1030.id,
      package_id: package1.id,
      source: BookingSource.WEBSITE,
      adult_count: 6,
      child_count: 1,
      guest_count: 7,
      adult_price_snapshot: 90,
      child_price_snapshot: 60,
      subtotal: 600, // 6*90 + 1*60
      discount_amount: 0,
      total_amount: 640, // + 40 BBQ/video
      currency: 'BAM',
      booking_status: BookingStatus.CONFIRMED,
      payment_status: PaymentStatus.PARTIAL,
      customer_note: 'We are a group of friends from Germany. One person is vegetarian.',
      internal_note: 'Potvrdio admin. Uplaćen avans 200 BAM na račun.',
      preferred_language: 'en',
      terms_version: 'v1.0-2026',
      terms_accepted_at: now,
      marketing_consent: true,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: now,
    },
    {
      id: 'bk-2026-000102',
      organization_id: orgId,
      reservation_code: 'NR-2026-000102',
      customer_id: 'cust-03',
      departure_id: todayDep1030.id,
      package_id: package1.id,
      source: BookingSource.PHONE,
      adult_count: 14,
      child_count: 0,
      guest_count: 14,
      adult_price_snapshot: 90,
      child_price_snapshot: 60,
      subtotal: 1260,
      discount_amount: 60,
      total_amount: 1200,
      currency: 'BAM',
      booking_status: BookingStatus.CONFIRMED,
      payment_status: PaymentStatus.UNPAID,
      customer_note: 'Team building - need 2 boats together with guides who speak English.',
      internal_note: 'Podijeliti grupu na 2 čamca (8 + 6 gostiju). Plaćaju gotovinom na bazi.',
      preferred_language: 'en',
      terms_version: 'v1.0-2026',
      terms_accepted_at: now,
      marketing_consent: false,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: now,
    },
    {
      id: 'bk-2026-000103',
      organization_id: orgId,
      reservation_code: 'NR-2026-000103',
      customer_id: 'cust-02',
      departure_id: todayDep0930.id,
      package_id: package1.id,
      source: BookingSource.WHATSAPP,
      adult_count: 4,
      child_count: 0,
      guest_count: 4,
      adult_price_snapshot: 90,
      child_price_snapshot: 60,
      subtotal: 360,
      discount_amount: 0,
      total_amount: 360,
      currency: 'BAM',
      booking_status: BookingStatus.CHECKED_IN,
      payment_status: PaymentStatus.PAID,
      customer_note: 'Stižemo u 08:45.',
      internal_note: 'Gosti stigli i zadužili opremu. Plaćeno karticom.',
      preferred_language: 'bs',
      terms_version: 'v1.0-2026',
      terms_accepted_at: now,
      marketing_consent: true,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      updated_at: now,
    },
    {
      id: 'bk-2026-000104',
      organization_id: orgId,
      reservation_code: 'NR-2026-000104',
      customer_id: 'cust-04',
      departure_id: todayDep1030.id,
      package_id: package1.id,
      source: BookingSource.WEBSITE,
      adult_count: 2,
      child_count: 2,
      guest_count: 4,
      adult_price_snapshot: 90,
      child_price_snapshot: 60,
      subtotal: 300,
      discount_amount: 0,
      total_amount: 300,
      currency: 'BAM',
      booking_status: BookingStatus.REQUESTED,
      payment_status: PaymentStatus.UNPAID,
      customer_note: 'Djeca imaju 7 i 10 godina.',
      internal_note: 'Nova online rezervacija - čeka provjeru i potvrdu.',
      preferred_language: 'bs',
      terms_version: 'v1.0-2026',
      terms_accepted_at: now,
      marketing_consent: true,
      created_at: now,
      updated_at: now,
    },
  ];

  const sampleAddonSelections: BookingAddonSelection[] = [
    {
      id: 'bka-01',
      organization_id: orgId,
      booking_id: 'bk-2026-000101',
      addon_id: 'addon-gopro-package',
      quantity: 1,
      unit_price_snapshot: 40,
      total_price: 40,
    },
  ];

  const samplePayments: Payment[] = [
    {
      id: 'pay-01',
      organization_id: orgId,
      booking_id: 'bk-2026-000101',
      amount: 200,
      currency: 'BAM',
      method: PaymentMethod.BANK_TRANSFER,
      reference: 'VIR-2026-08812',
      notes: 'Avansna uplata preko bankovnog računa',
      collected_by_user_id: 'user-02',
      collected_by_user_name: 'Lejla Hadžić',
      collected_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'pay-02',
      organization_id: orgId,
      booking_id: 'bk-2026-000103',
      amount: 360,
      currency: 'BAM',
      method: PaymentMethod.CARD_TERMINAL,
      reference: 'POS-TX-99410',
      notes: 'Plaćeno u cjelosti na POS terminalu',
      collected_by_user_id: 'user-03',
      collected_by_user_name: 'Mirza Kovačević',
      collected_at: now,
      created_at: now,
    },
  ];

  // Seed sample boat assignments and group allocations
  // For todayDep1030:
  // Assign Boat 01 (Guide: Tarik Alić) -> holds bk-2026-000101 (7 guests)
  // Assign Boat 02 (Guide: Emir Muhić) -> holds part of bk-2026-000102 (8 guests)
  // Assign Boat 03 (Guide: Dino Babić) -> holds rest of bk-2026-000102 (6 guests)
  const boatAssignments: BoatAssignment[] = [
    {
      id: 'ba-01',
      organization_id: orgId,
      departure_id: todayDep1030.id,
      boat_id: 'boat-01',
      guide_id: 'staff-04',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'ba-02',
      organization_id: orgId,
      departure_id: todayDep1030.id,
      boat_id: 'boat-02',
      guide_id: 'staff-05',
      created_at: now,
      updated_at: now,
    },
    {
      id: 'ba-03',
      organization_id: orgId,
      departure_id: todayDep1030.id,
      boat_id: 'boat-03',
      guide_id: 'staff-06',
      created_at: now,
      updated_at: now,
    },
  ];

  const bookingAllocations: BookingAllocation[] = [
    {
      id: 'alloc-01',
      organization_id: orgId,
      booking_id: 'bk-2026-000101',
      boat_assignment_id: 'ba-01',
      guest_count: 7,
      created_at: now,
    },
    {
      id: 'alloc-02',
      organization_id: orgId,
      booking_id: 'bk-2026-000102',
      boat_assignment_id: 'ba-02',
      guest_count: 8,
      created_at: now,
    },
    {
      id: 'alloc-03',
      organization_id: orgId,
      booking_id: 'bk-2026-000102',
      boat_assignment_id: 'ba-03',
      guest_count: 6,
      created_at: now,
    },
  ];

  const faqs: FAQItem[] = [
    {
      id: 'faq-01',
      organization_id: orgId,
      category: 'general',
      question_bs: 'Trebam li imati prethodno iskustvo u raftingu?',
      answer_bs: 'Ne, prethodno iskustvo nije potrebno! Naš tim čine licencirani i iskusni skiperi koji će prije samog spusta održati detaljan sigurnosni brifing i voditi vas kroz svaki dio rijeke.',
      question_en: 'Do I need previous white-water rafting experience?',
      answer_en: 'No prior experience is necessary! Our certified IRF river guides deliver an extensive safety briefing before launch and navigate you safely through every rapid and canyon stretch.',
      active: true,
      sort_order: 1,
    },
    {
      id: 'faq-02',
      organization_id: orgId,
      category: 'safety',
      question_bs: 'Koja oprema je obezbijeđena za učesnike?',
      answer_bs: 'Obezbjeđujemo vrhunsku profesionalnu opremu prema EU i IRF standardima: neoprenska odijela i čizmice (prilagođene vašoj veličini), sigurnosni prsluk visoke plovnosti, kacigu i veslo.',
      question_en: 'What safety equipment is provided for guests?',
      answer_en: 'We provide full professional CE and IRF certified gear: tailored neoprene wetsuits and thermal booties, high-buoyancy life jackets, helmets, and paddles.',
      active: true,
      sort_order: 2,
    },
    {
      id: 'faq-03',
      organization_id: orgId,
      category: 'booking',
      question_bs: 'Kada i kako se vrši plaćanje?',
      answer_bs: 'Plaćanje se vrši direktno na našoj bazi u Konjicu prije polaska na turu. Prihvatamo gotovinu (BAM ili EUR) i platne kartice na POS terminalu. Nije potrebno online plaćanje unaprijed.',
      question_en: 'When and how do we pay for our rafting trip?',
      answer_en: 'Payment takes place on-site at our Konjic base before trip departure. We accept cash (BAM or EUR) and credit/debit cards on our mobile POS terminal. No advance online card deposit required.',
      active: true,
      sort_order: 3,
    },
    {
      id: 'faq-04',
      organization_id: orgId,
      category: 'children',
      question_bs: 'Mogu li djeca učestvovati na raftingu?',
      answer_bs: 'Da, djeca od 6 i više godina mogu bezbjedno učestvovati na klasičnoj turi uz prisustvo roditelja ili staratelja. Za mlađe mališane imamo posebne prilagođene porodične dionice sa manjim brzacima.',
      question_en: 'Can children participate in rafting trips?',
      answer_en: 'Yes! Children aged 6 and above can safely join our Classic tour accompanied by parents. For younger toddlers, we offer specialized calm family sections with gentle waters and swim stops.',
      active: true,
      sort_order: 4,
    },
    {
      id: 'faq-05',
      organization_id: orgId,
      category: 'logistics',
      question_bs: 'Šta ponijeti sa sobom na bazu?',
      answer_bs: 'Ponesite kupaći kostim / šorc, suhi peškir, suhu presvlaku za poslije raftinga i kremu za sunčanje. Sve lične stvari, novčanike i telefone možete bezbjedno ostaviti u našim zaključanim ormarićima na bazi.',
      question_en: 'What personal items should we bring?',
      answer_en: 'Bring your swimwear, a dry towel, a change of clothes for after the trip, and sunscreen. You can store all dry clothing, phones, and valuables in our locked base lockers.',
      active: true,
      sort_order: 5,
    },
  ];

  const galleryItems: GalleryItem[] = [
    {
      id: 'gal-01',
      organization_id: orgId,
      image_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=1200&q=80',
      alt_bs: 'Prolazak kroz uzbudljivi brzac na Neretvi',
      alt_en: 'Navigating thrilling white water rapid on Neretva river',
      category: 'rafting',
      featured: true,
      sort_order: 1,
      created_at: now,
    },
    {
      id: 'gal-02',
      organization_id: orgId,
      image_url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80',
      alt_bs: 'Smaragdno zeleni kanjon rijeke Neretve kod Konjica',
      alt_en: 'Emerald green canyon of Neretva river near Konjic',
      category: 'canyon',
      featured: true,
      sort_order: 2,
      created_at: now,
    },
    {
      id: 'gal-03',
      organization_id: orgId,
      image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
      alt_bs: 'Timsko veslanje u netaknutoj prirodi',
      alt_en: 'Team paddling through serene mountain river valley',
      category: 'adventure',
      featured: true,
      sort_order: 3,
      created_at: now,
    },
    {
      id: 'gal-04',
      organization_id: orgId,
      image_url: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
      alt_bs: 'Planinski pejzaži i vodopadi u kanjonu Rakitnice',
      alt_en: 'Mountain landscapes and pristine waterfalls at Rakitnica confluence',
      category: 'nature',
      featured: true,
      sort_order: 4,
      created_at: now,
    },
    {
      id: 'gal-05',
      organization_id: orgId,
      image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
      alt_bs: 'Skokovi sa stijena i osvježenje u kristalno čistoj vodi',
      alt_en: 'Cliff jumping and swimming in crystal clear alpine waters',
      category: 'adventure',
      featured: false,
      sort_order: 5,
      created_at: now,
    },
    {
      id: 'gal-06',
      organization_id: orgId,
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      alt_bs: 'Tradicionalni hercegovački ručak na obali rijeke',
      alt_en: 'Traditional riverside barbecue lunch and refreshments',
      category: 'food',
      featured: true,
      sort_order: 6,
      created_at: now,
    },
  ];

  const cmsContent: Record<string, CMSContent> = {
    [orgId]: {
      hero_title_bs: 'Doživite Smaragdnu Neretvu u Srcu Konjica',
      hero_title_en: 'Experience the Emerald Neretva in Konjic',
      hero_subtitle_bs: 'Najbolje ocijenjeno rafting iskustvo u Bosni i Hercegovini. 23 km adrenalina, netaknuti kanjon i vrhunski licencirani skiperi.',
      hero_subtitle_en: 'Top-rated white water rafting experience in Bosnia & Herzegovina. 23 km of pristine canyon adventure and certified IRF river guides.',
      about_text_bs: 'Već više od 18 godina vodimo domaće i inostrane avanturiste kroz kanjon rijeke Neretve. Naša baza u Džajićima nudi kompletnu logističku podršku, besplatan parking, moderne svlačionice, vrhunsku opremu i autentičnu hercegovačku kuhinju.',
      about_text_en: 'For over 18 years we have guided adventurers from across the globe through the majestic Neretva canyon. Our river base in Džajići provides comprehensive amenities, free parking, modern dressing facilities, premium gear, and authentic culinary hospitality.',
      safety_intro_bs: 'Sigurnost gostiju je naš apsolutni prioritet. Svi naši skiperi posjeduju međunarodne IRF licence i certifikate spašavanja na divljim vodama. Svaki učesnik zadužuje homologovanu zaštitnu opremu i osiguran je tokom čitave ture.',
      safety_intro_en: 'Your safety is our highest mission. All guides hold International Rafting Federation (IRF) certifications and Swiftwater Rescue credentials. Every guest is outfitted with premium tested gear and covered by comprehensive insurance.',
      phone: '+387 61 123 456',
      email: 'info@neretvara起こ.ba',
      whatsapp: '+38761123456',
      address: 'Džajići bb, 88400 Konjic, Bosna i Hercegovina',
      meeting_point_instructions_bs: 'Dolazak na našu bazu u Džajićima 45 minuta prije izabranog polaska.',
      meeting_point_instructions_en: 'Please arrive at our Džajići base 45 minutes prior to your scheduled departure.',
    },
  };

  const org: Organization = {
    id: orgId,
    name: 'Neretva Rafting Konjic',
    slug: 'neretva-rafting-konjic',
    timezone: 'Europe/Sarajevo',
    currency: 'BAM',
    default_language: 'bs',
    email: 'info@neretvara起こ.ba',
    phone: '+387 61 123 456',
    whatsapp: '+38761123456',
    address: 'Džajići bb, 88400 Konjic, Bosna i Hercegovina',
    logo_url: '/logo.svg',
    created_at: now,
    updated_at: now,
  };

  const orgSettings: OrganizationSettings = {
    organization_id: orgId,
    booking_confirmation_mode: 'manual',
    minimum_booking_notice_hours: 2,
    maximum_booking_days_ahead: 120,
    default_meeting_minutes_before: 45,
    public_booking_enabled: true,
    email_notifications_enabled: true,
    whatsapp_notifications_enabled: true,
    cancellation_policy_configuration: {
      free_cancellation_hours: 24,
      fee_percentage_late_cancellation: 30,
      fee_percentage_no_show: 100,
      policy_summary_bs: 'Besplatno otkazivanje do 24 sata prije polaska. Za otkazivanja unutar 24 sata ili no-show obračunava se naknada.',
      policy_summary_en: 'Free cancellation up to 24 hours before departure. Late cancellations or no-shows may incur standard administrative charges.',
    },
    created_at: now,
    updated_at: now,
  };

  return {
    version: 1,
    organizations: [org],
    organization_settings: [orgSettings],
    staff_members: staff,
    user_accounts: userAccounts,
    meeting_locations: [meetingLoc1, meetingLoc2],
    packages: [package1, package2, package3],
    addons: addons,
    departure_templates: [
      {
        id: 'tmpl-01',
        organization_id: orgId,
        package_id: package1.id,
        time_of_day: '09:30',
        capacity_limit: 36,
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        active: true,
      },
      {
        id: 'tmpl-02',
        organization_id: orgId,
        package_id: package1.id,
        time_of_day: '10:30',
        capacity_limit: 44,
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        active: true,
      },
      {
        id: 'tmpl-03',
        organization_id: orgId,
        package_id: package2.id,
        time_of_day: '11:30',
        capacity_limit: 24,
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        active: true,
      },
    ],
    departures: departures,
    customers: sampleCustomers,
    bookings: sampleBookings,
    booking_addons: sampleAddonSelections,
    boats: boats,
    boat_assignments: boatAssignments,
    booking_allocations: bookingAllocations,
    payments: samplePayments,
    cancellations: [],
    notifications: [],
    audit_logs: [
      {
        id: 'audit-01',
        organization_id: orgId,
        actor_user_id: 'user-02',
        actor_name: 'Lejla Hadžić',
        action: 'BOOKING_CONFIRMED',
        entity_type: 'Booking',
        entity_id: 'bk-2026-000101',
        before_data: { booking_status: 'requested' },
        after_data: { booking_status: 'confirmed' },
        created_at: now,
      },
      {
        id: 'audit-02',
        organization_id: orgId,
        actor_user_id: 'user-03',
        actor_name: 'Mirza Kovačević',
        action: 'PAYMENT_RECORDED',
        entity_type: 'Payment',
        entity_id: 'pay-02',
        after_data: { amount: 360, method: 'card_terminal' },
        created_at: now,
      },
    ],
    faqs: faqs,
    gallery_items: galleryItems,
    cms_content: cmsContent,
    reservation_counter: 104,
  };
}

export function getDatabase(): DatabaseSchema {
  if (!dbState) {
    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        dbState = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, initializing seed:', err);
        dbState = getInitialSeedData();
        saveDatabase(dbState);
      }
    } else {
      dbState = getInitialSeedData();
      saveDatabase(dbState);
    }
  }
  return dbState!;
}

export function saveDatabase(data?: DatabaseSchema): void {
  const target = data || dbState;
  if (!target) return;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(target, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

/**
 * Execute a transaction with strict exclusive locking
 * Guarantees zero race conditions on capacity checks and booking creation
 */
export async function withTransaction<T>(callback: (db: DatabaseSchema) => Promise<T> | T): Promise<T> {
  const release = await dbLock.acquire();
  try {
    const db = getDatabase();
    const result = await callback(db);
    saveDatabase(db);
    return result;
  } finally {
    release();
  }
}

/**
 * Helper to generate next sequential reservation code (NR-2026-XXXXXX)
 */
export function generateReservationCode(db: DatabaseSchema): string {
  db.reservation_counter += 1;
  const num = db.reservation_counter.toString().padStart(6, '0');
  const year = new Date().getFullYear();
  return `NR-${year}-${num}`;
}
