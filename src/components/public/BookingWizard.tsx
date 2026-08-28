import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../locales/i18n';
import { apiClient } from '../../api/client';
import { Package, Addon, Departure, Booking } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Phone,
  MessageCircle,
  Printer,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  MapPin,
} from 'lucide-react';

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

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Loaded Catalog Data
  const [packages, setPackages] = useState<Package[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [calendarDates, setCalendarDates] = useState<Array<{ date: string; has_availability: boolean; spots_left: number }>>([]);

  // Wizard Form State
  const [selectedPackageId, setSelectedPackageId] = useState<string>(preselectedPackageId || initialPackageId || '');
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate ||
      new Date(Date.now() + 86400000).toISOString().split('T')[0]
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
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);

  // Result state
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

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
      apiClient.getCalendarAvailability(selectedPackageId, currentYear, currentMonth)
        .then(setCalendarDates)
        .catch(console.error);
    }
  }, [selectedPackageId, currentYear, currentMonth]);

  // When date or package changes, fetch departures
  useEffect(() => {
    if (selectedPackageId && selectedDate) {
      apiClient.getDepartures(selectedPackageId, selectedDate)
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

  // Pricing calculations
  const adultSubtotal = selectedPkg ? adultCount * selectedPkg.adult_price : 0;
  const childSubtotal = selectedPkg ? childCount * selectedPkg.child_price : 0;
  const addonsSubtotal = addons
    .filter((a) => selectedAddonIds.includes(a.id))
    .reduce((sum, a) => {
      const multiplier = a.pricing_model === 'per_person' ? totalGuests : 1;
      return sum + a.price * multiplier;
    }, 0);
  const grandTotal = adultSubtotal + childSubtotal + addonsSubtotal;
  const grandTotalEur = Math.round(grandTotal / 1.95583);

  // Validation
  const canProceedStep1 = !!selectedPackageId;
  const canProceedStep2 = !!selectedDate;
  const canProceedStep3 = !!selectedDepartureId && (selectedDep ? selectedDep.spots_left >= totalGuests : true);
  const canProceedStep4 = adultCount >= 1 && totalGuests > 0;
  const canProceedStep6 =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    email.includes('@') &&
    phone.trim().length >= 6;
  const canSubmit = canProceedStep6 && termsAgreed;

  const handleToggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
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
      setStep(8); // Confirmation view
      toast.success(
        language === 'en'
          ? `Booking confirmed! Reference: ${res.reservation_code}`
          : `Rezervacija uspješna! Broj: ${res.reservation_code}`
      );
      if (onFinished) onFinished(res);
    } catch (err: any) {
      toast.error(err.message || 'Booking submission failed. Please try another departure time or contact us.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8 text-emerald-400">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-400" />
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 8: CONFIRMATION SCREEN
  // -------------------------------------------------------------
  if (createdBooking) {
    const pkgName = language === 'en' ? createdBooking.package?.name_en : createdBooking.package?.name_bs;
    const depTime = createdBooking.departure ? new Date(createdBooking.departure.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const depDate = createdBooking.departure ? new Date(createdBooking.departure.start_at).toLocaleDateString(language === 'en' ? 'en-US' : 'bs-BA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const meetTime = createdBooking.departure?.meeting_at ? new Date(createdBooking.departure.meeting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const whatsappMessage = encodeURIComponent(
      `Pozdrav Neretva Rafting Konjic! Moja rezervacija je ${createdBooking.booking_code} za ${createdBooking.first_name} ${createdBooking.last_name} (${createdBooking.guest_count} osoba) na datum ${depDate}. Želim potvrditi detalje dolaska.`
    );

    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-slate-900 border border-emerald-500/60 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 text-slate-100">
          {/* Header Badge */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block">
              Rezervacija Zabilježena
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('confirmed_title')}
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              {t('confirmed_desc')}
            </p>
          </div>

          {/* Booking Reference Hero Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('confirmed_ref')}
            </span>
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-wider">
              {createdBooking.booking_code}
            </div>
            <span className="text-xs text-slate-400 block">
              Sačuvajte ovu šifru za prijavu na bazi ili izmjene rezervacije.
            </span>
          </div>

          {/* Reservation Summary Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-950/60 border border-slate-800 rounded-2xl p-6">
            <div>
              <span className="text-xs text-slate-400 block">Paket:</span>
              <strong className="text-white text-base">{pkgName}</strong>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Datum & Satnica:</span>
              <strong className="text-white text-base">{depDate}</strong>
              <div className="text-xs text-emerald-400">
                Polazak na vodu: {depTime} (Sastanak: {meetTime})
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Broj Učesnika:</span>
              <strong className="text-white">
                {createdBooking.adult_count} odraslih {createdBooking.child_count > 0 ? `+ ${createdBooking.child_count} djece` : ''} ({createdBooking.guest_count} ukupno)
              </strong>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Ukupan Iznos za Plaćanje:</span>
              <strong className="text-emerald-400 text-lg font-extrabold">
                {createdBooking.total_amount} BAM (~{Math.round(createdBooking.total_amount / 1.95583)} €)
              </strong>
              <span className="text-[11px] text-slate-400 block">Plaćanje gotovinom ili karticom na bazi</span>
            </div>
          </div>

          {/* What's Next / Arrival Checklist */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Važne Informacije za Dan Raftinga:</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-2 list-disc pl-5">
              <li>Ponesite kupaći kostim, peškir, suhu odjeću za presvlačenje i kremu za sunčanje.</li>
              <li>Sva neoprenska odijela, čizmice, spasilačke prsluke i kacige zadužujete na bazi.</li>
              <li>Besplatan parking i ormarići za čuvanje ličnih stvari su obezbijeđeni.</li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <a
              href={`https://wa.me/38761123456?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>{t('confirmed_whatsapp_cta')}</span>
            </a>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('confirmed_print_cta')}</span>
            </button>

            <button
              onClick={handleCancel}
              className="w-full sm:w-auto py-3.5 px-5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {t('confirmed_return_home')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE STEP WIZARD FORM
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb Steps Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
          <span>Korak {step} od 7</span>
          <span>
            {step === 1 && t('step1_package')}
            {step === 2 && t('step2_date')}
            {step === 3 && t('step3_departure')}
            {step === 4 && t('step4_guests')}
            {step === 5 && t('step5_addons')}
            {step === 6 && t('step6_contact')}
            {step === 7 && t('step7_review')}
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
        {/* ========================================================= */}
        {/* STEP 1: SELECT PACKAGE */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">{t('step1_package')}</h3>
              <p className="text-sm text-slate-400">
                Izaberite željeni rafting paket prema vremenu i profilu vaše grupe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                const name = language === 'en' ? pkg.name_en : pkg.name_bs;
                const desc = language === 'en' ? pkg.short_description_en : pkg.short_description_bs;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="text-lg font-bold text-white leading-snug">{name}</h4>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-emerald-400 border-emerald-400 text-slate-950'
                              : 'border-slate-700'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-white">
                        {pkg.adult_price} BAM
                      </span>
                      <span className="text-xs text-slate-400">
                        {Math.round(pkg.duration_minutes / 60)}h • {pkg.difficulty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: SELECT DATE */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">{t('step2_date')}</h3>
              <p className="text-sm text-slate-400">
                Izaberite dan za rafting. Zeleni datumi imaju garantovane otvorene polaske.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Date Input */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
                <label className="block text-xs font-semibold text-slate-300">
                  Odaberite datum iz kalendara:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />

                <div className="text-xs text-slate-400 space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>Sezona raftinga je otvorena svakog dana od aprila do oktobra.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    <span>Za veće grupe (&gt;15 osoba) mogući su i vanredni termini.</span>
                  </div>
                </div>
              </div>

              {/* Live Availability Feed */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Slobodni Termini za Mjesec ({currentMonth}/{currentYear})
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-2 text-xs">
                  {calendarDates.slice(0, 10).map((cd) => (
                    <div
                      key={cd.date}
                      onClick={() => setSelectedDate(cd.date)}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                        selectedDate === cd.date
                          ? 'bg-emerald-950/80 border border-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <span className="font-semibold">{cd.date}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          cd.has_availability
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {cd.has_availability ? `${cd.spots_left} mjesta` : 'Popunjeno'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: SELECT DEPARTURE TIME */}
        {/* ========================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">{t('step3_departure')}</h3>
              <p className="text-sm text-slate-400">
                Izaberite satnicu polaska za datum: <strong className="text-white">{selectedDate}</strong>
              </p>
            </div>

            {departures.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Nema definisanih polazaka za ovaj datum</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Kontaktirajte nas direktno na WhatsApp ili izaberite drugi datum.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departures.map((dep) => {
                  const isSelected = selectedDepartureId === dep.id;
                  const isFull = dep.spots_left <= 0;
                  const startTime = new Date(dep.start_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const meetTime = dep.meeting_at
                    ? new Date(dep.meeting_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  return (
                    <div
                      key={dep.id}
                      onClick={() => !isFull && setSelectedDepartureId(dep.id)}
                      className={`rounded-2xl p-5 border transition-all ${
                        isFull
                          ? 'opacity-50 cursor-not-allowed bg-slate-950 border-slate-800'
                          : isSelected
                          ? 'cursor-pointer bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40'
                          : 'cursor-pointer bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-2xl font-extrabold text-white block">{startTime}</span>
                          <span className="text-xs text-slate-400">
                            Sastanak na bazi: <strong className="text-emerald-400">{meetTime}</strong>
                          </span>
                        </div>
                        <div
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            isFull
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {isFull ? 'Popunjeno' : `${dep.spots_left} slobodno`}
                        </div>
                      </div>

                      {/* Progress Bar of Occupancy */}
                      <div className="mt-4 pt-3 border-t border-slate-800 space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Kapacitet polaska</span>
                          <span>
                            {dep.capacity_limit - dep.spots_left} / {dep.capacity_limit} popunjeno
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full"
                            style={{
                              width: `${((dep.capacity_limit - dep.spots_left) / dep.capacity_limit) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: SELECT GUEST COUNTS */}
        {/* ========================================================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">{t('step4_guests')}</h3>
              <p className="text-sm text-slate-400">
                Unesite broj odraslih osoba i djece u vašoj grupi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Adults Counter */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h4 className="text-lg font-bold text-white">{t('adults_label')}</h4>
                    <span className="text-xs text-slate-400">12+ godina</span>
                  </div>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {selectedPkg?.adult_price} BAM / os.
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl p-2">
                  <button
                    type="button"
                    onClick={() => setAdultCount((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-lg cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-extrabold text-white">{adultCount}</span>
                  <button
                    type="button"
                    onClick={() => setAdultCount((prev) => prev + 1)}
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h4 className="text-lg font-bold text-white">{t('children_label')}</h4>
                    <span className="text-xs text-slate-400">Do 12 godina</span>
                  </div>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {selectedPkg?.child_price} BAM / os.
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl p-2">
                  <button
                    type="button"
                    onClick={() => setChildCount((prev) => Math.max(0, prev - 1))}
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-lg cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-extrabold text-white">{childCount}</span>
                  <button
                    type="button"
                    onClick={() => setChildCount((prev) => prev + 1)}
                    className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Total Guests Warning if near capacity */}
            {selectedDep && totalGuests > selectedDep.spots_left && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>
                  Izabrani polazak ima samo {selectedDep.spots_left} slobodnih mjesta, a vi ste unijeli {totalGuests} gostiju.
                  Smanjite broj gostiju ili se vratite na korak 3 i izaberite drugi termin.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 5: OPTIONAL ADD-ONS */}
        {/* ========================================================= */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">{t('step5_addons')}</h3>
              <p className="text-sm text-slate-400">
                Obogatite vaš rafting doživljaj dodatnim uslugama (opcionalno).
              </p>
            </div>

            <div className="space-y-3">
              {addons.map((addon) => {
                const isSelected = selectedAddonIds.includes(addon.id);
                const name = language === 'en' ? addon.name_en : addon.name_bs;
                const desc = language === 'en' ? addon.description_en : addon.description_bs;
                const priceFormatted =
                  addon.pricing_model === 'per_person'
                    ? `${addon.price} BAM / po osobi`
                    : `${addon.price} BAM / fiksno po grupi`;

                return (
                  <div
                    key={addon.id}
                    onClick={() => handleToggleAddon(addon.id)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-emerald-400 border-emerald-400 text-slate-950'
                            : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white">{name}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-emerald-400 block">
                        {addon.price} BAM
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {addon.pricing_model === 'per_person' ? 'po osobi' : 'po grupi'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 6: CONTACT INFORMATION */}
        {/* ========================================================= */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">{t('step6_contact')}</h3>
              <p className="text-sm text-slate-400">
                Podaci vođe grupe za potvrdu rezervacije i kontakt prije polaska.
              </p>
            </div>

            {/* Hidden honeypot for bot spam prevention */}
            <input
              type="text"
              name="website_trap_honeypot"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('first_name_label')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="npr. Emir"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('last_name_label')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="npr. Imamović"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('email_label')} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="emir@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('phone_label')} *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+387 61 234 567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('note_label')}
                </label>
                <textarea
                  rows={3}
                  placeholder="Posebne napomene (npr. vegetarijanski meni za 2 osobe, potreban prevoz iz hotela u Konjicu...)"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 7: ORDER REVIEW & CONFIRMATION */}
        {/* ========================================================= */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">{t('step7_review')}</h3>
              <p className="text-sm text-slate-400">
                Provjerite sažetak vaše rezervacije prije slanja.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Trip details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-400 block">Paket:</span>
                  <strong className="text-white text-base">
                    {language === 'en' ? selectedPkg?.name_en : selectedPkg?.name_bs}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Datum i Vrijeme:</span>
                  <strong className="text-white text-base">{selectedDate}</strong>
                  <span className="text-xs text-emerald-400 block">
                    Polazak u {selectedDep ? new Date(selectedDep.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} (Sastanak: {selectedDep?.meeting_at ? new Date(selectedDep.meeting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Gosti:</span>
                  <strong className="text-white">
                    {adultCount} odraslih {childCount > 0 ? `+ ${childCount} djece` : ''} ({totalGuests} ukupno)
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Kontakt Osoba:</span>
                  <strong className="text-white">
                    {firstName} {lastName} ({phone})
                  </strong>
                </div>
              </div>

              {/* Price Calculation Table */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Odrasli ({adultCount} × {selectedPkg?.adult_price} BAM):</span>
                  <span className="font-semibold text-white">{adultSubtotal} BAM</span>
                </div>

                {childCount > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Djeca ({childCount} × {selectedPkg?.child_price} BAM):</span>
                    <span className="font-semibold text-white">{childSubtotal} BAM</span>
                  </div>
                )}

                {selectedAddonIds.map((aid) => {
                  const add = addons.find((a) => a.id === aid);
                  if (!add) return null;
                  const mult = add.pricing_model === 'per_person' ? totalGuests : 1;
                  const cost = add.price * mult;
                  return (
                    <div key={aid} className="flex justify-between text-slate-300">
                      <span>{language === 'en' ? add.name_en : add.name_bs} ({add.pricing_model === 'per_person' ? `${totalGuests} × ` : ''}{add.price} BAM):</span>
                      <span className="font-semibold text-white">{cost} BAM</span>
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-slate-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-bold text-white block">{t('total_price_label')}</span>
                    <span className="text-xs text-slate-400">{t('pay_on_site_note')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-emerald-400">{grandTotal} BAM</span>
                    <span className="text-xs text-slate-400 block">(~{grandTotalEur} €)</span>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-slate-800 text-xs text-slate-300">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                  />
                  <span>{t('terms_agree')}</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                  />
                  <span>{t('marketing_agree')}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BOTTOM NAVIGATION CONTROLS */}
        {/* ========================================================= */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('step_prev')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Odustani
            </button>
          )}

          {step < 7 ? (
            <button
              type="button"
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3) ||
                (step === 4 && !canProceedStep4) ||
                (step === 6 && !canProceedStep6)
              }
              onClick={() => setStep((prev) => Math.min(7, prev + 1))}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <span>{t('step_next')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmitBooking}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
                  <span>Obrađujem...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t('step_submit')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
