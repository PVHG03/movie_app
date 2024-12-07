import { Router } from "express";

import {
  getList,
  getDetails,
  search,
  getGenres,
  getTrending,
  getSimilarMedia
} from "../controllers/mediaController";

const router = Router({
  mergeParams: true,
  strict: true,
});

router.get("/search", search);
router.get("/genres", getGenres);

router.get("/:mediaId/similar", getSimilarMedia);
router.get("/:mediaId/details", getDetails);
router.get("/:category", getList);
router.get("/trending/:time", getTrending);

export default router;
