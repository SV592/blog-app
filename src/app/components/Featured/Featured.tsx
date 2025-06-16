import React from 'react'

const Featured: React.FC = () => {
  return (
    <div className='featured flex flex-col-reverse text-center items-center lg:text-left lg:flex-row lg:justify-between'>
        <div className='flex flex-col gap-2 px-4 mt-2 lg:w-63 lg:mt-0 lg:gap-4'>
            <p className=''>{new Date().toLocaleDateString()}</p>
            <h1 className='text-xl font-bold'>JavaScript Behind the Scenes</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu finibus turpis. Nam maximus turpis sed ante dignissim,
                a iaculis lacus fringilla. Nulla dictum placerat est, vitae tincidunt ante dictum eget. Aenean fringilla augue tempor,
                pharetra libero non, eleifend ante.
            </p>
            <div className='flex justify-center lg:justify-normal gap-2 text-[0.8rem]'>
                <p className='tags'>JavaScript</p>
                <p className='tags'>Core</p>
                <p className='tags'>Tips</p>
            </div>
        </div>

        <img src="/javascript.jpg" width="85%" className='max-h-100 rounded-sm' alt="" />
    </div>
  )
}

export default Featured