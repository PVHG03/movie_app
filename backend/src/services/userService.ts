import mongoose from "mongoose"
import { tmdbApi } from "../tmdb/tmdbApi";

interface Params {
  currentUser: mongoose.Types.ObjectId,
  mediaId: string,
  mediaType: string
}

export const addFavoriteService = async (data: Params ) => {
  const {currentUser, mediaId, mediaType} = data;

  

}