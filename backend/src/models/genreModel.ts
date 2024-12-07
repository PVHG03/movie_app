import mongoose, { mongo } from "mongoose";
import modelOptions from "./modelOption";

export interface IGenre extends Document {
  _id: mongoose.Types.ObjectId;
  genreId: string;
  genreName: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const genreSchema = new mongoose.Schema(
  {
    genreId: { type: String, required: true },
    category: { type: String, required: true },
    genreName: { type: String, required: true },
  },
  modelOptions
);

genreSchema.index({ genreId: 1, category: 1 }, { unique: true });

const Genre = mongoose.model<IGenre>("Genre", genreSchema);
export default Genre;
