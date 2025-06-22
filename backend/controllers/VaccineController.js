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

const createVaccine = async (req, res) => {
    const { name, requirement, expiredDate, dose, sideEffects, notes } =
        req.body;

    if (!name || !requirement || !expiredDate || !dose) {
        return res.status(404).json({
            success: false,
            error: "Thiếu trường dữ liệu cần thiết",
        });
    }

    const existedVaccine = await prisma.vaccination.findUnique({
        where: { name },
    });

    if (existedVaccine) {
        return res.status(409).json({
            success: false,
            error: "Vaccine đã tồn tại trong hệ thống",
        });
    }

    try {
        const vaccine = await prisma.$transaction({
            async createVaccine() {
                const createVaccine = await prisma.vaccination.create({
                    data: {
                        name,
                        requirement,
                        expiredDate,
                        dose,
                        sideEffects,
                        notes,
                    },
                });
                return createVaccine;
            },
        });
        res.status(400).json({
            success: true,
            data: vaccine,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

const getAllVaccine = async () => {
    try {
        const vaccine = await prisma.vaccination.findMany();
        if (!vaccine) return "";
        return vaccine;
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};

const getAllRequiredVaccine = async (req, res) => {
    try {
        const available = await getAllVaccine();
        if (available.length === 0)
            return res.status(404).json({
                success: false,
                error: "Không có vaccine trong hệ thống",
            });

        const requireVaccine = await prisma.vaccination.findMany({
            where: { requirement: "REQUIRED" },
        });

        if (!requireVaccine)
            return res.status(404).json({
                success: false,
                error: "Không có vaccine bắt buộc nào trong hệ thống",
            });

        res.status(200).json({
            success: true,
            message: "Vaccine bắt buộc trả thành công",
            data: requireVaccine,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

//get all optional vaccine
const getAllOptionalVaccine = async (req, res) => {
    try {
        const available = await getAllVaccine();
        if (available.length === 0)
            return res.status(404).json({
                success: false,
                error: "Không có vaccine trong hệ thống",
            });

        const optionalVaccine = await prisma.vaccination.findMany({
            where: { requirement: "OPTIONAL" },
        });

        if (!optionalVaccine)
            return res.status(404).json({
                success: false,
                error: "Không có vaccine tuyển cho nào trong hệ thống",
            });

        res.status(200).json({
            success: true,
            message: "Vaccine tuyển cho trả thành công",
            data: optionalVaccine,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
const updateVaccine = async (req, res) => {
    const { id } = req.params;
    const { name, requirement, expiredDate, dose, sideEffects, notes } =
        req.body;
    try {
        const existedVaccine = await prisma.vaccination.findUnique({
            where: { id },
        });
        if (!existedVaccine) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy vaccine để cập nhật",
            });
        }

        if (name && name !== existedVaccine.name) {
            const nameExists = await prisma.vaccination.findUnique({
                where: { name },
            });
            if (nameExists) {
                return res.status(409).json({
                    success: false,
                    error: "Tên vaccine đã tồn tại trong hệ thống",
                });
            }
        }
        const updated = await prisma.vaccination.update({
            where: { id },
            data: {
                name,
                requirement,
                expiredDate,
                dose,
                sideEffects,
                notes,
            },
        });
        res.status(200).json({
            success: true,
            message: "Cập nhật vaccine thành công",
            data: updated,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Delete vaccine
const deleteVaccine = async (req, res) => {
    const { id } = req.params;
    try {
        const existedVaccine = await prisma.vaccination.findUnique({
            where: { id },
        });
        if (!existedVaccine) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy vaccine để xoá",
            });
        }
        await prisma.vaccination.delete({ where: { id } });
        res.status(200).json({
            success: true,
            message: "Xoá vaccine thành công",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export {
    createVaccine,
    getAllVaccine,
    getAllRequiredVaccine,
    getAllOptionalVaccine,
    updateVaccine,
    deleteVaccine,
};
