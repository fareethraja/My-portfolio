import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://fareeth.com";
    
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/private/", "/api/", "/_next/"],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
