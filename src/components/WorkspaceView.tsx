import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  Users, 
  DollarSign, 
  Edit3, 
  Power, 
  X, 
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import { Workspace } from '../types';

interface WorkspaceViewProps {
  workspaces: Workspace[];
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
  triggerToast: (type: 'success' | 'warning' | 'danger' | 'info', title: string, msg: string) => void;
  currentRole: 'Super Admin' | 'Admin';
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  workspaces,
  setWorkspaces,
  triggerToast,
  currentRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCoffeeShop, setFormCoffeeShop] = useState('');
  const [formCapacity, setFormCapacity] = useState(2);
  const [formPrice, setFormPrice] = useState(30000);
  const [formLocation, setFormLocation] = useState('Jakarta Selatan');
  const [formImage, setFormImage] = useState('');
  const [formAvailability, setFormAvailability] = useState<'Tersedia' | 'Penuh' | 'Tutup'>('Tersedia');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  // Filter Locations from unique entries
  const uniqueLocations = Array.from(new Set(workspaces.map(w => w.location)));

  // Filter list
  const filteredWorkspaces = workspaces.filter(ws => {
    const matchesSearch = 
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.coffeeShopName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = filterLocation ? ws.location === filterLocation : true;
    const matchesStatus = filterStatus ? ws.status === filterStatus : true;

    return matchesSearch && matchesLocation && matchesStatus;
  });

  const openAddModal = () => {
    setEditingWorkspace(null);
    setFormName('');
    setFormCoffeeShop('');
    setFormCapacity(4);
    setFormPrice(45000);
    setFormLocation('Jakarta Selatan');
    setFormImage('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600');
    setFormAvailability('Tersedia');
    setFormStatus('Aktif');
    setShowAddEditModal(true);
  };

  const openEditModal = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setFormName(workspace.name);
    setFormCoffeeShop(workspace.coffeeShopName);
    setFormCapacity(workspace.capacity);
    setFormPrice(workspace.pricePerHour);
    setFormLocation(workspace.location);
    setFormImage(workspace.imageUrl);
    setFormAvailability(workspace.availability);
    setFormStatus(workspace.status);
    setShowAddEditModal(true);
  };

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formName || !formCoffeeShop) {
      triggerToast('danger', 'Formulir Salah', 'Harap isi nama workspace dan kedai kopi.');
      return;
    }

    if (editingWorkspace) {
      // Edit mode
      setWorkspaces(prev => prev.map(ws => 
        ws.id === editingWorkspace.id 
          ? {
              ...ws,
              name: formName,
              coffeeShopName: formCoffeeShop,
              capacity: Number(formCapacity),
              pricePerHour: Number(formPrice),
              location: formLocation,
              imageUrl: formImage,
              availability: formAvailability,
              status: formStatus
            }
          : ws
      ));
      triggerToast('success', 'Workspace Diperbarui', `Ruang ${formName} berhasil disimpan.`);
    } else {
      // Add mode
      const newWorkspace: Workspace = {
        id: `WS-${Math.floor(100 + Math.random() * 900)}`,
        name: formName,
        coffeeShopName: formCoffeeShop,
        capacity: Number(formCapacity),
        pricePerHour: Number(formPrice),
        imageUrl: formImage || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600',
        availability: formAvailability,
        status: formStatus,
        location: formLocation
      };
      setWorkspaces(prev => [newWorkspace, ...prev]);
      triggerToast('success', 'Workspace Ditambahkan', `Ruang ${formName} berhasil terdaftar di Work Well.`);
    }

    setShowAddEditModal(false);
  };

  const handleToggleStatus = (workspace: Workspace) => {
    const nextStatus = workspace.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    const nextAvailability = nextStatus === 'Nonaktif' ? 'Tutup' : 'Tersedia';

    setWorkspaces(prev => prev.map(ws => 
      ws.id === workspace.id 
        ? { ...ws, status: nextStatus, availability: nextAvailability } 
        : ws
    ));

    triggerToast(
      nextStatus === 'Aktif' ? 'success' : 'warning', 
      `Workspace ${nextStatus === 'Aktif' ? 'Diaktifkan' : 'Dinonaktifkan'}`, 
      `Status ${workspace.name} diperbarui menjadi ${nextStatus}.`
    );
  };

  const formatRupiah = (num: number) => {
    return 'Rp' + num.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Control Header Panel */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border premium-card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search & Filter Inputs */}
        <div className="flex flex-1 flex-wrap gap-3 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              placeholder="Cari workspace atau coffee shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-bg/60 border border-brand-border/80 text-xs py-2.5 pl-9 pr-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white transition-all text-brand-text"
            />
          </div>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="bg-brand-bg/60 border border-brand-border/80 text-xs py-2 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white text-brand-text cursor-pointer"
          >
            <option value="">Semua Lokasi</option>
            {uniqueLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-brand-bg/60 border border-brand-border/80 text-xs py-2 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white text-brand-text cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        {/* Add Workspace trigger */}
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Workspace</span>
        </button>
      </div>

      {/* Grid of Workspaces */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkspaces.map((ws, idx) => {
          return (
            <motion.div
              key={ws.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-white rounded-2xl border ${
                ws.status === 'Aktif' ? 'border-brand-border' : 'border-dashed border-red-200 bg-red-50/10'
              } overflow-hidden premium-card-shadow flex flex-col justify-between group`}
            >
              
              {/* Photo representation */}
              <div className="relative aspect-[16/10] overflow-hidden bg-brand-bg">
                <img 
                  src={ws.imageUrl} 
                  alt={ws.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                
                {/* Status Badges Overlaid */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold font-mono tracking-wide shadow-sm uppercase ${
                    ws.availability === 'Tersedia' ? 'bg-emerald-500 text-white' :
                    ws.availability === 'Penuh' ? 'bg-amber-500 text-white' :
                    'bg-zinc-600 text-white'
                  }`}>
                    {ws.availability}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border ${
                    ws.status === 'Aktif' 
                      ? 'bg-emerald-50 text-brand-success border-brand-success/30' 
                      : 'bg-red-50 text-brand-danger border-brand-danger/30'
                  }`}>
                    {ws.status}
                  </span>
                </div>
              </div>

              {/* Information */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] text-brand-muted font-mono uppercase tracking-wider font-semibold">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{ws.coffeeShopName}</span>
                  </div>
                  
                  <h4 className="text-sm font-bold font-display text-brand-text truncate leading-snug">
                    {ws.name}
                  </h4>

                  <div className="flex items-center gap-1 text-xs text-brand-muted">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{ws.location}</span>
                  </div>
                </div>

                {/* Meta details */}
                <div className="border-t border-brand-border/60 pt-4 mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-brand-text">
                    <Users className="w-4 h-4 text-brand-muted" />
                    <span className="font-semibold">{ws.capacity} Orang</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-brand-muted block font-mono">BIAYA SEWA</span>
                    <span className="font-bold text-brand-primary text-sm">{formatRupiah(ws.pricePerHour)}<span className="text-[10px] font-normal text-brand-muted">/jam</span></span>
                  </div>
                </div>
              </div>

              {/* Actions Footer row */}
              <div className="px-5 py-3.5 bg-brand-bg/40 border-t border-brand-border flex items-center justify-between">
                
                {/* Deactivate Toggle */}
                <button
                  onClick={() => handleToggleStatus(ws)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    ws.status === 'Aktif'
                      ? 'bg-white text-brand-danger border-brand-border hover:bg-red-50/50 hover:border-red-200'
                      : 'bg-emerald-500 text-white border-transparent hover:bg-emerald-600'
                  }`}
                  title={ws.status === 'Aktif' ? 'Deaktivasi Ruangan' : 'Aktifkan Ruangan'}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{ws.status === 'Aktif' ? 'Deaktivasi' : 'Aktifkan'}</span>
                </button>

                {/* Edit details */}
                <button
                  onClick={() => openEditModal(ws)}
                  className="px-3 py-1.5 bg-white hover:bg-brand-bg border border-brand-border hover:border-brand-accent rounded-lg text-xs font-semibold text-brand-text flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-brand-muted" />
                  <span>Ubah</span>
                </button>

              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Add & Edit Workspace Modal Dialog */}
      <AnimatePresence>
        {showAddEditModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-brand-border flex flex-col"
            >
              <div className="px-6 py-4 bg-brand-bg/60 border-b border-brand-border flex items-center justify-between">
                <span className="font-display font-bold text-sm text-brand-text">
                  {editingWorkspace ? 'Ubah Informasi Workspace' : 'Tambah Workspace Baru'}
                </span>
                <button
                  onClick={() => setShowAddEditModal(false)}
                  className="p-1 hover:bg-brand-border text-brand-muted hover:text-brand-text rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveWorkspace} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
                
                {/* Workspace Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text font-display">Nama Workspace</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Quiet Pod C, Meeting Room Sakura"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white text-brand-text"
                  />
                </div>

                {/* Partner Cafe name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text font-display">Nama Partner (Coffee Shop)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Filosofi Kopi - Melawai"
                    value={formCoffeeShop}
                    onChange={(e) => setFormCoffeeShop(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white text-brand-text"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text font-display">Lokasi Kota / Daerah</label>
                  <select
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white text-brand-text cursor-pointer"
                  >
                    <option value="Jakarta Selatan">Jakarta Selatan</option>
                    <option value="Jakarta Pusat">Jakarta Pusat</option>
                    <option value="Jakarta Utara">Jakarta Utara</option>
                    <option value="Jakarta Barat">Jakarta Barat</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Surabaya">Surabaya</option>
                  </select>
                </div>

                {/* Capacity & Price row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-text font-display">Kapasitas (pax)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={50}
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(Number(e.target.value))}
                      className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white text-brand-text"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-text font-display">Harga Sewa (per jam)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-semibold text-brand-muted">Rp</span>
                      <input
                        type="number"
                        required
                        min={1000}
                        step={5000}
                        value={formPrice}
                        onChange={(e) => setFormPrice(Number(e.target.value))}
                        className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 pl-8 pr-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white text-brand-text font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo URL */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-text font-display flex items-center justify-between">
                    <span>URL Foto Ruangan</span>
                    <ImageIcon className="w-3.5 h-3.5 text-brand-muted" />
                  </label>
                  <input
                    type="url"
                    placeholder="Masukkan URL Gambar Unsplash/Web"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none focus:border-brand-primary/40 focus:bg-white text-brand-text font-mono"
                  />
                </div>

                {/* Availability & Status row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-text font-display">Ketersediaan Saat Ini</label>
                    <select
                      value={formAvailability}
                      onChange={(e) => setFormAvailability(e.target.value as any)}
                      className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none text-brand-text cursor-pointer"
                    >
                      <option value="Tersedia">Tersedia</option>
                      <option value="Penuh">Penuh</option>
                      <option value="Tutup">Tutup</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-text font-display">Status Operasional</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full bg-brand-bg/50 border border-brand-border text-xs py-2 px-3 rounded-xl outline-none text-brand-text cursor-pointer"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>

                {/* Footer buttons inside Modal */}
                <div className="pt-4 border-t border-brand-border flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddEditModal(false)}
                    className="px-4 py-2.5 bg-white hover:bg-brand-bg border border-brand-border rounded-xl text-xs font-semibold text-brand-text transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Workspace</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
