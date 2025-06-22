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
    verifyAdmin,
} from "../middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, verifyAdmin, addStudent);

router.get("/", authenticateToken, verifyAdmin, getAllStudents);

router.put("/:id", authenticateToken, verifyAdmin, updateStudent);

router.delete("/:id", authenticateToken, verifyAdmin, deleteUser);

router.get("/filter", authenticateToken, verifyAdmin, filterStudents);
export default router;
