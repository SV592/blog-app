import type { Metadata } from 'next'; 
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import { getPostData, getAllPostSlugs, PostData } from '../../utils/postsUtils'; 
import { formatDateString } from '@/app/utils/formatDateString';


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

  // Format date for display
  const displayDate = formatDateString(post.date);

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
        
        <Link href="/" className="social-links font-bold text-xl flex items-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#2E2B2C" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.746 6.00002C10.746 5.69663 10.5632 5.42312 10.2829 5.30707C10.0026 5.19101 9.67996
            5.25526 9.4655 5.46986L3.51254 11.4266C3.35184 11.5642 3.25 11.7685 3.25 11.9966V11.9982C3.24959
            12.1906 3.32276 12.3831 3.46949 12.53L9.46548 18.5302C9.67994 18.7448 10.0026 18.809 10.2829
            18.693C10.5632 18.5769 10.746 18.3034 10.746 18L10.746 12.7466L20.0014 12.7466C20.4156
            12.7466 20.7514 12.4108 20.7514 11.9966C20.7514 11.5824 20.4156 11.2466 20.0014
            11.2466L10.746 11.2466V6.00002Z"/>
          </svg>
          <h1>Homepage</h1>
        </Link>
      </div>
    </div>
  );
}