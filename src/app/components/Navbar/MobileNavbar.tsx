'use client'; // This file MUST be a Client Component

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface MobileNavClientProps {
  // We'll pass the fixed navigation links as props from the Server Component
  // to avoid re-rendering them if they don't need client-side logic.
  navLinks: { id: string; label: string; }[];
}

const MobileNavClient: React.FC<MobileNavClientProps> = ({ navLinks }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Keep searchParams in dependency array if used for scrolling logic

  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          if (pathname === '/') {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }, 100);
      }
    }
  }, [pathname, searchParams]); // Keep dependencies as before

  const handleNavLinkClick = (sectionId: string) => {
    setMenuOpen(false); // Close mobile menu
    if (pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <>
      {/* Hamburger Icon (Only shown on small screens) */}
      <button
        onClick={toggleMenu}
        className="md:hidden z-10 overflow-hidden cursor-pointer"
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
            <a
              key={link.id}
              className="nav-links block py-2 px-4 text-center"
              onClick={() => { toggleMenu(); handleNavLinkClick(link.id); }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
};

export default MobileNavClient;