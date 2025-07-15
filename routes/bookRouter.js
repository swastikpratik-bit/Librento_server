import {
  isAuthorized,
  isAuthenticated,
} from "../middlewares/isAuthenticated.js";
import express from "express";
import {
  addBook,
  deleteBook,
  getBooks,
  updateBook,
} from "../controllers/bookController.js";

const router = express.Router();

router.post("/admin/add", isAuthenticated, isAuthorized("Admin"), addBook);
router.put(
  "/admin/update/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateBook
);
router.get("/all", isAuthenticated, getBooks);
router.delete(
  "/admin/delete/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteBook
);
export default router;
