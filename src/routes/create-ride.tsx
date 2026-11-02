import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Car,
  CalendarDays,
  CircleAlert,
  Clock,
  IndianRupee,
  MapPin,
  PlusCircle,
  Star,
  Venus,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMockStore } from "@/lib/mock-store";
import {
  CITIES,
  CATEGORY_LABEL,
  formatDateLabel,
  formatTime12,
  todayISO,
  type Ride,
  type Vehicle,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/create-ride")({
  head: () => ({
    meta: [
      { title: "Create a Ride — AbhiShare" },
      {
        name: "description",
        content:
          "Publish your planned journey on AbhiShare: route, date, time, vehicle, available seats and passenger pricing. Fill your spare seats and share travel expenses.",
      },
      { property: "og:title", content: "Create a Ride — AbhiShare" },
      {
        property: "og:description",
        content: "Publish your planned journey and share your empty seats with travellers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreateRidePage,
});

interface Draft {
  from: string;
  to: string;
  date: string;
  time: string;
  vehicleId: string;
  seatsOffered: number;
  pricePerSeat: string;
  womenOnly: boolean;
  pickupPoint: string;
  dropPoint: string;
}

const EMPTY_DRAFT: Draft = {
  from: "",
  to: "",
  date: "",
  time: "",
  vehicleId: "",
  seatsOffered: 1,
  pricePerSeat: "",
  womenOnly: false,
  pickupPoint: "",
  dropPoint: "",
};

const STEPS = ["Route & schedule", "Vehicle & seats", "Price & preferences", "Review & publish"];

function CreateRidePage() {
  const { myVehicles, publishRide, cancelRide, rides, walletBalance, canCreateRide } = useMockStore();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [published, setPublished] = useState<Ride | null>(null);

  const vehicle = myVehicles.find((v) => v.id === draft.vehicleId) ?? null;

  const myRides = useMemo(() => rides.filter((r) => r.createdByUser), [rides]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      const { [key as string]: _drop, ...rest } = e;
      return rest;
    });
  };

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!draft.from.trim()) e.from = "Enter your starting location.";
      else if (!CITIES.some((c) => c.toLowerCase() === draft.from.trim().toLowerCase()))
        e.from = "Pick a city from the suggestions.";
      if (!draft.to.trim()) e.to = "Enter your destination.";
      else if (!CITIES.some((c) => c.toLowerCase() === draft.to.trim().toLowerCase()))
        e.to = "Pick a city from the suggestions.";
      else if (draft.to.trim().toLowerCase() === draft.from.trim().toLowerCase())
        e.to = "Destination must be different from the starting location.";
      if (!draft.date) e.date = "Select the travel date.";
      else if (draft.date < todayISO()) e.date = "Travel date cannot be in the past.";
      if (!draft.time) e.time = "Select the departure time.";
    }
    if (s === 1) {
      if (!vehicle) e.vehicleId = "Select the vehicle for this ride.";
      if (draft.seatsOffered < 1) e.seatsOffered = "Offer at least one seat.";
    }
    if (s === 2) {
      const price = Number(draft.pricePerSeat);
      if (!draft.pricePerSeat || Number.isNaN(price)) e.pricePerSeat = "Set your price per passenger.";
      else if (price < 20) e.pricePerSeat = "Price must be at least ₹20.";
      else if (price > 10000) e.pricePerSeat = "Price cannot exceed ₹10,000.";
      if (!draft.pickupPoint.trim()) e.pickupPoint = "Add a pickup point so passengers know where to meet you.";
      if (!draft.dropPoint.trim()) e.dropPoint = "Add a drop-off point.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const publish = () => {
    if (!vehicle) return;
    const result = publishRide({
      from: draft.from.trim(),
      to: draft.to.trim(),
      date: draft.date,
      time: draft.time,
      durationMins: estimateDuration(draft.from, draft.to),
      vehicleModel: vehicle.model,
      category: vehicle.category,
      pricePerSeat: Number(draft.pricePerSeat),
      seatsTotal: draft.seatsOffered,
      womenOnly: draft.womenOnly,
      pickupPoint: draft.pickupPoint.trim(),
      dropPoint: draft.dropPoint.trim(),
      instant: true,
    });
    if (result.ok) {
      toast.success("Ride published!", {
        description: `${result.ride.from} → ${result.ride.to} on ${formatDateLabel(result.ride.date)} is now discoverable.`,
      });
      setPublished(result.ride);
      setDraft(EMPTY_DRAFT);
      setStep(0);
    } else {
      toast.error("Could not publish ride", { description: result.error });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Create a Ride</h1>
          <p className="mt-1 text-muted-foreground">
            Already driving somewhere? Share your empty seats and split the travel cost.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
          <Wallet className="size-4 text-primary" />
          <span className="text-muted-foreground">Wallet</span>
          <span className={cn("font-extrabold", walletBalance < 0 ? "text-destructive" : "text-foreground")}>
            ₹{walletBalance.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {!canCreateRide && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <p>
            <span className="font-bold">Wallet balance below -₹100.</span> You can't publish rides
            until your balance is brought back up.{" "}
            <Link to="/wallet" className="font-semibold text-primary hover:underline">
              Add money to your wallet
            </Link>
          </p>
        </div>
      )}

      {/* Stepper */}
      <ol className="mt-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cn(
                "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-sm font-bold transition-colors disabled:cursor-default",
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <BadgeCheck className="size-4" /> : i + 1}
            </button>
            <span
              className={cn(
                "hidden text-xs font-semibold sm:block",
                i === step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <CityField label="Starting location" icon="from" value={draft.from} onChange={(v) => set("from", v)} error={errors.from} />
            <CityField label="Destination" icon="to" value={draft.to} onChange={(v) => set("to", v)} error={errors.to} />
            <div className="space-y-1.5">
              <LabelWithIcon icon={CalendarDays} label="Travel date" />
              <Input type="date" min={todayISO()} className="h-11 rounded-xl" value={draft.date} onChange={(e) => set("date", e.target.value)} />
              {errors.date && <FieldError msg={errors.date} />}
            </div>
            <div className="space-y-1.5">
              <LabelWithIcon icon={Clock} label="Departure time" />
              <Input type="time" className="h-11 rounded-xl" value={draft.time} onChange={(e) => set("time", e.target.value)} />
              {errors.time && <FieldError msg={errors.time} />}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <LabelWithIcon icon={Car} label="Select your vehicle" />
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {myVehicles.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      set("vehicleId", v.id);
                      set("seatsOffered", Math.min(draft.seatsOffered, v.capacity));
                    }}
                    className={cn(
                      "cursor-pointer rounded-xl border p-4 text-left transition-colors",
                      draft.vehicleId === v.id ? "border-primary bg-primary/5 ring-2 ring-primary/25" : "border-border hover:border-primary/50",
                    )}
                  >
                    <p className="font-bold">{v.model}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{v.plate}</p>
                    <p className="mt-2 text-xs font-semibold text-primary">{CATEGORY_LABEL[v.category]} · up to {v.capacity} seats</p>
                  </button>
                ))}
              </div>
              {errors.vehicleId && <FieldError msg={errors.vehicleId} />}
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <LabelWithIcon icon={Users} label="Seats you're offering" />
                <p className="text-xs text-muted-foreground">
                  {vehicle ? `Max ${vehicle.capacity} (driver seat excluded)` : "Select a vehicle first"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="size-9 rounded-full" disabled={draft.seatsOffered <= 1} onClick={() => set("seatsOffered", draft.seatsOffered - 1)} aria-label="Fewer seats">
                  −
                </Button>
                <span className="w-6 text-center text-lg font-extrabold">{draft.seatsOffered}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-full"
                  disabled={!vehicle || draft.seatsOffered >= vehicle.capacity}
                  onClick={() => set("seatsOffered", draft.seatsOffered + 1)}
                  aria-label="More seats"
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <LabelWithIcon icon={IndianRupee} label="Price per passenger (₹)" />
              <Input
                type="number"
                min={20}
                max={10000}
                className="h-11 rounded-xl"
                placeholder="e.g. 450"
                value={draft.pricePerSeat}
                onChange={(e) => set("pricePerSeat", e.target.value)}
              />
              {errors.pricePerSeat ? <FieldError msg={errors.pricePerSeat} /> : <p className="text-xs text-muted-foreground">A 4% platform fee is added for passengers paying online.</p>}
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
              <div>
                <p className="flex items-center gap-1.5 font-semibold">
                  <Venus className="size-4 text-pink-500" /> Women-only ride
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Only verified women passengers can book.</p>
              </div>
              <Switch checked={draft.womenOnly} onCheckedChange={(c) => set("womenOnly", c)} />
            </div>
            <div className="space-y-1.5">
              <LabelWithIcon icon={MapPin} label="Pickup point" />
              <Input className="h-11 rounded-xl" placeholder="e.g. Miyapur Metro Station" value={draft.pickupPoint} onChange={(e) => set("pickupPoint", e.target.value)} />
              {errors.pickupPoint && <FieldError msg={errors.pickupPoint} />}
            </div>
            <div className="space-y-1.5">
              <LabelWithIcon icon={MapPin} label="Drop-off point" />
              <Input className="h-11 rounded-xl" placeholder="e.g. Benz Circle" value={draft.dropPoint} onChange={(e) => set("dropPoint", e.target.value)} />
              {errors.dropPoint && <FieldError msg={errors.dropPoint} />}
            </div>
          </div>
        )}

        {step === 3 && vehicle && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-secondary/60 p-4">
              <p className="text-2xl font-extrabold">
                {draft.from} <ArrowRight className="inline size-5 text-primary" /> {draft.to}
              </p>
              <div className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <SummaryRow label="Date" value={formatDateLabel(draft.date)} />
                <SummaryRow label="Departure" value={formatTime12(draft.time)} />
                <SummaryRow label="Vehicle" value={`${vehicle.model} · ${vehicle.plate}`} />
                <SummaryRow label="Category" value={CATEGORY_LABEL[vehicle.category]} />
                <SummaryRow label="Seats offered" value={String(draft.seatsOffered)} />
                <SummaryRow label="Price per seat" value={`₹${Number(draft.pricePerSeat).toLocaleString("en-IN")}`} />
                <SummaryRow label="Pickup" value={draft.pickupPoint} />
                <SummaryRow label="Drop-off" value={draft.dropPoint} />
                <SummaryRow label="Women-only" value={draft.womenOnly ? "Yes" : "No"} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Once published, passengers can discover and book this ride. You'll verify each passenger
              by scanning their booking QR code at departure.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0} className="rounded-full">
            <ArrowLeft className="size-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} className="rounded-full">
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={publish} disabled={!canCreateRide} className="rounded-full">
              <PlusCircle className="size-4" /> Publish ride
            </Button>
          )}
        </div>
      </div>

      {/* My rides */}
      <section className="mt-10 pb-10">
        <h2 className="text-xl font-extrabold tracking-tight">My published rides</h2>
        {myRides.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <PlusCircle className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              You haven't published any rides yet. Complete the steps above to publish your first ride.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {myRides.map((ride) => (
              <div key={ride.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <p className="font-bold">
                    {ride.from} <ArrowRight className="inline size-4 text-primary" /> {ride.to}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatDateLabel(ride.date)} · {formatTime12(ride.time)} · {ride.vehicleModel} ·{" "}
                    {ride.seatsAvailable} seat{ride.seatsAvailable === 1 ? "" : "s"} available · ₹{ride.pricePerSeat}/seat
                    {ride.womenOnly && " · Women-only"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">Published</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      cancelRide(ride.id);
                      toast("Ride removed", { description: `${ride.from} → ${ride.to} is no longer listed.` });
                    }}
                  >
                    Cancel ride
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!published} onOpenChange={(open) => !open && setPublished(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/15">
              <BadgeCheck className="size-6 text-success" />
            </span>
            <DialogTitle className="text-center">Your ride is live!</DialogTitle>
            <DialogDescription className="text-center">
              Passengers searching {published?.from} → {published?.to} on{" "}
              {published && formatDateLabel(published.date)} will now see your ride.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 rounded-xl">
              <Link to="/create-ride" onClick={() => setPublished(null)}>
                Create another
              </Link>
            </Button>
            <Button asChild className="flex-1 rounded-xl">
              <Link to="/find-ride" search={{ from: published?.from ?? "", to: published?.to ?? "", date: published?.date ?? "" }} onClick={() => setPublished(null)}>
                View in Find Ride
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return <p className="text-xs font-semibold text-destructive">{msg}</p>;
}

function LabelWithIcon({ icon: Icon, label }: { icon: typeof Car; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-semibold">
      <Icon className="size-4 text-primary" /> {label}
    </span>
  );
}

function CityField({
  label,
  icon,
  value,
  onChange,
  error,
}: {
  label: string;
  icon: "from" | "to";
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <LabelWithIcon icon={MapPin} label={label} />
      <div className="relative">
        <span
          className={cn(
            "absolute left-3 top-1/2 size-2.5 -translate-y-1/2 rounded-full",
            icon === "from" ? "bg-primary" : "bg-brand-green",
          )}
        />
        <Input list="create-cities" className="h-11 rounded-xl pl-9" placeholder={icon === "from" ? "Leaving from" : "Going to"} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
      {error && <FieldError msg={error} />}
    </div>
  );
}

/** Rough intercity duration estimate for mock display (not a routing API). */
function estimateDuration(from: string, to: string): number {
  const base = (from.length + to.length) * 11;
  return Math.min(720, Math.max(60, Math.round(base / 5) * 5));
}

// Keep the vehicle type import referenced for external consumers.
export type { Vehicle };
