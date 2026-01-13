'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VideoTutorialsPage() {
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
                Video tutorials
              </h1>
              <p className="text-sm text-slate-600 md:text-base">
                Short walkthroughs for submission, revisions, and status tracking.
              </p>
            </div>
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
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 pb-16">
        <Card className="border-slate-200/70 bg-white/85">
          <CardHeader className="border-b border-slate-200/70">
            <CardTitle className="text-base">Coming soon</CardTitle>
            <p className="text-xs text-slate-500">
              We are preparing guided videos for these workflows.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <ul className="grid gap-3">
              <li>Submitting a new manuscript.</li>
              <li>Uploading revisions and response files.</li>
              <li>Tracking decisions and editorial requests.</li>
              <li>Updating author profile and availability.</li>
            </ul>
            <div>
              <Button
                variant="outline"
                asChild
                className="rounded-full border-slate-300"
              >
                <Link href="/author/about/contact">Request a tutorial</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
