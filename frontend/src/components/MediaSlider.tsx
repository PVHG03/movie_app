import { useEffect, useRef, useState } from "react";
import { useContentStore } from "../store/content";
import axios from "axios";
import { Link } from "react-router-dom";
import { SMALL_IMG_BASE_URL } from "../utils/constant";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import toast from "react-hot-toast";

export default function MediaSlider({ category }: { category: string }) {
  const { contentType } = useContentStore() as any;
  const [media, setMedia] = useState<any[]>([]);
  const [arrow, setArrow] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({
      left: -sliderRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({
      left: sliderRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  const toggleFavorite = async (item: any) => {
    try {
      if (item.isFavorite) {
        // Remove favorite
        await axios.delete(`/api/v1/users/favorites/${item.favoriteId}`);
        toast.success("Removed from favorites");
      } else {
        // Add favorite
        const res = await axios.post(`/api/v1/users/favorites`, {
          mediaId: item.id,
          mediaType: contentType,
        });
        item.favoriteId = res.data.favorite.id;
        toast.success("Added to favorites");
      }

      // Update the state to reflect the favorite status
      setMedia((prevMedia) =>
        prevMedia.map((mediaItem) =>
          mediaItem.id === item.id
            ? { ...mediaItem, isFavorite: !mediaItem.isFavorite }
            : mediaItem
        )
      );
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  useEffect(() => {
    const getContent = async () => {
      try {
        const resContent = await axios.get(
          `/api/v1/${contentType}/${category}?page=${Math.random() * 10}`
        );
        const content = resContent.data.content;

        const resFavorites = await axios.get(`/api/v1/users/favorites`);
        const favorites = resFavorites.data.favorites;

        const contentWithFavorites = content.map((item: any) => {
          const favorite = favorites.find(
            (favorite: any) =>
              favorite.mediaId === item.id && favorite.mediaType === contentType
          );
          return {
            ...item,
            isFavorite: !!favorite,
            favoriteId: favorite?.id,
          };
        });
        setMedia(contentWithFavorites);
      } catch (error) {
        toast.error("Failed to fetch content");
      }
    };
    getContent();
  }, [contentType, category]);

  const formattedContentType =
    contentType === "movie" ? "Movies" : "TV Shows";
  const formattedCategory =
    category.replace("_", " ")[0].toUpperCase() +
    category.replace("_", " ").slice(1);

  return (
    <div
      className="bg-black text-white relative px-5 md:px-20"
      onMouseEnter={() => setArrow(true)}
      onMouseLeave={() => setArrow(false)}
    >
      <h2 className="mb-4 text-2xl font-bold">
        {formattedCategory} {formattedContentType}
      </h2>

      <div className="flex space-x-4 overflow-x-hidden" ref={sliderRef}>
        {media.map((item) => (
          <Link
            key={item.id}
            to={`/watch/${item.id}`}
            className="min-w-[250px] relative group"
          >
            {/* Media Image */}
            <div className="rounded-lg overflow-hidden ">
              <img
                src={SMALL_IMG_BASE_URL + item.backdrop_path}
                alt="Media Images"
                className="transition-transform duration-300 ease-in-out group-hover:scale-125"
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black via-transparent to-transparent" />

            {/* Media Title */}
            <div className="absolute bottom-0 left-0 p-2">
              <h3 className="text-white font-bold">
                {item.original_title || item.original_name}
              </h3>
            </div>

            {/* Favorite Button */}
            <button
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(item);
              }}
            >
              {item.isFavorite ? (
                <Heart className="text-red-500" />
              ) : (
                <Heart className="text-white" />
              )}
            </button>
          </Link>
        ))}
      </div>

      {arrow && (
        <>
          <button
            onClick={scrollLeft}
            className="absolute top-1/2 -translate-y-1/2 left-5 md:left-20 flex items-center justify-center w-12 h-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={scrollRight}
            className="absolute top-1/2 -translate-y-1/2 right-5 md:right-20 flex items-center justify-center w-12 h-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}
