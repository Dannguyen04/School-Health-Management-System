import express from "express";

import {
    handleLogin,
    handleLogout,
    getUserProfile,
} from "../controllers/Login.js";
import { handleRegister } from "../controllers/Register.js";
import {
    updateCurrentUserProfile,
    uploadProfilePhoto,
} from "../controllers/UserController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";
import {
    uploadProfilePhoto as uploadMiddleware,
    handleUploadError,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/login", handleLogin);
router.post("/logout", authenticateToken, handleLogout);
router.post("/register", handleRegister);
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateCurrentUserProfile);
router.post(
    "/profile/upload-photo",
    authenticateToken,
    uploadMiddleware,
    handleUploadError,
    uploadProfilePhoto
);

export default router;
