import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../locales/i18n';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  CalendarDays,
  Ship,
  Users,
  CreditCard,
  Settings,
  FileSpreadsheet,
  ShieldCheck,
  LogOut,
  Sparkles,
  ClipboardList,
  History,
  Menu,
  X,
  PlusCircle,
  HelpCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { TestSuiteModal } from './TestSuiteModal';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onExitAdmin: () => void;
  onOpenManualBooking: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  onOpenManualBooking,
  children,
}) => {
  const { currentUser, usersList, role, setCurrentUser, switchUserRole, isAdminOrAbove, canDispatch } = useAuth();
  const { t } = useTranslation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'dashboard', label: 'Komandna Tabla', icon: LayoutDashboard, roleMin: 'guide' },
    { id: 'daily-board', label: 'Dnevni Dispečerski Pregled', icon: CalendarDays, roleMin: 'guide' },
    { id: 'boat-planner', label: 'Planer Čamaca & Skipera', icon: Ship, roleMin: 'dispatcher' },
    { id: 'bookings', label: 'Sve Rezervacije', icon: ClipboardList, roleMin: 'dispatcher' },
    { id: 'fleet-staff', label: 'Flota & Osoblje', icon: Users, roleMin: 'admin' },
    { id: 'customers', label: 'Baza Gostiju (CRM)', icon: Users, roleMin: 'dispatcher' },
    { id: 'reports', label: 'Finansije & Izvještaji', icon: FileSpreadsheet, roleMin: 'admin' },
    { id: 'cms', label: 'Upravljanje Sajtom (CMS)', icon: Settings, roleMin: 'admin' },
    { id: 'audit-logs', label: 'Dnevnik Aktivnosti (Audit)', icon: History, roleMin: 'admin' },
  ];

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileSidebarOpen(false);
  };

  const getRoleBadgeColor = (r: UserRole) => {
    switch (r) {
      case UserRole.OWNER:
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case UserRole.ADMIN:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case UserRole.DISPATCHER:
        return 'bg-sky-950 text-sky-300 border-sky-800';
      case UserRole.GUIDE:
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm text-white">Neretva Rafting Ops</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenManualBooking}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-400 text-slate-950 rounded-lg flex items-center gap-1 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nova</span>
          </button>
          <button
            onClick={onExitAdmin}
            className="p-1.5 text-slate-400 hover:text-white text-xs bg-slate-800 rounded-lg"
            title="Povratak na javni sajt"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-200 lg:translate-x-0 lg:static lg:h-screen ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Brand header */}
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm">
                  NR
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
                    Neretva Rafting
                  </h2>
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                    Operativni Centar
                  </span>
                </div>
              </div>

              <button
                onClick={onExitAdmin}
                className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors"
                title="Povratak na javni sajt"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Switcher */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <span className="text-xs font-bold text-white block truncate">
                    {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Prijavljeni korisnik'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {currentUser?.email}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
                    role
                  )}`}
                >
                  {role}
                </span>
              </div>

              {/* Quick Role Switcher Dropdown */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-[10px] text-slate-400 mb-1">
                  Promijeni aktivnog korisnika:
                </label>
                <select
                  value={currentUser?.id || ''}
                  onChange={(e) => {
                    const selected = usersList.find((u) => u.id === e.target.value);
                    if (selected) setCurrentUser(selected);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} ({u.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Action: New Manual Booking */}
            <button
              onClick={onOpenManualBooking}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Unesi Rezervaciju (Telefon/Walk-in)</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isAllowed =
                item.roleMin === 'guide' ||
                (item.roleMin === 'dispatcher' && canDispatch) ||
                (item.roleMin === 'admin' && isAdminOrAbove);

              if (!isAllowed) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                    currentTab === item.id
                      ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800/60 shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Tools (Test Suite + Exit) */}
          <div className="p-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => setTestModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-850 text-emerald-400 border border-emerald-900/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test Suite (Atomic Lock & DB)</span>
              </div>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 font-mono">
                RUN
              </span>
            </button>

            <button
              onClick={onExitAdmin}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Javni Sajt (Gost Pogled)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>

      {/* Test Suite Modal */}
      {testModalOpen && <TestSuiteModal onClose={() => setTestModalOpen(false)} />}
    </div>
  );
};
