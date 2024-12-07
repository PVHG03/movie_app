import { RequestHandler } from "express";
import { UNAUTHORIZED } from "../constant/http";
import { verifyToken } from "../utils/jwt";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constant/appErrorCode";

const authenticate: RequestHandler = (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(
    accessToken,
    UNAUTHORIZED,
    "Unauthorized",
    AppErrorCode.InvalidAccessToken
  );

  const { error, payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === "TokenExpiredError" ? "Token expired" : "Invalid token",
    AppErrorCode.InvalidAccessToken
  );

  req.userId = payload.userId;
  next();
};

export default authenticate;