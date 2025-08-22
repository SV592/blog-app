import { NextResponse, NextRequest } from "next/server";
import { getSortedPostsData, PostData } from "../../utils/postsUtils"; // Utility to get and sort blog posts

/**
 * API Route Handler: Returns the latest blog post as JSON.
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const expectedAuthToken = process.env.LATEST_BLOG_POST_AUTH_TOKEN;
  const receivedAuthToken = request.headers.get('x-auth-token');

  if (!expectedAuthToken || receivedAuthToken !== expectedAuthToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all sorted post data (latest first)
    const allPosts: PostData[] = getSortedPostsData();

    const latestPost: PostData | undefined = allPosts[0];

    // If no posts are found, return a 404 response
    if (!latestPost) {
      return NextResponse.json(
        { message: "No blog posts found." },
        { status: 404 }
      );
    }

    // Base URL
    const blogBaseUrl: string | undefined =
      process.env.BLOG_BASE_URL || "http://localhost:3000";

    // Prepare the response data with essential fields for the portfolio card
    const responseData = {
      title: latestPost.title,
      url: `${blogBaseUrl}/blog/${latestPost.slug}`,
      date: latestPost.date,
      description: latestPost.description,
      imageUrl: latestPost.image ? `${blogBaseUrl}${latestPost.image}` : null,
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
};
