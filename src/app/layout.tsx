import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Oswald } from "next/font/google";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import Navbar from "./components/NavBar/Navbar";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import "./globals.css";


export const metadata: Metadata = {
  title: "A Coding Blog Website",
  description: "A fun way to shares my experiences as a software engineer.",
};

const oswald = Oswald({
  subsets: ['cyrillic'],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oswald.className}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="transition-colors duration-300 ease-in-out mx-20">
        {/* persists theme preferences across sessions */}
        <ThemeProvider
          attribute={"data-theme"}
          defaultTheme="myLightTheme"
          enableSystem
          themes={["myLightTheme", "myDarkTheme"]}
        >
          <Navbar />
          <Header />
          {children}
          <ThemeToggle />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
