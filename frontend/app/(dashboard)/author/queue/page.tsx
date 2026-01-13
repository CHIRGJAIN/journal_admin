'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { manuscriptService } from "@/services";
import { ApiError } from "@/lib/apiClient";

type ManuscriptRecord = {
  id: string;
  title: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

const resolveViewKey = (value: string | null): QueueViewKey => {
  if (value && Object.prototype.hasOwnProperty.call(queueViews, value)) {
    return value as QueueViewKey;
  }
  return "all";
};

export default function AuthorQueuePage() {
  const searchParams = useSearchParams();
  const viewKey = resolveViewKey(searchParams.get("view"));
  const activeView = queueViews[viewKey];

  const [manuscripts, setManuscripts] = useState<ManuscriptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManuscripts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await manuscriptService.getMyManuscripts();
        if (response.manuscripts && Array.isArray(response.manuscripts)) {
          setManuscripts(response.manuscripts);
        } else {
          setManuscripts([]);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          console.error("API Error:", err.message);
        } else {
          console.error("Error fetching manuscripts:", err);
        }
        setManuscripts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchManuscripts();
  }, []);

  const statusCounts = useMemo(() => {
    return manuscripts.reduce<Record<string, number>>((acc, manuscript) => {
      const status = (manuscript.status || "UNKNOWN").toUpperCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [manuscripts]);

  const getCountForView = (view: QueueViewKey) => {
    const statuses = queueViews[view]?.statuses ?? [];
    if (!statuses.length) return manuscripts.length;
    return statuses.reduce((sum, status) => sum + (statusCounts[status] ?? 0), 0);
  };

  const filteredManuscripts = useMemo(() => {
    const statuses = activeView.statuses;
    if (!statuses.length) return manuscripts;

    return manuscripts.filter((manuscript) =>
      statuses.includes((manuscript.status || "").toUpperCase() as ManuscriptStatus)
    );
  }, [activeView.statuses, manuscripts]);

  const filterGroups = useMemo(() => {
    const queueGroups = dashboardSections.map((section) => ({
      title: section.title,
      items: section.items
        .filter((item) => item.view)
        .map((item) => ({ label: item.label, view: item.view as QueueViewKey })),
    }));

    return [
      {
        title: "All",
        items: [{ label: queueViews.all.label, view: "all" as QueueViewKey }],
      },
      ...queueGroups,
    ];
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-br from-saffron-50/50 via-white to-saffron-100/40"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Author portal
              </p>
              <h1 className="font-display text-3xl text-slate-900 md:text-4xl">
                Submission queue
              </h1>
              <p className="max-w-2xl text-sm text-slate-600 md:text-base">
                Review manuscripts by queue and open each record for details,
                status, and next actions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                asChild
                className="rounded-full border-slate-300 bg-white/80"
              >
                <Link href="/author">
                  <ArrowLeft className="h-4 w-4" />
                  Back to dashboard
                </Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-saffron-500 text-slate-900 hover:bg-saffron-400"
              >
                <Link href="/author/submit">Submit new manuscript</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Queue filters</CardTitle>
              <p className="text-xs text-slate-500">
                Jump to a queue to see active manuscripts.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {filterGroups.map((group) => (
                <div key={group.title} className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {group.title}
                  </p>
                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const isActive = item.view === viewKey;
                      const count = getCountForView(item.view);
                      return (
                        <Link
                          key={item.view}
                          href={`/author/queue?view=${item.view}`}
                          className={cn(
                            "group flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-saffron-200 hover:bg-white",
                            isActive &&
                              "border-saffron-200 bg-saffron-50/70 text-slate-900"
                          )}
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className="flex items-center gap-2">
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
                              {count}
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-saffron-600 transition group-hover:translate-x-0.5" />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">{activeView.label}</CardTitle>
              <p className="text-xs text-slate-500">{activeView.description}</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>
                  Showing {filteredManuscripts.length}{" "}
                  {filteredManuscripts.length === 1 ? "manuscript" : "manuscripts"}.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredManuscripts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        No manuscripts are in this queue right now.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredManuscripts.map((manuscript) => {
                      const normalizedStatus = manuscript.status
                        ? manuscript.status.toUpperCase()
                        : "UNKNOWN";
                      const statusLabel =
                        statusLabels[normalizedStatus as ManuscriptStatus] ??
                        manuscript.status ??
                        "Unknown";

                      return (
                        <TableRow key={manuscript.id}>
                          <TableCell className="font-medium">
                            {manuscript.title}
                          </TableCell>
                          <TableCell>{statusLabel}</TableCell>
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
        </div>
      </section>
    </div>
  );
}
