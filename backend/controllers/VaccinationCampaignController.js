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

// Tạo chiến dịch tiêm chủng mới
const createVaccinationCampaign = async (req, res) => {
    const { name, description, startDate, endDate, vaccineName, targetGrades } =
        req.body;
    if (
        !name ||
        !startDate ||
        !endDate ||
        !vaccineName ||
        targetGrades.length === 0
    ) {
        return res.status(400).json({
            success: false,
            error: "Thiếu trường dữ liệu bắt buộc",
        });
    }
    try {
        const existed = await prisma.vaccinationCampaign.findFirst({
            where: { name },
        });
        if (existed) {
            return res.status(409).json({
                success: false,
                error: "Tên chiến dịch đã tồn tại",
            });
        }

        const vaccine = await prisma.vaccination.findFirst({
            where: { name: vaccineName },
        });

        if (!vaccine) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy vaccine",
            });
        }

        // Kiểm tra deadline phải ít nhất 1 tuần sau scheduledDate
        const scheduled = new Date(startDate);
        const deadlineDate = new Date(endDate);
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        if (deadlineDate - scheduled < oneWeekMs) {
            return res.status(400).json({
                success: false,
                error: "Deadline phải cách ngày bắt đầu ít nhất 1 tuần.",
            });
        }

        const campaign = await prisma.vaccinationCampaign.create({
            data: {
                name,
                description,
                scheduledDate: scheduled,
                deadline: deadlineDate,
                vaccineId: vaccine.id,
                targetGrades: targetGrades,
            },
        });
        res.status(201).json({ success: true, data: campaign });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getAllVaccinationCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma.vaccinationCampaign.findMany({
            include: {
                vaccine: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json({ success: true, data: campaigns });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateVaccinationCampaign = async (req, res) => {
    const { id } = req.params;
    const { name, description, status, targetGrades } = req.body;
    try {
        const existed = await prisma.vaccinationCampaign.findUnique({
            where: { id },
        });
        if (!existed) {
            return res
                .status(404)
                .json({ success: false, error: "Không tìm thấy chiến dịch" });
        }

        if (name && name !== existed.name) {
            const nameExists = await prisma.vaccinationCampaign.findFirst({
                where: { name },
            });
            if (nameExists) {
                return res.status(409).json({
                    success: false,
                    error: "Tên chiến dịch đã tồn tại",
                });
            }
        }
        const data = {};
        if (typeof name === "string" && name.trim() !== "") data.name = name;
        if (typeof description === "string") data.description = description;
        if (
            typeof status === "string" &&
            ["FINISHED", "CANCELLED"].includes(status)
        )
            data.status = status;
        data.isActive = status === "ACTIVE";
        if (
            targetGrades !== undefined &&
            Array.isArray(targetGrades) &&
            targetGrades.length > 0 &&
            targetGrades.every((g) => Number.isInteger(g) && g >= 1 && g <= 5)
        )
            data.targetGrades = targetGrades;
        const updated = await prisma.vaccinationCampaign.update({
            where: { id },
            data,
        });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteVaccinationCampaign = async (req, res) => {
    const { id } = req.params;
    try {
        const existed = await prisma.vaccinationCampaign.findUnique({
            where: { id },
        });
        if (!existed) {
            return res
                .status(404)
                .json({ success: false, error: "Không tìm thấy chiến dịch" });
        }
        await prisma.vaccinationCampaign.delete({ where: { id } });
        res.status(200).json({
            success: true,
            message: "Xoá chiến dịch thành công",
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export {
    createVaccinationCampaign,
    deleteVaccinationCampaign,
    getAllVaccinationCampaigns,
    updateVaccinationCampaign,
};
