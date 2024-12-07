import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";

import { IUser } from "../models/userModel";
import { JWT_SECRET } from "../constant/env";
import { Audience } from "../constant/audience";

type SignOptionsAndSecret = SignOptions & {
  secret: string;
};

export type AccessTokenPayload = {
  userId: IUser["_id"];
};

const defaults: SignOptions = {
  audience: [Audience.USER],
};

const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "15d",
  secret: JWT_SECRET,
};

export const signToken = (
  payload: AccessTokenPayload,
  options?: SignOptionsAndSecret
) => {
  const { secret, ...signOptions } = options || accessTokenSignOptions;
  return jwt.sign(payload, secret, {
    ...defaults,
    ...signOptions,
  });
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptions & { secret?: string }
) => {
  const { secret = JWT_SECRET, ...verifyOpts } = options || {};

  try {
    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...verifyOpts,
    }) as TPayload;
    return { payload };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};
