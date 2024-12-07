import tmdbConfigs from "./tmdbConfig";

export interface tmdbMediaInterface {
  mediaId?: string;
  mediaType?: string;
  category?: string;
  page?: number;
  query?: string;
  time?: string;
}

export interface tmdbPersonInterface {
  personId?: string;
}

export const tmdbEndpoint = {
  similarMedia: ({ mediaType, mediaId }: tmdbMediaInterface) =>
    tmdbConfigs.getUrl(`/${mediaType}/${mediaId}/similar`),
  trending: ({ mediaType, time, page }: tmdbMediaInterface) =>
    tmdbConfigs.getUrl(`/trending/${mediaType}/${time}`, { page }),
  mediaList: ({ mediaType, category, page }: tmdbMediaInterface) =>
    tmdbConfigs.getUrl(`/${mediaType}/${category}`, { page }),
  mediaDetail: ({ mediaType, mediaId }: tmdbMediaInterface) =>
    tmdbConfigs.getUrl(`/${mediaType}/${mediaId}`, {append_to_response: "videos"}),
  mediaGenres: ({ mediaType }: tmdbMediaInterface) =>
    tmdbConfigs.getUrl(`/genre/${mediaType}/list`),
  mediaCredits: ({ mediaType, mediaId }: tmdbMediaInterface) =>
    tmdbConfigs.getUrl(`/${mediaType}/${mediaId}/credits`),
  mediaVideos: ({ mediaType, mediaId }: tmdbMediaInterface) =>
    tmdbConfigs.getUrl(`/${mediaType}/${mediaId}/videos`),
  mediaImages: ({ mediaType, mediaId }: tmdbMediaInterface) =>
    tmdbConfigs.getUrl(`/${mediaType}/${mediaId}/images`),
  search: ({ mediaType, query, page }: tmdbMediaInterface) =>
    tmdbConfigs.getUrl(`/search/${mediaType}`, { query, page }),
  personDetail: ({ personId }: tmdbPersonInterface) =>
    tmdbConfigs.getUrl(`/person/${personId}`),
  personCredits: ({ personId }: tmdbPersonInterface) =>
    tmdbConfigs.getUrl(`/person/${personId}/combined_credits`),
};
