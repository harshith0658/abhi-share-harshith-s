import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  CreditCard,
  Gift,
  IndianRupee,
  Plus,
  Smartphone,
  TrendingUp,
  Wallet as WalletIcon,
  CircleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMockStore } from "@/lib/mock-store";
import { PLATFORM_FEE_RATE, WALLET_NEGATIVE_FLOOR, formatINR, type TxnType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Customer Wallet — AbhiShare" },
      {
        name: "description",
        content:
          "Your AbhiShare wallet: balance, add money via UPI or card, withdraw to your bank and review your full transaction history.",
      },
      { property: "og:title", content: "Customer Wallet — AbhiShare" },
      {
        property: "og:description",
        content: "Add money, withdraw and track every wallet transaction on AbhiShare.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WalletPage,
});

const TXN_META: Record<TxnType, { icon: typeof WalletIcon; credit: boolean; label: string }> = {
  topup: { icon: ArrowDownLeft, credit: true, label: "Top-up" },
  withdrawal: { icon: ArrowUpRight, credit: false, label: "Withdrawal" },
  booking: { icon: IndianRupee, credit: false, label: "Ride booking" },
  fee: { icon: IndianRupee, credit: false, label: "Platform fee" },
  refund: { icon: ArrowDownLeft, credit: true, label: "Refund" },
  referral: { icon: Gift, credit: true, label: "Referral reward" },
  earning: { icon: TrendingUp, credit: true, label: "Ride earning" },
};

