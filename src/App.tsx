import React, { useState, useEffect } from 'react';
import { useTranslation } from './locales/i18n';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { apiClient } from './api/client';
import { Package, GalleryItem, FAQItem } from './types';

// Public Components
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { PackagesSection } from './components/public/PackagesSection';
import { RakitnicaRouteSection } from './components/public/RakitnicaRouteSection';
import { EquipmentSafetySection } from './components/public/EquipmentSafetySection';
import { GallerySection } from './components/public/GallerySection';
import { ReviewsSection } from './components/public/ReviewsSection';
import { FaqSection } from './components/public/FaqSection';
import { MeetingPointSection } from './components/public/MeetingPointSection';
import { Footer } from './components/public/Footer';
import { BookingWizard } from './components/public/BookingWizard';
import { BookingConfirmationView } from './components/public/BookingConfirmationView';
import {
  SafetyStandardsPage,
  RakitnicaCanyonPage,
  MeetingPointDirectionsPage,
  ContactPage,
} from './components/public/StaticPages';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardView } from './components/admin/DashboardView';
import { DailyBoardView } from './components/admin/DailyBoardView';
import { BoatPlannerView } from './components/admin/BoatPlannerView';
import { BookingsListView } from './components/admin/BookingsListView';
import { BookingDetailDrawer } from './components/admin/BookingDetailDrawer';
import { DepartureDetailModal } from './components/admin/DepartureDetailModal';
import { ManualBookingModal } from './components/admin/ManualBookingModal';
import { BoatsStaffView } from './components/admin/BoatsStaffView';
import { CustomersView } from './components/admin/CustomersView';
import { ReportsView } from './components/admin/ReportsView';
import { CmsContentEditor } from './components/admin/CmsContentEditor';
import { AuditLogsView } from './components/admin/AuditLogsView';

