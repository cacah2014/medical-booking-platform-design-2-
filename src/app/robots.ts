import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/profile", "/auth", "/api"],
      },
    ],
    sitemap: "https://nobatesalamat.ir/sitemap.xml",
  };
}
