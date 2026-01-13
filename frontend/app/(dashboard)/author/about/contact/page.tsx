'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AuthorContactPage() {
  const [notice, setNotice] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("Thanks. Your message has been saved in this session.");
  };

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
                Contact
              </h1>
              <p className="text-sm text-slate-600 md:text-base">
                Reach the editorial office without leaving the dashboard.
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
        <div className="grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Editorial office</CardTitle>
              <p className="text-xs text-slate-500">
                Use the details below to reach the journal team.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-saffron-700" />
                <div>
                  <p className="font-medium text-slate-900">Email</p>
                  <p>editorial@trinixjournal.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-saffron-700" />
                <div>
                  <p className="font-medium text-slate-900">Phone</p>
                  <p>+91 00000 00000</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Response time is typically within 1 to 2 business days.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Send a message</CardTitle>
              <p className="text-xs text-slate-500">
                Share your question and we will follow up.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input id="contact-name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    rows={4}
                    placeholder="Describe your question or issue."
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" className="rounded-full">
                    Send message
                  </Button>
                  {notice ? (
                    <span className="text-xs text-slate-500">{notice}</span>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
