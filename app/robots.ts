import type { MetadataRoute } from "next";

const SITE_URL = "https://samwestonline.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/staff/",
          "/booking/",
          "/track/",
          "/receipt/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}