import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectToDatabase from "./db/db.js";
import AdminRoutes from "./routes/AdminRoutes.js";
import authRouter from "./routes/auth.js";
import NurseRoutes from "./routes/NurseRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import VaccinationCampaignRoutes from "./routes/VaccinationCampaignRoutes.js";
// import parentRouter from "./routes/ParentRoutes.js";

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
app.use("/auth", authRouter);
app.use("/admin", AdminRoutes);
app.use("/nurse", NurseRoutes);
app.use("/users", UserRoutes);
app.use("/manager/vaccination-campaigns", VaccinationCampaignRoutes);
// app.use("/parent", parentRouter);

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
