import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Filter, 
  User, 
  Clock, 
  CreditCard, 
  QrCode, 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  MapPin,
  ChevronRight,
  Phone,
  Mail,
  Zap
} from 'lucide-react';
import { Booking } from '../types';
import jsQR from 'jsqr';

interface BookingViewProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  triggerToast: (type: 'success' | 'warning' | 'danger' | 'info', title: string, msg: string) => void;
  currentRole: 'Super Admin' | 'Admin';
}

export const BookingView: React.FC<BookingViewProps> = ({
  bookings,
  setBookings,
  triggerToast,
  currentRole
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterWorkspace, setFilterWorkspace] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Selected Booking for Detail Drawer
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Scanner State
  const [showScanner, setShowScanner] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannerResult, setScannerResult] = useState<{ valid: boolean; booking: Booking | null; checkedInAlready?: boolean } | null>(null);
  const [scannedCode, setScannedCode] = useState('');
  const [isScanningProgress, setIsScanningProgress] = useState(false);
  const [scanSuccessBooking, setScanSuccessBooking] = useState<Booking | null>(null);

  // HTML5 Video element reference for real camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get unique workspaces for filter dropdown
  const uniqueWorkspaces = Array.from(new Set(bookings.map(b => b.workspaceName)));

  // Filter Bookings list
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.coffeeShopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.workspaceName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = filterDate ? booking.bookingDate === filterDate : true;
    const matchesWorkspace = filterWorkspace ? booking.workspaceName === filterWorkspace : true;
    const matchesStatus = filterStatus ? booking.status === filterStatus : true;

    return matchesSearch && matchesDate && matchesWorkspace && matchesStatus;
  });

  // Start Camera Stream
  const startCamera = async () => {
    setIsCameraActive(true);
    setScannerResult(null);
    setIsScanningProgress(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Pastikan video berputar secara paksa setelah stream diikat
        videoRef.current.play().catch(e => console.log("Video play interrupted:", e));
      }
      triggerToast('info', 'Kamera Aktif', 'Kamera terhubung! Dekatkan kode QR ke kamera untuk memindai otomatis.');
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setIsCameraActive(false);
      triggerToast(
        'warning', 
        'Kamera Terblokir', 
        'Tidak dapat mengakses kamera fisik. Silakan gunakan simulator QR atau periksa izin browser.'
      );
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle scanned QR Code (both real and simulated)
  const handleMatchedQRCode = (scannedText: string) => {
    const trimmed = scannedText.trim();
    if (!trimmed) return;

    // Stop real camera to prevent multiple scans
    stopCamera();

    const matched = bookings.find(b => 
      b.id.toLowerCase() === trimmed.toLowerCase() || 
      b.qrCodeData.toLowerCase() === trimmed.toLowerCase()
    );

    if (matched) {
      if (matched.status === 'Checked In') {
        setScannerResult({
          valid: true,
          booking: matched,
          checkedInAlready: true
        });
        triggerToast('warning', 'Sudah Check-In', `Tiket ${matched.id} (${matched.customerName}) sudah berstatus Checked In.`);
      } else if (matched.status === 'Dibatalkan') {
        setScannerResult({
          valid: false,
          booking: matched
        });
        triggerToast('danger', 'Tiket Dibatalkan', `Tiket ${matched.id} telah dibatalkan sebelumnya.`);
      } else {
        setScannerResult({
          valid: true,
          booking: matched
        });
        triggerToast('success', 'QR Code Valid', `Berhasil mendeteksi tiket ${matched.customerName}!`);
        // Automatically check-in!
        handleConfirmCheckIn(matched.id, true);
      }
    } else {
      setScannerResult({
        valid: false,
        booking: null
      });
      triggerToast('danger', 'QR Tidak Terdaftar', `Kode "${trimmed}" tidak cocok dengan data reservasi mana pun.`);
    }
  };

  // Live video feed parsing loop for real-time QR scanner using canvas
  useEffect(() => {
    let active = true;
    let animId: number;

    const scanFrame = () => {
      if (!active) return;

      if (isCameraActive && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          try {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert"
            });
            if (code && code.data) {
              handleMatchedQRCode(code.data);
              active = false;
              return;
            }
          } catch (e) {
            console.error("jsQR error during frame processing:", e);
          }
        }
      }

      if (active && isCameraActive) {
        animId = requestAnimationFrame(scanFrame);
      }
    };

    if (isCameraActive) {
      animId = requestAnimationFrame(scanFrame);
    }

    return () => {
      active = false;
      cancelAnimationFrame(animId);
    };
  }, [isCameraActive, bookings]);

  // Handle simulated scan of a specific Booking ID
  const handleSimulateScan = (codeToScan: string) => {
    setIsScanningProgress(true);
    setScannerResult(null);
    
    setTimeout(() => {
      setIsScanningProgress(false);
      handleMatchedQRCode(codeToScan);
    }, 1200);
  };

  // Update Booking Status generally (for custom status editing)
  const handleUpdateStatus = (bookingId: string, newStatus: Booking['status']) => {
    setBookings(prev => 
      prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      )
    );
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Confirm Check In (this is triggered after scan verifies booking is valid)
  const handleConfirmCheckIn = (bookingId: string, isFromScanner: boolean = false) => {
    setBookings(prev => 
      prev.map(b => 
        b.id === bookingId ? { ...b, status: 'Checked In' as const } : b
      )
    );
    
    // Update active drawer if open
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking(prev => prev ? { ...prev, status: 'Checked In' as const } : null);
    }

    const currentBk = bookings.find(b => b.id === bookingId);
    if (currentBk) {
      const updatedBk = { ...currentBk, status: 'Checked In' as const };
      if (isFromScanner) {
        setScanSuccessBooking(updatedBk);
        setScannerResult(null);
        stopCamera();
      } else {
        triggerToast('success', 'Check-In Sukses', `Reservasi ${bookingId} berhasil di-checkin! Status diperbarui.`);
        setScannerResult(null);
      }
    } else {
      triggerToast('success', 'Check-In Sukses', `Reservasi ${bookingId} berhasil di-checkin! Status diperbarui.`);
    }
  };

  const formatRupiah = (num: number) => {
    return 'Rp' + num.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Panel */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border premium-card-shadow space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-primary" />
            <h3 className="text-xs font-semibold uppercase text-brand-muted font-mono tracking-wider">Filter Reservasi</h3>
          </div>
          
          {/* Large Scan QR Check-In Button */}
          <button
            onClick={() => {
              setShowScanner(true);
              startCamera();
            }}
            className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <QrCode className="w-4.5 h-4.5" />
            <span>Scan QR Check-In</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              placeholder="Cari ID, Pelanggan, atau Cafe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-bg/50 border border-brand-border/80 text-xs py-2.5 pl-9 pr-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white transition-all text-brand-text"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-brand-muted pointer-events-none" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-brand-bg/50 border border-brand-border/80 text-xs py-2.5 pl-9 pr-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white transition-all text-brand-text"
            />
          </div>

          {/* Workspace Filter */}
          <select
            value={filterWorkspace}
            onChange={(e) => setFilterWorkspace(e.target.value)}
            className="w-full bg-brand-bg/50 border border-brand-border/80 text-xs py-2.5 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white transition-all text-brand-text cursor-pointer"
          >
            <option value="">Semua Workspace</option>
            {uniqueWorkspaces.map(ws => (
              <option key={ws} value={ws}>{ws}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-brand-bg/50 border border-brand-border/80 text-xs py-2.5 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white transition-all text-brand-text cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Dikonfirmasi">Dikonfirmasi</option>
            <option value="Checked In">Checked In</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>

        </div>
      </div>

      {/* Booking Table Card */}
      <div className="bg-white rounded-2xl border border-brand-border premium-card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-bg/40 text-brand-muted font-mono uppercase tracking-wider text-[10px] border-b border-brand-border/80">
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Pelanggan</th>
                <th className="px-6 py-4 font-semibold">Workspace</th>
                <th className="px-6 py-4 font-semibold">Lokasi Cafe</th>
                <th className="px-4 py-4 font-semibold">Tanggal & Waktu</th>
                <th className="px-4 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60 text-brand-text font-sans">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-brand-bg/25 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-lg">
                        {booking.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {booking.customerName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-xs text-brand-text">{booking.workspaceName}</div>
                    </td>
                    <td className="px-6 py-4 text-brand-muted">
                      <span className="line-clamp-1">{booking.coffeeShopName}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">{booking.bookingDate}</div>
                      <div className="text-[10px] text-brand-muted font-mono mt-0.5">{booking.timeSlot}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono ${
                        booking.status === 'Checked In' ? 'bg-emerald-50 text-brand-success' :
                        booking.status === 'Dikonfirmasi' ? 'bg-blue-50 text-sky-600' :
                        booking.status === 'Menunggu' ? 'bg-amber-50 text-brand-warning' :
                        'bg-red-50 text-brand-danger'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          booking.status === 'Checked In' ? 'bg-brand-success' :
                          booking.status === 'Dikonfirmasi' ? 'bg-sky-500' :
                          booking.status === 'Menunggu' ? 'bg-brand-warning' :
                          'bg-brand-danger'
                        }`} />
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-3 py-1.5 bg-brand-bg hover:bg-brand-accent/20 border border-brand-border hover:border-brand-accent rounded-xl font-medium text-brand-text transition-colors flex items-center gap-1 ml-auto"
                      >
                        <span>Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-brand-muted">
                    <AlertCircle className="w-8 h-8 text-brand-muted/50 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Tidak Ada Data Booking ditemukan</p>
                    <p className="text-xs text-brand-muted/70 mt-1">Coba sesuaikan filter atau parameter pencarian Anda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Drawer (Slides from Right) */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40" onClick={() => setSelectedBooking(null)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 max-w-md w-full bg-white shadow-2xl z-50 border-l border-brand-border flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg/50">
                <div>
                  <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider font-semibold">Detail Reservasi</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-lg font-bold font-display text-brand-text leading-none">{selectedBooking.id}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                      selectedBooking.status === 'Checked In' ? 'bg-emerald-50 text-brand-success' :
                      selectedBooking.status === 'Dikonfirmasi' ? 'bg-blue-50 text-sky-600' :
                      selectedBooking.status === 'Menunggu' ? 'bg-amber-50 text-brand-warning' :
                      'bg-red-50 text-brand-danger'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 hover:bg-brand-border text-brand-muted hover:text-brand-text rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Edit Status Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-brand-muted tracking-wider font-mono">Ubah Status Reservasi</h4>
                  <div className="bg-brand-bg/40 p-4 rounded-xl border border-brand-border/60 flex items-center justify-between gap-4">
                    <div className="text-xs text-brand-text">
                      <span className="text-[10px] font-mono text-brand-muted uppercase block leading-none mb-1.5">STATUS SAAT INI</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                        selectedBooking.status === 'Checked In' ? 'bg-emerald-50 text-brand-success' :
                        selectedBooking.status === 'Dikonfirmasi' ? 'bg-blue-50 text-sky-600' :
                        selectedBooking.status === 'Menunggu' ? 'bg-amber-50 text-brand-warning' :
                        'bg-red-50 text-brand-danger'
                      }`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                    <select
                      value={selectedBooking.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as Booking['status'];
                        handleUpdateStatus(selectedBooking.id, newStatus);
                        triggerToast('success', 'Status Diperbarui', `Status booking ${selectedBooking.id} diubah menjadi "${newStatus}".`);
                      }}
                      className="bg-white border border-brand-border text-xs py-2 px-3 rounded-xl outline-none text-brand-text font-semibold shadow-xs cursor-pointer focus:border-brand-primary/50"
                    >
                      <option value="Menunggu">Menunggu (Pending)</option>
                      <option value="Dikonfirmasi">Dikonfirmasi (Confirmed)</option>
                      <option value="Checked In">Checked In</option>
                      <option value="Dibatalkan">Dibatalkan (Cancelled)</option>
                    </select>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-brand-muted tracking-wider font-mono">Informasi Pelanggan</h4>
                  <div className="bg-brand-bg/40 p-4 rounded-xl border border-brand-border/60 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-accent/30 text-brand-secondary flex items-center justify-center">
                        <User className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-brand-text leading-none">{selectedBooking.customerName}</div>
                        <div className="text-[10px] text-brand-muted mt-1 font-mono">Akun Terverifikasi</div>
                      </div>
                    </div>
                    <div className="border-t border-brand-border/60 pt-2.5 space-y-1.5 text-xs text-brand-text">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-brand-muted" />
                        <span className="truncate">{selectedBooking.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-brand-muted" />
                        <span>{selectedBooking.customerPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workspace Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-brand-muted tracking-wider font-mono">Detail Ruangan</h4>
                  <div className="bg-brand-bg/40 p-4 rounded-xl border border-brand-border/60 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-brand-muted leading-none block">NAMA WORKSPACE</span>
                        <span className="text-xs font-semibold text-brand-text block mt-1">{selectedBooking.workspaceName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-brand-muted leading-none block">BIAYA SEWA</span>
                        <span className="text-xs font-bold text-brand-primary block mt-1">{formatRupiah(selectedBooking.price)}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-brand-border/60 pt-2 flex gap-1.5 items-start">
                      <MapPin className="w-4 h-4 text-brand-muted mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-mono text-brand-muted block">LOKASI CAFE PARTNER</span>
                        <span className="text-xs text-brand-text font-medium block mt-0.5">{selectedBooking.coffeeShopName}</span>
                      </div>
                    </div>

                    <div className="border-t border-brand-border/60 pt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-brand-muted block">TANGGAL RESERVASI</span>
                        <span className="font-semibold block mt-1 text-brand-text">{selectedBooking.bookingDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-brand-muted block">SLOT WAKTU</span>
                        <span className="font-mono font-medium block mt-1 text-brand-text">{selectedBooking.timeSlot}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Detail */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-brand-muted tracking-wider font-mono">Metode Pembayaran</h4>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-brand-bg/50 border border-brand-border/60">
                    <div className="flex items-center gap-2 text-xs">
                      <CreditCard className="w-4 h-4 text-brand-muted" />
                      <span className="font-semibold">{selectedBooking.paymentMethod}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                      selectedBooking.paymentStatus === 'Lunas' 
                        ? 'bg-emerald-50 text-brand-success' 
                        : 'bg-amber-50 text-brand-warning'
                    }`}>
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* QR Code Presentation */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-brand-muted tracking-wider font-mono">Check-In QR Code</h4>
                  <div className="bg-brand-bg/40 p-5 rounded-xl border border-brand-border/60 flex flex-col items-center justify-center text-center">
                    
                    {/* SVG QR CODE Visualizer */}
                    <div className="bg-white p-3.5 rounded-xl border border-brand-border/80 shadow-sm relative group flex items-center justify-center w-36 h-36">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(selectedBooking.id)}&color=2c2621&bgcolor=ffffff`}
                        alt={`QR Code for ${selectedBooking.id}`}
                        className="w-28 h-28 object-contain"
                        referrerPolicy="no-referrer"
                      />
                      
                      {selectedBooking.status === 'Checked In' && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center p-2 rounded-xl">
                          <CheckCircle2 className="w-8 h-8 text-brand-success animate-bounce" />
                          <span className="text-[9px] font-mono uppercase font-bold text-brand-success mt-1">Selesai Check-In</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-brand-muted mt-3 max-w-[160px] leading-relaxed">
                      Scan kode QR di atas untuk memvalidasi kedatangan di lokasi.
                    </p>
                    <span className="text-[10px] font-mono text-brand-text bg-white px-2 py-0.5 rounded border border-brand-border mt-1">
                      {selectedBooking.qrCodeData}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Footer */}
              <div className="p-4 border-t border-brand-border bg-brand-bg/30 flex justify-stretch gap-3">
                {selectedBooking.status === 'Checked In' ? (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking.id, 'Dikonfirmasi');
                      triggerToast('info', 'Check-In Dibatalkan', `Status check-in untuk ${selectedBooking.id} berhasil dibatalkan. Tiket dapat di-scan kembali.`);
                    }}
                    className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                    <span>Batal Check-In (Un-Check In)</span>
                  </button>
                ) : selectedBooking.status === 'Dibatalkan' ? (
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedBooking.id, 'Dikonfirmasi');
                      triggerToast('success', 'Reservasi Dipulihkan', `Booking ${selectedBooking.id} berhasil diaktifkan kembali.`);
                    }}
                    className="w-full px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pulihkan Reservasi</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedBooking.id, 'Dibatalkan');
                        triggerToast('warning', 'Reservasi Dibatalkan', `Booking ${selectedBooking.id} telah dibatalkan.`);
                      }}
                      className="flex-1 px-4 py-2.5 bg-white hover:bg-brand-danger/5 text-xs font-semibold text-brand-danger border border-brand-border rounded-xl transition-all cursor-pointer"
                    >
                      Batalkan Booking
                    </button>
                    <button
                      onClick={() => handleConfirmCheckIn(selectedBooking.id)}
                      className="flex-1 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Check-In Sekarang</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* QR Code Scanner Dialog Modal */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-brand-border"
            >
              <div className="px-6 py-4 bg-brand-bg/60 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-brand-primary animate-pulse" />
                  <span className="font-display font-bold text-sm text-brand-text">Kamera Scan QR Check-In</span>
                </div>
                <button 
                  onClick={() => {
                    stopCamera();
                    setShowScanner(false);
                  }}
                  className="p-1 text-brand-muted hover:text-brand-text rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 flex flex-col items-center">
                {/* Kamera Box Container */}
                <div className="relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-brand-border flex items-center justify-center">
                  {isCameraActive ? (
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      autoPlay
                      muted
                    />
                  ) : (
                    <div className="text-center p-6 text-zinc-400 flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-zinc-500" />
                      <p className="text-xs">Kamera Asli Sedang Tidak Tersedia</p>
                    </div>
                  )}
                  
                  {/* Efek kotak bidik pemindai */}
                  {isCameraActive && (
                    <div className="absolute inset-0 border-2 border-brand-primary/30 m-8 rounded-lg pointer-events-none flex items-center justify-center">
                      <div className="w-32 h-32 border-2 border-brand-primary animate-pulse rounded-md" />
                    </div>
                  )}
                </div>

                {/* Simulator QR (Dipertahankan dari UI desainmu) */}
                <div className="w-full bg-brand-bg/40 border border-brand-border/60 p-4 rounded-xl space-y-3">
                  <div className="text-xs font-semibold text-brand-muted font-mono uppercase tracking-wider">Quick Simulator QR</div>
                  <div className="flex gap-2">
                    <select
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                      className="flex-1 bg-white border border-brand-border text-xs py-2 px-3 rounded-xl outline-none text-brand-text cursor-pointer"
                    >
                      <option value="">Pilih Booking untuk simulasi Scan</option>
                      {bookings.map(b => (
                        <option key={b.id} value={b.id}>{b.id} - {b.customerName} ({b.status})</option>
                      ))}
                    </select>
                    <button
                      disabled={!scannedCode || isScanningProgress}
                      onClick={() => handleSimulateScan(scannedCode)}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary disabled:bg-zinc-300 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {isScanningProgress ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simulasi'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};