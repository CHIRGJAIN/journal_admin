"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { journalMeta, quickLinks } from "@/lib/site-data";

export default function QuickLinksSidebar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
  };

  return (
    <aside className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Quick search</p>
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles"
            className="h-10 rounded-full"
          />
          <Button type="submit" className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Quick links</p>
        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-900"
            >
              {link.label}
              <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Editorial office</p>
        <p className="mt-3 text-sm text-slate-600">
          {journalMeta.publisher}, {journalMeta.location}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Email: <a href="mailto:editor@trinixjournal.com" className="text-slate-900">editor@trinixjournal.com</a>
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-4 w-full rounded-full border-slate-300"
        >
          <Link href="/contact">Contact the team</Link>
        </Button>
      </div>
    </aside>
  );
}
