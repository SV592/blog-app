// src/app/blog/page.tsx

import { redirect } from 'next/navigation';

export default function BlogRootPage() {
  // This page specifically handles the /blog route.
  // Since it's not meant to render content, redirect the user.
  redirect('/');

  // This return statement will technically not be reached in a production build
  // because `redirect()` terminates the request.
  return null;
}