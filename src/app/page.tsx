import { JSX } from "react";
import { Featured } from "./components/Featured/Featured";
import { Blogs } from "./components/Blogs/Blogs";
import { Playlist } from "./components/Playlist/Playlist";
import { Newsletter } from "./components/Newsletter/Newsletter";
import { fetchPlaylistDataFromServer } from "./utils/spotifyServerUtils";
import { getSortedPostsData, PostData } from "./utils/postsUtils";

// Home page component as an async arrow function
const Home: React.FC = async (): Promise<JSX.Element> => {
  // Fetch initial playlist data from the server
  const initalPlaylist = await fetchPlaylistDataFromServer();

  const allPosts: PostData[] = getSortedPostsData();

  // Get the latest post for the featured section
  const latestPost: PostData | undefined = allPosts[0];

  // Get all other posts (excluding the latest one)
  const otherPosts: PostData[] = allPosts.slice(1);

  return (
    // Main container for the home page
    <main className="flex flex-col items-center text-center md:text-left mt-4">
      {/* Featured section */}
      <section className="w-[85%] md:w-[95%]" id="Featured">
        <h1 className="font-bold text-3xl underline">Featured</h1>
        {latestPost ? (
          <Featured post={latestPost} />
        ) : (
          <p>No featured post available.</p>
        )}
      </section>

      {/* Playlist section */}
      <section className="w-[85%] md:w-[95%] mt-10" id="Playlist">
        <h1 className="font-bold text-3xl underline">Playlist</h1>
        <Playlist initialPlaylistData={initalPlaylist} />
      </section>

      {/* Other blog posts section */}
      <section className="w-[85%] md:w-[95%] mt-10" id="Posts">
        <h1 className="font-bold text-3xl underline">Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {otherPosts.map((post) => (
            // Each Blogs component now correctly becomes a single item within this grid
            <Blogs key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="w-[85%] md:w-[95%] mt-10" id="Newsletter">
        <h1 className="font-bold text-3xl underline">Newsletter</h1>
        <Newsletter />
      </section>
    </main>
  );
};

export default Home;
