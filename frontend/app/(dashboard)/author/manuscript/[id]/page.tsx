'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { statusLabels, type ManuscriptStatus } from "@/lib/author-portal";
import { manuscriptService } from "@/services";
import { ApiError } from "@/lib/apiClient";

type ManuscriptDetail = {
  id: string;
  title: string;
  abstract?: string;
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

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

export default function ManuscriptDetailPage() {
  const params = useParams<{ id: string }>();
  const manuscriptId = params?.id;

  const [manuscript, setManuscript] = useState<ManuscriptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchManuscript = async () => {
      if (!manuscriptId) return;
      setLoading(true);
      setError("");

      try {
        const response = await manuscriptService.getManuscript(manuscriptId as string);
        if (response) {
          setManuscript(response);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError("Unable to load this manuscript. Please try again.");
          console.error("API Error:", err.message);
        } else {
          setError("An unexpected error occurred. Please try again.");
          console.error("Error fetching manuscript:", err);
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

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-br from-saffron-50/50 via-white to-saffron-100/40"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-4xl px-6 py-10 md:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Author portal
              </p>
              <h1 className="font-display text-3xl text-slate-900 md:text-4xl">
                Manuscript overview
              </h1>
              <p className="text-sm text-slate-600 md:text-base">
                Review the submission record, status, and manuscript file details.
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="rounded-full border-slate-300 bg-white/80"
            >
              <Link href="/author/queue?view=all">
                <ArrowLeft className="h-4 w-4" />
                Back to queue
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 pb-16">
        <Card className="border-slate-200/70 bg-white/85">
          <CardHeader className="border-b border-slate-200/70">
            <CardTitle className="text-base">Submission details</CardTitle>
            <p className="text-xs text-slate-500">
              Keep this record handy when coordinating revisions or questions.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <p className="text-sm text-slate-500">Loading manuscript details...</p>
            ) : error ? (
              <p className="text-sm text-rose-600">{error}</p>
            ) : manuscript ? (
              <>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Title
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {manuscript.title}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
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
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Submitted
                    </p>
                    <p className="text-sm text-slate-700">
                      {formatDate(manuscript.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Updated
                    </p>
                    <p className="text-sm text-slate-700">
                      {formatDate(manuscript.updatedAt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Author
                    </p>
                    <p className="text-sm text-slate-700">
                      {manuscript.author?.name || "N/A"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {manuscript.author?.email || "Not available"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Abstract
                  </p>
                  <p className="text-sm text-slate-600">
                    {manuscript.abstract || "No abstract provided yet."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {manuscript.contentUrl ? (
                    <Button asChild className="rounded-full">
                      <a
                        href={manuscript.contentUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open manuscript file
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    asChild
                    className="rounded-full border-slate-300"
                  >
                    <Link href="/author">Back to dashboard</Link>
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Manuscript details are not available.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
