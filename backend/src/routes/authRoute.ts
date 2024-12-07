import { Router } from "express";

import { login, register, logout , authCheck} from "../controllers/authController";
import authenticate from "../middlewares/authenticate";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/check", authenticate, authCheck);

export default router;
