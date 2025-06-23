"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

import { PostData } from "../../utils/postsUtils"; // Import your PostData interface
import { formatDateString } from "@/app/utils/formatDateString";

interface FeaturedProps {
  post: PostData; // Expect a single PostData object as a prop
}

export const Blogs: React.FC<FeaturedProps> = ({ post }) => {
  if (!post) {
    return null; // Or render a loading/placeholder state if no featured post
  }

  // Format date for display
  const displayDate = formatDateString(post.date);

  return (
    <div className="blogs">
      {/* Featured image */}
      <Link
        href={`/blog/${post.slug}`}
        className="w-[95%] md:w-[85%] h-[20vh] md:h-[30vh] lg:h-[35vh] relative"
      >
        <Image
          src={post.image || ""}
          alt={post.title}
          fill
          className="rounded-sm"
          priority={true}
        />
      </Link>

      <div className="flex flex-col items-center gap-2 px-4 mt-2">
        {/* Display current date */}
        <p className="">{displayDate}</p>

        {/* Featured post title */}
        <Link href={`/blog/${post.slug}`} className="hover:underline">
          <h1 className="text-xl font-bold">{post.title}</h1>
        </Link>

        {/* Featured post description */}
        <p>{post.description}</p>
        {/* Tags for the post */}
        {post.tags &&
          post.tags.length > 0 && ( // Conditionally render tags if available
            <div className="flex gap-2 text-[0.8rem] mt-2">
              {" "}
              {/* flex-wrap for multiple tags */}
              {post.tags.map((tag: string, index: number) => (
                <span key={index} className="tags">
                  {" "}
                  {/* Use span for individual tags */}
                  {tag}
                </span>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};
