import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import {
  ArrowRight,
  ArrowUpDown,
  BadgeCheck,
  CalendarDays,
  Car,
  Clock,
  IndianRupee,
  MapPin,
  Search,
  Star,
  Users,
  Venus,
  Wallet,
  Banknote,
  Smartphone,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthDialog } from "@/components/auth-dialog";
import { useMockStore, refHash } from "@/lib/mock-store";
import {
  CITIES,
  CATEGORY_LABEL,
  formatDuration,
  formatTime12,
  arrivalTime,
  formatDateLabel,
  todayISO,
  dateOffset,
  type Ride,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  from: fallback(z.string(), ""),
  to: fallback(z.string(), ""),
  date: fallback(z.string(), ""),
});

export const Route = createFileRoute("/find-ride")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Find a Ride — AbhiShare" },
      {
        name: "description",
        content:
          "Search rides along your route, compare prices, departure times and vehicles, then book seats on two-wheelers, five-seaters and seven-seaters.",
      },
      { property: "og:title", content: "Find a Ride — AbhiShare" },
      {
        property: "og:description",
        content: "Search rides along your route and book seats with verified travellers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FindRidePage,
});

type Filter = "all" | "cheapest" | "fastest" | "women-only" | "five-seater" | "seven-seater" | "two-wheeler";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All rides" },
  { key: "cheapest", label: "Cheapest" },
  { key: "fastest", label: "Fastest" },
  { key: "women-only", label: "Women-only" },
  { key: "five-seater", label: "Five-seater" },
  { key: "seven-seater", label: "Seven-seater" },
  { key: "two-wheeler", label: "Two-seater" },
];

function FindRidePage() {
  const { rides, walletBalance } = useMockStore();
  const initial = Route.useSearch();

  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [date, setDate] = useState(initial.date);
  const [applied, setApplied] = useState({ from: initial.from, to: initial.to, date: initial.date });
  const [filter, setFilter] = useState<Filter>("all");

  const [selected, setSelected] = useState<Ride | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useMockStore();

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const runSearch = () => {
    setApplied({ from, to, date });
  };

  const results = useMemo(() => {
    const norm = (s: string) => s.trim().toLowerCase();
    let list = rides.filter((r) => {
      if (applied.from && norm(r.from) !== norm(applied.from)) return false;
      if (applied.to && norm(r.to) !== norm(applied.to)) return false;
      if (applied.date && r.date !== applied.date) return false;
      return true;
    });
    switch (filter) {
      case "cheapest":
        list = [...list].sort((a, b) => a.pricePerSeat - b.pricePerSeat);
        break;
      case "fastest":
        list = [...list].sort((a, b) => a.durationMins - b.durationMins);
        break;
      case "women-only":
        list = list.filter((r) => r.womenOnly);
        break;
      case "five-seater":
        list = list.filter((r) => r.category === "five-seater");
        break;
      case "seven-seater":
        list = list.filter((r) => r.category === "seven-seater");
        break;
      case "two-wheeler":
        list = list.filter((r) => r.category === "two-wheeler");
        break;
      default:
        list = [...list].sort((a, b) => a.time.localeCompare(b.time));
    }
    return list;
  }, [rides, applied, filter]);

  const hasQuery = applied.from || applied.to || applied.date;
  const hasAnyFilter = filter !== "all";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Find a Ride</h1>
      <p className="mt-1 text-muted-foreground">
        Search rides going your way and book seats with verified travellers.
      </p>

      {/* Search panel */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="grid items-end gap-3 md:grid-cols-[1fr_auto_1fr_1fr_auto]">
          <div className="space-y-1.5">
            <label htmlFor="from" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              From
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
              <Input
                id="from"
                list="cities"
                className="h-11 rounded-xl pl-9"
                placeholder="Leaving from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="mb-0.5 size-11 shrink-0 rounded-xl max-md:mx-auto"
            onClick={swap}
            aria-label="Swap origin and destination"
          >
            <ArrowUpDown className="size-4" />
          </Button>
          <div className="space-y-1.5">
            <label htmlFor="to" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              To
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-green" />
              <Input
                id="to"
                list="cities"
                className="h-11 rounded-xl pl-9"
                placeholder="Going to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="date" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Travel date
            </label>
            <Input
              id="date"
              type="date"
              min={todayISO()}
              className="h-11 rounded-xl"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button size="lg" className="mb-0.5 h-11 rounded-xl px-6 max-md:w-full" onClick={runSearch}>
            <Search className="size-4" /> Search
          </Button>
        </div>
        <datalist id="cities">
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => {
              setDate(todayISO());
              setApplied((p) => ({ ...p, date: todayISO() }));
            }}
          >
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => {
              const t = dateOffset(1);
              setDate(t);
              setApplied((p) => ({ ...p, date: t }));
            }}
          >
            Tomorrow
          </Button>
          {(date || hasQuery) && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-muted-foreground"
              onClick={() => {
                setFrom("");
                setTo("");
                setDate("");
                setApplied({ from: "", to: "", date: "" });
              }}
            >
              <X className="size-3.5" /> Clear search
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/80 hover:border-primary/50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {results.length} ride{results.length === 1 ? "" : "s"} found
        {applied.from || applied.to ? " for " : ""}
        {applied.from}
        {applied.from && applied.to ? " → " : ""}
        {applied.to}
        {applied.date ? ` · ${formatDateLabel(applied.date)}` : ""}
      </p>

      {/* Results */}
      <div className="mt-4 space-y-4 pb-10">
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Search className="mx-auto size-8 text-muted-foreground/50" />
            <h3 className="mt-3 text-lg font-bold">No rides found</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {hasAnyFilter
                ? "Try removing a filter or searching a different date."
                : "No rides match this route yet. Try another route or date, or publish your own ride."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {hasAnyFilter && (
                <Button variant="outline" className="rounded-full" onClick={() => setFilter("all")}>
                  Clear filter
                </Button>
              )}
              <Button asChild className="rounded-full">
                <Link to="/create-ride">Create a Ride</Link>
              </Button>
            </div>
          </div>
        ) : (
          results.map((ride) => (
            <RideCard key={ride.id} ride={ride} onBook={() => setSelected(ride)} />
          ))
        )}
      </div>

      <BookingDialog ride={selected} onClose={() => setSelected(null)} onSignIn={() => setAuthOpen(true)} walletBalance={walletBalance} />

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

