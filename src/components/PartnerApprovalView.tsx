import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Handshake, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  X,
  AlertCircle,
  FileCheck2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { PartnerRegistration } from '../types';

interface PartnerApprovalViewProps {
  partners: PartnerRegistration[];
  setPartners: React.Dispatch<React.SetStateAction<PartnerRegistration[]>>;
  triggerToast: (type: 'success' | 'warning' | 'danger' | 'info', title: string, msg: string) => void;
  currentRole: 'Super Admin' | 'Admin';
}

export const PartnerApprovalView: React.FC<PartnerApprovalViewProps> = ({
  partners,
  setPartners,
  triggerToast,
  currentRole
}) => {
  const [selectedPartner, setSelectedPartner] = useState<PartnerRegistration | null>(null);

  const handleApprove = (partnerId: string) => {
    if (currentRole !== 'Super Admin') {
      triggerToast('danger', 'Akses Dibatasi', 'Hanya Super Admin yang berhak menyetujui kemitraan baru.');
      return;
    }

    setPartners(prev => prev.map(p => 
      p.id === partnerId ? { ...p, status: 'Disetujui' as const } : p
    ));

    // Update active modal view if open
    if (selectedPartner && selectedPartner.id === partnerId) {
      setSelectedPartner(prev => prev ? { ...prev, status: 'Disetujui' as const } : null);
    }

    const partner = partners.find(p => p.id === partnerId);
    triggerToast(
      'success', 
      'Mitra Disetujui', 
      `Kemitraan untuk '${partner?.businessName}' berhasil disetujui. Notifikasi selamat dikirim ke email.`
    );
  };

  const handleReject = (partnerId: string) => {
    if (currentRole !== 'Super Admin') {
      triggerToast('danger', 'Akses Dibatasi', 'Hanya Super Admin yang berhak menolak kemitraan baru.');
      return;
    }

    setPartners(prev => prev.map(p => 
      p.id === partnerId ? { ...p, status: 'Ditolak' as const } : p
    ));

    // Update active modal view if open
    if (selectedPartner && selectedPartner.id === partnerId) {
      setSelectedPartner(prev => prev ? { ...prev, status: 'Ditolak' as const } : null);
    }

    const partner = partners.find(p => p.id === partnerId);
    triggerToast(
      'warning', 
      'Mitra Ditolak', 
      `Permohonan dari '${partner?.businessName}' telah ditolak.`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Role Notice for Testing */}
      {currentRole !== 'Super Admin' && (
        <div className="bg-amber-50 border border-brand-warning/30 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-brand-warning mt-0.5 flex-shrink-0" />
          <div className="text-xs text-brand-secondary leading-relaxed">
            <span className="font-bold text-brand-text">Mode Admin Aktif:</span> Anda memiliki hak akses baca saja pada modul ini. 
            Untuk menyetujui atau menolak permohonan kemitraan coffee shop baru, harap ganti peran Anda menjadi <strong>Super Admin</strong> menggunakan tombol <strong>Role Demo</strong> di kanan atas header.
          </div>
        </div>
      )}

      {/* Partner Registrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => {
          return (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-brand-border premium-card-shadow overflow-hidden flex flex-col justify-between"
            >
              
              {/* Header card info */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-brand-primary bg-brand-primary/5 px-2.5 py-1 rounded-lg">
                      {partner.id}
                    </span>
                    <span className="text-[10px] text-brand-muted font-mono block mt-2">TERDAFTAR: {partner.registeredDate}</span>
                  </div>
                  
                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono uppercase ${
                    partner.status === 'Disetujui' ? 'bg-emerald-50 text-brand-success' :
                    partner.status === 'Menunggu' ? 'bg-amber-50 text-brand-warning' :
                    'bg-red-50 text-brand-danger'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      partner.status === 'Disetujui' ? 'bg-brand-success' :
                      partner.status === 'Menunggu' ? 'bg-brand-warning' :
                      'bg-brand-danger'
                    }`} />
                    {partner.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold font-display text-brand-text leading-tight">{partner.businessName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-brand-muted">
                    <User className="w-3.5 h-3.5" />
                    <span>Pemilik: <strong>{partner.ownerName}</strong></span>
                  </div>
                </div>

                {/* Micro info layout */}
                <div className="pt-3 border-t border-brand-border/60 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-brand-muted">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{partner.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-muted">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{partner.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-muted">
                    <FileText className="w-3.5 h-3.5 text-brand-primary/60" />
                    <span>Lisensi: <span className="font-mono">{partner.businessLicense}</span></span>
                  </div>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="px-5 py-3.5 bg-brand-bg/40 border-t border-brand-border flex items-center justify-between gap-2.5">
                <button
                  onClick={() => setSelectedPartner(partner)}
                  className="px-3 py-1.5 bg-white hover:bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold text-brand-text flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-brand-muted" />
                  <span>Detail Berkas</span>
                </button>

                {partner.status === 'Menunggu' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(partner.id)}
                      disabled={currentRole !== 'Super Admin'}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-brand-danger rounded-lg border border-red-200/50 transition-colors disabled:opacity-40"
                      title="Tolak Pendaftaran"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleApprove(partner.id)}
                      disabled={currentRole !== 'Super Admin'}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-brand-success rounded-lg border border-emerald-200/50 transition-colors disabled:opacity-40"
                      title="Setujui Pendaftaran"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Partner Detail Overlay Modal */}
      <AnimatePresence>
        {selectedPartner && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-brand-border flex flex-col"
            >
              
              {/* Header */}
              <div className="px-6 py-4 bg-brand-bg/60 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-brand-primary" />
                  <span className="font-display font-bold text-sm text-brand-text">Berkas Registrasi Kemitraan</span>
                </div>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="p-1 hover:bg-brand-border/60 text-brand-muted hover:text-brand-text rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                
                {/* Partner General Identity */}
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-bold font-display text-brand-text leading-tight">{selectedPartner.businessName}</h3>
                    <p className="text-xs text-brand-muted mt-1">Registrasi ID: <span className="font-mono text-brand-text font-medium">{selectedPartner.id}</span></p>
                  </div>
                  
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-mono uppercase ${
                    selectedPartner.status === 'Disetujui' ? 'bg-emerald-50 text-brand-success' :
                    selectedPartner.status === 'Menunggu' ? 'bg-amber-50 text-brand-warning' :
                    'bg-red-50 text-brand-danger'
                  }`}>
                    {selectedPartner.status}
                  </span>
                </div>

                {/* Documents Summary */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-brand-bg/40 p-3.5 rounded-xl border border-brand-border/60">
                    <span className="text-[10px] font-mono text-brand-muted block uppercase">Nama Pemilik Bisnis</span>
                    <span className="font-semibold text-brand-text block mt-1.5">{selectedPartner.ownerName}</span>
                  </div>
                  <div className="bg-brand-bg/40 p-3.5 rounded-xl border border-brand-border/60">
                    <span className="text-[10px] font-mono text-brand-muted block uppercase">Nomor Izin Usaha (NIB)</span>
                    <span className="font-mono font-semibold text-brand-text block mt-1.5">{selectedPartner.businessLicense}</span>
                  </div>
                </div>

                {/* Proposal Text details */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider font-semibold">Deskripsi Proposal Kerjasama</span>
                  <div className="bg-brand-bg/30 p-4 rounded-xl border border-brand-border/60 text-xs text-brand-text leading-relaxed">
                    {selectedPartner.proposalDetails}
                  </div>
                </div>

                {/* Attached Workspace Photos */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider font-semibold">Lampiran Foto Workspace Pengusul</span>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPartner.workspacePhotos.map((photo, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden bg-brand-bg border border-brand-border/65">
                        <img 
                          src={photo} 
                          alt={`workspace-${i}`} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Notice */}
                {selectedPartner.status === 'Disetujui' && (
                  <div className="p-3.5 bg-emerald-50 border border-brand-success/20 rounded-xl flex items-center gap-2 text-xs text-brand-success">
                    <FileCheck2 className="w-4 h-4 flex-shrink-0" />
                    <span>Dokumen ini telah disahkan dan disetujui untuk diunggah ke pencarian publik.</span>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-brand-bg/40 border-t border-brand-border flex justify-end gap-2.5">
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="px-4 py-2 bg-white hover:bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold text-brand-text transition-colors"
                >
                  Tutup
                </button>
                
                {selectedPartner.status === 'Menunggu' && (
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => handleReject(selectedPartner.id)}
                      disabled={currentRole !== 'Super Admin'}
                      className="px-4 py-2 bg-white hover:bg-brand-danger/5 border border-brand-danger/30 text-brand-danger rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleApprove(selectedPartner.id)}
                      disabled={currentRole !== 'Super Admin'}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-40"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Setujui Kemitraan</span>
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
