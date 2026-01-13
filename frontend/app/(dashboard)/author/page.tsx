'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardEdit,
  CornerDownLeft,
  FileText,
  FileWarning,
  HelpCircle,
  Loader2,
  Mail,
  RefreshCw,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  dashboardSections,
  queueViews,
  statusLabels,
  type ManuscriptStatus,
  type QueueViewKey,
} from "@/lib/author-portal";
import { manuscriptService } from '@/services';

type ManuscriptRecord = {
  id: string;
  title: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

const viewIcons: Record<QueueViewKey, LucideIcon> = {
  all: FileText,
  "sent-back": CornerDownLeft,
  incomplete: FileWarning,
  "awaiting-approval": UserCheck,
  processing: Loader2,
  "needs-revision": ClipboardEdit,
  "revision-awaiting-approval": ClipboardCheck,
  "revision-processing": RefreshCw,
  "revision-declined": XCircle,
  decisions: BadgeCheck,
};

const menuItems = [
  {
    label: "Alternate Contact Information",
    href: "/author/settings#alternate-contact",
    icon: Mail,
  },
  {
    label: "Unavailable Dates",
    href: "/author/settings#unavailable-dates",
    icon: CalendarDays,
  },
];

const statusTones: Record<string, string> = {
  DRAFT: "border-slate-200 bg-slate-50 text-slate-600",
  SUBMITTED: "border-saffron-200 bg-saffron-50 text-saffron-700",
  UNDER_REVIEW: "border-sky-200 bg-sky-50 text-sky-700",
  REVISION_REQUESTED: "border-amber-200 bg-amber-50 text-amber-700",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  PUBLISHED: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

const resolveDraftTitle = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "(Title not yet supplied)";
};

export default function AuthorDashboard() {
  const [manuscripts, setManuscripts] = useState<ManuscriptRecord[]>([]);
  const [isLoadingManuscripts, setIsLoadingManuscripts] = useState(false);
  const [summary, setSummary] = useState({ total: 0, awaitingCount: 0, decisionCount: 0 });

  useEffect(() => {
    const fetchManuscripts = async () => {
      setIsLoadingManuscripts(true);
      try {
        const data = await manuscriptService.getMyManuscripts();
        setManuscripts(data || []);
      } catch (err) {
        // ignore errors for now
      } finally {
        setIsLoadingManuscripts(false);
      }
    };
    fetchManuscripts();
    const fetchSummary = async () => {
      try {
        const data = await manuscriptService.getMySummary();
        setSummary(data);
      } catch (err) {
        // ignore
      }
    };
    fetchSummary();
  }, []);

  const statusCounts = useMemo(() => {
    return manuscripts.reduce<Record<string, number>>((acc, manuscript) => {
      const status = (manuscript.status || "UNKNOWN").toUpperCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [manuscripts]);

  const summaryStats = useMemo(() => {
    return [
      { label: 'Total manuscripts', value: summary.total },
      { label: "Awaiting your action", value: summary.awaitingCount },
      { label: "Decisions completed", value: summary.decisionCount },
    ];
  }, [summary]);

  const getCountForView = (view?: QueueViewKey) => {
    if (!view) return null;
    const statuses = queueViews[view]?.statuses ?? [];
    if (!statuses.length) return manuscripts.length;
    return statuses.reduce((sum, status) => sum + (statusCounts[status] ?? 0), 0);
  };

  const sortedManuscripts = useMemo(() => {
    return [...manuscripts].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [manuscripts]);

  const draftManuscripts = useMemo(
    () =>
      manuscripts.filter(
        (manuscript) => (manuscript.status || "").toUpperCase() === "DRAFT"
      ),
    [manuscripts]
  );

  return (
    <Dialog>
      <div className="min-h-screen">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-50" aria-hidden />
          <div
            className="absolute inset-0 bg-gradient-to-br from-saffron-50/50 via-white to-saffron-100/40"
            aria-hidden
          />
          <div className="relative mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Author portal
                </p>
                <h1 className="font-display text-3xl text-slate-900 md:text-4xl">
                  Author dashboard
                </h1>
                <p className="max-w-2xl text-sm text-slate-600 md:text-base">
                  Track submissions, manage revisions, and keep your manuscript
                  workflow moving forward.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-saffron-500 text-slate-900 hover:bg-saffron-400">
                    Submit new manuscript
                  </Button>
                </DialogTrigger>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full border-slate-300 bg-white/80"
                >
                  <Link href="/author/about/instructions-for-authors">Submission guide</Link>
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {summaryStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-display text-2xl text-slate-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="grid gap-6 lg:grid-cols-[0.32fr_0.68fr]">
            <div className="space-y-6">
              <Card className="border-slate-200/70 bg-white/80">
                <CardHeader className="border-b border-slate-200/70">
                  <CardTitle className="text-base">Author Main Menu</CardTitle>
                  <p className="text-xs text-slate-500">
                    Update contact details and availability.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-saffron-200 hover:bg-white"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-saffron-100 text-saffron-700">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="font-medium">{item.label}</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-saffron-600 transition group-hover:translate-x-0.5" />
                      </Link>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-saffron-100/80 bg-white/80">
                <CardHeader className="border-b border-saffron-100/80">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HelpCircle className="h-4 w-4 text-saffron-600" />
                    Need help?
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Get quick answers or reach the editorial office.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <p>
                    Review submission requirements, track your queue, or send a
                    message to the editorial team for support.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button asChild className="rounded-full bg-slate-900 text-white">
                      <Link href="/author/about/contact">Contact editorial office</Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="rounded-full border-slate-300"
                    >
                      <Link href="/author/queue?view=all">
                        Track all submissions
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {dashboardSections.map((section) => (
                <Card key={section.title} className="border-slate-200/70 bg-white/80">
                  <CardHeader className="border-b border-slate-200/70">
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <p className="text-xs text-slate-500">{section.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {section.items.map((item) => {
                      const Icon = item.view ? viewIcons[item.view] : FileText;
                      const count = getCountForView(item.view);
                      const cardContent = (
                        <>
                          <span className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-xl",
                                item.tone === "action"
                                  ? "bg-saffron-500 text-slate-900"
                                  : "bg-saffron-100 text-saffron-700"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="font-medium">{item.label}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            {item.view ? (
                              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                                {count}
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-saffron-700">
                                Start
                              </span>
                            )}
                            <ArrowUpRight className="h-4 w-4 text-saffron-600 transition group-hover:translate-x-0.5" />
                          </span>
                        </>
                      );

                      const cardClasses = cn(
                        "group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-saffron-200 hover:bg-white",
                        item.tone === "action" &&
                          "border-saffron-200 bg-saffron-50/70 text-slate-900"
                      );

                      if (item.tone === "action") {
                        return (
                          <DialogTrigger asChild key={item.label}>
                            <button type="button" className={cardClasses}>
                              {cardContent}
                            </button>
                          </DialogTrigger>
                        );
                      }

                      return (
                        <Link key={item.label} href={item.href} className={cardClasses}>
                          {cardContent}
                        </Link>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="mt-10 border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">My Manuscripts</CardTitle>
              <p className="text-xs text-slate-500">
                Review recent activity and open each manuscript for details.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of your submitted manuscripts.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedManuscripts.length === 0 ? (
                    isLoadingManuscripts ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-10 text-center text-sm text-slate-500"
                        >
                          Loading manuscripts...
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-10 text-center text-sm text-slate-500"
                        >
                          No manuscripts yet. Start a new submission to populate this
                          dashboard.
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    sortedManuscripts.map((manuscript) => {
                      const normalizedStatus = manuscript.status
                        ? manuscript.status.toUpperCase()
                        : "UNKNOWN";
                      const statusLabel =
                        statusLabels[normalizedStatus as ManuscriptStatus] ??
                        manuscript.status ??
                        "Unknown";
                      const statusTone =
                        statusTones[normalizedStatus] ??
                        "border-slate-200 bg-slate-50 text-slate-600";

                      return (
                        <TableRow key={manuscript.id}>
                          <TableCell className="font-medium">
                            {manuscript.title}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                                statusTone
                              )}
                            >
                              {statusLabel}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(manuscript.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/author/manuscript/${manuscript.id}`}>
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>

      <DialogContent
        className="w-[min(96vw,880px)] max-w-4xl border-slate-200 bg-white p-0"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between rounded-t-lg bg-slate-950 px-6 py-4 text-white">
          <DialogTitle className="text-base font-semibold sm:text-lg">
            Are you submitting one of the following?
          </DialogTitle>
          <DialogClose className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-900">
              Draft submissions
            </p>
            <p className="text-sm text-slate-600">
              Select a manuscript title to continue your submission.
            </p>
          </div>

          <div className="space-y-4">
            {draftManuscripts.length === 0 ? (
              <div className="grid gap-4 border-b border-slate-200/70 pb-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">
                    Incomplete Submission:
                  </p>
                  <p className="text-sm text-slate-500">
                    No draft submissions yet. Start a new submission below.
                  </p>
                </div>
                <div className="text-sm text-slate-600 sm:text-right">
                  <p className="text-sm font-semibold text-slate-800">Due:</p>
                  <p className="text-sm text-slate-500">N/A</p>
                </div>
              </div>
            ) : (
              draftManuscripts.map((manuscript) => (
                <div
                  key={manuscript.id}
                  className="grid gap-4 border-b border-slate-200/70 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-start"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Incomplete Submission:
                    </p>
                    <Link
                      href={`/author/manuscript/${manuscript.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-saffron-700 hover:text-saffron-800"
                    >
                      <ClipboardEdit className="h-4 w-4" />
                      {resolveDraftTitle(manuscript.title)}
                    </Link>
                  </div>
                  <div className="text-sm text-slate-600 sm:text-right">
                    <p className="text-sm font-semibold text-slate-800">Due:</p>
                    <p className="text-sm font-semibold text-slate-700">N/A</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button
            asChild
            className="w-full rounded-full bg-saffron-500 text-slate-900 hover:bg-saffron-400"
          >
            <Link href="/author/submit">Start a new submission</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
