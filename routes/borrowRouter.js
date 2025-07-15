import express from "express";
import {
  borrowedBooks,
  recordBorrowBook,
  returnBorrowedBook,
  getBorrowedBooks,
} from "../controllers/borrowController.js";
import {
  isAuthorized,
  isAuthenticated,
} from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post(
  "/record-borrow/:bookId",
  isAuthenticated,
  isAuthorized("Admin"),
  recordBorrowBook
);
router.get(
  "/borrowed-books",
  isAuthenticated,
  isAuthorized("Admin"),
  borrowedBooks
);

router.get("/my-borrowed-books", isAuthenticated, getBorrowedBooks);

router.put(
  "/return-borrowed-book/:bookId",
  isAuthenticated,
  isAuthorized("Admin"),
  returnBorrowedBook
);

export default router;
