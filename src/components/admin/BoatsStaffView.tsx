import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Boat, BoatStatus, StaffMember, UserRole } from '../../types';
import { Ship, Users, Plus, Phone, Mail, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

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
      toast.success(`Raft "${boatName}" added to fleet`);
      setShowBoatModal(false);
      setBoatName('');
      setBoatCode('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add raft');
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
      toast.success(`Staff member ${staffFirst} ${staffLast} added`);
      setShowStaffModal(false);
      setStaffFirst('');
      setStaffLast('');
      setStaffEmail('');
      setStaffPhone('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add staff member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <Card variant="elevated" padding="lg" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Resources & Crew
          </span>
          <h2 className="text-2xl font-bold text-white font-display">Fleet & River Guides</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#081210] p-1 rounded-2xl border border-[#1F332C] flex">
            <button
              onClick={() => setActiveTab('boats')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'boats'
                  ? 'bg-emerald-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Boat Fleet ({boats.length})
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-emerald-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Guides & Staff ({staff.length})
            </button>
          </div>

          {isAdminOrAbove && (
            <Button
              variant="primary"
              size="md"
              onClick={() => (activeTab === 'boats' ? setShowBoatModal(true) : setShowStaffModal(true))}
              leftIcon={<Plus className="w-4 h-4 text-slate-950" />}
            >
              {activeTab === 'boats' ? 'Add Raft' : 'Add Guide'}
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center text-emerald-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
        </div>
      ) : activeTab === 'boats' ? (
        /* Boats Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boats.map((b) => (
            <Card
              key={b.id}
              variant="elevated"
              padding="lg"
              className="space-y-4 hover:border-[#2A443B] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#081210] border border-[#1F332C] flex items-center justify-center text-emerald-400">
                    <Ship className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base font-display">{b.name}</h4>
                    <span className="text-xs text-slate-400">Code: {b.code}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    b.status === BoatStatus.AVAILABLE
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                      : 'bg-rose-950/60 text-rose-300 border-rose-800/80'
                  }`}
                >
                  {b.status === BoatStatus.AVAILABLE ? 'Active' : 'Maintenance'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#081210] border border-[#1F332C] text-xs flex justify-between">
                <span className="text-slate-400">Max Capacity:</span>
                <strong className="text-white font-display">{b.capacity} seats</strong>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Staff Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s) => (
            <Card
              key={s.id}
              variant="elevated"
              padding="lg"
              className="space-y-4 hover:border-[#2A443B] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-base font-display">
                    {s.first_name} {s.last_name}
                  </h4>
                  <span className="text-xs text-emerald-400 uppercase font-semibold">
                    {s.staff_role}
                  </span>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#081210] border border-[#1F332C] text-slate-300">
                  {s.notes || 'IRF Guide'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-[#1F332C]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">{s.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">{s.email}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: New Boat */}
      {showBoatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07110F]/80 backdrop-blur-sm">
          <div className="bg-[#0E1A17] border border-[#1F332C] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1F332C] pb-3">
              <h3 className="font-bold text-white text-base font-display">Add Raft to Fleet</h3>
              <button onClick={() => setShowBoatModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBoat} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Raft Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neretva Pulsar 07"
                  value={boatName}
                  onChange={(e) => setBoatName(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Fleet Code</label>
                <input
                  type="text"
                  placeholder="e.g. B-07"
                  value={boatCode}
                  onChange={(e) => setBoatCode(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Passenger Capacity *</label>
                <input
                  type="number"
                  min={4}
                  max={12}
                  required
                  value={boatCap}
                  onChange={(e) => setBoatCap(Number(e.target.value))}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-bold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1F332C]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBoatModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Save Raft
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Staff */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07110F]/80 backdrop-blur-sm">
          <div className="bg-[#0E1A17] border border-[#1F332C] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1F332C] pb-3">
              <h3 className="font-bold text-white text-base font-display">Add Guide / Crew Member</h3>
              <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={staffFirst}
                    onChange={(e) => setStaffFirst(e.target.value)}
                    className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={staffLast}
                    onChange={(e) => setStaffLast(e.target.value)}
                    className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
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
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+387 61..."
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role *</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as UserRole)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none"
                >
                  <option value={UserRole.GUIDE}>River Guide (Skipper)</option>
                  <option value={UserRole.DISPATCHER}>Dispatcher / Ops Lead</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Certification & Notes</label>
                <input
                  type="text"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1F332C]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStaffModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Save Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
