import { Router } from "express";

import {
  getList,
  getDetails,
  search,
  getGenres,
  getTrending,
  getSimilarMedia,
  getRecommendation,
} from "../controllers/mediaController";

const router = Router({
  mergeParams: true,
  strict: true,
});

router.get("/search", search);
router.get("/genres", getGenres);
router.get("/recommendation", getRecommendation);

router.get("/:mediaId/similar", getSimilarMedia);
router.get("/:mediaId/details", getDetails);
router.get("/:category", getList);
router.get("/trending/:time", getTrending);

export default router;
