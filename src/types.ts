export type AdminRole = 'Super Admin' | 'Admin';

export interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  workspaceName: string;
  coffeeShopName: string;
  bookingDate: string;
  timeSlot: string;
  price: number;
  status: 'Menunggu' | 'Dikonfirmasi' | 'Checked In' | 'Dibatalkan';
  paymentMethod: string;
  paymentStatus: 'Lunas' | 'Belum Bayar';
  qrCodeData: string;
}

export interface Workspace {
  id: string;
  name: string;
  coffeeShopName: string;
  capacity: number;
  pricePerHour: number;
  imageUrl: string;
  availability: 'Tersedia' | 'Penuh' | 'Tutup';
  status: 'Aktif' | 'Nonaktif';
  location: string;
}

export interface PartnerRegistration {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessLicense: string;
  workspacePhotos: string[];
  proposalDetails: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  registeredDate: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'Aktif' | 'Nonaktif';
  lastLogin: string;
}

export interface RevenueDetail {
  id: string;
  partnerName: string;
  totalBookings: number;
  totalRevenue: number;
  coffeeShopShare: number; // 70%
  workWellShare: number;   // 30%
  netProfit: number;       // after external costs/taxes (optional, but requested overall)
  status: 'Lunas' | 'Menunggu Transfer';
}

// Seed data that represents the exact values in the requirements
export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'ADM-001',
    name: 'Budi Santoso',
    email: 'budi@workwell.co.id',
    role: 'Super Admin',
    status: 'Aktif',
    lastLogin: '2026-06-30 08:15'
  },
  {
    id: 'ADM-002',
    name: 'Siti Rahma',
    email: 'siti@workwell.co.id',
    role: 'Admin',
    status: 'Aktif',
    lastLogin: '2026-06-29 14:30'
  },
  {
    id: 'ADM-003',
    name: 'Dewo Prasetyo',
    email: 'dewo@workwell.co.id',
    role: 'Admin',
    status: 'Aktif',
    lastLogin: '2026-06-30 09:00'
  }
];

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'WS-001',
    name: 'Quiet Pod A',
    coffeeShopName: 'Kopi Kenangan Mantan - Menteng',
    capacity: 2,
    pricePerHour: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
    availability: 'Tersedia',
    status: 'Aktif',
    location: 'Jakarta Pusat'
  },
  {
    id: 'WS-002',
    name: 'Meeting Room Sakura',
    coffeeShopName: 'Anomali Coffee - Senopati',
    capacity: 8,
    pricePerHour: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600',
    availability: 'Tersedia',
    status: 'Aktif',
    location: 'Jakarta Selatan'
  },
  {
    id: 'WS-003',
    name: 'Lounge Desk 4',
    coffeeShopName: 'Tanamera Coffee - Kebayoran',
    capacity: 4,
    pricePerHour: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=600',
    availability: 'Penuh',
    status: 'Aktif',
    location: 'Jakarta Selatan'
  },
  {
    id: 'WS-004',
    name: 'Glass Room B',
    coffeeShopName: 'Djournal Coffee - Grand Indonesia',
    capacity: 6,
    pricePerHour: 90000,
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600',
    availability: 'Tersedia',
    status: 'Aktif',
    location: 'Jakarta Pusat'
  },
  {
    id: 'WS-005',
    name: 'Creative Corner Duo',
    coffeeShopName: 'Common Grounds - Sudirman',
    capacity: 2,
    pricePerHour: 40000,
    imageUrl: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&q=80&w=600',
    availability: 'Tersedia',
    status: 'Aktif',
    location: 'Jakarta Pusat'
  },
  {
    id: 'WS-006',
    name: 'Private Space 1',
    coffeeShopName: 'One Half Coffee - Gading',
    capacity: 1,
    pricePerHour: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&q=80&w=600',
    availability: 'Tutup',
    status: 'Nonaktif',
    location: 'Jakarta Utara'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'WW-8594',
    customerName: 'Aditya Wijaya',
    customerEmail: 'aditya.wijaya@gmail.com',
    customerPhone: '+62 812-3456-7890',
    workspaceName: 'Meeting Room Sakura',
    coffeeShopName: 'Anomali Coffee - Senopati',
    bookingDate: '2026-06-30',
    timeSlot: '09:00 - 12:00',
    price: 360000,
    status: 'Dikonfirmasi',
    paymentMethod: 'GoPay',
    paymentStatus: 'Lunas',
    qrCodeData: 'QR-WW-8594-ADITYA'
  },
  {
    id: 'WW-8593',
    customerName: 'Rina Kartika',
    customerEmail: 'rina.k@yahoo.com',
    customerPhone: '+62 821-9876-5432',
    workspaceName: 'Quiet Pod A',
    coffeeShopName: 'Kopi Kenangan Mantan - Menteng',
    bookingDate: '2026-06-30',
    timeSlot: '13:00 - 15:00',
    price: 70000,
    status: 'Checked In',
    paymentMethod: 'OVO',
    paymentStatus: 'Lunas',
    qrCodeData: 'QR-WW-8593-RINA'
  },
  {
    id: 'WW-8592',
    customerName: 'Fajar Nugraha',
    customerEmail: 'fajar.nugraha@outlook.com',
    customerPhone: '+62 857-1122-3344',
    workspaceName: 'Lounge Desk 4',
    coffeeShopName: 'Tanamera Coffee - Kebayoran',
    bookingDate: '2026-06-30',
    timeSlot: '10:00 - 14:00',
    price: 200000,
    status: 'Menunggu',
    paymentMethod: 'Bank Transfer (BCA)',
    paymentStatus: 'Belum Bayar',
    qrCodeData: 'QR-WW-8592-FAJAR'
  },
  {
    id: 'WW-8591',
    customerName: 'Lestari Wahyuni',
    customerEmail: 'lestari.w@gmail.com',
    customerPhone: '+62 813-4455-6677',
    workspaceName: 'Glass Room B',
    coffeeShopName: 'Djournal Coffee - Grand Indonesia',
    bookingDate: '2026-06-29',
    timeSlot: '15:00 - 18:00',
    price: 270000,
    status: 'Checked In',
    paymentMethod: 'ShopeePay',
    paymentStatus: 'Lunas',
    qrCodeData: 'QR-WW-8591-LESTARI'
  },
  {
    id: 'WW-8590',
    customerName: 'Bambang Hermawan',
    customerEmail: 'bambang.h@gmail.com',
    customerPhone: '+62 811-9988-7766',
    workspaceName: 'Creative Corner Duo',
    coffeeShopName: 'Common Grounds - Sudirman',
    bookingDate: '2026-06-29',
    timeSlot: '09:00 - 11:00',
    price: 80000,
    status: 'Dibatalkan',
    paymentMethod: 'Kartu Kredit',
    paymentStatus: 'Belum Bayar',
    qrCodeData: 'QR-WW-8590-BAMBANG'
  },
  {
    id: 'WW-8589',
    customerName: 'Clara Shinta',
    customerEmail: 'clara.s@techcorp.id',
    customerPhone: '+62 818-0909-8877',
    workspaceName: 'Meeting Room Sakura',
    coffeeShopName: 'Anomali Coffee - Senopati',
    bookingDate: '2026-06-28',
    timeSlot: '14:00 - 17:00',
    price: 360000,
    status: 'Checked In',
    paymentMethod: 'GoPay',
    paymentStatus: 'Lunas',
    qrCodeData: 'QR-WW-8589-CLARA'
  }
];

