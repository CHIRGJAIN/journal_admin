"use client";

import { journalMeta } from "@/lib/site-data";
import TrinixLogo from "@/components/site/trinix-logo";

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50">
      <div className="relative overflow-hidden bg-slate-950 text-white/80 text-xs">
        <div
          className="absolute inset-0 bg-gradient-to-r from-saffron-500/20 via-transparent to-saffron-400/15"
          aria-hidden
        />
        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-2">
          <span className="tracking-wide">
            {journalMeta.issnPrint} | {journalMeta.issnOnline}
          </span>
          <span className="hidden md:inline">{journalMeta.location}</span>
        </div>
      </div>
      <div className="border-b border-saffron-100/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <TrinixLogo
            href="/login"
            title={journalMeta.shortTitle}
            subtitle="Advanced Engineering and Sciences"
          />
        </div>
      </div>
    </header>
  );
}
