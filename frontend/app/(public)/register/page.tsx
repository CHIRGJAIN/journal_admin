"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, ShieldCheck, Sparkles, User } from "lucide-react";

import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roles = [
  { key: "author", label: "Author" },
  { key: "reviewer", label: "Reviewer" },
  { key: "editor", label: "Editor" },
  { key: "publisher", label: "Publisher" },
];

const benefits = [
  {
    title: "Role-tailored onboarding",
    description: "Choose the portal role that matches your publishing workflow.",
    icon: ShieldCheck,
  },
  {
    title: "Submission readiness",
    description: "Get access to templates, checklists, and real-time status tracking.",
    icon: BookOpen,
  },
  {
    title: "Trusted collaboration",
    description: "Ethics-aligned workflows keep author and reviewer data secure.",
    icon: Sparkles,
  },
];

type RegisterStatus = "idle" | "submitting" | "success" | "error";

export default function RegisterPage() {
  const [role, setRole] = useState<typeof roles[number]["key"]>("author");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<RegisterStatus>("idle");
  const [message, setMessage] = useState("");

  const router = useRouter();

  const roleCopy = useMemo(() => {
    switch (role) {
      case "reviewer":
        return "Create your reviewer profile to receive assignments and submit feedback.";
      case "editor":
        return "Set up editorial access for submissions, reviewers, and decisions.";
      case "publisher":
        return "Register to oversee production workflows and release schedules.";
      default:
        return "Create your author profile to submit manuscripts and track decisions.";
    }
  }, [role]);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    setMessage("");

    if (!fullName.trim() || !email.trim() || !password) {
      setStatus("error");
      setMessage("Please complete your name, email, and password to continue.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match. Please re-enter them.");
      return;
    }

    setStatus("submitting");

    try {
      const response = await authService.registerUser({
        name: fullName.trim(),
        email: email.trim(),
        password,
        roles: role,
      });

      if (response?.token && typeof window !== "undefined") {
        localStorage.setItem("token", response.token);
      }

      setStatus("success");
      setMessage("Registration complete. Redirecting to your portal...");

      const roleRoutes: Record<typeof role, string> = {
        author: "/author",
        reviewer: "/reviewer",
        editor: "/editor",
        publisher: "/publisher",
      };

      setTimeout(() => {
        router.push(roleRoutes[role] ?? "/login");
      }, 900);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Registration failed. Please try again.";
      setStatus("error");
      setMessage(errorMessage);
    }
  };

  const isSubmitting = status === "submitting";
  const noticeStyles = status === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-saffron-50/50 via-white to-white pointer-events-none" aria-hidden />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-10 space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-saffron-100 bg-white/85 shadow-md backdrop-blur">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <CardTitle className="text-xl text-slate-900">Create your portal account</CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Pick a role and share your details to start onboarding.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full border-saffron-200 bg-white text-saffron-800 hover:bg-saffron-50"
                >
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-5">
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
                  <Label htmlFor="full-name">Full name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    className="h-11 rounded-full border-saffron-100 focus-visible:ring-saffron-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-11 rounded-full border-saffron-100 focus-visible:ring-saffron-300"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Create a password"
                      className="h-11 rounded-full border-saffron-100 focus-visible:ring-saffron-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter password"
                      className="h-11 rounded-full border-saffron-100 focus-visible:ring-saffron-300"
                    />
                  </div>
                </div>

                {message ? (
                  <div className={`rounded-2xl border px-4 py-3 text-xs ${noticeStyles}`}>
                    {message}
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-saffron-500 text-slate-900 shadow-sm hover:bg-saffron-400"
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="w-full rounded-full border-saffron-200 text-saffron-800 hover:bg-saffron-50"
                  >
                    <Link href="/login">Sign in instead</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="h-4 w-4" />
                  Your role helps us tailor portal access and onboarding resources.
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-saffron-100 bg-saffron-50/90 px-4 py-3 text-sm text-saffron-800 shadow-sm">
              <div className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Need help with registration?</span>
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
                <CardTitle className="text-slate-900">Why register</CardTitle>
                <CardDescription className="text-slate-700">
                  Join the portal to manage manuscripts, reviews, and editorial workflows.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {benefits.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-saffron-100 bg-saffron-50/50 p-4">
                    <div className="flex items-center gap-2 text-saffron-700">
                      <item.icon className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.2em]">Benefit</span>
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