export default function App() {
  const { t, language } = useTranslation();
  const { role } = useAuth();
  const toast = useToast();

  // Mode: 'public' or 'admin'
  const [appMode, setAppMode] = useState<'public' | 'admin'>('public');

  // Public View State: 'home' | 'book' | 'lookup' | 'safety' | 'canyon' | 'directions' | 'contact'
  const [publicView, setPublicView] = useState<string>('home');
  const [preselectedPackageId, setPreselectedPackageId] = useState<string | undefined>(undefined);
  const [lookupBookingCode, setLookupBookingCode] = useState<string | undefined>(undefined);

  // CMS Content for public view
  const [packages, setPackages] = useState<Package[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  useEffect(() => {
    apiClient.getCms()
      .then((data) => {
        if (data.packages) setPackages(data.packages);
        if (data.gallery) setGallery(data.gallery);
        if (data.faqs) setFaqs(data.faqs);
      })
      .catch(console.error);
  }, []);

  // Admin View State
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [selectedDepartureId, setSelectedDepartureId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [manualBookingOpen, setManualBookingOpen] = useState<boolean>(false);
  const [adminRefreshKey, setAdminRefreshKey] = useState<number>(0);

  const triggerAdminRefresh = () => setAdminRefreshKey((k) => k + 1);

  // Navigation handlers
  const handleOpenBooking = (packageId?: string) => {
    setPreselectedPackageId(packageId);
    setPublicView('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLookup = (code?: string) => {
    setLookupBookingCode(code);
    setPublicView('lookup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSection = (sectionId: string) => {
    if (['safety', 'canyon', 'directions', 'contact'].includes(sectionId)) {
      setPublicView(sectionId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (publicView !== 'home') {
      setPublicView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- ADMIN PORTAL VIEW ---
  if (appMode === 'admin') {
    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={setAdminTab}
        onExitAdmin={() => setAppMode('public')}
        onOpenManualBooking={() => setManualBookingOpen(true)}
      >
        {adminTab === 'dashboard' && (
          <DashboardView
            key={`dash-${adminRefreshKey}`}
            onSelectDeparture={(depId) => setSelectedDepartureId(depId)}
            onOpenBookings={() => setAdminTab('bookings')}
            onOpenDailyBoard={() => setAdminTab('daily-board')}
            onOpenManualBooking={() => setManualBookingOpen(true)}
          />
        )}

        {adminTab === 'daily-board' && (
          <DailyBoardView
            key={`board-${adminRefreshKey}`}
            onSelectDeparture={(depId) => setSelectedDepartureId(depId)}
          />
        )}

        {adminTab === 'boat-planner' && (
          <BoatPlannerView
            key={`planner-${adminRefreshKey}`}
            onSelectDeparture={(depId) => setSelectedDepartureId(depId)}
          />
        )}

        {adminTab === 'bookings' && (
          <BookingsListView
            key={`bookings-${adminRefreshKey}`}
            onSelectBooking={(bId) => setSelectedBookingId(bId)}
            onOpenManualBooking={() => setManualBookingOpen(true)}
          />
        )}

        {adminTab === 'fleet-staff' && <BoatsStaffView key={`fleet-${adminRefreshKey}`} />}

        {adminTab === 'customers' && <CustomersView key={`cust-${adminRefreshKey}`} />}

        {adminTab === 'reports' && <ReportsView key={`reports-${adminRefreshKey}`} />}

        {adminTab === 'cms' && <CmsContentEditor key={`cms-${adminRefreshKey}`} />}

        {adminTab === 'audit-logs' && <AuditLogsView key={`audit-${adminRefreshKey}`} />}

        {/* Modals and Drawers inside Admin */}
        {selectedDepartureId && (
          <DepartureDetailModal
            departureId={selectedDepartureId}
            onClose={() => setSelectedDepartureId(null)}
            onRefresh={triggerAdminRefresh}
            onOpenBookingDetail={(bId) => setSelectedBookingId(bId)}
          />
        )}

        {selectedBookingId && (
          <BookingDetailDrawer
            bookingId={selectedBookingId}
            onClose={() => setSelectedBookingId(null)}
            onRefresh={triggerAdminRefresh}
          />
        )}

        {manualBookingOpen && (
          <ManualBookingModal
            onClose={() => setManualBookingOpen(false)}
            onSuccess={(newBooking) => {
              triggerAdminRefresh();
              setSelectedBookingId(newBooking.id);
            }}
          />
        )}
      </AdminLayout>
    );
  }

  // --- PUBLIC GUEST VIEW ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => handleOpenLookup()}
        onNavigateSection={handleNavigateSection}
        onEnterAdmin={() => setAppMode('admin')}
      />

      <main className="flex-1">
        {publicView === 'home' && (
          <>
            <Hero
              packages={packages}
              onStartBooking={(pkgId, date) => handleOpenBooking(pkgId)}
              onBookNow={() => handleOpenBooking()}
              onExplorePackages={() => handleNavigateSection('packages')}
            />
            <PackagesSection
              packages={packages}
              onSelectPackage={(pkgId) => handleOpenBooking(pkgId)}
            />
            <RakitnicaRouteSection
              onBookRakitnica={() => handleOpenBooking('pkg-neretva-rakitnica')}
            />
            <EquipmentSafetySection />
            <GallerySection gallery={gallery} />
            <ReviewsSection />
            <FaqSection faqs={faqs} />
            <MeetingPointSection />
          </>
        )}

        {publicView === 'book' && (
          <BookingWizard
            preselectedPackageId={preselectedPackageId}
            onBack={() => setPublicView('home')}
            onViewBooking={(code) => handleOpenLookup(code)}
          />
        )}

        {publicView === 'lookup' && (
          <BookingConfirmationView
            initialCode={lookupBookingCode}
            onBack={() => setPublicView('home')}
          />
        )}

        {publicView === 'safety' && (
          <SafetyStandardsPage onBack={() => setPublicView('home')} />
        )}

        {publicView === 'canyon' && (
          <RakitnicaCanyonPage
            onBack={() => setPublicView('home')}
            onBook={() => handleOpenBooking('pkg-neretva-rakitnica')}
          />
        )}

        {publicView === 'directions' && (
          <MeetingPointDirectionsPage onBack={() => setPublicView('home')} />
        )}

        {publicView === 'contact' && (
          <ContactPage onBack={() => setPublicView('home')} />
        )}
      </main>

      <Footer
        onNavigateSection={handleNavigateSection}
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => handleOpenLookup()}
        onEnterAdmin={() => setAppMode('admin')}
      />
    </div>
  );
}
