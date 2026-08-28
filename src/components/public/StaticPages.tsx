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
  AlertTriangle,
  Car,
  Clock,
} from 'lucide-react';

interface StaticPagesProps {
  page: 'about' | 'safety' | 'terms' | 'cancellation-policy' | 'privacy';
  onBack: () => void;
  onBook: () => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page, onBack, onBook }) => {
  const { language } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'en' ? 'Back to Homepage' : 'Nazad na Početnu'}</span>
        </button>

        {page === 'terms' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <FileText className="w-6 h-6 text-emerald-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Uslovi Korištenja i Pravila Učešća</h1>
                <span className="text-xs text-slate-400">Verzija: v1.0-2026 • Neretva Rafting Konjic</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <h3 className="text-base font-bold text-white">1. Opšte Odredbe i Rezervacije</h3>
              <p>
                Rezervacija raftinga putem naše web platforme predstavlja zahtjev koji se odmah potvrđuje. Cijene su izražene u Konvertibilnim markama (BAM) sa uključenim PDV-om. Plaćanje se vrši na samoj rafting bazi prije početka ture gotovinom ili platnim karticama.
              </p>

              <h3 className="text-base font-bold text-white">2. Sigurnosna Pravila i Oprema</h3>
              <p>
                Svaki učesnik je obavezan nositi zaštitnu opremu (prsluk visoke plovnosti, kacigu i neoprensko odijelo) tokom cijelog trajanja spusta niz rijeku. Uputstva skipera su obavezujuća.
              </p>

              <h3 className="text-base font-bold text-white">3. Zdravstveno Stanje i Sigurnost</h3>
              <p>
                Učesnici pod uticajem alkohola ili opojnih sredstava neće moći pristupiti spustu bez prava na povrat novca. Osobe sa hroničnim oboljenjima dužne su obavijestiti osoblje prije polaska.
              </p>
            </div>
          </div>
        )}

        {page === 'cancellation-policy' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <RefreshCcw className="w-6 h-6 text-emerald-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Pravila Otkazivanja i Fleksibilnost</h1>
                <span className="text-xs text-slate-400">Pošteni uslovi za sve goste</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <h3 className="text-base font-bold text-white">1. Otkazivanje od Strane Gosta</h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li>
                  <strong>Više od 48 sati prije polaska:</strong> Besplatno otkazivanje bez ikakvih naknada.
                </li>
                <li>
                  <strong>Manje od 48 sati prije polaska:</strong> Mogućnost besplatnog pomjeranja termina na bilo koji drugi slobodan datum u sezoni.
                </li>
              </ul>

              <h3 className="text-base font-bold text-white">2. Otkazivanje Zbog Vremenskih Uslova (Viša Sila)</h3>
              <p>
                U slučaju ekstremnog vodostaja Neretve, Neretva Rafting Konjic zadržava pravo odgađanja ture radi sigurnosti učesnika uz ponudu novog termina ili povrata.
              </p>
            </div>
          </div>
        )}

        {page === 'privacy' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Lock className="w-6 h-6 text-emerald-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Politika Privatnosti i Zaštite Podataka</h1>
                <span className="text-xs text-slate-400">GDPR & Zakon o zaštiti ličnih podataka BiH</span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                Neretva Rafting Konjic prikuplja isključivo osnovne kontakt podatke neophodne za organizaciju ture, raspored opreme, osiguranje i direktnu komunikaciju.
              </p>
              <p>
                Vaši podaci se nikada ne prodaju niti dijele sa trećim licima.
              </p>
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <button
            onClick={onBook}
            className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm shadow-md"
          >
            Rezerviši Svoj Termin
          </button>
        </div>
      </div>
    </div>
  );
};

export const SafetyStandardsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 max-w-4xl mx-auto space-y-8">
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Nazad na Početnu</span>
    </button>
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <ShieldCheck className="w-8 h-8 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-extrabold text-white">Sigurnosni Standardi & IRF Protokoli</h1>
          <p className="text-xs text-slate-400">Sigurnost na prvom mjestu tokom cijelog spusta niz rijeku Neretvu</p>
        </div>
      </div>
      <div className="space-y-4 text-sm text-slate-300">
        <p>
          Svi naši skiperi posjeduju međunarodne licence International Rafting Federation (IRF Class III/IV) i položene ispite iz spašavanja na brzim vodama (Rescue 3).
        </p>
        <p>
          Oprema uključuje profesionalna neoprenska odijela (5mm), neoprenske čizmice, atestirane spasilačke prsluke sa visokim uzgonom (CE EN ISO 12402-5) i kacige za divlje vode.
        </p>
      </div>
    </div>
  </div>
);

export const RakitnicaCanyonPage: React.FC<{ onBack: () => void; onBook: () => void }> = ({
  onBack,
  onBook,
}) => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 max-w-4xl mx-auto space-y-8">
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Nazad na Početnu</span>
    </button>
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <Compass className="w-8 h-8 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-extrabold text-white">Kanjon Rakitnice & Ušće u Neretvu</h1>
          <p className="text-xs text-slate-400">Najdublji i najimpresivniji kanjon u Dinaridima</p>
        </div>
      </div>
      <div className="space-y-4 text-sm text-slate-300">
        <p>
          Kanjon rijeke Rakitnice je jedan od najdubljih kanjona u Evropi sa liticama koje dosežu i preko 800 metara.
          Tokom rafting ture na dionici Glavatičevo – Džajići, pravimo posebnu pauzu na ušću Rakitnice gdje gosti mogu
          uživati u kupanju pod vodopadima, plivanju u kristalno čistoj vodi i istraživanju netaknute prirode.
        </p>
      </div>
      <button
        onClick={onBook}
        className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm shadow-md"
      >
        Rezerviši Rakitnica Paket
      </button>
    </div>
  </div>
);

export const MeetingPointDirectionsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 max-w-4xl mx-auto space-y-8">
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Nazad na Početnu</span>
    </button>
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <MapPin className="w-8 h-8 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-extrabold text-white">Kako Doći do Rafting Baze (Džajići)</h1>
          <p className="text-xs text-slate-400">Džajići bb, 88400 Konjic • 6 km uzvodno od centra Konjica</p>
        </div>
      </div>
      <div className="space-y-4 text-sm text-slate-300">
        <p>
          Iz pravca Sarajeva (M17): Na ulazu u Konjic skrenite lijevo prema Boračkom jezeru / Glavatičevu. Pratite cestu 6 km uz rijeku Neretvu do table "Džajića Buk Rafting".
        </p>
        <p>
          Iz pravca Mostara (M17): Prođite kroz Konjic prema Sarajevu, te na izlazu skrenite desno prema Glavatičevu.
        </p>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <strong>GPS Koordinate:</strong> 43.6267° N, 17.9942° E • Osiguran besplatan parking za sve goste.
        </div>
      </div>
    </div>
  </div>
);

export const ContactPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 max-w-4xl mx-auto space-y-8">
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Nazad na Početnu</span>
    </button>
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Kontakt & Informacije</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <Phone className="w-5 h-5 text-emerald-400 mb-2" />
          <strong className="block text-white">Telefon / WhatsApp:</strong>
          <a href="tel:+38761123456" className="text-slate-300 hover:text-emerald-400">
            +387 61 123 456
          </a>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <Mail className="w-5 h-5 text-emerald-400 mb-2" />
          <strong className="block text-white">Email:</strong>
          <a href="mailto:info@neretvalive.ba" className="text-slate-300 hover:text-emerald-400">
            info@neretvalive.ba
          </a>
        </div>
      </div>
    </div>
  </div>
);
