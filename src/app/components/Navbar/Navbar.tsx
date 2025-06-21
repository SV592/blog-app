import React from "react";
import Link from 'next/link'; 
import MobileNavClient from './MobileNavbar';
import { ThemeProvider } from "next-themes";

// Navigation links once here (can be moved to a utils file if preferred)
const navLinks = [
  { id: 'Featured', label: 'Featured' },
  { id: 'Playlist', label: 'Playlist' },
  { id: 'Posts', label: 'Posts' },
  { id: 'Newsletter', label: 'Newsletter' },
];

const Navbar: React.FC = () => {
  return (
    // Navigation bar container with flex layout
    <nav className="flex pt-4 mb-4 flex items-center place-content-between relative gap-4">
      {/* Blog title - this part is static and can be server-rendered */}
      <Link href="/">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">The Programmer&apos;s Gazette</h1>
      </Link>

      {/* Desktop Navigation links - static and can be server-rendered */}
      <div className="hidden sm:flex gap-2">
        {navLinks.map((link) => (
          // Use Link component for proper Next.js client-side navigation
          // We'll mimic the onClick behavior for scrolling directly on the homepage
          <Link
            key={link.id}
            href={`/#${link.id}`} // Link to the section ID on the homepage
            className="nav-links cursor-pointer"
            // The scroll behavior will now be handled by the client-side router
            // if navigating to another page, or by browser default if on same page.
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Interactive Mobile Nav and Theme Toggle - These must be Client Components */}
      <div className="flex block sm:hidden  items-center gap-2">        
        {/* Render the MobileNavClient for the hamburger menu and its logic */}
        <ThemeProvider>
          <MobileNavClient navLinks={navLinks} />
        </ThemeProvider>
      </div>
    </nav>
  );
};

export default Navbar;