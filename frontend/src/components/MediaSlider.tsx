import { useEffect, useRef, useState } from "react";
import { useContentStore } from "../store/content";
import axios from "axios";
import { Link } from "react-router-dom";
import { SMALL_IMG_BASE_URL } from "../utils/constant";
import { ChevronLeft, ChevronRight } from "lucide-react";


export default function MediaSlider({ category }: { category: string }) {

  const { contentType } = useContentStore() as any;
  const [media, setMedia] = useState([]);
  const [arrow, setArrow] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({left:-sliderRef.current.offsetWidth, behavior: "smooth"});
    }
  }
  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({left:sliderRef.current.offsetWidth, behavior: "smooth"});
    }
  }


  useEffect(() => {
    const getContent = async () => {
      const res = await axios.get(`/api/v1/${contentType}/${category}?page=1`);
      setMedia(res.data.content);
    }
    getContent();
  }, [contentType, category])


  const formatedContentType = contentType === "movie" ? "Movies" : "TV Shows";

  const formatedCategory = category.replace("_", " ")[0].toUpperCase() + category.replace("_", " ").slice(1);

  return (
    <div className="bg-black text-white relative px-5 md:px-20"
      onMouseEnter={() => setArrow(true)}
      onMouseLeave={() => setArrow(false)}>
      <h2 className="mb-4 text-2xl font-bold">{formatedCategory} {formatedContentType}</h2>

      <div className="flex space-x-4 overflow-x-hidden" ref={sliderRef}>
        {media.map((item: any) => (
          <Link key={item.id} to={`/watch/${item.id}`} className="min-w-[250px] relative group">
            <div className="rounded-lg overflow-hidden ">
              <img src={SMALL_IMG_BASE_URL + item.backdrop_path}
                alt="Media Images"
                className="transition-transform duration-300 ease-in-out group-hover:scale-125" />
            </div>

            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 p-2">
              <h3 className="text-white font-bold">{item.original_title || item.original_name}</h3>
            </div>
          </Link>
        ))}
      </div>

        {arrow && (
          <>
            <button onClick={scrollLeft} className="absolute top-1/2 -translate-y-1/2 left-5 md:left-20 flex items-center justify-center size-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10">
              <ChevronLeft className="size-8" />
            </button>

            <button onClick={scrollRight} className="absolute top-1/2 -translate-y-1/2 right-5 md:right-20 flex items-center justify-center size-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10">
              <ChevronRight className="size-8" />
            </button>
          </>
        )}

    </div>
  )
}