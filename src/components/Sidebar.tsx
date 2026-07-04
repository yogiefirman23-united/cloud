import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Building2, 
  Handshake, 
  CircleDollarSign, 
  UserCog, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { AdminRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  currentRole: AdminRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  currentRole
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Admin'] },
    { id: 'booking', label: 'Booking Management', icon: CalendarRange, roles: ['Super Admin', 'Admin'] },
    { id: 'workspace', label: 'Workspace Management', icon: Building2, roles: ['Super Admin', 'Admin'] },
    { id: 'partner', label: 'Partner Approval', icon: Handshake, roles: ['Super Admin'] }, // Super Admin Only
    { id: 'revenue', label: 'Revenue Sharing', icon: CircleDollarSign, roles: ['Super Admin', 'Admin'] }, // Both can view, but Super Admin manages
    { id: 'admin-mgmt', label: 'Admin Management', icon: UserCog, roles: ['Super Admin'] }, // Super Admin Only
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <motion.div
      animate={{ width: isCollapsed ? '72px' : '260px' }}
      className="bg-white border-r border-brand-border h-screen flex flex-col sticky top-0 flex-shrink-0 z-30"
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-brand-border/60 h-16">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <Building2 className="w-4.5 h-4.5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col select-none"
            >
              <span className="font-display font-bold text-base tracking-tight text-brand-primary leading-none">Work Well</span>
              <span className="text-[8px] font-mono text-brand-muted uppercase tracking-wider font-semibold mt-1">OPEN OFFICE SPACE</span>
            </motion.div>
          )}
        </div>
        
        {/* Toggle Collapse Button */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-brand-bg text-brand-muted hover:text-brand-text rounded-md transition-colors hidden md:block"
            title="Sembunyikan Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1 hover:bg-brand-bg text-brand-muted hover:text-brand-text rounded-md transition-colors mx-auto hidden md:block"
            title="Tampilkan Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-muted hover:text-brand-text hover:bg-brand-bg/85'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
              
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}

              {/* Active Indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-brand-primary" />
              )}

              {/* Tooltip on Collapsed */}
              {isCollapsed && (
                <div className="absolute left-16 hidden group-hover:block bg-brand-secondary text-white text-xs px-2 py-1 rounded shadow-md z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Information Summary at Footer */}
      <div className="p-4 border-t border-brand-border/60">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-brand-accent/30 text-brand-secondary font-display font-semibold text-xs flex items-center justify-center flex-shrink-0">
            {currentRole === 'Super Admin' ? 'SA' : 'AD'}
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col text-xs truncate"
            >
              <span className="font-semibold text-brand-text truncate">{currentRole === 'Super Admin' ? 'Budi Santoso' : 'Siti Rahma'}</span>
              <span className="text-[10px] text-brand-muted truncate font-mono">{currentRole}</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
