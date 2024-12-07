import mongoose from "mongoose";
import modelOptions from "./modelOption";

export interface IFavorite {
  user: mongoose.Types.ObjectId;
  mediaId: number;
  mediaType: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    mediaId: { type: Number, required: true },
    mediaType: { type: String, required: true },
    title: { type: String, required: true },
  },
  modelOptions
);

favoriteSchema.index({ user: 1, mediaId: 1 }, { unique: true });

const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);
export default Favorite;
