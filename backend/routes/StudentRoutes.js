import express from "express";
import { addStudent } from "../controllers/AdminController.js";
import {
    authenticateToken,
    verifyAdmin,
} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/add", authenticateToken, verifyAdmin, addStudent);

export default router;
