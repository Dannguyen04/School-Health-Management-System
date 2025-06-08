import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";

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

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
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

        let findUser = await prisma.User.findUnique({
            where: {
                email: email,
            },
        });

        if (findUser)
            return res.status(400).json({
                success: false,
                error: "User already exists",
            });

        const user = await prisma.User.create({
            data: {
                fullName: name,
                email: email,
                password: password,
            },
        });

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            success: true,
            message: "Sign up succesfully",
            user: {
                userId: user.id,
                userName: user.fullName,
                userEmail: user.email,
            },
            token: token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" });
    }
};

export { handleRegister };
