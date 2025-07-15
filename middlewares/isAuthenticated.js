import { User } from "../models/userModel.js";
import { TryCatch } from "./TryCatch.js";
import jwt from "jsonwebtoken";
import { ErrorHandler } from "./errorMiddleware.js";

export const isAuthenticated = TryCatch(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);

  next();
});

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler("You are not authorized to access this route", 401)
      );
    }
    next();
  };
};
