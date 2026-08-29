import React from 'react';
import { User, Mail, Phone, Globe, MessageSquare, ShieldCheck } from 'lucide-react';

interface Step3DetailsProps {
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  countryCode: string;
  setCountryCode: (val: string) => void;
  customerNote: string;
  setCustomerNote: (val: string) => void;
  honeypot: string;
  setHoneypot: (val: string) => void;
  language: 'bs' | 'en';
}

export const Step3Details: React.FC<Step3DetailsProps> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phone,
  setPhone,
  countryCode,
  setCountryCode,
  customerNote,
  setCustomerNote,
  honeypot,
  setHoneypot,
  language,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5 border-b border-[#182C24] pb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          {language === 'en' ? 'Lead Guest & Contact Information' : 'Podaci Vođe Grupe & Kontakt'}
        </h2>
        <p className="text-sm text-slate-400">
          {language === 'en'
            ? 'We will send your reservation pass and river briefing instructions to this contact.'
            : 'Na ove podatke ćemo poslati potvrdu rezervacije i upute za dolazak na rafting bazu.'}
        </p>
      </div>

      {/* Hidden spam protection honeypot */}
      <input
        type="text"
        name="website_trap_honeypot"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* Form Fields Section */}
      <div className="space-y-6">
        {/* 1. Personal Information */}
        <div className="bg-[#091612] border border-[#182C24] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
            <User className="w-4 h-4 text-emerald-400" />
            <span>{language === 'en' ? '1. Personal Information' : '1. Osnovni Podaci'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                {language === 'en' ? 'First Name' : 'Ime'} <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={language === 'en' ? 'e.g. John' : 'npr. Emir'}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#0E201A] border border-[#1F382E] focus:border-emerald-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                {language === 'en' ? 'Last Name' : 'Prezime'} <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={language === 'en' ? 'e.g. Smith' : 'npr. Imamović'}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#0E201A] border border-[#1F382E] focus:border-emerald-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* 2. Contact Details */}
        <div className="bg-[#091612] border border-[#182C24] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>{language === 'en' ? '2. Direct Contact' : '2. Kontakt Podaci'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                {language === 'en' ? 'Email Address' : 'Email Adresa'} <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0E201A] border border-[#1F382E] focus:border-emerald-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                {language === 'en' ? 'Phone / WhatsApp Number' : 'Broj Telefona / WhatsApp'} <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="+387 61 234 567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0E201A] border border-[#1F382E] focus:border-emerald-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                {language === 'en' ? 'Country / Region' : 'Država'}
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-[#0E201A] border border-[#1F382E] focus:border-emerald-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="BA">Bosna i Hercegovina (+387)</option>
                  <option value="HR">Hrvatska (+385)</option>
                  <option value="RS">Srbija (+381)</option>
                  <option value="ME">Crna Gora (+382)</option>
                  <option value="SI">Slovenija (+386)</option>
                  <option value="DE">Germany (+49)</option>
                  <option value="AT">Austria (+43)</option>
                  <option value="CH">Switzerland (+41)</option>
                  <option value="NL">Netherlands (+31)</option>
                  <option value="UK">United Kingdom (+44)</option>
                  <option value="US">United States / Canada (+1)</option>
                  <option value="OTHER">{language === 'en' ? 'Other Country' : 'Druga Država'}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Special Requests & Dietary Notes */}
        <div className="bg-[#091612] border border-[#182C24] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>{language === 'en' ? '3. Special Requirements or Notes (Optional)' : '3. Posebne Napomene i Zahtjevi (Opcionalno)'}</span>
          </div>

          <div>
            <textarea
              rows={3}
              placeholder={
                language === 'en'
                  ? 'e.g. Vegetarian/halal meal preferences for 2 people, hotel pick-up required in Konjic, neoprene shoe sizes (42, 44)...'
                  : 'npr. Vegetarijanski meni za 2 osobe, potreban transfer iz hotela u Konjicu, veličine obuće (42, 44)...'
              }
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              className="w-full bg-[#0E201A] border border-[#1F382E] focus:border-emerald-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {language === 'en'
                ? 'Your contact details are strictly kept private for trip dispatch and safety communication only.'
                : 'Vaši podaci se koriste isključivo za potrebe realizacije ture i sigurnosne komunikacije.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
