"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";

// Navbar component using Tailwind CSS for styling
const Navbar: React.FC = () => {
  // State to manage the visibility of the mobile menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Function to toggle the menu's open/close state
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="flex pt-4 items-center place-content-between relative gap-4">
      {/* Blog title */}
      <Link href={"/"}>
        <h1 className="text-2xl md:text-3xl font-bold">
          The Programmer&apos;s Gazette
        </h1>
      </Link>

      {/* Navigation links */}
      <div className="hidden md:flex gap-4 cursor-pointer">
        {/* Link to latest posts */}
        <Link href={"/#Featured"} className="nav-links">
          Featured
        </Link>

        {/* Link to trending posts */}
        <Link href={"/#Playlist"} className="nav-links">
          Playlist
        </Link>

        {/* Link to JavaScript category */}
        <Link href={"/#Posts"} className="nav-links">
          Posts
        </Link>

        {/* Link to Python category */}
        <Link href={"/#Newsletter"} className="nav-links">
          Newsletter
        </Link>
      </div>

      {/* Hamburger Icon (Shown on small screens, hidden on medium and larger) */}
      <button
        onClick={toggleMenu}
        className="md:hidden z-10 overflow-hidden" // Added z-index
        aria-label="Toggle navigation menu"
      >
        {/* Toggle between hamburger icon and 'X' icon based on menuOpen state */}
        <svg
          className="h-6 w-6 fill-current"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {menuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Navigation Links (Shown only when menuOpen is true) */}
      {menuOpen && (
        <div className="md:hidden absolute top-full right-0 w-full rounded-sm bg-color shadow-lg p-4 flex flex-col z-50 cursor-pointer">
          {/* Apply nav-links style, but also make them block for full width and add padding */}
          <Link
            className="nav-links block py-2 px-4 text-center"
            href={"/#Featured"}
            onClick={toggleMenu}
          >
            Featured
          </Link>
          <Link
            className="nav-links block py-2 px-4 text-center"
            href={"/#Playlist"}
            onClick={toggleMenu}
          >
            Playlist
          </Link>
          <Link
            className="nav-links block py-2 px-4 text-center"
            href={"/#Posts"}
            onClick={toggleMenu}
          >
            Posts
          </Link>
          <Link
            className="nav-links block py-2 px-4 text-center"
            href={"/#Newletter"}
            onClick={toggleMenu}
          >
            Newletter
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
