import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  ShieldAlert, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  X, 
  Check, 
  Edit2, 
  Power,
  Clock,
  KeyRound,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { AdminUser, AdminRole } from '../types';

interface AdminManagementViewProps {
  admins: AdminUser[];
  setAdmins: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  triggerToast: (type: 'success' | 'warning' | 'danger' | 'info', title: string, msg: string) => void;
  currentRole: AdminRole;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  admins,
  setAdmins,
  triggerToast,
  currentRole
}) => {
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('Admin');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  // Guard access - only Super Admin can see this page
  if (currentRole !== 'Super Admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto space-y-5">
        <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-display text-brand-text">Akses Terbatas: Super Admin Sahaja</h2>
          <p className="text-xs text-brand-muted leading-relaxed">
            Anda sedang masuk menggunakan peran <strong className="text-brand-text">Admin</strong>. Sesuai dengan matrik otorisasi internal Work Well, hanya akun ber-peran <strong className="text-brand-text">Super Admin</strong> yang diizinkan untuk mengelola akun administrator lain.
          </p>
        </div>
      </div>
    );
  }

  const openAddModal = () => {
    setEditingAdmin(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('Admin');
    setFormStatus('Aktif');
    setShowAddEditModal(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormName(admin.name);
    setFormEmail(admin.email);
    setFormPassword('********');
    setFormRole(admin.role);
    setFormStatus(admin.status);
    setShowAddEditModal(true);
  };

  const openDeleteModal = (admin: AdminUser) => {
    // Cek apakah admin yang akan dihapus adalah Super Admin terakhir
    const superAdminCount = admins.filter(a => a.role === 'Super Admin').length;
    if (admin.role === 'Super Admin' && superAdminCount <= 1) {
      triggerToast('danger', 'Tidak Dapat Dihapus', 'Harus ada minimal 1 Super Admin dalam sistem.');
      return;
    }
    
    // Cegah menghapus diri sendiri
    if (admin.email === 'budi@workwell.co.id') {
      triggerToast('danger', 'Tidak Dapat Dihapus', 'Anda tidak dapat menghapus akun Super Admin utama Anda sendiri.');
      return;
    }

    setDeletingAdmin(admin);
    setShowDeleteModal(true);
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName || !formEmail) {
      triggerToast('danger', 'Validasi Gagal', 'Harap lengkapi nama dan email administrator.');
      return;
    }

    // Validasi email unik (kecuali untuk edit dengan email yang sama)
    const emailExists = admins.some(a => 
      a.email === formEmail && (editingAdmin ? a.id !== editingAdmin.id : true)
    );
    
    if (emailExists) {
      triggerToast('danger', 'Email Sudah Terdaftar', `Email ${formEmail} sudah digunakan oleh admin lain.`);
      return;
    }

    if (editingAdmin) {
      // Edit
      setAdmins(prev => prev.map(a => 
        a.id === editingAdmin.id 
          ? {
              ...a,
              name: formName,
              email: formEmail,
              role: formRole,
              status: formStatus
            }
          : a
      ));
      triggerToast('success', 'Admin Diperbarui', `Akun ${formName} berhasil disimpan.`);
    } else {
      // Create new
      // Validasi password untuk admin baru
      if (!formPassword || formPassword.length < 6) {
        triggerToast('danger', 'Password Tidak Valid', 'Password minimal 6 karakter.');
        return;
      }

      const newAdmin: AdminUser = {
        id: `ADM-${Math.floor(100 + Math.random() * 900)}`,
        name: formName,
        email: formEmail,
        role: formRole,
        status: formStatus,
        lastLogin: 'Belum Pernah'
      };
      setAdmins(prev => [...prev, newAdmin]);
      triggerToast('success', 'Admin Baru Terdaftar', `Akun administrator untuk ${formName} berhasil didaftarkan.`);
    }

    setShowAddEditModal(false);
    setFormPassword('');
  };

  const handleDeleteAdmin = () => {
    if (!deletingAdmin) return;

    setAdmins(prev => prev.filter(a => a.id !== deletingAdmin.id));
    triggerToast('success', 'Admin Dihapus', `Akun ${deletingAdmin.name} berhasil dihapus dari sistem.`);
    setShowDeleteModal(false);
    setDeletingAdmin(null);
  };

  const handleToggleStatus = (admin: AdminUser) => {
    // Prevent self deactivation for demo safety
    if (admin.email === 'budi@workwell.co.id') {
      triggerToast('danger', 'Deaktivasi Ditolak', 'Sistem mencegah Anda menonaktifkan akun Super Admin utama Anda sendiri.');
      return;
    }

    const nextStatus = admin.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    setAdmins(prev => prev.map(a => 
      a.id === admin.id ? { ...a, status: nextStatus } : a
    ));

    triggerToast(
      nextStatus === 'Aktif' ? 'success' : 'warning',
      `Admin ${nextStatus === 'Aktif' ? 'Diaktifkan' : 'Dinonaktifkan'}`,
      `Status akun ${admin.name} kini berubah menjadi ${nextStatus}.`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Search and control section */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border premium-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold font-display text-brand-text">Manajemen Akun Administrator</h3>
          <p className="text-xs text-brand-muted mt-0.5">Kelola otorisasi, peran, dan keaktifan staf operasional internal</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Admin Baru</span>
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl border border-brand-border premium-card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-bg/40 text-brand-muted font-mono uppercase tracking-wider text-[10px] border-b border-brand-border/80">
                <th className="px-6 py-4 font-semibold">Nama Admin</th>
                <th className="px-6 py-4 font-semibold">Alamat Email</th>
                <th className="px-4 py-4 font-semibold">Peran Otorisasi (Role)</th>
                <th className="px-4 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold">Login Terakhir</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60 text-brand-text font-sans">
              {admins.length > 0 ? (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-brand-bg/25 transition-colors">
                    
                    {/* Name with initials badge */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-accent/25 text-brand-secondary font-bold font-display text-xs flex items-center justify-center flex-shrink-0">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-brand-text text-xs">{admin.name}</div>
                          <div className="text-[10px] text-brand-muted font-mono mt-0.5">{admin.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 font-medium text-brand-muted">
                      {admin.email}
                    </td>

                    {/* Role with shield icon */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        {admin.role === 'Super Admin' ? (
                          <ShieldCheck className="w-4 h-4 text-brand-primary" />
                        ) : (
                          <User className="w-4 h-4 text-brand-muted" />
                        )}
                        <span className={admin.role === 'Super Admin' ? 'font-semibold text-brand-primary' : 'font-medium'}>
                          {admin.role}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono ${
                        admin.status === 'Aktif' 
                          ? 'bg-emerald-50 text-brand-success' 
                          : 'bg-red-50 text-brand-danger'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          admin.status === 'Aktif' ? 'bg-brand-success' : 'bg-brand-danger'
                        }`} />
                        {admin.status}
                      </span>
                    </td>

                    {/* Last login */}
                    <td className="px-6 py-4 text-brand-muted font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 opacity-60" />
                        <span>{admin.lastLogin}</span>
                      </div>
                    </td>

                    {/* Action buttons - EDIT, TOGGLE STATUS, DELETE */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Toggle status (UPDATE) */}
                        <button
                          onClick={() => handleToggleStatus(admin)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            admin.status === 'Aktif'
                              ? 'bg-white hover:bg-red-50 text-brand-danger border-brand-border hover:border-red-200'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent'
                          }`}
                          title={admin.status === 'Aktif' ? 'Nonaktifkan Admin' : 'Aktifkan Admin'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit (UPDATE) */}
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-1.5 bg-white hover:bg-brand-bg text-brand-muted hover:text-brand-text border border-brand-border hover:border-brand-accent rounded-lg transition-colors cursor-pointer"
                          title="Ubah Rincian Admin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete (DELETE) */}
                        <button
                          onClick={() => openDeleteModal(admin)}
                          className={`p-1.5 bg-white hover:bg-red-50 text-brand-muted hover:text-brand-danger border border-brand-border hover:border-red-200 rounded-lg transition-colors cursor-pointer ${
                            admin.email === 'budi@workwell.co.id' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title={admin.email === 'budi@workwell.co.id' ? 'Tidak dapat menghapus Super Admin utama' : 'Hapus Admin'}
                          disabled={admin.email === 'budi@workwell.co.id'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-brand-muted">
                    <AlertCircle className="w-8 h-8 text-brand-muted/50 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Tidak Ada Data Admin</p>
                    <p className="text-xs text-brand-muted/70 mt-1">Klik "Tambah Admin Baru" untuk menambahkan administrator.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Admin Form Modal */}
      <AnimatePresence>
        {showAddEditModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-brand-border flex flex-col"
            >
              
              {/* Header */}
              <div className="px-6 py-4 bg-brand-bg/60 border-b border-brand-border flex items-center justify-between">
                <span className="font-display font-bold text-sm text-brand-text">
                  {editingAdmin ? 'Ubah Informasi Administrator' : 'Daftarkan Administrator Baru'}
                </span>
                <button
                  onClick={() => {
                    setShowAddEditModal(false);
                    setFormPassword('');
                  }}
                  className="p-1 hover:bg-brand-border text-brand-muted hover:text-brand-text rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveAdmin} className="p-6 space-y-4">
                
                {/* Admin Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text font-display flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-brand-muted" />
                    <span>Nama Lengkap Staf</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dewo Prasetyo"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white text-brand-text"
                  />
                </div>

                {/* Email address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text font-display flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-brand-muted" />
                    <span>Alamat Email Internal (@workwell.co.id)</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Contoh: dewo@workwell.co.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white text-brand-text"
                  />
                </div>

                {/* Password field */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text font-display flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-brand-muted" />
                    <span>Kata Sandi (Password)</span>
                  </label>
                  <input
                    type="password"
                    required={!editingAdmin}
                    disabled={editingAdmin !== null}
                    placeholder={editingAdmin ? 'Tidak dapat mengubah password di mode demo' : 'Masukkan minimal 6 karakter...'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white text-brand-text font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {editingAdmin && (
                    <p className="text-[10px] text-brand-muted">* Password tidak dapat diubah melalui form ini</p>
                  )}
                </div>

                {/* Role selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text font-display">Peran Otorisasi (Role Badge)</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as AdminRole)}
                    className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none text-brand-text cursor-pointer"
                  >
                    <option value="Admin">Admin (Otoritas Terbatas)</option>
                    <option value="Super Admin">Super Admin (Otoritas Penuh)</option>
                  </select>
                </div>

                {/* Status selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text font-display">Status Keanggotaan</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none text-brand-text cursor-pointer"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                {/* Action Row */}
                <div className="pt-4 border-t border-brand-border flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEditModal(false);
                      setFormPassword('');
                    }}
                    className="px-4 py-2.5 bg-white hover:bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold text-brand-text transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Data</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deletingAdmin && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-brand-border"
            >
              <div className="p-6 space-y-4">
                {/* Icon */}
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 text-brand-danger flex items-center justify-center">
                    <Trash2 className="w-8 h-8" />
                  </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold font-display text-brand-text">Konfirmasi Hapus Admin</h3>
                  <p className="text-sm text-brand-muted">
                    Apakah Anda yakin ingin menghapus akun administrator <strong className="text-brand-text">{deletingAdmin.name}</strong>?
                  </p>
                  <p className="text-xs text-brand-muted/70">
                    Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
                  </p>
                </div>

                {/* Admin Info */}
                <div className="bg-brand-bg/40 p-3 rounded-xl border border-brand-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-brand-muted">Email:</span>
                    <span className="font-mono font-semibold">{deletingAdmin.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-brand-muted">Role:</span>
                    <span className={`font-semibold ${deletingAdmin.role === 'Super Admin' ? 'text-brand-primary' : ''}`}>
                      {deletingAdmin.role}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingAdmin(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-white hover:bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold text-brand-text transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteAdmin}
                    className="flex-1 px-4 py-2.5 bg-brand-danger hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                  >
                    Hapus Permanen
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};