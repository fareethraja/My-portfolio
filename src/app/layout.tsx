import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Fareeth Raja | Product Manager & AI Strategist",
    template: "%s | Fareeth Raja",
  },
  description:
    "Portfolio of Fareeth Raja – Product Manager specializing in AI-driven automation, strategic product growth, and enterprise solutions. Explore projects like SmartSlot, Roommate Key Tracker, and more.",
  keywords: [
    "Fareeth Raja",
    "Fareeth",
    "Product Manager",
    "Product Management",
    "AI Strategist",
    "Automation",
    "Portfolio",
    "React Developer",
    "Next.js",
    "SmartSlot",
    "Roommate Key Tracker",
  ],
  authors: [{ name: "Fareeth Raja" }],
  creator: "Fareeth Raja",
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
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}
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
                name: "Fareeth Raja",
                url: "https://fareeth.com",
                sameAs: [
                  "https://twitter.com/fareeth",
                  "https://linkedin.com/in/fareeth",
                  "https://github.com/fareeth",
                ],
                jobTitle: "Product Manager",
                worksFor: {
                  "@type": "Organization",
                  name: "Independent",
                },
                description:
                  "Product Manager specializing in AI-driven automation, strategic product growth, and enterprise solutions.",
              }),
            }}
          />
          <ProceduralGroundBackground />
          <MouseTrail />
          <AnalyticsTracker />
          {/* <DebugButton /> */}
          {children}
          <ClientNavBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
