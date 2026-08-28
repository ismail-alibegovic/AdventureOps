import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Boat, BoatStatus, StaffMember, UserRole } from '../../types';
import { Ship, Users, Plus, CheckCircle2, AlertCircle, Phone, Mail, Shield, Trash2, Edit, X } from 'lucide-react';

export const BoatsStaffView: React.FC = () => {
  const toast = useToast();
  const { isAdminOrAbove } = useAuth();

  const [activeTab, setActiveTab] = useState<'boats' | 'staff'>('boats');
  const [boats, setBoats] = useState<Boat[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Boat Form
  const [showBoatModal, setShowBoatModal] = useState<boolean>(false);
  const [boatName, setBoatName] = useState<string>('');
  const [boatCap, setBoatCap] = useState<number>(8);
  const [boatCode, setBoatCode] = useState<string>('');

  // New Staff Form
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [staffFirst, setStaffFirst] = useState<string>('');
  const [staffLast, setStaffLast] = useState<string>('');
  const [staffEmail, setStaffEmail] = useState<string>('');
  const [staffPhone, setStaffPhone] = useState<string>('');
  const [staffRole, setStaffRole] = useState<UserRole>(UserRole.GUIDE);
  const [staffNotes, setStaffNotes] = useState<string>('IRF Class III/IV Licencirani vodič');

  const loadData = async () => {
    try {
      setLoading(true);
      const [bList, sList] = await Promise.all([
        apiClient.getBoats(),
        apiClient.getStaff(),
      ]);
      setBoats(bList);
      setStaff(sList);
    } catch (err) {
      toast.error('Failed to load fleet & staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBoat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createBoat({
        code: boatCode || `B-${boats.length + 1}`,
        name: boatName,
        capacity: Number(boatCap),
        status: BoatStatus.AVAILABLE,
      });
      toast.success(`Čamac "${boatName}" uspješno dodat u flotu`);
      setShowBoatModal(false);
      setBoatName('');
      setBoatCode('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Neuspjelo dodavanje čamca');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createStaff({
        first_name: staffFirst,
        last_name: staffLast,
        email: staffEmail,
        phone: staffPhone,
        staff_role: staffRole,
        notes: staffNotes,
        active: true,
      });
      toast.success(`Skiper/Član osoblja ${staffFirst} ${staffLast} uspješno dodat`);
      setShowStaffModal(false);
      setStaffFirst('');
      setStaffLast('');
      setStaffEmail('');
      setStaffPhone('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Neuspjelo dodavanje');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Resursi & Osoblje
          </span>
          <h2 className="text-2xl font-bold text-white">Flota Čamaca & Rafting Skiperi</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex">
            <button
              onClick={() => setActiveTab('boats')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'boats'
                  ? 'bg-emerald-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Flota Čamaca ({boats.length})
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-emerald-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Skiperi & Tim ({staff.length})
            </button>
          </div>

          {isAdminOrAbove && (
            <button
              onClick={() => (activeTab === 'boats' ? setShowBoatModal(true) : setShowStaffModal(true))}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'boats' ? 'Dodaj Čamac' : 'Dodaj Skipera'}</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-emerald-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
        </div>
      ) : activeTab === 'boats' ? (
        /* Boats Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boats.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
                    <Ship className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{b.name}</h4>
                    <span className="text-xs text-slate-400">Kod: {b.code}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    b.status === BoatStatus.AVAILABLE
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}
                >
                  {b.status === BoatStatus.AVAILABLE ? 'Aktivno' : 'Servis'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-xs flex justify-between">
                <span className="text-slate-400">Maksimalni Kapacitet:</span>
                <strong className="text-white">{b.capacity} osoba</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Staff Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-base">
                    {s.first_name} {s.last_name}
                  </h4>
                  <span className="text-xs text-emerald-400 uppercase font-semibold">
                    {s.staff_role}
                  </span>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {s.notes || 'IRF Skiper'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-850">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">{s.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">{s.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Boat */}
      {showBoatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Dodaj Novi Čamac u Flotu</h3>
              <button onClick={() => setShowBoatModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBoat} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Naziv Čamca *</label>
                <input
                  type="text"
                  required
                  placeholder="npr. Neretva 07"
                  value={boatName}
                  onChange={(e) => setBoatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Oznaka / Kod</label>
                <input
                  type="text"
                  placeholder="npr. B-07"
                  value={boatCode}
                  onChange={(e) => setBoatCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kapacitet (broj osoba) *</label>
                <input
                  type="number"
                  min={4}
                  max={12}
                  required
                  value={boatCap}
                  onChange={(e) => setBoatCap(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBoatModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold"
                >
                  Sačuvaj Čamac
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Staff */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Dodaj Novog Skipera / Člana Tima</h3>
              <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ime *</label>
                  <input
                    type="text"
                    required
                    value={staffFirst}
                    onChange={(e) => setStaffFirst(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prezime *</label>
                  <input
                    type="text"
                    required
                    value={staffLast}
                    onChange={(e) => setStaffLast(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Telefon *</label>
                <input
                  type="tel"
                  required
                  placeholder="+387 61..."
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Uloga *</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                >
                  <option value={UserRole.GUIDE}>Skiper (Guide)</option>
                  <option value={UserRole.DISPATCHER}>Dispečer (Dispatcher)</option>
                  <option value={UserRole.ADMIN}>Administrator (Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bilješke / Sertifikat</label>
                <input
                  type="text"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold"
                >
                  Sačuvaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
