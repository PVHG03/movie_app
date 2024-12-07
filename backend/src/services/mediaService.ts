import Media from "../models/mediaModel";
import { tmdbApi } from "../tmdb/tmdbApi";

interface MediaParams {
  mediaId: string;
  mediaType: string;
}

export const saveMedia = async (data: MediaParams) => {
  const { mediaId, mediaType } = data;

  const media = await Media.findOne({ mediaId, mediaType });
  if (media) {
    throw new Error("Media already exists");
  }

  const response = await tmdbApi.mediaDetail({ mediaId, mediaType });

  new Media({
    mediaId,
    mediaType,
    mediaTitle: response.title,
    mediaPoster: response.poster_path,
    mediaBackdrop: response.backdrop_path,
    mediaReleaseDate: response.release_date,
    mediaGenres: response.genres.map((genre: any) => genre.name),
    mediaOverview: response.overview,
    mediaTrailer: response.trailer,
  });

  

  await media.save();
};
