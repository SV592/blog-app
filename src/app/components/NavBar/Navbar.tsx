"use client";
import React from "react";


// Navbar with tailwind
const Header = () => {
  return (
    <nav className="flex pt-4 items-center place-content-between">
      <h1 className="text-3xl font-bold">A Uncanny Coding Blog.</h1>
      <div className="flex gap-4 cursor-pointer">
        <a className="nav-links">Latest</a>
        <a className="nav-links">Trending</a>
        <a className="nav-links">JavaScript</a>
        <a className="nav-links">Python</a>
        <a className="nav-links">C++</a>
      </div>
    </nav>
  )
}


export default Header