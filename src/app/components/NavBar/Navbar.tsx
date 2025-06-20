"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Navbar component using Tailwind CSS for styling
export const Navbar: React.FC = () => {
  // State to manage the visibility of the mobile menu
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()

  // Function to toggle the menu's open/close state
  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
  };

  // Effect to handle scrolling after a navigation
  useEffect(() => {
    // Check if there's a hash in the URL (e.g., /#featured)
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1); // Remove the '#'
      const element = document.getElementById(id);
      if (element) {
        // Use a small timeout to ensure the element is fully rendered and the layout is stable
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          
          // This ensures the URL returns to '/' after navigating from a blog post
          if (pathname === '/') { // Only remove hash if we are on the homepage
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }, 100); // Adjust timeout if needed (e.g., 50ms, 200ms)
      }
    }
  }, [pathname, searchParams]); // Re-run effect when path or search params change

   // Function to handle link clicks
  const handleNavLinkClick = (sectionId: string) => {
    setMenuOpen(false); // Close mobile menu

    // If already on the homepage, just scroll
    if (pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If navigating from another page (e.g., /blog/[slug]), navigate to homepage with hash
      // The useEffect above will handle the scrolling once the homepage is loaded
      router.push(`/#${sectionId}`);
    }
  };

  return (
    // Navigation bar container with flex layout
    <nav className="flex pt-4 mb-4 items-center place-content-between relative gap-4">
      {/* Blog title */}
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">The Programmer&apos;s Gazette</h1>

      {/* Navigation links */}
      <div className="hidden md:flex gap-3.5 cursor-pointer">

        {/* Link to latest posts */}
        <a onClick={() => handleNavLinkClick('Featured')} className="nav-links">Featured</a>

        {/* Link to trending posts */}
        <a onClick={() => handleNavLinkClick('Playlist')} className="nav-links">Playlist</a>

        {/* Link to JavaScript category */}
        <a onClick={() => handleNavLinkClick('Posts')} className="nav-links">Posts</a>

        {/* Link to Python category */}
        <a onClick={() => handleNavLinkClick('Newsletter')} className="nav-links">Newsletter</a>
      </div>


      {/* Hamburger Icon (Shown on small screens, hidden on medium and larger) */}
      <button
        onClick={toggleMenu}
        className="md:hidden z-10 overflow-hidden cursor-pointer" // Added z-index
        aria-label="Toggle navigation menu"
      >
        {/* Toggle between hamburger icon and 'X' icon based on menuOpen state */}
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
          {/* Apply nav-links style, but also make them block for full width and add padding */}
          <a className="nav-links block py-2 px-4 text-center" onClick={() => {toggleMenu();  handleNavLinkClick('Featured')}}>Featured</a>
          <a className="nav-links block py-2 px-4 text-center" onClick={() => {toggleMenu(); handleNavLinkClick('Playlist')}}>Playlist</a>
          <a className="nav-links block py-2 px-4 text-center" onClick={() => {toggleMenu(); handleNavLinkClick('Posts')}}>Posts</a>
          <a className="nav-links block py-2 px-4 text-center" onClick={() => {toggleMenu(); handleNavLinkClick('Newsletter')}}>Newsletter</a>
        </div>
      )}
    </nav>
  )
}