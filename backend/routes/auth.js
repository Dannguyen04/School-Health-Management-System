import express from "express";

import {
    handleLogin,
    handleLogout,
    getUserProfile,
} from "../controllers/Login.js";
import { handleRegister } from "../controllers/Register.js";
import { updateCurrentUserProfile } from "../controllers/UserController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/login", handleLogin);
router.post("/logout", authenticateToken, handleLogout);
router.post("/register", handleRegister);
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateCurrentUserProfile);

// Verify token route
router.get("/verify", authenticateToken, (req, res) => {
  // If authenticateToken middleware passes, user is authenticated.
  res.status(200).json({
    success: true,
    message: "Token is valid",
    user: req.user,
  });
});

export default router;
