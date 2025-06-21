'use client'; 

import React, { useState } from "react";
import Link from 'next/link'; // Import Link for navigation

interface MobileNavClientProps {
  navLinks: { id: string; label: string; }[];
}

const MobileNavClient: React.FC<MobileNavClientProps> = ({ navLinks }) => {
  // We still need useState to toggle the mobile menu's visibility
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Hamburger Icon (Only shown on small screens) */}
      <button
        onClick={toggleMenu}
        className="block sm:hidden z-10 overflow-hidden cursor-pointer"
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

      {/* Mobile Navigation Links (Shown only when menuOpen is true) */}
      {menuOpen && (
        <div className="md:hidden absolute top-full right-0 w-full bg-[#2E2B2C] dark:bg-[#EAEAEA] shadow-lg p-4 flex flex-col z-50 cursor-pointer">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={`/#${link.id}`}
              className="nav-links block py-2 px-4 text-center"
              onClick={() => setMenuOpen(false)} // Just close the menu on click
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default MobileNavClient;