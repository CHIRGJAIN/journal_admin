"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

export default function EditorReviewPage() {
  const params = useParams<{ id: string }>();
  const manuscriptId = params?.id;
  const [manuscript, setManuscript] = useState<ManuscriptRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [formattedPdfUrl, setFormattedPdfUrl] = useState("");
  const [formattedPdfName, setFormattedPdfName] = useState("");
  const [preferredPdf, setPreferredPdf] = useState<"original" | "formatted">(
    "original"
  );
  const [actionError, setActionError] = useState("");
  const [actionNotice, setActionNotice] = useState("");
  const [actionStatus, setActionStatus] = useState<"idle" | "assigning">("idle");

  useEffect(() => {
    const fetchManuscript = async () => {
      if (!manuscriptId) return;
      setLoading(true);
      setLoadError("");

      const localManuscripts = readLocalManuscripts();
      const localMatch =
        localManuscripts.find((item) => item.id === manuscriptId) ?? null;
      const token = localStorage.getItem("token");

      if (!token) {
        setManuscript(localMatch);
        if (!localMatch) {
          setLoadError("This manuscript is not available offline.");
        }
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manuscripts/${manuscriptId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = (await res.json()) as ManuscriptRecord;
          setManuscript(data ?? localMatch);
          setLoading(false);
          return;
        }

        const listRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manuscripts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (listRes.ok) {
          const data = (await listRes.json()) as ManuscriptRecord[];
          const match =
            data.find((item) => item.id === manuscriptId) ?? localMatch;
          setManuscript(match);
          if (!match) {
            setLoadError("Unable to load this manuscript. Please try again.");
          }
          setLoading(false);
          return;
        }

        setManuscript(localMatch);
        if (!localMatch) {
          setLoadError("Unable to load this manuscript. Please try again.");
        }
      } catch {
        setManuscript(localMatch);
        if (!localMatch) {
          setLoadError("Unable to load this manuscript. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchManuscript();
  }, [manuscriptId]);

  const normalizedStatus = manuscript?.status
    ? manuscript.status.toUpperCase()
    : "UNKNOWN";
  const statusLabel =
    statusLabels[normalizedStatus as ManuscriptStatus] ??
    manuscript?.status ??
    "Unknown";
  const statusTone =
    statusTones[normalizedStatus] ?? "border-slate-200 bg-slate-50 text-slate-600";

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
    if (!manuscript) return;
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
    setActionNotice("");

    try {
      if (preferredPdf === "formatted" && formattedPdfUrl) {
        const updateRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/manuscripts/${manuscript.id}`,
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
            manuscriptId: manuscript.id,
            reviewerId: reviewerId.trim(),
          }),
        }
      );

      if (!assignRes.ok) {
        setActionError("Unable to assign the reviewer. Try again.");
        setActionStatus("idle");
        return;
      }

      setManuscript((prev) =>
        prev
          ? {
              ...prev,
              status: "UNDER_REVIEW",
              contentUrl:
                preferredPdf === "formatted" ? formattedPdfUrl : prev.contentUrl,
            }
          : prev
      );

      setActionNotice("Reviewer assigned. The manuscript is now under review.");
    } finally {
      setActionStatus("idle");
    }
  };

  const isSubmitting = actionStatus === "assigning";

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
                Editorial portal
              </p>
              <h1 className="font-display text-3xl text-slate-900 md:text-4xl">
                Review & assign
              </h1>
              <p className="text-sm text-slate-600 md:text-base">
                Review the submission details, update the PDF, and assign a reviewer.
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="rounded-full border-slate-300 bg-white/80"
            >
              <Link href="/editor">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <Card className="border-slate-200/70 bg-white/85">
          <CardHeader className="border-b border-slate-200/70">
            <CardTitle className="text-base">
              {manuscript?.title || "Editorial review"}
            </CardTitle>
            <p className="text-xs text-slate-500">
              Assign reviewers and make sure the final PDF is ready to send.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <p className="text-sm text-slate-500">
                Loading manuscript details...
              </p>
            ) : loadError ? (
              <p className="text-sm text-rose-600">{loadError}</p>
            ) : manuscript ? (
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Submission details
                    </p>
                    <div className="mt-3 space-y-3 text-sm text-slate-700">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          Author
                        </p>
                        <p>{manuscript.author?.name || "Not supplied"}</p>
                        <p className="text-xs text-slate-500">
                          {manuscript.author?.email || "No email on record"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          Status
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                            statusTone
                          )}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          Updated
                        </p>
                        <p>{formatDate(manuscript.updatedAt)}</p>
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
                    {manuscript.contentUrl ? (
                      <Button asChild className="mt-4 rounded-full bg-slate-900">
                        <a
                          href={manuscript.contentUrl}
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
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send to reviewer"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Manuscript details are not available.
              </p>
            )}

            {actionError ? (
              <p className="text-sm font-semibold text-rose-600">{actionError}</p>
            ) : null}
            {actionNotice ? (
              <p className="text-sm font-semibold text-emerald-600">
                {actionNotice}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
