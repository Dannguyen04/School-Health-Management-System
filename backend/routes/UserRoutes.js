import express from "express";
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changePassword,
} from "../controllers/UserController.js";
import { authenticateToken } from "../middleware/authenticateToken.js";

const router = express.Router();

// CRUD routes
router.post("/change-password", authenticateToken, changePassword);
router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
