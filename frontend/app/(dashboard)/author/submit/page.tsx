"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Check,
  Minus,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fileToDataUrl } from "@/lib/file-utils";
import { cn } from "@/lib/utils";
import { manuscriptService } from "@/services/manuscript.service";

const steps = [
  { label: "Article Type Selection", title: "Select Article Type" },
  { label: "Attach Files", title: "Attach Files" },
  { label: "Comments", title: "Comments" },
  { label: "Manuscript Data", title: "Manuscript Data" },
];

const articleTypes = [
  "None",
  "Full Length Article",
  "Editorial",
  "Review Article",
];

const itemTypes = [
  { value: "Title Page with Author Information", required: true },
  { value: "Manuscript WITHOUT Author Identifiers", required: true },
  { value: "Declaration of Interest Statement", required: true },
  { value: "Cover Letter" },
  { value: "LaTeX source files" },
  { value: "Word source files" },
  { value: "Figure" },
  { value: "Table" },
  { value: "Highlights (for review)" },
  { value: "Video" },
  { value: "Video Still" },
  { value: "Graphical Abstract (for review)" },
  { value: "Research Data" },
  { value: "Co-submission to Data in Brief" },
  { value: "Co-submission to MethodsX" },
];

const requiredItemTypes = itemTypes
  .filter((item) => item.required)
  .map((item) => item.value);

const LOCAL_MANUSCRIPTS_KEY = "localManuscripts";

const readStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readLocalManuscripts = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_MANUSCRIPTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalManuscript = (entry: Record<string, unknown>) => {
  const existing = readLocalManuscripts();
  localStorage.setItem(
    LOCAL_MANUSCRIPTS_KEY,
    JSON.stringify([entry, ...existing])
  );
};

type AttachmentItem = {
  id: string;
  type: string;
  description: string;
  file: File;
  addedAt: number;
};

type ManuscriptSectionId =
  | "title"
  | "abstract"
  | "keywords"
  | "authors"
  | "funding";

const manuscriptSections: {
  id: ManuscriptSectionId;
  label: string;
  required?: boolean;
}[] = [
  { id: "title", label: "Title", required: true },
  { id: "abstract", label: "Abstract", required: true },
  { id: "keywords", label: "Keywords", required: true },
  { id: "authors", label: "Authors", required: true },
  { id: "funding", label: "Funding Information", required: true },
];

