import express from "express";
import { addStudent, getAllStudent } from "../controllers/AdminController.js";
import {
    authenticateToken,
    verifyAdmin,
} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, verifyAdmin, addStudent);

router.get("/", authenticateToken, verifyAdmin, getAllStudent);

export default router;
