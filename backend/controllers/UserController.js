const prisma = require("../prisma");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
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

exports.getAllUsers = async (req, res) => {
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

exports.getUserById = async (req, res) => {
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

exports.updateUser = async (req, res) => {
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

exports.deleteUser = async (req, res) => {
    try {
        await prisma.users.delete({
            where: { id: req.params.id },
        });

        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
