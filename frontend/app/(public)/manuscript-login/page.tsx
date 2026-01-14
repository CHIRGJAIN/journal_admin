"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, HelpCircle, ShieldCheck, Sparkles, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roles = [
  { key: "author", label: "Author Login" },
  { key: "reviewer", label: "Reviewer Login" },
  { key: "editor", label: "Editor Login" },
  { key: "publisher", label: "Publisher Login" },
];

const assistance = [
  {
    title: "Ethics-first publishing",
    description: "COPE-aligned workflows with authorship checks and conflict disclosures.",
    icon: ShieldCheck,
  },
  {
    title: "Guided submission",
    description: "Step-by-step intake with file validation and journal policy reminders.",
    icon: Sparkles,
  },
  {
    title: "Track decisions",
    description: "Monitor peer-review status, revisions, and proofs in one place.",
    icon: BookOpen,
  },
];

export default function ManuscriptLoginPage() {
  const [remember, setRemember] = useState(true);
  const [role, setRole] = useState<typeof roles[number]["key"]>("author");
  const router = useRouter();

  const roleCopy = useMemo(() => {
    switch (role) {
      case "reviewer":
        return "Access assignments, submit reviews, and manage availability.";
      case "editor":
        return "Handle submissions, invite reviewers, and send decisions.";
      case "publisher":
        return "Oversee production workflows, schedules, and publication releases.";
      default:
        return "Submit manuscripts, upload revisions, and respond to decisions.";
    }
  }, [role]);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const roleRoutes: Record<typeof role, string> = {
      author: "/author",
      reviewer: "/reviewer",
      editor: "/editor",
      publisher: "/publisher",
    };

    router.push(roleRoutes[role] ?? "/author");
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-saffron-50/50 via-white to-white pointer-events-none" aria-hidden />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-10 space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-saffron-100 bg-white/85 shadow-md backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">Portal sign in</CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Use your journal portal credentials. Need access? Email the editorial office.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  {roles.map((item) => (
                    <Button
                      key={item.key}
                      type="button"
                      variant={role === item.key ? "default" : "outline"}
                      onClick={() => setRole(item.key)}
                      className={role === item.key
                        ? "h-10 rounded-full bg-saffron-500 text-slate-900 hover:bg-saffron-400"
                        : "h-10 rounded-full border-saffron-200 text-saffron-800 hover:bg-saffron-50"}
                    >
                      <User className="h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-slate-600">{roleCopy}</p>

                <div className="space-y-2">
                  <Label htmlFor="username">Email</Label>
                  <Input
                    id="username"
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 rounded-full border-saffron-100 focus-visible:ring-saffron-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="h-11 rounded-full border-saffron-100 focus-visible:ring-saffron-300"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 rounded border-saffron-200 text-saffron-600 focus:ring-saffron-300"
                    />
                    Keep me signed in
                  </label>
                  <a href="mailto:editor@trinixjournal.com" className="text-saffron-700 hover:text-saffron-800">
                    Forgot password?
                  </a>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-saffron-500 text-slate-900 shadow-sm hover:bg-saffron-400"
                  >
                    Continue to portal
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-full border-saffron-200 text-saffron-800 hover:bg-saffron-50"
                  >
                    Login with ORCID
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-saffron-100 bg-saffron-50/70 px-4 py-2 text-xs text-slate-600">
                  <span>New to the portal?</span>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-7 rounded-full border-saffron-200 bg-white text-saffron-800 hover:bg-saffron-50"
                  >
                    <Link href="/register">Register yourself</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <HelpCircle className="h-4 w-4" />
                  This portal is for manuscript submissions, reviewer responses, and editorial actions.
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-saffron-700">
                  <a href="mailto:editor@trinixjournal.com" className="underline underline-offset-4">Send login details</a>
                  <a href="mailto:editor@trinixjournal.com" className="underline underline-offset-4">Request access</a>
                  <a href="mailto:editor@trinixjournal.com" className="underline underline-offset-4">Login help</a>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-saffron-100 bg-saffron-50/90 px-4 py-3 text-sm text-saffron-800 shadow-sm">
              <div className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Need portal assistance?</span>
              </div>
              <Button
                variant="outline"
                asChild
                className="rounded-full border-saffron-200 bg-white text-saffron-800 hover:bg-saffron-50"
              >
                <a href="mailto:editor@trinixjournal.com">Email the editorial office</a>
              </Button>
            </div>

            <Card className="border-saffron-100 bg-white/85 shadow-md backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-slate-900">Portal highlights</CardTitle>
                <CardDescription className="text-slate-700">
                  Built for fast, ethical publishing with transparent tracking.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {assistance.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-saffron-100 bg-saffron-50/50 p-4">
                    <div className="flex items-center gap-2 text-saffron-700">
                      <item.icon className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em]">Focus</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
