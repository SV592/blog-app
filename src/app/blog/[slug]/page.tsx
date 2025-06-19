import { getPostData, getAllPostSlugs, PostData } from '../../utils/postsUtils'; 
import type { Metadata } from 'next'; 
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Which paths to pre-render at build time
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// This will set the title, description, etc. for each individual post page
export const generateMetadata = async ({ params }: BlogPostPageProps): Promise<Metadata> => {
  const resolvedParams = await params;
  const post = await getPostData(resolvedParams.slug);

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.yourblogurl.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      images: post.image ? [{ url: `https://www.yourblogurl.com${post.image}` }] : [],
    },
  };
}


// The main component for displaying a single blog post
export default async function BlogPostPage ({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post: PostData = await getPostData(resolvedParams.slug);

  if (!post) {
    return (
      // 404 errors
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Post Not Found</h1>
        <p><Link href="/" className="hover:underline">Go back to homepage</Link></p>
      </div>
    );
  }

  const displayDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col justify-center py-8">
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.description} />
      </Head>

      <article className="prose prose-base sm:prose-lg md:prose-xl lg:prose-2xl mx-auto">
        {post.image && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-sm"
              priority // Give priority to the main image on the page
            />
          </div>
        )}

        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <p className="text-sm mb-4">Published on {displayDate}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, index) => (
              <span key={index} className="tags">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* HTML content from the markdown files will be rendered */}
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }} />
      </article>

      <div className="flex justify-center mt-12">
        <Link href="/" className="hover:underline items-center">
          &larr; Back to all posts
        </Link>
      </div>
    </div>
  );
}