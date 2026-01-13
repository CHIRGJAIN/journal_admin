export const statusLabels = {
  DRAFT: "Incomplete submission",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  REVISION_REQUESTED: "Revision requested",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
} as const;

export type ManuscriptStatus = keyof typeof statusLabels;

export const queueViews = {
  all: {
    label: "All Manuscripts",
    description: "Every manuscript currently tied to your account.",
    statuses: [] as ManuscriptStatus[],
  },
  "sent-back": {
    label: "Submissions Sent Back to Author",
    description: "Items returned for author action or clarification.",
    statuses: ["REVISION_REQUESTED"],
  },
  incomplete: {
    label: "Incomplete Submissions",
    description: "Drafts that still need files, metadata, or confirmation.",
    statuses: ["DRAFT"],
  },
  "awaiting-approval": {
    label: "Submissions Waiting for Author's Approval",
    description: "Submissions awaiting author confirmation before routing.",
    statuses: ["SUBMITTED"],
  },
  processing: {
    label: "Submissions Being Processed",
    description: "Submissions in editorial checks or peer review.",
    statuses: ["UNDER_REVIEW"],
  },
  "needs-revision": {
    label: "Submissions Needing Revision",
    description: "Revisions requested by editors or reviewers.",
    statuses: ["REVISION_REQUESTED"],
  },
  "revision-awaiting-approval": {
    label: "Revisions Waiting for Author's Approval",
    description: "Revised files awaiting final author sign-off.",
    statuses: ["ACCEPTED"],
  },
  "revision-processing": {
    label: "Revisions Being Processed",
    description: "Revisions in editorial checks or review.",
    statuses: ["UNDER_REVIEW"],
  },
  "revision-declined": {
    label: "Declined Revisions",
    description: "Revisions that were declined after review.",
    statuses: ["REJECTED"],
  },
  decisions: {
    label: "Submissions with a Decision",
    description: "Submissions with acceptance, rejection, or publication.",
    statuses: ["ACCEPTED", "REJECTED", "PUBLISHED"],
  },
} satisfies Record<
  string,
  { label: string; description: string; statuses: ManuscriptStatus[] }
>;

export type QueueViewKey = keyof typeof queueViews;

export type DashboardItem = {
  label: string;
  href: string;
  view?: QueueViewKey;
  tone?: "action";
};

export type DashboardSection = {
  title: string;
  description: string;
  items: DashboardItem[];
};

export const dashboardSections: DashboardSection[] = [
  {
    title: "New Submissions",
    description: "Start new work and monitor initial checks.",
    items: [
      {
        label: "Submit New Manuscript",
        href: "/author/submit",
        tone: "action",
      },
      {
        label: "Submissions Sent Back to Author",
        href: "/author/queue?view=sent-back",
        view: "sent-back",
      },
      {
        label: "Incomplete Submissions",
        href: "/author/queue?view=incomplete",
        view: "incomplete",
      },
      {
        label: "Submissions Waiting for Author's Approval",
        href: "/author/queue?view=awaiting-approval",
        view: "awaiting-approval",
      },
      {
        label: "Submissions Being Processed",
        href: "/author/queue?view=processing",
        view: "processing",
      },
    ],
  },
  {
    title: "Revisions",
    description: "Respond to decisions and upload updated files.",
    items: [
      {
        label: "Submissions Needing Revision",
        href: "/author/queue?view=needs-revision",
        view: "needs-revision",
      },
      {
        label: "Revisions Waiting for Author's Approval",
        href: "/author/queue?view=revision-awaiting-approval",
        view: "revision-awaiting-approval",
      },
      {
        label: "Revisions Being Processed",
        href: "/author/queue?view=revision-processing",
        view: "revision-processing",
      },
      {
        label: "Declined Revisions",
        href: "/author/queue?view=revision-declined",
        view: "revision-declined",
      },
    ],
  },
  {
    title: "Completed",
    description: "Review final outcomes and published decisions.",
    items: [
      {
        label: "Submissions with a Decision",
        href: "/author/queue?view=decisions",
        view: "decisions",
      },
    ],
  },
];
