import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Link2, Menu, Search, Wallet, PlusCircle, Home, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { AuthDialog } from "@/components/auth-dialog";
import { useMockStore } from "@/lib/mock-store";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", to: "/", icon: Home },
  { label: "Find a Ride", to: "/find-ride", icon: Search },
  { label: "Create a Ride", to: "/create-ride", icon: PlusCircle },
  { label: "Wallet", to: "/wallet", icon: Wallet },
] as const;

export function SiteHeader() {
  const navigate = useNavigate();
  const { user, signOut, walletBalance } = useMockStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const go = (to: string) => {
    setMenuOpen(false);
    navigate({ to });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <button onClick={() => go("/")} className="flex cursor-pointer items-center" aria-label="AbhiShare home">
          <Logo />
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.slice(1).map((item) => (
            <button
              key={item.to}
              onClick={() => go(item.to)}
              className="cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => go("/wallet")}>
            <Wallet className="size-4" />
            ₹{walletBalance.toLocaleString("en-IN")}
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground">
                {user.name}
              </span>
              <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" className="rounded-full" onClick={() => setAuthOpen(true)}>
              Sign in
            </Button>
          )}
        </div>

        <button
          className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <Menu className="size-5" />
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
          {NAV.map((item) => (
            <button
              key={item.to}
              onClick={() => go(item.to)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold hover:bg-accent",
              )}
            >
              <item.icon className="size-4 text-primary" />
              {item.label}
              <ChevronRight className="ml-auto size-4 text-muted-foreground" />
            </button>
          ))}
          <div className="mt-2 flex items-center gap-2 px-3">
            {user ? (
              <>
                <span className="text-sm font-semibold">{user.name}</span>
                <Button variant="outline" size="sm" className="ml-auto rounded-full" onClick={() => { signOut(); setMenuOpen(false); }}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button size="sm" className="w-full rounded-full" onClick={() => { setMenuOpen(false); setAuthOpen(true); }}>
                <Link2 className="size-4" /> Sign in
              </Button>
            )}
          </div>
        </div>
      )}

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  );
}
