type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
};

export default function PageHeader({ title, description, eyebrow }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm md:p-10">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-sky-200 via-cyan-100 to-emerald-100 blur-2xl" />
      <div className="relative space-y-3">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{eyebrow}</p>
        )}
        <h1 className="font-display text-3xl text-slate-900 md:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-slate-600">{description}</p>}
      </div>
    </div>
  );
}
