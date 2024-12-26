import { Router } from "express";

import {
  getReviewsOfUser,
  postReview,
  deleteReview,
  updateReview,
} from "../controllers/reviewController";
import authenticate from "../middlewares/authenticate";

const router = Router();

router.get("/:mediaType/:mediaId", getReviewsOfUser);

router.use(authenticate);
router.post("/:mediaType/:mediaId", postReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;
