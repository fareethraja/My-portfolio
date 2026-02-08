import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Orbitron, Cormorant_Garamond, Gravitas_One } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClientNavBar } from "@/components/ui/client-navbar";
import ProceduralGroundBackground from "@/components/ui/procedural-ground-background";
import { MouseTrail } from "@/components/ui/mouse-trail";
import { DebugButton } from "@/components/ui/debug-button";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const oswald = Gravitas_One({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: "Fareeth Raja | Product Manager & AI Strategist | Official Portfolio",
    template: "%s | Fareeth Raja",
  },
  description:
    "Official portfolio of Fareeth Raja, a Product Manager and AI Strategist. Fareeth Raja specializes in AI-driven automation, strategic product growth, and enterprise solutions. Explore Fareeth Raja's projects, skills, and expertise.",
  keywords: [
    "Fareeth Raja",
    "Fareeth Raja Portfolio",
    "Fareeth Raja Product Manager",
    "Fareeth Raja AI",
    "Fareeth",
    "Raja Fareeth",
    "Product Manager Fareeth Raja",
    "AI Strategist Fareeth Raja",
    "Fareeth Raja Developer",
    "Fareeth Raja Projects",
    "Product Manager",
    "Product Management",
    "AI Strategist",
    "Automation Expert",
    "Digital Products",
    "Portfolio",
    "React Developer",
    "Next.js Developer",
    "SmartSlot",
    "Roommate Key Tracker",
  ],
  authors: [{ name: "Fareeth Raja", url: "https://fareeth.com" }],
  creator: "Fareeth Raja",
  publisher: "Fareeth Raja",
  alternates: {
    canonical: "https://fareeth.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fareeth.com", // Replace with actual domain if known, or keep generic/env var
    title: "Fareeth Raja | Product Manager & AI Strategist",
    description:
      "Explore the portfolio of Fareeth Raja, a Product Manager building AI-powered solutions and scalable products.",
    siteName: "Fareeth Raja Portfolio",
    images: [
      {
        url: "/og-image.png", // Ensure this image exists or is added later
        width: 1200,
        height: 630,
        alt: "Fareeth Raja Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fareeth Raja | Product Manager & AI Strategist",
    description:
      "Product Manager specializing in AI, Automation, and Growth. Check out my latest work.",
    creator: "@fareeth", // Replace with actual handle if different
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${orbitron.variable} ${cormorant.variable} ${oswald.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                "@id": "https://fareeth.com/#person",
                name: "Fareeth Raja",
                givenName: "Fareeth",
                familyName: "Raja",
                alternateName: ["Fareeth", "Raja Fareeth", "F. Raja"],
                url: "https://fareeth.com",
                image: "https://fareeth.com/og-image.png",
                sameAs: [
                  "https://twitter.com/fareeeth",
                  "https://linkedin.com/in/fareeeth",
                  "https://github.com/fareeeth",
                ],
                jobTitle: "Product Manager & AI Strategist",
                worksFor: {
                  "@type": "Organization",
                  name: "Independent Consultant",
                },
                knowsAbout: [
                  "Product Management",
                  "AI Automation",
                  "Digital Products",
                  "Strategic Growth",
                  "React",
                  "Next.js",
                  "TypeScript",
                ],
                description:
                  "Fareeth Raja is a Product Manager and AI Strategist specializing in building digital products, AI-driven automation, and strategic product growth.",
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": "https://fareeth.com/#website",
                url: "https://fareeth.com",
                name: "Fareeth Raja Portfolio",
                description: "Official portfolio website of Fareeth Raja",
                publisher: {
                  "@id": "https://fareeth.com/#person"
                },
                inLanguage: "en-US",
              }),
            }}
          />
          <ProceduralGroundBackground />
          <MouseTrail />
          <AnalyticsTracker />
          {/* <DebugButton /> */}
          {children}
          <div className="hidden md:block">
            <ClientNavBar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
