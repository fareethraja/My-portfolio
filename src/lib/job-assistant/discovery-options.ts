export const INTEREST_AREAS = [
    "Understanding customer problems",
    "Building digital products",
    "Working with data and dashboards",
    "Finance, investing, and markets",
    "Marketing, brands, and growth",
    "Improving business operations",
    "Helping customers succeed",
    "Hiring, people, and workplace culture",
    "Technology, software, and systems",
    "Design and user experience",
    "Research, strategy, and consulting",
    "Sales, partnerships, and negotiation",
    "Risk, compliance, and quality",
    "Supply chain, logistics, and procurement",
    "Writing, content, and communication",
    "Sustainability and social impact",
] as const;

export const WORK_STYLE_OPTIONS = [
    "Analytical",
    "Problem solving",
    "Cross-functional",
    "Building",
    "Customer-facing",
    "Independent research",
    "Structured execution",
    "Creative",
    "Fast-paced",
    "Deep focus",
    "Detail-oriented",
    "Persuasive communication",
    "Coaching others",
    "Process ownership",
    "Experimentation",
    "Writing and documentation",
    "Negotiation",
    "Field work",
    "Team leadership",
    "Quality and accuracy",
] as const;

export const INDUSTRY_OPTIONS = [
    "Accounting and Audit",
    "Advertising and Creative Agencies",
    "Aerospace and Defence",
    "Agriculture and AgriTech",
    "AI and Machine Learning",
    "Automotive and Mobility",
    "Banking",
    "Biotechnology",
    "Capital Markets",
    "Climate Tech",
    "Cloud and Infrastructure",
    "Consulting",
    "Consumer Apps",
    "Construction and Infrastructure",
    "Creator Economy",
    "Cybersecurity",
    "E-commerce and Marketplaces",
    "Education and EdTech",
    "Energy and Utilities",
    "Enterprise Software",
    "Fashion and Lifestyle",
    "Financial Services",
    "FinTech",
    "FMCG and Consumer Goods",
    "Food and Beverage",
    "Gaming",
    "Government and Public Sector",
    "Healthcare",
    "Hospitality",
    "HR and HR Tech",
    "Insurance and InsurTech",
    "Investment Management",
    "Legal and LegalTech",
    "Logistics and Supply Chain",
    "Manufacturing",
    "Media and Entertainment",
    "Nonprofit and Social Impact",
    "Pharmaceuticals",
    "Professional Services",
    "Real Estate and PropTech",
    "Renewable Energy",
    "Retail",
    "Robotics and IoT",
    "SaaS",
    "Sports and Fitness",
    "Telecommunications",
    "Travel and Tourism",
] as const;

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function inferInterestAreas(value: string): string[] {
    const source = normalize(value);
    if (!source) return [];
    return INTEREST_AREAS.filter((area) => {
        const words = normalize(area).split(" ").filter((word) => word.length >= 4);
        return words.some((word) => source.includes(word));
    }).slice(0, 8);
}