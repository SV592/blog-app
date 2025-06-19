import fs from 'fs'; // Node.js file system module
import path from 'path'; // Node.js path module
import matter from 'gray-matter'; // To parse frontmatter
import { remark } from 'remark'; // Markdown processor
import html from 'remark-html'; // Plugin to convert Markdown to HTML

// Define the path to your posts directory
const postsDirectory = path.join(process.cwd(), 'src', 'posts'); // Assuming posts are in src/posts

// Define the shape of your post data
export interface PostData {
  slug: string;
  title: string;
  date: string; // Consider using Date type if you parse it
  description: string;
  tags: string[];
  image?: string;
  isFeatured?: boolean; // Optional, based on your frontmatter
  contentHtml?: string; // HTML content of the post
}

/**
 * Get the data for a single post by its slug.
 * This function is used to fetch content for individual blog post pages.
 */
export async function getPostData(slug: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const { data, content } = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(content);
  const contentHtml = processedContent.toString();

  // Combine the data with the slug and contentHtml
  return {
    slug,
    contentHtml,
    ...(data as {
        title: string;
        date: string;
        description: string;
        tags: string[];
        image?: string;
        isFeatured?: boolean;
    }),
  };
}

/**
 * Get a list of all post slugs.
 * Used for dynamic routing (e.g., `generateStaticParams` in Next.js App Router).
 */
export function getAllPostSlugs(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);
  // Returns an array that looks like this:
  // ['first-post.md', 'second-post.md']
  return fileNames.map((fileName) => {
    return fileName.replace(/\.md$/, ''); // Remove ".md" extension
  });
}

/**
 * Get sorted list of all posts with only metadata (no full content HTML).
 * Useful for displaying lists of posts (e.g., on a blog index page or featured section).
 */
export function getSortedPostsData(): PostData[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, ''); // Remove ".md" extension
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata
    const { data } = matter(fileContents);

    // Combine the data with the slug
    return {
      slug,
      ...(data as {
          title: string;
          date: string;
          description: string;
          tags: string[];
          image?: string;
          isFeatured?: boolean;
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

// Optional: Get only featured posts
export function getFeaturedPosts(): PostData[] {
    const allPosts = getSortedPostsData();
    return allPosts.filter(post => post.isFeatured);
}