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
});

export const getRecommendation = catchError(async (req, res) => {
  const { mediaType } = req.params;
});

export const getTrending = catchError(async (req, res) => {
  const { mediaType, time = "day" } = req.params;
  const page = parseInt(<string>req.query.page) || 1;

  const data = await tmdbApi.trending({ mediaType, time, page });

  const randonMedia =
    data.results[Math.floor(Math.random() * data.results.length)];

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
  const query = req.query.query as string;
  const page = parseInt(req.query.page as string) || 1;

  const data = await tmdbApi.search({ mediaType, query, page });

  // if (!data.results || data.results.length === 0) {
  //   return res.status(OK).json({ message: "No results found" });
  // }

  // Define weights for each sorting criterion
  const WEIGHTS = {
    voteAverage: 0.5, // 50% weight
    voteCount: 0.3, // 30% weight
    releaseDate: 0.2, // 20% weight
  };

  const currentDate = new Date();

  const calculateScore = (item: any) => {
    const voteAverageScore = item.vote_average || 0;
    const voteCountScore = Math.log10(item.vote_count || 1); // Logarithmic scale for vote count
    const releaseDateScore = item.release_date
      ? 1 /
        (Math.abs(
          currentDate.getTime() - new Date(item.release_date).getTime()
        ) +
          1)
      : 0;

    return (
      voteAverageScore * WEIGHTS.voteAverage +
      voteCountScore * WEIGHTS.voteCount +
      releaseDateScore * WEIGHTS.releaseDate
    );
  };

  // Sort results by the calculated weighted score
  const sortedResults = data.results
    .map((item: any) => ({
      ...item,
      score: calculateScore(item),
    }))
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

  return res.status(OK).json({
    success: true,
    total: data.total_results,
    page: data.page,
    content: sortedResults, // Use sorted results
    totalPages: data.total_pages,
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
