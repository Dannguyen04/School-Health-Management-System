import express from "express";
import { handleLogin, handleLogout } from "../controllers/Login.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", handleLogin);
router.post("/logout", authenticateToken, handleLogout);

export default router;
