import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is Running on PORT ${process.env.PORT}`);
});
