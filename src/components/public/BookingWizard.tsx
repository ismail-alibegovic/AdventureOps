import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../locales/i18n';
import { apiClient } from '../../api/client';
import { Package, Addon, Departure, Booking, BookingStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '../ui/Button';

// Sub-components for modularity & token safety
import { BookingProgressBar } from './booking/BookingProgressBar';
import { BookingSummarySidebar } from './booking/BookingSummarySidebar';
import { Step1Adventure } from './booking/Step1Adventure';
import { Step2DateGuests } from './booking/Step2DateGuests';
import { Step3Details } from './booking/Step3Details';
import { Step4Review } from './booking/Step4Review';
import { BookingSuccessPass } from './booking/BookingSuccessPass';

interface BookingWizardProps {
  initialPackageId?: string;
  preselectedPackageId?: string;
  initialDate?: string;
  onFinished?: (booking: Booking) => void;
  onCancel?: () => void;
  onBack?: () => void;
  onViewBooking?: (code: string) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialPackageId,
  preselectedPackageId,
  initialDate,
  onFinished,
  onCancel,
  onBack,
  onViewBooking,
}) => {
  const handleCancel = () => {
    if (onBack) onBack();
    else if (onCancel) onCancel();
  };

  const { t, language } = useTranslation();
  const toast = useToast();

  // Step 1: Adventure | Step 2: Date & Guests | Step 3: Details | Step 4: Review
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showMobileSummary, setShowMobileSummary] = useState<boolean>(false);

  // Loaded Catalog Data
  const [packages, setPackages] = useState<Package[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [calendarDates, setCalendarDates] = useState<
    Array<{ date: string; has_availability: boolean; spots_left: number }>
  >([]);

  // Initial date parse helper
  const initialDateObj = initialDate ? new Date(initialDate) : null;
  const validInitialDate = initialDateObj && !isNaN(initialDateObj.getTime());

  // Wizard Form State
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    preselectedPackageId || initialPackageId || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedDepartureId, setSelectedDepartureId] = useState<string>('');
  const [adultCount, setAdultCount] = useState<number>(2);
  const [childCount, setChildCount] = useState<number>(0);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Customer info
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('BA');
  const [customerNote, setCustomerNote] = useState<string>('');
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [marketingConsent, setMarketingConsent] = useState<boolean>(false);
  const [honeypot, setHoneypot] = useState<string>(''); // spam bot trap

  // Calendar month state
  const [currentYear, setCurrentYear] = useState<number>(
    validInitialDate ? initialDateObj!.getFullYear() : new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    validInitialDate ? initialDateObj!.getMonth() + 1 : new Date().getMonth() + 1
  );

  // Result state
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Sync when preselectedPackageId or initialDate props update
  useEffect(() => {
    if (preselectedPackageId) {
      setSelectedPackageId(preselectedPackageId);
    }
  }, [preselectedPackageId]);

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      const d = new Date(initialDate);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth() + 1);
      }
    }
  }, [initialDate]);

  // Load packages & addons
  useEffect(() => {
    async function loadInit() {
      try {
        setLoading(true);
        const [pkgs, adds] = await Promise.all([apiClient.getPackages(), apiClient.getAddons()]);
        setPackages(pkgs);
        setAddons(adds);
        if (!selectedPackageId && pkgs.length > 0) {
          setSelectedPackageId(pkgs[0].id);
        }
      } catch (err: any) {
        toast.error('Failed to load package catalog');
      } finally {
        setLoading(false);
      }
    }
    loadInit();
  }, []);

  // When package or month changes, fetch calendar availability
  useEffect(() => {
    if (selectedPackageId) {
      apiClient
        .getCalendarAvailability(selectedPackageId, currentYear, currentMonth)
        .then(setCalendarDates)
        .catch(console.error);
    }
  }, [selectedPackageId, currentYear, currentMonth]);

  // When date or package changes, fetch departures
  useEffect(() => {
    if (selectedPackageId && selectedDate) {
      apiClient
        .getDepartures(selectedPackageId, selectedDate)
        .then((deps) => {
          setDepartures(deps);
          const available = deps.find((d) => d.spots_left > 0);
          if (available) {
            setSelectedDepartureId(available.id);
          } else if (deps.length > 0) {
            setSelectedDepartureId(deps[0].id);
          } else {
            setSelectedDepartureId('');
          }
        })
        .catch(console.error);
    }
  }, [selectedPackageId, selectedDate]);

  const selectedPkg = packages.find((p) => p.id === selectedPackageId);
  const selectedDep = departures.find((d) => d.id === selectedDepartureId);
  const totalGuests = adultCount + childCount;

  // Validation
  const canProceedStep1 = !!selectedPackageId;
  const canProceedStep2 =
    !!selectedDate &&
    !!selectedDepartureId &&
    (!selectedDep || selectedDep.spots_left >= totalGuests) &&
    adultCount >= 1 &&
    totalGuests > 0;
  const canProceedStep3 =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    email.includes('@') &&
    phone.trim().length >= 6;
  const canSubmit = canProceedStep3 && termsAgreed;

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const handleStepJump = (targetStep: number) => {
    if (targetStep < step) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canNavigateToStep = (targetStep: number) => {
    if (targetStep === 1) return true;
    if (targetStep === 2) return canProceedStep1;
    if (targetStep === 3) return canProceedStep1 && canProceedStep2;
    if (targetStep === 4) return canProceedStep1 && canProceedStep2 && canProceedStep3;
    return false;
  };

  const handleSubmitBooking = async () => {
    if (!canSubmit || !selectedPkg || !selectedDepartureId) return;

    try {
      setSubmitting(true);
      const res = await apiClient.createPublicBooking({
        package_id: selectedPackageId,
        departure_id: selectedDepartureId,
        adult_count: adultCount,
        child_count: childCount,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country_code: countryCode,
        preferred_language: language,
        customer_note: customerNote.trim() || undefined,
        selected_addon_ids: selectedAddonIds,
        terms_version: 'v1.0-2026',
        marketing_consent: marketingConsent,
        website_trap_honeypot: honeypot, // if filled, blocked by backend
        idempotency_key: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      });

      setCreatedBooking(res);
      const code = res.reservation_code || (res as any).booking_code;
      const isRequested = res.booking_status === BookingStatus.REQUESTED;

      if (isRequested) {
        toast.info(
          language === 'en'
            ? `Booking request received. Reference: ${code}`
            : `Zahtjev za rezervaciju zaprimljen. Referenca: ${code}`
        );
      } else {
        toast.success(
          language === 'en'
            ? `Booking confirmed. Reference: ${code}`
            : `Rezervacija potvrđena. Referenca: ${code}`
        );
      }
      if (onFinished) onFinished(res);
    } catch (err: any) {
      toast.error(err.message || 'Booking submission failed. Please try another departure time or contact us.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-emerald-400 space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-300">
          {language === 'en' ? 'Preparing adventure availability...' : 'Učitavam termine i pakete...'}
        </span>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUCCESS / DIGITAL PASS SCREEN
  // -------------------------------------------------------------
  if (createdBooking) {
    return (
      <BookingSuccessPass
        booking={createdBooking}
        language={language}
        onReturnHome={handleCancel}
      />
    );
  }

  const stepTitles = [
    language === 'en' ? 'Adventure' : 'Paket',
    language === 'en' ? 'Date & Guests' : 'Datum & Gosti',
    language === 'en' ? 'Guest Details' : 'Vaši Podaci',
    language === 'en' ? 'Review & Confirm' : 'Pregled & Potvrda',
  ];

  // Price calculations for mobile bottom bar
  const adultSubtotal = selectedPkg ? adultCount * selectedPkg.adult_price : 0;
  const childSubtotal = selectedPkg ? childCount * selectedPkg.child_price : 0;
  const selectedAddonsList = addons.filter((a) => selectedAddonIds.includes(a.id));
  const addonsSubtotal = selectedAddonsList.reduce((sum, a) => {
    const mult = a.pricing_type === 'per_booking' ? 1 : totalGuests;
    return sum + a.price * mult;
  }, 0);
  const grandTotal = adultSubtotal + childSubtotal + addonsSubtotal;

  return (
    <div className="min-h-[85vh] bg-[#050D0B] text-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-32 lg:pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Top Progress Bar */}
        <BookingProgressBar
          currentStep={step}
          totalSteps={4}
          stepTitles={stepTitles}
          onStepClick={handleStepJump}
          canNavigateToStep={canNavigateToStep}
        />

        {/* Main 65 / 35 Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Step Content ~ 65% width) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#071310] border border-[#182C24] rounded-3xl p-6 sm:p-8 shadow-2xl">
              {/* STEP 1: ADVENTURE PACKAGE */}
              {step === 1 && (
                <Step1Adventure
                  packages={packages}
                  selectedPackageId={selectedPackageId}
                  onSelectPackage={(id) => setSelectedPackageId(id)}
                  language={language}
                />
              )}

              {/* STEP 2: DATE, TIME & GUESTS */}
              {step === 2 && (
                <Step2DateGuests
                  selectedPkg={selectedPkg}
                  selectedDate={selectedDate}
                  onChangeDate={(d) => setSelectedDate(d)}
                  calendarDates={calendarDates}
                  departures={departures}
                  selectedDepartureId={selectedDepartureId}
                  onSelectDeparture={(id) => setSelectedDepartureId(id)}
                  adultCount={adultCount}
                  setAdultCount={setAdultCount}
                  childCount={childCount}
                  setChildCount={setChildCount}
                  addons={addons}
                  selectedAddonIds={selectedAddonIds}
                  onToggleAddon={handleToggleAddon}
                  language={language}
                />
              )}

              {/* STEP 3: GUEST DETAILS & CONTACT */}
              {step === 3 && (
                <Step3Details
                  firstName={firstName}
                  setFirstName={setFirstName}
                  lastName={lastName}
                  setLastName={setLastName}
                  email={email}
                  setEmail={setEmail}
                  phone={phone}
                  setPhone={setPhone}
                  countryCode={countryCode}
                  setCountryCode={setCountryCode}
                  customerNote={customerNote}
                  setCustomerNote={setCustomerNote}
                  honeypot={honeypot}
                  setHoneypot={setHoneypot}
                  language={language}
                />
              )}

              {/* STEP 4: REVIEW & FINAL CONFIRMATION */}
              {step === 4 && (
                <Step4Review
                  selectedPkg={selectedPkg}
                  selectedDate={selectedDate}
                  selectedDep={selectedDep}
                  adultCount={adultCount}
                  childCount={childCount}
                  selectedAddonIds={selectedAddonIds}
                  addons={addons}
                  firstName={firstName}
                  lastName={lastName}
                  email={email}
                  phone={phone}
                  customerNote={customerNote}
                  termsAgreed={termsAgreed}
                  setTermsAgreed={setTermsAgreed}
                  marketingConsent={marketingConsent}
                  setMarketingConsent={setMarketingConsent}
                  onEditSection={handleStepJump}
                  onSubmitBooking={handleSubmitBooking}
                  submitting={submitting}
                  language={language}
                />
              )}

              {/* Bottom Navigation Buttons (Desktop + In-card) */}
              <div className="pt-8 mt-8 border-t border-[#182C24] flex items-center justify-between gap-4">
                {step > 1 ? (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setStep((s) => Math.max(1, s - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    {language === 'en' ? 'Back' : 'Nazad'}
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    {language === 'en' ? 'Cancel' : 'Odustani'}
                  </Button>
                )}

                {step < 4 ? (
                  <Button
                    variant="primary"
                    size="md"
                    disabled={
                      (step === 1 && !canProceedStep1) ||
                      (step === 2 && !canProceedStep2) ||
                      (step === 3 && !canProceedStep3)
                    }
                    onClick={() => {
                      setStep((s) => Math.min(4, s + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {language === 'en' ? 'Continue' : 'Nastavi'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={!canSubmit || submitting}
                    onClick={handleSubmitBooking}
                    leftIcon={
                      submitting ? undefined : (
                        <CheckCircle2 className="w-5 h-5 text-slate-950 fill-emerald-400" />
                      )
                    }
                    loading={submitting}
                    className="shadow-xl shadow-emerald-500/20"
                  >
                    {submitting
                      ? language === 'en' ? 'Securing reservation...' : 'Evidentiram rezervaciju...'
                      : language === 'en' ? 'Confirm Reservation' : 'Potvrdi Rezervaciju'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Sticky Booking Summary ~ 35% width, Desktop) */}
          <div className="hidden lg:block lg:col-span-4">
            <BookingSummarySidebar
              selectedPkg={selectedPkg}
              selectedDate={selectedDate}
              selectedDep={selectedDep}
              adultCount={adultCount}
              childCount={childCount}
              selectedAddonIds={selectedAddonIds}
              addons={addons}
              language={language}
              onEditSection={handleStepJump}
            />
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR (Visible only on screens < lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#071310]/95 backdrop-blur-md border-t border-[#182C24] p-3.5 px-4 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Price & Summary Toggle */}
          <button
            type="button"
            onClick={() => setShowMobileSummary((v) => !v)}
            className="flex items-center gap-2 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0E221B] border border-[#1F382E] flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-emerald-400 font-mono font-display">
                  {grandTotal} BAM
                </span>
                <span className="text-[10px] text-slate-400">({totalGuests} {language === 'en' ? 'guests' : 'os.'})</span>
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                {language === 'en' ? 'View details' : 'Detalji'}
                {showMobileSummary ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </span>
            </div>
          </button>

          {/* Mobile Main CTA Button */}
          {step < 4 ? (
            <Button
              variant="primary"
              size="md"
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3)
              }
              onClick={() => {
                setStep((s) => Math.min(4, s + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {language === 'en' ? 'Continue' : 'Nastavi'}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              disabled={!canSubmit || submitting}
              onClick={handleSubmitBooking}
              loading={submitting}
            >
              {submitting ? '...' : language === 'en' ? 'Confirm' : 'Potvrdi'}
            </Button>
          )}
        </div>

        {/* Expandable Mobile Summary Drawer */}
        {showMobileSummary && (
          <div className="mt-3 pt-3 border-t border-[#182C24] max-h-[70vh] overflow-y-auto">
            <BookingSummarySidebar
              selectedPkg={selectedPkg}
              selectedDate={selectedDate}
              selectedDep={selectedDep}
              adultCount={adultCount}
              childCount={childCount}
              selectedAddonIds={selectedAddonIds}
              addons={addons}
              language={language}
              onEditSection={(s) => {
                setShowMobileSummary(false);
                handleStepJump(s);
              }}
              isMobileDrawer={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
