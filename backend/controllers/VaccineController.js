import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Tạo thông báo cho manager
const createManagerNotification = async (managerId, title, message, type) => {
  if (!managerId) {
    console.warn("Không tìm thấy thông tin manager để gửi thông báo");
    return;
  }

  try {
    await prisma.notification.create({
      data: {
        userId: managerId,
        title,
        message,
        type,
        status: "SENT",
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error creating notification for manager:", error);
  }
};

const createVaccination = async (req, res) => {
  console.log("=== createVaccination called ===");
  console.log("Request body:", req.body);

  try {
    const {
      name,
      requirement,
      manufacturer,
      origin,
      referenceUrl,
      description,
      sideEffects,
      contraindications,
      minAge,
      maxAge,
      maxDoseCount, // mới
      doseSchedules, // mới: mảng phác đồ mũi tiêm
    } = req.body;

    if (!name || !requirement || !manufacturer || !origin || !maxDoseCount) {
      return res.status(400).json({
        success: false,
        error:
          "Thiếu trường dữ liệu cần thiết: tên, yêu cầu, nhà sản xuất, nguồn gốc",
      });
    }

    // Validate doseSchedules nếu có
    let doseSchedulesData = [];
    console.log("Raw doseSchedules from request:", doseSchedules);
    console.log("Type of doseSchedules:", typeof doseSchedules);
    console.log("Is Array?", Array.isArray(doseSchedules));
    console.log("Length:", doseSchedules ? doseSchedules.length : "undefined");

    if (
      doseSchedules &&
      Array.isArray(doseSchedules) &&
      doseSchedules.length > 0
    ) {
      console.log("Received doseSchedules:", doseSchedules); // Debug log

      doseSchedulesData = doseSchedules
        .filter((d) => d && typeof d === "object") // Filter out invalid items
        .map((d) => ({
          doseOrder: Number(d.doseOrder) || 1,
          minInterval: Number(d.minInterval) || 0,
          recommendedInterval: Number(d.recommendedInterval) || 0,
          description: d.description || null,
        }))
        .sort((a, b) => a.doseOrder - b.doseOrder); // Sort by doseOrder

      console.log("Processed doseSchedulesData:", doseSchedulesData); // Debug log
    } else {
      console.log("doseSchedules condition failed - using empty array");
    }

    // Debug log để xem data cuối cùng được gửi đến Prisma
    console.log("Final data for createVaccine:", {
      name,
      requirement,
      manufacturer,
      origin,
      referenceUrl,
      description,
      sideEffects,
      contraindications,
      minAge,
      maxAge,
      maxDoseCount,
      doseSchedules: doseSchedulesData,
    });

    const existedVaccination = await prisma.vaccine.findFirst({
      where: { name: name },
    });

    if (existedVaccination) {
      req.params.id = existedVaccination.id;
      if (!req.user) req.user = { id: null };
      return updateVaccination(req, res);
    }

    const vaccination = await prisma.vaccine.create({
      data: {
        name,
        requirement,
        manufacturer,
        origin,
        referenceUrl,
        description,
        sideEffects,
        contraindications,
        minAge: Number(minAge),
        maxAge: Number(maxAge),
        maxDoseCount: Number(maxDoseCount),
        doseSchedules: doseSchedulesData, // Sử dụng data đã xử lý
      },
    });

    console.log("Created vaccination with doseSchedules:", vaccination); // Debug log

    // Gửi thông báo cho manager
    const manager = await prisma.users.findFirst({
      where: { role: "MANAGER" },
    });

    if (manager) {
      await createManagerNotification(
        manager.id,
        "Thêm vaccine mới",
        `Vaccine "${name}" đã được thêm vào hệ thống`,
        "VACCINE"
      );
    }

    res.status(201).json({
      success: true,
      data: vaccination,
    });
  } catch (error) {
    console.error("Error creating vaccination:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi tạo vaccine",
    });
  }
};

const getAllVaccination = async () => {
  try {
    const vaccination = await prisma.vaccine.findMany({
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

    const requireVaccination = await prisma.vaccine.findMany({
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

    const optionalVaccination = await prisma.vaccine.findMany({
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
  const {
    name,
    requirement,
    manufacturer,
    origin,
    referenceUrl,
    description,
    sideEffects,
    contraindications,
    minAge,
    maxAge,
    maxDoseCount, // mới
    doseSchedules, // mới
  } = req.body;
  try {
    const existedVaccination = await prisma.vaccine.findUnique({
      where: { id },
    });
    if (!existedVaccination) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy loại vaccine để cập nhật",
      });
    }

    // Validate required fields
    if (!name || !requirement || !manufacturer || !origin) {
      return res.status(400).json({
        success: false,
        error:
          "Thiếu trường dữ liệu cần thiết: tên, yêu cầu, nhà sản xuất, nguồn gốc",
      });
    }

    if (name && name !== existedVaccination.name) {
      const nameExists = await prisma.vaccine.findFirst({
        where: { name },
      });
      if (nameExists) {
        return res.status(409).json({
          success: false,
          error: "Tên loại vaccine đã tồn tại trong hệ thống",
        });
      }
    }

    // Validate doseSchedules nếu có
    let doseSchedulesData = existedVaccination.doseSchedules || [];
    if (
      doseSchedules &&
      Array.isArray(doseSchedules) &&
      doseSchedules.length > 0
    ) {
      console.log("Received doseSchedules for update:", doseSchedules); // Debug log

      doseSchedulesData = doseSchedules
        .filter((d) => d && typeof d === "object") // Filter out invalid items
        .map((d) => ({
          doseOrder: Number(d.doseOrder) || 1,
          minInterval: Number(d.minInterval) || 0,
          recommendedInterval: Number(d.recommendedInterval) || 0,
          description: d.description || null,
        }))
        .sort((a, b) => a.doseOrder - b.doseOrder); // Sort by doseOrder

      console.log("Processed doseSchedulesData for update:", doseSchedulesData); // Debug log
    }

    console.log("Final data for updateVaccine:", {
      name,
      requirement,
      manufacturer,
      origin,
      referenceUrl,
      description,
      sideEffects,
      contraindications,
      minAge,
      maxAge,
      maxDoseCount,
      doseSchedules: doseSchedulesData,
    });

    const updated = await prisma.vaccine.update({
      where: { id },
      data: {
        name,
        requirement,
        manufacturer,
        origin,
        referenceUrl,
        description,
        sideEffects,
        contraindications,
        minAge: minAge ? Number(minAge) : existedVaccination.minAge,
        maxAge: maxAge ? Number(maxAge) : existedVaccination.maxAge,
        maxDoseCount:
          maxDoseCount !== undefined
            ? Number(maxDoseCount)
            : existedVaccination.maxDoseCount,
        doseSchedules: doseSchedulesData, // Sử dụng data đã xử lý
      },
    });

    console.log("Updated vaccination with doseSchedules:", updated); // Debug log

    // Gửi thông báo cho manager
    const manager = await prisma.users.findFirst({
      where: { role: "MANAGER" },
    });

    if (manager) {
      await createManagerNotification(
        manager.id,
        "Cập nhật vaccine",
        `Vaccine "${updated.name}" đã được cập nhật`,
        "VACCINE"
      );
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
    const existedVaccination = await prisma.vaccine.findUnique({
      where: { id },
    });
    if (!existedVaccination) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy loại vaccine để xoá",
      });
    }

    const existedCampaignInUesed = await prisma.vaccinationCampaign.findFirst({
      where: { vaccineId: existedVaccination.id },
    });

    if (existedCampaignInUesed) {
      return res.status(409).json({
        success: false,
        error:
          "Vaccine đang được sử dụng trong chiến dịch tiêm chủng, không thể xóa",
      });
    }

    const existedVaccineRecord = await prisma.vaccinationRecord.findFirst({
      where: { vaccineId: existedVaccination.id },
    });

    if (existedVaccineRecord) {
      return res.status(409).json({
        success: false,
        error:
          "Vaccine đang được sử dụng để lưu thông tin tiêm chủng của học sinh, không thể xoa",
      });
    }
    // Lưu tên vaccine trước khi xóa để hiển thị trong thông báo
    const vaccineName = existedVaccination.name;

    await prisma.vaccine.delete({ where: { id } });

    // Gửi thông báo cho manager
    const manager = await prisma.users.findFirst({
      where: { role: "MANAGER" },
    });

    if (manager) {
      await createManagerNotification(
        manager.id,
        "Xóa vaccine",
        `Vaccine "${vaccineName}" đã được xóa khỏi hệ thống`,
        "VACCINE"
      );
    }

    res.status(200).json({
      success: true,
      message: "Xoá loại vaccine thành công",
    });
  } catch (error) {
    console.error("Error deleting vaccination:", error);
    res.status(500).json({
      success: false,
      error: "Lỗi khi xóa vaccine",
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
