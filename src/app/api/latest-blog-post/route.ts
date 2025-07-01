import { NextResponse } from "next/server";
import { getSortedPostsData, PostData } from "../../utils/postsUtils"; // Utility to get and sort blog posts

/**
 * API Route Handler: Returns the latest blog post as JSON.
 */
export async function GET() {
  try {
    // Get all sorted post data (latest first)
    const allPosts: PostData[] = getSortedPostsData();

    // The first item in the sorted array is the latest post
    const latestPost = allPosts[0];

    // If no posts are found, return a 404 response
    if (!latestPost) {
      return NextResponse.json(
        { message: "No blog posts found." },
        { status: 404 }
      );
    }

    // Base URL for your blog (update if your domain changes)
    const blogBaseUrl = "https://theprogrammersgazette.vercel.app/"; // <--- !!! REPLACE THIS IF NEEDED !!!

    // Prepare the response data with essential fields for the portfolio card
    const responseData = {
      title: latestPost.title, // Blog post title
      url: `${blogBaseUrl}/blog/${latestPost.slug}`, // Full URL to the blog post
      date: latestPost.date, // Publication date
      description: latestPost.description, // Short description/snippet
      imageUrl: latestPost.image ? `${blogBaseUrl}${latestPost.image}` : null, // Full image URL if available
    };

    // Return the latest post as JSON
    return NextResponse.json(responseData);
  } catch (error) {
    // Log and return a 500 error if something goes wrong
    console.error("Error fetching latest blog post from postsUtils:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
