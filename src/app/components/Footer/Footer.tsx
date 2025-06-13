import React from 'react'

const Footer = () => {
  return (
    <footer className="fixed bottom-5">
        <div className="flex">
            <aside className="flex gap-2 items-center">
              <p>Shaquille Pearson © {new Date().getFullYear()} - All rights reserved</p>
            </aside>
        </div>
    </footer>
  )
}

export default Footer