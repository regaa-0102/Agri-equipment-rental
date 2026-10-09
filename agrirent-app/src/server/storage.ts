import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { catalog, CatalogItem } from "../lib/catalog";
import { SEED_NOTIFICATIONS, NotificationItem } from "../lib/notifications";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: "farmer" | "owner" | "admin";
  phone: string;
  location: string;
  avatar: string;
  status: "active" | "suspended";
  verificationStatus: "NOT_VERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  provider?: "local" | "google";
  googleId?: string;
  theme?: string;
  createdAt: string;
}

export interface StoredListing {
  id: string;
  ownerId: string;
  name: string;
  nameTa: string;
  category: string;
  brand?: string | undefined;
  model?: string | undefined;
  imageUrl?: string | undefined;
  description: string;
  location: string;
  lat?: number | undefined;
  lng?: number | undefined;
  pricePerDay: number;
  pricePerHour?: number | undefined;
  condition?: string | undefined;
  year?: string | undefined;
  minRentalDays?: number | undefined;
  deliveryAvailable?: boolean | undefined;
  deliveryCharge?: number | undefined;
  available: boolean;
  img: string;
  rating: number;
  reviews: number;
  availabilityType?: "rent" | "buy" | "both";
  purchasePrice?: number;
  vendorId?: string;
  vendorName?: string;
  hp?: number | string | undefined;
  fuelType?: string | undefined;
  securityDeposit: number;
  operatorIncluded: boolean;
  specs: { label: string; labelTa: string; value: string }[];
  createdAt: string;
  updatedAt?: string | undefined;
}

export interface StoredReview {
  id: string;
  equipmentId: string;
  userId: string;
  userName: string;
  bookingId: string;
  rating: number; // 1 to 5
  reviewText: string;
  createdAt: string;
}

export interface StoredVendor {
  id: string;
  name: string;
  dealerType: string;
  rating: number;
  reviewsCount: number;
  phone: string;
  email: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  brands: string[];
  inventory: {
    id: string;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
  }[];
}

export interface StoredBooking {
  id: string;
  listingId: string;
  equipmentName: string;
  equipmentImg?: string | undefined;
  farmerId: string;
  farmerName: string;
  ownerId: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: number;
  totalAmount: number;
  securityDeposit: number;
  escrowStatus: "held" | "released" | "refunded" | "disputed";
  status: "pending" | "approved" | "dispatched" | "delivered" | "active" | "completed" | "cancelled";
  createdAt: string;
}

export interface StoredNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  timestamp: string;
  relatedId?: string | undefined;
}

