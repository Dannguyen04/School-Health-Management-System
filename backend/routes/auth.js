import express from "express";

import { handleLogin, handleLogout } from "../controllers/Login.js";
import {
    verifyUser,
    authenticateToken,
} from "../middleware/authenticateToken.js";
import { handleRegister } from "../controllers/Register.js";

const router = express.Router();

router.post("/login", handleLogin);
router.post("/logout", authenticateToken, handleLogout);
router.post("/register", handleRegister);

export default router;
