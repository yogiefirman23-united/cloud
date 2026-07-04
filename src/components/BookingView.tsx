import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [cameraError, setCameraError] = useState<string | null>(null);

  // HTML5 Video element reference for real camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef(false);

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

  // Handle scanned QR Code
  const handleMatchedQRCode = useCallback((scannedText: string) => {
    const trimmed = scannedText.trim();
    if (!trimmed || isScanningRef.current) return;

    console.log('QR Code detected:', trimmed);

    isScanningRef.current = true;
    stopCamera();

    // Cari booking dengan berbagai cara
    let matched = bookings.find(b => 
      b.id === trimmed || 
      b.id.toLowerCase() === trimmed.toLowerCase() ||
      b.qrCodeData === trimmed ||
      b.qrCodeData.toLowerCase() === trimmed.toLowerCase()
    );

    if (!matched) {
      matched = bookings.find(b => 
        b.id.includes(trimmed) || 
        trimmed.includes(b.id) ||
        b.qrCodeData.includes(trimmed) || 
        trimmed.includes(b.qrCodeData)
      );
    }

    console.log('Matched booking:', matched);

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
        handleConfirmCheckIn(matched.id, true);
      }
    } else {
      setScannerResult({
        valid: false,
        booking: null
      });
      triggerToast('danger', 'QR Tidak Terdaftar', `Kode "${trimmed}" tidak cocok dengan data reservasi mana pun.`);
    }

    setTimeout(() => {
      isScanningRef.current = false;
    }, 2000);
  }, [bookings, triggerToast]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setIsCameraActive(true);
    setScannerResult(null);
    setIsScanningProgress(false);
    isScanningRef.current = false;
    setCameraError(null);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser tidak mendukung akses kamera');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        triggerToast('info', 'Kamera Aktif', 'Kamera terhubung! Dekatkan kode QR ke kamera untuk memindai otomatis.');
        startQRScanning();
      }
    } catch (err: any) {
      console.error("Error accessing camera: ", err);
      setIsCameraActive(false);
      setCameraError(err.message || 'Tidak dapat mengakses kamera fisik');
      triggerToast(
        'warning', 
        'Kamera Terblokir', 
        err.message || 'Tidak dapat mengakses kamera fisik. Silakan gunakan simulator QR di bawah ini.'
      );
    }
  }, [triggerToast]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    isScanningRef.current = false;
  }, []);

  // Start QR Scanning using canvas
  const startQRScanning = useCallback(() => {
    if (!videoRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const scanFrame = () => {
      if (!isCameraActive || !video || video.paused || video.ended || video.readyState !== video.HAVE_ENOUGH_DATA) {
        if (isCameraActive) {
          animationFrameRef.current = requestAnimationFrame(scanFrame);
        }
        return;
      }

      try {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });
        
        if (code && code.data && !isScanningRef.current) {
          console.log('QR Code detected in frame:', code.data);
          handleMatchedQRCode(code.data);
          return;
        }
      } catch (e) {
        console.error("jsQR error during frame processing:", e);
      }

      if (isCameraActive) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    };

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [isCameraActive, handleMatchedQRCode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle simulated scan
  const handleSimulateScan = useCallback((codeToScan: string) => {
    if (!codeToScan || isScanningRef.current) return;

    setIsScanningProgress(true);
    setScannerResult(null);
    isScanningRef.current = true;

    if (isCameraActive) {
      stopCamera();
    }
    
    setTimeout(() => {
      setIsScanningProgress(false);
      handleMatchedQRCode(codeToScan);
      
      setTimeout(() => {
        isScanningRef.current = false;
      }, 1500);
    }, 1200);
  }, [handleMatchedQRCode, isCameraActive, stopCamera]);

  // Update Booking Status
  const handleUpdateStatus = useCallback((bookingId: string, newStatus: Booking['status']) => {
    setBookings(prev => 
      prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      )
    );
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
    }
  }, [setBookings, selectedBooking]);

  // Confirm Check In
  const handleConfirmCheckIn = useCallback((bookingId: string, isFromScanner: boolean = false) => {
    setBookings(prev => 
      prev.map(b => 
        b.id === bookingId ? { ...b, status: 'Checked In' as const } : b
      )
    );
    
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
        isScanningRef.current = false;
      } else {
        triggerToast('success', 'Check-In Sukses', `Reservasi ${bookingId} berhasil di-checkin! Status diperbarui.`);
        setScannerResult(null);
      }
    } else {
      triggerToast('success', 'Check-In Sukses', `Reservasi ${bookingId} berhasil di-checkin! Status diperbarui.`);
    }
  }, [setBookings, selectedBooking, bookings, triggerToast, stopCamera]);

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
          
          <button
            onClick={() => {
              setShowScanner(true);
              setCameraError(null);
              setTimeout(() => startCamera(), 300);
            }}
            className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <QrCode className="w-4.5 h-4.5" />
            <span>Scan QR Check-In</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-brand-muted pointer-events-none" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-brand-bg/50 border border-brand-border/80 text-xs py-2.5 pl-9 pr-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white transition-all text-brand-text"
            />
          </div>

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

      {/* Booking Detail Drawer - shortened for brevity */}
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* ... (konten detail drawer sama seperti sebelumnya) ... */}
                <div className="text-xs text-brand-muted text-center py-8">
                  Detail booking untuk {selectedBooking.customerName}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-brand-border bg-brand-bg/30 flex justify-stretch gap-3">
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* QR Code Scanner Dialog Modal - Final Version */}
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
                    setShowScanner(false);
                    stopCamera();
                    setScanSuccessBooking(null);
                    setScannerResult(null);
                    isScanningRef.current = false;
                  }}
                  className="p-1 hover:bg-brand-border/60 text-brand-muted hover:text-brand-text rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {scanSuccessBooking ? (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 text-center space-y-6 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50/40 to-white"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl opacity-40 animate-pulse scale-150" />
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white relative shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-600 uppercase bg-emerald-100 px-3 py-1 rounded-full">
                      Scan Berhasil & Valid
                    </span>
                    <h3 className="text-xl font-bold font-display text-zinc-900">Check-In Sukses!</h3>
                    <p className="text-xs text-brand-muted max-w-xs mx-auto leading-relaxed">
                      Status kehadiran pelanggan telah diperbarui menjadi <strong className="text-brand-success font-semibold">Checked In</strong>.
                    </p>
                  </div>

                  <div className="w-full bg-white border border-brand-border p-5 rounded-2xl shadow-sm text-left space-y-3">
                    <div className="flex justify-between items-start border-b border-brand-border/60 pb-3">
                      <div>
                        <span className="text-[9px] font-mono text-brand-muted uppercase">BOOKING ID</span>
                        <p className="text-xs font-mono font-bold text-brand-primary">{scanSuccessBooking.id}</p>
                      </div>
                      <span className="bg-emerald-50 text-brand-success text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                        LUNAS
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                      <div>
                        <span className="text-[9px] font-mono text-brand-muted uppercase block">PELANGGAN</span>
                        <span className="font-semibold text-zinc-800">{scanSuccessBooking.customerName}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-brand-muted uppercase block">WORKSPACE</span>
                        <span className="font-semibold text-zinc-800">{scanSuccessBooking.workspaceName}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[9px] font-mono text-brand-muted uppercase block">LOKASI CAFE PARTNER</span>
                        <span className="font-semibold text-zinc-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-muted flex-shrink-0" />
                          <span className="truncate">{scanSuccessBooking.coffeeShopName}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-brand-muted uppercase block">TANGGAL</span>
                        <span className="font-mono font-medium text-zinc-700">{scanSuccessBooking.bookingDate}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-brand-muted uppercase block">SLOT WAKTU</span>
                        <span className="font-mono font-medium text-zinc-700">{scanSuccessBooking.timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full pt-2">
                    <button
                      onClick={() => {
                        setShowScanner(false);
                        setScanSuccessBooking(null);
                        setScannerResult(null);
                      }}
                      className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Selesai & Tutup
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Camera and Simulator */
                <div className="p-6 space-y-5">
                  {/* Camera Preview */}
                  <div className="aspect-video bg-zinc-950 rounded-2xl border border-brand-border overflow-hidden relative flex flex-col items-center justify-center">
                    {isCameraActive ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="flex flex-col items-center text-center p-6 text-zinc-400">
                        <Camera className="w-8 h-8 text-zinc-600 mb-2 animate-pulse" />
                        <p className="text-xs font-semibold">Kamera Asli Sedang Tidak Tersedia</p>
                        <p className="text-[10px] text-zinc-500 max-w-xs mt-1">Menggunakan integrasi simulator QR cerdas di bawah untuk pengujian cepat.</p>
                      </div>
                    )}

                    {/* Scanner overlay */}
                    <div className="absolute inset-x-8 top-1/2 h-0.5 bg-brand-primary shadow-[0_0_8px_rgba(129,11,56,0.8)] animate-bounce" />
                    <div className="absolute top-1/4 left-1/4 w-8 h-8 border-t-2 border-l-2 border-brand-primary" />
                    <div className="absolute top-1/4 right-1/4 w-8 h-8 border-t-2 border-r-2 border-brand-primary" />
                    <div className="absolute bottom-1/4 left-1/4 w-8 h-8 border-b-2 border-l-2 border-brand-primary" />
                    <div className="absolute bottom-1/4 right-1/4 w-8 h-8 border-b-2 border-r-2 border-brand-primary" />

                    {isScanningProgress && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                        <p className="text-xs text-white font-medium font-mono mt-2 uppercase tracking-wide">Menganalisis Kode QR...</p>
                      </div>
                    )}
                  </div>

                  {/* Simulator */}
                  <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-brand-text font-semibold font-display">
                      <Zap className="w-4 h-4 text-brand-primary" />
                      <span>Quick Simulator QR (Pilih Booking untuk simulasi Scan)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        onChange={(e) => setScannedCode(e.target.value)}
                        value={scannedCode}
                        className="bg-white border border-brand-border text-xs py-2 px-2.5 rounded-xl outline-none text-brand-text cursor-pointer"
                      >
                        <option value="">-- Pilih Data QR --</option>
                        {bookings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.id} - {b.customerName} ({b.status})
                          </option>
                        ))}
                        <option value="QR-WW-INVALID-99">QR-INVALID-99 (Kode Palsu)</option>
                      </select>

                      <button
                        onClick={() => handleSimulateScan(scannedCode)}
                        disabled={!scannedCode || isScanningProgress}
                        className="px-4 py-2 bg-brand-secondary hover:bg-brand-primary text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanningProgress ? 'animate-spin' : ''}`} />
                        <span>Trigger Deteksi QR</span>
                      </button>
                    </div>
                  </div>

                  {/* Result */}
                  {scannerResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-xl border ${
                        scannerResult.valid && !scannerResult.checkedInAlready ? 'bg-emerald-50 border-brand-success/30' :
                        scannerResult.valid && scannerResult.checkedInAlready ? 'bg-blue-50 border-blue-200' :
                        'bg-red-50 border-brand-danger/30'
                      }`}
                    >
                      {scannerResult.valid && scannerResult.booking ? (
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brand-success mt-0.5 flex-shrink-0" />
                          <div className="flex-1 space-y-1 text-xs">
                            <p className="font-bold text-brand-text">Booking Valid</p>
                            <p className="text-brand-muted">Pelanggan: <strong className="text-brand-text">{scannerResult.booking.customerName}</strong></p>
                            <p className="text-brand-muted">Ruang: <strong className="text-brand-text">{scannerResult.booking.workspaceName}</strong></p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-brand-danger mt-0.5 flex-shrink-0" />
                          <div className="space-y-1 text-xs">
                            <p className="font-bold text-brand-danger">Booking Invalid</p>
                            <p className="text-brand-muted leading-relaxed">
                              Kode QR tidak cocok dengan sistem reservasi aktif.
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {!scanSuccessBooking && (
                <div className="px-6 py-4 bg-brand-bg/40 border-t border-brand-border flex justify-end gap-2.5">
                  <button
                    onClick={() => {
                      setShowScanner(false);
                      stopCamera();
                      setScannerResult(null);
                      setScanSuccessBooking(null);
                    }}
                    className="px-4 py-2 bg-white hover:bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold text-brand-text transition-colors"
                  >
                    Batal / Keluar
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};