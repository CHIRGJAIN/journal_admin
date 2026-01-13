import Link from "next/link";

import { cn } from "@/lib/utils";

type TrinixLogoProps = {
  href?: string;
  title?: string;
  subtitle?: string;
  size?: "sm" | "md";
  showText?: boolean;
  className?: string;
};

const sizeStyles = {
  sm: {
    mark: "h-10 w-10 text-sm",
    title: "text-base",
    subtitle: "text-[0.65rem]",
    letters: "text-sm",
  },
  md: {
    mark: "h-11 w-11 text-base",
    title: "text-lg",
    subtitle: "text-xs",
    letters: "text-base",
  },
};

export default function TrinixLogo({
  href = "/",
  title = "Trinix Journal",
  subtitle,
  size = "md",
  showText = true,
  className,
}: TrinixLogoProps) {
  const styles = sizeStyles[size];

  return (
    <Link
      href={href}
      aria-label={title}
      className={cn("group flex items-center gap-3", className)}
    >
      <div
        className={cn(
          "logo-3d relative flex items-center justify-center rounded-2xl border border-saffron-100/70 bg-gradient-to-br from-saffron-200 via-saffron-400 to-amber-200 text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.2)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-2",
          styles.mark
        )}
      >
        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.85),transparent_45%)]" />
        <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-10px_18px_rgba(15,23,42,0.35)]" />
        <span className="pointer-events-none absolute -inset-2 rounded-2xl bg-saffron-300/40 blur-xl opacity-70 transition group-hover:opacity-100" />
        <span
          className={cn(
            "relative z-10 font-display font-semibold tracking-[0.14em]",
            styles.letters
          )}
        >
          TJ
        </span>
      </div>

      {showText ? (
        <div className="leading-tight">
          <p className={cn("font-display text-slate-900", styles.title)}>{title}</p>
          {subtitle ? (
            <p className={cn("text-slate-500", styles.subtitle)}>{subtitle}</p>
          ) : null}
        </div>
      ) : null}
    </Link>
  );
}
