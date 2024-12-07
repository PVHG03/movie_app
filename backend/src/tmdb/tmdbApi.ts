import axios from "../utils/axios";
import {
  tmdbEndpoint,
  tmdbMediaInterface,
  tmdbPersonInterface,
} from "./tmdbEndpoint";

export const tmdbApi = {
  similarMedia: async ({ mediaType, mediaId }: tmdbMediaInterface) =>
    await axios.get(tmdbEndpoint.similarMedia({ mediaType, mediaId })),
  trending: async ({ mediaType, time, page }: tmdbMediaInterface) =>
    await axios.get(tmdbEndpoint.trending({ mediaType, time, page })),
  mediaList: async ({ mediaType, category, page }: tmdbMediaInterface) =>
    await axios.get(tmdbEndpoint.mediaList({ mediaType, category, page })),
  mediaDetail: async ({ mediaType, mediaId }: tmdbMediaInterface) =>
    await axios.get(tmdbEndpoint.mediaDetail({ mediaType, mediaId })),
  mediaCredits: async ({ mediaType, mediaId }: tmdbMediaInterface) =>
    await axios.get(tmdbEndpoint.mediaCredits({ mediaType, mediaId })),
  personDetail: async ({ personId }: tmdbPersonInterface) =>
    await axios.get(tmdbEndpoint.personDetail({ personId })),
  personCredits: async ({ personId }: tmdbPersonInterface) =>
    await axios.get(tmdbEndpoint.personCredits({ personId })),
  search: async ({ mediaType, query, page }: tmdbMediaInterface) =>
    await axios.get(tmdbEndpoint.search({ mediaType, query, page })),
  mediaImages: async ({ mediaType, mediaId }: tmdbMediaInterface) =>
    await axios.get(tmdbEndpoint.mediaImages({ mediaType, mediaId })),
  mediaVideos: async ({ mediaType, mediaId }: tmdbMediaInterface) =>
    await axios.get(tmdbEndpoint.mediaVideos({ mediaType, mediaId })),
  mediaGenres: async ({ mediaType }: tmdbMediaInterface) =>
    await axios.get(tmdbEndpoint.mediaGenres({ mediaType })),
};