function WalletPage() {
  const { walletBalance, walletTxns, addMoney, withdraw, bookings, canCreateRide } = useMockStore();
  const [addOpen, setAddOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const spent = walletTxns.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const added = walletTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Customer Wallet</h1>
      <p className="mt-1 text-muted-foreground">
        Pay for rides instantly from your AbhiShare wallet. Demo mode — no real money moves.
      </p>

      {!canCreateRide && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <p>
            <span className="font-bold">Balance below -₹100.</span> Ride creation is blocked until you
            add money and bring the balance back up.
          </p>
        </div>
      )}

      {/* Balance card */}
      <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-brand-green p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/80">
              <WalletIcon className="size-4" /> Available balance
            </p>
            <p className={cn("mt-2 text-4xl font-extrabold sm:text-5xl", walletBalance < 0 && "text-amber-200")}>
              {formatINR(walletBalance)}
            </p>
            {walletBalance < 0 && (
              <p className="mt-1 text-xs font-semibold text-white/90">
                Negative balance — you can go down to {formatINR(WALLET_NEGATIVE_FLOOR)}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="rounded-full bg-white text-primary hover:bg-white/90" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" /> Add Money
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => setWithdrawOpen(true)}
            >
              <Banknote className="size-4" /> Withdraw
            </Button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/25 pt-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Total added</p>
            <p className="mt-1 text-lg font-extrabold">{formatINR(added)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Total spent</p>
            <p className="mt-1 text-lg font-extrabold">{formatINR(spent)}</p>
          </div>
        </div>
      </div>

      {/* Quick stats + referral */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<BadgeCheck className="size-5 text-success" />}
          title="Bookings this session"
          value={String(bookings.length)}
          sub="Confirmed with QR verification"
        />
        <StatCard
          icon={<Smartphone className="size-5 text-primary" />}
          title="Default payment"
          value="UPI"
          sub={`Online bookings add a ${Math.round(PLATFORM_FEE_RATE * 100)}% platform fee`}
        />
        <StatCard
          icon={<Gift className="size-5 text-brand-green" />}
          title="Referral reward"
          value="₹50"
          sub="Earned when a referred friend completes a ride"
        />
      </div>

      {/* Transactions */}
      <section className="mt-8 pb-10">
        <h2 className="text-xl font-extrabold tracking-tight">Transaction history</h2>
        {walletTxns.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {[...walletTxns].reverse().map((t) => {
              const meta = TXN_META[t.type];
              return (
                <li key={t.id} className="flex items-center gap-3 p-4">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full",
                      t.amount >= 0 ? "bg-success/15" : "bg-destructive/10",
                    )}
                  >
                    <meta.icon className={cn("size-4", t.amount >= 0 ? "text-success" : "text-destructive")} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{t.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {meta.label}
                      {t.method ? ` · ${t.method}` : ""} ·{" "}
                      {new Date(t.date).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  <p className={cn("shrink-0 text-sm font-extrabold", t.amount >= 0 ? "text-success" : "text-destructive")}>
                    {t.amount >= 0 ? "+" : "−"}
                    {formatINR(Math.abs(t.amount)).replace("-", "")}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AddMoneyDialog open={addOpen} onOpenChange={setAddOpen} onPaid={addMoney} />
      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} balance={walletBalance} onWithdraw={withdraw} />
    </div>
  );
}

function StatCard({ icon, title, value, sub }: { icon: React.ReactNode; title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold text-muted-foreground">{title}</p>
      </div>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

const PRESETS = [100, 200, 500, 1000];

function AddMoneyDialog({
  open,
  onOpenChange,
  onPaid,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPaid: (amount: number, method: string) => void;
}) {
  const [amount, setAmount] = useState<string>("500");
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [paying, setPaying] = useState(false);

  const value = Number(amount);
  const valid = Number.isFinite(value) && value >= 10 && value <= 50000;

  const proceed = () => {
    if (!valid) {
      toast.error("Enter an amount between ₹10 and ₹50,000.");
      return;
    }
    setPaying(true);
    // Simulated gateway round-trip — no real payment is processed.
    setTimeout(() => {
      setPaying(false);
      onPaid(value, method === "upi" ? "UPI" : "Card");
      toast.success("Money added!", { description: `${formatINR(value)} added to your wallet via ${method === "upi" ? "UPI" : "card"}.` });
      onOpenChange(false);
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !paying && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add money to wallet</DialogTitle>
          <DialogDescription>Choose an amount and a payment method to simulate.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              min={10}
              max={50000}
              className="h-12 rounded-xl pl-9 text-lg font-bold"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p}
                variant={Number(amount) === p ? "default" : "secondary"}
                size="sm"
                className="rounded-full"
                onClick={() => setAmount(String(p))}
              >
                ₹{p}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "upi" as const, icon: Smartphone, label: "UPI", sub: "GPay · PhonePe · Paytm" },
              { key: "card" as const, icon: CreditCard, label: "Card", sub: "Credit or debit card" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={cn(
                  "cursor-pointer rounded-xl border p-3 text-left transition-colors",
                  method === m.key ? "border-primary bg-primary/5 ring-2 ring-primary/25" : "border-border hover:border-primary/50",
                )}
              >
                <m.icon className="size-5 text-primary" />
                <p className="mt-1 text-sm font-bold">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.sub}</p>
              </button>
            ))}
          </div>

          <Button className="w-full rounded-xl" disabled={paying} onClick={proceed}>
            {paying ? "Processing payment…" : `Proceed to Pay ${valid ? formatINR(value) : ""}`}
          </Button>
          <Progress value={paying ? 80 : 0} className="h-1" />
          <p className="text-center text-xs text-muted-foreground">
            Demo mode — powered by a simulated Razorpay checkout. No real money moves.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawDialog({
  open,
  onOpenChange,
  balance,
  onWithdraw,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  balance: number;
  onWithdraw: (amount: number) => { ok: boolean; error?: string };
}) {
  const [amount, setAmount] = useState<string>("");
  const value = Number(amount);
  const max = Math.max(balance, 0);

  const submit = () => {
    const result = onWithdraw(value);
    if (result.ok) {
      toast.success("Withdrawal requested", { description: `${formatINR(value)} will be transferred to your bank account.` });
      setAmount("");
      onOpenChange(false);
    } else {
      toast.error("Withdrawal failed", { description: result.error });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw to bank account</DialogTitle>
          <DialogDescription>
            Available for withdrawal: {formatINR(max)}. Negative balances can't be withdrawn.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              min={1}
              max={max}
              className="h-12 rounded-xl pl-9 text-lg font-bold"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <Button variant="secondary" size="sm" className="rounded-full" disabled={max <= 0} onClick={() => setAmount(String(max))}>
            Withdraw full amount
          </Button>
          <Button className="w-full rounded-xl" disabled={!Number.isFinite(value) || value <= 0} onClick={submit}>
            Request withdrawal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
