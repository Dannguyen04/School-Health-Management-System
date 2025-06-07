import cors from "cors";
import express from "express";
import connectToDatabase from "./db/db.js";
import authRouter from "./routes/auth.js";

connectToDatabase();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is Running on PORT ${process.env.PORT}`);
});
