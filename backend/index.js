import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectToDatabase from "./db/db.js";
import AdminRoutes from "./routes/AdminRoutes.js";
import authRouter from "./routes/auth.js";
import NotificationRoutes from "./routes/NotificationRoutes.js";
import NurseRoutes from "./routes/NurseRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import VaccinationCampaignRoutes from "./routes/VaccinationCampaignRoutes.js";
import VaccinationRoutes from "./routes/VaccinationRoutes.js";
import ManagerStudentRoutes from "./routes/ManagerStudentRoutes.js";
import MedicalCheckRoutes from "./routes/MedicalCheckRoutes.js";
import MedicalCampaignRoutes from "./routes/MedicalCamapaignRoutes.js";

dotenv.config();

const app = express();

// Connect to database
connectToDatabase();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());

// Mount all routes under /api prefix
app.use("/api/auth", authRouter);
app.use("/api/admin", AdminRoutes);
app.use("/api/nurse", NurseRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/manager/vaccination-campaigns", VaccinationCampaignRoutes);
app.use("/api/manager/vaccination", VaccinationRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/manager/students", ManagerStudentRoutes);
app.use("/api/notifications", NotificationRoutes);
app.use("/api/medical-checks", MedicalCheckRoutes);
app.use("/api/medical-campaigns", MedicalCampaignRoutes);

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ message: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on PORT ${PORT}`);
});
