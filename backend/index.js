import cors from "cors";
import express from "express";
import authRouter from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);

// Thêm xử lý 404 cho các route không tồn tại
app.use("*", (req, res) => {
    res.status(404).json({ message: "Not Found" });
});

// Thêm middleware xử lý lỗi tổng quát
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({ error: "Something went wrong" });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is Running on PORT ${process.env.PORT}`);
});
