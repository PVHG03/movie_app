import { Router } from "express";

import {
  getReviewsOfUser,
  postReview,
  deleteReview,
} from "../controllers/reviewController";
import authenticate from "../middlewares/authenticate";

const router = Router();

router.use(authenticate);
router.get("/", getReviewsOfUser);
router.post("/", postReview);
router.delete("/:id", deleteReview);

export default router;
