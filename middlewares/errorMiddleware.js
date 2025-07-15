class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    err = new ErrorHandler(`Duplicate Field Value Entered`, 400);
  }

  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler(`Json Web Token is invalid. Try again`, 400);
  }

  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler(`Json Web Token is expired. Try again`, 400);
  }

  if (err.name === "CastError") {
    err = new ErrorHandler(`Resource not found. Invalid: ${err.path}`, 400);
  }

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export { errorMiddleware, ErrorHandler };
