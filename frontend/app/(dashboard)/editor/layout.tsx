import AuthorDashboardNav from "@/components/site/author-dashboard-nav";

export default function EditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <AuthorDashboardNav basePath="/editor" portalSubtitle="Editorial Portal" />
      <main>{children}</main>
    </div>
  );
}
