import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
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

const VALID_ROLES = ["PARENT", "SCHOOL_NURSE", "MANAGER", "ADMIN"];
const VALID_GENDERS = ["MALE", "FEMALE"];

const roleToModel = {
    STUDENT: "studentProfile",
    PARENT: "parentProfile",
    SCHOOL_NURSE: "nurseProfile",
    MANAGER: "managerProfile",
    ADMIN: "adminProfile",
};

const roleToTable = {
    STUDENT: "student",
    PARENT: "parent",
    SCHOOL_NURSE: "schoolNurse",
    MANAGER: "manager",
    ADMIN: "admin",
};

const normalizeRole = (role) => {
    return role.toUpperCase().trim().replace(/\s+/g, "_");
};

const validateEmail = (email) => {
    return validator.isEmail(email);
};

const validatePassword = (password) => {
    return password && password.length >= 8;
};

const validateGrade = (grade) => {
    const gradeNum = parseInt(grade);
    return !isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 5;
};

const validateDateOfBirth = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    const minDate = new Date(now.getFullYear() - 100, 0, 1);
    const maxDate = new Date(now.getFullYear() - 3, 11, 31);

    return !isNaN(dob.getTime()) && dob >= minDate && dob <= maxDate;
};

const findUserByEmail = async (email) => {
    try {
        return await prisma.users.findUnique({
            where: { email },
        });
    } catch (error) {
        throw new Error(`Error finding user by email: ${error.message}`);
    }
};

const findParentByName = async (parentName, tx = prisma) => {
    try {
        return await tx.parent.findFirst({
            where: {
                user: {
                    fullName: {
                        contains: parentName,
                        mode: "insensitive",
                    },
                    role: "PARENT",
                    isActive: true,
                },
            },
            include: {
                user: true,
            },
        });
    } catch (error) {
        throw new Error(`Error finding parent: ${error.message}`);
    }
};

