import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.SITE_URL || "https://petsworld.pk";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/api",
        "/api/*",
        "/checkout",
        "/checkout/*",
        "/cart",
        "/order",
        "/order/*",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
