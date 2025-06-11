"use client";
import React from "react";


// Navbar with tailwind
const Header = () => {
  return (
    <div className="flex pt-4 ml-10 items-center place-content-between">
      <h1 className="text-3xl font-bold">The Coding Blog.</h1>
      <div className="flex gap-4 mr-10 cursor-pointer">
        <a className="nav-link">Latest</a>
        <a className="nav-link">Trending</a>
        <a className="nav-link">JavaScript</a>
        <a className="nav-link">Python</a>
        <a className="nav-link">C++</a>
      </div>
    </div>
  )
}


export default Header