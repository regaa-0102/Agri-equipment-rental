import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { catalog, CatalogItem } from "../lib/catalog";
import { SEED_NOTIFICATIONS, NotificationItem } from "../lib/notifications";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "farmer" | "owner" | "admin";
  phone: string;
  location: string;
  avatar: string;
  status: "active" | "suspended";
  verificationStatus: "NOT_VERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  provider?: "local" | "google";
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
  available: boolean;
  img: string;
  rating: number;
  reviews: number;
  hp?: number | string | undefined;
  fuelType?: string | undefined;
  securityDeposit: number;
  operatorIncluded: boolean;
  specs: { label: string; labelTa: string; value: string }[];
  createdAt: string;
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

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

const STORE_PATH = path.resolve(process.cwd(), ".workspace", "agrirent-store.json");

// 5 Mandatory Verified Users
export const SEED_USERS: StoredUser[] = [
  {
    id: "usr-admin-1",
    name: "Dr. Ramesh V. (Admin)",
    email: "admin@agrirent.in",
    passwordHash: hashPassword("Admin@123"),
    role: "admin",
    phone: "+91 98401 23456",
    location: "Chennai / Pan-India HQ",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    status: "active",
    verificationStatus: "VERIFIED",
    provider: "local",
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "usr-farmer-1",
    name: "Muthukumar S.",
    email: "muthu.farmer@gmail.com",
    passwordHash: hashPassword("Farmer@123"),
    role: "farmer",
    phone: "+91 94432 10987",
    location: "Thanjavur, Tamil Nadu (Cauvery Delta)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "active",
    verificationStatus: "VERIFIED",
    provider: "local",
    createdAt: "2026-02-14T09:30:00.000Z",
  },
  {
    id: "usr-farmer-2",
    name: "Rajesh Kumar Patil",
    email: "rajesh.kumar@gmail.com",
    passwordHash: hashPassword("Farmer@123"),
    role: "farmer",
    phone: "+91 97654 32109",
    location: "Pune, Maharashtra",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    status: "active",
    verificationStatus: "NOT_VERIFIED",
    provider: "local",
    createdAt: "2026-03-01T11:15:00.000Z",
  },
  {
    id: "usr-owner-1",
    name: "Selvam Murugan (Selvam Agro Fleet)",
    email: "selvam.agro@gmail.com",
    passwordHash: hashPassword("Owner@123"),
    role: "owner",
    phone: "+91 98421 54321",
    location: "Coimbatore & Pollachi, Tamil Nadu",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    status: "active",
    verificationStatus: "VERIFIED",
    provider: "local",
    createdAt: "2026-01-20T08:00:00.000Z",
  },
  {
    id: "usr-owner-2",
    name: "Balvinder Singh (Kisan Drone & Harvester Services)",
    email: "balvinder.harvesters@gmail.com",
    passwordHash: hashPassword("Owner@123"),
    role: "owner",
    phone: "+91 98140 87654",
    location: "Ludhiana, Punjab & Madurai, Tamil Nadu",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    status: "active",
    verificationStatus: "VERIFIED",
    provider: "local",
    createdAt: "2026-01-25T14:45:00.000Z",
  },
];

interface DataStore {
  users: StoredUser[];
  listings: StoredListing[];
  bookings: StoredBooking[];
  notifications: StoredNotification[];
}

let memoryStore: DataStore | null = null;

function initializeDataStore(): DataStore {
  const seedListings: StoredListing[] = catalog.map((item) => {
    const isOwner1 = item.location.includes("Coimbatore") || item.location.includes("Salem");
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
      equipmentName: "DJI Agras T40 Agricultural Spraying Drone (40L)",
      equipmentImg: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=900&h=600&q=85",
      farmerId: "usr-farmer-1",
      farmerName: "Muthukumar S.",
      ownerId: "usr-owner-1",
      ownerName: "Selvam Murugan",
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
      equipmentName: "Preet 987 Self-Propelled Multi-Crop Combine Harvester",
      equipmentImg: "https://images.unsplash.com/photo-1635174815612-fd9636f70146?auto=format&fit=crop&w=900&h=600&q=85",
      farmerId: "usr-farmer-1",
      farmerName: "Muthukumar S.",
      ownerId: "usr-owner-2",
      ownerName: "Balvinder Singh",
      startDate: "2026-08-15",
      endDate: "2026-08-18",
      days: 3,
      dailyRate: 5200,
      totalAmount: 15600,
      securityDeposit: 8000,
      escrowStatus: "released",
      status: "completed",
      createdAt: "2026-08-12T14:20:00.000Z",
    },
    {
      id: "BK-8510",
      listingId: "eq-tractor-1",
      equipmentName: "John Deere 5310 4WD (55 HP) Tractor",
      equipmentImg: "https://images.unsplash.com/photo-1533062618053-d51e617307ec?auto=format&fit=crop&w=900&h=600&q=85",
      farmerId: "usr-farmer-2",
      farmerName: "Rajesh Kumar Patil",
      ownerId: "usr-owner-1",
      ownerName: "Selvam Murugan",
      startDate: "2026-09-22",
      endDate: "2026-09-26",
      days: 4,
      dailyRate: 1800,
      totalAmount: 7200,
      securityDeposit: 3000,
      escrowStatus: "held",
      status: "active",
      createdAt: "2026-09-21T08:30:00.000Z",
    },
    {
      id: "BK-8104",
      listingId: "eq-leveler-1",
      equipmentName: "Fieldking Dual-Mast Precision Laser Land Leveler",
      equipmentImg: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&h=600&q=85",
      farmerId: "usr-farmer-1",
      farmerName: "Muthukumar S.",
      ownerId: "usr-owner-2",
      ownerName: "Balvinder Singh",
      startDate: "2026-07-10",
      endDate: "2026-07-12",
      days: 2,
      dailyRate: 2400,
      totalAmount: 4800,
      securityDeposit: 4000,
      escrowStatus: "released",
      status: "completed",
      createdAt: "2026-07-08T16:00:00.000Z",
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

  return {
    users: [...SEED_USERS],
    listings: seedListings,
    bookings: seedBookings,
    notifications: seedNotifs,
  };
}

function loadStore(): DataStore {
  if (memoryStore) return memoryStore;

  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(data) as DataStore;
      if (parsed.users && parsed.listings && parsed.bookings) {
        // Ensure all seed users exist
        for (const seedUser of SEED_USERS) {
          const existing = parsed.users.find((u) => u.email === seedUser.email);
          if (!existing) {
            parsed.users.push(seedUser);
          } else {
            // Keep verificationStatus up to date
            existing.verificationStatus = existing.verificationStatus || seedUser.verificationStatus;
          }
        }

        // If listings have pollinations image or missing images, refresh from catalog
        const hasOutdatedImages = parsed.listings.some((l) => !l.img || l.img.includes("pollinations.ai"));
        if (hasOutdatedImages || parsed.listings.length < catalog.length) {
          const fresh = initializeDataStore();
          parsed.listings = fresh.listings;
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

        memoryStore = parsed;
        saveStore();
        return memoryStore;
      }
    }
  } catch (err) {
    console.warn("Could not read persistent store, initializing fresh store:", err);
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
    saveStore();
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

  deleteListing(id: string): boolean {
    const store = loadStore();
    const index = store.listings.findIndex((l) => l.id === id);
    if (index === -1) return false;
    store.listings.splice(index, 1);
    saveStore();
    return true;
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

  markNotificationRead(id: string): StoredNotification | null {
    const store = loadStore();
    const target = store.notifications.find((n) => n.id === id);
    if (!target) return null;
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
};
