import React from 'react'

interface TunesProps {
  title: string;
  artist: string;
  time: string;
  num?: string;
  url: string;
}

export const Tunes: React.FC<TunesProps> = (props) => {
  const { title, artist, time, num, url } = props;

 return (
    <div className='flex items-center justify-between border-b-2 p-2 w-full'>
      <div className='flex text-left items-center gap-2'>
        <h1 className='font-bold hidden md:block'>#{num}</h1>
        <h1>{title} - {artist}</h1>
      </div>

      <div className='flex items-center gap-4'>
        <a href={url}>
          <svg width="15" height="15" viewBox="0 0 25 24" fill="#2E2B2C" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.4357 13.9174C20.8659 13.0392 20.8659 10.9608 19.4357 10.0826L9.55234 4.01389C8.05317 3.09335 6.125 4.17205 6.125 5.93128L6.125 18.0688C6.125 19.828 8.05317 20.9067 9.55234 19.9861L19.4357 13.9174Z"/>
          </svg>          
        </a>
        <h1>{time}</h1>
      </div>
    </div>
  );
}


 