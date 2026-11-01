/**
 * AbhiShare mock data — frontend demo only.
 * All data is simulated in frontend state; no backend calls.
 */

export type VehicleCategory = "two-wheeler" | "five-seater" | "seven-seater";

export interface Vehicle {
  id: string;
  model: string;
  category: VehicleCategory;
  plate: string;
  /** Seats a creator can offer: driver seat not counted. */
  capacity: number;
}

export interface Ride {
  id: string;
  from: string;
  to: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  /** 24h time, HH:mm */
  time: string;
  durationMins: number;
  vehicleModel: string;
  category: VehicleCategory;
  pricePerSeat: number;
  seatsTotal: number;
  seatsAvailable: number;
  womenOnly: boolean;
  pickupPoint: string;
  dropPoint: string;
  creatorName: string;
  creatorRating: number;
  createdByUser?: boolean;
  instant: boolean;
}

export type PaymentMethod = "wallet" | "upi" | "cash";

export interface Booking {
  id: string;
  ref: string;
  rideId: string;
  rideFrom: string;
  rideTo: string;
  rideDate: string;
  rideTime: string;
  vehicleModel: string;
  category: VehicleCategory;
  creatorName: string;
  passengerName: string;
  seats: number;
  paymentMethod: PaymentMethod;
  seatFare: number;
  platformFee: number;
  totalPaid: number;
  status: "confirmed";
  createdAt: string;
}

export type TxnType =
  | "topup"
  | "withdrawal"
  | "booking"
  | "fee"
  | "refund"
  | "referral"
  | "earning";

export interface WalletTxn {
  id: string;
  type: TxnType;
  label: string;
  /** Signed amount in ₹ (positive = credit). */
  amount: number;
  method?: string;
  /** ISO datetime */
  date: string;
}

export interface MockUser {
  name: string;
  identifier: string;
}

export const CITIES = [
  "Hyderabad",
  "Vijayawada",
  "Visakhapatnam",
  "Bengaluru",
  "Chennai",
  "Guntur",
  "Warangal",
  "Tirupati",
  "Kakinada",
  "Rajahmundry",
  "Nellore",
  "Kurnool",
  "Pune",
  "Mumbai",
  "Delhi",
  "Coimbatore",
  "Kochi",
  "Nagpur",
] as const;

export const USER_VEHICLES: Vehicle[] = [
  { id: "veh-1", model: "Honda Activa 6G", category: "two-wheeler", plate: "AP 28 Q 4321", capacity: 1 },
  { id: "veh-2", model: "Maruti Swift VXi", category: "five-seater", plate: "TS 09 EF 8892", capacity: 4 },
  { id: "veh-3", model: "Toyota Innova Crysta", category: "seven-seater", plate: "AP 39 C 1108", capacity: 6 },
];

/** Platform commission on bookings (percentage). */
export const PLATFORM_FEE_RATE = 0.04;

/** Wallet may go negative only down to this floor; below it ride creation is blocked. */
export const WALLET_NEGATIVE_FLOOR = -100;

export const CATEGORY_LABEL: Record<VehicleCategory, string> = {
  "two-wheeler": "Two-seater",
  "five-seater": "Five-seater",
  "seven-seater": "Seven-seater",
};

/** ISO date (yyyy-mm-dd) offset by N days from today. */
export function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return dateOffset(0);
}

export function isoDaysFromToday(iso: string): number {
  const today = new Date(todayISO() + "T00:00:00Z").getTime();
  const target = new Date(iso + "T00:00:00Z").getTime();
  return Math.round((target - today) / 86400000);
}

