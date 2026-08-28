import { DatabaseSchema, getDatabase, withTransaction } from '../db/database';
import {
  FAQItem,
  GalleryItem,
  CMSContent,
  Package,
  Addon,
  MeetingLocation,
  Boat,
  StaffMember,
  OrganizationSettings,
  BoatStatus,
  UserRole,
} from '../../src/types';

export class CmsService {
  static getCmsData(orgId: string) {
    const db = getDatabase();
    const content = db.cms_content[orgId] || db.cms_content['org-konjic-rafting-01'];
    const faqs = db.faqs.filter((f) => f.organization_id === orgId).sort((a, b) => a.sort_order - b.sort_order);
    const gallery = db.gallery_items
      .filter((g) => g.organization_id === orgId)
      .sort((a, b) => a.sort_order - b.sort_order);
    const packages = db.packages.filter((p) => p.organization_id === orgId).sort((a, b) => a.sort_order - b.sort_order);
    const addons = db.addons.filter((a) => a.organization_id === orgId).sort((a, b) => a.sort_order - b.sort_order);
    const meetingLocations = db.meeting_locations.filter((m) => m.organization_id === orgId);
    const settings = db.organization_settings.find((s) => s.organization_id === orgId);

    return {
      content,
      faqs,
      gallery,
      packages,
      addons,
      meeting_locations: meetingLocations,
      settings,
    };
  }

  static async updateCmsContent(orgId: string, updates: Partial<CMSContent>): Promise<CMSContent> {
    return withTransaction((db) => {
      if (!db.cms_content[orgId]) {
        db.cms_content[orgId] = { ...db.cms_content['org-konjic-rafting-01'] };
      }
      db.cms_content[orgId] = {
        ...db.cms_content[orgId],
        ...updates,
      };
      return db.cms_content[orgId];
    });
  }

  static async updateSettings(orgId: string, updates: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    return withTransaction((db) => {
      let settings = db.organization_settings.find((s) => s.organization_id === orgId);
      if (!settings) {
        settings = {
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
            policy_summary_bs: 'Besplatno otkazivanje do 24h prije polaska.',
            policy_summary_en: 'Free cancellation up to 24h before departure.',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        db.organization_settings.push(settings);
      }

      Object.assign(settings, updates, { updated_at: new Date().toISOString() });
      return settings;
    });
  }

  // FAQ management
  static async upsertFaq(orgId: string, item: Partial<FAQItem>): Promise<FAQItem> {
    return withTransaction((db) => {
      let faq = db.faqs.find((f) => f.id === item.id && f.organization_id === orgId);
      if (faq) {
        Object.assign(faq, item);
      } else {
        faq = {
          id: item.id || `faq-${Date.now()}`,
          organization_id: orgId,
          question_bs: item.question_bs || '',
          answer_bs: item.answer_bs || '',
          question_en: item.question_en || '',
          answer_en: item.answer_en || '',
          category: item.category || 'general',
          active: item.active !== undefined ? item.active : true,
          sort_order: item.sort_order || db.faqs.length + 1,
        };
        db.faqs.push(faq);
      }
      return faq;
    });
  }

  static async deleteFaq(orgId: string, id: string): Promise<void> {
    return withTransaction((db) => {
      db.faqs = db.faqs.filter((f) => !(f.id === id && f.organization_id === orgId));
    });
  }

  // Gallery management
  static async addGalleryItem(orgId: string, item: Partial<GalleryItem>): Promise<GalleryItem> {
    return withTransaction((db) => {
      const g: GalleryItem = {
        id: `gal-${Date.now()}`,
        organization_id: orgId,
        image_url: item.image_url || '',
        alt_bs: item.alt_bs || '',
        alt_en: item.alt_en || '',
        category: item.category || 'rafting',
        featured: !!item.featured,
        sort_order: item.sort_order || db.gallery_items.length + 1,
        created_at: new Date().toISOString(),
      };
      db.gallery_items.push(g);
      return g;
    });
  }

  static async deleteGalleryItem(orgId: string, id: string): Promise<void> {
    return withTransaction((db) => {
      db.gallery_items = db.gallery_items.filter((g) => !(g.id === id && g.organization_id === orgId));
    });
  }

  // Package management
  static async upsertPackage(orgId: string, pkg: Partial<Package>): Promise<Package> {
    return withTransaction((db) => {
      let existing = db.packages.find((p) => p.id === pkg.id && p.organization_id === orgId);
      const now = new Date().toISOString();
      if (existing) {
        Object.assign(existing, pkg, { updated_at: now });
      } else {
        existing = {
          id: pkg.id || `pkg-${Date.now()}`,
          organization_id: orgId,
          slug: pkg.slug || `package-${Date.now()}`,
          name_bs: pkg.name_bs || 'Nova Tura',
          name_en: pkg.name_en || 'New Tour',
          short_description_bs: pkg.short_description_bs || '',
          short_description_en: pkg.short_description_en || '',
          description_bs: pkg.description_bs || '',
          description_en: pkg.description_en || '',
          duration_minutes: pkg.duration_minutes || 360,
          adult_price: pkg.adult_price || 90,
          child_price: pkg.child_price || 60,
          min_guests: pkg.min_guests || 1,
          max_guests: pkg.max_guests || 60,
          minimum_age: pkg.minimum_age || 6,
          difficulty: pkg.difficulty || 'Moderate',
          featured: !!pkg.featured,
          active: pkg.active !== undefined ? pkg.active : true,
          meeting_location_id: pkg.meeting_location_id || db.meeting_locations[0]?.id || '',
          included_items_json: pkg.included_items_json || [],
          sort_order: pkg.sort_order || db.packages.length + 1,
          image_url: pkg.image_url || 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=1200&q=80',
          river_length_km: pkg.river_length_km || 23,
          created_at: now,
          updated_at: now,
        };
        db.packages.push(existing);
      }
      return existing;
    });
  }

  // Boats & Staff
  static async upsertBoat(orgId: string, boat: Partial<Boat>): Promise<Boat> {
    return withTransaction((db) => {
      let existing = db.boats.find((b) => b.id === boat.id && b.organization_id === orgId);
      const now = new Date().toISOString();
      if (existing) {
        Object.assign(existing, boat, { updated_at: now });
      } else {
        existing = {
          id: boat.id || `boat-${Date.now()}`,
          organization_id: orgId,
          code: boat.code || `NRT-${db.boats.length + 1}`,
          name: boat.name || `Gumarac ${db.boats.length + 1}`,
          capacity: boat.capacity || 8,
          status: boat.status || BoatStatus.AVAILABLE,
          notes: boat.notes || '',
          created_at: now,
          updated_at: now,
        };
        db.boats.push(existing);
      }
      return existing;
    });
  }

  static async upsertStaff(orgId: string, staff: Partial<StaffMember>): Promise<StaffMember> {
    return withTransaction((db) => {
      let existing = db.staff_members.find((s) => s.id === staff.id && s.organization_id === orgId);
      const now = new Date().toISOString();
      if (existing) {
        Object.assign(existing, staff, { updated_at: now });
      } else {
        existing = {
          id: staff.id || `staff-${Date.now()}`,
          organization_id: orgId,
          first_name: staff.first_name || '',
          last_name: staff.last_name || '',
          phone: staff.phone || '',
          email: staff.email || '',
          staff_role: staff.staff_role || UserRole.GUIDE,
          active: staff.active !== undefined ? staff.active : true,
          notes: staff.notes || '',
          created_at: now,
          updated_at: now,
        };
        db.staff_members.push(existing);
      }
      return existing;
    });
  }
}
