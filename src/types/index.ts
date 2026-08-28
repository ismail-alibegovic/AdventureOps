// Domain Models & TypeScript Definitions for Neretva Rafting Konjic Platform

export type SupportedLanguage = 'bs' | 'en';

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  DISPATCHER = 'DISPATCHER',
  GUIDE = 'GUIDE',
}

export enum BookingStatus {
  REQUESTED = 'requested',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  REJECTED = 'rejected',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD_TERMINAL = 'card_terminal',
  BANK_TRANSFER = 'bank_transfer',
  OTHER = 'other',
}

export enum DepartureStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  FULL = 'full',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum OperationalStatus {
  NORMAL = 'normal',
  WATCH = 'watch',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
}

export enum BoatStatus {
  AVAILABLE = 'available',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
}

export enum BookingSource {
  WEBSITE = 'website',
  PHONE = 'phone',
  WHATSAPP = 'whatsapp',
  WALK_IN = 'walk_in',
  GOOGLE = 'google',
  INSTAGRAM = 'instagram',
  HOTEL_PARTNER = 'hotel_partner',
  TOUR_AGENCY = 'tour_agency',
  OTHER = 'other',
}

export enum PricingType {
  PER_PERSON = 'per_person',
  PER_BOOKING = 'per_booking',
}

export enum CancellationReason {
  CUSTOMER_CANCELLED = 'customer_cancelled',
  COMPANY_CANCELLED = 'company_cancelled',
  WEATHER = 'weather',
  WATER_CONDITIONS = 'water_conditions',
  SAFETY = 'safety',
  MEDICAL = 'medical',
  DUPLICATE = 'duplicate',
  OTHER = 'other',
}

export enum CancellationFeeStatus {
  DUE = 'due',
  PAID = 'paid',
  WAIVED = 'waived',
}

export enum NotificationChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
}

export enum NotificationType {
  BOOKING_RECEIVED = 'booking_received',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_REJECTED = 'booking_rejected',
  BOOKING_CANCELLED = 'booking_cancelled',
  DEPARTURE_CHANGED = 'departure_changed',
  DEPARTURE_CANCELLED = 'departure_cancelled',
  REMINDER_24H = 'reminder_24h',
  POST_TRIP_THANKS = 'post_trip_thanks',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// -------------------------------------------------------------
// Database Entities
// -------------------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  slug: string;
  timezone: string; // Europe/Sarajevo
  currency: string; // BAM
  default_language: SupportedLanguage;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  organization_id: string;
  booking_confirmation_mode: 'manual' | 'automatic';
  minimum_booking_notice_hours: number;
  maximum_booking_days_ahead: number;
  default_meeting_minutes_before: number;
  public_booking_enabled: boolean;
  email_notifications_enabled: boolean;
  whatsapp_notifications_enabled: boolean;
  cancellation_policy_configuration: {
    free_cancellation_hours: number;
    fee_percentage_late_cancellation: number;
    fee_percentage_no_show: number;
    policy_summary_bs: string;
    policy_summary_en: string;
  };
  created_at: string;
  updated_at: string;
}

export interface StaffMember {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  staff_role: UserRole;
  active: boolean;
  notes?: string;
  user_account_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAccount {
  id: string;
  organization_id: string;
  email: string;
  name: string;
  role: UserRole;
  staff_member_id?: string;
  created_at: string;
}

export interface MeetingLocation {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  instructions_bs: string;
  instructions_en: string;
  maps_url: string;
  active: boolean;
}

export interface Package {
  id: string;
  organization_id: string;
  slug: string;
  name_bs: string;
  name_en: string;
  short_description_bs: string;
  short_description_en: string;
  description_bs: string;
  description_en: string;
  duration_minutes: number;
  adult_price: number; // in BAM
  child_price: number; // in BAM
  min_guests: number;
  max_guests: number;
  minimum_age: number;
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme';
  featured: boolean;
  active: boolean;
  meeting_location_id: string;
  included_items_json: string[];
  sort_order: number;
  image_url: string;
  river_length_km: number;
  created_at: string;
  updated_at: string;
}

export interface Addon {
  id: string;
  organization_id: string;
  name_bs: string;
  name_en: string;
  description_bs: string;
  description_en: string;
  pricing_type: PricingType;
  price: number; // in BAM
  active: boolean;
  sort_order: number;
  icon?: string;
}

export interface Departure {
  id: string;
  organization_id: string;
  package_id: string;
  start_at: string; // ISO 8601 UTC
  meeting_at: string; // ISO 8601 UTC
  expected_end_at: string; // ISO 8601 UTC
  capacity_limit: number;
  status: DepartureStatus;
  operational_status: OperationalStatus;
  public_message_bs?: string;
  public_message_en?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
  
