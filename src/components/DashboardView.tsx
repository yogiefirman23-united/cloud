import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Layers, 
  CalendarCheck, 
  Coins, 
  Percent, 
  TrendingUp, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  User, 
  Compass
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Booking, Workspace, PartnerRegistration } from '../types';

interface DashboardViewProps {
  bookings: Booking[];
  workspaces: Workspace[];
  partners: PartnerRegistration[];
  setActiveTab: (tab: string) => void;
  setSelectedBooking: (booking: Booking | null) => void;
  setSelectedPartner: (partner: PartnerRegistration | null) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bookings,
  workspaces,
  partners,
  setActiveTab,
  setSelectedBooking,
  setSelectedPartner
}) => {
  
  // Format Currency
  const formatRupiah = (num: number) => {
    return 'Rp' + num.toLocaleString('id-ID');
  };

  // Mocked data for Revenue Trend (Line Chart)
  const revenueData = [
    { name: 'Jan', Pendapatan: 15200000 },
    { name: 'Feb', Pendapatan: 18400000 },
    { name: 'Mar', Pendapatan: 22000000 },
    { name: 'Apr', Pendapatan: 29500000 },
    { name: 'Mei', Pendapatan: 34800000 },
    { name: 'Jun', Pendapatan: 38880000 }, // Matches exactly
  ];

  // Mocked data for Booking Trend (Bar Chart)
  const bookingTrendData = [
    { name: 'Jan', Booking: 240 },
    { name: 'Feb', Booking: 310 },
    { name: 'Mar', Booking: 420 },
    { name: 'Apr', Booking: 530 },
    { name: 'Mei', Booking: 610 },
    { name: 'Jun', Booking: 720 }, // Matches exactly
  ];

  // Static KPI counts requested exactly in prompt:
  // - Total Partner Coffee Shop: 15 Partner
  // - Active Workspace: 45 Workspace
  // - Booking This Month: 720 Booking
  // - Monthly Revenue: Rp38.880.000
  // - Net Profit: Rp26.880.000
  // - Occupancy Rate: 85%
  const kpis = [
    {
      title: 'Total Partner Coffee Shop',
      value: '15 Partner',
      change: '+2 baru bulan ini',
      icon: Building2,
      color: 'bg-brand-primary/5 text-brand-primary',
    },
    {
      title: 'Active Workspace',
      value: '45 Workspace',
      change: '+5 baru ditambahkan',
      icon: Layers,
      color: 'bg-brand-accent/20 text-brand-secondary',
    },
    {
      title: 'Booking This Month',
      value: '720 Booking',
      change: '+18% vs bulan lalu',
      icon: CalendarCheck,
      color: 'bg-emerald-50 text-brand-success',
    },
    {
      title: 'Monthly Revenue',
      value: 'Rp38.880.000',
      change: 'Target tercapai 100%',
      icon: Coins,
      color: 'bg-brand-primary/5 text-brand-primary',
    },
    {
      title: 'Net Profit',
      value: 'Rp26.880.000',
      change: 'Margin profit 69.1%',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-brand-success',
    },
    {
      title: 'Occupancy Rate',
      value: '85%',
      change: 'Jam sibuk: 10:00 - 15:00',
      icon: Percent,
      color: 'bg-brand-accent/20 text-brand-secondary',
    },
  ];

  // Combine some real status activities
  const recentActivities = [
    {
      id: 'ACT-001',
      type: 'booking',
      title: 'Booking Baru Dibuat',
      desc: 'Aditya Wijaya memesan "Meeting Room Sakura" di Anomali Coffee - Senopati',
      time: 'Baru saja',
      rawObj: bookings[0]
    },
    {
      id: 'ACT-002',
      type: 'partner',
      title: 'Registrasi Mitra Baru',
      desc: 'Filosofi Kopi - Melawai mengajukan persetujuan lisensi bisnis',
      time: '10 menit lalu',
      rawObj: partners[0]
    },
    {
      id: 'ACT-003',
      type: 'checkin',
      title: 'Check-In Sukses (QR)',
      desc: 'Rina Kartika melakukan scan check-in di Kopi Kenangan Mantan - Menteng',
      time: '32 menit lalu',
      rawObj: bookings[1]
    },
    {
      id: 'ACT-004',
      type: 'booking',
      title: 'Booking Selesai',
      desc: 'Lestari Wahyuni menyelesaikan sesi di Djournal Coffee - Grand Indonesia',
      time: '2 jam lalu',
      rawObj: bookings[3]
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-2xl border border-brand-border premium-card-shadow hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-brand-muted tracking-tight leading-none uppercase font-mono">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold font-display tracking-tight text-brand-text">
                  {kpi.value}
                </h3>
                <p className="text-[11px] text-brand-muted/80 mt-1 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-brand-accent rounded-full" />
                  {kpi.change}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart - Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-brand-border premium-card-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold font-display text-brand-text">Tren Pendapatan Bulanan</h3>
              <p className="text-xs text-brand-muted mt-0.5">Pendapatan kotor platform dalam 6 bulan terakhir</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-brand-primary">{formatRupiah(38880000)}</span>
              <span className="text-[10px] text-brand-muted block font-mono">Bulan ini</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F1" vertical={false} />
                <XAxis dataKey="name" stroke="#7A7A7A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#7A7A7A" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `Rp${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip 
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Pendapatan']}
                  contentStyle={{ backgroundColor: '#2F2F2F', borderRadius: '12px', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#DCC3AA', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Pendapatan" 
                  stroke="#8B5E3C" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 3, fill: '#8B5E3C' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart - Monthly Booking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white p-6 rounded-2xl border border-brand-border premium-card-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold font-display text-brand-text">Tren Booking Bulanan</h3>
              <p className="text-xs text-brand-muted mt-0.5">Jumlah total transaksi reservasi terselesaikan</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-brand-success">720 Booking</span>
              <span className="text-[10px] text-brand-muted block font-mono">Bulan ini</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingTrendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F1" vertical={false} />
                <XAxis dataKey="name" stroke="#7A7A7A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#7A7A7A" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`${value} Booking`, 'Total Reservasi']}
                  contentStyle={{ backgroundColor: '#2F2F2F', borderRadius: '12px', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#DCC3AA', fontWeight: 'bold' }}
                />
                <Bar dataKey="Booking" fill="#6E462A" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-2xl border border-brand-border premium-card-shadow"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold font-display text-brand-text">Aktivitas Terkini</h3>
            <p className="text-xs text-brand-muted mt-0.5">Log peristiwa terbaru yang terjadi pada marketplace</p>
          </div>
          <button 
            onClick={() => setActiveTab('booking')}
            className="text-xs font-semibold text-brand-primary hover:text-brand-secondary flex items-center gap-1 transition-colors"
          >
            Lihat semua booking
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {recentActivities.map((act, idx) => {
            return (
              <div 
                key={act.id} 
                className="flex items-start justify-between p-3.5 rounded-xl bg-brand-bg/40 border border-brand-border/40 hover:border-brand-accent/50 hover:bg-white transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    act.type === 'booking' ? 'bg-brand-primary/10 text-brand-primary' :
                    act.type === 'partner' ? 'bg-amber-100 text-brand-warning' :
                    'bg-emerald-100 text-brand-success'
                  }`}>
                    {act.type === 'booking' ? <CalendarCheck className="w-4 h-4" /> :
                     act.type === 'partner' ? <Compass className="w-4 h-4" /> :
                     <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-brand-text leading-snug font-display flex items-center gap-2">
                      {act.title}
                      {act.type === 'booking' && (
                        <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.2 rounded font-mono font-medium">
                          {(act.rawObj as Booking).id}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-brand-muted mt-1 leading-normal max-w-xl">
                      {act.desc}
                    </p>
                    
                    {/* Inline Quick Action helper */}
                    <div className="mt-2 flex items-center gap-2.5">
                      {act.type === 'booking' && (
                        <button
                          onClick={() => {
                            setSelectedBooking(act.rawObj as Booking);
                            setActiveTab('booking');
                          }}
                          className="text-[10px] text-brand-primary font-medium hover:underline flex items-center gap-0.5"
                        >
                          Detail Booking
                        </button>
                      )}
                      {act.type === 'partner' && (
                        <button
                          onClick={() => {
                            setSelectedPartner(act.rawObj as PartnerRegistration);
                            setActiveTab('partner');
                          }}
                          className="text-[10px] text-brand-primary font-medium hover:underline flex items-center gap-0.5"
                        >
                          Tinjau Berkas
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-brand-muted flex items-center gap-1 mt-1 justify-end">
                    <Clock className="w-3 h-3 text-brand-muted/70" />
                    {act.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
};
