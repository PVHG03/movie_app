import mongoose from "mongoose";
import modelOptions from "./modelOption";

export interface IMedia extends Document {
  _id: mongoose.Types.ObjectId;
  mediaId: string;
  mediaType: "movie" | "tv";
  mediaTitle: string;
  // mediaGenres: mongoose.Types.ObjectId[];
  mediaGenres: string[];
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new mongoose.Schema(
  {
    mediaId: { type: String, required: true },
    mediaType: { type: String, enum: ["movie", "tv"], required: true },
    mediaTitle: { type: String, required: true },
    // mediaGenres: [{ type: mongoose.Types.ObjectId, ref: "Genre" }],
    mediaGenres: [{ type: String, required: true }],
  },
  modelOptions
);

mediaSchema.index({ mediaId: 1, mediaType: 1 }, { unique: true });

const Media = mongoose.model<IMedia>("Media", mediaSchema);
export default Media;