  // Dynamic computed fields (from queries)
  package?: Package;
  booked_guests?: number;
  available_capacity?: number;
  bookings_count?: number;
  assigned_boats_count?: number;
  assigned_guides_count?: number;
  checked_in_guests?: number;
  unpaid_guests?: number;
}

export interface DepartureTemplate {
  id: string;
  organization_id: string;
  package_id: string;
  time_of_day: string; // e.g. "10:00"
  capacity_limit: number;
  days_of_week: number[]; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  active: boolean;
}

export interface Customer {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  email_normalized: string;
  phone: string;
  phone_normalized: string;
  country_code: string;
  preferred_language: SupportedLanguage;
  internal_notes?: string;
  bookings_count: number;
  no_show_count: number;
  created_at: string;
  updated_at: string;
}

export interface BookingAddonSelection {
  id: string;
  organization_id: string;
  booking_id: string;
  addon_id: string;
  quantity: number;
  unit_price_snapshot: number;
  total_price: number;
  addon?: Addon;
}

export interface Booking {
  id: string;
  organization_id: string;
  reservation_code: string; // e.g., NR-2026-000124
  customer_id: string;
  departure_id: string;
  package_id: string;
  source: BookingSource;
  adult_count: number;
  child_count: number;
  guest_count: number;
  adult_price_snapshot: number;
  child_price_snapshot: number;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  customer_note?: string;
  internal_note?: string;
  preferred_language: SupportedLanguage;
  terms_version: string;
  terms_accepted_at: string;
  marketing_consent: boolean;
  marketing_consent_at?: string;
  created_by_user_id?: string;
  idempotency_key?: string;
  created_at: string;
  updated_at: string;

  // Joined relations
  customer?: Customer;
  departure?: Departure;
  package?: Package;
  addons?: BookingAddonSelection[];
  payments?: Payment[];
  allocations?: BookingAllocation[];
  cancellation?: Cancellation;
}

export interface Boat {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  capacity: number;
  status: BoatStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BoatAssignment {
  id: string;
  organization_id: string;
  departure_id: string;
  boat_id: string;
  guide_id?: string;
  created_at: string;
  updated_at: string;

  boat?: Boat;
  guide?: StaffMember;
  allocations?: BookingAllocation[];
  total_allocated_guests?: number;
}

export interface BookingAllocation {
  id: string;
  organization_id: string;
  booking_id: string;
  boat_assignment_id: string;
  guest_count: number;
  created_at: string;

  booking?: Booking;
  boat_assignment?: BoatAssignment;
}

export interface Payment {
  id: string;
  organization_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  collected_by_user_id?: string;
  collected_by_user_name?: string;
  collected_at: string;
  created_at: string;
}

export interface Cancellation {
  id: string;
  organization_id: string;
  booking_id: string;
  cancelled_by_type: 'customer' | 'company' | 'admin';
  cancelled_by_user_id?: string;
  reason_code: CancellationReason;
  reason_text?: string;
  fee_amount: number;
  fee_status: CancellationFeeStatus;
  cancelled_at: string;
  created_at: string;
}

export interface NotificationRecord {
  id: string;
  organization_id: string;
  booking_id?: string;
  departure_id?: string;
  channel: NotificationChannel;
  notification_type: NotificationType;
  recipient: string;
  subject?: string;
  content?: string;
  status: NotificationStatus;
  provider_message_id?: string;
  scheduled_for: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  actor_user_id?: string;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_data?: any;
  after_data?: any;
  ip_address?: string;
  created_at: string;
}

export interface FAQItem {
  id: string;
  organization_id: string;
  question_bs: string;
  answer_bs: string;
  question_en: string;
  answer_en: string;
  category: string;
  active: boolean;
  sort_order: number;
}

export interface GalleryItem {
  id: string;
  organization_id: string;
  image_url: string;
  alt_bs: string;
  alt_en: string;
  category: string;
  featured: boolean;
  sort_order: number;
  created_at: string;
}

export interface CMSContent {
  hero_title_bs: string;
  hero_title_en: string;
  hero_subtitle_bs: string;
  hero_subtitle_en: string;
  about_text_bs: string;
  about_text_en: string;
  safety_intro_bs: string;
  safety_intro_en: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  meeting_point_instructions_bs: string;
  meeting_point_instructions_en: string;
}
