import type { Metadata, Viewport } from "next";
import { JSX } from "react";
import { ThemeProvider } from "next-themes";
import { Oswald } from "next/font/google";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import Navbar from "./components/Navbar/Navbar";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#EAEAEA",
};

// Metadata
export const metadata: Metadata = {
  metadataBase: new URL(process.env.BLOG_BASE_URL || "http://localhost:3000"),

  // --- Basic SEO Metadata ---
  title: {
    default: "The Programmer's Gazette - A Coding Blog by Shaquille Pearson",
    template: "%s | The Programmer's Gazette", // For dynamic titles on other pages
  },
  description:
    "Dive deep into coding concepts, innovative solutions, and technology insights. A blog by Shaquille Pearson for developers of all levels.",
  keywords: [
    "coding blog",
    "programming",
    "web development",
    "front-end",
    "back-end",
    "Next.js",
    "React",
    "JavaScript",
    "TypeScript",
    "Python",
    "C++",
    "software engineering",
    "Shaquille Pearson",
    "tech blog",
    "developer blog",
  ],
  authors: [
    {
      name: "Shaquille Pearson",
      url: "https://www.linkedin.com/in/shaquille-pearson-47bb5a208/",
    },
  ], // Professional profile
  creator: "Shaquille Pearson",
  publisher: "The Programmer's Gazette",

  // Canonical URL
  alternates: {
    canonical: "/",
  },

  // --- Open Graph Metadata ---
  openGraph: {
    title: "The Programmer's Gazette - A Coding Blog by Shaquille Pearson",
    description:
      "Dive deep into coding concepts, innovative solutions, and technology insights. A blog by Shaquille Pearson for developers of all levels.",
    siteName: "The Programmer's Gazette",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Programmer's Gazette blog cover",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // --- Robots (control search engine crawling) ---
  robots: {
    index: true, // Allow search engines to index this page
    follow: true, // Allow search engines to follow links on this page
    nocache: true, // Discourage caching by search engines (optional)
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};
// Import Oswald font from Google Fonts with Cyrillic subset
const oswald = Oswald({
  subsets: ["cyrillic"],
});

// Root layout component for the app, typed for TypeScript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    // Set language and font, suppress hydration warning for SSR/CSR mismatch
    <html lang="en" className={`${oswald.className}`} suppressHydrationWarning>
      {/* Main body with transition and margin styling */}
      <body
        suppressHydrationWarning
        className="transition-colors duration-300 ease-in-out mx-10 min-w-[260px]"
      >
        {/* ThemeProvider persists theme preferences across sessions */}
        <ThemeProvider
          attribute={"data-theme"}
          defaultTheme="myLightTheme"
          enableSystem={false}
          themes={["myLightTheme", "myDarkTheme"]}
        >
          {/* Navigation bar at the top */}
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          {/* Main header section */}
          <Header />
          {/* Main content area (children) */}
          {children}
          {/* Theme toggle button */}
          <ThemeToggle />
          {/* Footer at the bottom */}
          <Toaster />
          <Footer />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
