import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://fareeth.vercel.app";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/private/", "/job-assistant/", "/api/"],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: ["/job-assistant/", "/api/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
