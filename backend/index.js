import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectToDatabase from "./db/db.js";
import AdminRoutes from "./routes/AdminRoutes.js";
import authRouter from "./routes/auth.js";
import BlogRoutes from "./routes/BlogRoutes.js";
import ManagerStudentRoutes from "./routes/ManagerStudentRoutes.js";
import MedicalCampaignRoutes from "./routes/MedicalCamapaignRoutes.js";
import MedicalCheckRoutes from "./routes/MedicalCheckRoutes.js";
import NotificationRoutes from "./routes/NotificationRoutes.js";
import NurseRoutes from "./routes/NurseRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import ReportMedicalCheckRoutes from "./routes/ReportMedicalCheckRoutes.js";
import UploadRoutes from "./routes/UploadRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import VaccinationCampaignRoutes from "./routes/VaccinationCampaignRoutes.js";
import VaccinationRoutes from "./routes/VaccinationRoutes.js";
import SchoolYearRoutes from "./routes/SchoolYearRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Log tất cả request để debug
app.use((req, res, next) => {
    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
    next();
});

// Connect to database
connectToDatabase();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://school-health-oqsssvh2x-dannguyen04s-projects.vercel.app",
            "https://school-health-delta.vercel.app",
        ],
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

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
app.use("/api/blogs", BlogRoutes);
app.use("/api/report-medical-check", ReportMedicalCheckRoutes);
app.use("/api/upload", UploadRoutes);
app.use("/api/school-year", SchoolYearRoutes);

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
