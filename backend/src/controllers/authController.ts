import { loginSchema, registerSchema } from "../schema/authSchema";
import catchError from "../utils/catchError";
import { createUser, loginUser } from "../services/authService";
import { CREATED, OK } from "../constant/http";
import { setAuthCookies } from "../utils/cookies";
import User from "../models/userModel";

export const logout = catchError(async (req, res) => {
  res.clearCookie("accessToken");
  return res.status(OK).json({
    success: true,
    message: "Logged out",
  });
});

export const login = catchError(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { user, accessToken } = await loginUser(request);

  setAuthCookies({ res, accessToken });

  return res.status(OK).json({
    success: true,
    user: {
      ...user,
    },
  });
});

export const register = catchError(async (req, res) => {
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { user, accessToken } = await createUser(request);

  setAuthCookies({ res, accessToken });

  return res.status(CREATED).json({
    success: true,
    user: {
      ...user,
    },
  });
});

export const authCheck = catchError(async (req, res) => {
  
  const user = await User.findById(req.userId);

  return res.status(OK).json({
    success: true,
    user
  });
});
