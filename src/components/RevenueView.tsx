import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CircleDollarSign, 
  Store, 
  Wallet, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Receipt,
  FileSpreadsheet,
  ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { RevenueDetail } from '../types';

interface RevenueViewProps {
  revenueDetails: RevenueDetail[];
  setRevenueDetails: React.Dispatch<React.SetStateAction<RevenueDetail[]>>;
  triggerToast: (type: 'success' | 'warning' | 'danger' | 'info', title: string, msg: string) => void;
  currentRole: 'Super Admin' | 'Admin';
}

export const RevenueView: React.FC<RevenueViewProps> = ({
  revenueDetails,
  setRevenueDetails,
  triggerToast,
  currentRole
}) => {
  const [selectedRevenue, setSelectedRevenue] = useState<RevenueDetail | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const formatRupiah = (num: number) => {
    return 'Rp' + num.toLocaleString('id-ID');
  };

  // Pie chart data
  const data = [
    { name: 'Kopi (Coffee Shop Share - 70%)', value: 90720000, color: '#541A1A' },
    { name: 'Work Well (Platform Share - 30%)', value: 38880000, color: '#810B38' },
  ];

  // Totals requested in requirements:
  const totalTransaction = 129600000;
  const coffeeShopShare = 90720000;
  const workWellShare = 38880000;
  const netProfit = 26880000;

  const handleProcessPayout = (revenueId: string) => {
    if (currentRole !== 'Super Admin') {
      triggerToast('danger', 'Akses Ditolak', 'Hanya Super Admin yang dapat memproses bagi hasil (payout) ke rekening partner.');
      return;
    }

    setRevenueDetails(prev => 
      prev.map(item => 
        item.id === revenueId ? { ...item, status: 'Lunas' as const } : item
      )
    );
    
    // Update active modal status if open
    if (selectedRevenue && selectedRevenue.id === revenueId) {
      setSelectedRevenue(prev => prev ? { ...prev, status: 'Lunas' as const } : null);
    }

    triggerToast('success', 'Bagi Hasil Sukses', `Dana transfer untuk ${selectedRevenue?.partnerName || 'Mitra'} telah berhasil ditransfer.`);
    setShowPayoutModal(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-2xl border border-brand-border premium-card-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-muted uppercase font-mono tracking-tight">Total Transaksi</span>
            <div className="p-2 bg-brand-bg rounded-lg text-brand-text">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-brand-text leading-tight">{formatRupiah(totalTransaction)}</h3>
            <p className="text-[10px] text-brand-muted mt-1 font-mono">100% Volume Kotor Penjualan</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-5 rounded-2xl border border-brand-border premium-card-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-muted uppercase font-mono tracking-tight">Coffee Shop Share (70%)</span>
            <div className="p-2 bg-brand-secondary/5 text-brand-secondary rounded-lg">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-brand-secondary leading-tight">{formatRupiah(coffeeShopShare)}</h3>
            <p className="text-[10px] text-brand-muted mt-1 font-mono">Bagian Pemilik Coffee Shop</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-2xl border border-brand-border premium-card-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-muted uppercase font-mono tracking-tight">Work Well Share (30%)</span>
            <div className="p-2 bg-brand-primary/5 text-brand-primary rounded-lg">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-brand-primary leading-tight">{formatRupiah(workWellShare)}</h3>
            <p className="text-[10px] text-brand-muted mt-1 font-mono">Komisi Bersih Platform</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white p-5 rounded-2xl border border-brand-border premium-card-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-muted uppercase font-mono tracking-tight">Net Profit</span>
            <div className="p-2 bg-emerald-50 text-brand-success rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold font-display text-brand-success leading-tight">{formatRupiah(netProfit)}</h3>
            <p className="text-[10px] text-brand-muted mt-1 font-mono">Pendapatan Bersih Tersimpan</p>
          </div>
        </motion.div>
      </div>

      {/* Donut Chart Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-brand-border premium-card-shadow lg:col-span-1 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-sm font-semibold font-display text-brand-text">Proporsi Distribusi Bagi Hasil</h3>
            <p className="text-xs text-brand-muted mt-0.5">Skema standard pembagian komisi Work Well</p>
          </div>

          <div className="h-56 w-full my-4 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatRupiah(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text overlays */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-2xl font-bold font-display text-brand-primary">70 : 30</span>
              <span className="text-[10px] text-brand-muted uppercase font-semibold font-mono tracking-wider">Skema Pembagian</span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="space-y-2 pt-2 border-t border-brand-border/60">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-brand-secondary block" />
                <span className="text-brand-text font-medium">Coffee Shop Share</span>
              </div>
              <span className="font-mono font-bold text-brand-text">70%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-brand-primary block" />
                <span className="text-brand-text font-medium">Work Well Share</span>
              </div>
              <span className="font-mono font-bold text-brand-text">30%</span>
            </div>
          </div>
        </motion.div>

        {/* Partner Revenue Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-brand-border premium-card-shadow lg:col-span-2 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-brand-border/60 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold font-display text-brand-text">Laporan Pendapatan per Mitra</h3>
              <p className="text-xs text-brand-muted mt-0.5">Rincian performa penjualan dan status transfer bagi hasil</p>
            </div>
            
            <button 
              onClick={() => triggerToast('info', 'Ekspor Data', 'Mengunduh laporan bagi hasil dalam format Excel...')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-bg border border-brand-border hover:border-brand-accent rounded-xl text-xs font-medium text-brand-text transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-brand-muted" />
              <span>Ekspor CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-brand-bg/40 text-brand-muted font-mono uppercase tracking-wider text-[10px] border-b border-brand-border/80">
                  <th className="px-6 py-3.5 font-semibold">Nama Partner (Coffee Shop)</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Total Booking</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Pendapatan Kotor</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Bagi Hasil 70%</th>
                  <th className="px-4 py-3.5 font-semibold text-center">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 text-brand-text font-sans">
                {revenueDetails.map((detail) => (
                  <tr key={detail.id} className="hover:bg-brand-bg/25 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-brand-text text-xs">{detail.partnerName}</div>
                      <div className="text-[10px] text-brand-muted font-mono mt-0.5">{detail.id}</div>
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-medium">
                      {detail.totalBookings}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-semibold">
                      {formatRupiah(detail.totalRevenue)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-brand-secondary">
                      {formatRupiah(detail.coffeeShopShare)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono ${
                        detail.status === 'Lunas' 
                          ? 'bg-emerald-50 text-brand-success' 
                          : 'bg-amber-50 text-brand-warning'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          detail.status === 'Lunas' ? 'bg-brand-success' : 'bg-brand-warning'
                        }`} />
                        {detail.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedRevenue(detail)}
                        className="px-3 py-1.5 bg-brand-bg hover:bg-brand-accent/20 border border-brand-border hover:border-brand-accent rounded-xl font-medium text-brand-text transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Partner Settlement Detail Modal */}
      <AnimatePresence>
        {selectedRevenue && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-brand-border"
            >
              <div className="px-6 py-4 bg-brand-bg/60 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-brand-primary" />
                  <span className="font-display font-bold text-sm text-brand-text">Rincian Bagi Hasil Mitra</span>
                </div>
                <button
                  onClick={() => setSelectedRevenue(null)}
                  className="p-1 hover:bg-brand-border/60 text-brand-muted hover:text-brand-text rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider">Identitas Mitra</span>
                  <h4 className="text-base font-bold text-brand-text font-display mt-0.5">{selectedRevenue.partnerName}</h4>
                  <p className="text-xs text-brand-muted mt-1">ID Rekonsiliasi: <span className="font-mono text-brand-text font-medium">{selectedRevenue.id}</span></p>
                </div>

                <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-muted">Total Reservasi Terpenuhi:</span>
                    <span className="font-mono font-bold text-brand-text">{selectedRevenue.totalBookings} Booking</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-muted">Pendapatan Kotor Mitra:</span>
                    <span className="font-mono font-bold text-brand-text">{formatRupiah(selectedRevenue.totalRevenue)}</span>
                  </div>
                  <div className="border-t border-brand-border/60 pt-2 flex justify-between text-xs">
                    <span className="font-semibold text-brand-text">Porsi Komisi Mitra (70%):</span>
                    <span className="font-mono font-bold text-brand-secondary text-sm">{formatRupiah(selectedRevenue.coffeeShopShare)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-brand-text">Porsi Komisi Platform (30%):</span>
                    <span className="font-mono font-bold text-brand-primary">{formatRupiah(selectedRevenue.workWellShare)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-muted">Status Penyelesaian:</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold font-mono ${
                    selectedRevenue.status === 'Lunas' 
                      ? 'bg-emerald-50 text-brand-success' 
                      : 'bg-amber-50 text-brand-warning'
                  }`}>
                    {selectedRevenue.status === 'Lunas' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                    )}
                    {selectedRevenue.status}
                  </span>
                </div>

                {selectedRevenue.status !== 'Lunas' && (
                  <div className="bg-amber-50/50 p-3 rounded-lg border border-brand-warning/30 text-[11px] text-brand-secondary leading-relaxed">
                    <strong>Catatan Payout:</strong> Porsi bagi hasil 70% sebesar <strong>{formatRupiah(selectedRevenue.coffeeShopShare)}</strong> perlu ditransfer secara manual atau via integrasi kliring ke rekening bank terdaftar pemilik kedai kopi.
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-brand-bg/40 border-t border-brand-border flex justify-end gap-2.5">
                <button
                  onClick={() => setSelectedRevenue(null)}
                  className="px-4 py-2 bg-white hover:bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold text-brand-text transition-colors"
                >
                  Tutup
                </button>
                {selectedRevenue.status !== 'Lunas' && (
                  <button
                    onClick={() => handleProcessPayout(selectedRevenue.id)}
                    className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Proses Transfer</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
