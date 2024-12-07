import { BAD_REQUEST, INTERNAL_SERVER_ERROR, OK } from "../constant/http";
import { tmdbApi } from "../tmdb/tmdbApi";
import catchError from "../utils/catchError";

export const getSimilarMedia = catchError(async (req, res) => {
  const { mediaType, mediaId } = req.params;

  const data = await tmdbApi.similarMedia({ mediaType, mediaId });

  return res.status(OK).json({
    success: true,
    content: data.results,
  });
})

export const getTrending = catchError(async (req, res) => {
  const { mediaType, time = "day"} = req.params;
  const page = parseInt(<string>req.query.page) || 1;

  const data = await tmdbApi.trending({ mediaType, time, page });

  const randonMedia = data.results[Math.floor(Math.random() * data.results.length)];

  return res.status(OK).json({
    success: true,
    total: data.total_results,
    page: data.page,
    content: randonMedia,
    totalPage: data.total_pages,
  });
});

export const search = catchError(async (req, res) => {
  const { mediaType } = req.params;
  const query = <string>req.query.query;
  const page = parseInt(<string>req.query.page) || 1;

  const data = await tmdbApi.search({ mediaType, query, page });

  if (data.results.length === 0) {
    return res.status(OK).json({ message: "No results found" });
  }

  return res.status(OK).json({
    success: true,
    total: data.total_results,
    page: data.page,
    content: data.results,
    totalPage: data.total_pages,
  });
});

export const getList = catchError(async (req, res) => {
  const { mediaType, category } = req.params;
  const page = parseInt(<string>req.query.page) || 1;

  const data = await tmdbApi.mediaList({ mediaType, category, page });

  return res.status(OK).json({
    success: true,
    total: data.total_results,
    page: data.page,
    content: data.results,
    totalPage: data.total_pages,
  });
});

export const getDetails = catchError(async (req, res) => {
  const { mediaType, mediaId } = req.params;

  const data = await tmdbApi.mediaDetail({ mediaType, mediaId });

  return res.status(OK).json({
    success: true,
    content: data,
  });
});

export const getGenres = catchError(async (req, res) => {
  const { mediaType } = req.params;

  const data = await tmdbApi.mediaGenres({ mediaType });

  return res.status(OK).json({
    success: true,
    data,
  });
});
