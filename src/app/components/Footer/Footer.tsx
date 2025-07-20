import React from "react";

// Displays a fixed footer at the bottom of the page
const Footer: React.FC = () => {
  return (
    <footer className="my-5 text-center">
      <div className="flex justify-center">
        <aside className="flex gap-2 items-center">
          <p>
            Shaquille Pearson © {new Date().getFullYear()} - All rights reserved
          </p>
        </aside>
      </div>
    </footer>
  );
};

export default Footer;
