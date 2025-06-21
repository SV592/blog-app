'use client'; 
import React, { useState } from "react";
import Link from 'next/link';

// Navigation links (can still be moved to a utils file if preferred)
const navLinks = [
  { id: 'Featured', label: 'Featured' },
  { id: 'Playlist', label: 'Playlist' },
  { id: 'Posts', label: 'Posts' },
  { id: 'Newsletter', label: 'Newsletter' },
];

const Navbar: React.FC = () => {
  // State for mobile menu visibility
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
  };

  const handleNavLinkClick = () => {
    setMenuOpen(false); // Close mobile menu on link click
    // No need for complex scroll logic here, Link will handle navigation
    // and browser's default hash scroll will occur (instant jump).
  };

  return (
    // Navigation bar container with flex layout
    <nav className="flex pt-4 mb-4 items-center place-content-between relative gap-4">
      {/* Blog title */}
      <Link href="/">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">The Programmer&apos;s Gazette</h1>
      </Link>

      {/* Desktop Navigation links (hidden on small screens) */}
      <div className="hidden sm:flex gap-2">
        {navLinks.map((link) => (
          <Link
            key={link.id}
            href={`/#${link.id}`} // Link to the section ID on the homepage
            className="nav-links cursor-pointer"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile Menu & Hamburger Icon (shown only on small screens) */}
      <div className="flex sm:hidden items-center gap-2"> {/* This div shows only on sm and below */}
        {/* Hamburger Icon */}
        <button
          onClick={toggleMenu}
          className="z-10 overflow-hidden cursor-pointer" // No `md:hidden` or `sm:hidden` here, as parent div controls visibility
          aria-label="Toggle navigation menu"
        >
          <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Navigation Links (Shown only when menuOpen is true and on small screens) */}
        {menuOpen && (
          <div className="absolute top-full right-0 w-full bg-[#2E2B2C] dark:bg-[#EAEAEA] shadow-lg p-4 flex flex-col z-50 cursor-pointer">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={`/#${link.id}`}
                className="nav-links block py-2 px-4 text-center"
                onClick={handleNavLinkClick} // Close the menu on link click
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;