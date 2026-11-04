"use client";
import React, { useRef, useState } from "react";

import { Blogs } from "../Blogs/Blogs";
import { PostData } from "../../utils/postsUtils";
import { formatDateString } from "@/app/utils/formatDateString";

interface PaginatedPostsProps {
  posts: PostData[];
  postsPerPage?: number;
}

export const PaginatedPosts: React.FC<PaginatedPostsProps> = ({
  posts,
  postsPerPage = 6,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(posts.length / postsPerPage));
  const start = (currentPage - 1) * postsPerPage;
  const visiblePosts = posts.slice(start, start + postsPerPage);
  const newestDate = visiblePosts[0]?.date;
  const oldestDate = visiblePosts[visiblePosts.length - 1]?.date;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={topRef} className="scroll-mt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {visiblePosts.map((post) => (
          <Blogs key={post.slug} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Posts pagination"
          className="flex flex-col items-center gap-3 mt-8"
        >
          {newestDate && oldestDate && (
            <p className="text-sm">
              {formatDateString(newestDate)} &ndash; {formatDateString(oldestDate)}
              <span className="opacity-60">
                {" "}· Page {currentPage} of {totalPages}
              </span>
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              className="page-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Newer
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-btn ${page === currentPage ? "page-btn-active" : ""}`}
                onClick={() => goToPage(page)}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Older →
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
