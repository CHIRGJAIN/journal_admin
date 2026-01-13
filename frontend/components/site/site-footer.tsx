import { Mail, MapPin, Phone } from "lucide-react";

import { journalMeta } from "@/lib/site-data";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 text-white font-semibold shadow-md">
                TJ
              </div>
              <div>
                <p className="font-display text-xl">{journalMeta.shortTitle}</p>
                <p className="text-sm text-white/70">
                  Trinix Journal of Advanced Engineering and Sciences
                </p>
              </div>
            </div>
            <p className="text-sm text-white/70">
              {journalMeta.tagline}
            </p>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{journalMeta.publisher}, {journalMeta.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:editor@trinixjournal.com" className="hover:text-white">
                  editor@trinixjournal.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 11 4800 2211</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">Journal office</p>
            <p className="text-sm text-white/70">
              Trinix Pvt Ltd, 2nd Floor, Jasola District Centre, New Delhi 110025
            </p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p className="font-medium text-white">Open access support</p>
              <p className="mt-2">
                APC waived for invited submissions through Dec 2025. Hybrid access options available.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <span>Copyright {new Date().getFullYear()} Trinix Pvt Ltd. All rights reserved.</span>
          <span>{journalMeta.issnPrint} | {journalMeta.issnOnline}</span>
        </div>
      </div>
    </footer>
  );
}
