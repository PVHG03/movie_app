import { CookieOptions, Response } from "express";

const defaults: CookieOptions = {
  sameSite: "strict",
  httpOnly: true,
  secure: true,
};

export const getAccessTokenCookieOptions = (): CookieOptions => {
  return {
    ...defaults,
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  };
};

type Params = {
  res: Response;
  accessToken: string;
};

export const setAuthCookies = ({ res, accessToken }: Params) => {
  res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
};

export const clearAuthCookies = ({ res }: { res: Response }) => {
  res.clearCookie("accessToken");
};
