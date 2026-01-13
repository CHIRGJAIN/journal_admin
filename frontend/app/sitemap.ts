import type { MetadataRoute } from "next";

const baseUrl = "https://trinixjournal.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/login",
    "/author",
    "/editor",
    "/reviewer",
    "/publisher",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: "2025-09-01",
  }));

  return staticRoutes;
}
