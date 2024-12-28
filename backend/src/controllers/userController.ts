import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "../constant/http";
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
    user: user.omitSensitive(),
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
    user: user.omitSensitive(),
  });
});

export const getFavorites = catchError(async (req, res) => {
  const currentUser = req.userId;

  const favorites = await Favorite.find({ user: currentUser });

  return res.status(OK).json({
    success: true,
    favorites,
  });
});

export const getFavorite = catchError(async (req, res) => {
  const currentUser = req.userId;
  const { mediaId, mediaType } = req.query;

  const favorite = await Favorite.findOne({
    user: currentUser,
    mediaId,
    mediaType,
  });

  return res.status(OK).json({
    success: favorite ? true : false,
    favorite,
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

  let mediaData;
  try {
    mediaData = await tmdbApi.mediaDetail({ mediaId, mediaType });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch media details",
    });
  }

  const {
    original_title,
    original_name,
    backdrop_path,
    poster_path,
    genres,
    title,
    name,
  } = mediaData;

  const mediaTitle = title || name || original_title || original_name;

  const favorite = new Favorite({
    user: currentUser,
    mediaId,
    mediaType,
    title: mediaTitle,
    backdrop_path: backdrop_path,
    poster_path: poster_path,
  });

  await favorite.save();

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

    // Add "FAVORITED" relationship
    await neo4jClient.Relationship({
      startLabel: "User",
      startId: currentUser.toString(),
      endLabel: mediaType === "movie" ? "Movie" : "TVShow",
      endId: mediaId,
      relationship: "FAVORITED",
    });
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update relationships in Neo4j",
    });
  }

  return res.status(CREATED).json({
    success: true,
    favorite,
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
    endId: favorite.mediaId,
    relationship: "FAVORITED",
  });

  await favorite.deleteOne();

  res.status(200).json({
    success: true,
  });
});
