import express from "express";
import {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
} from "../controllers/StudentController.js";
import {
    authenticateToken,
    verifyAdmin,
    verifyManager,
} from "../middleware/authenticateToken.js";

const router = express.Router();

// Route cho admin
router.post("/", authenticateToken, verifyAdmin, createStudent);
router.get("/", authenticateToken, verifyAdmin, getAllStudents);
router.get("/:id", authenticateToken, verifyAdmin, getStudentById);
router.put("/:id", authenticateToken, verifyAdmin, updateStudent);
router.delete("/:id", authenticateToken, verifyAdmin, deleteStudent);

// Route cho manager
router.post("/manager", authenticateToken, verifyManager, createStudent);
router.get("/manager", authenticateToken, verifyManager, getAllStudents);
router.get("/manager/:id", authenticateToken, verifyManager, getStudentById);
router.put("/manager/:id", authenticateToken, verifyManager, updateStudent);
router.delete("/manager/:id", authenticateToken, verifyManager, deleteStudent);

export default router;
