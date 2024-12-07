import mongoose from "mongoose";

import {MONGO_URI} from "../constant/env";

const connectMongoDB = async () => {
  const mongoURI = MONGO_URI;
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (error : any) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectMongoDB;
