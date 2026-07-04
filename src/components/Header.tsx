import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ShieldAlert, 
  LogOut, 
  ChevronDown, 
  SlidersHorizontal,
  CheckCircle,
  HelpCircle,
  Menu
} from 'lucide-react';
import { AdminRole } from '../types';

interface HeaderProps {
  currentRole: AdminRole;
  setCurrentRole: (role: AdminRole) => void;
  activeTab: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  onSidebarToggle: () => void;
  triggerToast: (type: 'success' | 'warning' | 'danger' | 'info', title: string, msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  activeTab,
  onSearchChange,
  searchPlaceholder = "Cari di sini...",
  onSidebarToggle,
  triggerToast
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Mitra baru 'Filosofi Kopi - Melawai' mendaftar.", time: "10 mnt lalu", unread: true },
    { id: 2, text: "Booking baru #WW-8594 dikonfirmasi oleh customer.", time: "1 jam lalu", unread: true },
    { id: 3, text: "Workspace 'Quiet Pod A' dinonaktifkan oleh Budi.", time: "1 hari lalu", unread: false }
  ]);

  const pageTitles: Record<string, string> = {
    'dashboard': 'Dashboard Ringkasan',
    'booking': 'Booking Management (Manajemen Reservasi)',
    'workspace': 'Workspace Management (Manajemen Ruang)',
    'partner': 'Partner Approval (Persetujuan Mitra)',
    'revenue': 'Revenue Sharing (Bagi Hasil)',
    'admin-mgmt': 'Admin Management (Kelola Admin)',
  };

  const handleRoleSwitch = (newRole: AdminRole) => {
    setCurrentRole(newRole);
    setShowProfileMenu(false);
    triggerToast(
      'info', 
      'Peran Pengguna Diubah', 
      `Anda sekarang masuk sebagai ${newRole}. Hak akses disesuaikan.`
    );
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    triggerToast('success', 'Notifikasi Dibaca', 'Semua notifikasi telah ditandai sebagai dibaca.');
  };

  const activeUnreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-brand-border h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      
      {/* Left section: Hamburger (Mobile) and Page Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onSidebarToggle} 
          className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-text md:hidden"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <span className="text-xs font-mono uppercase text-brand-muted tracking-wider leading-none">Internal Platform</span>
          <h1 className="text-lg font-display font-semibold text-brand-text tracking-tight mt-0.5">
            {pageTitles[activeTab] || 'Work Well Admin'}
          </h1>
        </div>
      </div>

      {/* Middle section: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-8 relative">
        <div className="absolute left-3.5 text-brand-muted pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full bg-brand-bg/80 border border-brand-border/80 focus:border-brand-primary/40 focus:bg-white text-sm py-1.5 pl-10 pr-4 rounded-xl outline-none transition-all placeholder:text-brand-muted/70 text-brand-text"
        />
      </div>

      {/* Right section: Actions, Role Badge, Notifications, Profile Menu */}
      <div className="flex items-center gap-3">
        


        {/* Notifications Icon with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 hover:bg-brand-bg rounded-xl text-brand-muted hover:text-brand-text transition-colors relative"
            title="Notifikasi"
          >
            <Bell className="w-4.5 h-4.5" />
            {activeUnreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-danger rounded-full animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-brand-border shadow-xl z-50 overflow-hidden premium-shadow">
                <div className="px-4 py-3 bg-brand-bg/50 border-b border-brand-border/85 flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-text font-display">Notifikasi Baru</span>
                  {activeUnreadCount > 0 && (
                    <button 
                      onClick={markAllRead} 
                      className="text-[10px] text-brand-primary font-medium hover:underline"
                    >
                      Tandai sudah dibaca
                    </button>
                  )}
                </div>
                <div className="divide-y divide-brand-border/60 max-h-72 overflow-y-auto">
                  {notifications.map((item) => (
                    <div key={item.id} className={`px-4 py-3 text-xs hover:bg-brand-bg/40 transition-colors ${item.unread ? 'bg-brand-primary/5' : ''}`}>
                      <div className="flex items-start justify-between gap-1">
                        <p className={`leading-relaxed ${item.unread ? 'text-brand-text font-semibold' : 'text-brand-muted'}`}>{item.text}</p>
                        {item.unread && <span className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-1 flex-shrink-0" />}
                      </div>
                      <span className="text-[10px] text-brand-muted/70 block mt-1 font-mono">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Current Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 hover:bg-brand-bg rounded-xl border border-transparent hover:border-brand-border/60 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-full bg-brand-primary text-white text-xs font-bold font-display flex items-center justify-center">
              {currentRole === 'Super Admin' ? 'BS' : 'SR'}
            </div>
            <div className="hidden lg:flex flex-col text-xs leading-none">
              <span className="font-semibold text-brand-text">{currentRole === 'Super Admin' ? 'Budi Santoso' : 'Siti Rahma'}</span>
              <span className="text-[9px] text-brand-muted font-mono mt-0.5 uppercase tracking-wide">{currentRole}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-brand-muted" />
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-brand-border shadow-xl z-50 py-1.5 premium-shadow">
                <div className="px-4 py-2 border-b border-brand-border/60">
                  <p className="text-xs font-semibold text-brand-text">{currentRole === 'Super Admin' ? 'Budi Santoso' : 'Siti Rahma'}</p>
                  <p className="text-[10px] text-brand-muted font-mono mt-0.5">{currentRole === 'Super Admin' ? 'budi@workwell.co.id' : 'siti@workwell.co.id'}</p>
                </div>
                


                <div className="py-1">
                  <div className="px-4 py-1.5 flex items-center gap-2 text-xs text-brand-muted">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Konfigurasi Internal</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      triggerToast('info', 'Bantuan Sistem', 'Dashboard ini menggunakan penyimpanan lokal (localStorage) untuk persistensi sesi.');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-brand-text hover:bg-brand-bg flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-brand-muted" />
                    <span>Pusat Bantuan</span>
                  </button>
                </div>
                
                <div className="border-t border-brand-border/60 pt-1.5 mt-1.5">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      triggerToast('warning', 'Logout Berhasil', 'Anda telah keluar dari dashboard demo ini.');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-brand-danger hover:bg-brand-danger/5 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

    </header>
  );
};
