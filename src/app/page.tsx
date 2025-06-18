import { Featured } from "./components/Featured/Featured";
import { Blogs } from "./components/Blogs/Blogs";
import { Playlist } from "./components/Playlist/Playlist";
import { Newsletter } from "./components/Newsletter/Newsletter";
import { fetchPlaylistDataFromServer } from "./utils/spotifyServerUtils";
import { JSX } from "react";

// Home page component as an async arrow function
const Home: React.FC = async (): Promise<JSX.Element> => {
  // Fetch initial playlist data from the server
  const initalPlaylist = await fetchPlaylistDataFromServer();

  return (
    // Main container for the home page
    <main className="flex flex-col items-center text-center md:text-left mt-4">
      {/* Featured section */}
      <div className="w-[85%] md:w-[95%]">
        <h1 className="font-bold text-3xl underline">Featured</h1>
        <Featured />
      </div>

      {/* Playlist section */}
      <div className="w-[85%] md:w-[95%] mt-10">
        <h1 className="font-bold text-3xl underline">Playlist</h1>
          <Playlist initialPlaylistData={initalPlaylist}/>
      </div>

      {/* Other blog posts section */}
      <div className="w-[85%] md:w-[95%] mt-10">
        <h1 className="font-bold text-3xl underline">Other Posts</h1>
        <Blogs />
      </div>

      <div className="w-[85%] md:w-[95%] mt-10">
        <h1 className="font-bold text-3xl underline">Newsletter</h1>
          <Newsletter />
      </div>
    </main>
  );
};

export default Home;