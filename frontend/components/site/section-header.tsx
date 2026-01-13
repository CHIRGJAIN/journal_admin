import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeader({
  label,
  title,
  description,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center" && "text-center items-center",
        className
      )}
    >
      {label && (
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-saffron-500">
          <span className="inline-block h-px w-6 rounded-full bg-saffron-200" aria-hidden />
          {label}
          <span className="inline-block h-px w-6 rounded-full bg-saffron-200" aria-hidden />
        </p>
      )}
      <h2 className="font-display text-3xl text-slate-900 md:text-4xl">{title}</h2>
      {description && (
        <p className="max-w-3xl text-sm text-slate-600">{description}</p>
      )}
    </div>
  );
}
