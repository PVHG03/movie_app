import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from "../constant/http";
import Favorite from "../models/favoriteModel";
import User from "../models/userModel";
import { tmdbApi } from "../tmdb/tmdbApi";
import catchError from "../utils/catchError";
import neo4jClient from "../utils/Neo4j";

export const getProfile = catchError(async (req, res) => {
  const currentUser = req.userId;

  const user = await User.findById(currentUser);

  if (!user) {
    return res.status(NOT_FOUND).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(OK).json({
    success: true,
    user: {
      ...user.omitSensitive(),
    },
  });
});

export const updateProfile = catchError(async (req, res) => {
  const currentUser = req.userId;
  const { username, password } = req.body;

  const user = await User.findById(currentUser);
  if (!user) {
    return res.status(NOT_FOUND).json({
      success: false,
      message: "User not found",
    });
  }

  if (username) user.username = username;
  if (password) user.password = password;

  await user.save();

  return res.status(200).json({
    success: true,
    user: {
      ...user.omitSensitive(),
    },
  });
});

export const getFavorites = catchError(async (req, res) => {
  const currentUser = req.userId;

  const favorites = await Favorite.find({ user: currentUser }).populate(
    "mediaId"
  );

  if (favorites.length === 0) {
    return res
      .status(NOT_FOUND)
      .json({ success: false, message: "No favorites found" });
  }

  return res.status(OK).json({
    success: true,
    favorites: {
      ...favorites,
    },
  });
});

export const addFavorite = catchError(async (req, res) => {
  const currentUser = req.userId;
  const { mediaId, mediaType } = req.body;

  const existingFavorite = await Favorite.findOne({
    user: currentUser,
    mediaId,
    mediaType,
  });

  if (existingFavorite) {
    return res.status(BAD_REQUEST).json({
      success: false,
      message: "Media already in favorites",
    });
  }

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

  const favorite = new Favorite({
    user: currentUser,
    mediaId,
    mediaType,
    title: mediaTitle,
  });

  try {
    await Promise.all([
      favorite.save(),

      neo4jClient.Node({
        label: mediaType === "movie" ? "Movie" : "TVShow",
        properties: {
          id: mediaId,
          name: mediaTitle,
        },
      }),

      ...mediaGenres.map((genre: { id: string; name: string }) =>
        neo4jClient
          .Node({
            label: "Genre",
            properties: {
              id: genre.id,
              name: genre.name,
            },
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
      ),

      neo4jClient.Relationship({
        startLabel: "User",
        startId: currentUser.toString(),
        endLabel: mediaType === "movie" ? "Movie" : "TVShow",
        endId: mediaId,
        relationship: "FAVORITED",
      }),
    ]);
  } catch (error: any) {
    console.error(error.message);
    return res.status(BAD_REQUEST).json({
      success: false,
      message: "Failed to add media to favorites",
    });
  }

  return res.status(CREATED).json({
    success: true,
    message: "Media added to favorites",
    favorite: {
      ...favorite,
    },
  });
});

export const deleteFavorite = catchError(async (req, res) => {
  const currentUser = req.userId;
  const { favoriteId } = req.params;

  const favorite = await Favorite.findById(favoriteId);

  if (!favorite) {
    return res.status(NOT_FOUND).json({
      success: false,
      message: "Favorite not found",
    });
  }

  await neo4jClient.deleteRelationship({
    startLabel: "User",
    startId: currentUser.toString(),
    endLabel: favorite.mediaType === "movie" ? "Movie" : "TVShow",
    endId: favorite.mediaId.toString(),
    relationship: "FAVORITED",
  });

  await favorite.deleteOne();

  res.status(200).json({
    success: true,
    message: "Media removed from favorites",
  });
});
