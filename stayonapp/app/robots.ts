import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/agency", "/admin", "/hub", "/api", "/a/", "/reset-password"] }],
    sitemap: "https://stay-on.app/sitemap.xml",
  };
}
