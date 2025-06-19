"use client"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { PostData } from '../../utils/postsUtils'; 

interface FeaturedProps {
  post: PostData; // Expect a single PostData object as a prop
}

// Featured component displays a highlighted blog post section
export const Featured: React.FC<FeaturedProps> = ({ post }) => {
  if (!post) {
    return null; // Or render a loading/placeholder state if no featured post
  }

  // Format date for display
  const displayDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });


  return (
    // Main container with responsive flex layout
    <div className='featured flex flex-col-reverse text-center items-center lg:text-left lg:flex-row lg:justify-between'>
        {/* Text content section */}
        <div className='flex flex-col gap-2 px-4 mt-2 lg:w-63 lg:mt-0 lg:gap-4'>
            {/* Display current date */}
            <p className=''>{displayDate}</p>

            {/* Featured post title */}
            <Link href={`/blog/${post.slug}`} className='hover:underline'>
              <h1 className='text-xl font-bold'>{post.title}</h1>
            </Link>
            
            {/* Featured post description */}
            <p>{post.description}</p>
            
            {/* Tags for the featured post */}
            <div className='flex justify-center lg:justify-normal gap-2 text-[0.8rem]'>
            {post.tags.map((tag: string, index: number) => (
              <p key={index} className='tags'>{tag}</p>
            ))}
            </div>
        </div>

        {/* Featured image */}        
          <Link href={`/blog/${post.slug}`} className='w-[95%] md:w-[85%] h-[20vh] md:h-[40vh] relative'>
            <Image 
              src={post.image || ""} 
              alt={post.title} 
              quality={95} 
              fill 
              objectFit='cover'
              className='rounded-sm' 
              priority={true} />
          </Link>

    </div>
  )
}