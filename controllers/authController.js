import bcrypt from "bcrypt";
import { ErrorHandler } from "../middlewares/errorMiddleware.js";
import { TryCatch } from "../middlewares/TryCatch.js";
import { User } from "../models/userModel.js";
import { generateForgetPasswordEmailTemplate } from "../utils/emailTemp.js";
import { sendVerificationCode } from "../utils/features.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

export const register = TryCatch(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return next(new ErrorHandler("Plese enter all fields.", 400));
  }

  const user = await User.findOne({ email, accountVerified: true });

  if (user) {
    return next(new ErrorHandler("User already exists.", 400));
  }

  const registrationAttempts = await User.find({
    email,
    accountVerified: false,
  });

  if (registrationAttempts.length >= 35) {
    return next(
      new ErrorHandler(
        "You have reached the maximum number of registration attempts. Please try again later.",
        400
      )
    );
  }

  if (password.length < 8 || password.length > 16) {
    return next(
      new ErrorHandler(
        "Password must be at least 8 characters long and less than 16 characters.",
        400
      )
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  const verificationCode = await newUser.generateVerificationCode();

  await newUser.save();

  sendVerificationCode(newUser.email, verificationCode, res);

  res.status(201).json({
    success: true,
    message:
      "Registration successful. Please check your email for verification.",
  });
});

export const verifyOtp = TryCatch(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Email or OTP is required.", 400));
  }

  const Attempts = await User.find({
    email,
    accountVerified: false,
  }).sort({ createdAt: -1 });

  // console.log("server se Attempts", Attempts);

  if (!Attempts) {
    return next(new ErrorHandler("No User found.", 404));
  }

  let user;

  if (Attempts.length > 0) {
    user = Attempts[0];
    await User.deleteMany({
      _id: { $ne: user._id },
      email,
      accountVerified: false,
    });
  }

  if (user.verificationCode !== Number(otp)) {
    return next(new ErrorHandler("Invalid OTP.", 400));
  }

  const currentTime = new Date();

  const verificationCodeExpire = new Date(
    user.verificationCodeExpire
  ).getTime();

  // console.log(verificationCodeExpire, currentTime);

  if (verificationCodeExpire < currentTime) {
    return next(new ErrorHandler("Code expired.", 400));
  }

  user.accountVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpire = null;
  await user.save({ validateModifiedOnly: true });

  sendToken(user, 200, "Account Verified Successfully", res);
});

export const login = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter all fields.", 400));
  }

  const user = await User.findOne({ email, accountVerified: true }).select(
    "+password"
  );

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return next(new ErrorHandler("Invalid password.", 400));
  }

  sendToken(user, 200, "Login successful", res);
});

export const logout = TryCatch(async (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export const getUser = TryCatch(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = TryCatch(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is required.", 400));
  }

  const user = await User.findOne({ email, accountVerified: true });

  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateModifiedOnly: true });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = generateForgetPasswordEmailTemplate(
    user.name,
    resetPasswordUrl
  );

  try {
    await sendEmail({
      email: user.email,
      subject: "Librento Password Reset",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateModifiedOnly: true });
    return next(new ErrorHandler("Failed to send email.", 500));
  }
});

export const resetPassword = TryCatch(async (req, res, next) => {
  // console.log(req.body);

  const { token } = req.params;

  // console.log(token);
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid token or token expired.", 400));
  }

  // if (req.body.password !== req.body.confirmPassword) {
  //   return next(new ErrorHandler("Passwords do not match.", 400));
  // }

  // if (
  //   req.body.password.length < 8 ||
  //   req.body.password.length > 16 ||
  //   req.body.confirmPassword.length < 8 ||
  //   req.body.confirmPassword.length > 16
  // ) {
  //   return next(
  //     new ErrorHandler(
  //       "Password must be at least 8 characters long and less than 16 characters.",
  //       400
  //     )
  //   );
  // }

  user.password = await bcrypt.hash(req.body.data, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendToken(user, 200, "Password reset successful", res);
});

export const updatePassword = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const { curPassword, newPassword, confirmPassword } = req.body;

  if (!curPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler("Please enter all fields.", 400));
  }

  const isPasswordCorrect = await bcrypt.compare(curPassword, user.password);

  if (!isPasswordCorrect) {
    return next(new ErrorHandler("Invalid password.", 400));
  }

  if (
    newPassword.length < 8 ||
    newPassword.length > 16 ||
    confirmPassword.length < 8 ||
    confirmPassword.length > 16
  ) {
    return next(
      new ErrorHandler(
        "Password must be at least 8 characters long and less than 16 characters.",
        400
      )
    );
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match.", 400));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});
