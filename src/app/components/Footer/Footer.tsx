import React from 'react'

// Footer component displays a fixed footer at the bottom of the page
export const Footer: React.FC = () => {
  return (
    // Fixed 5 units from the bottom of the viewport
    <footer className="mx-14 my-5 mt-4 md:mx-5 lg:mx-11 text-center">
        <div className="flex">
            {/* Aside contains the copyright */}
            <aside className="flex gap-2 items-center">
              {/* Display current year dynamically */}
              <p>Shaquille Pearson © {new Date().getFullYear()} - All rights reserved</p>
            </aside>
        </div>
    </footer>
  )
}