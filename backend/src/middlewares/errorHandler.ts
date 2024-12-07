import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "../constant/http";
import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`PATH ${req.path} | METHOD ${req.method}`, err);
  const statusCode = err.statusCode || INTERNAL_SERVER_ERROR;

  if (err.name === "ValidationError") {
    return res.status(BAD_REQUEST).json({
      message: "Validation error occurred",
      details: err.message,
    });
  } else if (err.name === "UnauthorizedError") {
    return res.status(UNAUTHORIZED).json({
      message: "Unauthorized access",
    });
  }

  res.status(statusCode).json({
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });

  next();
};

export default errorHandler;
