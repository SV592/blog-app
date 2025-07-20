import { redirect } from "next/navigation";

export default function BlogRootPage() {
  // This page specifically handles the /blog route.
  // Since it's not meant to render content, redirect the user.
  redirect("/");
}
