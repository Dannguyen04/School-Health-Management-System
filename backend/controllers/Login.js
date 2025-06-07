import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
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

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required",
            });
        }

        const user = await prisma.User.findUnique({
            where: {
                email: email,
            },
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.log("Login error: " + error);
        res.status(500).json({ error: "Server error login" });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await prisma.User.findUnique({
            where: {
                id: req.user.id,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.log("profile error");
        res.status(500).json({ error: "Server error profile" });
    }
};

const handleLogout = (req, res) => {
    req.session.destroy();
    res.json({ message: "Logout successful" });
};

export { handleLogin, getUserProfile, handleLogout };
