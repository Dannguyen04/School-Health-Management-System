import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import jwt from "jsonwebtoken";
import validator from "validator";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(
    session({
        secret: "mySecretKey",
        resave: true,
        saveUninitialized: false,
    })
);

const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required",
            });
        }

        // Check email nhe
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format",
            });
        }

        // Find user by email from request body
        const user = await prisma.users.findUnique({
            where: {
                email: email,
            },
            include: {
                parentProfile: true,
            },
        });

        if (!user || user.password !== password) {
            console.error(
                !user
                    ? `User not found: ${email}`
                    : `Invalid password for user: ${email}`
            );
            return res
                .status(401)
                .json({ success: false, error: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Sau khi login thành công, nếu là PARENT thì kiểm tra và gửi notification thiếu health profile
        if (user.role === "PARENT" && user.parentProfile) {
            const parentId = user.parentProfile.id;
            // Lấy danh sách con và thông tin healthProfile
            const childrenRelations = await prisma.studentParent.findMany({
                where: {
                    parentId: parentId,
                },
                include: {
                    student: {
                        include: {
                            healthProfile: true,
                        },
                    },
                },
            });
            // Gửi notification nếu có ít nhất một con chưa có healthProfile (chỉ gửi 1 lần)
            const hasMissingHealthProfile = childrenRelations.some(
                (rel) => !rel.student.healthProfile
            );
            if (hasMissingHealthProfile) {
                // Kiểm tra đã có notification chưa đọc cùng loại chưa
                const existing = await prisma.notification.findFirst({
                    where: {
                        userId: user.id,
                        type: "missing_health_profile",
                        status: { in: ["SENT", "DELIVERED"] },
                    },
                });
                if (!existing) {
                    await prisma.notification.create({
                        data: {
                            userId: user.id,
                            title: `Bổ sung hồ sơ sức khỏe cho học sinh`,
                            message: `Quý phụ huynh vui lòng khai báo hồ sơ sức khỏe cho các con để nhà trường có thể chăm sóc sức khỏe tốt nhất cho các em.`,
                            type: "missing_health_profile",
                            status: "SENT",
                            sentAt: new Date(),
                        },
                    });
                }
            }
        }

        return res
            .header("auth-token", token)
            .status(200)
            .json({
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                    role: user.role,
                },
            });
    } catch (error) {
        console.error("Login error:", error);
        return res
            .status(500)
            .json({ success: false, error: "Server error during login" });
    }
};

// Get user profile (protected route)
const getUserProfile = async (req, res) => {
    try {
        // User data is already attached by authenticateToken
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "User not found",
            });
        }

        // Return user data in the same format as login response
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.fullName,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Profile error:", error);
        return res
            .status(500)
            .json({ success: false, error: "Server error fetching profile" });
    }
};

// Logout handler
const handleLogout = (req, res) => {
    req.session.destroy();
    return res
        .status(200)
        .json({ success: true, message: "Logout successful" });
};

export { getUserProfile, handleLogin, handleLogout };
