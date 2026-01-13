import SiteFooter from "@/components/site/site-footer";
import SiteNav from "@/components/site/site-nav";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteNav />
      <main className="min-h-[70vh]">{children}</main>
      <SiteFooter />
    </div>
  );
}
