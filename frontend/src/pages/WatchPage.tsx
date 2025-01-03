import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useContentStore } from "../store/content";
import axios from "axios";
import Navbar from "../components/Navbar";
import WatchPageSkeleton from "../components/WatchSkeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactPlayer from "react-player";
import { ORIGINAL_IMG_BASE_URL, SMALL_IMG_BASE_URL } from "../utils/constant";
import ReviewSection from "../components/ReviewSection";
import toast from "react-hot-toast";

const WatchPage = () => {

  interface Trailer {
    id: string;
    key: string;
    [key: string]: any;
  }
  interface Media {
    adult?: boolean;
    [key: string]: any;
  }

  const { id } = useParams();

  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [media, setMedia] = useState<Media>({});
  const [similarMedia, setSimilarMedia] = useState<Media[]>([]);
  const { contentType } = useContentStore() as any;
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getTrailer = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/details`);
        setTrailers(res.data.content.videos.results);
      } catch (error: any) {
        if (error.message.includes('404')) {
          setTrailers([]);
        }
      }
    }
    getTrailer();
  }, [contentType, id])

  useEffect(() => {
    const getSimilarMedia = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/similar`);
        setSimilarMedia(res.data.content);
      } catch (error: any) {
        if (error.message.includes('404')) {
          setSimilarMedia([]);
        }
      }
    }
    getSimilarMedia();
  }, [contentType, id])

  useEffect(() => {
    const getMedia = async () => {
      setIsLoading(true); // Start loading
      try {
        const [mediaRes, favoritesRes] = await Promise.all([
          axios.get(`/api/v1/${contentType}/${id}/details`),
          axios.get(`/api/v1/users/favorite?mediaId=${id}&mediaType=${contentType}`),
        ]);

        const mediaData = mediaRes.data.content;
        const favoritesData = favoritesRes.data;

        if (favoritesData.success) {
          mediaData.isFavorite = true;
          mediaData.favoriteId = favoritesData.favorite.id;
        } else {
          mediaData.isFavorite = false;
        }
        setMedia(mediaData);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setMedia({});
        } else {
          console.error('Error fetching media details:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    getMedia();
    console.log('Media:', media);
  }, [contentType, id]);

  const toggleFavorite = async (media: Media) => {
    try {
      if (media.isFavorite) {
        await axios.delete(`/api/v1/users/favorites/${media.favoriteId}`);
        media.isFavorite = false;
        delete media.favoriteId;
        toast.success("Removed from favorites");
      } else {
        const res = await axios.post(`/api/v1/users/favorites`, {
          mediaId: media.id,
          mediaType: contentType,
        });
        media.isFavorite = true;
        media.favoriteId = res.data.favorite.id;
        toast.success("Added to favorites");
      }
      setMedia({ ...media });
    } catch (error: any) {
      toast.error("Failed to update favorites");
    }
  }

  const handleNext = () => {
    if (currentTrailerIndex < trailers.length - 1) setCurrentTrailerIndex(currentTrailerIndex + 1);
  };
  const handlePrev = () => {
    if (currentTrailerIndex > 0) setCurrentTrailerIndex(currentTrailerIndex - 1);
  };

  const scrollLeft = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: -sliderRef.current.offsetWidth, behavior: "smooth" });
  };
  const scrollRight = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: sliderRef.current.offsetWidth, behavior: "smooth" });
  };


  if (isLoading)
    return (
      <div className='min-h-screen bg-black p-10'>
        <WatchPageSkeleton />
      </div>
    );

  if (!media) {
    return (
      <div className='bg-black text-white h-screen'>
        <div className='max-w-6xl mx-auto'>
          <Navbar />
          <div className='text-center mx-auto px-4 py-8 h-full mt-40'>
            <h2 className='text-2xl sm:text-5xl font-bold text-balance'>Content not found 😥</h2>
          </div>
        </div>
      </div>
    );
  }

  function formatReleaseDate(dateString: string): string {
    if (!dateString) return "Unknown release date";
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <div className='bg-black min-h-screen text-white'>
      <div className='mx-auto container px-4 py-8 h-full'>
        <Navbar />

        {trailers.length > 0 && (
          <div className='flex justify-between items-center mb-4'>
            <button
              className={`
							bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${currentTrailerIndex === 0 ? "opacity-50 cursor-not-allowed " : ""
                }}
							`}
              disabled={currentTrailerIndex === 0}
              onClick={handlePrev}
            >
              <ChevronLeft size={24} />
            </button>

            <button
              className={`
							bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${currentTrailerIndex === trailers.length - 1 ? "opacity-50 cursor-not-allowed " : ""
                }}
							`}
              disabled={currentTrailerIndex === trailers.length - 1}
              onClick={handleNext}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

        <div className='aspect-video mb-8 p-2 sm:px-10 md:px-32'>
          {trailers.length > 0 && (
            <ReactPlayer
              controls={true}
              width={"100%"}
              height={"70vh"}
              className='mx-auto overflow-hidden rounded-lg'
              url={`https://www.youtube.com/watch?v=${trailers[currentTrailerIndex].key}`}
              key={trailers[currentTrailerIndex]?.id}
            />
          )}

          {trailers?.length === 0 && (
            <h2 className='text-xl text-center mt-5'>
              No trailers available for{" "}
              <span className='font-bold text-red-600'>{media?.title || media?.name}</span> 😥
            </h2>
          )}
        </div>

        {/* movie details */}
        <div
          className='flex flex-col md:flex-row items-center justify-between gap-20 max-w-6xl mx-auto'
        >
          <div className='mb-4 md:mb-0'>
            <h2 className='text-5xl font-bold text-balance'>{media?.title || media?.name}</h2>

            <p className='mt-2 text-lg'>
              {formatReleaseDate(media?.release_date || media?.first_air_date)} |{" "}
              {media?.adult ? (
                <span className='text-red-600'>18+</span>
              ) : (
                <span className='text-green-600'>PG-13</span>
              )}{" "}
            </p>
            <p className='mt-4 text-lg'>{media?.overview}</p>
            <div className='mt-4'>
              <h3 className='text-2xl font-bold'>Genres</h3>
              <div className='flex gap-2 mt-2'>
                {media?.genres?.map((genre: any) => (
                  <span
                    key={genre.id}
                    className='bg-gray-800 px-2 py-1 rounded-md text-sm'
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
            <div className='mt-4'>
              <button
                className={media.isFavorite ? 'bg-red-600 text-white py-2 px-4 rounded' : 'bg-gray-500 text-white py-2 px-4 rounded'}
                onClick={() => toggleFavorite(media)}
              >
                Favorite
              </button>
              <button
                className='bg-gray-500 text-white py-2 px-4 rounded mx-5'
                onClick={() => {
                  const reviewSection = document.getElementById('review-section');
                  if (reviewSection) {
                    document.getElementById('review')?.focus();
                    reviewSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Review Section
              </button>
            </div>
          </div>
          <img
            src={ORIGINAL_IMG_BASE_URL + media?.poster_path}
            alt='Poster image'
            className='max-h-[600px] rounded-md'
          />
        </div>

        {similarMedia.length > 0 && (
          <div className='mt-12 max-w-5xl mx-auto relative'>
            <h3 className='text-3xl font-bold mb-4'>Similar Movies/Tv Show</h3>

            <div className='flex overflow-x-hidden scrollbar-hide gap-4 pb-4 group' ref={sliderRef}>
              {similarMedia.map((media: Media) => {
                if (media.poster_path === null) return null;
                return (
                  <Link key={media.id} to={`/watch/${media.id}`} className='w-52 flex-none'>
                    <img
                      src={SMALL_IMG_BASE_URL + media.poster_path}
                      alt='Poster path'
                      className='w-full h-auto rounded-md'
                    />
                    <h4 className='mt-2 text-lg font-semibold'>{media.title || media.name}</h4>
                  </Link>
                );
              })}

              <ChevronRight
                className='absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8
										opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer
										 bg-red-600 text-white rounded-full'
                onClick={scrollRight}
              />
              <ChevronLeft
                className='absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 opacity-0 
								group-hover:opacity-100 transition-all duration-300 cursor-pointer bg-red-600 
								text-white rounded-full'
                onClick={scrollLeft}
              />
            </div>
          </div>
        )}

        <ReviewSection mediaId={id as string} mediaType={contentType}/>
      </div>
    </div>
  );
};
export default WatchPage;