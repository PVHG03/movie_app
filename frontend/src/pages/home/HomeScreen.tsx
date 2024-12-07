import { Info, Play } from "lucide-react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import { MOVIE_CATEGORY, ORIGINAL_IMG_BASE_URL, TV_CATEGORY } from "../../utils/constant";
import useGetTrending from "../../hooks/useGetTrending";
import { useContentStore } from "../../store/content";
import MediaSlider from "../../components/MediaSlider";
import { useState } from "react";

export default function HomeScreen() {
  const { trending } = useGetTrending() as any;
  const { contentType } = useContentStore() as any;
  const [imgLoading, setImgLoading] = useState(true);

  if (!trending) return (
    <div>
      <Navbar />
      <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex items-center -z-10 shimmer" />
    </div>
  )

  return (
    <>
      <div className="relative h-screen text-white ">
        <Navbar></Navbar>

        {imgLoading && (
          <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex items-center -z-10 shimmer" />
        )}

        <img onLoad={
          () => setImgLoading(false)
        } src={ORIGINAL_IMG_BASE_URL + trending?.poster_path} alt="" className="absolute top-0 left-0 w-full h-full object-cover -z-50 " aria-hidden={true} />

        <div className="absolute top-0 left-0 w-full h-full object-cover -z-50 bg-black/50"  >
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-32">
            <div className="bg-gradient-to-b from-black via-transparent to-transparent absolute top-0 left-0 w-full h-full -z-10" />
            <div className="max-w-2xl">
              <h1 className="mt-4 text-6xl font-extrabold text-balance">{trending?.original_title || trending?.original_name}</h1>
              <p className="mt-2 text-lg">{trending?.release_date?.split("-")[0] || trending?.first_air_date.split("-")[0]} | {trending?.adult === false ? "PG-13" : "18+"}</p>
              <p className="mt-4 text-lg">{trending?.overview?.length > 200 ? trending?.overview.slice(0, 200) + "..." : trending?.overview?.length}</p>
            </div>

            <div className="mt-8 flex">
              <Link to={`/watch/${trending?.id}`} className="bg-white hover:bg-white/80 text-black font-bold py-2 px-4 rounded mr-4 flex items-center">
                <Play className="inline-block mr-2 size-6 fill-black" />
                Play
              </Link>

              <Link to={`/watch/${trending?.id}`} className="bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded flex items-center">
                <Info className="inline-block mr-2 size-6 fill-black" />
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10 bg-black py-5">
        {contentType === "movie" ? (
          MOVIE_CATEGORY.map((category: string) => <MediaSlider key={category} category={category} />)
        ) : (
          TV_CATEGORY.map((category: string) => <MediaSlider key={category} category={category} />
          ))}
      </div>
    </>
  );
}