import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn("size-9", className)} aria-hidden="true">
      <defs>
        <linearGradient id="abs-logo-g" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="oklch(0.55 0.19 254)" />
          <stop offset="1" stopColor="oklch(0.7 0.15 168)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="url(#abs-logo-g)" />
      <path
        d="M12 27.5 18.2 12h3.8l6.2 15.5h-4l-1.2-3.2h-6.3l-1.2 3.2h-3.5Zm5.9-6.3h4.2L20 15.7l-2.1 5.5Z"
        fill="white"
      />
      <circle cx="28.4" cy="13.4" r="2.6" fill="white" opacity="0.92" />
      <path d="M25.6 17.4c1.4-1.3 3.6-1.3 5 .1" stroke="white" strokeWidth="1.7" strokeLinecap="round" opacity="0.92" />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <span className="leading-none">
        <span className="block text-xl font-extrabold tracking-tight">
          abhi<span className="text-brand-green">share</span>
        </span>
        <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Travel together · Go further
        </span>
      </span>
    </span>
  );
}
