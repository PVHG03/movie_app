import mongoose from "mongoose";
import modelOptions from "./modelOption";

export interface IReview {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  mediaId: number;
  mediaType: string;
  comment: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    mediaId: { type: Number, required: true },
    mediaType: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  modelOptions
);

reviewSchema.index({ user: 1, mediaId: 1 }, { unique: true });

const Review = mongoose.model<IReview>("Review", reviewSchema);
export default Review;
