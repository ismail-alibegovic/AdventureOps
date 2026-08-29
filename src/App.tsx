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
  PrivacyPolicyPage,
  TermsAndCancellationPage,
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
import { AppLoader } from './components/ui/loading';
import { CinematicEntryScreen } from './components/public/CinematicEntryScreen';
import { BackToTop } from './components/public/BackToTop';

export default function App() {
  const { t, language } = useTranslation();
  const { role } = useAuth();
  const toast = useToast();

  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Session entry state: if directly accessing admin, skip intro; otherwise require explicit 'Begin the Journey'
  const [hasEnteredSession, setHasEnteredSession] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#admin' || path === '/admin' || path.startsWith('/admin/')) {
        return true;
      }
    }
    return false;
  });

  // Mode: 'public' or 'admin'
  const [appMode, setAppMode] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#admin' || path === '/admin' || path.startsWith('/admin/')) {
        return 'admin';
      }
    }
    return 'public';
  });

  useEffect(() => {
    const handleRouteChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#admin' || path === '/admin' || path.startsWith('/admin/')) {
        setAppMode('admin');
        setHasEnteredSession(true);
      } else {
        setAppMode('public');
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const handleEnterAdmin = () => {
    window.location.hash = 'admin';
    setAppMode('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitAdmin = () => {
    if (window.location.hash === '#admin') {
      window.history.pushState('', document.title, window.location.pathname.startsWith('/admin') ? '/' : window.location.pathname);
    } else if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState('', document.title, '/');
    }
    setAppMode('public');
    setPublicView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Public View State: 'home' | 'book' | 'lookup' | 'safety' | 'canyon' | 'directions' | 'contact'
  const [publicView, setPublicView] = useState<string>('home');
  const [preselectedPackageId, setPreselectedPackageId] = useState<string | undefined>(undefined);
  const [preselectedDate, setPreselectedDate] = useState<string | undefined>(undefined);
  const [lookupBookingCode, setLookupBookingCode] = useState<string | undefined>(undefined);

  // CMS Content for public view
  const [packages, setPackages] = useState<Package[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  useEffect(() => {
    const startTime = Date.now();
    apiClient.getCms()
      .then((data) => {
        if (data.packages) setPackages(data.packages);
        if (data.gallery) setGallery(data.gallery);
        if (data.faqs) setFaqs(data.faqs);
      })
      .catch(console.error)
      .finally(() => {
        // Guarantee a brief smooth presentation threshold so there is no layout jump
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 600 - elapsed);
        setTimeout(() => {
          setIsInitializing(false);
        }, remaining);
      });
  }, []);

  // Admin View State
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [selectedDepartureId, setSelectedDepartureId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [manualBookingOpen, setManualBookingOpen] = useState<boolean>(false);
  const [adminRefreshKey, setAdminRefreshKey] = useState<number>(0);

  // Show premium branded full-screen loading on initial boot for Admin or entered sessions
  if (isInitializing && (appMode === 'admin' || hasEnteredSession)) {
    return <AppLoader context={appMode} />;
  }

  const triggerAdminRefresh = () => setAdminRefreshKey((k) => k + 1);

  // Navigation handlers
  const handleOpenBooking = (packageId?: string, date?: string) => {
    setPreselectedPackageId(packageId);
    setPreselectedDate(date);
    setPublicView('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLookup = (code?: string) => {
    setLookupBookingCode(code);
    setPublicView('lookup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSection = (sectionId: string) => {
    if (['safety', 'canyon', 'directions', 'contact', 'privacy', 'terms'].includes(sectionId)) {
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
        onExitAdmin={handleExitAdmin}
        onOpenManualBooking={() => setManualBookingOpen(true)}
      >
        {adminTab === 'dashboard' && (
          <DashboardView
            key={`dash-${adminRefreshKey}`}
            onSelectDeparture={(depId) => setSelectedDepartureId(depId)}
            onOpenBookings={() => setAdminTab('bookings')}
            onOpenDailyBoard={() => setAdminTab('daily-board')}
            onOpenManualBooking={() => setManualBookingOpen(true)}
            onOpenBoatPlanner={() => setAdminTab('boat-planner')}
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
      {!hasEnteredSession && (
        <CinematicEntryScreen onEnter={() => setHasEnteredSession(true)} />
      )}

      <Navbar
        currentView={publicView}
        onOpenBooking={() => handleOpenBooking()}
        onOpenLookup={() => handleOpenLookup()}
        onNavigateSection={handleNavigateSection}
        onEnterAdmin={handleEnterAdmin}
      />

      <main className="flex-1">
        {publicView === 'home' && (
          <>
            <Hero
              packages={packages}
              onStartBooking={(pkgId, date) => handleOpenBooking(pkgId, date)}
              onBookNow={(pkgId, date) => handleOpenBooking(pkgId, date)}
              onExplorePackages={() => handleNavigateSection('packages')}
            />
            <PackagesSection
              packages={packages}
              onSelectPackage={(pkgId) => handleOpenBooking(pkgId)}
            />
            <RakitnicaRouteSection
              onBookRakitnica={() => handleOpenBooking('pkg-neretva-adrenaline')}
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
            initialDate={preselectedDate}
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

        {publicView === 'privacy' && (
          <PrivacyPolicyPage
            onBack={() => setPublicView('home')}
            onBook={() => handleOpenBooking()}
          />
        )}

        {publicView === 'terms' && (
          <TermsAndCancellationPage
            onBack={() => setPublicView('home')}
            onBook={() => handleOpenBooking()}
          />
        )}

        {publicView === 'canyon' && (
          <RakitnicaCanyonPage
            onBack={() => setPublicView('home')}
            onBook={() => handleOpenBooking('pkg-neretva-adrenaline')}
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
        onEnterAdmin={handleEnterAdmin}
      />

      <BackToTop />
    </div>
  );
}
