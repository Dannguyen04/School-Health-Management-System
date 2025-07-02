import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const createUser = async (req, res) => {
    try {
        const { fullName, email, password, role, phone, address, avatar } =
            req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                role,
                phone,
                address,
                avatar,
            },
        });

        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.users.findMany({
            include: {
                studentProfile: true,
                parentProfile: true,
                nurseProfile: true,
                managerProfile: true,
                adminProfile: true,
            },
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await prisma.users.findUnique({
            where: { id: req.params.id },
            include: {
                studentProfile: true,
                parentProfile: true,
                nurseProfile: true,
                managerProfile: true,
                adminProfile: true,
            },
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { fullName, email, role, phone, address, avatar, isActive } =
            req.body;

        const user = await prisma.users.update({
            where: { id: req.params.id },
            data: {
                fullName,
                email,
                role,
                phone,
                address,
                avatar,
                isActive,
            },
        });

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await prisma.users.delete({
            where: { id: req.params.id },
        });

        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update current user's profile
export const updateCurrentUserProfile = async (req, res) => {
    try {
        const { fullName, email, phone, address, avatar } = req.body;
        const userId = req.user.id; // From authenticateToken middleware

        const user = await prisma.users.update({
            where: { id: userId },
            data: {
                fullName,
                email,
                phone,
                address,
                avatar,
                updatedAt: new Date(),
            },
            include: {
                studentProfile: true,
                parentProfile: true,
                nurseProfile: true,
                managerProfile: true,
                adminProfile: true,
            },
        });

        res.json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

// Upload profile photo
export const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No file uploaded",
            });
        }

        const userId = req.user.id;

        // Generate the file URL
        const fileUrl = `/api/uploads/profile-photos/${req.file.filename}`;

        // Update user's avatar in database
        const user = await prisma.users.update({
            where: { id: userId },
            data: {
                avatar: fileUrl,
                updatedAt: new Date(),
            },
            include: {
                studentProfile: true,
                parentProfile: true,
                nurseProfile: true,
                managerProfile: true,
                adminProfile: true,
            },
        });

        res.json({
            success: true,
            message: "Profile photo uploaded successfully",
            avatar: fileUrl,
            user,
        });
    } catch (err) {
        console.error("Profile photo upload error:", err);
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

// Đổi mật khẩu user (không hash)
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res
                .status(400)
                .json({ message: "Vui lòng nhập đầy đủ thông tin." });
        }
        if (newPassword.length < 8) {
            return res
                .status(400)
                .json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự." });
        }

        const user = await prisma.users.findUnique({ where: { id: userId } });
        if (!user)
            return res
                .status(404)
                .json({ message: "Không tìm thấy người dùng." });

        if (user.password !== oldPassword) {
            return res.status(400).json({ message: "Mật khẩu cũ không đúng." });
        }

        await prisma.users.update({
            where: { id: userId },
            data: { password: newPassword, updatedAt: new Date() },
        });

        res.json({ message: "Đổi mật khẩu thành công." });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};
