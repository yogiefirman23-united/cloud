import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { BookingView } from './components/BookingView';
import { WorkspaceView } from './components/WorkspaceView';
import { PartnerApprovalView } from './components/PartnerApprovalView';
import { RevenueView } from './components/RevenueView';
import { AdminManagementView } from './components/AdminManagementView';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { 
  INITIAL_BOOKINGS, 
  INITIAL_WORKSPACES, 
  INITIAL_PARTNERS, 
  INITIAL_ADMINS, 
  INITIAL_REVENUE_SHARING,
  Booking,
  Workspace,
  PartnerRegistration,
  AdminUser,
  RevenueDetail,
  AdminRole
} from './types';
import { Menu, X } from 'lucide-react';

export default function App() {
  // Global User Role (Super Admin is default, Admin is togglable)
  const [currentRole, setCurrentRole] = useState<AdminRole>(() => {
    const saved = localStorage.getItem('ww_current_role');
    return (saved as AdminRole) || 'Super Admin';
  });

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active Tab state
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('ww_active_tab');
    return saved || 'dashboard';
  });

  // Global collections with local persistence
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('ww_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const saved = localStorage.getItem('ww_workspaces');
    return saved ? JSON.parse(saved) : INITIAL_WORKSPACES;
  });

  const [partners, setPartners] = useState<PartnerRegistration[]>(() => {
    const saved = localStorage.getItem('ww_partners');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('ww_admins');
    return saved ? JSON.parse(saved) : INITIAL_ADMINS;
  });

  const [revenueDetails, setRevenueDetails] = useState<RevenueDetail[]>(() => {
    const saved = localStorage.getItem('ww_revenue_details');
    return saved ? JSON.parse(saved) : INITIAL_REVENUE_SHARING;
  });

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Search filter query (passed from Header to current active page)
  const [searchQuery, setSearchQuery] = useState('');

  // Selected details for navigation shortcuts
  const [focusedBooking, setFocusedBooking] = useState<Booking | null>(null);
  const [focusedPartner, setFocusedPartner] = useState<PartnerRegistration | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ww_current_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('ww_active_tab', activeTab);
    // Reset global search when changing tabs for clean UX
    setSearchQuery('');
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('ww_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('ww_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('ww_partners', JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('ww_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('ww_revenue_details', JSON.stringify(revenueDetails));
  }, [revenueDetails]);

  // Helper trigger for toast notifications
  const triggerToast = (type: ToastType, title: string, message: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
    };
    setToasts((prev) => [newToast, ...prev]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Safe tab guards (if an Admin somehow ends up on a Super Admin page, route back)
  useEffect(() => {
    if (currentRole === 'Admin') {
      if (activeTab === 'admin-mgmt' || activeTab === 'partner') {
        setActiveTab('dashboard');
        triggerToast('warning', 'Akses Ditolak', 'Halaman tersebut hanya dapat diakses oleh Super Admin.');
      }
    }
  }, [currentRole, activeTab]);

  // Render active view with custom transitions
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            bookings={bookings}
            workspaces={workspaces}
            partners={partners}
            setActiveTab={setActiveTab}
            setSelectedBooking={(b) => setFocusedBooking(b)}
            setSelectedPartner={(p) => setFocusedPartner(p)}
          />
        );
      case 'booking':
        return (
          <BookingView
            bookings={bookings}
            setBookings={setBookings}
            triggerToast={triggerToast}
            currentRole={currentRole}
          />
        );
      case 'workspace':
        return (
          <WorkspaceView
            workspaces={workspaces}
            setWorkspaces={setWorkspaces}
            triggerToast={triggerToast}
            currentRole={currentRole}
          />
        );
      case 'partner':
        return (
          <PartnerApprovalView
            partners={partners}
            setPartners={setPartners}
            triggerToast={triggerToast}
            currentRole={currentRole}
          />
        );
      case 'revenue':
        return (
          <RevenueView
            revenueDetails={revenueDetails}
            setRevenueDetails={setRevenueDetails}
            triggerToast={triggerToast}
            currentRole={currentRole}
          />
        );
      case 'admin-mgmt':
        return (
          <AdminManagementView
            admins={admins}
            setAdmins={setAdmins}
            triggerToast={triggerToast}
            currentRole={currentRole}
          />
        );
      default:
        return <div className="p-8 text-center text-brand-muted">Halaman tidak ditemukan.</div>;
    }
  };

  const searchPlaceholders: Record<string, string> = {
    'dashboard': 'Cari aktivitas atau nama mitra...',
    'booking': 'Cari Reservasi ID, nama pelanggan, atau cafe...',
    'workspace': 'Cari ruang meeting, pods, atau cafe partner...',
    'partner': 'Cari nama bisnis, pemilik, atau nomor NIB...',
    'revenue': 'Cari cafe partner untuk laporan komisi...',
    'admin-mgmt': 'Cari nama atau email administrator...',
  };

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans selection:bg-brand-primary/10 selection:text-brand-primary">
      
      {/* Toast notifications portal */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* MOBILE SIDEBAR OVERLAY/DRAWER */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Sliding drawer container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 md:hidden"
            >
              <div className="relative h-full flex flex-col bg-white">
                {/* Close Drawer Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="absolute right-4 top-4 p-1 bg-brand-bg hover:bg-brand-border rounded-lg text-brand-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <Sidebar
                  activeTab={activeTab}
                  setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setIsMobileSidebarOpen(false);
                  }}
                  isCollapsed={false}
                  setIsCollapsed={() => {}}
                  currentRole={currentRole}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          currentRole={currentRole}
        />
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* TOP HEADER */}
        <Header
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          activeTab={activeTab}
          searchPlaceholder={searchPlaceholders[activeTab]}
          onSidebarToggle={() => setIsMobileSidebarOpen(true)}
          triggerToast={triggerToast}
        />

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}
