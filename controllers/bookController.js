import { ErrorHandler } from "../middlewares/errorMiddleware.js";
import { TryCatch } from "../middlewares/TryCatch.js";
import { Book } from "../models/bookModel.js";

export const addBook = TryCatch(async (req, res, next) => {
  const {
    title,
    author,
    isbn,
    category,
    publishYear,
    totalCopies,
    availableCopies,
    coverImage,
    description,
    price,
  } = req.body;

  if (
    !title ||
    !author ||
    !description ||
    !price ||
    !totalCopies ||
    !coverImage ||
    !isbn ||
    !category ||
    !publishYear
  ) {
    return next(new ErrorHandler("Please fill all fields", 400));
  }

  const book = await Book.create({
    title,
    author,
    isbn,
    category,
    publishYear,
    totalCopies,
    availableCopies: totalCopies,
    coverImage,
    description,
    price,
  });

  res.status(201).json({
    success: true,
    message: "Book added successfully",
    book,
  });
});

export const updateBook = TryCatch(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  let data = req.body;
  data.availableCopies = data.totalCopies;

  const updatedBook = await Book.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });

  res.status(200).json({
    success: true,
    message: "Book updated successfully",
    updatedBook,
  });
});

export const getBooks = TryCatch(async (req, res, next) => {
  const books = await Book.find();
  res.status(200).json({
    success: true,
    books,
  });
});

export const deleteBook = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }
  await book.deleteOne();
  res.status(200).json({
    success: true,
    message: "Book deleted successfully",
  });
});
