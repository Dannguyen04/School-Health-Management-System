import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import validator from "validator";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

const handleRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: "Name, email and password are required",
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                error: "Invalid email format",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 8 characters",
            });
        }

        let findUser = await prisma.users.findUnique({
            where: {
                email: email,
            },
        });

        if (findUser)
            return res.status(400).json({
                success: false,
                error: "User already exists",
            });

        // Create user and parent in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user with PARENT role (default)
            const user = await tx.users.create({
                data: {
                    fullName: name.trim(),
                    email: email.toLowerCase(),
                    password: password,
                    role: "PARENT",
                },
            });

            // Create parent profile
            const parent = await tx.parent.create({
                data: {
                    userId: user.id,
                },
            });

            return { user, parent };
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: result.user.id,
                email: result.user.email,
                role: result.user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res
            .header("auth-token", token)
            .status(201)
            .json({
                success: true,
                message: "Registered successfully",
                token,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    fullName: result.user.fullName,
                    role: result.user.role,
                },
                parent: {
                    id: result.parent.id,
                },
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
};

export { handleRegister };
