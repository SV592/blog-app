import type { Metadata } from "next";
import { JSX } from "react";
import { ThemeProvider } from "next-themes";
import { Oswald } from "next/font/google";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import { Navbar } from "./components/Navbar/Navbar";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import "./globals.css";

// Metadata for the website (used by Next.js for SEO)
export const metadata: Metadata = {
  title: "The Coding Gazette",
  description: "A coding blog by Shaquille Pearson",
};

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
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}