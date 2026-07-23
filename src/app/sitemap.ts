import { MetadataRoute } from "next";
import { CASE_STUDIES } from "@/lib/case-studies";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://fareeth.vercel.app";
    const lastModified = new Date();

    const caseStudyEntries: MetadataRoute.Sitemap = CASE_STUDIES.map((cs) => ({
        url: `${baseUrl}/work/${cs.slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.85,
    }));

    return [
        {
            url: baseUrl,
            lastModified,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/now`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/work`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        ...caseStudyEntries,
    ];
}
