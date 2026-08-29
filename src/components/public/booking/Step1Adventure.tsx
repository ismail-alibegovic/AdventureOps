import React from 'react';
import { Package } from '../../../types';
import { Check, Clock, Compass, Waves, Sparkles } from 'lucide-react';

interface Step1AdventureProps {
  packages: Package[];
  selectedPackageId: string;
  onSelectPackage: (id: string) => void;
  language: 'bs' | 'en';
}

export const Step1Adventure: React.FC<Step1AdventureProps> = ({
  packages,
  selectedPackageId,
  onSelectPackage,
  language,
}) => {
  return (
    <div className="space-y-6">
      {/* Step Introduction */}
      <div className="space-y-1.5 border-b border-[#182C24] pb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          {language === 'en' ? 'Choose Your Rafting Experience' : 'Izaberite Vaš Rafting Paket'}
        </h2>
        <p className="text-sm text-slate-400">
          {language === 'en'
            ? 'All packages include certified EU safety gear, licensed IRF skippers, transport to launch, and full insurance.'
            : 'Svi paketi uključuju atestiranu zaštitnu opremu, licenciranog IRF skipera, transfer do starta i osiguranje.'}
        </p>
      </div>

      {/* Package Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {packages.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id;
          const name = language === 'en' ? pkg.name_en : pkg.name_bs;
          const desc = language === 'en' ? pkg.short_description_en : pkg.short_description_bs;
          const approxEur = Math.round(pkg.adult_price / 1.95583);
          const durationHours = (pkg.duration_minutes / 60).toFixed(0);

          return (
            <div
              key={pkg.id}
              onClick={() => onSelectPackage(pkg.id)}
              className={`relative cursor-pointer rounded-2xl transition-all duration-200 flex flex-col overflow-hidden border text-left group ${
                isSelected
                  ? 'bg-gradient-to-b from-[#0E241C] to-[#071310] border-emerald-400 shadow-xl shadow-emerald-950/50 ring-2 ring-emerald-400/20 -translate-y-1'
                  : 'bg-[#091612] border-[#182C24] hover:border-[#2C4E40] hover:bg-[#0C1C17]'
              }`}
            >
              {/* Optional Featured Ribbon */}
              {pkg.featured && (
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-slate-950" />
                  <span>{language === 'en' ? 'Most Popular' : 'Preporučeno'}</span>
                </div>
              )}

              {/* Package Image Thumbnail */}
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#0A1612]">
                <img
                  src={pkg.image_url || 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80'}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#091612] via-transparent to-black/30" />

                {/* Selection Checkmark Bubble */}
                <div
                  className={`absolute top-3 right-3 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-400 border-emerald-400 text-slate-950 shadow-lg'
                      : 'bg-black/60 border-white/20 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>

                {/* Quick Meta Badges on Image */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white/90">
                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 text-[11px]">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {durationHours}h
                  </span>
                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 text-[11px]">
                    <Waves className="w-3 h-3 text-emerald-400" />
                    {pkg.river_length_km} km
                  </span>
                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10 text-[11px]">
                    <Compass className="w-3 h-3 text-emerald-400" />
                    {pkg.difficulty}
                  </span>
                </div>
              </div>

              {/* Package Content & Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white font-display leading-snug group-hover:text-emerald-300 transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {desc}
                  </p>
                </div>

                {/* Included Keypoints mini-pills */}
                {pkg.included_items_json && pkg.included_items_json.length > 0 && (
                  <div className="pt-2 border-t border-[#182C24]/80 flex flex-wrap gap-1.5">
                    {pkg.included_items_json.slice(0, 3).map((inc, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#122620] text-emerald-300/90 border border-emerald-900/50 px-2 py-0.5 rounded-md truncate max-w-full"
                      >
                        ✓ {inc}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pricing & Selection Footer */}
                <div className="pt-3 border-t border-[#182C24] flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-medium">
                      {language === 'en' ? 'From' : 'Cijena od'}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-400 font-display">
                        {pkg.adult_price}
                      </span>
                      <span className="text-xs font-bold text-slate-300">BAM</span>
                      <span className="text-[11px] text-slate-400 font-mono ml-1">(~{approxEur} €)</span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-emerald-400 text-slate-950 font-bold'
                        : 'bg-[#142620] text-slate-300 group-hover:bg-emerald-950 group-hover:text-emerald-300'
                    }`}
                  >
                    {isSelected
                      ? language === 'en'
                        ? 'Selected'
                        : 'Izabrano'
                      : language === 'en'
                      ? 'Select'
                      : 'Izaberi'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
