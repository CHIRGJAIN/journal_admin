'use client';

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quickLinks = [
  { label: "Submission checklist", href: "#submission-checklist" },
  { label: "Manuscript preparation", href: "#manuscript-prep" },
  { label: "Required statements", href: "#required-statements" },
  { label: "Review process", href: "#review-process" },
];

const checklistItems = [
  "Upload the manuscript PDF and any supplementary files.",
  "Confirm the title, abstract, keywords, and author order.",
  "Prepare ethics, funding, and data availability statements.",
  "Verify corresponding author contact details and ORCID IDs.",
];

const preparationItems = [
  "Title page, abstract, and 4 to 6 keywords.",
  "Main text with numbered sections and clear headings.",
  "Tables and figures labeled with descriptive captions.",
  "References formatted consistently with DOIs where available.",
];

const fileChecklist = [
  "Main manuscript (PDF).",
  "Cover letter and highlights.",
  "Figures and tables (separate files if needed).",
  "Supplementary data or code archive link.",
];

const policyCards = [
  {
    title: "Ethics and integrity",
    description:
      "Disclose conflicts of interest, funding sources, and human or animal approvals.",
    icon: ShieldCheck,
  },
  {
    title: "Data availability",
    description:
      "Include data and code availability statements with repository links where possible.",
    icon: FileText,
  },
  {
    title: "Authorship",
    description:
      "Confirm author contributions and approval from all co-authors before submission.",
    icon: BadgeCheck,
  },
];

const reviewSteps = [
  {
    title: "Editorial check",
    description: "Scope fit and compliance screening within 3 to 5 days.",
    icon: Sparkles,
  },
  {
    title: "Peer review",
    description: "Double-blind review with two or more expert reviewers.",
    icon: BookOpen,
  },
  {
    title: "Decision and revision",
    description: "Clear revision guidance and response tracking.",
    icon: CalendarDays,
  },
];

export default function InstructionsForAuthorsPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-br from-saffron-50/50 via-white to-saffron-100/40"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Author portal
              </p>
              <h1 className="font-display text-4xl text-slate-900 md:text-5xl">
                Instructions for authors
              </h1>
              <p className="max-w-2xl text-base text-slate-600 md:text-lg">
                Prepare your manuscript with the required files, metadata, and
                compliance statements before submission.
              </p>
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
                  <Link href="/author/about/contact">Request a template</Link>
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
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                On this page
              </p>
              <div className="mt-4 grid gap-3">
                {quickLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-saffron-200 hover:bg-white"
                  >
                    <span className="font-medium">{link.label}</span>
                    <ArrowRight className="h-4 w-4 text-saffron-600" />
                  </a>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
                Typical submission packages include the manuscript PDF, cover
                letter, and supplementary files.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="submission-checklist" className="mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Submission checklist</CardTitle>
              <p className="text-xs text-slate-500">
                Confirm every item before clicking submit.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <ol className="grid gap-3">
                {checklistItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Article types</CardTitle>
              <p className="text-xs text-slate-500">
                Typical submissions accepted by the journal.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <ul className="grid gap-2">
                <li>Original research articles</li>
                <li>Systematic reviews and surveys</li>
                <li>Methods and technical notes</li>
                <li>Short communications</li>
                <li>Data or software reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="manuscript-prep" className="mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Manuscript preparation</CardTitle>
              <p className="text-xs text-slate-500">
                Keep formatting consistent and easy to review.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <ul className="grid gap-3">
                {preparationItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-xs text-slate-500">
                Keep figures high resolution and ensure all tables are editable.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">File checklist</CardTitle>
              <p className="text-xs text-slate-500">
                Upload these files to complete the submission.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <ul className="grid gap-3">
                {fileChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button
                variant="outline"
                asChild
                className="w-fit rounded-full border-slate-300"
              >
                <Link href="/author/about/contact">Ask about templates</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="required-statements" className="mx-auto w-full max-w-6xl px-6 pb-12">
        <div className="grid gap-4 lg:grid-cols-3">
          {policyCards.map((card) => (
            <Card key={card.title} className="border-slate-200/70 bg-white/85">
              <CardContent className="space-y-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-700">
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                <p className="text-sm text-slate-600">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="review-process" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {reviewSteps.map((step) => (
            <Card key={step.title} className="border-slate-200/70 bg-white/85">
              <CardContent className="space-y-3 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
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
                Ready to upload
              </p>
              <h2 className="font-display text-2xl">Submit your manuscript</h2>
              <p className="text-sm text-white/70">
                Ensure your files and statements are ready, then start the submission.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-white text-slate-900">
                <Link href="/author/submit">Start submission</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-full border-white/40 text-white hover:bg-white/10"
              >
                <Link href="/author/about/contact">Contact editorial office</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
