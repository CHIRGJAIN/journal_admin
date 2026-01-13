"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, ClipboardCheck, ExternalLink, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
const productionStatuses = new Set(["ACCEPTED", "PUBLISHED"]);

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

const normalizeManuscripts = (payload: unknown): ManuscriptRecord[] => {
  if (Array.isArray(payload)) return payload as ManuscriptRecord[];
  if (payload && typeof payload === "object" && Array.isArray((payload as any).data)) {
    return (payload as any).data as ManuscriptRecord[];
  }
  return [];
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

export default function PublisherDashboard() {
  const [manuscripts, setManuscripts] = useState<ManuscriptRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeManuscript, setActiveManuscript] =
    useState<ManuscriptRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing">("idle");
  const [publishError, setPublishError] = useState("");

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
          const payload = await res.json();
          const data = normalizeManuscripts(payload);
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
        label: "Ready for production",
        value: statusCounts.ACCEPTED ?? 0,
        icon: ClipboardCheck,
      },
      {
        label: "Published",
        value: statusCounts.PUBLISHED ?? 0,
        icon: BadgeCheck,
      },
      {
        label: "In production",
        value: (statusCounts.ACCEPTED ?? 0) + (statusCounts.PUBLISHED ?? 0),
        icon: FileText,
      },
    ],
    [statusCounts]
  );

  const productionQueue = useMemo(() => {
    return manuscripts
      .filter((manuscript) =>
        productionStatuses.has((manuscript.status || "").toUpperCase())
      )
      .sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [manuscripts]);

  const resetDialogState = () => {
    setPublishError("");
    setPublishStatus("idle");
  };

  const handleOpenDialog = (manuscript: ManuscriptRecord) => {
    setActiveManuscript(manuscript);
    resetDialogState();
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setActiveManuscript(null);
      resetDialogState();
    }
  };

  const handlePublish = async () => {
    if (!activeManuscript) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setPublishError("Sign in again to continue.");
      return;
    }

    setPublishStatus("publishing");
    setPublishError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manuscripts/${activeManuscript.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "PUBLISHED" }),
        }
      );

      if (!res.ok) {
        setPublishError("Unable to publish the manuscript. Try again.");
        setPublishStatus("idle");
        return;
      }

      setManuscripts((prev) =>
        prev.map((item) =>
          item.id === activeManuscript.id ? { ...item, status: "PUBLISHED" } : item
        )
      );
      setDialogOpen(false);
    } finally {
      setPublishStatus("idle");
    }
  };

  const activeStatus = activeManuscript?.status
    ? activeManuscript.status.toUpperCase()
    : "UNKNOWN";
  const activeStatusLabel =
    statusLabels[activeStatus as ManuscriptStatus] ??
    activeManuscript?.status ??
    "Unknown";
  const activeStatusTone =
    statusTones[activeStatus] ?? "border-slate-200 bg-slate-50 text-slate-600";
  const canPublish = activeStatus === "ACCEPTED";

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
              Publisher portal
            </p>
            <h1 className="font-display text-3xl text-slate-900 md:text-4xl">
              Publisher dashboard
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Prepare accepted manuscripts for release, finalize metadata, and
              publish each issue on schedule.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {summaryStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-saffron-100 text-saffron-700">
                    <stat.icon className="h-4 w-4" />
                  </span>
                  {stat.label}
                </div>
                <p className="mt-3 font-display text-2xl text-slate-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[0.33fr_0.67fr]">
          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Publishing checklist</CardTitle>
              <p className="text-xs text-slate-500">
                Confirm final files and release metadata before publishing.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                Verify layout, figure placement, and pagination.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                Confirm DOI registration and issue assignment.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                Publish when metadata and PDFs are final.
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Production queue</CardTitle>
              <p className="text-xs text-slate-500">
                Accepted manuscripts stay here until they are published.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>
                  {isLoading
                    ? "Loading production queue..."
                    : `${productionQueue.length} manuscript(s) ready for production.`}
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
                        Loading production queue...
                      </TableCell>
                    </TableRow>
                  ) : productionQueue.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        No manuscripts are ready for production yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    productionQueue.map((manuscript) => {
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
                            {normalized === "ACCEPTED" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                onClick={() => handleOpenDialog(manuscript)}
                              >
                                Publish
                              </Button>
                            ) : manuscript.contentUrl ? (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="rounded-full"
                              >
                                <a
                                  href={manuscript.contentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  View PDF
                                </a>
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-500">
                                No PDF
                              </span>
                            )}
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

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="w-[min(96vw,920px)] max-w-3xl border-slate-200 bg-white p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-lg bg-slate-950 px-6 py-4 text-white">
            <DialogTitle className="text-base font-semibold">
              Publish manuscript
            </DialogTitle>
            <span className="text-xs text-white/70">
              {activeManuscript?.title || "Select a manuscript"}
            </span>
          </div>
          <div className="space-y-6 px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Publication details
                </p>
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Author</p>
                    <p>{activeManuscript?.author?.name || "Not supplied"}</p>
                    <p className="text-xs text-slate-500">
                      {activeManuscript?.author?.email || "No email on record"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Status</p>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                        activeStatusTone
                      )}
                    >
                      {activeStatusLabel}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Updated</p>
                    <p>{formatDate(activeManuscript?.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Final PDF
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Confirm the final formatted PDF before publishing.
                </p>
                {activeManuscript?.contentUrl ? (
                  <Button asChild className="mt-4 rounded-full bg-slate-900">
                    <a
                      href={activeManuscript.contentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open final PDF
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <p className="mt-3 text-xs text-rose-600">
                    No PDF file is attached yet.
                  </p>
                )}
              </div>
            </div>

            <Button
              type="button"
              className="w-full rounded-full bg-saffron-500 text-slate-900 hover:bg-saffron-400"
              onClick={handlePublish}
              disabled={publishStatus === "publishing" || !canPublish}
            >
              {publishStatus === "publishing" ? "Publishing..." : "Mark as published"}
            </Button>

            {!canPublish ? (
              <p className="text-xs text-slate-500">
                This manuscript must be in ACCEPTED status to publish.
              </p>
            ) : null}

            {publishError ? (
              <p className="text-sm font-semibold text-rose-600">{publishError}</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
