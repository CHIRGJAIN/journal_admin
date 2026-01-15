"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Inbox,
  Layers,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import {
  blogService,
  contactService,
  editorialBoardService,
  issueService,
  manuscriptService,
} from "@/services";

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

type IssueRecord = {
  id: string;
  volume: number;
  issueNumber: number;
  title: string;
  description?: string;
  publicationDate?: string;
  keywords?: string[];
  status?: string;
  totalPages?: number;
  manuscripts?: any[];
  slug?: string;
};

type BlogRecord = {
  id: string;
  title: string;
  slug?: string;
  description: string[];
  category: string;
  tags?: string[];
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type BoardMemberRecord = {
  id: string;
  name: string;
  role: string;
  institution: string;
  country?: string;
  email?: string;
  bio?: string;
  expertise?: string[];
  image?: string;
  isActive?: boolean;
};

type ContactMessageRecord = {
  id: string;
  name: string;
  email: string;
  message: string;
  source?: string;
  createdAt?: string;
  isRead?: boolean;
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
const productionStatuses = new Set(["ACCEPTED", "PUBLISHED"]);

const blogDefaults = {
  title: "",
  category: "",
  description: "",
  tags: "",
  image: "",
  isActive: true,
};

const memberDefaults = {
  name: "",
  role: "",
  institution: "",
  country: "",
  email: "",
  bio: "",
  expertise: "",
  image: "",
  isActive: true,
};

const issueDefaults = {
  volume: "",
  issueNumber: "",
  title: "",
  description: "",
  keywords: "",
  publicationDate: "",
};
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

const getRecordId = (record: any) => {
  if (!record) return "";
  return (record.id || record._id || record.manuscriptId || record.issueId || "").toString();
};

const ensureId = (record: any, fallback?: string) => {
  const id = getRecordId(record);
  return id || fallback || Math.random().toString(36).slice(2);
};

const normalizeManuscripts = (items: ManuscriptRecord[]) =>
  items.map((item) => {
    const fallbackId =
      ensureId(item, [item.title, item.createdAt, item.updatedAt].filter(Boolean).join("-"));

    const files = (item as any).files;
    const contentUrl =
      item.contentUrl ??
      (Array.isArray(files) && files.length > 0
        ? files[0]?.fileUrl || files[0]?.url
        : undefined);

    const author = (item as any).author || (item as any).authorId || item.author;

    return {
      ...item,
      id: fallbackId.toString(),
      status: (item.status || "").toUpperCase(),
      contentUrl,
      author: author
        ? { name: author.name, email: author.email }
        : undefined,
    };
  });

const normalizeIssues = (items: any[]): IssueRecord[] =>
  items.map((issue) => ({
    ...issue,
    id: ensureId(issue),
    volume: Number(issue.volume) || 0,
    issueNumber: Number(issue.issueNumber) || 0,
    keywords: Array.isArray(issue.keywords) ? issue.keywords : [],
    manuscripts: Array.isArray(issue.manuscripts) ? issue.manuscripts : [],
  }));

const normalizeBlogs = (items: any[]): BlogRecord[] =>
  items.map((item) => ({
    ...item,
    id: ensureId(item),
    description: Array.isArray(item.description)
      ? item.description
      : item.description
      ? [String(item.description)]
      : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
  }));

const normalizeMembers = (items: any[]): BoardMemberRecord[] =>
  items.map((item) => ({
    ...item,
    id: ensureId(item),
    expertise: Array.isArray(item.expertise) ? item.expertise : [],
  }));

const normalizeContacts = (items: any[]): ContactMessageRecord[] =>
  items.map((item) => ({
    ...item,
    id: ensureId(item, `${item.email}-${item.createdAt}`),
  }));

const splitCommaList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const joinCommaList = (value?: string[]) =>
  value && value.length > 0 ? value.join(", ") : "";

const splitDescription = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const joinDescription = (value?: string[]) =>
  value && value.length > 0 ? value.join("\n") : "";

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

const truncateText = (value: string, length = 140) =>
  value.length > length ? `${value.slice(0, length)}...` : value;
export default function PublisherDashboard() {
  const [manuscripts, setManuscripts] = useState<ManuscriptRecord[]>([]);
  const [issues, setIssues] = useState<IssueRecord[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMemberRecord[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessageRecord[]>([]);
  const [hasToken, setHasToken] = useState(false);

  const [isLoadingManuscripts, setIsLoadingManuscripts] = useState(true);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  const [issueDraft, setIssueDraft] = useState({ ...issueDefaults });
  const [issueStatus, setIssueStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [issueNotice, setIssueNotice] = useState("");

  const [blogDraft, setBlogDraft] = useState({ ...blogDefaults });
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogStatus, setBlogStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [blogNotice, setBlogNotice] = useState("");

  const [memberDraft, setMemberDraft] = useState({ ...memberDefaults });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberStatus, setMemberStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [memberNotice, setMemberNotice] = useState("");

  const [assignmentBusyId, setAssignmentBusyId] = useState<string | null>(null);

  const [activeManuscript, setActiveManuscript] = useState<ManuscriptRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing">("idle");
  const [publishError, setPublishError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    setHasToken(Boolean(token));

    const fetchManuscripts = async () => {
      const localManuscripts = readLocalManuscripts();
      if (!token) {
        const normalized = normalizeManuscripts(localManuscripts);
        setManuscripts(normalized);
        setIsLoadingManuscripts(false);
        return;
      }

      try {
        const response = await manuscriptService.getAll({ page: 1, limit: 200 });
        const remoteManuscripts = normalizeManuscripts(response.data || []);
        const merged = mergeManuscripts(
          remoteManuscripts,
          normalizeManuscripts(localManuscripts)
        );
        setManuscripts(merged);
      } catch (error) {
        console.error("Error fetching manuscripts:", error);
        const normalized = normalizeManuscripts(localManuscripts);
        setManuscripts(normalized);
      } finally {
        setIsLoadingManuscripts(false);
      }
    };

    const fetchIssues = async () => {
      if (!token) {
        setIssues([]);
        setIsLoadingIssues(false);
        return;
      }

      setIsLoadingIssues(true);
      try {
        const response = await issueService.getAllIssues({ page: 1, limit: 50 });
        const normalized = normalizeIssues(response.data || []);
        setIssues(normalized);
        setSelectedIssueId((prev) => {
          if (prev && normalized.some((issue) => issue.id === prev)) {
            return prev;
          }
          return normalized[0]?.id || "";
        });
      } catch (error) {
        console.error("Error fetching issues:", error);
        setIssues([]);
      } finally {
        setIsLoadingIssues(false);
      }
    };

    const fetchBlogs = async () => {
      if (!token) {
        setBlogs([]);
        setIsLoadingBlogs(false);
        return;
      }

      setIsLoadingBlogs(true);
      try {
        const response = await blogService.getAllPosts({ limit: 50 });
        setBlogs(normalizeBlogs(response.data || []));
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setBlogs([]);
      } finally {
        setIsLoadingBlogs(false);
      }
    };

    const fetchBoardMembers = async () => {
      if (!token) {
        setBoardMembers([]);
        setIsLoadingBoard(false);
        return;
      }

      setIsLoadingBoard(true);
      try {
        const response = await editorialBoardService.getAllMembers({ limit: 80 });
        setBoardMembers(normalizeMembers(response.data || []));
      } catch (error) {
        console.error("Error fetching board members:", error);
        setBoardMembers([]);
      } finally {
        setIsLoadingBoard(false);
      }
    };

    const fetchContacts = async () => {
      if (!token) {
        setContactMessages([]);
        setIsLoadingContacts(false);
        return;
      }

      setIsLoadingContacts(true);
      try {
        const response = await contactService.getMessages({ page: 1, limit: 10 });
        setContactMessages(normalizeContacts(response.data || []));
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setContactMessages([]);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    fetchManuscripts();
    fetchIssues();
    fetchBlogs();
    fetchBoardMembers();
    fetchContacts();
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
        label: "Ready for production",
        value: statusCounts.ACCEPTED ?? 0,
        icon: ClipboardCheck,
      },
      {
        label: "Published",
        value: statusCounts.PUBLISHED ?? 0,
        icon: BadgeCheck,
      },
      {
        label: "In production",
        value: (statusCounts.ACCEPTED ?? 0) + (statusCounts.PUBLISHED ?? 0),
        icon: FileText,
      },
    ],
    [statusCounts]
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

  const acceptedManuscripts = useMemo(
    () =>
      manuscripts.filter(
        (manuscript) => manuscript.status?.toUpperCase() === "ACCEPTED"
      ),
    [manuscripts]
  );

  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedIssueId) ?? null,
    [issues, selectedIssueId]
  );

  const assignedManuscripts = useMemo(() => {
    if (!selectedIssue || !selectedIssue.manuscripts) return [];
    return selectedIssue.manuscripts.map((manuscript: any) => ({
      id: ensureId(manuscript),
      title: manuscript.title || "Untitled manuscript",
      status: manuscript.status,
    }));
  }, [selectedIssue]);

  const assignedIds = useMemo(
    () => new Set(assignedManuscripts.map((item) => item.id)),
    [assignedManuscripts]
  );

  const availableManuscripts = useMemo(
    () => acceptedManuscripts.filter((item) => !assignedIds.has(item.id)),
    [acceptedManuscripts, assignedIds]
  );

  const resetDialogState = () => {
    setPublishError("");
    setPublishStatus("idle");
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

  const handlePublish = async () => {
    if (!activeManuscript) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setPublishError("Sign in again to continue.");
      return;
    }

    setPublishStatus("publishing");
    setPublishError("");

    try {
      await manuscriptService.updateManuscriptStatus(
        activeManuscript.id,
        "PUBLISHED"
      );

      setManuscripts((prev) =>
        prev.map((item) =>
          item.id === activeManuscript.id ? { ...item, status: "PUBLISHED" } : item
        )
      );
      setDialogOpen(false);
    } catch (error) {
      console.error("Error publishing manuscript:", error);
      setPublishError("Unable to publish the manuscript. Try again.");
    } finally {
      setPublishStatus("idle");
    }
  };

  const handleIssueSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (issueStatus === "saving") return;

    setIssueNotice("");
    const volume = Number(issueDraft.volume);
    const issueNumber = Number(issueDraft.issueNumber);

    if (!volume || !issueNumber || !issueDraft.title.trim()) {
      setIssueStatus("error");
      setIssueNotice("Volume, issue number, and title are required.");
      return;
    }

    setIssueStatus("saving");
    try {
      await issueService.createIssue({
        volume,
        issueNumber,
        title: issueDraft.title.trim(),
        description: issueDraft.description.trim() || undefined,
        publicationDate: issueDraft.publicationDate || undefined,
        keywords: splitCommaList(issueDraft.keywords),
      });
      setIssueStatus("success");
      setIssueNotice("Issue created successfully.");
      setIssueDraft({ ...issueDefaults });
      const response = await issueService.getAllIssues({ page: 1, limit: 50 });
      const normalized = normalizeIssues(response.data || []);
      setIssues(normalized);
      setSelectedIssueId(normalized[0]?.id || "");
    } catch (error) {
      console.error("Error creating issue:", error);
      setIssueStatus("error");
      setIssueNotice("Unable to create issue. Please try again.");
    }
  };

  const handleAssignManuscript = async (manuscriptId: string) => {
    if (!selectedIssueId) return;
    setAssignmentBusyId(manuscriptId);
    try {
      const updated = await issueService.addManuscript(selectedIssueId, manuscriptId);
      const normalized = normalizeIssues([updated])[0];
      setIssues((prev) =>
        prev.map((issue) => (issue.id === normalized.id ? normalized : issue))
      );
    } catch (error) {
      console.error("Error assigning manuscript:", error);
    } finally {
      setAssignmentBusyId(null);
    }
  };

  const handleRemoveManuscript = async (manuscriptId: string) => {
    if (!selectedIssueId) return;
    setAssignmentBusyId(manuscriptId);
    try {
      const updated = await issueService.removeManuscript(selectedIssueId, manuscriptId);
      const normalized = normalizeIssues([updated])[0];
      setIssues((prev) =>
        prev.map((issue) => (issue.id === normalized.id ? normalized : issue))
      );
    } catch (error) {
      console.error("Error removing manuscript:", error);
    } finally {
      setAssignmentBusyId(null);
    }
  };

  const handleBlogSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (blogStatus === "saving") return;
    setBlogNotice("");

    if (!blogDraft.title.trim() || !blogDraft.category.trim() || !blogDraft.description.trim()) {
      setBlogStatus("error");
      setBlogNotice("Title, category, and description are required.");
      return;
    }

    setBlogStatus("saving");
    try {
      const payload = {
        title: blogDraft.title.trim(),
        category: blogDraft.category.trim(),
        description: splitDescription(blogDraft.description),
        tags: splitCommaList(blogDraft.tags),
        image: blogDraft.image.trim() || undefined,
        isActive: blogDraft.isActive,
      };

      if (editingBlogId) {
        await blogService.updatePost(editingBlogId, payload);
        setBlogNotice("Blog updated successfully.");
      } else {
        await blogService.createPost(payload);
        setBlogNotice("Blog created successfully.");
      }

      setBlogStatus("success");
      setBlogDraft({ ...blogDefaults });
      setEditingBlogId(null);
      const response = await blogService.getAllPosts({ limit: 50 });
      setBlogs(normalizeBlogs(response.data || []));
    } catch (error) {
      console.error("Error saving blog:", error);
      setBlogStatus("error");
      setBlogNotice("Unable to save blog. Please try again.");
    }
  };

  const handleBlogEdit = (blog: BlogRecord) => {
    setEditingBlogId(blog.id);
    setBlogDraft({
      title: blog.title || "",
      category: blog.category || "",
      description: joinDescription(blog.description),
      tags: joinCommaList(blog.tags),
      image: blog.image || "",
      isActive: blog.isActive !== false,
    });
    setBlogNotice("");
    setBlogStatus("idle");
  };

  const handleBlogDelete = async (blogId: string) => {
    setBlogStatus("saving");
    setBlogNotice("");
    try {
      await blogService.deletePost(blogId);
      setBlogs((prev) => prev.filter((blog) => blog.id !== blogId));
      setBlogStatus("success");
      setBlogNotice("Blog removed.");
      if (editingBlogId === blogId) {
        setEditingBlogId(null);
        setBlogDraft({ ...blogDefaults });
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      setBlogStatus("error");
      setBlogNotice("Unable to delete blog. Please try again.");
    }
  };

  const handleMemberSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (memberStatus === "saving") return;
    setMemberNotice("");

    if (!memberDraft.name.trim() || !memberDraft.role.trim() || !memberDraft.institution.trim()) {
      setMemberStatus("error");
      setMemberNotice("Name, role, and institution are required.");
      return;
    }

    setMemberStatus("saving");
    try {
      const payload = {
        name: memberDraft.name.trim(),
        role: memberDraft.role.trim(),
        institution: memberDraft.institution.trim(),
        country: memberDraft.country.trim() || undefined,
        email: memberDraft.email.trim() || undefined,
        bio: memberDraft.bio.trim() || undefined,
        expertise: splitCommaList(memberDraft.expertise),
        image: memberDraft.image.trim() || undefined,
        isActive: memberDraft.isActive,
      };

      if (editingMemberId) {
        await editorialBoardService.updateMember(editingMemberId, payload);
        setMemberNotice("Member updated successfully.");
      } else {
        await editorialBoardService.createMember(payload);
        setMemberNotice("Member added successfully.");
      }

      setMemberStatus("success");
      setMemberDraft({ ...memberDefaults });
      setEditingMemberId(null);
      const response = await editorialBoardService.getAllMembers({ limit: 80 });
      setBoardMembers(normalizeMembers(response.data || []));
    } catch (error) {
      console.error("Error saving member:", error);
      setMemberStatus("error");
      setMemberNotice("Unable to save member. Please try again.");
    }
  };

  const handleMemberEdit = (member: BoardMemberRecord) => {
    setEditingMemberId(member.id);
    setMemberDraft({
      name: member.name || "",
      role: member.role || "",
      institution: member.institution || "",
      country: member.country || "",
      email: member.email || "",
      bio: member.bio || "",
      expertise: joinCommaList(member.expertise),
      image: member.image || "",
      isActive: member.isActive !== false,
    });
    setMemberNotice("");
    setMemberStatus("idle");
  };

  const handleMemberDelete = async (memberId: string) => {
    setMemberStatus("saving");
    setMemberNotice("");
    try {
      await editorialBoardService.deleteMember(memberId);
      setBoardMembers((prev) => prev.filter((member) => member.id !== memberId));
      setMemberStatus("success");
      setMemberNotice("Member removed.");
      if (editingMemberId === memberId) {
        setEditingMemberId(null);
        setMemberDraft({ ...memberDefaults });
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      setMemberStatus("error");
      setMemberNotice("Unable to delete member. Please try again.");
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
    statusTones[activeStatus] ?? "border-slate-200 bg-slate-50 text-slate-600";
  const canPublish = activeStatus === "ACCEPTED";

  const issueNoticeStyles = issueStatus === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-700";

  const blogNoticeStyles = blogStatus === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-700";

  const memberNoticeStyles = memberStatus === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-700";

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
              Publisher portal
            </p>
            <h1 className="font-display text-3xl text-slate-900 md:text-4xl">
              Publisher dashboard
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Run production, manage issues, and keep editorial communications centralized.
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

      <section className="mx-auto w-full max-w-6xl space-y-6 px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[0.45fr_0.55fr]">
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
              <CardTitle className="flex items-center gap-2 text-base">
                <Inbox className="h-4 w-4 text-saffron-600" />
                Contact inbox
              </CardTitle>
              <p className="text-xs text-slate-500">
                Messages submitted from the author dashboard.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {!hasToken ? (
                <p className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
                  Sign in to view contact messages.
                </p>
              ) : isLoadingContacts ? (
                <p className="text-sm text-slate-500">Loading messages...</p>
              ) : contactMessages.length === 0 ? (
                <p className="text-sm text-slate-500">No messages yet.</p>
              ) : (
                contactMessages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-600"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {message.name}
                        </p>
                        <a
                          href={`mailto:${message.email}`}
                          className="text-xs text-slate-500 hover:text-slate-700"
                        >
                          {message.email}
                        </a>
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {message.source ? `Source: ${message.source}` : "Author portal"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {truncateText(message.message)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200/70 bg-white/85">
          <CardHeader className="border-b border-slate-200/70">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-saffron-600" />
              Issue workspace
            </CardTitle>
            <p className="text-xs text-slate-500">
              Create issues and assign accepted manuscripts for publication.
            </p>
          </CardHeader>
          <CardContent>
            {!hasToken ? (
              <p className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
                Sign in to create issues and manage assignments.
              </p>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr]">
                <div className="space-y-5">
                  <form onSubmit={handleIssueSubmit} className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="issue-volume">Volume</Label>
                        <Input
                          id="issue-volume"
                          type="number"
                          value={issueDraft.volume}
                          onChange={(event) =>
                            setIssueDraft((prev) => ({
                              ...prev,
                              volume: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="issue-number">Issue number</Label>
                        <Input
                          id="issue-number"
                          type="number"
                          value={issueDraft.issueNumber}
                          onChange={(event) =>
                            setIssueDraft((prev) => ({
                              ...prev,
                              issueNumber: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issue-title">Issue title</Label>
                      <Input
                        id="issue-title"
                        value={issueDraft.title}
                        onChange={(event) =>
                          setIssueDraft((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issue-description">Description</Label>
                      <Textarea
                        id="issue-description"
                        rows={3}
                        value={issueDraft.description}
                        onChange={(event) =>
                          setIssueDraft((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issue-publication-date">Publication date</Label>
                      <Input
                        id="issue-publication-date"
                        type="date"
                        value={issueDraft.publicationDate}
                        onChange={(event) =>
                          setIssueDraft((prev) => ({
                            ...prev,
                            publicationDate: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="issue-keywords">Keywords (comma separated)</Label>
                      <Input
                        id="issue-keywords"
                        value={issueDraft.keywords}
                        onChange={(event) =>
                          setIssueDraft((prev) => ({
                            ...prev,
                            keywords: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-full"
                      disabled={issueStatus === "saving"}
                    >
                      <Plus className="h-4 w-4" />
                      {issueStatus === "saving" ? "Saving issue..." : "Create issue"}
                    </Button>
                    {issueNotice ? (
                      <div className={`rounded-2xl border px-3 py-2 text-xs ${issueNoticeStyles}`}>
                        {issueNotice}
                      </div>
                    ) : null}
                  </form>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                      <span>Issues</span>
                      <span>{issues.length}</span>
                    </div>
                    {isLoadingIssues ? (
                      <p className="text-sm text-slate-500">Loading issues...</p>
                    ) : issues.length === 0 ? (
                      <p className="text-sm text-slate-500">No issues created yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {issues.map((issue) => (
                          <button
                            key={issue.id}
                            type="button"
                            onClick={() => setSelectedIssueId(issue.id)}
                            className={cn(
                              "w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                              selectedIssueId === issue.id
                                ? "border-saffron-200 bg-saffron-50"
                                : "border-slate-200 bg-white/70 hover:border-slate-300"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-slate-900">
                                {issue.title || "Untitled issue"}
                              </p>
                              <span className="text-xs text-slate-500">
                                Vol {issue.volume} / No {issue.issueNumber}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {issue.status || "DRAFT"} / {issue.totalPages || 0} pages
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Assigned manuscripts
                      </p>
                      <span className="text-xs text-slate-500">
                        {assignedManuscripts.length}
                      </span>
                    </div>
                    {!selectedIssue ? (
                      <p className="mt-3 text-sm text-slate-500">
                        Select an issue to manage assignments.
                      </p>
                    ) : assignedManuscripts.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-500">
                        No manuscripts assigned yet.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {assignedManuscripts.map((manuscript) => (
                          <div
                            key={manuscript.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-medium text-slate-900">
                                {manuscript.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {manuscript.status || "ACCEPTED"}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => handleRemoveManuscript(manuscript.id)}
                              disabled={assignmentBusyId === manuscript.id}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Available accepted manuscripts
                      </p>
                      <span className="text-xs text-slate-500">
                        {availableManuscripts.length}
                      </span>
                    </div>
                    {availableManuscripts.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-500">
                        No accepted manuscripts available.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {availableManuscripts.map((manuscript) => (
                          <div
                            key={manuscript.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-medium text-slate-900">
                                {manuscript.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {manuscript.author?.name || "Unknown author"}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => handleAssignManuscript(manuscript.id)}
                              disabled={assignmentBusyId === manuscript.id || !selectedIssueId}
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-saffron-600" />
                Blog studio
              </CardTitle>
              <p className="text-xs text-slate-500">
                Publish journal updates and editorial notes.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {!hasToken ? (
                <p className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
                  Sign in to manage blog posts.
                </p>
              ) : (
                <>
                  <form onSubmit={handleBlogSubmit} className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="blog-title">Title</Label>
                      <Input
                        id="blog-title"
                        value={blogDraft.title}
                        onChange={(event) =>
                          setBlogDraft((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blog-category">Category</Label>
                      <Input
                        id="blog-category"
                        value={blogDraft.category}
                        onChange={(event) =>
                          setBlogDraft((prev) => ({
                            ...prev,
                            category: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blog-description">Description</Label>
                      <Textarea
                        id="blog-description"
                        rows={3}
                        value={blogDraft.description}
                        onChange={(event) =>
                          setBlogDraft((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blog-tags">Tags (comma separated)</Label>
                      <Input
                        id="blog-tags"
                        value={blogDraft.tags}
                        onChange={(event) =>
                          setBlogDraft((prev) => ({
                            ...prev,
                            tags: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blog-image">Image URL</Label>
                      <Input
                        id="blog-image"
                        value={blogDraft.image}
                        onChange={(event) =>
                          setBlogDraft((prev) => ({
                            ...prev,
                            image: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        checked={blogDraft.isActive}
                        onChange={(event) =>
                          setBlogDraft((prev) => ({
                            ...prev,
                            isActive: event.target.checked,
                          }))
                        }
                      />
                      Active
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="submit"
                        className="rounded-full"
                        disabled={blogStatus === "saving"}
                      >
                        <Plus className="h-4 w-4" />
                        {editingBlogId ? "Update blog" : "Create blog"}
                      </Button>
                      {editingBlogId ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setEditingBlogId(null);
                            setBlogDraft({ ...blogDefaults });
                            setBlogNotice("");
                            setBlogStatus("idle");
                          }}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                    {blogNotice ? (
                      <div className={`rounded-2xl border px-3 py-2 text-xs ${blogNoticeStyles}`}>
                        {blogNotice}
                      </div>
                    ) : null}
                  </form>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                      <span>Published blogs</span>
                      <span>{blogs.length}</span>
                    </div>
                    {isLoadingBlogs ? (
                      <p className="text-sm text-slate-500">Loading blog posts...</p>
                    ) : blogs.length === 0 ? (
                      <p className="text-sm text-slate-500">No blog posts created yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {blogs.map((blog) => (
                          <div
                            key={blog.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-medium text-slate-900">{blog.title}</p>
                              <p className="text-xs text-slate-500">
                                {blog.category} / {blog.isActive === false ? "Inactive" : "Active"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                onClick={() => handleBlogEdit(blog)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full text-rose-600"
                                onClick={() => handleBlogDelete(blog.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/70 bg-white/85">
            <CardHeader className="border-b border-slate-200/70">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-saffron-600" />
                Editorial board
              </CardTitle>
              <p className="text-xs text-slate-500">
                Maintain the editorial board member directory.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {!hasToken ? (
                <p className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
                  Sign in to update editorial board members.
                </p>
              ) : (
                <>
                  <form onSubmit={handleMemberSubmit} className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="member-name">Name</Label>
                        <Input
                          id="member-name"
                          value={memberDraft.name}
                          onChange={(event) =>
                            setMemberDraft((prev) => ({
                              ...prev,
                              name: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-role">Role</Label>
                        <Input
                          id="member-role"
                          value={memberDraft.role}
                          onChange={(event) =>
                            setMemberDraft((prev) => ({
                              ...prev,
                              role: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="member-institution">Institution</Label>
                      <Input
                        id="member-institution"
                        value={memberDraft.institution}
                        onChange={(event) =>
                          setMemberDraft((prev) => ({
                            ...prev,
                            institution: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="member-country">Country</Label>
                        <Input
                          id="member-country"
                          value={memberDraft.country}
                          onChange={(event) =>
                            setMemberDraft((prev) => ({
                              ...prev,
                              country: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="member-email">Email</Label>
                        <Input
                          id="member-email"
                          type="email"
                          value={memberDraft.email}
                          onChange={(event) =>
                            setMemberDraft((prev) => ({
                              ...prev,
                              email: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="member-expertise">Expertise (comma separated)</Label>
                      <Input
                        id="member-expertise"
                        value={memberDraft.expertise}
                        onChange={(event) =>
                          setMemberDraft((prev) => ({
                            ...prev,
                            expertise: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="member-image">Image URL</Label>
                      <Input
                        id="member-image"
                        value={memberDraft.image}
                        onChange={(event) =>
                          setMemberDraft((prev) => ({
                            ...prev,
                            image: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="member-bio">Bio</Label>
                      <Textarea
                        id="member-bio"
                        rows={3}
                        value={memberDraft.bio}
                        onChange={(event) =>
                          setMemberDraft((prev) => ({
                            ...prev,
                            bio: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        checked={memberDraft.isActive}
                        onChange={(event) =>
                          setMemberDraft((prev) => ({
                            ...prev,
                            isActive: event.target.checked,
                          }))
                        }
                      />
                      Active
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="submit"
                        className="rounded-full"
                        disabled={memberStatus === "saving"}
                      >
                        <Plus className="h-4 w-4" />
                        {editingMemberId ? "Update member" : "Add member"}
                      </Button>
                      {editingMemberId ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={() => {
                            setEditingMemberId(null);
                            setMemberDraft({ ...memberDefaults });
                            setMemberNotice("");
                            setMemberStatus("idle");
                          }}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                    {memberNotice ? (
                      <div className={`rounded-2xl border px-3 py-2 text-xs ${memberNoticeStyles}`}>
                        {memberNotice}
                      </div>
                    ) : null}
                  </form>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                      <span>Members</span>
                      <span>{boardMembers.length}</span>
                    </div>
                    {isLoadingBoard ? (
                      <p className="text-sm text-slate-500">Loading members...</p>
                    ) : boardMembers.length === 0 ? (
                      <p className="text-sm text-slate-500">No members listed yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {boardMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-medium text-slate-900">{member.name}</p>
                              <p className="text-xs text-slate-500">
                                {member.role} / {member.institution}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full"
                                onClick={() => handleMemberEdit(member)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full text-rose-600"
                                onClick={() => handleMemberDelete(member.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
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
                {isLoadingManuscripts
                  ? "Loading production queue..."
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
                {isLoadingManuscripts ? (
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
                          {normalized === "ACCEPTED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                              onClick={() => handleOpenDialog(manuscript)}
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
                            <span className="text-xs text-slate-500">
                              No PDF
                            </span>
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
      </section>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
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

