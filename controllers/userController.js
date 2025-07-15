import { ErrorHandler } from "../middlewares/errorMiddleware.js";
import { TryCatch } from "../middlewares/TryCatch.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/userModel.js";

export const getAllUser = TryCatch(async (req, res, next) => {
  const users = await User.find({ accountVerified: true });

  res.status(200).json({
    success: true,
    users,
  });
});

export const updateUser = TryCatch(async (req, res, next) => {
  console.log();
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    updatedUser,
  });
});

export const registerNewAdmin = TryCatch(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Please upload a profile picture", 400));
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please fill all the fields", 400));
  }

  const isRegistered = await User.findOne({ email, accountVerified: true });

  if (isRegistered) {
    return next(new ErrorHandler("User already registered", 400));
  }

  if (password.length < 8 || password.length > 16) {
    return next(
      new ErrorHandler("Password must be between 8 and 16 characters", 400)
    );
  }

  const { avatar } = req.files;
  const allowedExtensions = ["image/jpg", "image/jpeg", "image/png"];

  if (!allowedExtensions.includes(avatar.mimetype)) {
    return next(new ErrorHandler("Please upload a valid image", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const file = await cloudinary.uploader.upload(avatar.tempFilePath, {
    folder: "Librento_admin_avatars",
    width: 150,
    crop: "scale",
  });

  if (!file || file.error) {
    console.error("cloudnary error :", file.error || "unknown cloudnary error");
    return next(new ErrorHandler("Failed to upload image on cloudinary", 400));
  }

  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "Admin",
    accountVerified: true,
    avatar: {
      public_id: file.public_id,
      url: file.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    admin,
  });
});