export interface StoredContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
  createdAt: string;
  status: "new" | "reviewed";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [algorithm, saltText, hashText] = storedHash.split("$");
  if (algorithm === "scrypt" && saltText && hashText) {
    const salt = Buffer.from(saltText, "base64");
    const expected = Buffer.from(hashText, "base64");
    const actual = scryptSync(password, salt, expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  // Upgrade hashes written by the previous SHA-256 implementation at the next successful login.
  if (/^[a-f\d]{64}$/i.test(storedHash)) {
    const expected = Buffer.from(storedHash, "hex");
    const actual = createHash("sha256").update(password).digest();
    return timingSafeEqual(actual, expected);
  }

  return false;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

// File-backed JSON persistent data store (.workspace/agrirent-store.json)
const STORE_PATH = path.resolve(process.cwd(), ".workspace", "agrirent-store.json");

// System administrator bootstrap configuration
// In production, configure ADMIN_EMAIL and ADMIN_PASSWORD via environment variables.
const BOOTSTRAP_ADMIN_EMAIL = process.env["ADMIN_EMAIL"]?.toLowerCase().trim();
const BOOTSTRAP_ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"];

export function createBootstrapAdmin(): StoredUser | null {
  if (!BOOTSTRAP_ADMIN_EMAIL && !BOOTSTRAP_ADMIN_PASSWORD) return null;
  if (!BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_PASSWORD) {
    throw new Error("Both ADMIN_EMAIL and ADMIN_PASSWORD must be configured to bootstrap an administrator.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(BOOTSTRAP_ADMIN_EMAIL) || BOOTSTRAP_ADMIN_PASSWORD.trim().length < 12) {
    throw new Error("ADMIN_EMAIL must be valid and ADMIN_PASSWORD must contain at least 12 non-whitespace characters.");
  }
  return {
    id: randomUUID(),
    name: "Administrator",
    email: BOOTSTRAP_ADMIN_EMAIL,
    passwordHash: hashPassword(BOOTSTRAP_ADMIN_PASSWORD),
    role: "admin",
    phone: "",
    location: "",
    avatar: "",
    status: "active",
    verificationStatus: "VERIFIED",
    provider: "local",
    createdAt: "2026-01-10T10:00:00.000Z",
  };
}

// Deprecated empty export for backward compatibility without any demo accounts
export const SEED_USERS: StoredUser[] = [];

export const SEED_VENDORS: StoredVendor[] = [
  {
    id: "vnd-1",
    name: "Sri Murugan Mahindra Tractors & Implements",
    dealerType: "Authorized Mahindra Dealer & Service Hub",
    rating: 4.8,
    reviewsCount: 142,
    phone: "+91 98421 88900",
    email: "murugan.dealers@agrirent.in",
    address: "142 Pollachi Main Road, Eachanari, Coimbatore, Tamil Nadu 641021",
    city: "Coimbatore",
    lat: 10.938,
    lng: 76.974,
    brands: ["Mahindra", "Shaktiman", "Texmo"],
    inventory: [
      { id: "eq-tractor-1", name: "Mahindra 575 DI Yuvo Tech+", price: 850000, category: "Tractor", inStock: true },
      { id: "eq-tractor-3", name: "Sonalika DI 745 III", price: 680000, category: "Tractor", inStock: true },
      { id: "eq-tillage-1", name: "Mahindra MB Plough", price: 75000, category: "Ploughing & Tilling", inStock: true },
      { id: "eq-seeding-1", name: "Mahindra Seed Drill", price: 62000, category: "Seeding", inStock: true },
      { id: "eq-pump-3", name: "Texmo 7.5HP Submersible Pump", price: 58000, category: "Water Pump", inStock: true },
    ],
  },
  {
    id: "vnd-2",
    name: "Cauvery Delta Agro Machinery & Implements Dealer",
    dealerType: "Certified Multi-Brand Farm Equipment Dealer",
    rating: 4.7,
    reviewsCount: 98,
    phone: "+91 94432 77123",
    email: "cauvery.machinery@agrirent.in",
    address: "88 Cauvery River Road, Near Old Bus Stand, Thanjavur, Tamil Nadu 613001",
    city: "Thanjavur",
    lat: 10.787,
    lng: 79.1378,
    brands: ["Preet", "Fieldking", "Kirloskar", "Landforce"],
    inventory: [
      { id: "eq-harvester-3", name: "Preet 987 Combine Harvester", price: 2100000, category: "Harvester", inStock: true },
      { id: "eq-tillage-3", name: "Fieldking Heavy Duty Disc Harrow", price: 88000, category: "Ploughing & Tilling", inStock: true },
      { id: "eq-seeding-3", name: "Landforce Zero Till Drill", price: 84000, category: "Seeding", inStock: true },
      { id: "eq-pump-1", name: "Kirloskar Diesel Water Pump", price: 42000, category: "Water Pump", inStock: true },
    ],
  },
  {
    id: "vnd-3",
    name: "Deere PowerTech Agricultural Center",
    dealerType: "Authorized John Deere Dealership",
    rating: 4.9,
    reviewsCount: 185,
    phone: "+91 98425 66789",
    email: "salem.deere@agrirent.in",
    address: "24 Bangalore National Highway, Omalur Bypass, Salem, Tamil Nadu 636005",
    city: "Salem",
    lat: 11.6643,
    lng: 78.146,
    brands: ["John Deere"],
    inventory: [
      { id: "eq-tractor-2", name: "John Deere 5310 PowerTech", price: 1120000, category: "Tractor", inStock: true },
    ],
  },
  {
    id: "vnd-4",
    name: "Kisan Harvester & Drone SuperStore",
    dealerType: "Claas, Kubota & DGCA Drone Authorized Partner",
    rating: 4.8,
    reviewsCount: 124,
    phone: "+91 98140 22345",
    email: "kisan.tech@agrirent.in",
    address: "56 Ring Road Junction, Mattuthavani, Madurai, Tamil Nadu 625020",
    city: "Madurai",
    lat: 9.9252,
    lng: 78.1198,
    brands: ["Claas", "Kubota", "DJI", "Garuda Aerospace"],
    inventory: [
      { id: "eq-harvester-1", name: "Claas Crop Tiger 30", price: 2450000, category: "Harvester", inStock: true },
      { id: "eq-harvester-2", name: "Kubota DC-68G Combine Harvester", price: 2200000, category: "Harvester", inStock: true },
      { id: "eq-drone-1", name: "DJI Agras T40 Agricultural Drone", price: 980000, category: "Sprayers & Drones", inStock: true },
      { id: "eq-drone-2", name: "Garuda Kisan Drone", price: 550000, category: "Sprayers & Drones", inStock: true },
    ],
  },
  {
    id: "vnd-5",
    name: "Kongu Agro Implements & Spares Hub",
    dealerType: "Agricultural Equipment & Machinery Dealer",
    rating: 4.6,
    reviewsCount: 82,
    phone: "+91 98423 44556",
    email: "kongu.agro@agrirent.in",
    address: "102 Karur Bypass Road, Tiruchirappalli, Tamil Nadu 620002",
    city: "Tiruchirappalli",
    lat: 10.7905,
    lng: 78.7047,
    brands: ["Shaktiman", "Aspee", "Crompton", "National"],
    inventory: [
      { id: "eq-tillage-2", name: "Shaktiman Rotary Tiller", price: 135000, category: "Ploughing & Tilling", inStock: true },
      { id: "eq-seeding-2", name: "National Pneumatic Planter", price: 195000, category: "Seeding", inStock: true },
      { id: "eq-drone-3", name: "Aspee Tractor Mounted Boom Sprayer", price: 145000, category: "Sprayers & Drones", inStock: true },
      { id: "eq-pump-2", name: "Crompton 5HP Solar Water Pump", price: 175000, category: "Water Pump", inStock: true },
    ],
  },
];

export const SEED_REVIEWS: StoredReview[] = [
  {
    id: "rev-101",
    equipmentId: "eq-tractor-1",
    userId: "usr-farmer-1",
    userName: "Muthukumar S.",
    bookingId: "BK-2712",
    rating: 5,
    reviewText: "Very good tractor for field work. Engine torque and fuel mileage during puddling was top notch. Owner was helpful and equipment was maintained well.",
    createdAt: "2026-07-23T14:30:00.000Z",
  },
  {
    id: "rev-102",
    equipmentId: "eq-tractor-1",
    userId: "usr-farmer-2",
    userName: "Rajesh Kumar Patil",
    bookingId: "BK-seed-t1",
    rating: 5,
    reviewText: "High precision hydraulics made rotavator operation effortless. On-time doorstep delivery by owner.",
    createdAt: "2026-08-10T09:15:00.000Z",
  },
  {
    id: "rev-103",
    equipmentId: "eq-tractor-1",
    userId: "usr-farmer-1",
    userName: "Muthukumar S.",
    bookingId: "BK-seed-t2",
    rating: 4,
    reviewText: "Good machine condition and operator was skilled. Minor delay in transport arrival but overall great experience.",
    createdAt: "2026-08-18T16:45:00.000Z",
  },
  {
    id: "rev-104",
    equipmentId: "eq-tractor-2",
    userId: "usr-farmer-2",
    userName: "Rajesh Kumar Patil",
    bookingId: "BK-8510",
    rating: 5,
    reviewText: "John Deere 5310 is unbeatable in heavy clay soils. Smooth dual-clutch transmission and zero breakdown.",
    createdAt: "2026-09-27T11:00:00.000Z",
  },
  {
    id: "rev-105",
    equipmentId: "eq-harvester-1",
    userId: "usr-farmer-1",
    userName: "Muthukumar S.",
    bookingId: "BK-8842",
    rating: 5,
    reviewText: "Rubber tracks worked wonders in wet paddy land without sinking. Grain loss was less than 1%. Highly recommended!",
    createdAt: "2026-08-19T17:20:00.000Z",
  },
  {
    id: "rev-106",
    equipmentId: "eq-tillage-2",
    userId: "usr-farmer-1",
    userName: "Muthukumar S.",
    bookingId: "BK-2756",
    rating: 5,
    reviewText: "Shaktiman rotavator pulverized black soil into fine tilth in a single pass. Boron steel blades are sharp and strong.",
    createdAt: "2026-08-31T10:10:00.000Z",
  },
  {
    id: "rev-107",
    equipmentId: "eq-drone-1",
    userId: "usr-farmer-2",
    userName: "Rajesh Kumar Patil",
    bookingId: "BK-seed-d1",
    rating: 5,
    reviewText: "Sprayed 10 acres of cotton crop in under an hour. Saved 90% water and prevented direct chemical contact. Amazing tech!",
    createdAt: "2026-09-12T15:30:00.000Z",
  },
];

const PURCHASE_PRICE_MAP: Record<string, { purchasePrice: number; vendorId: string; vendorName: string }> = {
  "eq-tractor-1": { purchasePrice: 850000, vendorId: "vnd-1", vendorName: "Sri Murugan Mahindra Tractors & Implements" },
  "eq-tractor-2": { purchasePrice: 1120000, vendorId: "vnd-3", vendorName: "Deere PowerTech Agricultural Center" },
  "eq-tractor-3": { purchasePrice: 680000, vendorId: "vnd-1", vendorName: "Sri Murugan Mahindra Tractors & Implements" },
  "eq-harvester-1": { purchasePrice: 2450000, vendorId: "vnd-4", vendorName: "Kisan Harvester & Drone SuperStore" },
  "eq-harvester-2": { purchasePrice: 2200000, vendorId: "vnd-4", vendorName: "Kisan Harvester & Drone SuperStore" },
  "eq-harvester-3": { purchasePrice: 2100000, vendorId: "vnd-2", vendorName: "Cauvery Delta Agro Machinery & Implements Dealer" },
  "eq-tillage-1": { purchasePrice: 75000, vendorId: "vnd-1", vendorName: "Sri Murugan Mahindra Tractors & Implements" },
  "eq-tillage-2": { purchasePrice: 135000, vendorId: "vnd-5", vendorName: "Kongu Agro Implements & Spares Hub" },
  "eq-tillage-3": { purchasePrice: 88000, vendorId: "vnd-2", vendorName: "Cauvery Delta Agro Machinery & Implements Dealer" },
  "eq-seeding-1": { purchasePrice: 62000, vendorId: "vnd-1", vendorName: "Sri Murugan Mahindra Tractors & Implements" },
  "eq-seeding-2": { purchasePrice: 195000, vendorId: "vnd-5", vendorName: "Kongu Agro Implements & Spares Hub" },
  "eq-seeding-3": { purchasePrice: 84000, vendorId: "vnd-2", vendorName: "Cauvery Delta Agro Machinery & Implements Dealer" },
  "eq-drone-1": { purchasePrice: 980000, vendorId: "vnd-4", vendorName: "Kisan Harvester & Drone SuperStore" },
  "eq-drone-2": { purchasePrice: 550000, vendorId: "vnd-4", vendorName: "Kisan Harvester & Drone SuperStore" },
  "eq-drone-3": { purchasePrice: 145000, vendorId: "vnd-5", vendorName: "Kongu Agro Implements & Spares Hub" },
  "eq-pump-1": { purchasePrice: 42000, vendorId: "vnd-2", vendorName: "Cauvery Delta Agro Machinery & Implements Dealer" },
  "eq-pump-2": { purchasePrice: 175000, vendorId: "vnd-5", vendorName: "Kongu Agro Implements & Spares Hub" },
  "eq-pump-3": { purchasePrice: 58000, vendorId: "vnd-1", vendorName: "Sri Murugan Mahindra Tractors & Implements" },
};

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface DataStore {
  users: StoredUser[];
  listings: StoredListing[];
  bookings: StoredBooking[];
  notifications: StoredNotification[];
  contactMessages?: StoredContactMessage[];
  reviews?: StoredReview[];
  vendors?: StoredVendor[];
}

let memoryStore: DataStore | null = null;

function initializeDataStore(): DataStore {
  const seedListings: StoredListing[] = catalog.map((item) => {
    const isOwner1 = item.location.includes("Coimbatore") || item.location.includes("Salem");
    const purchaseInfo = PURCHASE_PRICE_MAP[item.id] || {
      purchasePrice: item.dailyRate * 350,
      vendorId: "vnd-1",
      vendorName: "Sri Murugan Mahindra Tractors & Implements",
    };
    return {
      id: item.id,
      ownerId: item.ownerId || (isOwner1 ? "usr-owner-1" : "usr-owner-2"),
      name: item.name,
      nameTa: item.nameTa,
      category: item.category || item.cat,
      brand: item.brand,
      model: item.model,
      imageUrl: item.imageUrl || item.img,
      description: item.description || "",
      location: item.location,
      lat: item.lat,
      lng: item.lng,
      pricePerDay: item.dailyRate,
      available: item.avail,
      img: item.img,
      rating: item.rating,
      reviews: item.reviews,
      availabilityType: "both",
      purchasePrice: purchaseInfo.purchasePrice,
      vendorId: purchaseInfo.vendorId,
      vendorName: purchaseInfo.vendorName,
      hp: item.hp,
      fuelType: item.fuelType,
      securityDeposit: item.securityDeposit || 2000,
      operatorIncluded: Boolean(item.operatorIncluded),
      specs: item.specs || [],
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    };
  });

  const seedBookings: StoredBooking[] = [
    {
      id: "BK-9021",
      listingId: "eq-drone-1",
      equipmentName: "DJI Agras T40 Agricultural Drone",
      equipmentImg: "/equipment/sprayers-drones/dji-agras-t40.jpg",
      farmerId: "usr-farmer-1",
      farmerName: "Muthukumar S.",
      ownerId: "usr-owner-2",
      ownerName: "Balvinder Singh",
      startDate: "2026-09-21",
      endDate: "2026-09-24",
      days: 3,
      dailyRate: 2800,
      totalAmount: 8400,
      securityDeposit: 5000,
      escrowStatus: "held",
      status: "active",
      createdAt: "2026-09-20T10:00:00.000Z",
    },
    {
      id: "BK-8842",
      listingId: "eq-harvester-1",
      equipmentName: "Claas Crop Tiger 30",
      equipmentImg: "/equipment/harvesters/claas-crop-tiger-30.jpg",
      farmerId: "usr-farmer-1",
      farmerName: "Muthukumar S.",
      ownerId: "usr-owner-2",
      ownerName: "Balvinder Singh",
      startDate: "2026-08-15",
      endDate: "2026-08-18",
      days: 3,
      dailyRate: 4800,
      totalAmount: 14400,
      securityDeposit: 7500,
      escrowStatus: "released",
      status: "completed",
      createdAt: "2026-08-12T14:20:00.000Z",
    },
    {
      id: "BK-8510",
      listingId: "eq-tractor-2",
      equipmentName: "John Deere 5310",
      equipmentImg: "/equipment/tractors/john-deere-5310.jpg",
      farmerId: "usr-farmer-2",
      farmerName: "Rajesh Kumar Patil",
      ownerId: "usr-owner-1",
      ownerName: "Selvam Murugan",
      startDate: "2026-09-22",
      endDate: "2026-09-26",
      days: 4,
      dailyRate: 2200,
      totalAmount: 8800,
      securityDeposit: 3500,
      escrowStatus: "held",
      status: "active",
      createdAt: "2026-09-21T08:30:00.000Z",
    },
    {
      id: "BK-8104",
      listingId: "eq-tillage-1",
      equipmentName: "Mahindra MB Plough",
      equipmentImg: "/equipment/tillage/mahindra-mb-plough.jpg",
      farmerId: "usr-farmer-1",
      farmerName: "Muthukumar S.",
      ownerId: "usr-owner-1",
      ownerName: "Selvam Murugan",
      startDate: "2026-07-10",
      endDate: "2026-07-12",
      days: 2,
      dailyRate: 850,
      totalAmount: 1700,
      securityDeposit: 1500,
      escrowStatus: "released",
      status: "completed",
      createdAt: "2026-07-08T16:00:00.000Z",
    },
    {
      id: "BK-2712",
      listingId: "eq-tractor-1",
      equipmentName: "Mahindra 575 DI Yuvo Tech+",
      equipmentImg: "/equipment/tractors/mahindra-575-di-yuvo-tech-plus.jpg",
      farmerId: "usr-farmer-1",
      farmerName: "Muthukumar S.",
      ownerId: "usr-owner-1",
      ownerName: "Selvam Murugan",
      startDate: "2026-07-20",
      endDate: "2026-07-22",
      days: 2,
      dailyRate: 1800,
      totalAmount: 3600,
      securityDeposit: 3000,
      escrowStatus: "released",
      status: "completed",
      createdAt: "2026-07-18T10:00:00.000Z",
    },
    {
      id: "BK-2756",
      listingId: "eq-tillage-2",
      equipmentName: "Shaktiman Rotary Tiller",
      equipmentImg: "/equipment/tillage/shaktiman-rotary-tiller.jpg",
      farmerId: "usr-farmer-1",
      farmerName: "Muthukumar S.",
      ownerId: "usr-owner-1",
      ownerName: "Selvam Murugan",
      startDate: "2026-08-28",
      endDate: "2026-08-30",
      days: 2,
      dailyRate: 1100,
      totalAmount: 2200,
      securityDeposit: 2000,
      escrowStatus: "released",
      status: "completed",
      createdAt: "2026-08-26T12:00:00.000Z",
    },
  ];

  const seedNotifs: StoredNotification[] = SEED_NOTIFICATIONS.map((n) => ({
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    timestamp: n.timestamp,
    relatedId: n.relatedId,
  }));

  const bootstrapAdmin = createBootstrapAdmin();
  return {
    users: bootstrapAdmin ? [bootstrapAdmin] : [],
    listings: seedListings,
    bookings: seedBookings,
    notifications: seedNotifs,
    contactMessages: [],
    reviews: [...SEED_REVIEWS],
    vendors: [...SEED_VENDORS],
  };
}

function loadStore(): DataStore {
  if (memoryStore) return memoryStore;

  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(data) as DataStore;
      if (parsed.users && parsed.listings && parsed.bookings) {
        // Real accounts use random UUIDs; discard deterministic IDs left by old demo account seeds.
        parsed.users = parsed.users.filter((u) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(u.id)
        );
        const bootstrapAdmin = createBootstrapAdmin();
        if (bootstrapAdmin) {
          const configuredAdmin = parsed.users.find((u) => u.email.toLowerCase() === bootstrapAdmin.email);
          if (configuredAdmin) {
            configuredAdmin.role = "admin";
            configuredAdmin.status = "active";
            if (bootstrapAdmin.passwordHash) {
              configuredAdmin.passwordHash = bootstrapAdmin.passwordHash;
            }
          } else {
            parsed.users.push(bootstrapAdmin);
          }
        }

        // Ensure all 18 seed catalog items exist without overwriting owner-created listings
        const existingListingMap = new Map(parsed.listings.map((l) => [l.id, l]));
        const fresh = initializeDataStore();

        for (const seedListing of fresh.listings) {
          const current = existingListingMap.get(seedListing.id);
          if (!current) {
            parsed.listings.push(seedListing);
          } else {
            if (!current.img || !current.img.startsWith("/equipment/")) {
              current.img = seedListing.img;
              current.imageUrl = seedListing.imageUrl;
            }
            if (!current.availabilityType) {
              current.availabilityType = "both";
            }
            if (!current.purchasePrice && seedListing.purchasePrice) {
              current.purchasePrice = seedListing.purchasePrice;
              if (seedListing.vendorId !== undefined) current.vendorId = seedListing.vendorId;
              if (seedListing.vendorName !== undefined) current.vendorName = seedListing.vendorName;
            }
          }
        }

        // Ensure notifications table exists
        if (!parsed.notifications || parsed.notifications.length === 0) {
          parsed.notifications = SEED_NOTIFICATIONS.map((n) => ({
            id: n.id,
            userId: n.userId,
            title: n.title,
            message: n.message,
            type: n.type,
            read: n.read,
            timestamp: n.timestamp,
            relatedId: n.relatedId,
          }));
        }

        if (!parsed.contactMessages) {
          parsed.contactMessages = [];
        }

        if (!parsed.reviews || parsed.reviews.length === 0) {
          parsed.reviews = [...SEED_REVIEWS];
        }

        if (!parsed.vendors || parsed.vendors.length === 0) {
          parsed.vendors = [...SEED_VENDORS];
        }

        memoryStore = parsed;
        saveStore();
        return memoryStore;
      }
      throw new Error("Persistent store is missing required collections; refusing to overwrite existing data.");
    }
  } catch (err) {
    console.error("Could not read persistent store; leaving existing data untouched:", err);
    throw err;
  }

  memoryStore = initializeDataStore();
  saveStore();
  return memoryStore;
}

function saveStore(): void {
  if (!memoryStore) return;
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write persistent store:", err);
    throw err;
  }
}

