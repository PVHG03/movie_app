import { Router } from "express";

import {
  getProfile,
  updateProfile,
  getFavorite,
  getFavorites,
  addFavorite,
  deleteFavorite,
} from "../controllers/userController";
import authenticate from "../middlewares/authenticate";

const router = Router();

router.use(authenticate);

router.get("/", getProfile);
router.put("/", updateProfile);

router.get("/favorite", getFavorite);
router.get("/favorites", getFavorites);
router.post("/favorites", addFavorite);
router.delete("/favorites/:favoriteId", deleteFavorite);

export default router;
