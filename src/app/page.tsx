import { Featured } from "./components/Featured/Featured";
import { Blogs } from "./components/Blogs/Blogs";

export default function Home() {
  return (
    <main className="flex flex-col items-center text-center md:text-left mt-4">
      <div className="w-[85%] md:w-[95%]">
        <h1 className="font-bold text-3xl underline">Featured</h1>
        <Featured />
      </div>
      <div className="w-[85%] md:w-[95%] mt-10">
        <h1 className="font-bold text-3xl underline">Other Posts</h1>
        <Blogs />
      </div>
    </main>
      );
}
