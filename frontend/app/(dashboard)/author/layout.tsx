import AuthorDashboardNav from "@/components/site/author-dashboard-nav";

export default function AuthorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <AuthorDashboardNav />
      <main>{children}</main>
    </div>
  );
}
