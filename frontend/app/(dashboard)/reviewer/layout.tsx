import AuthorDashboardNav from "@/components/site/author-dashboard-nav";

export default function ReviewerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <AuthorDashboardNav basePath="/reviewer" portalSubtitle="Reviewer Portal" />
      <main>{children}</main>
    </div>
  );
}
