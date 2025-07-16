import { generateVerificationOtpEmailTemplate } from "./emailTemp.js";
import { sendEmail } from "./sendEmail.js";

export const generateSixDigitVerificationCode = () => {
  const firstDigit = Math.floor(Math.random() * 9) + 1;

  const restDigits = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, 0);

  return parseInt(firstDigit + restDigits);
};

export async function sendVerificationCode(email, verificationCode, res) {
  try {
    const message = generateVerificationOtpEmailTemplate(verificationCode);

    sendEmail({
      email,
      subject: "Verify your email for Librento",
      message,
    });

    return res.status(200).json({
      success: true,
      email,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send verification Code",
    });
  }
}

export const calculateFine = (dueDate) => {
  const finePerHour = 0.5;
  const today = new Date();

  if (today > dueDate) {
    const lateHours = Math.ceil((today - dueDate) / (1000 * 60 * 60));
    return lateHours * finePerHour;
  }
  return 0;
};
