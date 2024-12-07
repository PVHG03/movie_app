import mongoose from "mongoose";
import bcrypt from "bcrypt";
import modelOptions from "./modelOption";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
  omitSensitive(): Pick<
    IUser,
    "_id" | "email" | "username" | "createdAt" | "updatedAt"
  >;
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  modelOptions
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.omitSensitive = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
