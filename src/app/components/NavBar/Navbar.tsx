"use client";
import React from "react";
import { useState } from "react";

// Navbar component using Tailwind CSS for styling
const Header: React.FC = () => {
  // State to manage the visibility of the mobile menu
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // Function to toggle the menu's open/close state
  const toggleMenu = (): void => {
    setMenuOpen(!menuOpen);
  };

  return (
    // Navigation bar container with flex layout
    <nav className="flex pt-4 items-center place-content-between relative gap-4">
      {/* Blog title */}
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">An Uncanny Coding Blog</h1>

      {/* Navigation links */}
      <div className="hidden md:flex gap-3.5 cursor-pointer">

        {/* Link to latest posts */}
        <a className="nav-links">All</a>

        {/* Link to trending posts */}
        <a className="nav-links">Trending</a>

        {/* Link to JavaScript category */}
        <a className="nav-links">JavaScript</a>

        {/* Link to Python category */}
        <a className="nav-links">Python</a>

        {/* Link to C++ category */}
        <a className="nav-links">C++</a>
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
          <a className="nav-links block py-2 px-4 text-center" onClick={toggleMenu}>Latest</a>
          <a className="nav-links block py-2 px-4 text-center" onClick={toggleMenu}>Trending</a>
          <a className="nav-links block py-2 px-4 text-center" onClick={toggleMenu}>JavaScript</a>
          <a className="nav-links block py-2 px-4 text-center" onClick={toggleMenu}>Python</a>
          <a className="nav-links block py-2 px-4 text-center" onClick={toggleMenu}>C++</a>
        </div>
      )}

    </nav>
  )
}

export default Header