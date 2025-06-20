import Link from 'next/link';
import React from 'react';



// NotFound component displays a custom 404 error page
export default function NotFound() {
  return (
    // Main container centered on the page
    <div className="flex flex-col items-center justify-center text-center mt-10 gap-4">
      {/* Large 404 error code */}
      <h1 className="text-8xl font-extrabold mb-4">404</h1>
      {/* Page not found heading */}
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      {/* Description message */}
      <p className="text-lg mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      {/* Link to return to the homepage */}
      <Link href="/" className="social-links font-bold text-xl flex items-center m-auto">
        {/* Home icon SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#2E2B2C" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.746 6.00002C10.746 5.69663 10.5632 5.42312 10.2829 5.30707C10.0026 5.19101 9.67996
          5.25526 9.4655 5.46986L3.51254 11.4266C3.35184 11.5642 3.25 11.7685 3.25 11.9966V11.9982C3.24959
          12.1906 3.32276 12.3831 3.46949 12.53L9.46548 18.5302C9.67994 18.7448 10.0026 18.809 10.2829
          18.693C10.5632 18.5769 10.746 18.3034 10.746 18L10.746 12.7466L20.0014 12.7466C20.4156
          12.7466 20.7514 12.4108 20.7514 11.9966C20.7514 11.5824 20.4156 11.2466 20.0014
          11.2466L10.746 11.2466V6.00002Z"/>
        </svg>
        {/* Homepage link text */}
        <h1>Homepage</h1>
      </Link>
    </div>
  );
}