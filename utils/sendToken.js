export const sendToken = (user, statusCode, message, res) => {
  const token = user.generateJWT();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    user,
    message,
    token,
  });
};
