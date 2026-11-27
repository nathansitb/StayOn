import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://stay-on.app";
  return ["", "/stay", "/login", "/privacy", "/terms", "/mentions-legales"].map((p) => ({
    url: base + p,
    lastModified: new Date(),
    changeFrequency: p ? "monthly" : "weekly",
    priority: p ? 0.5 : 1,
  }));
}
