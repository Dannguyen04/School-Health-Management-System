import express from "express";
import { login, register, verify } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/verify", authMiddleware, verify);
router.post("/register", register);

export default router;
