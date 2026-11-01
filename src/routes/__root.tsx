import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { MockStoreProvider } from "@/lib/mock-store";
import { SiteHeader } from "@/components/site-header";
import { Logo } from "@/components/logo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AbhiShare — Travel together. Go further." },
      {
        name: "description",
        content:
          "AbhiShare connects people travelling the same direction. Share rides on two-wheelers, cars and seven-seaters, split travel costs and make every journey count.",
      },
      { name: "author", content: "AbhiShare" },
      { property: "og:title", content: "AbhiShare — Share the ride. Split the cost." },
      {
        property: "og:description",
        content:
          "A safer, smarter and more affordable way to travel. Connect with verified people, share rides and split travel costs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Share more. Travel smarter. Save more — a peer-to-peer vehicle sharing platform for
            two-wheelers, cars and seven-seaters.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-semibold text-foreground/80" aria-label="Footer">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <Link to="/find-ride" className="hover:text-primary">
            Find a Ride
          </Link>
          <Link to="/create-ride" className="hover:text-primary">
            Create a Ride
          </Link>
          <Link to="/wallet" className="hover:text-primary">
            Wallet
          </Link>
        </nav>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AbhiShare · A product of Abhinav Tech Transforms (OPC) Pvt. Ltd. · Demo build with mock data
      </div>
    </footer>
  );
}

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <MockStoreProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <Toaster richColors position="top-center" />
      </MockStoreProvider>
    </QueryClientProvider>
  );
}
