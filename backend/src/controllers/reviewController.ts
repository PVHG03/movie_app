import { BAD_REQUEST, NOT_FOUND, OK } from "../constant/http";
import Review from "../models/reviewModel";
import { tmdbApi } from "../tmdb/tmdbApi";
import catchError from "../utils/catchError";
import neo4jClient from "../utils/Neo4j";

export const getReviewsOfUser = catchError(async (req, res) => {
  const currentUser = req.userId;

  const reviews = await Review.find({ user: currentUser }).sort({
    createdAt: -1,
  });

  if (!reviews) {
    return res.status(404).json({
      success: false,
      message: "No review found",
    });
  }

  res.status(OK).json({
    success: true,
    reviews: {
      count: reviews.length,
      data: reviews,
    },
  });
});

export const postReview = catchError(async (req, res) => {
  const currentUser = req.userId;
  const { mediaId, mediaType, rating, comment } = req.body;

  const { mediaTitle, mediaGenres } = await tmdbApi
    .mediaDetail({ mediaId, mediaType })
    .then((data) => ({
      mediaTitle: data.original_title,
      mediaGenres: data.genres,
    }))
    .catch((error: any): any => {
      console.error(error);
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Failed to add media to favorites",
      });
    });

  const review = new Review({
    user: currentUser,
    mediaId,
    mediaType,
    title: mediaTitle,
    rating: rating,
    comment: comment,
  });

  try {
    await Promise.all([
      review.save(),

      neo4jClient.Node({
        label: mediaType === "movie" ? "Movie" : "TVShow",
        properties: {
          id: mediaId,
          name: mediaTitle,
        },
      }),

      ...mediaGenres.map((genre: { id: string; name: string }) =>
        neo4jClient.Node({
          label: "Genre",
          properties: {
            id: genre.id,
            name: genre.name,
          },
        })
      ),

      neo4jClient.Relationship({
        startLabel: "User",
        startId: currentUser.toString(),
        endLabel: mediaType === "movie" ? "Movie" : "TVShow",
        endId: mediaId,
        relationship: "REVIEWED",
        properties: {
          rating,
          comment,
        },
      }),
    ]);
  } catch (error: any) {
    console.error(error.message);
    return res.status(BAD_REQUEST).json({
      success: false,
      message: "Failed to add review",
    });
  }

  return res.status(OK).json({
    success: true,
    review: {
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    },
  });
});

export const updateReview = catchError(async (req, res) => {
  const currentUser = req.userId;
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findOne({ _id: id, user: currentUser });
  if (!review) {
    return res.status(NOT_FOUND).json({
      success: false,
      message: "Review not found",
    });
  }

  review.rating = rating;
  review.comment = comment;

  await Promise.all([
    review.save(),

    neo4jClient.Relationship({
      startLabel: "User",
      startId: currentUser.toString(),
      endLabel: review.mediaType === "movie" ? "Movie" : "TVShow",
      endId: review.mediaId.toString(),
      relationship: "REVIEWED",
      properties: {
        rating,
        comment,
      },
    }),
  ]);

  return res.status(OK).json({
    success: true,
    review: {
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    },
  });
});

export const deleteReview = catchError(async (req, res) => {
  const currentUser = req.userId;
  const { id } = req.params;

  const review = await Review.findOne({ _id: id, user: currentUser });
  if (!review) {
    return res.status(NOT_FOUND).json({
      success: false,
      message: "Review not found",
    });
  }

  await review.deleteOne();

  await neo4jClient.deleteRelationship({
    startLabel: "User",
    startId: currentUser.toString(),
    endLabel: review.mediaType === "movie" ? "Movie" : "TVShow",
    endId: review.mediaId.toString(),
    relationship: "REVIEWED",
  });

  return res.status(OK).json({
    success: true,
    message: "Review deleted successfully",
  });
});
