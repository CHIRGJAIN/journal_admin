"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, FileText, UserCheck } from "lucide-react";

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
import { statusLabels, type ManuscriptStatus } from "@/lib/author-portal";
import { cn } from "@/lib/utils";

type ManuscriptRecord = {
  id: string;
  title: string;
  status?: string;
  contentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: {
    name?: string;
    email?: string;
  };
};

const statusTones: Record<string, string> = {
  DRAFT: "border-slate-200 bg-slate-50 text-slate-600",
  SUBMITTED: "border-saffron-200 bg-saffron-50 text-saffron-700",
  UNDER_REVIEW: "border-sky-200 bg-sky-50 text-sky-700",
  REVISION_REQUESTED: "border-amber-200 bg-amber-50 text-amber-700",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  PUBLISHED: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

const LOCAL_MANUSCRIPTS_KEY = "localManuscripts";

const readLocalManuscripts = (): ManuscriptRecord[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_MANUSCRIPTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const mergeManuscripts = (
  primary: ManuscriptRecord[],
  secondary: ManuscriptRecord[]
) => {
  const merged = new Map<string, ManuscriptRecord>();
  secondary.forEach((item) => merged.set(item.id, item));
  primary.forEach((item) => merged.set(item.id, item));
  return Array.from(merged.values());
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

export default function EditorDashboard() {
  const [manuscripts, setManuscripts] = useState<ManuscriptRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchManuscripts = async () => {
      const token = localStorage.getItem("token");
      const localManuscripts = readLocalManuscripts();
      if (!token) {
        setManuscripts(localManuscripts);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manuscripts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = (await res.json()) as ManuscriptRecord[];
          setManuscripts(mergeManuscripts(data, localManuscripts));
        } else {
          setManuscripts(localManuscripts);
        }
      } catch {
        setManuscripts(localManuscripts);
      } finally {
        setIsLoading(false);
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

  const summaryStats = useMemo(
    () => [
      {
        label: "Awaiting format check",
        value: statusCounts.SUBMITTED ?? 0,
      },
      {
        label: "Under review",
        value: statusCounts.UNDER_REVIEW ?? 0,
      },
      {
        label: "Revision requested",
        value: statusCounts.REVISION_REQUESTED ?? 0,
      },
    ],
    [statusCounts]
  );

  const sortedManuscripts = useMemo(() => {
    return [...manuscripts].sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [manuscripts]);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-br from-saffron-50/50 via-white to-saffron-100/40"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-10 md:py-12">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Editorial portal
            </p>
            <h1 className="font-display text-3xl text-slate-900 md:text-4xl">
              Editorial dashboard
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Review submissions, format PDFs, and assign reviewers in one place.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {summaryStats.map((stat, index) => {
              const icon =
                index === 0 ? FileText : index === 1 ? UserCheck : ClipboardCheck;
              const Icon = icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    {stat.label}
                  </div>
                  <p className="mt-3 font-display text-2xl text-slate-900">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          <Card className="mt-6 border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Editorial checklist</CardTitle>
              <p className="text-xs text-slate-500">
                Keep each manuscript compliant before review.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                Confirm PDF formatting and file integrity.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                Upload edited PDFs when adjustments are required.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                Assign reviewers once the final file is selected.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="space-y-6">
          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Manuscript queue</CardTitle>
              <p className="text-xs text-slate-500">
                Open a submission to review the PDF and assign a reviewer.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>
                  {isLoading
                    ? "Loading submissions..."
                    : `${sortedManuscripts.length} manuscript(s) in the queue.`}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        Loading submissions...
                      </TableCell>
                    </TableRow>
                  ) : sortedManuscripts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        No manuscripts are available yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedManuscripts.map((manuscript) => {
                      const normalized =
                        manuscript.status?.toUpperCase() ?? "UNKNOWN";
                      const label =
                        statusLabels[normalized as ManuscriptStatus] ??
                        manuscript.status ??
                        "Unknown";
                      const tone =
                        statusTones[normalized] ??
                        "border-slate-200 bg-slate-50 text-slate-600";

                      return (
                        <TableRow key={manuscript.id}>
                          <TableCell className="font-medium">
                            {manuscript.title}
                          </TableCell>
                          <TableCell>{manuscript.author?.name || "N/A"}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                                tone
                              )}
                            >
                              {label}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(manuscript.updatedAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              asChild
                            >
                              <Link href={`/editor/manuscript/${manuscript.id}`}>
                                Review & assign
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
