/**
 * AbhiShare mock store — all state lives in React context (frontend only).
 * Actions simulate publishing rides, booking seats, and wallet movements.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  PLATFORM_FEE_RATE,
  WALLET_NEGATIVE_FLOOR,
  getInitialRides,
  getInitialWalletTxns,
  type Booking,
  type MockUser,
  type PaymentMethod,
  type Ride,
  type Vehicle,
  type WalletTxn,
} from "./mock-data";

export interface BookRideInput {
  rideId: string;
  seats: number;
  paymentMethod: PaymentMethod;
  passengerName: string;
}

export type BookRideResult =
  | { ok: true; booking: Booking }
  | { ok: false; error: string };

export type PublishRideResult =
  | { ok: true; ride: Ride }
  | { ok: false; error: string };

interface MockStore {
  rides: Ride[];
  myVehicles: Vehicle[];
  walletTxns: WalletTxn[];
  walletBalance: number;
  bookings: Booking[];
  user: MockUser | null;
  canCreateRide: boolean;
  publishRide: (input: Omit<Ride, "id" | "creatorName" | "creatorRating" | "seatsAvailable" | "createdByUser"> & { createdByUser?: boolean }) => PublishRideResult;
  cancelRide: (rideId: string) => void;
  bookRide: (input: BookRideInput) => BookRideResult;
  addMoney: (amount: number, method: string) => void;
  withdraw: (amount: number) => { ok: boolean; error?: string };
  signIn: (identifier: string) => MockUser;
  signOut: () => void;
}

const MockStoreContext = createContext<MockStore | null>(null);

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

/** Deterministic numeric hash for the mock ticket QR pattern. */
export function refHash(ref: string): number {
  let h = 7;
  for (let i = 0; i < ref.length; i++) {
    h = (h * 31 + ref.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function platformFeeFor(seatFare: number): number {
  return Math.round(seatFare * PLATFORM_FEE_RATE);
}

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [rides, setRides] = useState<Ride[]>(() => getInitialRides());
  const [walletTxns, setWalletTxns] = useState<WalletTxn[]>(() => getInitialWalletTxns());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<MockUser | null>(null);

  const myVehicles = useMemo(
    () => [
      { id: "veh-1", model: "Honda Activa 6G", category: "two-wheeler", plate: "AP 28 Q 4321", capacity: 1 },
      { id: "veh-2", model: "Maruti Swift VXi", category: "five-seater", plate: "TS 09 EF 8892", capacity: 4 },
      { id: "veh-3", model: "Toyota Innova Crysta", category: "seven-seater", plate: "AP 39 C 1108", capacity: 6 },
    ] as Vehicle[],
    [],
  );

  const walletBalance = useMemo(
    () => walletTxns.reduce((sum, t) => sum + t.amount, 0),
    [walletTxns],
  );

  const pushTxn = useCallback((txn: Omit<WalletTxn, "id" | "date">) => {
    setWalletTxns((prev) => [...prev, { ...txn, id: nextId("txn"), date: new Date().toISOString() }]);
  }, []);

  const canCreateRide = walletBalance >= WALLET_NEGATIVE_FLOOR;

  const publishRide: MockStore["publishRide"] = useCallback(
    (input) => {
      const balance = walletTxns.reduce((sum, t) => sum + t.amount, 0);
      if (balance < WALLET_NEGATIVE_FLOOR) {
        return {
          ok: false,
          error: `Your wallet balance is below -₹100. Add money to bring it up to -₹100 or more before publishing a ride.`,
        };
      }
      const ride: Ride = {
        ...input,
        id: nextId("ride"),
        creatorName: "You",
        creatorRating: 5.0,
        seatsAvailable: input.seatsTotal,
        createdByUser: true,
      };
      setRides((prev) => [ride, ...prev]);
      return { ok: true, ride };
    },
    [walletTxns],
  );

  const cancelRide = useCallback((rideId: string) => {
    setRides((prev) => prev.filter((r) => r.id !== rideId));
  }, []);

  const bookRide: MockStore["bookRide"] = useCallback(
    ({ rideId, seats, paymentMethod, passengerName }) => {
      const ride = rides.find((r) => r.id === rideId);
      if (!ride) return { ok: false, error: "Ride not found." };
      if (seats < 1) return { ok: false, error: "Select at least one seat." };
      if (seats > ride.seatsAvailable) {
        return {
          ok: false,
          error: `Only ${ride.seatsAvailable} seat${ride.seatsAvailable === 1 ? "" : "s"} left on this ride.`,
        };
      }

      const seatFare = ride.pricePerSeat * seats;
      const fee = platformFeeFor(seatFare);

      if (paymentMethod === "wallet" && walletBalance < seatFare + fee) {
        return { ok: false, error: `Insufficient wallet balance. You need ₹${seatFare + fee} for this booking.` };
      }

      const booking: Booking = {
        id: nextId("bk"),
        ref: `ABS-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(Math.random() * 36)}`,
        rideId,
        rideFrom: ride.from,
        rideTo: ride.to,
        rideDate: ride.date,
        rideTime: ride.time,
        vehicleModel: ride.vehicleModel,
        category: ride.category,
        creatorName: ride.creatorName,
        passengerName: passengerName || "Guest",
        seats,
        paymentMethod,
        seatFare,
        platformFee: fee,
        totalPaid: paymentMethod === "cash" ? seatFare : seatFare + fee,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

      // Overbooking cannot happen: seats are validated above and decremented atomically.
      setRides((prev) =>
        prev.map((r) =>
          r.id === rideId ? { ...r, seatsAvailable: Math.max(0, r.seatsAvailable - seats) } : r,
        ),
      );
      setBookings((prev) => [booking, ...prev]);

      if (paymentMethod === "wallet") {
        pushTxn({ type: "booking", label: `Ride booking · ${ride.from} → ${ride.to} · ${seats} seat${seats === 1 ? "" : "s"}`, amount: -(seatFare + fee), method: "Wallet" });
      } else if (paymentMethod === "cash") {
        // Cash: fare is settled with the creator; the platform fee is adjusted against the wallet.
        if (fee > 0) {
          pushTxn({ type: "fee", label: `Platform fee (4%) · cash booking · ${ride.from} → ${ride.to}`, amount: -fee, method: "Cash" });
        }
      }

      return { ok: true, booking };
    },
    [rides, walletBalance, pushTxn],
  );

  const addMoney = useCallback(
    (amount: number, method: string) => {
      pushTxn({ type: "topup", label: "Wallet top-up", amount, method });
    },
    [pushTxn],
  );

  const withdraw = useCallback(
    (amount: number) => {
      const balance = walletTxns.reduce((sum, t) => sum + t.amount, 0);
      if (amount <= 0) return { ok: false, error: "Enter a valid amount." };
      if (amount > Math.max(balance, 0)) {
        return { ok: false, error: "You can only withdraw your available positive balance." };
      }
      pushTxn({ type: "withdrawal", label: "Withdrawal to bank account", amount: -amount, method: "Bank" });
      return { ok: true };
    },
    [walletTxns, pushTxn],
  );

  const signIn = useCallback((identifier: string) => {
    const u: MockUser = { name: "Demo User", identifier };
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  const value: MockStore = {
    rides,
    myVehicles,
    walletTxns,
    walletBalance,
    bookings,
    user,
    canCreateRide,
    publishRide,
    cancelRide,
    bookRide,
    addMoney,
    withdraw,
    signIn,
    signOut,
  };

  return <MockStoreContext.Provider value={value}>{children}</MockStoreContext.Provider>;
}

export function useMockStore(): MockStore {
  const ctx = useContext(MockStoreContext);
  if (!ctx) throw new Error("useMockStore must be used inside <MockStoreProvider>");
  return ctx;
}
