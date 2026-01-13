'use client';

import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ContactPayload = {
  name: string;
  email: string;
  phone: string;
};

type UnavailablePayload = {
  ranges: string;
  note: string;
};

const CONTACT_STORAGE_KEY = "authorAlternateContact";
const UNAVAILABLE_STORAGE_KEY = "authorUnavailableDates";

export default function AuthorSettingsPage() {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactNotice, setContactNotice] = useState("");

  const [unavailableRanges, setUnavailableRanges] = useState("");
  const [unavailableNote, setUnavailableNote] = useState("");
  const [unavailableNotice, setUnavailableNotice] = useState("");

  useEffect(() => {
    // Fetch user profile from API
    authService.getProfile().then((profile) => {
      setContactName(profile.name || "");
      setContactEmail(profile.email || "");
      // Optionally set phone if available in profile
      // setContactPhone(profile.phone || "");
    });

    // Fallback: load local unavailable info
    const savedUnavailable = localStorage.getItem(UNAVAILABLE_STORAGE_KEY);
    if (savedUnavailable) {
      try {
        const parsed = JSON.parse(savedUnavailable) as UnavailablePayload;
        setUnavailableRanges(parsed.ranges || "");
        setUnavailableNote(parsed.note || "");
      } catch {
        setUnavailableRanges("");
      }
    }
  }, []);

  const handleContactSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: ContactPayload = {
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
    };
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(payload));
    setContactNotice("Alternate contact information saved locally.");
  };

  const handleUnavailableSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: UnavailablePayload = {
      ranges: unavailableRanges,
      note: unavailableNote,
    };
    localStorage.setItem(UNAVAILABLE_STORAGE_KEY, JSON.stringify(payload));
    setUnavailableNotice("Unavailable dates saved locally.");
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
                Author settings
              </h1>
              <p className="text-sm text-slate-600 md:text-base">
                Manage alternate contact details and let the editorial office know
                when you are unavailable.
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
        <div className="space-y-8">
          <Card
            id="alternate-contact"
            className="border-slate-200/70 bg-white/85"
          >
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-saffron-600" />
                Alternate Contact Information
              </CardTitle>
              <p className="text-xs text-slate-500">
                Add a backup contact so the editorial office can reach you.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Contact name</Label>
                    <Input
                      id="contact-name"
                      value={contactName}
                      onChange={(event) => setContactName(event.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(event) => setContactEmail(event.target.value)}
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">Contact phone</Label>
                    <Input
                      id="contact-phone"
                      value={contactPhone}
                      onChange={(event) => setContactPhone(event.target.value)}
                      placeholder="+91 00000 00000"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" className="rounded-full">
                    Save alternate contact
                  </Button>
                  {contactNotice ? (
                    <span className="text-xs text-slate-500">{contactNotice}</span>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card
            id="unavailable-dates"
            className="border-slate-200/70 bg-white/85"
          >
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-saffron-600" />
                Unavailable Dates
              </CardTitle>
              <p className="text-xs text-slate-500">
                Share blackout dates to help us schedule revision windows.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUnavailableSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unavailable-ranges">Date ranges</Label>
                  <Textarea
                    id="unavailable-ranges"
                    value={unavailableRanges}
                    onChange={(event) => setUnavailableRanges(event.target.value)}
                    placeholder="Example: 2026-02-10 to 2026-02-20"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unavailable-note">Notes</Label>
                  <Textarea
                    id="unavailable-note"
                    value={unavailableNote}
                    onChange={(event) => setUnavailableNote(event.target.value)}
                    placeholder="Optional notes for the editorial office."
                    rows={3}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" className="rounded-full">
                    Save unavailable dates
                  </Button>
                  {unavailableNotice ? (
                    <span className="text-xs text-slate-500">
                      {unavailableNotice}
                    </span>
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