const assignParentToStudent = async (
    studentId,
    parentName,
    relationship = "guardian",
    isPrimary = false,
    tx
) => {
    try {
        const parent = await findParentByName(parentName, tx);
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
                            select: {
                                fullName: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                student: {
                    include: {
                        user: {
                            select: { fullName: true },
                        },
                    },
                },
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
    } catch (error) {
        throw new Error(`Error assigning parent to student: ${error.message}`);
    }
};

const createAuditLog = async (
    tx,
    userId,
    action,
    resource,
    resourceId,
    details,
    req
) => {
    return await tx.auditLog.create({
        data: {
            userId,
            action,
            resource,
            resourceId,
            details,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get("User-Agent") || "Unknown",
            createdAt: new Date(),
        },
    });
};

const addStudent = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            password,
            studentCode,
            dateOfBirth,
            gender,
            grade,
            class: studentClass,
            emergencyContact,
            emergencyPhone,
            parentName,
            bloodType,
        } = req.body;

        const requiredFields = [
            "fullName",
            "email",
            "phone",
            "password",
            "studentCode",
            "dateOfBirth",
            "gender",
            "grade",
            "studentClass",
            "parentName",
        ];

        const missingFields = requiredFields.filter((field) => {
            const value = req.body[field === "studentClass" ? "class" : field];
            return !value || value.toString().trim() === "";
        });

        if (missingFields.length > 0) {
            return res.status(422).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(", ")}`,
            });
        }

        if (!validateEmail(email)) {
            return res.status(422).json({
                success: false,
                error: "Invalid email format",
            });
        }

        if (!validatePassword(password)) {
            return res.status(422).json({
                success: false,
                error: "Password must be at least 8 characters",
            });
        }

        if (!validateDateOfBirth(dateOfBirth)) {
            return res.status(422).json({
                success: false,
                error: "Invalid date of birth",
            });
        }

        if (!validateGrade(grade)) {
            return res.status(422).json({
                success: false,
                error: "Grade must be between 1 and 5",
            });
        }

        if (!VALID_GENDERS.includes(gender.toUpperCase())) {
            return res.status(422).json({
                success: false,
                error: `Gender must be one of: ${VALID_GENDERS.join(", ")}`,
            });
        }

        const [existingUser, existingStudent] = await Promise.all([
            findUserByEmail(email),
            studentCode
                ? prisma.student.findUnique({ where: { studentCode } })
                : null,
        ]);

        if (existingUser) {
            return res.status(422).json({
                success: false,
                error: `Email already exists for user ${existingUser.fullName}`,
            });
        }

        if (existingStudent) {
            return res.status(422).json({
                success: false,
                error: "Student code already exists",
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    fullName: fullName.trim(),
                    email: email.toLowerCase().trim(),
                    phone: phone.trim(),
                    password: password,
                    role: "STUDENT",
                    isActive: true,
                },
            });

            const student = await tx.student.create({
                data: {
                    userId: user.id,
                    studentCode: studentCode.trim(),
                    dateOfBirth: new Date(dateOfBirth),
                    gender: gender.toUpperCase(),
                    grade: grade.toString(),
                    class: studentClass.trim(),
                    emergencyContact: emergencyContact?.trim(),
                    emergencyPhone: emergencyPhone?.trim(),
                    ...(bloodType && { bloodType: bloodType.trim() }),
                },
            });

            const parentResult = await assignParentToStudent(
                student.id,
                parentName,
                "guardian",
                true,
                tx
            );

            if (!parentResult.success) {
                throw new Error(parentResult.error);
            }

            await createAuditLog(
                tx,
                user.id,
                "create",
                "student",
                student.id,
                {
                    fullName,
                    email,
                    studentCode,
                    grade,
                    class: studentClass,
                    parentAssigned: parentResult.data.parentName,
                },
                req
            );

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
        res.status(500).json({
            success: false,
            error: error.message || "Internal server error",
        });
    }
};

const addRole = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(422).json({
                success: false,
                error: "Missing required fields",
            });
        }

        if (!validateEmail(email)) {
            return res.status(422).json({
                success: false,
                error: "Invalid email format",
            });
        }

        if (!validatePassword(password)) {
            return res.status(422).json({
                success: false,
                error: "Password must be at least 8 characters",
            });
        }

        const normalizedRole = normalizeRole(role);
        if (!VALID_ROLES.includes(normalizedRole)) {
            return res.status(422).json({
                success: false,
                error: `Invalid role. Must be one of: ${VALID_ROLES.join(
                    ", "
                )}`,
            });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(422).json({
                success: false,
                error: "Email already exists",
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    fullName: name.trim(),
                    email: email.toLowerCase().trim(),
                    password: password,
                    role: normalizedRole,
                    isActive: true,
                },
            });

            const tableName = roleToTable[normalizedRole];
            const roleProfile = await tx[tableName].create({
                data: {
                    userId: user.id,
                },
            });

            await createAuditLog(
                tx,
                user.id,
                "create",
                "user",
                user.id,
                { role: normalizedRole, email, fullName: name },
                req
            );

            return { user, roleProfile };
        });

        const { user, roleProfile } = result;

        res.status(201).json({
            success: true,
            message: `${normalizedRole.toLowerCase()} created successfully`,
            data: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                [`${normalizedRole.toLowerCase()}Profile`]: roleProfile,
            },
        });
    } catch (error) {
        console.error("Error creating role:", error);

        if (error.code === "P2002") {
            return res.status(422).json({
                success: false,
                error: "Duplicate value for unique field",
            });
        }

        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
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
const getAllStudents = async (req, res) => {
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

const updateRole = async (req, res) => {
    const { id } = req.params;
    const { role, email, password, fullName } = req.body;

    try {
        if (!email || !fullName || !role) {
            return res.status(400).json({
                success: false,
                error: "Email, full name, and role are required",
            });
        }

        if (password && !validatePassword(password)) {
            return res.status(422).json({
                success: false,
                error: "Password must be at least 8 characters if provided",
            });
        }

        if (!validateEmail(email)) {
            return res.status(422).json({
                success: false,
                error: "Invalid email format",
            });
        }

        const normalizedRole = normalizeRole(role);
        if (!VALID_ROLES.includes(normalizedRole)) {
            return res.status(422).json({
                success: false,
                error: `Invalid role. Must be one of: ${VALID_ROLES.join(
                    ", "
                )}`,
            });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser && existingUser.id !== id) {
            return res.status(400).json({
                success: false,
                error: "Email is already in use",
            });
        }

        const updatedUser = await prisma.$transaction(async (tx) => {
            const currentUser = await tx.users.findUnique({
                where: { id },
                include: {
                    parentProfile: true,
                    nurseProfile: true,
                    managerProfile: true,
                    adminProfile: true,
                },
            });

            if (!currentUser) {
                throw new Error("User not found");
            }

            if (currentUser.role !== normalizedRole) {
                const oldTableName = roleToTable[currentUser.role];
                if (
                    oldTableName &&
                    currentUser[roleToModel[currentUser.role]]
                ) {
                    await tx[oldTableName].delete({ where: { userId: id } });
                }

                const newTableName = roleToTable[normalizedRole];
                if (newTableName) {
                    await tx[newTableName].create({
                        data: { userId: id },
                    });
                }
            }

            const updateData = {
                role: normalizedRole,
                email: email.toLowerCase().trim(),
                fullName: fullName.trim(),
                updatedAt: new Date(),
            };

            if (password) {
                updateData.password = password;
            }

            const user = await tx.users.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            await createAuditLog(
                tx,
                id,
                "update",
                "user",
                id,
                {
                    changes: { role: normalizedRole, email, fullName },
                    oldRole: currentUser.role,
                    passwordChanged: !!password,
                },
                req
            );

            return user;
        });

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);

        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                error: "User or profile not found",
            });
        }

        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

const updateStudent = async (req, res) => {
    const { id } = req.params;
    const {
        studentCode,
        fullName,
        email,
        phone,
        dateOfBirth,
        gender,
        class: studentClass,
        grade,
        bloodType,
        emergencyContact,
        emergencyPhone,
    } = req.body;

    try {
        const requiredFields = [
            "studentCode",
            "fullName",
            "email",
            "dateOfBirth",
            "gender",
            "studentClass",
            "grade",
        ];

        const missingFields = requiredFields.filter((field) => {
            const value = req.body[field === "studentClass" ? "class" : field];
            return !value || value.toString().trim() === "";
        });

        if (missingFields.length > 0) {
            return res.status(422).json({
                success: false,
                error: `Missing required fields: ${missingFields.join(", ")}`,
            });
        }

        if (!validateEmail(email)) {
            return res.status(422).json({
                success: false,
                error: "Invalid email format",
            });
        }

        if (!validateDateOfBirth(dateOfBirth)) {
            return res.status(422).json({
                success: false,
                error: "Invalid date of birth",
            });
        }

        if (!validateGrade(grade)) {
            return res.status(422).json({
                success: false,
                error: "Grade must be between 1 and 5",
            });
        }

        if (!VALID_GENDERS.includes(gender.toUpperCase())) {
            return res.status(422).json({
                success: false,
                error: `Gender must be one of: ${VALID_GENDERS.join(", ")}`,
            });
        }

        const user = await prisma.users.findUnique({
            where: { id },
            include: { studentProfile: true },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        if (user.role !== "STUDENT") {
            return res.status(400).json({
                success: false,
                error: "User is not a student",
            });
        }

        if (!user.studentProfile) {
            return res.status(404).json({
                success: false,
                error: "Student profile not found",
            });
        }

        const existingEmailUser = await findUserByEmail(email);
        if (existingEmailUser && existingEmailUser.id !== id) {
            return res.status(400).json({
                success: false,
                error: "Email is already registered by another user",
            });
        }

        const existingStudent = await prisma.student.findUnique({
            where: { studentCode },
        });
        if (existingStudent && existingStudent.userId !== id) {
            return res.status(400).json({
                success: false,
                error: "Student code is already in use",
            });
        }

        const updatedUser = await prisma.$transaction(async (tx) => {
            const userUpdate = await tx.users.update({
                where: { id },
                data: {
                    email: email.toLowerCase().trim(),
                    fullName: fullName.trim(),
                    ...(phone && { phone: phone.trim() }),
                    updatedAt: new Date(),
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            await tx.student.update({
                where: { userId: id },
                data: {
                    studentCode: studentCode.trim(),
                    dateOfBirth: new Date(dateOfBirth),
                    gender: gender.toUpperCase(),
                    class: studentClass.trim(),
                    grade: grade.toString(),
                    ...(emergencyContact && {
                        emergencyContact: emergencyContact.trim(),
                    }),
                    ...(emergencyPhone && {
                        emergencyPhone: emergencyPhone.trim(),
                    }),
                    ...(bloodType && { bloodType: bloodType.trim() }),
                    updatedAt: new Date(),
                },
            });

            await createAuditLog(
                tx,
                id,
                "update",
                "student",
                id,
                {
                    changes: {
                        fullName,
                        email,
                        studentCode,
                        dateOfBirth,
                        gender,
                        class: studentClass,
                        grade,
                        bloodType,
                        emergencyContact,
                        emergencyPhone,
                    },
                },
                req
            );

            return userUpdate;
        });

        return res.status(200).json({
            success: true,
            message: "Student updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error updating student:", error);

        if (error.code === "P2002") {
            return res.status(422).json({
                success: false,
                error: "Unique constraint violation (duplicate value)",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.users.findUnique({
            where: { id },
            include: {
                studentProfile: true,
                parentProfile: true,
                nurseProfile: true,
                managerProfile: true,
                adminProfile: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        await prisma.$transaction(async (tx) => {
            const tableName = roleToTable[user.role];
            if (tableName && user[roleToModel[user.role]]) {
                await tx[tableName].delete({ where: { userId: id } });
            }

            await tx.users.update({
                where: { id },
                data: {
                    isActive: false,
                    email: `${user.email}_deleted_${Date.now()}`,
                    updatedAt: new Date(),
                },
            });

            await createAuditLog(
                tx,
                id,
                "delete",
                "user",
                id,
                { role: user.role, email: user.email, fullName: user.fullName },
                req
            );
        });

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

process.on("SIGTERM", async () => {
    console.log("Shutting down AdminController...");
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGINT", async () => {
    console.log("Received SIGINT, shutting down gracefully...");
    await prisma.$disconnect();
    process.exit(0);
});

export {
    addStudent,
    getAllStudents,
    getAllUsers,
    addRole,
    updateRole,
    updateStudent,
    deleteUser,
};
