import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Save, Globe, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PageLoader } from '../ui/loading';

export const CmsContentEditor: React.FC = () => {
  const toast = useToast();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getSettings();
        setSettings(res);
      } catch (err) {
        toast.error('Failed to load site settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiClient.updateSettings(settings);
      toast.success('Podešavanja i CMS sadržaj uspješno sačuvani!');
    } catch (err: any) {
      toast.error(err.message || 'Neuspjelo snimanje');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <PageLoader
        message="Loading CMS content & site configuration"
        subtext="Fetching pricing tables, hero settings, and contact information"
        size="md"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="elevated" padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Upravljanje Sadržajem (CMS)
          </span>
          <h2 className="text-2xl font-bold text-white font-display">Podešavanja Sajta & Poslovanja</h2>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={saving}
          leftIcon={<Save className="w-4 h-4 text-slate-950" />}
        >
          {saving ? 'Snimam...' : 'Sačuvaj Izmjene'}
        </Button>
      </Card>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Business identity */}
        <Card variant="elevated" padding="lg" className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-display">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Osnovni Podaci o Poslovanju</span>
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Naziv Organizacije</label>
            <input
              type="text"
              value={settings.org_name || ''}
              onChange={(e) => setSettings({ ...settings, org_name: e.target.value })}
              className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Primarni Kontakt Telefon</label>
            <input
              type="text"
              value={settings.contact_phone || ''}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
              className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Zvanični Email</label>
            <input
              type="email"
              value={settings.contact_email || ''}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>
        </Card>

        {/* Location & Meeting point */}
        <Card variant="elevated" padding="lg" className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-display">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Lokacija Baze & Koordinate</span>
          </h3>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Adresa Baze (Džajići)</label>
            <input
              type="text"
              value={settings.base_address || ''}
              onChange={(e) => setSettings({ ...settings, base_address: e.target.value })}
              className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={settings.base_lat || 43.6267}
                onChange={(e) => setSettings({ ...settings, base_lat: Number(e.target.value) })}
                className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={settings.base_lng || 17.9942}
                onChange={(e) => setSettings({ ...settings, base_lng: Number(e.target.value) })}
                className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Valuta Sistema</label>
            <input
              type="text"
              value={settings.currency || 'BAM'}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white uppercase focus:outline-none"
            />
          </div>
        </Card>
      </form>
    </div>
  );
};
