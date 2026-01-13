"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  ExternalLink,
  FileText,
  UploadCloud,
  UserCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fileToDataUrl } from "@/lib/file-utils";
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
  const [activeManuscript, setActiveManuscript] =
    useState<ManuscriptRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewerId, setReviewerId] = useState("");
  const [formattedPdfUrl, setFormattedPdfUrl] = useState("");
  const [formattedPdfName, setFormattedPdfName] = useState("");
  const [preferredPdf, setPreferredPdf] = useState<"original" | "formatted">(
    "original"
  );
  const [actionError, setActionError] = useState("");
  const [actionStatus, setActionStatus] = useState<"idle" | "assigning">("idle");

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

  const resetDialogState = () => {
    setReviewerId("");
    setFormattedPdfUrl("");
    setFormattedPdfName("");
    setPreferredPdf("original");
    setActionError("");
    setActionStatus("idle");
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

  const handleFormattedUpload = async (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setActionError("Only PDF files can be uploaded for formatting.");
      return;
    }

    setActionError("");
    const dataUrl = await fileToDataUrl(file);
    setFormattedPdfUrl(dataUrl);
    setFormattedPdfName(file.name);
    setPreferredPdf("formatted");
  };

  const handleSendToReviewer = async () => {
    if (!activeManuscript) return;
    if (!reviewerId.trim()) {
      setActionError("Enter a reviewer ID to continue.");
      return;
    }
    if (preferredPdf === "formatted" && !formattedPdfUrl) {
      setActionError("Upload a formatted PDF or choose the original file.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setActionError("Sign in again to continue.");
      return;
    }

    setActionStatus("assigning");
    setActionError("");

    try {
      if (preferredPdf === "formatted" && formattedPdfUrl) {
        const updateRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manuscripts/${activeManuscript.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ contentUrl: formattedPdfUrl }),
          }
        );

        if (!updateRes.ok) {
          setActionError("Unable to save the formatted PDF.");
          setActionStatus("idle");
          return;
        }
      }

      const assignRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            manuscriptId: activeManuscript.id,
            reviewerId: reviewerId.trim(),
          }),
        }
      );

      if (!assignRes.ok) {
        setActionError("Unable to assign the reviewer. Try again.");
        setActionStatus("idle");
        return;
      }

      setManuscripts((prev) =>
        prev.map((item) =>
          item.id === activeManuscript.id
            ? {
                ...item,
                status: "UNDER_REVIEW",
                contentUrl:
                  preferredPdf === "formatted" ? formattedPdfUrl : item.contentUrl,
              }
            : item
        )
      );

      setDialogOpen(false);
    } finally {
      setActionStatus("idle");
    }
  };

  const normalizedStatus = activeManuscript?.status
    ? activeManuscript.status.toUpperCase()
    : "UNKNOWN";
  const activeStatusLabel =
    statusLabels[normalizedStatus as ManuscriptStatus] ??
    activeManuscript?.status ??
    "Unknown";
  const activeStatusTone =
    statusTones[normalizedStatus] ?? "border-slate-200 bg-slate-50 text-slate-600";

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
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[0.33fr_0.67fr]">
          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Editorial checklist</CardTitle>
              <p className="text-xs text-slate-500">
                Keep each manuscript compliant before review.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
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
                              onClick={() => handleOpenDialog(manuscript)}
                            >
                              Review & assign
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

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="w-[min(96vw,1120px)] max-w-5xl border-slate-200 bg-white p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-lg bg-slate-950 px-6 py-4 text-white">
            <DialogTitle className="text-base font-semibold">
              Editorial review
            </DialogTitle>
            <span className="text-xs text-white/70">
              {activeManuscript?.title || "Select a manuscript"}
            </span>
          </div>
          <div className="space-y-6 px-6 py-5">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Submission details
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
                    Current PDF
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Open the submitted PDF to review formatting before assigning.
                  </p>
                  {activeManuscript?.contentUrl ? (
                    <Button asChild className="mt-4 rounded-full bg-slate-900">
                      <a
                        href={activeManuscript.contentUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open submission PDF
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <p className="mt-3 text-xs text-rose-600">
                      No PDF has been attached yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Upload formatted PDF
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Replace the submission with a format-corrected PDF if needed.
                  </p>
                  <input
                    id="formatted-pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={(event) =>
                      handleFormattedUpload(event.target.files?.[0] ?? null)
                    }
                    className="sr-only"
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Label
                      htmlFor="formatted-pdf"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      <UploadCloud className="h-4 w-4" />
                      Upload PDF
                    </Label>
                    {formattedPdfName ? (
                      <span className="text-xs text-slate-500">
                        {formattedPdfName}
                      </span>
                    ) : null}
                    {formattedPdfUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="rounded-full border-slate-300"
                      >
                        <a href={formattedPdfUrl} target="_blank" rel="noreferrer">
                          Preview formatted PDF
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Select PDF to send
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setPreferredPdf("original")}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left text-sm transition",
                        preferredPdf === "original"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700"
                      )}
                    >
                      <p className="font-semibold">Original submission</p>
                      <p className="text-xs opacity-80">
                        Use the PDF provided by the author.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredPdf("formatted")}
                      disabled={!formattedPdfUrl}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left text-sm transition",
                        preferredPdf === "formatted"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700",
                        !formattedPdfUrl && "cursor-not-allowed opacity-60"
                      )}
                    >
                      <p className="font-semibold">Formatted PDF</p>
                      <p className="text-xs opacity-80">
                        Use the editor-uploaded version.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Assign reviewer
                  </p>
                  <div className="mt-3 space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="reviewer-id" className="text-xs">
                        Reviewer ID
                      </Label>
                      <Input
                        id="reviewer-id"
                        value={reviewerId}
                        onChange={(event) => setReviewerId(event.target.value)}
                        placeholder="Paste reviewer user ID"
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full rounded-full bg-saffron-500 text-slate-900 hover:bg-saffron-400"
                      onClick={handleSendToReviewer}
                      disabled={actionStatus === "assigning"}
                    >
                      {actionStatus === "assigning"
                        ? "Sending..."
                        : "Send to reviewer"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {actionError ? (
              <p className="text-sm font-semibold text-rose-600">{actionError}</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
