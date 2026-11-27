import type { MetadataRoute } from "next";

const PRIVATE = ["/agency", "/admin", "/hub", "/api", "/a/", "/reset-password"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // Search and AI assistants explicitly welcome on the public pages
      { userAgent: ["Googlebot", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot"], allow: "/", disallow: PRIVATE },
    ],
    sitemap: "https://stay-on.app/sitemap.xml",
    host: "https://stay-on.app",
  };
}