export const INITIAL_PARTNERS: PartnerRegistration[] = [
  {
    id: 'PRT-101',
    businessName: 'Filosofi Kopi - Melawai',
    ownerName: 'Rio Dewanto',
    email: 'info@filosofikopi.id',
    phone: '+62 812-1111-2222',
    businessLicense: 'NIB-8120309123891',
    workspacePhotos: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600'
    ],
    proposalDetails: 'Menyediakan 3 Quiet Pods dan 1 Meeting Room kapasitas 6 orang. Dilengkapi Wi-Fi 100 Mbps, gratis free-flow kopi saring bagi pengguna Work Well.',
    status: 'Menunggu',
    registeredDate: '2026-06-28'
  },
  {
    id: 'PRT-102',
    businessName: 'Giyanti Coffee Roastery',
    ownerName: 'Albert Susanto',
    email: 'albert@giyanticoffee.com',
    phone: '+62 813-8888-9999',
    businessLicense: 'NIB-7719203940121',
    workspacePhotos: [
      'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&q=80&w=600'
    ],
    proposalDetails: 'Menyediakan outdoor lounge workspaces dan private indoor glass rooms dengan suasana tenang dan asri di kawasan Menteng.',
    status: 'Menunggu',
    registeredDate: '2026-06-29'
  },
  {
    id: 'PRT-103',
    businessName: 'Kopi Toko Djawa - Braga',
    ownerName: 'Angga Kurniawan',
    email: 'braga@kopitokodjawa.com',
    phone: '+62 856-7777-6666',
    businessLicense: 'NIB-9920193847291',
    workspacePhotos: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600'
    ],
    proposalDetails: 'Membuka area lantai 2 khusus sebagai Coworking Space tenang berkapasitas 15 pax dengan fasilitas printer, high-speed internet, dan colokan listrik di setiap meja.',
    status: 'Disetujui',
    registeredDate: '2026-06-25'
  }
];

export const INITIAL_REVENUE_SHARING: RevenueDetail[] = [
  {
    id: 'REV-001',
    partnerName: 'Anomali Coffee - Senopati',
    totalBookings: 210,
    totalRevenue: 37800000,
    coffeeShopShare: 26460000,
    workWellShare: 11340000,
    netProfit: 7840000,
    status: 'Lunas'
  },
  {
    id: 'REV-002',
    partnerName: 'Kopi Kenangan Mantan - Menteng',
    totalBookings: 185,
    totalRevenue: 28350000,
    coffeeShopShare: 19845000,
    workWellShare: 8505000,
    netProfit: 5880000,
    status: 'Lunas'
  },
  {
    id: 'REV-003',
    partnerName: 'Djournal Coffee - Grand Indonesia',
    totalBookings: 145,
    totalRevenue: 24300000,
    coffeeShopShare: 17010000,
    workWellShare: 7290000,
    netProfit: 5040000,
    status: 'Lunas'
  },
  {
    id: 'REV-004',
    partnerName: 'Tanamera Coffee - Kebayoran',
    totalBookings: 120,
    totalRevenue: 22150000,
    coffeeShopShare: 15505000,
    workWellShare: 6645000,
    netProfit: 4600000,
    status: 'Menunggu Transfer'
  },
  {
    id: 'REV-005',
    partnerName: 'Common Grounds - Sudirman',
    totalBookings: 60,
    totalRevenue: 17000000,
    coffeeShopShare: 11900000,
    workWellShare: 5100000,
    netProfit: 3520000,
    status: 'Menunggu Transfer'
  }
];
