import express from "express";
import {
    addStudent,
    deleteUser,
    filterStudents,
    getAllStudents,
    updateStudent,
} from "../controllers/AdminController.js";
import {
    authenticateToken,
    verifyManager,
} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, verifyManager, addStudent);

router.get("/", authenticateToken, verifyManager, getAllStudents);

router.put("/:id", authenticateToken, verifyManager, updateStudent);

router.delete("/:id", authenticateToken, verifyManager, deleteUser);

router.get("/filter", authenticateToken, verifyManager, filterStudents);

export default router;
