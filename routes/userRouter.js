import express from "express";
import {
  getAllUser,
  registerNewAdmin,
  updateUser,
} from "../controllers/userController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/all", isAuthenticated, isAuthorized("Admin"), getAllUser);
router.post(
  "/add/new-admin",
  isAuthenticated,
  isAuthorized("Admin"),
  registerNewAdmin
);
router.put("/update/:id", isAuthenticated, isAuthorized("Admin"), updateUser);

export default router;
