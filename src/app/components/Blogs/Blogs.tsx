import React from 'react'

export const Blogs = () => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4'>
        <div className='blogs'>
             {/* Featured image */}
            <img src="/javascript.jpg" width="85%" className='max-h-100 rounded-sm' alt="" />
            
            <div className='flex flex-col gap-2 px-4 mt-2'>
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
            <div className='flex justify-center gap-2 text-[0.8rem]'>
                <p className='tags'>JavaScript</p>
                <p className='tags'>Core</p>
                <p className='tags'>Tips</p>
            </div>
        </div>

        </div>

        <div className='blogs'>
            {/* Featured image */}
            <img src="/javascript.jpg" width="85%" className='max-h-100 rounded-sm' alt="" />
            
            <div className='flex flex-col gap-2 px-4 mt-2'>
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
            <div className='flex justify-center gap-2 text-[0.8rem]'>
                <p className='tags'>JavaScript</p>
                <p className='tags'>Core</p>
                <p className='tags'>Tips</p>
            </div>
        </div>

        </div>

        <div className='blogs'>
            {/* Featured image */}
            <img src="/javascript.jpg" width="85%" className='max-h-100 rounded-sm' alt="" />
            
            <div className='flex flex-col gap-2 px-4 mt-2'>
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
            <div className='flex justify-center gap-2 text-[0.8rem]'>
                <p className='tags'>JavaScript</p>
                <p className='tags'>Core</p>
                <p className='tags'>Tips</p>
            </div>
        </div>
        </div>
    </div>
  )
}
