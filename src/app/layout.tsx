import type { Metadata } from "next";
import { JSX } from "react";
import { ThemeProvider } from "next-themes";
import { Oswald } from "next/font/google";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import { Navbar } from "./components/Navbar/Navbar";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { Toaster } from "react-hot-toast";
import "./globals.css";

// Metadata for the website (used by Next.js for SEO)
export const metadata: Metadata = {
  // --- Basic SEO Metadata ---
  title: {
    default: "The Programmer's Gazette - A Coding Blog by Shaquille Pearson",
    template: "%s | The Programmer's Gazette", // For dynamic titles on other pages
  },
  description: "Dive deep into coding concepts, innovative solutions, and technology insights. A blog by Shaquille Pearson for developers of all levels.",
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
  authors: [{ name: "Shaquille Pearson", url: "https://www.linkedin.com/in/shaquille-pearson-47bb5a208/" }], // Link to your professional profile
  creator: "Shaquille Pearson", // Your name
  publisher: "The Programmer's Gazette", // Your blog's name

  // --- Canonical URL (important for SEO to prevent duplicate content issues) ---
  alternates: {
    canonical: '/', // For the homepage, use '/'
  },

  // --- Viewport and Format Detection ---
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // --- Open Graph Metadata (for Facebook, LinkedIn, etc.) ---
  openGraph: {
    title: "The Programmer's Gazette - A Coding Blog by Shaquille Pearson",
    description: "Dive deep into coding concepts, innovative solutions, and technology insights. A blog by Shaquille Pearson for developers of all levels.",
    // url: BASE_URL, // The canonical URL of the page
    siteName: "The Programmer's Gazette",
    images: [
      {
        url: '/og-image.jpg', // Provide the correct path or URL to your Open Graph image
        width: 1200,
        height: 630,
        alt: 'The Programmer\'s Gazette blog cover',
      },
    ],
    locale: 'en_US',
    type: 'website', // Use 'article' for blog posts
  },

  // --- Icons (Favicons) ---
  // icons: {
  //   icon: '/favicon.ico', // Standard favicon
  //   shortcut: '/shortcut-icon.png', // Optional, for older browsers
  //   apple: '/apple-touch-icon.png', // For Apple devices
  //   other: [
  //     {
  //       rel: 'apple-touch-icon-precomposed',
  //       url: '/apple-touch-icon-precomposed.png',
  //     },
  //   ],
  // },

  // --- Robots (control search engine crawling) ---
  robots: {
    index: true, // Allow search engines to index this page
    follow: true, // Allow search engines to follow links on this page
    nocache: true, // Discourage caching by search engines (optional)
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },

  // --- Theme Color (for browser UI elements) ---
  themeColor: '#EAEAEA', // Or your primary brand color

}
// Import Oswald font from Google Fonts with Cyrillic subset
const oswald = Oswald({
  subsets: ['cyrillic'],
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
      <body suppressHydrationWarning className="transition-colors duration-300 ease-in-out mx-10 min-w-[290px]">
        {/* ThemeProvider persists theme preferences across sessions */}
        <ThemeProvider
          attribute={"data-theme"}
          defaultTheme="myLightTheme"
          enableSystem
          themes={["myLightTheme", "myDarkTheme"]}
        >
          {/* Navigation bar at the top */}
          <Navbar />
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
      </body>
    </html>
  );
}