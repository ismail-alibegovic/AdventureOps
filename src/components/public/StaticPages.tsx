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
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface StaticPagesProps {
  page: 'about' | 'safety' | 'terms' | 'cancellation-policy' | 'privacy';
  onBack: () => void;
  onBook: () => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page, onBack, onBook }) => {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4 text-emerald-400" />}
        >
          {language === 'en' ? 'Back to Homepage' : 'Nazad na Početnu'}
        </Button>

        {page === 'terms' && (
          <Card variant="elevated" padding="lg" className="space-y-6 bg-[#0E1A17] border-[#1F332C]">
            <div className="flex items-center gap-3 border-b border-[#1F332C] pb-4">
              <FileText className="w-6 h-6 text-emerald-400" />
              <div>
                <h1 className="text-2xl font-bold text-white font-display">
                  {language === 'en' ? 'Terms of Service & Participation Rules' : 'Uslovi Korištenja i Pravila Učešća'}
                </h1>
                <span className="text-xs text-slate-400">
                  {language === 'en' ? 'Version: v1.0-2026 • AdventureOps Neretva Rafting' : 'Verzija: v1.0-2026 • Neretva Rafting Konjic'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <h3 className="text-base font-bold text-white font-display">
                {language === 'en' ? '1. General Provisions & Reservations' : '1. Opšte Odredbe i Rezervacije'}
              </h3>
              <p>
                {language === 'en'
                  ? 'Booking a rafting tour through our platform reserves your departure immediately. All prices are in BAM and EUR including VAT. Payment is settled upon arrival at the base in cash or card.'
                  : 'Rezervacija raftinga putem naše web platforme predstavlja zahtjev koji se odmah potvrđuje. Cijene su izražene u Konvertibilnim markama (BAM) sa uključenim PDV-om. Plaćanje se vrši na samoj rafting bazi prije početka ture gotovinom ili platnim karticama.'}
              </p>

              <h3 className="text-base font-bold text-white font-display">
                {language === 'en' ? '2. Safety Rules & Mandatory Gear' : '2. Sigurnosna Pravila i Oprema'}
              </h3>
              <p>
                {language === 'en'
                  ? 'Every participant must wear certified protective gear (PFD buoyancy vest, helmet, and neoprene wetsuit) for the entire duration on water. Instructions given by IRF guides are mandatory.'
                  : 'Svaki učesnik je obavezan nositi zaštitnu opremu (prsluk visoke plovnosti, kacigu i neoprensko odijelo) tokom cijelog trajanja spusta niz rijeku. Uputstva skipera su obavezujuća.'}
              </p>

              <h3 className="text-base font-bold text-white font-display">
                {language === 'en' ? '3. Health & Conduct' : '3. Zdravstveno Stanje i Sigurnost'}
              </h3>
              <p>
                {language === 'en'
                  ? 'Participants under the influence of alcohol or substances are barred from water activities without refund. Please inform staff of any medical conditions prior to departure.'
                  : 'Učesnici pod uticajem alkohola ili opojnih sredstava neće moći pristupiti spustu bez prava na povrat novca. Osobe sa hroničnim oboljenjima dužne su obavijestiti osoblje prije polaska.'}
              </p>
            </div>
          </Card>
        )}

        {page === 'cancellation-policy' && (
          <Card variant="elevated" padding="lg" className="space-y-6 bg-[#0E1A17] border-[#1F332C]">
            <div className="flex items-center gap-3 border-b border-[#1F332C] pb-4">
              <RefreshCcw className="w-6 h-6 text-emerald-400" />
              <div>
                <h1 className="text-2xl font-bold text-white font-display">
                  {language === 'en' ? 'Cancellation Policy & Flexibility' : 'Pravila Otkazivanja i Fleksibilnost'}
                </h1>
                <span className="text-xs text-slate-400">
                  {language === 'en' ? 'Fair terms for all adventurers' : 'Pošteni uslovi za sve goste'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <h3 className="text-base font-bold text-white font-display">
                {language === 'en' ? '1. Guest Cancellations' : '1. Otkazivanje od Strane Gosta'}
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>
                  <strong>{language === 'en' ? 'More than 48 hours prior:' : 'Više od 48 sati prije polaska:'}</strong>{' '}
                  {language === 'en' ? 'Free cancellation with zero fees.' : 'Besplatno otkazivanje bez ikakvih naknada.'}
                </li>
                <li>
                  <strong>{language === 'en' ? 'Less than 48 hours prior:' : 'Manje od 48 sati prije polaska:'}</strong>{' '}
                  {language === 'en'
                    ? 'Free rescheduling to any other open date during the current season.'
                    : 'Mogućnost besplatnog pomjeranja termina na bilo koji drugi slobodan datum u sezoni.'}
                </li>
              </ul>

              <h3 className="text-base font-bold text-white font-display">
                {language === 'en' ? '2. Weather & River Level Policy' : '2. Otkazivanje Zbog Vremenskih Uslova (Viša Sila)'}
              </h3>
              <p>
                {language === 'en'
                  ? 'In the rare event of extreme water discharge or severe storm alerts, we reserve the right to reschedule for participant safety.'
                  : 'U slučaju ekstremnog vodostaja Neretve, Neretva Rafting Konjic zadržava pravo odgađanja ture radi sigurnosti učesnika uz ponudu novog termina ili povrata.'}
              </p>
            </div>
          </Card>
        )}

        {page === 'privacy' && (
          <Card variant="elevated" padding="lg" className="space-y-6 bg-[#0E1A17] border-[#1F332C]">
            <div className="flex items-center gap-3 border-b border-[#1F332C] pb-4">
              <Lock className="w-6 h-6 text-emerald-400" />
              <div>
                <h1 className="text-2xl font-bold text-white font-display">
                  {language === 'en' ? 'Privacy Policy & Data Security' : 'Politika Privatnosti i Zaštite Podataka'}
                </h1>
                <span className="text-xs text-slate-400">GDPR & Data Protection Compliant</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                {language === 'en'
                  ? 'AdventureOps collects only essential contact and participant details necessary for organizing your river departure, fitting protective gear, and providing direct logistical updates.'
                  : 'Neretva Rafting Konjic prikuplja isključivo osnovne kontakt podatke neophodne za organizaciju ture, raspored opreme, osiguranje i direktnu komunikaciju.'}
              </p>
              <p>
                {language === 'en'
                  ? 'Your data is strictly confidential and is never sold or shared with external advertising third parties.'
                  : 'Vaši podaci se nikada ne prodaju niti dijele sa trećim licima.'}
              </p>
            </div>
          </Card>
        )}

        <div className="text-center pt-4">
          <Button
            variant="primary"
            size="md"
            onClick={onBook}
            leftIcon={<Calendar className="w-4 h-4 text-slate-950" />}
          >
            {language === 'en' ? 'Book Your Adventure' : 'Rezerviši Svoj Termin'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const SafetyStandardsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { language } = useTranslation();
  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 py-16 px-4 max-w-4xl mx-auto space-y-8">
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
              {language === 'en' ? 'Safety Standards & IRF Protocols' : 'Sigurnosni Standardi & IRF Protokoli'}
            </h1>
            <p className="text-xs text-slate-400">
              {language === 'en'
                ? 'Utmost safety protocol across all 23 km of the Neretva River'
                : 'Sigurnost na prvom mjestu tokom cijelog spusta niz rijeku Neretvu'}
            </p>
          </div>
        </div>
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            {language === 'en'
              ? 'All river skippers hold International Rafting Federation (IRF Class III/IV) certifications and completed Swiftwater Rescue credentials (Rescue 3).'
              : 'Svi naši skiperi posjeduju međunarodne licence International Rafting Federation (IRF Class III/IV) i položene ispite iz spašavanja na brzim vodama (Rescue 3).'}
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
  );
};

export const RakitnicaCanyonPage: React.FC<{ onBack: () => void; onBook: () => void }> = ({
  onBack,
  onBook,
}) => {
  const { language } = useTranslation();
  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 py-16 px-4 max-w-4xl mx-auto space-y-8">
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
  );
};

export const MeetingPointDirectionsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { language } = useTranslation();
  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 py-16 px-4 max-w-4xl mx-auto space-y-8">
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
  );
};

export const ContactPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { language } = useTranslation();
  return (
    <div className="min-h-screen bg-[#07110F] text-slate-100 py-16 px-4 max-w-4xl mx-auto space-y-8">
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
  );
};
