import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../locales/i18n';
import { UserRole } from '../../types';
import { LanguageSwitcher } from '../public/LanguageSwitcher';
import {
  LayoutDashboard,
  CalendarDays,
  Ship,
  ClipboardList,
  Users,
  LifeBuoy,
  FileSpreadsheet,
  FileText,
  History,
  Plus,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Circle,
  Radio,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { TestSuiteModal } from './TestSuiteModal';
import { Button } from '../ui/Button';

interface AdminLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onExitAdmin: () => void;
  onOpenManualBooking: () => void;
  children: React.ReactNode;
}

interface NavItemConfig {
  id: string;
  labelEn: string;
  labelBs: string;
  icon: React.ComponentType<{ className?: string }>;
  roleMin: 'guide' | 'dispatcher' | 'admin';
}

interface NavGroupConfig {
  groupId: string;
  titleEn: string;
  titleBs: string;
  items: NavItemConfig[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  onOpenManualBooking,
  children,
}) => {
  const { currentUser, usersList, role, setCurrentUser, isAdminOrAbove, canDispatch } = useAuth();
  const { language } = useTranslation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);

  // Grouped Navigation Schema (Strictly as specified)
  const navGroups: NavGroupConfig[] = [
    {
      groupId: 'operations',
      titleEn: 'OPERATIONS',
      titleBs: 'OPERACIJE',
      items: [
        {
          id: 'dashboard',
          labelEn: 'Dashboard',
          labelBs: 'Komandna Tabla',
          icon: LayoutDashboard,
          roleMin: 'guide',
        },
        {
          id: 'daily-board',
          labelEn: 'Daily Board',
          labelBs: 'Dnevni Dispečerski Pregled',
          icon: CalendarDays,
          roleMin: 'guide',
        },
        {
          id: 'boat-planner',
          labelEn: 'Boat Planner',
          labelBs: 'Planer Čamaca & Skipera',
          icon: Ship,
          roleMin: 'dispatcher',
        },
      ],
    },
    {
      groupId: 'management',
      titleEn: 'MANAGEMENT',
      titleBs: 'UPRAVLJANJE',
      items: [
        {
          id: 'bookings',
          labelEn: 'Bookings',
          labelBs: 'Rezervacije',
          icon: ClipboardList,
          roleMin: 'dispatcher',
        },
        {
          id: 'customers',
          labelEn: 'Customers',
          labelBs: 'Baza Gostiju (CRM)',
          icon: Users,
          roleMin: 'dispatcher',
        },
        {
          id: 'fleet-staff',
          labelEn: 'Fleet & Staff',
          labelBs: 'Flota & Osoblje',
          icon: LifeBuoy,
          roleMin: 'admin',
        },
      ],
    },
    {
      groupId: 'business',
      titleEn: 'BUSINESS',
      titleBs: 'POSLOVANJE',
      items: [
        {
          id: 'reports',
          labelEn: 'Reports',
          labelBs: 'Izvještaji & Finansije',
          icon: FileSpreadsheet,
          roleMin: 'admin',
        },
        {
          id: 'cms',
          labelEn: 'Content',
          labelBs: 'Upravljanje Sajtom (CMS)',
          icon: FileText,
          roleMin: 'admin',
        },
      ],
    },
    {
      groupId: 'system',
      titleEn: 'SYSTEM',
      titleBs: 'SISTEM',
      items: [
        {
          id: 'audit-logs',
          labelEn: 'Audit Logs',
          labelBs: 'Dnevnik Aktivnosti',
          icon: History,
          roleMin: 'admin',
        },
      ],
    },
  ];

  // Helper to check user permission for tab
  const isItemAllowed = (item: NavItemConfig) => {
    if (item.roleMin === 'guide') return true;
    if (item.roleMin === 'dispatcher') return canDispatch;
    if (item.roleMin === 'admin') return isAdminOrAbove;
    return false;
  };

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileDrawerOpen(false);
  };

  // Find active item info for breadcrumb
  let activeGroupTitle = language === 'en' ? 'Operations' : 'Operacije';
  let activeItemLabel = language === 'en' ? 'Dashboard' : 'Komandna Tabla';

  for (const group of navGroups) {
    const found = group.items.find((i) => i.id === currentTab);
    if (found) {
      activeGroupTitle = language === 'en' ? group.titleEn : group.titleBs;
      activeItemLabel = language === 'en' ? found.labelEn : found.labelBs;
      break;
    }
  }

  // Get user initials
  const initials = currentUser
    ? `${currentUser.first_name?.[0] || ''}${currentUser.last_name?.[0] || ''}`.toUpperCase() || 'OP'
    : 'OP';

  const todayFormatted = new Date().toLocaleDateString(
    language === 'en' ? 'en-US' : 'bs-BA',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <div className="min-h-screen bg-[#0E1A17] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* ============================================================ */}
      {/* MOBILE TOP BAR (Phone / Tablet < lg) */}
      {/* ============================================================ */}
      <header className="lg:hidden bg-[#071310] border-b border-[#182C24] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="w-10 h-10 rounded-xl bg-[#0D211A] border border-[#1C3A2E] text-slate-200 hover:text-white flex items-center justify-center transition-colors active:scale-95"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white font-display tracking-tight">
                AdventureOps
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
              {activeItemLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher idPrefix="admin-mob-lang" variant="compact" />
          <button
            type="button"
            onClick={onOpenManualBooking}
            className="h-9 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'en' ? 'Booking' : 'Rezervacija'}</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MOBILE SLIDE-OUT DRAWER BACKDROP & PANEL */}
      {/* ============================================================ */}
      {mobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-[280px] max-w-[85vw] h-full bg-[#071310] border-r border-[#182C24] flex flex-col justify-between p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#182C24]">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs font-mono">
                      AO
                    </div>
                    <span className="font-bold text-white text-base font-display">AdventureOps</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Neretva Rafting Konjic</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#0E201A] border border-[#1F382E] text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Mobile Action */}
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onOpenManualBooking();
                }}
                className="mt-4 w-full h-10 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{language === 'en' ? '+ New booking' : '+ Nova rezervacija'}</span>
              </button>

              {/* Navigation Items in Drawer */}
              <div className="mt-5 space-y-5">
                {navGroups.map((group) => {
                  const allowedItems = group.items.filter(isItemAllowed);
                  if (allowedItems.length === 0) return null;

                  return (
                    <div key={group.groupId} className="space-y-1">
                      <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                        {language === 'en' ? group.titleEn : group.titleBs}
                      </span>
                      <div className="space-y-0.5">
                        {allowedItems.map((item) => {
                          const IconComp = item.icon;
                          const isActive = currentTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleTabClick(item.id)}
                              className={`w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                                isActive
                                  ? 'bg-emerald-950/60 text-emerald-300 font-bold border-l-2 border-emerald-400 pl-2.5'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E201A] border-l-2 border-transparent'
                              }`}
                            >
                              <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                              <span className="truncate">{language === 'en' ? item.labelEn : item.labelBs}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Drawer Bottom: User & Exit */}
            <div className="pt-4 mt-6 border-t border-[#182C24] space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-lg bg-[#0E201A] border border-[#1F382E] text-emerald-400 font-bold text-xs flex items-center justify-center">
                  {initials}
                </div>
                <div className="truncate flex-1">
                  <span className="text-xs font-bold text-white block truncate">
                    {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Staff Member'}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    {role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onExitAdmin}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-[#0E201A] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                  <span>{language === 'en' ? 'Exit Admin / Public Website' : 'Izlaz / Javni Sajt'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DESKTOP FIXED SIDEBAR (240px - 260px) */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex flex-col w-[252px] h-screen sticky top-0 bg-[#071310] border-r border-[#182C24] shrink-0 z-20">
        <div className="flex flex-col h-full justify-between overflow-y-auto">
          {/* Top Section */}
          <div className="p-4 space-y-4">
            {/* Top Brand Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs font-mono shadow-xs">
                  AO
                </div>
                <div>
                  <h1 className="text-sm font-black text-white tracking-tight font-display flex items-center gap-1.5">
                    <span>AdventureOps</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Dispatch Online" />
                  </h1>
                  <span className="text-[10px] text-slate-400 font-medium block leading-none">
                    Neretva Rafting Konjic
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onExitAdmin}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#0F221B] rounded-lg transition-colors cursor-pointer"
                title={language === 'en' ? 'Exit to public website' : 'Pogledaj javni sajt'}
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* PRIMARY SIDEBAR ACTION: + New booking */}
            <button
              type="button"
              onClick={onOpenManualBooking}
              className="w-full h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-950/40 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'en' ? '+ New booking' : '+ Nova rezervacija'}</span>
            </button>

            {/* Navigation Groups */}
            <nav className="pt-2 space-y-5">
              {navGroups.map((group) => {
                const allowedItems = group.items.filter(isItemAllowed);
                if (allowedItems.length === 0) return null;

                return (
                  <div key={group.groupId} className="space-y-1">
                    <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {language === 'en' ? group.titleEn : group.titleBs}
                    </div>

                    <div className="space-y-0.5">
                      {allowedItems.map((item) => {
                        const IconComp = item.icon;
                        const isActive = currentTab === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleTabClick(item.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                              isActive
                                ? 'bg-emerald-950/50 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-2.5 shadow-xs'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0D211A] border-l-2 border-transparent'
                            }`}
                          >
                            <IconComp
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-emerald-400' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">
                              {language === 'en' ? item.labelEn : item.labelBs}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* BOTTOM SIDEBAR: Current User, Switcher, Exit */}
          <div className="p-3 border-t border-[#182C24] space-y-2 bg-[#050E0C]/60">
            {/* User Profile Card */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-[#091713] hover:bg-[#0E221B] border border-[#182C24] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                    {initials}
                  </div>
                  <div className="truncate min-w-0">
                    <span className="text-xs font-bold text-white block truncate leading-tight">
                      {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Staff'}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block leading-tight">
                      {role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
              </button>

              {/* User Account Switcher Dropdown */}
              {userDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1.5 p-2 bg-[#071310] border border-[#1F3E32] rounded-2xl shadow-2xl z-30 space-y-1 animate-fadeIn">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                    {language === 'en' ? 'Switch Active Staff:' : 'Odaberi Osoblje:'}
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-0.5 pt-1">
                    {usersList.map((u) => {
                      const isCurrent = u.id === currentUser?.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setCurrentUser(u);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isCurrent
                              ? 'bg-emerald-950/70 text-emerald-300 font-bold'
                              : 'text-slate-300 hover:bg-[#0E201A] hover:text-white'
                          }`}
                        >
                          <span className="truncate">{u.first_name} {u.last_name}</span>
                          <span className="text-[10px] uppercase font-mono text-slate-400 ml-1">
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Public Website Exit Link */}
            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-[#0D211A] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'en' ? 'Exit Admin / Public' : 'Javni Sajt'}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">web &rarr;</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN APPLICATION CONTAINER & CONTENT CANVAS */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A1613]">
        {/* COMPACT TOP BAR */}
        <header className="hidden lg:flex items-center justify-between h-14 px-6 bg-[#071310]/90 backdrop-blur-xs border-b border-[#182C24] sticky top-0 z-10">
          {/* Left: Breadcrumbs / Screen Title */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-400">AdventureOps</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-medium text-slate-400">{activeGroupTitle}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <h2 className="font-bold text-white text-sm font-display tracking-tight">
              {activeItemLabel}
            </h2>
          </div>

          {/* Right: Operational Status, Date, Diagnostics & Language */}
          <div className="flex items-center gap-4">
            {/* Live Operations Indicator */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#091713] border border-[#182C24] text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-200">
                {language === 'en' ? 'Base Džajića Buk • Online' : 'Baza Džajića Buk • Online'}
              </span>
            </div>

            {/* Date */}
            <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
              {todayFormatted}
            </span>

            {/* Test Suite Action (Atomic Diagnostics) */}
            <button
              type="button"
              onClick={() => setTestModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0E201A] hover:bg-[#142E25] border border-[#1F3E32] text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
              title="Run Atomic Concurrency & Overbooking Tests"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px]">Test Suite</span>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher idPrefix="admin-top-lang" variant="compact" />
          </div>
        </header>

        {/* CONTENT CANVAS */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Test Suite Diagnostic Modal */}
      {testModalOpen && <TestSuiteModal onClose={() => setTestModalOpen(false)} />}
    </div>
  );
};
