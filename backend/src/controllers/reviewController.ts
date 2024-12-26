import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "../constant/http";
import Review from "../models/reviewModel";
import User from "../models/userModel";
import { tmdbApi } from "../tmdb/tmdbApi";
import catchError from "../utils/catchError";
import neo4jClient from "../utils/Neo4j";

export const getReviewsOfUser = catchError(async (req, res) => {
  const { mediaId, mediaType } = req.params;

  const reviews = await Review.find({
    mediaId,
    mediaType,
  })
    .populate("user", "username", User)
    .sort({ createdAt: -1 });

  if (!reviews) {
    return res.status(404).json({
      success: false,
      message: "No review found",
    });
  }

  res.status(OK).json({
    success: true,
    reviews,
  });
});

export const postReview = catchError(async (req, res) => {
  const currentUser = req.userId;
  const { mediaId, mediaType } = req.params;
  const { rating, comment } = req.body;

  let mediaData;
  try {
    mediaData = await tmdbApi.mediaDetail({ mediaId, mediaType });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch media details",
    });
  }
  const username  = await User.findById(currentUser).select("username");

  const {
    original_title,
    original_name,
    backdrop_path,
    poster_path,
    genres,
    title,
    name,
  } = mediaData;

  const mediaTitle = original_title || original_name || title || name;

  const review = new Review({
    user: currentUser,
    mediaId,
    mediaType,
    title: mediaTitle,
    rating: rating,
    comment: comment,
  });

  await review.save();

  try {
    // Add media node
    await neo4jClient.Node({
      label: mediaType === "movie" ? "Movie" : "TVShow",
      properties: { id: mediaId, name: mediaTitle },
    });

    // Add genre nodes and relationships
    if (genres?.length) {
      await Promise.all(
        genres.map((genre: any) =>
          neo4jClient
            .Node({
              label: "Genre",
              properties: { id: genre.id, name: genre.name },
            })
            .then(() =>
              neo4jClient.Relationship({
                startLabel: mediaType === "movie" ? "Movie" : "TVShow",
                startId: mediaId,
                endLabel: "Genre",
                endId: genre.id,
                relationship: "BELONGS_TO",
              })
            )
        )
      );
    }

    await neo4jClient.Relationship({
      startLabel: "User",
      startId: currentUser.toString(),
      endLabel: mediaType === "movie" ? "Movie" : "TVShow",
      endId: mediaId,
      relationship: "REVIEWED",
      properties: {
        rating,
      },
    });
  } catch (error) {
    console.error("Error in Neo4j operations:", error);
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update relationships in Neo4j",
    });
  }

  return res.status(OK).json({
    success: true,
    review: {
      username: username?.username,
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

  const review = await Review.findById(id);
  if (!review) {
    return res.status(NOT_FOUND).json({
      success: false,
      message: "Review not found",
    });
  }

  if (rating) {
    review.rating = rating;
  }
  if (comment) {
    review.comment = comment;
  }

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

  const review = await Review.findById(id);
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
