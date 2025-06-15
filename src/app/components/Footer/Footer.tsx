import React from 'react'

// Footer component displays a fixed footer at the bottom of the page
const Footer: React.FC = () => {
  return (
    // Fixed 5 units from the bottom of the viewport
    <footer className="fixed bottom-5">
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

export default Footer