// import express from "express";
// import {
//   deleteHealthProfile,
//   getHealthProfile,
//   getStudents,
//   upsertHealthProfile,
// } from "../controllers/parentController.js";
// import {
//   authenticateToken,
//   verifyRole,
// } from "../middleware/authenticateToken.js";

// const router = express.Router();

// // Get list of students for parent
// router.get("/students", authenticateToken, verifyRole(["PARENT"]), getStudents);

// // Health Profile routes
// router.get(
//   "/health-profile/:studentId",
//   authenticateToken,
//   verifyRole(["PARENT"]),
//   getHealthProfile
// );
// router.put(
//   "/health-profile/:studentId",
//   authenticateToken,
//   verifyRole(["PARENT"]),
//   upsertHealthProfile
// );
// router.delete(
//   "/health-profile/:studentId",
//   authenticateToken,
//   verifyRole(["PARENT"]),
//   deleteHealthProfile
// );

// export default router;
