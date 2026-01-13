import AuthorDashboardNav from "@/components/site/author-dashboard-nav";

export default function PublisherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <AuthorDashboardNav basePath="/publisher" portalSubtitle="Publisher Portal" />
      <main>{children}</main>
    </div>
  );
}
