import React from 'react'

// Featured component displays a highlighted blog post section
export const Featured: React.FC = () => {
  return (
    // Main container with responsive flex layout
    <div className='featured flex flex-col-reverse text-center items-center lg:text-left lg:flex-row lg:justify-between'>
        {/* Text content section */}
        <div className='flex flex-col gap-2 px-4 mt-2 lg:w-63 lg:mt-0 lg:gap-4'>
            {/* Display current date */}
            <p className=''>{new Date().toLocaleDateString()}</p>
            {/* Featured post title */}
            <h1 className='text-xl font-bold'>JavaScript Behind the Scenes</h1>
            {/* Featured post description */}
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu finibus turpis. Nam maximus turpis sed ante dignissim,
                a iaculis lacus fringilla. Nulla dictum placerat est, vitae tincidunt ante dictum eget. Aenean fringilla augue tempor,
                pharetra libero non, eleifend ante.
            </p>
            {/* Tags for the featured post */}
            <div className='flex justify-center lg:justify-normal gap-2 text-[0.8rem]'>
                <p className='tags'>JavaScript</p>
                <p className='tags'>Core</p>
                <p className='tags'>Tips</p>
            </div>
        </div>

        {/* Featured image */}
        <img src="/javascript.jpg" width="85%" className='max-h-100 rounded-sm' alt="" />
    </div>
  )
}