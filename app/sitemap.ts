import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const routes = [
  { path: "/en", priority: 1 },
  { path: "/ar", priority: 1 },
  { path: "/en/play", priority: 0.85 },
  { path: "/ar/play", priority: 0.85 },
  { path: "/en/rules", priority: 0.65 },
  { path: "/ar/rules", priority: 0.65 },
  { path: "/en/privacy", priority: 0.3 },
  { path: "/ar/privacy", priority: 0.3 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path.endsWith("/privacy") ? "yearly" : "monthly",
    priority,
  }));
}