const getAllowedExtensions = (type: string) => {
  if (type === "LaTeX source files") {
    return [".tex"];
  }
  if (type === "Word source files") {
    return [".doc", ".docx"];
  }
  return [".tex", ".doc", ".docx"];
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const formatDate = (value: number) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const wrapPdfText = (value: string, maxLength = 90) => {
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let line = words[0];

  words.slice(1).forEach((word) => {
    if ((line + " " + word).length > maxLength) {
      lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`;
    }
  });

  lines.push(line);
  return lines;
};

const sanitizePdfText = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, "?");

const buildPdfBlob = (lines: string[]) => {
  const safeLines = lines.flatMap((line) =>
    wrapPdfText(sanitizePdfText(line))
  );
  const fontSize = 12;
  const lineHeight = 16;
  const startX = 50;
  const startY = 750;
  const textLines = safeLines.filter((line) => line.trim().length > 0);
  const textCommands = [
    "BT",
    `/F1 ${fontSize} Tf`,
    `${startX} ${startY} Td`,
    ...textLines.map((line, index) => {
      const escaped = line.replace(/([\\()])/g, "\\$1");
      return index === 0
        ? `(${escaped}) Tj`
        : `0 -${lineHeight} Td (${escaped}) Tj`;
    }),
    "ET",
  ].join("\n");
  const stream = `${textCommands}\n`;
  const encoder = new TextEncoder();
  const streamLength = encoder.encode(stream).length;

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}endstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  const header = "%PDF-1.4\n";
  let offset = encoder.encode(header).length;
  const offsets = objects.map((object) => {
    const current = offset;
    offset += encoder.encode(object).length;
    return current;
  });

  const xrefStart = offset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((value) => {
    xref += `${String(value).padStart(10, "0")} 00000 n \n`;
  });
  const trailer = `trailer\n<< /Size ${
    objects.length + 1
  } /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const pdf = header + objects.join("") + xref + trailer;
  return new Blob([pdf], { type: "application/pdf" });
};

export default function SubmitManuscriptPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [articleType, setArticleType] = useState("Full Length Article");
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [authors, setAuthors] = useState("");
  const [fundingInfo, setFundingInfo] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [convertedPdfUrl, setConvertedPdfUrl] = useState("");
  const [convertedPdfName, setConvertedPdfName] = useState("");
  const [convertedPdfFile, setConvertedPdfFile] = useState<File | null>(null);
  const [conversionStatus, setConversionStatus] = useState<
    "idle" | "converting" | "ready" | "error"
  >("idle");
  const [conversionError, setConversionError] = useState("");
  const [openSection, setOpenSection] =
    useState<ManuscriptSectionId>("title");
  const [comments, setComments] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const wordAttachment = useMemo(
    () =>
      attachments.find((attachment) => {
        const extension = attachment.file.name.split(".").pop()?.toLowerCase();
        return extension === "doc" || extension === "docx";
      }),
    [attachments]
  );

  const progress = useMemo(() => {
    if (steps.length <= 1) return 0;
    return (currentStep / (steps.length - 1)) * 100;
  }, [currentStep]);

  const canProceed = useMemo(() => {
    if (currentStep === 0) {
      return Boolean(articleType && articleType !== "None");
    }
    if (currentStep === 1) {
      return requiredItemTypes.every((item) =>
        attachments.some((attachment) => attachment.type === item)
      );
    }
    if (currentStep === 2) {
      return true;
    }
    return Boolean(
      title &&
        abstract &&
        keywords &&
        authors &&
        fundingInfo &&
        convertedPdfUrl
    );
  }, [
    articleType,
    attachments,
    authors,
    currentStep,
    convertedPdfUrl,
    fundingInfo,
    keywords,
    title,
    abstract,
  ]);

  const helperContent = useMemo(() => {
    if (currentStep === 0) {
      return (
        <p>Choose the Article Type of your submission from the drop-down menu.</p>
      );
    }
    if (currentStep === 1) {
      const attachedTypes = new Set(attachments.map((item) => item.type));
      return (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Required for submission:
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {requiredItemTypes.map((item) => {
                const isComplete = attachedTypes.has(item);
                return (
                  <li key={item} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        isComplete ? "bg-emerald-500" : "bg-rose-500"
                      )}
                    />
                    <span className={isComplete ? "text-emerald-700" : "text-rose-600"}>
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="text-sm text-slate-600">
            Only LaTeX and Word files are accepted for uploads.
          </div>
        </div>
      );
    }
    if (currentStep === 3) {
      return (
        <div className="space-y-3">
          <p>
            When possible these fields will be populated with information
            collected from your uploaded submission file. Steps requiring review
            will be marked with a warning icon. Please review these fields to be
            sure we found the correct information and fill in any missing details.
          </p>
          <p className="text-sm text-slate-600">
            Convert your Word submission to PDF to complete the final step.
          </p>
        </div>
      );
    }
    return <p>Add comments for the editorial office, if needed.</p>;
  }, [attachments, currentStep]);

  const allowedExtensions = useMemo(
    () => (selectedItemType ? getAllowedExtensions(selectedItemType) : []),
    [selectedItemType]
  );

  const handleFileSelection = (file: File | null) => {
    if (!file) return;
    if (!selectedItemType) {
      setAttachmentError("Select an item type before uploading a file.");
      return;
    }

    const extension = `.${file.name.split(".").pop() || ""}`.toLowerCase();
    const validExtensions = getAllowedExtensions(selectedItemType);
    if (!validExtensions.includes(extension)) {
      setAttachmentError(
        `Only ${validExtensions.join(", ")} files are allowed for ${selectedItemType}.`
      );
      return;
    }

    const newAttachment: AttachmentItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: selectedItemType,
      description: "",
      file,
      addedAt: Date.now(),
    };

    setAttachments((prev) => [...prev, newAttachment]);
    setAttachmentError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
    handleFileSelection(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const updateAttachment = (id: string, updates: Partial<AttachmentItem>) => {
    setAttachments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  useEffect(() => {
    setConvertedPdfUrl("");
    setConvertedPdfName("");
    setConvertedPdfFile(null);
    setConversionStatus("idle");
    setConversionError("");
  }, [wordAttachment?.id]);

  const handleConvertToPdf = async () => {
    setConversionError("");
    if (!wordAttachment) {
      setConversionStatus("error");
      setConversionError("Attach a Word file before converting to PDF.");
      return;
    }

    try {
      setConversionStatus("converting");
      const titleText = title.trim() || "Untitled Manuscript";
      const lines = [
        "Trinix Journal Manuscript PDF",
        `Title: ${titleText}`,
        `Authors: ${authors.trim() || "Not provided"}`,
        `Abstract: ${abstract.trim() || "Not provided"}`,
        `Keywords: ${keywords.trim() || "Not provided"}`,
        `Funding: ${fundingInfo.trim() || "Not provided"}`,
        `Source Word file: ${wordAttachment.file.name}`,
        `Generated: ${new Date().toLocaleString("en-US")}`,
      ];

      const pdfBlob = buildPdfBlob(lines);
      const baseName = wordAttachment.file.name.replace(/\.[^/.]+$/, "");
      const pdfFileName = baseName ? `${baseName}.pdf` : "manuscript.pdf";
      const pdfFile = new File([pdfBlob], pdfFileName, {
        type: "application/pdf",
      });
      const pdfUrl = await fileToDataUrl(pdfFile);
      setConvertedPdfUrl(pdfUrl);
      setConvertedPdfName(pdfFileName);
      setConvertedPdfFile(pdfFile);
      setConversionStatus("ready");
    } catch (error) {
      setConversionStatus("error");
      setConversionError("Unable to convert the file to PDF. Please try again.");
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    setSubmissionError("");

    const totalFiles = attachments.length + (convertedPdfFile ? 1 : 0);

    if (totalFiles < 3) {
      setAttachmentError("At least 3 files are required for submission.");
      setCurrentStep(1);
      return;
    }
    if (!convertedPdfUrl) {
      setConversionError("Convert your Word file to PDF before submitting.");
      return;
    }

    const keywordsArray = keywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const deriveAuthor = () => {
      const stored = readStoredUser();
      const rawName =
        stored?.name ||
        authors
          .split(/,|\n/)
          .map((part) => part.trim())
          .filter(Boolean)[0] ||
        "Author";

      const nameParts = rawName.split(/\s+/).filter(Boolean);
      const fname = nameParts[0] || "Author";
      const lname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Team";
      const middleParts = nameParts.slice(1, -1);
      const mname = middleParts.join(" ") || "-";

      const emailMatch = authors.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
      const email = stored?.email || emailMatch?.[0] || "author@example.com";

      return {
        fname,
        mname,
        lname,
        degrees: "",
        email,
        orcid: "",
        institution: "Unknown Institution",
        country: "",
        contributorRole: "Author",
      } as const;
    };

    const saveLocalSubmission = () => {
      const storedUser = readStoredUser();
      const fallbackAuthor =
        authors
          .split(/\r?\n|,/)
          .map((value) => value.trim())
          .filter(Boolean)[0] ?? "Unknown Author";
      const now = new Date().toISOString();

      writeLocalManuscript({
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim() || "Untitled Manuscript",
        abstract: abstract.trim(),
        contentUrl: convertedPdfUrl,
        status: "SUBMITTED",
        createdAt: now,
        updatedAt: now,
        author: {
          name: storedUser?.name ?? fallbackAuthor,
          email: storedUser?.email ?? "",
        },
      });

      alert("Submission saved locally and shared with the editor dashboard.");
      router.push("/author");
    };

    if (!token) {
      alert("Login required to submit to the journal. Saving a local copy instead.");
      saveLocalSubmission();
      return;
    }

    try {
      setIsSubmitting(true);
      const author = deriveAuthor();

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("abstract", abstract.trim());
      formData.append("type", articleType);
      formData.append("status", "SUBMITTED");
      formData.append("comment", comments.trim());

      keywordsArray.forEach((kw) => formData.append("keywords", kw));

      Object.entries(author).forEach(([key, value]) => {
        formData.append(`authorList.${key}`, value);
      });

      const filesForUpload = [...attachments];
      if (convertedPdfFile) {
        filesForUpload.push({
          id: `pdf-${Date.now()}`,
          type: "Converted PDF",
          description: "Auto-generated PDF from Word",
          file: convertedPdfFile,
          addedAt: Date.now(),
        });
      }

      filesForUpload.forEach((item) => {
        formData.append("files", item.file);
        formData.append("itemTitle", item.type || item.file.name);
        formData.append(
          "itemDescription",
          item.description || item.type || item.file.name
        );
      });

      await manuscriptService.submitManuscriptWithFiles(formData);
      router.push("/author");
      return;
    } catch (error) {
      setSubmissionError(
        error instanceof Error ? error.message : "Unable to submit manuscript."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const step = steps[currentStep];
  const manuscriptStatus = useMemo(
    () => ({
      title: Boolean(title.trim()),
      abstract: Boolean(abstract.trim()),
      keywords: Boolean(keywords.trim()),
      authors: Boolean(authors.trim()),
      funding: Boolean(fundingInfo.trim()),
    }),
    [abstract, authors, fundingInfo, keywords, title]
  );

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
              Author portal
            </p>
            <h1 className="font-display text-3xl text-slate-900 md:text-4xl">
              Submit new manuscript
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Start a new submission and complete each step in sequence.
            </p>
          </div>

          <div className="relative mt-10">
            <div
              className="absolute left-0 right-0 top-6 h-0.5 bg-slate-200"
              aria-hidden
            />
            <div
              className="absolute left-0 top-6 h-0.5 bg-slate-900 transition-all"
              style={{ width: `${progress}%` }}
              aria-hidden
            />
            <div className="relative grid gap-6 sm:grid-cols-4">
              {steps.map((item, index) => {
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                let icon = null;
                if (isComplete) {
                  icon = <Check className="h-5 w-5 text-white" />;
                } else if (isActive) {
                  icon = <ArrowDown className="h-5 w-5 text-white" />;
                }
                return (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-3 text-center"
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white shadow-sm",
                        isComplete && "border-emerald-500 bg-emerald-500",
                        isActive && "border-sky-600 bg-sky-600",
                        !isComplete && !isActive && "border-slate-300 text-slate-400"
                      )}
                    >
                      {icon ? icon : <span className="sr-only">{item.label}</span>}
                    </div>
                    <p
                      className={cn(
                        "text-sm font-medium leading-tight",
                        isActive ? "text-slate-900" : "text-slate-500"
                      )}
                    >
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr]">
          <div className="text-sm text-slate-600">{helperContent}</div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
                {step.title}
              </div>
              <div className="px-6 py-5">
                {currentStep === 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="article-type" className="text-sm text-slate-700">
                      Article Type
                    </Label>
                    <select
                      id="article-type"
                      value={articleType}
                      onChange={(event) => setArticleType(event.target.value)}
                      className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-300"
                    >
                      {articleTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        className="text-xs font-semibold text-saffron-700 underline underline-offset-4"
                      >
                        Insert Special Character
                      </button>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-6">
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-600">
                          Select Item Type
                        </label>
                        <select
                          value={selectedItemType}
                          onChange={(event) => {
                            setSelectedItemType(event.target.value);
                            setAttachmentError("");
                          }}
                          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm"
                        >
                          <option value="">Select Item Type</option>
                          {itemTypes.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.required ? `*${item.value}` : item.value}
                            </option>
                          ))}
                        </select>
                      </div>

                      <input
                        ref={fileInputRef}
                        id="manuscript-file"
                        type="file"
                        accept={allowedExtensions.join(",")}
                        onChange={(event) =>
                          handleFileSelection(event.target.files?.[0] ?? null)
                        }
                        className="sr-only"
                      />
                      <div className="mt-5 grid gap-6 md:grid-cols-[auto_auto_1fr] md:items-center">
                        <Label
                          htmlFor="manuscript-file"
                          className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          Browse...
                        </Label>
                        <span className="text-xs font-semibold uppercase text-slate-500">
                          or
                        </span>
                        <div
                          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white/80 px-6 py-5 text-center text-sm text-slate-600"
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                        >
                          <UploadCloud className="h-8 w-8 text-slate-400" />
                          <span className="font-semibold text-slate-700">
                            Drag & Drop
                          </span>
                          <span className="text-xs text-slate-500">
                            Files Here
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-slate-500">
                        {selectedItemType
                          ? `Accepted types: ${getAllowedExtensions(selectedItemType).join(
                              ", "
                            )}`
                          : "Select an item type to see accepted file types."}
                      </div>
                      {attachmentError ? (
                        <div className="mt-3 text-xs font-semibold text-rose-600">
                          {attachmentError}
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white/90 p-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Attached items</span>
                        <span>{attachments.length} item(s)</span>
                      </div>
                      {attachments.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">
                          No files attached yet. Select an item type and upload a
                          file to add it.
                        </p>
                      ) : (
                        <div className="mt-4 overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-200 text-slate-500">
                              <tr>
                                <th className="pb-2 pr-3 font-semibold">Order</th>
                                <th className="pb-2 pr-3 font-semibold">Item</th>
                                <th className="pb-2 pr-3 font-semibold">
                                  Description
                                </th>
                                <th className="pb-2 pr-3 font-semibold">File name</th>
                                <th className="pb-2 pr-3 font-semibold">Size</th>
                                <th className="pb-2 pr-3 font-semibold">
                                  Last modified
                                </th>
                                <th className="pb-2 font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="text-slate-700">
                              {attachments.map((item, index) => (
                                <tr key={item.id} className="border-b border-slate-100">
                                  <td className="py-3 pr-3">{index + 1}</td>
                                  <td className="py-3 pr-3">
                                    <select
                                      value={item.type}
                                      onChange={(event) =>
                                        updateAttachment(item.id, {
                                          type: event.target.value,
                                        })
                                      }
                                      className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
                                    >
                                      {itemTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                          {type.required
                                            ? `*${type.value}`
                                            : type.value}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="py-3 pr-3">
                                    <input
                                      value={item.description}
                                      onChange={(event) =>
                                        updateAttachment(item.id, {
                                          description: event.target.value,
                                        })
                                      }
                                      className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
                                      placeholder="Add description"
                                    />
                                  </td>
                                  <td className="py-3 pr-3">{item.file.name}</td>
                                  <td className="py-3 pr-3">
                                    {formatFileSize(item.file.size)}
                                  </td>
                                  <td className="py-3 pr-3">
                                    {formatDate(item.file.lastModified)}
                                  </td>
                                  <td className="py-3">
                                    <button
                                      type="button"
                                      onClick={() => removeAttachment(item.id)}
                                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        className="text-xs font-semibold text-saffron-700 underline underline-offset-4"
                      >
                        Insert Special Character
                      </button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comments" className="text-sm text-slate-700">
                        Comments (optional)
                      </Label>
                      <Textarea
                        id="comments"
                        value={comments}
                        onChange={(event) => setComments(event.target.value)}
                        placeholder="Share comments or requests for the editor."
                        className="min-h-28"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        className="text-xs font-semibold text-saffron-700 underline underline-offset-4"
                      >
                        Insert Special Character
                      </button>
                    </div>
                    <div className="space-y-3">
                      {manuscriptSections.map((section) => {
                        const isOpen = openSection === section.id;
                        const isComplete = manuscriptStatus[section.id];
                        const showWarning = section.required && !isComplete;

                        return (
                          <div
                            key={section.id}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() => setOpenSection(section.id)}
                              className={cn(
                                "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition",
                                isOpen
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              )}
                              aria-expanded={isOpen}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-full border",
                                    isOpen
                                      ? "border-white/30 bg-white/10 text-white"
                                      : "border-slate-300 bg-white text-slate-700"
                                  )}
                                >
                                  {isOpen ? (
                                    <Minus className="h-3 w-3" />
                                  ) : (
                                    <Plus className="h-3 w-3" />
                                  )}
                                </span>
                                {section.label}
                              </span>
                              {showWarning ? (
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                              ) : null}
                            </button>

                            {isOpen && (
                              <div className="space-y-4 px-6 py-4">
                                {section.id === "title" && (
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="title"
                                      className="text-sm text-slate-700"
                                    >
                                      Full Title (required){" "}
                                      <span className="text-rose-500">*</span>
                                    </Label>
                                    <Textarea
                                      id="title"
                                      value={title}
                                      onChange={(event) =>
                                        setTitle(event.target.value)
                                      }
                                      required
                                      className="min-h-24"
                                    />
                                  </div>
                                )}

                                {section.id === "abstract" && (
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="abstract"
                                      className="text-sm text-slate-700"
                                    >
                                      Abstract (required){" "}
                                      <span className="text-rose-500">*</span>
                                    </Label>
                                    <Textarea
                                      id="abstract"
                                      value={abstract}
                                      onChange={(event) =>
                                        setAbstract(event.target.value)
                                      }
                                      required
                                      className="min-h-32"
                                    />
                                  </div>
                                )}

                                {section.id === "keywords" && (
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="keywords"
                                      className="text-sm text-slate-700"
                                    >
                                      Keywords (required){" "}
                                      <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                      id="keywords"
                                      value={keywords}
                                      onChange={(event) =>
                                        setKeywords(event.target.value)
                                      }
                                      placeholder="Enter keywords separated by commas"
                                      required
                                    />
                                  </div>
                                )}

                                {section.id === "authors" && (
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="authors"
                                      className="text-sm text-slate-700"
                                    >
                                      Authors (required){" "}
                                      <span className="text-rose-500">*</span>
                                    </Label>
                                    <Textarea
                                      id="authors"
                                      value={authors}
                                      onChange={(event) =>
                                        setAuthors(event.target.value)
                                      }
                                      placeholder="List all authors with emails and affiliations."
                                      required
                                      className="min-h-24"
                                    />
                                  </div>
                                )}

                                {section.id === "funding" && (
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor="funding"
                                      className="text-sm text-slate-700"
                                    >
                                      Funding Information (required){" "}
                                      <span className="text-rose-500">*</span>
                                    </Label>
                                    <Textarea
                                      id="funding"
                                      value={fundingInfo}
                                      onChange={(event) =>
                                        setFundingInfo(event.target.value)
                                      }
                                      placeholder="Provide funding sources and grant numbers."
                                      required
                                      className="min-h-24"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white/90 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">
                            Convert Word to PDF
                          </p>
                          <p className="text-xs text-slate-500">
                            The PDF version is routed to the editorial team for
                            format checks.
                          </p>
                        </div>
                        <Button
                          type="button"
                          className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
                          onClick={handleConvertToPdf}
                          disabled={!wordAttachment || conversionStatus === "converting"}
                        >
                          {conversionStatus === "converting"
                            ? "Converting..."
                            : "Convert to PDF"}
                        </Button>
                      </div>
                      <div className="mt-3 space-y-2 text-xs text-slate-600">
                        <p>
                          Source file:{" "}
                          {wordAttachment
                            ? wordAttachment.file.name
                            : "No Word file attached yet."}
                        </p>
                        {convertedPdfUrl ? (
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                              <Check className="h-3 w-3" />
                              Converted: {convertedPdfName}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="rounded-full border-slate-300"
                            >
                              <a href={convertedPdfUrl} target="_blank" rel="noreferrer">
                                Preview PDF
                              </a>
                            </Button>
                          </div>
                        ) : null}
                      </div>
                      {conversionError ? (
                        <p className="mt-2 text-xs font-semibold text-rose-600">
                          {conversionError}
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-300 sm:mr-auto"
                  onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                >
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  className="rounded-full bg-saffron-500 text-slate-900 hover:bg-saffron-400"
                  onClick={() =>
                    setCurrentStep((prev) =>
                      Math.min(prev + 1, steps.length - 1)
                    )
                  }
                  // disabled={!canProceed}
                >
                  Proceed
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="rounded-full bg-saffron-500 text-slate-900 hover:bg-saffron-400"
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit manuscript"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            {submissionError ? (
              <p className="text-sm font-semibold text-rose-600">{submissionError}</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
