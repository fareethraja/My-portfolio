import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display, Orbitron, Cormorant_Garamond, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { ClientSiteChrome } from "@/components/navigation/client-site-chrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  preload: false,
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  preload: false,
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf8fc",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fareeth.vercel.app"),
  title: {
    default: "Fareeth Raja | Product Manager · AI Products & Developer Tools",
    template: "%s | Fareeth Raja",
  },
  description:
    "Fareeth Raja is a Product Manager Trainee at Kumaran Systems, focused on AI product discovery, developer tools, user journeys, and product strategy, with prior fintech product experience.",
  keywords: [
    "Fareeth Raja",
    "Fareeth Raja Portfolio",
    "Fareeth Raja Product Manager",
    "Fareeth Raja AI",
    "Fareeth Raja Finverse",
    "Fareeth",
    "Raja Fareeth",
    "Product Manager Fareeth Raja",
    "AI Product Manager Fareeth Raja",
    "FinTech Product Manager",
    "Fareeth Raja Projects",
    "Product Manager",
    "Product Management",
    "AI Product Discovery",
    "Developer Experience",
    "Product Strategy",
    "Kumaran Systems",
    "FinTech",
    "AI Products",
    "Trading Tools",
    "Finverse",
    "Portfolio",
    "SmartSlot",
    "RoomSpace",
  ],
  authors: [{ name: "Fareeth Raja", url: "https://fareeth.vercel.app" }],
  creator: "Fareeth Raja",
  publisher: "Fareeth Raja",
  verification: {
    google: "OOUnZPRjy-j-x9lR5xvB8FliXjQlQpPQdLfDhmKO5G0",
  },
  alternates: {
    canonical: "https://fareeth.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fareeth.vercel.app",
    title: "Fareeth Raja | Product Manager · AI Products & Developer Tools",
    description:
      "AI product discovery, developer-tool evaluation, and practical product case studies by Fareeth Raja, Product Manager Trainee at Kumaran Systems.",
    siteName: "Fareeth Raja Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fareeth Raja | Product Manager · AI Products & Developer Tools",
    description:
      "Explore Fareeth Raja's work in AI product discovery, developer tools, feature prioritization, and user-centered products.",
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
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${orbitron.variable} ${cormorant.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                "@id": "https://fareeth.vercel.app/#person",
                name: "Fareeth Raja",
                givenName: "Fareeth",
                familyName: "Raja",
                alternateName: ["Fareeth", "Raja Fareeth", "F. Raja"],
                url: "https://fareeth.vercel.app",
                image: "https://fareeth.vercel.app/images/fareeth-v8.png",
                mainEntityOfPage: {
                  "@id": "https://fareeth.vercel.app/#profilepage",
                },
                sameAs: [
                  "https://www.linkedin.com/in/fareethraja/",
                  "https://github.com/fareethraja",
                ],
                jobTitle: "Product Manager Trainee",
                worksFor: {
                  "@type": "Organization",
                  name: "Kumaran Systems",
                },
                knowsAbout: [
                  "Product Management",
                  "AI Product Discovery",
                  "Developer Experience",
                  "Feature Prioritization",
                  "AI Automation",
                  "FinTech Products",
                  "Trading Tools",
                  "Payments",
                  "Digital Products",
                  "React",
                  "Next.js",
                  "TypeScript",
                  "Go",
                  "MySQL",
                ],
                description:
                  "Fareeth Raja is a Product Manager Trainee at Kumaran Systems contributing to AI discovery, developer-tool evaluation, user journeys, and ecosystem positioning.",
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": "https://fareeth.vercel.app/#website",
                url: "https://fareeth.vercel.app",
                name: "Fareeth Raja Portfolio",
                description: "Official portfolio website of Fareeth Raja",
                publisher: {
                  "@id": "https://fareeth.vercel.app/#person"
                },
                inLanguage: "en-US",
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ProfilePage",
                "@id": "https://fareeth.vercel.app/#profilepage",
                url: "https://fareeth.vercel.app",
                name: "Fareeth Raja | Product Manager Portfolio",
                description:
                  "The official portfolio of Fareeth Raja, an emerging AI Product Manager with experience in enterprise AI discovery, developer tools, and fintech products.",
                mainEntity: {
                  "@id": "https://fareeth.vercel.app/#person",
                },
                isPartOf: {
                  "@id": "https://fareeth.vercel.app/#website",
                },
                inLanguage: "en-US",
              }),
            }}
          />
          <ClientSiteChrome />
          <AnalyticsTracker />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
