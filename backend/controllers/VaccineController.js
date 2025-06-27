import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const createVaccination = async (req, res) => {
    const { name, requirement, expiredDate, dose, sideEffects, notes } =
        req.body;

    if (!name || !requirement || !expiredDate || !dose) {
        return res.status(404).json({
            success: false,
            error: "Thiếu trường dữ liệu cần thiết",
        });
    }

    const existedVaccination = await prisma.vaccinations.findFirst({
        where: { name },
    });

    if (existedVaccination) {
        return res.status(409).json({
            success: false,
            error: "Loại vaccine đã tồn tại trong hệ thống",
        });
    }

    try {
        const vaccination = await prisma.vaccinations.create({
            data: {
                name,
                requirement,
                expiredDate: new Date(expiredDate),
                dose,
                sideEffects,
                notes,
            },
        });
        res.status(201).json({
            success: true,
            data: vaccination,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

const getAllVaccination = async () => {
    try {
        const vaccination = await prisma.vaccinations.findMany();
        if (!vaccination) return "";
        return vaccination;
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
};

const getAllRequiredVaccination = async (req, res) => {
    try {
        const available = await getAllVaccination();
        if (available.length === 0)
            return res.status(404).json({
                success: false,
                error: "Không có loại vaccine trong hệ thống",
            });

        const requireVaccination = await prisma.vaccinations.findMany({
            where: { requirement: "REQUIRED" },
        });

        if (!requireVaccination)
            return res.status(404).json({
                success: false,
                error: "Không có loại vaccine bắt buộc nào trong hệ thống",
            });

        res.status(200).json({
            success: true,
            message: "Loại vaccine bắt buộc trả thành công",
            data: requireVaccination,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

const getAllOptionalVaccination = async (req, res) => {
    try {
        const available = await getAllVaccination();
        if (available.length === 0)
            return res.status(404).json({
                success: false,
                error: "Không có loại vaccine trong hệ thống",
            });

        const optionalVaccination = await prisma.vaccinations.findMany({
            where: { requirement: "OPTIONAL" },
        });

        if (!optionalVaccination)
            return res.status(404).json({
                success: false,
                error: "Không có loại vaccine tuyển cho nào trong hệ thống",
            });

        res.status(200).json({
            success: true,
            message: "Loại vaccine tuyển cho trả thành công",
            data: optionalVaccination,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

const getVaccinations = async (req, res) => {
    try {
        const vaccinations = await getAllVaccination();
        if (!vaccinations)
            return res
                .status(404)
                .json({ success: false, error: "Không tìm thấy loại vaccine" });
        res.status(200).json({ success: true, data: vaccinations });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

const updateVaccination = async (req, res) => {
    const { id } = req.params;
    const { name, requirement, expiredDate, dose, sideEffects, notes } =
        req.body;
    try {
        const existedVaccination = await prisma.vaccinations.findUnique({
            where: { id },
        });
        if (!existedVaccination) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy loại vaccine để cập nhật",
            });
        }

        if (name && name !== existedVaccination.name) {
            const nameExists = await prisma.vaccinations.findFirst({
                where: { name },
            });
            if (nameExists) {
                return res.status(409).json({
                    success: false,
                    error: "Tên loại vaccine đã tồn tại trong hệ thống",
                });
            }
        }
        const updated = await prisma.vaccinations.update({
            where: { id },
            data: {
                name,
                requirement,
                expiredDate: expiredDate ? new Date(expiredDate) : undefined,
                dose,
                sideEffects,
                notes,
            },
        });
        res.status(200).json({
            success: true,
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

const deleteVaccination = async (req, res) => {
    const { id } = req.params;
    try {
        const existedVaccination = await prisma.vaccinations.findUnique({
            where: { id },
        });
        if (!existedVaccination) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy loại vaccine để xoá",
            });
        }
        await prisma.vaccinations.delete({ where: { id } });
        res.status(200).json({
            success: true,
            message: "Xoá loại vaccine thành công",
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
    createVaccination,
    deleteVaccination,
    getAllOptionalVaccination,
    getAllRequiredVaccination,
    getAllVaccination,
    getVaccinations,
    updateVaccination,
};
