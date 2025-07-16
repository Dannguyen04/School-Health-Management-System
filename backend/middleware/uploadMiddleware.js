import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
const profilePhotosDir = path.join(uploadsDir, "profile-photos");
const medicineImagesDir = path.join(uploadsDir, "medicine-images");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(profilePhotosDir)) {
    fs.mkdirSync(profilePhotosDir, { recursive: true });
}
if (!fs.existsSync(medicineImagesDir)) {
    fs.mkdirSync(medicineImagesDir, { recursive: true });
}

const excelFilesDir = path.join(uploadsDir, "excel-files");
if (!fs.existsSync(excelFilesDir)) {
    fs.mkdirSync(excelFilesDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profilePhotosDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp and user ID
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${req.user?.id || "unknown"}-${uniqueSuffix}${ext}`);
    },
});

const medicineImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, medicineImagesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `medicine-${uniqueSuffix}${ext}`);
    },
});

const excelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, excelFilesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `excel-${uniqueSuffix}${ext}`);
    },
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
            ),
            false
        );
    }
};

const excelFileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Invalid file type. Only Excel files are allowed."),
            false
        );
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// Single file upload middleware for profile photos
export const uploadProfilePhoto = upload.single("profilePhoto");

// Single file upload middleware for medicine images
export const uploadMedicineImage = multer({
    storage: medicineImageStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
}).single("medicineImage");

export const uploadExcel = multer({
    storage: excelStorage,
    fileFilter: excelFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
}).single("file");

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                error: "File too large. Maximum size is 10MB.",
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message,
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            error: err.message,
        });
    }
    next();
};

export default upload;
