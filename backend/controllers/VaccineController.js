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

    if (!name || !requirement || !expiredDate) {
        return res.status(404).json({
            success: false,
            error: "Thiếu trường dữ liệu cần thiết",
        });
    }

    const existedVaccination = await prisma.vaccinations.findFirst({
        where: { name: name },
    });

    if (existedVaccination) {
        req.params.id = existedVaccination.id;
        if (!req.user) req.user = { id: null };
        return updateVaccination(req, res);
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

        // Tạo thông báo cho manager sau khi tạo vaccine thành công
        try {
            // Kiểm tra req.user và req.user.id
            const managerId = req.user && req.user.id ? req.user.id : null;
            if (managerId) {
                await prisma.notification.create({
                    data: {
                        userId: managerId,
                        title: `Vaccine mới: ${vaccination.name}`,
                        message: `Bạn đã tạo thành công vaccine "${
                            vaccination.name
                        }" với yêu cầu: ${
                            requirement === "REQUIRED" ? "Bắt buộc" : "Tùy chọn"
                        }.`,
                        type: "vaccine_created",
                        status: "SENT",
                        sentAt: new Date(),
                    },
                });
            } else {
                console.warn(
                    "Không tìm thấy thông tin manager để gửi thông báo"
                );
            }
        } catch (notificationError) {
            console.error(
                "Error creating notification for manager:",
                notificationError
            );
            // Không fail toàn bộ request nếu tạo thông báo thất bại
        }

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
        const vaccination = await prisma.vaccinations.findMany({
            orderBy: { createdAt: "desc" },
        });
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

        // Tạo thông báo cho manager sau khi cập nhật vaccine thành công
        try {
            const managerId = req.user && req.user.id ? req.user.id : null;
            if (managerId) {
                await prisma.notification.create({
                    data: {
                        userId: managerId,
                        title: `Cập nhật vaccine: ${updated.name}`,
                        message: `Bạn đã cập nhật thành công vaccine "${updated.name}".`,
                        type: "vaccine_updated",
                        status: "SENT",
                        sentAt: new Date(),
                    },
                });
            } else {
                console.warn(
                    "Không tìm thấy thông tin manager để gửi thông báo"
                );
            }
        } catch (notificationError) {
            console.error(
                "Error creating notification for manager:",
                notificationError
            );
            // Không fail toàn bộ request nếu tạo thông báo thất bại
        }

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
            include: {
                campaign: true,
            },
        });
        if (!existedVaccination) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy loại vaccine để xoá",
            });
        }

        if (existedVaccination.campaign) {
            return res.status(409).json({
                success: false,
                error:
                    "Vaccine đang được sử dụng trong một chiến dịch " +
                    existedVaccination.campaign.name +
                    " nên không thể xóa",
            });
        }
        // Lưu tên vaccine trước khi xóa để hiển thị trong thông báo
        const vaccineName = existedVaccination.name;

        await prisma.vaccinations.delete({ where: { id } });

        // Tạo thông báo cho manager sau khi xóa vaccine thành công
        try {
            const managerId = req.user.id; // Lấy ID của manager hiện tại

            await prisma.notification.create({
                data: {
                    userId: managerId,
                    title: `Xóa vaccine: ${vaccineName}`,
                    message: `Bạn đã xóa thành công vaccine "${vaccineName}".`,
                    type: "vaccine_deleted",
                    status: "SENT",
                    sentAt: new Date(),
                },
            });
        } catch (notificationError) {
            console.error(
                "Error creating notification for manager:",
                notificationError
            );
            // Không fail toàn bộ request nếu tạo thông báo thất bại
        }

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
