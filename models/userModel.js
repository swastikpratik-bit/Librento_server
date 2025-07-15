import mongoose, { mongo } from "mongoose";
import jwt from "jsonwebtoken";
import { generateSixDigitVerificationCode } from "../utils/features.js";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      // required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Exactly 10 digits, numeric only
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit phone number!`,
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    borrowedBooks: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Borrow",
        },
        returned: {
          type: Boolean,
          default: false,
        },
        bookTitle: String,
        borrowedDate: Date,
        dueDate: Date,
      },
    ],

    avatar: {
      public_id: String,
      url: String,
    },

    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateVerificationCode = function () {
  const verificationCode = generateSixDigitVerificationCode();
  this.verificationCode = verificationCode;
  this.verificationCodeExpire = new Date(Date.now() + 10 * 60 * 1000);
  return verificationCode;
};

userSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

export const User = mongoose.model("User", userSchema);
