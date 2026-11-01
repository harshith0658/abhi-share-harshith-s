import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Leaf,
  ShieldCheck,
  IndianRupee,
  Search,
  PlusCircle,
  Car,
  Armchair,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/logo";
import { AuthDialog } from "@/components/auth-dialog";
import heroImg from "@/assets/hero-coastal-drive.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AbhiShare — Share the ride. Split the cost." },
      {
        name: "description",
        content:
          "A safer, smarter and more affordable way to travel. Publish your journey, find seats on rides going your way and split travel costs with verified travellers.",
      },
      { property: "og:title", content: "AbhiShare — Share the ride. Split the cost." },
      {
        property: "og:description",
        content:
          "Connect with verified people travelling your way. Two-wheelers, five-seaters and seven-seaters. Share more, travel smarter, save more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const HERO_CHIPS = [
  { icon: BadgeCheck, label: "Verified\nUsers" },
  { icon: IndianRupee, label: "Lower\nTravel Cost" },
  { icon: Leaf, label: "Eco\nFriendly" },
  { icon: ShieldCheck, label: "Safer\nJourneys" },
] as const;

const POPULAR_ROUTES = [
  { from: "Hyderabad", to: "Vijayawada", price: 450 },
  { from: "Hyderabad", to: "Bengaluru", price: 1200 },
  { from: "Bengaluru", to: "Chennai", price: 700 },
  { from: "Visakhapatnam", to: "Vijayawada", price: 550 },
  { from: "Chennai", to: "Bengaluru", price: 650 },
  { from: "Hyderabad", to: "Tirupati", price: 750 },
];

function Index() {
  const [identifier, setIdentifier] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authError, setAuthError] = useState("");

  const heroContinue = () => {
    const v = identifier.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^[6-9]\d{9}$/.test(v.replace(/\s/g, ""));
    if (!ok) {
      setAuthError("Enter a valid 10-digit mobile number or email.");
      return;
    }
    setAuthError("");
    setAuthOpen(true);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Car driving along a scenic coastal highway"
          className="absolute inset-0 -z-10 size-full object-cover"
          width={1920}
          height={1200}
        />
        <div className="absolute inset-0 -z-10 hero-tint" />

        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-20 lg:pt-20">
          <div className="text-white">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
              Share the ride.
              <br />
              <span className="text-gradient-brand">Split the cost.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/90 sm:text-lg">
              A safer, smarter and more affordable way to travel. Connect with verified people,
              share rides and make every journey count.
            </p>

            <div className="mt-8 grid max-w-md grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-none">
              {HERO_CHIPS.map((chip) => (
                <div
                  key={chip.label}
                  className="rounded-2xl border border-white/25 bg-white/15 px-3 py-4 text-center backdrop-blur-sm"
                >
                  <chip.icon className="mx-auto size-6 text-white" />
                  <p className="mt-2 whitespace-pre-line text-xs font-bold leading-snug text-white">
                    {chip.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/find-ride">
                  <Search className="size-4" /> Find a Ride
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link to="/create-ride">
                  <PlusCircle className="size-4" /> Create a Ride
                </Link>
              </Button>
            </div>
          </div>

          {/* Sign-in card */}
          <div className="rounded-3xl bg-card p-6 shadow-2xl shadow-black/25 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <LogoMark className="size-10" />
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Welcome Back 👋</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Log in with your mobile number or email to continue your journey with AbhiShare.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <label htmlFor="hero-identifier" className="text-sm font-semibold">
                Mobile number or email
              </label>
              <Input
                id="hero-identifier"
                className="h-11 rounded-xl"
                placeholder="9876543210 or you@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && heroContinue()}
              />
              {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
              <Button className="h-11 w-full rounded-xl text-base" onClick={heroContinue}>
                Continue <ArrowRight className="size-4" />
              </Button>
              <div className="flex items-start gap-2 rounded-xl bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                We'll check if you already have an account. A 6-digit code is sent for new accounts.
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 divide-x divide-border border-t border-border pt-4 text-center">
              {[
                { icon: ShieldCheck, label: "Secure & Encrypted" },
                { icon: BadgeCheck, label: "Verified Community" },
                { icon: Leaf, label: "Sustainable Travel" },
              ].map((f) => (
                <div key={f.label} className="px-2">
                  <f.icon className="mx-auto size-4 text-primary" />
                  <p className="mt-1 text-[10px] font-semibold leading-tight text-muted-foreground">
                    {f.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              By continuing, you agree to our <span className="font-semibold text-primary">Terms of Service</span> and{" "}
              <span className="font-semibold text-primary">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">How AbhiShare works</h2>
          <p className="mt-2 text-muted-foreground">
            Empty seats are wasted money and wasted road space. Share them instead.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: PlusCircle,
              step: "1",
              title: "Publish your journey",
              text: "Already driving somewhere? List your route, date, time, vehicle and the seats you can offer. Set your price per passenger.",
            },
            {
              icon: Search,
              step: "2",
              title: "Find & book a seat",
              text: "Search rides along your route, compare prices, departure times and vehicles, then book the seats you need.",
            },
            {
              icon: Wallet,
              step: "3",
              title: "Share the cost",
              text: "Pay with your AbhiShare wallet or UPI. Travel together, split the expenses and save on every journey.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                  <card.icon className="size-5 text-primary" />
                </span>
                <span className="text-4xl font-extrabold text-muted-foreground/30">{card.step}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vehicle categories */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">Every kind of journey</h2>
            <p className="mt-2 text-muted-foreground">
              From quick city hops to long intercity rides — share seats on all three vehicle types.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icon: Search, title: "Two-Wheeler Sharing", text: "Two-seater vehicles for individual passengers. An affordable alternative for short, suitable journeys." },
              { icon: Car, title: "Five-Seater Vehicles", text: "Standard cars with multiple bookable seats. Perfect for city-to-city and longer journeys." },
              { icon: Armchair, title: "Seven-Seater Vehicles", text: "Larger vehicles for families and groups, with more flexibility for shared transportation." },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-background p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-green/15">
                  <v.icon className="size-5 text-brand-green" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular routes */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Popular routes</h2>
            <p className="mt-2 text-muted-foreground">Travellers are sharing seats on these routes right now.</p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/find-ride">
              View all rides <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_ROUTES.map((r) => (
            <Link
              key={`${r.from}-${r.to}`}
              to="/find-ride"
              search={{ from: r.from, to: r.to, date: "" }}
              className="group rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold">{r.from}</span>
                <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                <span className="font-bold">{r.to}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">from ₹{r.price.toLocaleString("en-IN")} per seat</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-brand-green p-8 text-white sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">Own a vehicle? Don't drive with empty seats.</h2>
              <p className="mt-2 max-w-xl text-white/90">
                Publish your planned trips, fill your spare seats and recover part of your fuel and
                travel expenses.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0 rounded-full bg-white text-primary hover:bg-white/90">
              <Link to="/create-ride">
                Create a Ride <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} initialIdentifier={identifier} initialStep="otp" />
    </div>
  );
}
