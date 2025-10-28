"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Tunes } from "../Tunes/Tunes";

// Track interface for playlist tracks
interface Track {
  id: string;
  name: string;
  artists: string;
  duration_ms: number;
  albumImageUrl: string;
  uri: string;
}

// Props for the Playlist component
interface SpotifyPlayerProps {
  initialPlaylistData: Track[] | null;
}

// Playlist component displays a list of tracks from a Spotify playlist
export const Playlist: React.FC<SpotifyPlayerProps> = ({
  initialPlaylistData,
}) => {
  // If initialPlaylistData is null, initialize with an empty array
  const [playlistTracks] = useState<Track[]>(initialPlaylistData || []);

  // State for loading indicator
  const [isLoading] = useState<boolean>(false);

  // State for error messages - set if initialPlaylistData is null
  const [error] = useState<string | null>(
    initialPlaylistData === null ? "Failed to load playlist data." : null
  );

  // Helper to format track duration from ms to mm:ss
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex flex-col mt-4 gap-4 items-center xl:flex-row">
      {/* Playlist display section */}
      <div className="flex flex-col w-full border-2 items-center rounded-sm p-4 gap-4 xl:w-[50%] lg:flex-row">
        {/* Album Art */}
        <div className="w-[95%] h-[20vh] sm:h-[30vh] md:h-[40vh] lg:h-[40vh] md:w-full relative">
          <a
            href="https://open.spotify.com/playlist/4sm1LiCcKQDxZcgUqe1A7P?si=60f4e66287024cbc"
            className="cursor-pointer"
            target="_blank"
          >
            <Image
              src="/blogImages/headphones.jpg"
              alt="feature image"
              fill
              objectFit="cover"
              className="rounded-sm"
              priority={true}
            />
          </a>
        </div>

        {/* Track list and info */}
        <div className="w-full flex flex-col gap-4">
          <p className="hidden md:block">Spotify Playlist</p>
          <h1 className="text-xl font-bold hidden md:block">
            For A Creative Trance
          </h1>

          {/* Conditional rendering for loading, error, or track list */}
          {isLoading ? (
            <p>Loading playlist data...</p>
          ) : error ? (
            <p>{error}</p>
          ) : playlistTracks.length === 0 ? (
            <p>No tracks found.</p>
          ) : (
            playlistTracks.map((track, index) => (
              <Tunes
                key={track.id}
                num={(index + 1).toString()}
                title={track.name}
                artist={track.artists}
                time={formatDuration(track.duration_ms)}
                url={track.uri}
              />
            ))
          )}
        </div>
      </div>

      {/* Playlist promotion section */}
      <div className="flex flex-col gap-4 w-full xl:w-[50%] items-center">
        <h1 className="text-8xl font-bold hidden xl:block">
          Music I&apos;ve been listening to recently (Because why not)
        </h1>
        <div className="w-full mt-0 xl:mt-4">
          <a
            href="https://open.spotify.com/playlist/4sm1LiCcKQDxZcgUqe1A7P?si=60f4e66287024cbc"
            target="_blank"
            className="social-links flex justify-center"
          >
            {/* Spotify icon */}
            <svg
              viewBox="0 0 24 24"
              fill="#2E2B2C"
              className="w-8 h-8 md:w-10 md:h-10 xl:w-15 xl:h-15"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.45161 2 2 6.45161 2 12C2 17.5484 6.45161 22 12 22C17.5484 22 22 17.5484 22 12C22 6.45161 17.5484 2 12 2ZM16.5806 16.4194C16.3871 16.6774 16.0323 16.7742 15.7097 16.6452C13.3548 15.1935 10.3871 14.871 6.93548 15.6452C6.58064 15.7419 6.25806 15.5161 6.19355 15.1935C6.09677 14.8387 6.32258 14.5161 6.64516 14.4194C10.4516 13.5484 13.6774 13.9355 15.5484 15.5484C16.6774 15.7742 16.7742 16.129 16.5806 16.4194ZM17.8065 13.7419C17.5806 14.0968 17.0645 14.1935 16.7742 13.9677C14.0968 12.3226 10 11.8387 6.80645 12.8387C6.3871 12.9677 5.93548 12.7419 5.83871 12.2903C5.70968 11.871 5.93548 11.4194 6.3871 11.3226C10.0323 10.1935 14.5161 10.7742 17.6129 12.6452C17.9032 12.871 18.0323 13.3226 17.8065 13.7419ZM17.9032 10.871C14.6774 8.96774 9.35484 8.77419 6.25806 9.74194C5.80645 9.87097 5.25806 9.6129 5.12903 9.09677C5.00000 8.64516 5.25806 8.09677 5.77419 7.96774C9.32258 6.93548 15.129 7.09677 18.871 9.32258C19.3226 9.58065 19.4516 10.1935 19.2258 10.5806C18.9677 11 18.3548 11.129 17.9032 10.871Z" />
            </svg>
            <span className="font-bold text-3xl hidden lg:block">Playlist</span>
          </a>
        </div>
      </div>
    </div>
  );
};
