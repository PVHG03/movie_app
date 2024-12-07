import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ORIGINAL_IMG_BASE_URL } from "../utils/constant";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useContentStore } from "../store/content";
import { Trash } from "lucide-react";

interface Favorite {
  id: string;
  mediaId: number;
  mediaType: string;
  poster_path: string;
  title: string;
  name: string;
}

const FavoritePage = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const { setContentType } = useContentStore() as any;

  // Fetch favorites when component mounts
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get("/api/v1/users/favorites");
        setFavorites(res.data.favorites);
      } catch (error) {
        toast.error("Failed to fetch favorites");
        console.error(error);
      }
    };
    fetchFavorites();
  }, []);

  // Remove a favorite item
  const removeFavorite = async (id: string) => {
    try {
      await axios.delete(`/api/v1/users/favorites/${id}`);
      setFavorites((prevFavorites) =>
        prevFavorites.filter((item) => item.id !== id)
      );
      toast.success("Favorite removed");
    } catch (error) {
      toast.error("Failed to remove favorite");
      console.error(error);
    }
  };

  // Dynamically calculate the height of the background
  // const bgHeight = Math.ceil(favorites.length / 5) * 350; // Adjust 350px for grid item height

  return (

    <div className="bg-black min-h-screen">
      <Navbar />
      <div className="py-8 px-4">
        <h1 className="text-4xl font-bold mb-6">Your Favorites</h1>

        {favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {favorites.map((item: Favorite) => (
              <Link
                onClick={() => setContentType(item.mediaType)}
                to={`/watch/${item.mediaId}`}
                key={item.mediaId}
                className="relative group overflow-hidden rounded-lg shadow-lg border border-gray-800"
              >
                {/* Media Poster */}
                <img
                  src={`${ORIGINAL_IMG_BASE_URL}${item.poster_path}`}
                  alt={item.title || item.name || "No title available"}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <h2 className="text-lg font-bold text-center text-white">
                    {item.title || item.name}
                  </h2>
                </div>
                {/* Remove Favorite Button */}
                <button
                  className="absolute top-2 right-2 text-red-600"
                  onClick={(e) => {
                    e.preventDefault();
                    removeFavorite(item.id);
                  }}
                >
                  <Trash size={24} />
                </button>
              </Link>
            ))}
          </div>
        ) : (
            <p className="text-lg text-gray-400">You have no favorites yet.</p>
        )}
      </div>
    </div>
  );
};

export default FavoritePage;