function RideCard({ ride, onBook }: { ride: Ride; onBook: () => void }) {
  const full = ride.seatsAvailable === 0;
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3 md:w-44">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">
            {ride.creatorName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold">{ride.creatorName}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3.5 fill-amber-400 text-amber-400" /> {ride.creatorRating.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-extrabold">
              {ride.from} <ArrowRight className="inline size-4 text-primary" /> {ride.to}
            </p>
            {ride.womenOnly && (
              <Badge className="gap-1 bg-pink-100 text-pink-700 hover:bg-pink-100">
                <Venus className="size-3" /> Women-only
              </Badge>
            )}
            {ride.instant && (
              <Badge variant="secondary" className="gap-1">
                <BadgeCheck className="size-3 text-success" /> Instant booking
              </Badge>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" /> {formatDateLabel(ride.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {formatTime12(ride.time)} · {formatDuration(ride.durationMins)} · arrives {formatTime12(arrivalTime(ride.time, ride.durationMins))}
            </span>
            <span className="flex items-center gap-1">
              <Car className="size-3.5" /> {ride.vehicleModel}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> {ride.seatsAvailable} seat{ride.seatsAvailable === 1 ? "" : "s"} left
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-center">
          <div className="text-right">
            <p className="text-xl font-extrabold text-primary">₹{ride.pricePerSeat.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground">per seat</p>
          </div>
          <Button className="rounded-full" disabled={full} onClick={onBook}>
            {full ? "Full" : "Book seats"}
          </Button>
        </div>
      </div>
    </article>
  );
}

function BookingDialog({
  ride,
  onClose,
  onSignIn,
  walletBalance,
}: {
  ride: Ride | null;
  onClose: () => void;
  onSignIn: () => void;
  walletBalance: number;
}) {
  const { user, bookRide } = useMockStore();
  const [seats, setSeats] = useState(1);
  const [method, setMethod] = useState<"wallet" | "upi" | "cash">("wallet");
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  const seatFare = ride ? ride.pricePerSeat * seats : 0;
  const fee = ride ? Math.round(seatFare * 0.04) : 0;
  const total = method === "cash" ? seatFare : seatFare + fee;

  const confirm = () => {
    if (!ride) return;
    if (!user) {
      onSignIn();
      return;
    }
    const result = bookRide({ rideId: ride.id, seats, paymentMethod: method, passengerName: user.name });
    if (result.ok) {
      toast.success("Seat booked!", { description: `Booking ${result.booking.ref} confirmed.` });
      setBookingRef(result.booking.ref);
    } else {
      toast.error("Booking failed", { description: result.error });
    }
  };

  const close = () => {
    setBookingRef(null);
    setSeats(1);
    setMethod("wallet");
    onClose();
  };

  const booking = bookingRef && ride ? { ref: bookingRef, ride, seats, method, seatFare, fee, total } : null;

  return (
    <Dialog open={!!ride} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {ride && !booking && (
          <>
            <DialogHeader>
              <DialogTitle>
                {ride.from} <ArrowRight className="inline size-4 text-primary" /> {ride.to}
              </DialogTitle>
              <DialogDescription>
                {formatDateLabel(ride.date)} · {formatTime12(ride.time)} · {ride.vehicleModel} (
                {CATEGORY_LABEL[ride.category]}) · {ride.seatsAvailable} seat{ride.seatsAvailable === 1 ? "" : "s"} left
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-bold">Number of seats</p>
                  <p className="text-xs text-muted-foreground">Maximum {ride.seatsAvailable} available</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-full"
                    disabled={seats <= 1}
                    onClick={() => setSeats((s) => Math.max(1, s - 1))}
                    aria-label="Remove a seat"
                  >
                    −
                  </Button>
                  <span className="w-6 text-center text-lg font-extrabold">{seats}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 rounded-full"
                    disabled={seats >= ride.seatsAvailable}
                    onClick={() => setSeats((s) => Math.min(ride.seatsAvailable, s + 1))}
                    aria-label="Add a seat"
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold">Payment method</p>
                {[
                  { key: "wallet" as const, icon: Wallet, title: "AbhiShare Wallet", sub: `Balance ₹${walletBalance.toLocaleString("en-IN")}`, disabled: walletBalance < ride.pricePerSeat + Math.round(ride.pricePerSeat * 0.04) },
                  { key: "upi" as const, icon: Smartphone, title: "UPI", sub: "GPay, PhonePe, Paytm & more" },
                  { key: "cash" as const, icon: Banknote, title: "Cash to ride creator", sub: "4% platform fee is adjusted against your wallet" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    disabled={opt.disabled}
                    onClick={() => setMethod(opt.key)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                      method === opt.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                    )}
                  >
                    <opt.icon className="size-5 text-primary" />
                    <span className="flex-1">
                      <span className="block text-sm font-bold">{opt.title}</span>
                      <span className="block text-xs text-muted-foreground">{opt.sub}</span>
                    </span>
                    <span
                      className={cn(
                        "size-4 rounded-full border-2",
                        method === opt.key ? "border-primary bg-primary" : "border-muted-foreground/40",
                      )}
                    />
                  </button>
                ))}
              </div>

              <div className="rounded-xl bg-secondary p-3 text-sm">
                <div className="flex justify-between py-0.5">
                  <span>
                    ₹{ride.pricePerSeat} × {seats} seat{seats === 1 ? "" : "s"}
                  </span>
                  <span className="font-semibold">₹{seatFare}</span>
                </div>
                {method !== "cash" && (
                  <div className="flex justify-between py-0.5">
                    <span>Platform fee (4%)</span>
                    <span className="font-semibold">₹{fee}</span>
                  </div>
                )}
                <div className="mt-1 flex justify-between border-t border-border pt-2 text-base">
                  <span className="font-bold">Total</span>
                  <span className="font-extrabold text-primary">₹{total}</span>
                </div>
              </div>

              {!user ? (
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-sm text-muted-foreground">Sign in to book this seat.</p>
                  <Button className="mt-2 w-full rounded-xl" onClick={onSignIn}>
                    Sign in to continue
                  </Button>
                </div>
              ) : (
                <Button className="w-full rounded-xl" onClick={confirm}>
                  Confirm booking · ₹{total}
                </Button>
              )}
            </div>
          </>
        )}

        {ride && booking && (
          <>
            <DialogHeader className="items-center text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/15">
                <BadgeCheck className="size-6 text-success" />
              </span>
              <DialogTitle className="text-center">Booking confirmed!</DialogTitle>
              <DialogDescription className="text-center">
                Show this ticket to the ride creator for QR verification at departure.
              </DialogDescription>
            </DialogHeader>
            <Ticket booking={booking} />
            <Button className="w-full rounded-xl" onClick={close}>
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export interface TicketData {
  ref: string;
  ride: Ride;
  seats: number;
  method: "wallet" | "upi" | "cash";
  seatFare: number;
  fee: number;
  total: number;
}

/** Mock verification QR: a deterministic dot pattern derived from the booking ref. */
function MockQr({ ref: bookingRef }: { ref: string }) {
  const size = 13;
  const h = refHash(bookingRef);
  const cells: boolean[][] = [];
  for (let y = 0; y < size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < size; x++) {
      const isFinder = (x < 3 && y < 3) || (x >= size - 3 && y < 3) || (x < 3 && y >= size - 3);
      if (isFinder) {
        const lx = x >= size - 3 ? x - (size - 3) : x;
        const ly = y >= size - 3 ? y - (size - 3) : y;
        row.push(lx === 1 || ly === 1 || (lx === 0 && ly === 0) || (lx === 2 && ly === 2) || (lx === 0 && ly === 2) || (lx === 2 && ly === 0));
      } else {
        row.push(((h >> ((y * size + x) % 31)) & 1) === 1);
      }
    }
    cells.push(row);
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-28 rounded-lg border border-border bg-white p-1" role="img" aria-label="Verification QR code">
      {cells.map((row, y) =>
        row.map((filled, x) =>
          filled ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" className="text-foreground" /> : null,
        ),
      )}
    </svg>
  );
}

function Ticket({ booking }: { booking: TicketData }) {
  const paymentLabel = { wallet: "Wallet", upi: "UPI", cash: "Cash to creator" }[booking.method];
  return (
    <div className="rounded-2xl border border-border bg-secondary/60 p-4 text-sm">
      <div className="flex items-center justify-between border-b border-dashed border-border pb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Booking reference</p>
          <p className="text-lg font-extrabold tracking-wider">{booking.ref}</p>
        </div>
        <MockQr ref={booking.ref} />
      </div>
      <dl className="mt-3 space-y-1.5">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Route</dt>
          <dd className="text-right font-semibold">
            {booking.ride.from} → {booking.ride.to}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Date & departure</dt>
          <dd className="text-right font-semibold">
            {formatDateLabel(booking.ride.date)} · {formatTime12(booking.ride.time)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Vehicle</dt>
          <dd className="text-right font-semibold">
            {booking.ride.vehicleModel} · {CATEGORY_LABEL[booking.ride.category]}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Ride creator</dt>
          <dd className="text-right font-semibold">
            {booking.ride.creatorName} <Star className="inline size-3 fill-amber-400 text-amber-400" /> {booking.ride.creatorRating.toFixed(1)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Passenger</dt>
          <dd className="text-right font-semibold">Demo User</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Seats</dt>
          <dd className="text-right font-semibold">{booking.seats}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Payment</dt>
          <dd className="text-right font-semibold">
            {paymentLabel} · ₹{booking.total} <span className="text-xs font-normal text-muted-foreground">(incl. ₹{booking.fee} fee)</span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="text-right font-bold text-success">Confirmed</dd>
        </div>
      </dl>
    </div>
  );
}