// Storage Operations
export const storage = {
  getUsers(): StoredUser[] {
    return loadStore().users;
  },

  findUserByEmail(email: string): StoredUser | null {
    return loadStore().users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findUserByGoogleId(googleId: string): StoredUser | null {
    return loadStore().users.find((u) => u.provider === "google" && u.googleId === googleId) || null;
  },

  linkGoogleIdentity(userId: string, googleId: string): StoredUser | null {
    const store = loadStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user || (user.provider === "google" && user.googleId !== googleId)) return null;
    if (store.users.some((u) => u.id !== userId && u.provider === "google" && u.googleId === googleId)) {
      return null;
    }
    user.provider = "google";
    user.googleId = googleId;
    saveStore();
    return user;
  },

  findUserById(id: string): StoredUser | null {
    return loadStore().users.find((u) => u.id === id) || null;
  },

  createUser(user: Omit<StoredUser, "id" | "createdAt">): StoredUser {
    const store = loadStore();
    const newUser: StoredUser = {
      ...user,
      id: randomUUID(),
      verificationStatus: user.verificationStatus || "NOT_VERIFIED",
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    try {
      saveStore();
    } catch (error) {
      store.users.pop();
      throw error;
    }
    return newUser;
  },

  updateUserVerification(userId: string, status: StoredUser["verificationStatus"]): StoredUser | null {
    const store = loadStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user) return null;
    user.verificationStatus = status;
    saveStore();
    return user;
  },

  toggleUserStatus(userId: string): StoredUser | null {
    const store = loadStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user) return null;
    user.status = user.status === "active" ? "suspended" : "active";
    saveStore();
    return user;
  },

  getListings(filters?: { search?: string; category?: string; minPrice?: number; maxPrice?: number }): StoredListing[] {
    let items = loadStore().listings;
    if (!filters) return items;

    if (filters.category && filters.category !== "All") {
      items = items.filter((l) => l.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.nameTa.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }

    if (filters.minPrice !== undefined) {
      items = items.filter((l) => l.pricePerDay >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      items = items.filter((l) => l.pricePerDay <= filters.maxPrice!);
    }

    return items;
  },

  findListingById(id: string): StoredListing | null {
    return loadStore().listings.find((l) => l.id === id) || null;
  },

  createListing(listing: Omit<StoredListing, "id" | "createdAt">): StoredListing {
    const store = loadStore();
    const newListing: StoredListing = {
      ...listing,
      id: `eq-${randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
    };
    store.listings.unshift(newListing);
    saveStore();
    return newListing;
  },

  updateListing(id: string, updates: Partial<StoredListing>): StoredListing | null {
    const store = loadStore();
    const listing = store.listings.find((l) => l.id === id);
    if (!listing) return null;
    Object.assign(listing, updates, { updatedAt: new Date().toISOString() });
    saveStore();
    return listing;
  },

  hasActiveBookings(listingId: string): boolean {
    const store = loadStore();
    return store.bookings.some(
      (b) =>
        b.listingId === listingId &&
        (b.status === "active" || b.status === "approved" || b.status === "pending")
    );
  },

  deleteListing(id: string): { success: boolean; error?: string } {
    const store = loadStore();
    if (this.hasActiveBookings(id)) {
      return {
        success: false,
        error: "This equipment has an active booking and cannot be removed until the booking is completed.",
      };
    }
    const index = store.listings.findIndex((l) => l.id === id);
    if (index === -1) return { success: false, error: "Listing not found" };
    store.listings.splice(index, 1);
    saveStore();
    return { success: true };
  },

  getBookings(filter?: { farmerId?: string; ownerId?: string }): StoredBooking[] {
    let list = loadStore().bookings;
    if (filter?.farmerId) {
      list = list.filter((b) => b.farmerId === filter.farmerId);
    }
    if (filter?.ownerId) {
      list = list.filter((b) => b.ownerId === filter.ownerId);
    }
    return list;
  },

  findBookingById(id: string): StoredBooking | null {
    return loadStore().bookings.find((b) => b.id === id) || null;
  },

  createBooking(booking: Omit<StoredBooking, "id" | "createdAt">): StoredBooking {
    const store = loadStore();
    const newBooking: StoredBooking = {
      ...booking,
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };
    store.bookings.unshift(newBooking);
    saveStore();
    return newBooking;
  },

  updateBookingStatus(
    bookingId: string,
    status: StoredBooking["status"],
    escrowStatus?: StoredBooking["escrowStatus"]
  ): StoredBooking | null {
    const store = loadStore();
    const booking = store.bookings.find((b) => b.id === bookingId);
    if (!booking) return null;
    booking.status = status;
    if (escrowStatus) {
      booking.escrowStatus = escrowStatus;
    }
    saveStore();
    return booking;
  },

  extendBooking(bookingId: string, endDate: string): StoredBooking | null {
    const store = loadStore();
    const booking = store.bookings.find((item) => item.id === bookingId);
    if (!booking || booking.status !== "active") return null;

    const currentEnd = Date.parse(`${booking.endDate}T00:00:00Z`);
    const requestedEnd = Date.parse(`${endDate}T00:00:00Z`);
    if (!Number.isFinite(currentEnd) || !Number.isFinite(requestedEnd) || requestedEnd <= currentEnd) {
      return null;
    }

    const extraDays = (requestedEnd - currentEnd) / 86_400_000;
    booking.endDate = endDate;
    booking.days += extraDays;
    booking.totalAmount = booking.days * booking.dailyRate;
    saveStore();
    return booking;
  },

  // Notifications Operations
  getNotifications(userId?: string): StoredNotification[] {
    const store = loadStore();
    if (!userId) return store.notifications;
    return store.notifications.filter((n) => n.userId === userId || n.userId === "all");
  },

  createNotification(notif: Omit<StoredNotification, "id" | "timestamp">): StoredNotification {
    const store = loadStore();
    const newNotif: StoredNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    store.notifications.unshift(newNotif);
    saveStore();
    return newNotif;
  },

  markNotificationRead(id: string, userId: string, isAdmin: boolean): StoredNotification | null {
    const store = loadStore();
    const target = store.notifications.find((n) => n.id === id);
    if (!target || (!isAdmin && target.userId !== userId && target.userId !== "all")) return null;
    target.read = true;
    saveStore();
    return target;
  },

  markAllNotificationsRead(userId?: string): boolean {
    const store = loadStore();
    store.notifications.forEach((n) => {
      if (!userId || n.userId === userId || n.userId === "all") {
        n.read = true;
      }
    });
    saveStore();
    return true;
  },

  getMetrics() {
    const store = loadStore();
    const totalListings = store.listings.length;
    const totalBookings = store.bookings.length;
    const totalFarmers = store.users.filter((u) => u.role === "farmer").length;
    const totalOwners = store.users.filter((u) => u.role === "owner").length;
    const platformGmv = store.bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const platformRevenue = Math.round(platformGmv * 0.1); // 10% commission
    const escrowHeld = store.bookings
      .filter((b) => b.escrowStatus === "held")
      .reduce((sum, b) => sum + b.securityDeposit, 0);

    return {
      totalUsers: store.users.length,
      totalFarmers,
      totalOwners,
      totalListings,
      totalBookings,
      activeRentals: store.bookings.filter((b) => b.status === "active" || b.status === "delivered").length,
      platformGmv,
      platformRevenue,
      escrowHeld,
      disputes: store.bookings.filter((b) => b.escrowStatus === "disputed").length,
    };
  },

  findUserByPhone(phone: string): StoredUser | null {
    const clean = normalizePhone(phone);
    if (!clean) return null;
    return (
      loadStore().users.find((u) => {
        return normalizePhone(u.phone) === clean;
      }) || null
    );
  },

  updateUserPasswordHash(userId: string, passwordHash: string): void {
    const user = loadStore().users.find((u) => u.id === userId);
    if (!user) return;
    user.passwordHash = passwordHash;
    saveStore();
  },

  updateUserTheme(userId: string, theme: string): StoredUser | null {
    const store = loadStore();
    const user = store.users.find((u) => u.id === userId);
    if (!user) return null;
    user.theme = theme;
    saveStore();
    return user;
  },

  // Review Operations
  getReviews(equipmentId?: string): StoredReview[] {
    const store = loadStore();
    const list = store.reviews || [];
    if (!equipmentId) return list;
    return list.filter((r) => r.equipmentId === equipmentId);
  },

  getEquipmentRatingSummary(equipmentId: string) {
    const reviews = this.getReviews(equipmentId);
    const totalReviews = reviews.length;
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalReviews === 0) {
      const listing = this.findListingById(equipmentId);
      const fallbackRating = listing?.rating || 4.8;
      const fallbackReviews = listing?.reviews || 0;
      return {
        averageRating: fallbackRating,
        totalReviews: fallbackReviews,
        distribution: { 5: Math.round(fallbackReviews * 0.75), 4: Math.round(fallbackReviews * 0.18), 3: Math.round(fallbackReviews * 0.05), 2: Math.round(fallbackReviews * 0.01), 1: Math.round(fallbackReviews * 0.01) },
      };
    }

    let sum = 0;
    for (const r of reviews) {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
      sum += r.rating;
    }

    const averageRating = Number((sum / totalReviews).toFixed(1));
    return {
      averageRating,
      totalReviews,
      distribution: {
        5: distribution[5] || 0,
        4: distribution[4] || 0,
        3: distribution[3] || 0,
        2: distribution[2] || 0,
        1: distribution[1] || 0,
      },
    };
  },

  hasUserReviewedBooking(userId: string, bookingId: string): boolean {
    const store = loadStore();
    return (store.reviews || []).some((r) => r.userId === userId && r.bookingId === bookingId);
  },

  getReviewForBooking(bookingId: string): StoredReview | null {
    return (loadStore().reviews || []).find((review) => review.bookingId === bookingId) || null;
  },

  createReview(review: Omit<StoredReview, "id" | "createdAt">): { success: boolean; review?: StoredReview; error?: string } {
    const store = loadStore();
    if (!store.reviews) store.reviews = [];

    if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
      return { success: false, error: "Rating must be an integer from 1 to 5." };
    }

    // Verify booking
    const booking = store.bookings.find((b) => b.id === review.bookingId);
    if (!booking) {
      return { success: false, error: "Associated rental booking not found." };
    }
    if (booking.listingId !== review.equipmentId) {
      return { success: false, error: "The review equipment does not match the associated booking." };
    }
    if (booking.status !== "completed") {
      return { success: false, error: "Only completed rental bookings can be reviewed." };
    }
    if (booking.farmerId !== review.userId) {
      return { success: false, error: "You can only review rentals that you booked." };
    }
    if (this.getReviewForBooking(review.bookingId)) {
      return { success: false, error: "You have already submitted a review for this completed booking." };
    }

    const newReview: StoredReview = {
      ...review,
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };

    store.reviews.unshift(newReview);

    // Recalculate listing rating and reviews count
    const listing = store.listings.find((l) => l.id === review.equipmentId);
    if (listing) {
      const allForListing = store.reviews.filter((r) => r.equipmentId === review.equipmentId);
      const avg = Number((allForListing.reduce((acc, curr) => acc + curr.rating, 0) / allForListing.length).toFixed(1));
      listing.rating = avg;
      listing.reviews = allForListing.length;
    }

    saveStore();
    return { success: true, review: newReview };
  },

  // Vendor Operations
  getVendors(filter?: { city?: string; search?: string; lat?: number; lng?: number; sortBy?: 'distance' | 'rating' }): (StoredVendor & { distanceKm?: number })[] {
    const store = loadStore();
    let list = store.vendors ? [...store.vendors] : [...SEED_VENDORS];

    if (filter?.city && filter.city !== "All") {
      list = list.filter((v) => v.city.toLowerCase() === filter.city?.toLowerCase());
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.dealerType.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q) ||
          v.brands.some((b) => b.toLowerCase().includes(q))
      );
    }

    const hasClientLocation = Number.isFinite(filter?.lat) && Number.isFinite(filter?.lng);
    const listWithDistance: (StoredVendor & { distanceKm?: number })[] = hasClientLocation
      ? list.map((v) => ({
          ...v,
          distanceKm: calculateDistanceKm(filter!.lat!, filter!.lng!, v.lat, v.lng),
        }))
      : list;

    if (filter?.sortBy === "rating") {
      listWithDistance.sort((a, b) => b.rating - a.rating);
    } else if (hasClientLocation) {
      listWithDistance.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }

    return listWithDistance;
  },

  findVendorById(id: string): StoredVendor | null {
    const store = loadStore();
    const list = store.vendors || SEED_VENDORS;
    return list.find((v) => v.id === id) || null;
  },

  // Contact Messages Operations
  getContactMessages(): StoredContactMessage[] {
    const store = loadStore();
    return store.contactMessages || [];
  },

  createContactMessage(msg: Omit<StoredContactMessage, "id" | "createdAt" | "status">): StoredContactMessage {
    const store = loadStore();
    if (!store.contactMessages) store.contactMessages = [];
    const newMsg: StoredContactMessage = {
      ...msg,
      id: `contact-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      status: "new",
    };
    store.contactMessages.unshift(newMsg);
    saveStore();
    return newMsg;
  },
};
