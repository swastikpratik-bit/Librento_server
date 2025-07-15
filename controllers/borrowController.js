import { TryCatch } from "../middlewares/TryCatch.js";
import { User } from "../models/userModel.js";
import { Book } from "../models/bookModel.js";
import { Borrow } from "../models/borrowModel.js";
import { ErrorHandler } from "../middlewares/errorMiddleware.js";
import { calculateFine } from "../utils/features.js";

export const borrowedBooks = TryCatch(async (req, res, next) => {
  // console.log("borrowed books in server");

  const borrowedBook = await Borrow.find();

  // console.log("borrowedBook from server", borrowedBook);

  res.status(200).json({
    success: true,
    borrowedBook,
  });
});

// for user
export const getBorrowedBooks = TryCatch(async (req, res, next) => {
  const borrowedBooks = req.user.borrowedBooks;

  res.status(200).json({
    success: true,
    borrowedBooks,
  });
});

export const recordBorrowBook = TryCatch(async (req, res, next) => {
  const { bookId } = req.params;
  const { email } = req.body;

  // console.log("server", bookId, email);

  const book = await Book.findById(bookId);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  const user = await User.findOne({ email, accountVerified: true });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (book.availableCopies === 0) {
    return next(new ErrorHandler("Book not available", 400));
  }

  const isBorrowed = user.borrowedBooks.find((borrowedBook) => {
    return (
      borrowedBook.bookId.toString() === bookId &&
      borrowedBook.returned === false
    );
  });

  if (isBorrowed) {
    return next(new ErrorHandler("Book already borrowed", 400));
  }

  book.availableCopies -= 1;
  // book.availability = book.availableCopies > 0 ? true : false;
  await book.save();

  user.borrowedBooks.push({
    bookId: book._id,
    bookTitle: book.title,
    borrowedDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await user.save();

  const currentBorrow = await Borrow.create({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    book: book._id,
    price: book.price,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.status(200).json({
    success: true,
    message: "Book borrowed successfully",
    currentBorrow,
  });
});

export const returnBorrowedBook = TryCatch(async (req, res, next) => {
  const { bookId } = req.params;
  const { email } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  const user = await User.findOne({ email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const borrowedBook = user.borrowedBooks.find((borrowedBook) => {
    return (
      borrowedBook.bookId.toString() === bookId &&
      borrowedBook.returned === false
    );
  });

  if (!borrowedBook) {
    return next(new ErrorHandler("Book not borrowed", 400));
  }

  borrowedBook.returned = true;
  await user.save();

  book.availableCopies += 1;
  // book.availability = book.availableCopies > 0 ? true : false;
  await book.save();

  const borrow = await Borrow.findOne({
    book: bookId,
    "user.email": email,
    returnDate: null,
  });

  if (!borrow) {
    return next(new ErrorHandler("Book not borrowed", 400));
  }

  borrow.returnDate = new Date();
  const fine = calculateFine(borrow.dueDate);
  borrow.fine = fine;
  await borrow.save();

  res.status(200).json({
    success: true,
    message: `Book returned successfully. Total charges are book price ₹${
      book.price
    } + fine ₹${fine} = ₹${book.price + fine}.`,
  });
});
