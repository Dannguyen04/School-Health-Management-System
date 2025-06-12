import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

const findAllStudent = async () => {
    try {
        const users = await prisma.users.findMany({
            where: {
                role: "STUDENT",
            },
            include: {
                studentProfile: true,
            },
        });
        return users;
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};

const findStudentByCode = async (studentCode) => {
    try {
        const user = await prisma.users.findUnique({
            where: {
                studentProfile: {
                    studentCode: studentCode,
                },
            },
        });
        return user ? user : "";
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};

const findStudentbyName = async (studentName) => {
    try {
        const user = await prisma.users.findMany({
            where: {
                role: "STUDENT",
                fullName: {
                    contains: studentName,
                    mode: "insensitive",
                },
            },
        });
        return user ? user : "";
    } catch (error) {
        throw new Error(error.message);
    }
};

export { findAllStudent, findStudentByCode, findStudentbyName };
