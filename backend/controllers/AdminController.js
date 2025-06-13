import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import {
    authenticateToken,
    verifyAdmin,
} from "../middleware/authenticateToken.js";
import bodyParser from "body-parser";
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

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

const findParents = async (parentName, tx = prisma) => {
    // FIX: use tx.parent (singular) and correct relation to user (not users)
    const parent = await tx.parent.findFirst({
        where: {
            user: {
                fullName: {
                    contains: parentName,
                },
                role: "PARENT",
                isActive: true,
            },
        },
        include: {
            user: true,
        },
    });

    return parent;
};

const assignParent = async (
    studentId,
    parentName,
    relationship = "guardian",
    isPrimary = false,
    tx
) => {
    const parent = await findParents(parentName, tx); // pass tx for transaction safety
    if (!parent) {
        return { success: false, error: "Parent not found" };
    }

    const existingRelationship = await tx.studentParent.findFirst({
        where: { studentId, parentId: parent.id },
    });
    if (existingRelationship) {
        return {
            success: false,
            error: "Parent already assigned to this student",
        };
    }

    if (isPrimary) {
        await tx.studentParent.updateMany({
            where: { studentId, isPrimary: true },
            data: { isPrimary: false },
        });
    }

    const studentParent = await tx.studentParent.create({
        data: {
            studentId,
            parentId: parent.id,
            relationship,
            isPrimary,
        },
        include: {
            parent: {
                include: {
                    user: {
                        select: { fullName: true, email: true, phone: true },
                    },
                },
            },
            student: { include: { user: { select: { fullName: true } } } },
        },
    });

    return {
        success: true,
        message: `Assigned parent ${parent.user.fullName} to student ${studentParent.student.user.fullName}`,
        data: {
            studentName: studentParent.student.user.fullName,
            parentName: studentParent.parent.user.fullName,
            parentEmail: studentParent.parent.user.email,
            parentPhone: studentParent.parent.user.phone,
            relationship: studentParent.relationship,
            isPrimary: studentParent.isPrimary,
        },
    };
};

const addStudent = async (req, res) => {
    try {
        const {
            // User fields
            fullName,
            email,
            phone,
            password,

            // Student fields
            studentCode,
            dateOfBirth,
            gender,
            grade,
            class: studentClass,
            emergencyContact,
            emergencyPhone,

            // Parent info
            parentName,
        } = req.body;

        if (
            !fullName ||
            !email ||
            !phone ||
            !password ||
            !studentCode ||
            !dateOfBirth ||
            !gender ||
            !grade ||
            !studentClass ||
            !parentName
        ) {
            return res.status(422).json({
                success: false,
                error: "Missing required fields",
            });
        }

        // Validate email
        if (!validator.isEmail(email)) {
            return res
                .status(422)
                .json({ success: false, error: "Invalid email format" });
        }

        // Check if email or studentCode exists
        const [existingUser, existingStudent] = await Promise.all([
            prisma.users.findUnique({ where: { email } }),
            studentCode
                ? prisma.student.findUnique({ where: { studentCode } }) // FIX: use prisma.student (singular)
                : null,
        ]);
        if (existingUser) {
            return res.status(422).json({
                success: false,
                error: `Email already exists for user ${existingUser.fullName}`,
            });
        }
        if (existingStudent) {
            return res
                .status(422)
                .json({ success: false, error: "Student code already exists" });
        }

        // Validate password
        if (password.length < 8) {
            return res.status(422).json({
                success: false,
                error: "Password must be at least 8 characters",
            });
        }

        // Validate dateOfBirth
        const dob = new Date(dateOfBirth);
        if (isNaN(dob.getTime())) {
            return res
                .status(422)
                .json({ success: false, error: "Invalid date of birth" });
        }

        // Validate grade
        if (isNaN(grade) || grade < 1 || grade > 5) {
            return res.status(422).json({
                success: false,
                error: "Grade must be between 1 and 5",
            });
        }

        // Create student and assign parent in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.users.create({
                data: {
                    fullName,
                    email,
                    phone,
                    password: password,
                    role: "STUDENT",
                    isActive: true,
                },
            });

            // Create student profile
            const student = await tx.student.create({
                data: {
                    userId: user.id,
                    studentCode: studentCode,
                    dateOfBirth: dob,
                    gender,
                    grade: grade.toString(),
                    class: studentClass,
                    emergencyContact,
                    emergencyPhone,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            // Assign parent
            const parentResult = await assignParent(
                student.id,
                parentName,
                "guardian",
                true,
                tx
            );
            if (!parentResult.success) {
                throw new Error(parentResult.error);
            }

            return { user, student, parent: parentResult.data };
        });

        return res.status(201).json({
            success: true,
            message: "Student created and parent assigned successfully",
            data: {
                id: result.student.id,
                fullName: result.user.fullName,
                email: result.user.email,
                studentCode: result.student.studentCode,
                parent: result.parent,
            },
        });
    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

//get all user
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            where: {
                role: {
                    not: "STUDENT",
                },
            },
            include: {
                parentProfile: true,
                nurseProfile: true,
                managerProfile: true,
                adminProfile: true,
            },
        });

        if (!users || users.length === 0) {
            console.log("No staff in the system");
            return res.status(404).json({ message: "No staff in the system" });
        }

        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }
};

//getAllStudent
const getAllStudent = async (req, res) => {
    try {
        const students = await prisma.users.findMany({
            where: {
                role: "STUDENT",
            },
            include: {
                studentProfile: true,
            },
        });

        if (!students || students.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: "No student in the system" });
        }

        res.status(200).json({ success: true, data: students });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};

process.on("SIGTERM", async () => {
    console.log("Shutting down AdminController...");
    await prisma.$disconnect();
    process.exit(0);
});

export { addStudent, getAllStudent, getAllUsers };
