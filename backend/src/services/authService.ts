import neo4jClient from "../utils/Neo4j";
import User from "../models/userModel";
import { signToken } from "../utils/jwt";

export interface AccountParams {
  email: string;
  password: string;
  username: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export const loginUser = async (params: LoginParams) => {
  const user = await User.findOne({ email: params.email });

  if (!user || !(await user.matchPassword(params.password))) {
    throw new Error("Invalid email or password");
  }

  const accessToken = signToken({
    userId: user._id,
  });

  return {
    user: user.omitSensitive(),
    accessToken,
  };
};

export const createUser = async (params: AccountParams) => {
  const exisitingUser = await User.findOne({ email: params.email });

  if (exisitingUser) {
    throw new Error("User already exists");
  }

  let user, accessToken;

  try {
    user = await User.create({
      email: params.email,
      password: params.password,
      username: params.username,
    });

    await neo4jClient.Node({
      label: "User",
      properties: {
        id: user._id.toString(),
        name: user.username,
      },
    });

    accessToken = signToken({
      userId: user._id,
    });
  } catch (error: any) {
    if (user) {
      user.deleteOne({ _id: user._id });
    }
    throw new Error(`Error creating user: ${error.message}`);
  }

  return {
    user: user.omitSensitive(),
    accessToken,
  };
};
