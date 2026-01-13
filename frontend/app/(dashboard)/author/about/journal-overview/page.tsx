'use client';

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Clock,
  Globe2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { journalMeta, journalStats } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const statPalette = [
  "border-sky-100 bg-gradient-to-br from-white via-sky-50 to-white",
  "border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-white",
  "border-amber-100 bg-gradient-to-br from-white via-amber-50 to-white",
  "border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-white",
];

const focusAreas = [
  "AI and ML systems",
  "Energy and sustainability",
  "Advanced materials",
  "Infrastructure and cities",
  "Robotics and automation",
  "Data systems and security",
];

const editorialHighlights = [
  {
    title: "Aims and scope",
    description:
      "Interdisciplinary research that advances engineering, applied science, and practical systems.",
    icon: BookOpen,
  },
  {
    title: "Ethics and integrity",
    description:
      "COPE-aligned checks for authorship, conflicts of interest, and data transparency.",
    icon: ShieldCheck,
  },
  {
    title: "Decision clarity",
    description:
      "Structured review outcomes with clear revision guidance and status visibility.",
    icon: BadgeCheck,
  },
];

const timelineSteps = [
  {
    title: "Editorial screening",
    description: "Scope fit, basic compliance, and metadata verification.",
    icon: Sparkles,
  },
  {
    title: "Peer review",
    description: "Double-blind review with invited experts.",
    icon: Globe2,
  },
  {
    title: "First decision",
    description: "Accept, revise, or decline based on reviewer feedback.",
    icon: Clock,
  },
];

export default function JournalOverviewPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-br from-saffron-50/50 via-white to-saffron-100/40"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Author portal
              </p>
              <h1 className="font-display text-4xl text-slate-900 md:text-5xl">
                Journal overview
              </h1>
              <p className="max-w-2xl text-base text-slate-600 md:text-lg">
                {journalMeta.tagline}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  {journalMeta.issnPrint}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  {journalMeta.issnOnline}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  Peer reviewed
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                  Hybrid open access
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  className="rounded-full bg-saffron-500 text-slate-900 hover:bg-saffron-400"
                >
                  <Link href="/author/submit">
                    Submit new manuscript
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full border-slate-300 bg-white/80"
                >
                  <Link href="/author/about/contact">Contact editorial office</Link>
                </Button>
              </div>
              <Button
                variant="outline"
                asChild
                className="w-fit rounded-full border-slate-300 bg-white/80"
              >
                <Link href="/author">
                  <ArrowLeft className="h-4 w-4" />
                  Back to dashboard
                </Link>
              </Button>
            </div>

            <div className="glass-card rounded-3xl p-6 md:p-8">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  At a glance
                </p>
                <h2 className="font-display text-2xl text-slate-900">
                  Editorial performance
                </h2>
                <p className="text-sm text-slate-600">
                  Decision cadence, reviewer network, and acceptance indicators.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {journalStats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className={cn(
                        "rounded-2xl border p-4 shadow-sm",
                        statPalette[index % statPalette.length]
                      )}
                    >
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-2 font-display text-xl text-slate-900">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
                  Published by {journalMeta.publisher} in {journalMeta.location}.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Aims and scope</CardTitle>
              <p className="text-xs text-slate-500">
                Research spanning engineering, AI, materials, and systems impact.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                Trinix Journal publishes rigorously reviewed work that connects
                advanced engineering research with real-world applications and
                systems performance.
              </p>
              <div className="grid gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Focus areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {editorialHighlights.map((item) => (
              <Card key={item.title} className="border-slate-200/70 bg-white/85">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {timelineSteps.map((step) => (
            <Card key={step.title} className="border-slate-200/70 bg-white/85">
              <CardContent className="space-y-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-700">
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="text-sm text-slate-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-900 px-6 py-8 text-white md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Ready to submit
              </p>
              <h2 className="font-display text-2xl">Start your manuscript</h2>
              <p className="text-sm text-white/70">
                Submit new work or check author instructions before uploading.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-white text-slate-900">
                <Link href="/author/submit">Submit manuscript</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-full border-white/40 text-white hover:bg-white/10"
              >
                <Link href="/author/about/instructions-for-authors">
                  View author instructions
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
