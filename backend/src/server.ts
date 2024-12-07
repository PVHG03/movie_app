import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config";
import routes from "./routes";
import { PORT } from "./constant/env";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", routes);

app.listen(PORT, async () => {
  const { mongoReady, neo4jReady } = await connectDB();

  if (mongoReady && neo4jReady) {
    console.log("Databases connected successfully");
  } else {
    console.error("Error connecting to databases");
    process.exit(1);
  }

  console.log(`Server is running on http://localhost:${PORT}`);
});
