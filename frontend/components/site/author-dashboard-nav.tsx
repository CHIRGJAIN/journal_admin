"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import TrinixLogo from "@/components/site/trinix-logo";

type AuthorDashboardNavProps = {
  basePath?: string;
  portalSubtitle?: string;
  dashboardLabel?: string;
  settingsHref?: string;
};

export default function AuthorDashboardNav({
  basePath = "/author",
  portalSubtitle = "Author Portal",
  dashboardLabel = "Dashboard",
  settingsHref,
}: AuthorDashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [{ label: dashboardLabel, href: basePath }];
  const aboutItems = [
    { label: "Journal Overview", href: `${basePath}/about/journal-overview` },
    {
      label: "Instructions For Authors",
      href: `${basePath}/about/instructions-for-authors`,
    },
    { label: "Contact", href: `${basePath}/about/contact` },
    { label: "Policies", href: `${basePath}/about/policies` },
  ];
  const helpItems = [
    { label: "System Help", href: `${basePath}/help/system-help` },
    { label: "Video Tutorials", href: `${basePath}/help/video-tutorials` },
  ];

  const resolvedSettingsHref = settingsHref ?? `${basePath}/settings`;
  const isAboutActive = pathname.startsWith(`${basePath}/about`);
  const isHelpActive = pathname.startsWith(`${basePath}/help`);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="sticky top-0 z-40 border-b border-saffron-100/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <TrinixLogo
            href={basePath}
            title="Trinix Journal"
            subtitle={portalSubtitle}
            size="sm"
          />
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 font-medium transition hover:text-saffron-700",
                  pathname === item.href ? "bg-saffron-50 text-saffron-700" : "text-slate-600"
                )}
              >
                {item.label}
              </Link>
            ))}

            <div className="relative group">
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 font-medium transition hover:text-saffron-700",
                  isAboutActive ? "text-saffron-700" : "text-slate-600"
                )}
                aria-haspopup="menu"
              >
                About
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              <div className="pointer-events-none absolute left-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white/95 p-2 text-sm text-slate-700 shadow-lg opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                {aboutItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left hover:bg-slate-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative group">
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 font-medium transition hover:text-saffron-700",
                  isHelpActive ? "text-saffron-700" : "text-slate-600"
                )}
                aria-haspopup="menu"
              >
                Help
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
              <div className="pointer-events-none absolute left-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white/95 p-2 text-sm text-slate-700 shadow-lg opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                {helpItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left hover:bg-slate-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-saffron-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-saffron-200"
            aria-haspopup="menu"
          >
            <UserCircle className="h-4 w-4 text-saffron-700" />
            Profile
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
          <div className="pointer-events-none absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white/95 p-2 text-sm text-slate-700 shadow-lg opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
            <Link
              href={resolvedSettingsHref}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
            >
              <UserCircle className="h-4 w-4 text-slate-500" />
              Settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