/** Mock rides published by other users — seeded once when the store mounts. */
export function getInitialRides(): Ride[] {
  return [
    {
      id: "ride-1", from: "Hyderabad", to: "Vijayawada", date: dateOffset(0), time: "06:30",
      durationMins: 255, vehicleModel: "Maruti Swift VXi", category: "five-seater",
      pricePerSeat: 450, seatsTotal: 4, seatsAvailable: 2, womenOnly: false,
      pickupPoint: "Miyapur Metro Station", dropPoint: "Benz Circle",
      creatorName: "Ravi K.", creatorRating: 4.8, instant: true,
    },
    {
      id: "ride-2", from: "Vijayawada", to: "Hyderabad", date: dateOffset(0), time: "07:00",
      durationMins: 270, vehicleModel: "Toyota Innova Crysta", category: "seven-seater",
      pricePerSeat: 500, seatsTotal: 6, seatsAvailable: 4, womenOnly: true,
      pickupPoint: "PNBS Bus Stand", dropPoint: "Ameerpet",
      creatorName: "Sailaja M.", creatorRating: 4.9, instant: false,
    },
    {
      id: "ride-3", from: "Bengaluru", to: "Chennai", date: dateOffset(1), time: "09:15",
      durationMins: 345, vehicleModel: "Maruti Swift VXi", category: "five-seater",
      pricePerSeat: 700, seatsTotal: 4, seatsAvailable: 3, womenOnly: false,
      pickupPoint: "Indiranagar Metro", dropPoint: "T Nagar",
      creatorName: "Arjun T.", creatorRating: 4.7, instant: true,
    },
    {
      id: "ride-4", from: "Hyderabad", to: "Warangal", date: dateOffset(0), time: "17:30",
      durationMins: 90, vehicleModel: "Honda Activa 6G", category: "two-wheeler",
      pricePerSeat: 120, seatsTotal: 1, seatsAvailable: 1, womenOnly: false,
      pickupPoint: "Uppal Ring Road", dropPoint: "Hanamkonda Chowrasta",
      creatorName: "Nikhil P.", creatorRating: 4.6, instant: true,
    },
    {
      id: "ride-5", from: "Visakhapatnam", to: "Vijayawada", date: dateOffset(1), time: "08:00",
      durationMins: 300, vehicleModel: "Toyota Innova Crysta", category: "seven-seater",
      pricePerSeat: 550, seatsTotal: 6, seatsAvailable: 6, womenOnly: true,
      pickupPoint: "RK Beach Road", dropPoint: "Kanuru",
      creatorName: "Meera S.", creatorRating: 4.8, instant: false,
    },
    {
      id: "ride-6", from: "Hyderabad", to: "Bengaluru", date: dateOffset(2), time: "22:00",
      durationMins: 490, vehicleModel: "Maruti Swift VXi", category: "five-seater",
      pricePerSeat: 1200, seatsTotal: 4, seatsAvailable: 2, womenOnly: false,
      pickupPoint: "Gachibowli", dropPoint: "Whitefield",
      creatorName: "Kiran V.", creatorRating: 4.5, instant: true,
    },
    {
      id: "ride-7", from: "Chennai", to: "Bengaluru", date: dateOffset(1), time: "07:45",
      durationMins: 330, vehicleModel: "Maruti Swift VXi", category: "five-seater",
      pricePerSeat: 650, seatsTotal: 4, seatsAvailable: 4, womenOnly: false,
      pickupPoint: "Guindy", dropPoint: "Electronic City",
      creatorName: "Deepa R.", creatorRating: 4.9, instant: true,
    },
    {
      id: "ride-8", from: "Hyderabad", to: "Tirupati", date: dateOffset(2), time: "06:00",
      durationMins: 380, vehicleModel: "Toyota Innova Crysta", category: "seven-seater",
      pricePerSeat: 750, seatsTotal: 6, seatsAvailable: 3, womenOnly: false,
      pickupPoint: "LB Nagar", dropPoint: "Alipiri",
      creatorName: "Suresh B.", creatorRating: 4.7, instant: false,
    },
  ];
}

export function getInitialWalletTxns(): WalletTxn[] {
  const now = new Date();
  const iso = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };
  return [
    { id: "txn-1", type: "topup", label: "Wallet top-up", amount: 500, method: "UPI", date: iso(6) },
    { id: "txn-2", type: "booking", label: "Ride booking · Hyderabad → Vijayawada · 1 seat", amount: -468, method: "Wallet", date: iso(4) },
    { id: "txn-3", type: "referral", label: "Referral reward · friend completed a ride", amount: 50, date: iso(3) },
    { id: "txn-4", type: "topup", label: "Wallet top-up", amount: 168, method: "UPI", date: iso(1) },
  ];
}

export function formatINR(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function arrivalTime(hhmm: string, mins: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
