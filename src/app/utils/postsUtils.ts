import fs from "fs"; // Node.js file system module
import path from "path"; // Node.js path module
import matter from "gray-matter"; // To parse frontmatter
import { remark } from "remark"; // Markdown processor
import html from "remark-html"; // Plugin to convert Markdown to HTML

// Path to posts directory
const postsDirectory = path.join(process.cwd(), "src", "posts");

// Post data interface
export interface PostData {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  image?: string;
  contentHtml?: string; // HTML content of the post
}

/**
 * Get the data for a single post by its slug.
 * This function is used to fetch content for individual blog post pages.
 */
export async function getPostData(slug: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Parse the post metadata section
  const { data, content } = matter(fileContents);

  // Convert markdown into HTML string
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  // Combine the data with the slug and contentHtml
  return {
    contentHtml,
    ...(data as {
      slug: string;
      title: string;
      date: string;
      description: string;
      tags: string[];
      image?: string;
    }),
  };
}

/**
 * Get a list of all post slugs
 * For dynamic routing
 */
export function getAllPostSlugs(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);
  // Returns an array that looks like this:
  // ['first-post.md', 'second-post.md']
  return fileNames.map((fileName) => {
    return fileName.replace(/\.md$/, ""); // Remove ".md" extension
  });
}

/**
 * Get sorted list of all posts with only metadata (no full content HTML)
 * For displaying a featured post section)
 */
export function getSortedPostsData(): PostData[] {
  const fileNames = fs.readdirSync(postsDirectory);

  const allPostsData = fileNames.map((fileName) => {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // parse the post metadata
    const { data } = matter(fileContents);

    // Combine the data with the slug
    return {
      ...(data as {
        slug: string;
        title: string;
        date: string;
        description: string;
        tags: string[];
        image?: string;
      }),
    };
  });

  // Sort posts by date in descending order
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}
