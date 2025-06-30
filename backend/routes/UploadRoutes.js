import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads/blog-images");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `blog-${Date.now()}${ext}`);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/gif",
            "image/webp",
        ];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Chỉ hỗ trợ ảnh JPG, PNG, GIF, WebP"));
    },
});

router.post("/blog-image", upload.single("image"), (req, res) => {
    if (!req.file)
        return res
            .status(400)
            .json({ success: false, error: "Không có file ảnh" });
    const url = `/api/uploads/blog-images/${req.file.filename}`;
    res.json({ success: true, url });
});

export default router;
