"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  ClipboardCheck,
  ExternalLink,
  FileText,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

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
import { cn } from "@/lib/utils";
import { statusLabels, type ManuscriptStatus } from "@/lib/author-portal";
import { apiBase } from "@/lib/apiBase";
import { safeParseJson } from "@/lib/safe-json";

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

type UserRecord = {
  id: string;
  name: string;
  email: string;
  roles: string;
  status?: string;
  createdAt?: string;
};

const manuscriptStatusTones: Record<string, string> = {
  DRAFT: "border-slate-200 bg-slate-50 text-slate-600",
  SUBMITTED: "border-saffron-200 bg-saffron-50 text-saffron-700",
  UNDER_REVIEW: "border-sky-200 bg-sky-50 text-sky-700",
  REVISION_REQUESTED: "border-amber-200 bg-amber-50 text-amber-700",
  ACCEPTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  PUBLISHED: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

const userStatusTones: Record<string, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
};

const productionStatuses = new Set(["ACCEPTED"]);
const roleOptions = ["author", "reviewer", "editor", "publisher"] as const;

const normalizeManuscripts = (payload: unknown): ManuscriptRecord[] => {
  const items = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as any).data)
    ? (payload as any).data
    : [];

  return items.map((item: ManuscriptRecord) => {
    const fallbackId =
      (item as any)._id ||
      item.id ||
      (item as any).manuscriptId ||
      [item.title, item.createdAt, item.updatedAt].filter(Boolean).join("-") ||
      Math.random().toString(36).slice(2);

    return {
      ...item,
      id: fallbackId.toString(),
      status: (item.status || "").toUpperCase(),
    };
  });
};

