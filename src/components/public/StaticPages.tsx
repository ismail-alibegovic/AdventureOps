import React from 'react';
import { useTranslation } from '../../locales/i18n';
import {
  ShieldCheck,
  ArrowLeft,
  FileText,
  Lock,
  RefreshCcw,
  MapPin,
  Phone,
  Mail,
  Compass,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  CreditCard,
  UserCheck,
  CloudRain,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const PrivacyPolicyPage: React.FC<{ onBack: () => void; onBook?: () => void }> = ({
  onBack,
  onBook,
}) => {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4 text-emerald-400" />}
        >
          {language === 'en' ? 'Back to Homepage' : 'Nazad na Početnu'}
        </Button>

        <Card variant="elevated" padding="lg" className="space-y-8 bg-[#0E1A17] border-[#1F332C]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#1F332C] pb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {language === 'en' ? 'Privacy Policy' : 'Politika Privatnosti'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'en'
                  ? 'AdventureOps • Neretva Rafting Konjic • Effective Season 2026'
                  : 'AdventureOps • Neretva Rafting Konjic • Sezona 2026'}
              </p>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            {/* 1. Information We Collect */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{language === 'en' ? '1. Information We Collect' : '1. Informacije Koje Prikupljamo'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'When you submit a reservation request or contact our dispatch team, we collect only essential information required to coordinate your river excursion. This includes lead guest name, contact details (email address, phone / WhatsApp number), group size, chosen package, and any voluntary operational notes such as dietary preferences or arrival time.'
                  : 'Prilikom slanja zahtjeva za rezervaciju ili kontakta s našim dispečerskim timom, prikupljamo isključivo osnovne podatke potrebne za organizaciju vaše ture: ime i prezime nosioca rezervacije, kontakt podatke (email, broj telefona / WhatsApp), broj učesnika, odabrani paket i eventualne napomene poput posebnih prehrambenih preferencija ili vremena dolaska.'}
              </p>
            </div>

            {/* 2. How We Use Information */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{language === 'en' ? '2. How We Use Information' : '2. Kako Koristimo Podatke'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'Your information is used strictly for operational and safety logistics: sizing protective gear (wetsuits, helmets, life jackets), assigning certified skippers and rafts, organizing traditional riverside meals, and managing base departures efficiently.'
                  : 'Vaši podaci se koriste isključivo u operativne i sigurnosne svrhe: priprema odgovarajuće zaštitne opreme (odijela, kacige, prsluci), raspored licenciranih skipera i čamaca, organizacija obroka na bazi i upravljanje terminima polazaka.'}
              </p>
            </div>

            {/* 3. Booking Information */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{language === 'en' ? '3. Booking Information & Records' : '3. Evidencija Rezervacija'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'Each booking generates a unique reservation reference code (e.g. NR-2026-XXXX). This code allows you and our dispatch team to quickly look up, review, or update departure details. Booking records are stored within our secure dispatch database.'
                  : 'Svaka rezervacija generiše jedinstveni referentni kod (npr. NR-2026-XXXX). Ovaj kod omogućava vama i našem timu brz pregled i ažuriranje detalja polaska. Evidencija se čuva u našoj sigurnoj dispečerskoj bazi.'}
              </p>
            </div>

            {/* 4. Communication */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{language === 'en' ? '4. Communication' : '4. Komunikacija'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'We communicate solely regarding your active reservation: booking receipts, departure confirmations, meeting point navigation instructions, and vital river safety or weather updates. We do not sell, rent, or distribute contact details to marketing agencies or unauthorized third parties.'
                  : 'Komuniciramo isključivo u vezi s vašom aktivnom rezervacijom: potvrde polaska, uputstva za dolazak na bazu i važne obavijesti o vodostaju ili vremenskim prilikama. Vaše podatke ne prodajemo niti dijelimo sa marketinškim agencijama.'}
              </p>
            </div>

            {/* 5. Data Retention */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{language === 'en' ? '5. Data Retention' : '5. Zadržavanje Podataka'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'Operational reservation records are retained for the duration of the current rafting season and required operational auditing periods. Guests may request removal or modification of their contact information at any time following their completed excursion.'
                  : 'Operativni podaci o rezervacijama čuvaju se tokom trajanja tekuće rafting sezone i potrebnih operativnih evidencija. Gosti u svakom trenutku mogu zatražiti izmjenu ili brisanje svojih podataka nakon završetka ture.'}
              </p>
            </div>

            {/* 6. Contact */}
            <div className="space-y-2 pt-2 border-t border-[#1F332C]">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{language === 'en' ? '6. Contact & Data Inquiries' : '6. Kontakt za Privatnost Podataka'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'For any questions or data inquiries, please reach out directly to our operations desk:'
                  : 'Za sva pitanja u vezi s vašim podacima možete se direktno obratiti našem dispečerskom timu:'}
              </p>
              <div className="p-4 rounded-xl bg-[#091412] border border-[#1F332C] text-xs text-slate-300 space-y-1 mt-2">
                <p>
                  <strong>Neretva Rafting Konjic — Base Džajića Buk</strong>
                </p>
                <p>Džajići bb, 88400 Konjic, Bosnia & Herzegovina</p>
                <p>
                  Email:{' '}
                  <a href="mailto:info@neretvaraftingkonjic.ba" className="text-emerald-400 hover:underline">
                    info@neretvaraftingkonjic.ba
                  </a>{' '}
                  • Tel/WhatsApp:{' '}
                  <a href="tel:+38761123456" className="text-emerald-400 hover:underline">
                    +387 61 123 456
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const TermsAndCancellationPage: React.FC<{ onBack: () => void; onBook?: () => void }> = ({
  onBack,
  onBook,
}) => {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4 text-emerald-400" />}
        >
          {language === 'en' ? 'Back to Homepage' : 'Nazad na Početnu'}
        </Button>

        <Card variant="elevated" padding="lg" className="space-y-8 bg-[#0E1A17] border-[#1F332C]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#1F332C] pb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                {language === 'en' ? 'Terms & Cancellation Policy' : 'Uslovi Poslovanja i Pravila Otkazivanja'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'en'
                  ? 'AdventureOps • River Rafting Operations Standards • Season 2026'
                  : 'AdventureOps • Standardi Rafting Operacija • Sezona 2026'}
              </p>
            </div>
          </div>

          {/* Terms Content */}
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            {/* 1. Booking Requests */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{language === 'en' ? '1. Booking Requests' : '1. Zahtjevi za Rezervaciju'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'Submitting a reservation online records a departure request with our operations desk. If automatic confirmation is enabled for open slots, your spot is secured immediately. In cases requiring manual capacity review (such as large groups or peak weekend slots), requests receive a "Requested" status while our team confirms skipper and equipment allocations.'
                  : 'Slanje online rezervacije evidentira vaš zahtjev u našem dispečerskom sistemu. Ukoliko je omogućena automatska potvrda za slobodne termine, vaše mjesto je odmah osigurano. Za veće grupe ili specifične termine, zahtjev ima status "Zaprimljen" dok naš tim ne provjeri raspored skipera i opreme.'}
              </p>
            </div>

            {/* 2. Booking Confirmation */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{language === 'en' ? '2. Booking Confirmation' : '2. Potvrda Rezervacije'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'Once confirmed, your booking is locked into our daily river dispatch roster. You will receive your official reservation reference code along with arrival instructions, meeting times at Base Džajića Buk, and safety preparation notes.'
                  : 'Nakon potvrde, vaša rezervacija je uvrštena u dnevni raspored polazaka. Dobijate službeni referentni kod sa satnicom dolaska na bazu Džajića Buk i uputstvima za pripremu.'}
              </p>
            </div>

            {/* 3. Payment */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{language === 'en' ? '3. Payment & Pricing' : '3. Plaćanje i Cijene'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'All tour rates are clearly displayed in BAM (Bosnian Convertible Mark) with approximate EUR references. Payments are settled upon arrival at the base prior to gear fitting. We accept cash (BAM/EUR) and major payment cards. No unexpected hidden fees or river access charges are added.'
                  : 'Sve cijene su jasno istaknute u BAM (sa informativnim EUR iznosima). Plaćanje se obavlja po dolasku na rafting bazu prije preuzimanja opreme (gotovina ili kartice). Nema skrivenih troškova niti naknadnih doplata za pristup rijeci.'}
              </p>
            </div>

            {/* 4. Guest Responsibilities */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>{language === 'en' ? '4. Guest Responsibilities' : '4. Odgovornosti Učesnika'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'Guests agree to arrive at the designated meeting point at least 30 minutes before the scheduled river launch for equipment fitting and the mandatory safety briefing. Guests must declare relevant medical conditions (e.g. cardiac conditions, severe allergies) to their guide in advance.'
                  : 'Učesnici su dužni doći na bazu najmanje 30 minuta prije zakazanog polaska radi zaduživanja opreme i obaveznog sigurnosnog brifinga. Molimo goste da unaprijed obavijeste osoblje o eventualnim medicinskim stanjima.'}
              </p>
            </div>

            {/* 5. Cancellation by Guest */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 text-emerald-400" />
                <span>{language === 'en' ? '5. Cancellation Policy' : '5. Pravila Otkazivanja od Strane Gosta'}</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li>
                  <strong>{language === 'en' ? 'More than 48 hours notice:' : 'Više od 48 sati prije polaska:'}</strong>{' '}
                  {language === 'en'
                    ? 'Free cancellation with zero penalty or fee.'
                    : 'Besplatno otkazivanje bez ikakve naknade.'}
                </li>
                <li>
                  <strong>{language === 'en' ? 'Less than 48 hours notice:' : 'Manje od 48 sati prije polaska:'}</strong>{' '}
                  {language === 'en'
                    ? 'Flexible rescheduling to any open departure date during the current operating season at no additional charge.'
                    : 'Mogućnost besplatnog pomjeranja na bilo koji slobodan termin tokom tekuće sezone.'}
                </li>
              </ul>
            </div>

            {/* 6. Operator Cancellation */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-400" />
                <span>{language === 'en' ? '6. Operator Cancellation' : '6. Otkazivanje od Strane Organizatora'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'In the unlikely event that AdventureOps must cancel a scheduled departure due to sudden logistical constraints, guests will be notified immediately and offered priority rescheduling or a complete cancellation with no obligation.'
                  : 'U rijetkim slučajevima kada je organizator prinuđen otkazati polazak usljed vanrednih okolnosti, gosti će biti blagovremeno obaviješteni uz ponudu prioritetnog novog termina ili punog otkaza bez obaveza.'}
              </p>
            </div>

            {/* 7. Weather / River Conditions */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-emerald-400" />
                <span>{language === 'en' ? '7. Weather & River Conditions' : '7. Vremenske Prilike i Vodostaj'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'Rafting operates in standard mountain rain and shine conditions (wetsuits provide thermal insulation). However, if river discharge exceeds safe operational thresholds or severe storm warnings are issued, our lead safety warden may adjust the river section or reschedule the tour for guest safety.'
                  : 'Rafting se održava i po kiši (neoprenska odijela pružaju termičku zaštitu). Međutim, u slučaju ekstremnog porasta vodostaja ili nevremena koje ugrožava sigurnost, tura se može prilagoditi sigurnijoj dionici ili pomjeriti na novi termin.'}
              </p>
            </div>

            {/* 8. Safety Requirements */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-white font-display flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{language === 'en' ? '8. Safety Requirements & Gear' : '8. Sigurnosni Zahtjevi i Oprema'}</span>
              </h2>
              <p>
                {language === 'en'
                  ? 'All participants are required to wear provided CE-certified high-buoyancy life jackets, whitewater helmets, and neoprene river booties throughout the water journey. Skippers instructions must be obeyed at all times. Persons under the influence of alcohol or substances are strictly barred from participating.'
                  : 'Svi učesnici su obavezni nositi CE atestirani spasilački prsluk, kacigu za divlje vode i neoprensku obuću tokom cijelog boravka na vodi. Uputstva skipera su strogo obavezujuća. Učesnicima pod uticajem alkohola ili opojnih sredstava nije dozvoljen ulazak u čamac.'}
              </p>
            </div>
          </div>

          {onBook && (
            <div className="text-center pt-4 border-t border-[#1F332C]">
              <Button
                variant="primary"
                size="md"
                onClick={onBook}
                leftIcon={<Calendar className="w-4 h-4 text-slate-950" />}
              >
                {language === 'en' ? 'Book Your Rafting Adventure' : 'Rezerviši Svoj Termin'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export const SafetyStandardsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { language } = useTranslation();
  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4 text-emerald-400" />}
        >
          {language === 'en' ? 'Back to Homepage' : 'Nazad na Početnu'}
        </Button>
        <Card variant="elevated" padding="lg" className="space-y-6 bg-[#0E1A17] border-[#1F332C]">
          <div className="flex items-center gap-3 border-b border-[#1F332C] pb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-extrabold text-white font-display">
                {language === 'en' ? 'Safety Standards & Protocols' : 'Sigurnosni Standardi & Protokoli'}
              </h1>
              <p className="text-xs text-slate-400">
                {language === 'en'
                  ? 'Guiding protocols and safety equipment on the Neretva River'
                  : 'Sigurnosni protokoli i provjerena oprema na rijeci Neretvi'}
              </p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              {language === 'en'
                ? 'All river skippers hold certified river guide credentials and have completed Swiftwater Rescue training. Every commercial trip is led with safety and guest comfort as the paramount priority.'
                : 'Svi naši skiperi posjeduju važeće licence za riječne vodiče i završenu obuku za spašavanje na brzim vodama. Svaki spust se vodi s naglaskom na maksimalnu sigurnost i udobnost gostiju.'}
            </p>
            <p>
              {language === 'en'
                ? 'Gear includes tailored 5mm neoprene wetsuits, river booties, high-buoyancy CE EN ISO 12402-5 life jackets, and impact-tested water helmets.'
                : 'Oprema uključuje profesionalna neoprenska odijela (5mm), neoprenske čizmice, atestirane spasilačke prsluke sa visokim uzgonom (CE EN ISO 12402-5) i kacige za divlje vode.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#091412] border border-[#1F332C] text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'en' ? 'Daily River Level Inspection' : 'Svakodnevna provjera vodostaja'}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#091412] border border-[#1F332C] text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'en' ? 'Rescue Throwbags & First Aid on Every Boat' : 'Spasilačka oprema u svakom čamcu'}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const RakitnicaCanyonPage: React.FC<{ onBack: () => void; onBook: () => void }> = ({
  onBack,
  onBook,
}) => {
  const { language } = useTranslation();
  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4 text-emerald-400" />}
        >
          {language === 'en' ? 'Back to Homepage' : 'Nazad na Početnu'}
        </Button>
        <Card variant="elevated" padding="lg" className="space-y-6 bg-[#0E1A17] border-[#1F332C]">
          <div className="flex items-center gap-3 border-b border-[#1F332C] pb-4">
            <Compass className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-extrabold text-white font-display">
                {language === 'en' ? 'Rakitnica Canyon & River Confluence' : 'Kanjon Rakitnice & Ušće u Neretvu'}
              </h1>
              <p className="text-xs text-slate-400">
                {language === 'en'
                  ? 'One of Europe’s deepest and most dramatic canyon gorges'
                  : 'Najdublji i najimpresivniji kanjon u Dinaridima'}
              </p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              {language === 'en'
                ? 'The Rakitnica river canyon is one of the deepest gorges in the Dinaric Alps with canyon walls soaring over 800 meters. During our Glavatičevo – Džajići tour, we make a scenic stop at the pristine confluence where guests enjoy swimming beneath waterfalls and exploring raw nature.'
                : 'Kanjon rijeke Rakitnice je jedan od najdubljih kanjona u Evropi sa liticama koje dosežu i preko 800 metara. Tokom rafting ture na dionici Glavatičevo – Džajići, pravimo posebnu pauzu na ušću Rakitnice gdje gosti mogu uživati u kupanju pod vodopadima, plivanju u kristalno čistoj vodi i istraživanju netaknute prirode.'}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={onBook}
            leftIcon={<Calendar className="w-4 h-4 text-slate-950" />}
          >
            {language === 'en' ? 'Book Canyon Explorer Experience' : 'Rezerviši Rakitnica Paket'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export const MeetingPointDirectionsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { language } = useTranslation();
  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4 text-emerald-400" />}
        >
          {language === 'en' ? 'Back to Homepage' : 'Nazad na Početnu'}
        </Button>
        <Card variant="elevated" padding="lg" className="space-y-6 bg-[#0E1A17] border-[#1F332C]">
          <div className="flex items-center gap-3 border-b border-[#1F332C] pb-4">
            <MapPin className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-extrabold text-white font-display">
                {language === 'en' ? 'How to Reach the Rafting Base' : 'Kako Doći do Rafting Baze (Džajići)'}
              </h1>
              <p className="text-xs text-slate-400">Džajići bb, 88400 Konjic • 5 km upstream from Konjic center</p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              <strong>{language === 'en' ? 'From Sarajevo (M17):' : 'Iz pravca Sarajeva (M17):'}</strong>{' '}
              {language === 'en'
                ? 'At the entrance to Konjic, turn left following signs for Boračko Lake / Glavatičevo. Drive 5 km along the river to the base entrance at Džajića Buk.'
                : 'Na ulazu u Konjic skrenite lijevo prema Boračkom jezeru / Glavatičevu. Pratite cestu 5 km uz rijeku Neretvu do table "Džajića Buk Rafting".'}
            </p>
            <p>
              <strong>{language === 'en' ? 'From Mostar (M17):' : 'Iz pravca Mostara (M17):'}</strong>{' '}
              {language === 'en'
                ? 'Pass through Konjic toward Sarajevo, and at the bridge exit turn right toward Glavatičevo.'
                : 'Prođite kroz Konjic prema Sarajevu, te na izlazu skrenite desno prema Glavatičevu.'}
            </p>
            <div className="p-4 rounded-xl bg-[#081210] border border-[#1F332C] text-xs text-slate-300">
              <strong>GPS Coordinates:</strong> 43.6492° N, 17.9628° E • Free secure on-site parking available for 50+ vehicles.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const ContactPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { language } = useTranslation();
  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4 text-emerald-400" />}
        >
          {language === 'en' ? 'Back to Homepage' : 'Nazad na Početnu'}
        </Button>
        <Card variant="elevated" padding="lg" className="space-y-6 bg-[#0E1A17] border-[#1F332C]">
          <h1 className="text-2xl font-extrabold text-white font-display">
            {language === 'en' ? 'Contact & Base Operations Desk' : 'Kontakt & Informacije'}
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-5 rounded-2xl bg-[#081210] border border-[#1F332C]">
              <Phone className="w-5 h-5 text-emerald-400 mb-2" />
              <strong className="block text-white font-display">Phone / WhatsApp Desk:</strong>
              <a href="tel:+38761123456" className="text-slate-300 hover:text-emerald-400">
                +387 61 123 456
              </a>
            </div>
            <div className="p-5 rounded-2xl bg-[#081210] border border-[#1F332C]">
              <Mail className="w-5 h-5 text-emerald-400 mb-2" />
              <strong className="block text-white font-display">Email:</strong>
              <a href="mailto:info@neretvaraftingkonjic.ba" className="text-slate-300 hover:text-emerald-400">
                info@neretvaraftingkonjic.ba
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
