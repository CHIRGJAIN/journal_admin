"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  ExternalLink,
  FileText,
  MessageSquareText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { reviewService } from "@/services";

type ReviewRecord = {
  id: string;
  content?: string;
  decision?: string;
  createdAt?: string;
  manuscript: {
    id: string;
    title: string;
    status?: string;
    contentUrl?: string;
    files?: Array<{ fileUrl?: string; url?: string }>;
    updatedAt?: string;
  };
};

const decisionTones: Record<string, string> = {
  PENDING: "border-slate-200 bg-slate-50 text-slate-600",
  ACCEPT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECT: "border-rose-200 bg-rose-50 text-rose-700",
  REVISE: "border-amber-200 bg-amber-50 text-amber-700",
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

const decisionOptions = [
  { label: "Accept", value: "ACCEPT" },
  { label: "Request revision", value: "REVISE" },
  { label: "Reject", value: "REJECT" },
];

const decisionStatusMap: Record<string, string> = {
  ACCEPT: "ACCEPTED",
  REJECT: "REJECTED",
  REVISE: "REVISION_REQUESTED",
};

const normalizeReviews = (items: ReviewRecord[]) =>
  items.map((item) => {
    const fallbackReviewId =
      (item as any)._id ||
      item.id ||
      (item as any).reviewId ||
      [item.manuscript?.id, item.createdAt].filter(Boolean).join("-") ||
      Math.random().toString(36).slice(2);

    const manuscript = (item as any).manuscript || {};
    const manuscriptId =
      (manuscript as any)._id ||
      manuscript.id ||
      (manuscript as any).manuscriptId ||
      (item as any).manuscriptId ||
      Math.random().toString(36).slice(2);

    const files = (manuscript as any).files;
    const contentUrl =
      manuscript.contentUrl ??
      (Array.isArray(files) && files.length > 0
        ? files[0]?.fileUrl || files[0]?.url
        : undefined);

    return {
      ...item,
      id: fallbackReviewId.toString(),
      decision: (item.decision || "PENDING").toUpperCase(),
      manuscript: {
        ...manuscript,
        id: manuscriptId.toString(),
        title: manuscript.title || item.manuscript?.title || "Untitled manuscript",
        status: (manuscript.status || "").toUpperCase(),
        contentUrl,
        files,
      },
    };
  });

export default function ReviewerDashboard() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReview, setActiveReview] = useState<ReviewRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [decision, setDecision] = useState("REVISE");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "sending">("idle");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await reviewService.getMyReviews();
        setReviews(normalizeReviews(data || []));
      } catch {
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const summaryStats = useMemo(() => {
    const pending = reviews.filter(
      (review) => (review.decision || "PENDING") === "PENDING"
    ).length;
    const completed = reviews.length - pending;
    return [
      { label: "Assigned reviews", value: reviews.length, icon: FileText },
      { label: "Pending decision", value: pending, icon: ClipboardCheck },
      { label: "Completed", value: completed, icon: MessageSquareText },
    ];
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      const aTime = a.manuscript?.updatedAt
        ? new Date(a.manuscript.updatedAt).getTime()
        : 0;
      const bTime = b.manuscript?.updatedAt
        ? new Date(b.manuscript.updatedAt).getTime()
        : 0;
      return bTime - aTime;
    });
  }, [reviews]);

  const resetDialogState = () => {
    setReviewNotes("");
    setDecision("REVISE");
    setSubmitError("");
    setSubmitStatus("idle");
  };

  const handleOpenDialog = (review: ReviewRecord) => {
    setActiveReview(review);
    setReviewNotes(review.content || "");
    setDecision(review.decision || "REVISE");
    setSubmitError("");
    setDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setActiveReview(null);
      resetDialogState();
    }
  };

  const handleSubmitReview = async () => {
    if (!activeReview) return;
    if (!reviewNotes.trim()) {
      setSubmitError("Add review notes before submitting.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitError("Sign in again to continue.");
      return;
    }

    setSubmitStatus("sending");
    setSubmitError("");

    try {
      const updated = await reviewService.submitReview(activeReview.id, {
        content: reviewNotes.trim(),
        decision,
      });

      const normalized = normalizeReviews([
        {
          ...activeReview,
          ...updated,
          content: updated?.content ?? reviewNotes.trim(),
          decision: (updated?.decision ?? decision).toUpperCase(),
          manuscript: updated?.manuscript ?? activeReview.manuscript,
        } as ReviewRecord,
      ])[0];

      const nextDecision = normalized.decision || decision;
      const nextStatus = decisionStatusMap[nextDecision] || decisionStatusMap[decision];

      setReviews((prev) =>
        prev.map((review) =>
          review.id === activeReview.id
            ? {
                ...normalized,
                manuscript: nextStatus
                  ? { ...normalized.manuscript, status: nextStatus }
                  : normalized.manuscript,
              }
            : review
        )
      );
      setDialogOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitError("Unable to submit the review. Try again.");
    } finally {
      setSubmitStatus("idle");
    }
  };

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
              Reviewer portal
            </p>
            <h1 className="font-display text-3xl text-slate-900 md:text-4xl">
              Reviewer dashboard
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Review assigned manuscripts and submit structured decisions.
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
        <Card className="border-slate-200/70 bg-white/85">
          <CardHeader className="border-b border-slate-200/70">
            <CardTitle className="text-base">Assigned manuscripts</CardTitle>
            <p className="text-xs text-slate-500">
              Open each assignment to read the manuscript PDF and submit a
              decision.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                {isLoading
                  ? "Loading assignments..."
                  : `${sortedReviews.length} assignment(s) available.`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Manuscript</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Decision</TableHead>
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
                      Loading assignments...
                    </TableCell>
                  </TableRow>
                ) : sortedReviews.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No review assignments yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedReviews.map((review) => {
                    const manuscriptStatus = review.manuscript.status
                      ? review.manuscript.status.toUpperCase()
                      : "UNKNOWN";
                    const manuscriptLabel =
                      statusLabels[manuscriptStatus as ManuscriptStatus] ??
                      review.manuscript.status ??
                      "Unknown";
                    const decisionValue = review.decision || "PENDING";
                    const decisionTone =
                      decisionTones[decisionValue] ??
                      "border-slate-200 bg-slate-50 text-slate-600";

                    return (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">
                          {review.manuscript.title}
                        </TableCell>
                        <TableCell>{manuscriptLabel}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                              decisionTone
                            )}
                          >
                            {decisionValue}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(review.manuscript.updatedAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleOpenDialog(review)}
                          >
                            Review & submit
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

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="w-[min(96vw,920px)] max-w-3xl border-slate-200 bg-white p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-lg bg-slate-950 px-6 py-4 text-white">
            <DialogTitle className="text-base font-semibold">
              Submit review
            </DialogTitle>
            <span className="text-xs text-white/70">
              {activeReview?.manuscript.title || "Select an assignment"}
            </span>
          </div>
          <div className="space-y-6 px-6 py-5">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Manuscript PDF
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Open the PDF to review formatting, structure, and content.
              </p>
              {activeReview?.manuscript.contentUrl ? (
                <Button asChild className="mt-4 rounded-full bg-slate-900">
                  <a
                    href={activeReview.manuscript.contentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open manuscript PDF
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <p className="mt-3 text-xs text-rose-600">
                  No PDF file is attached yet.
                </p>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.45fr_0.55fr]">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <Label htmlFor="decision" className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Decision
                </Label>
                <select
                  id="decision"
                  value={decision}
                  onChange={(event) => setDecision(event.target.value)}
                  className="mt-3 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-300"
                >
                  {decisionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <Label htmlFor="review-notes" className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Review notes
                </Label>
                <Textarea
                  id="review-notes"
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  placeholder="Summarize strengths, weaknesses, and required changes."
                  className="mt-3 min-h-32"
                />
              </div>
            </div>

            <Button
              type="button"
              className="w-full rounded-full bg-saffron-500 text-slate-900 hover:bg-saffron-400"
              onClick={handleSubmitReview}
              disabled={submitStatus === "sending"}
            >
              {submitStatus === "sending" ? "Submitting..." : "Submit review"}
            </Button>

            {submitError ? (
              <p className="text-sm font-semibold text-rose-600">{submitError}</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