const normalizeUsers = (payload: unknown): UserRecord[] => {
  if (Array.isArray(payload)) return payload as UserRecord[];
  if (payload && typeof payload === "object" && Array.isArray((payload as any).data)) {
    return (payload as any).data as UserRecord[];
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
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [manuscriptError, setManuscriptError] = useState("");
  const [userNotice, setUserNotice] = useState("");
  const [userError, setUserError] = useState("");

  const [activeManuscript, setActiveManuscript] =
    useState<ManuscriptRecord | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishStatus, setPublishStatus] =
    useState<"idle" | "publishing">("idle");
  const [publishError, setPublishError] = useState("");

  const loadManuscripts = async () => {
    setIsLoading(true);
    setManuscriptError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setManuscripts([]);
      setManuscriptError("Sign in again to load manuscripts.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/manuscripts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await safeParseJson(res);
      if (!res.ok) {
        setManuscriptError(
          payload?.message || "Unable to load manuscripts. Try again."
        );
        setManuscripts([]);
        return;
      }
      setManuscripts(normalizeManuscripts(payload));
    } catch {
      setManuscriptError("Unable to load manuscripts. Try again.");
      setManuscripts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    setIsUsersLoading(true);
    setUserError("");
    setUserNotice("");

    const token = localStorage.getItem("token");
    if (!token) {
      setUsers([]);
      setUserError("Sign in again to load users.");
      setIsUsersLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiBase}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await safeParseJson(res);
      if (!res.ok) {
        setUserError(payload?.message || "Unable to load users.");
        setUsers([]);
        return;
      }
      setUsers(normalizeUsers(payload));
    } catch {
      setUserError("Unable to load users.");
      setUsers([]);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    loadManuscripts();
    loadUsers();
  }, []);

  const pendingUsers = useMemo(
    () => users.filter((user) => (user.status || "PENDING") === "PENDING"),
    [users]
  );

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
        label: "Pending approvals",
        value: pendingUsers.length,
        icon: UserCheck,
      },
      {
        label: "Under review",
        value: statusCounts.UNDER_REVIEW ?? 0,
        icon: ClipboardCheck,
      },
      {
        label: "Ready to publish",
        value: statusCounts.ACCEPTED ?? 0,
        icon: BadgeCheck,
      },
    ],
    [pendingUsers.length, statusCounts]
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

  const sortedManuscripts = useMemo(() => {
    return [...manuscripts].sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [manuscripts]);

  const handleUserStatus = async (userId: string, status: string) => {
    setUserError("");
    setUserNotice("");

    const token = localStorage.getItem("token");
    if (!token) {
      setUserError("Sign in again to update users.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const payload = await safeParseJson(res);
      if (!res.ok) {
        setUserError(payload?.message || "Unable to update user status.");
        return;
      }
      const updated = payload?.data ?? payload;
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, status: updated?.status ?? status }
            : user
        )
      );
      setUserNotice("User status updated.");
    } catch {
      setUserError("Unable to update user status.");
    }
  };

  const handleUserRole = async (userId: string, roles: string) => {
    setUserError("");
    setUserNotice("");

    const token = localStorage.getItem("token");
    if (!token) {
      setUserError("Sign in again to update users.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/users/${userId}/roles`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roles }),
      });
      const payload = await safeParseJson(res);
      if (!res.ok) {
        setUserError(payload?.message || "Unable to update user role.");
        return;
      }
      const updated = payload?.data ?? payload;
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, roles: updated?.roles ?? roles } : user
        )
      );
      setUserNotice("User role updated.");
    } catch {
      setUserError("Unable to update user role.");
    }
  };

  const handleOpenPublishDialog = (manuscript: ManuscriptRecord) => {
    setActiveManuscript(manuscript);
    setPublishError("");
    setPublishStatus("idle");
    setPublishDialogOpen(true);
  };

  const handlePublish = async () => {
    if (!activeManuscript) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setPublishError("Sign in again to publish this manuscript.");
      return;
    }

    setPublishStatus("publishing");
    setPublishError("");

    try {
      const res = await fetch(
        `${apiBase}/manuscripts/${activeManuscript.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "PUBLISHED" }),
        }
      );
      const payload = await safeParseJson(res);
      if (!res.ok) {
        setPublishError(payload?.message || "Unable to publish this manuscript.");
        setPublishStatus("idle");
        return;
      }

      const updated = payload?.data ?? payload;
      const updatedAt = updated?.updatedAt ?? new Date().toISOString();
      setManuscripts((prev) =>
        prev.map((item) =>
          item.id === activeManuscript.id
            ? {
                ...item,
                status: updated?.status ?? "PUBLISHED",
                updatedAt,
                contentUrl: updated?.contentUrl ?? item.contentUrl,
              }
            : item
        )
      );
      setPublishDialogOpen(false);
    } catch {
      setPublishError("Unable to publish this manuscript.");
    } finally {
      setPublishStatus("idle");
    }
  };

  const activeStatus = typeof activeManuscript?.status === "string"
    ? activeManuscript.status.toUpperCase()
    : "UNKNOWN";
  const activeStatusLabel =
    statusLabels[activeStatus as ManuscriptStatus] ??
    (typeof activeManuscript?.status === "string" ? activeManuscript.status : undefined) ??
    "Unknown";
  const activeStatusTone =
    manuscriptStatusTones[activeStatus] ?? "border-slate-200 bg-slate-50 text-slate-600";
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
              Admin portal
            </p>
            <h1 className="font-display text-3xl text-slate-900 md:text-4xl">
              Publisher admin dashboard
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Approve users, oversee manuscripts, and manage publishing workflows.
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
        <div className="grid gap-6 lg:grid-cols-[0.34fr_0.66fr]">
          <Card className="border-slate-200/70 bg-white/80">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Admin checklist</CardTitle>
              <p className="text-xs text-slate-500">
                Keep the portal tidy and compliant.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                Review pending registrations and assign roles.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                Monitor manuscript status changes and reviewer activity.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
                Publish accepted manuscripts only after metadata checks.
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="text-base">Quick actions</CardTitle>
              <p className="text-xs text-slate-500">
                Jump to the most common admin tasks.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <Link
                href="#user-approvals"
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:border-saffron-200"
              >
                <ShieldCheck className="h-4 w-4 text-saffron-600" />
                Approve users
              </Link>
              <Link
                href="#manuscript-control"
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:border-saffron-200"
              >
                <FileText className="h-4 w-4 text-saffron-600" />
                Review status
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card id="user-approvals" className="mt-8 border-slate-200/70 bg-white/85">
          <CardHeader className="border-b border-slate-200/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Pending registrations</CardTitle>
                <p className="text-xs text-slate-500">
                  Approve or reject new users before they access the portal.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-slate-300"
                onClick={loadUsers}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                {isUsersLoading
                  ? "Loading registrations..."
                  : `${pendingUsers.length} pending approval(s).`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isUsersLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      Loading registrations...
                    </TableCell>
                  </TableRow>
                ) : pendingUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No pending registrations right now.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingUsers.map((user) => {
                    const status = (user.status || "PENDING").toUpperCase();
                    const tone =
                      userStatusTones[status] ??
                      "border-slate-200 bg-slate-50 text-slate-600";

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">{user.roles}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                              tone
                            )}
                          >
                            {status}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleUserStatus(user.id, "APPROVED")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-rose-200 text-rose-600"
                            onClick={() => handleUserStatus(user.id, "REJECTED")}
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {userNotice ? (
              <p className="mt-3 text-xs font-semibold text-emerald-600">
                {userNotice}
              </p>
            ) : null}
            {userError ? (
              <p className="mt-3 text-xs font-semibold text-rose-600">
                {userError}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="mt-8 border-slate-200/70 bg-white/85">
          <CardHeader className="border-b border-slate-200/70">
            <CardTitle className="text-base">User directory</CardTitle>
            <p className="text-xs text-slate-500">
              Update roles and approvals for existing users.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                {isUsersLoading
                  ? "Loading users..."
                  : `${users.length} user(s) in the portal.`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isUsersLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const status = (user.status || "PENDING").toUpperCase();
                    const tone =
                      userStatusTones[status] ??
                      "border-slate-200 bg-slate-50 text-slate-600";

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">
                          <select
                            value={user.roles}
                            onChange={(event) =>
                              handleUserRole(user.id, event.target.value)
                            }
                            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs"
                          >
                            {roleOptions.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                              tone
                            )}
                          >
                            {status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleUserStatus(user.id, "APPROVED")}
                          >
                            Approve
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

        <Card id="manuscript-control" className="mt-8 border-slate-200/70 bg-white/85">
          <CardHeader className="border-b border-slate-200/70">
            <CardTitle className="text-base">Manuscript control center</CardTitle>
            <p className="text-xs text-slate-500">
              Review manuscript status, open editorial reviews, and monitor the queue.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                {isLoading
                  ? "Loading manuscripts..."
                  : manuscriptError
                  ? manuscriptError
                  : `${sortedManuscripts.length} manuscript(s) tracked.`}
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
                      Loading manuscripts...
                    </TableCell>
                  </TableRow>
                ) : sortedManuscripts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No manuscripts available yet.
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
                      manuscriptStatusTones[normalized] ??
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
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            asChild
                          >
                            <Link href={`/editor/manuscript/${manuscript.id}`}>
                              Review
                            </Link>
                          </Button>
                          {manuscript.contentUrl ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              asChild
                            >
                              <a
                                href={manuscript.contentUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                PDF
                              </a>
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.33fr_0.67fr]">
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
                    : manuscriptError
                    ? manuscriptError
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
                      const normalized = typeof manuscript.status === "string"
                        ? manuscript.status.toUpperCase()
                        : "UNKNOWN";
                      const label =
                        statusLabels[normalized as ManuscriptStatus] ??
                        (typeof manuscript.status === "string" ? manuscript.status : undefined) ??
                        "Unknown";
                      const tone =
                        manuscriptStatusTones[normalized] ??
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
                                onClick={() => handleOpenPublishDialog(manuscript)}
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
                              <span className="text-xs text-slate-500">No PDF</span>
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

      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
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
