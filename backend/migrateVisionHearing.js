const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function migrateVisionHearingData() {
  try {
    console.log("Bắt đầu migration dữ liệu vision và hearing...");

    // Lấy tất cả medical checks
    const medicalChecks = await prisma.medicalCheck.findMany();
    console.log(`Tìm thấy ${medicalChecks.length} bản ghi medical check`);

    let updatedCount = 0;

    for (const check of medicalChecks) {
      const updateData = {};

      // Chuyển đổi vision fields
      const visionFields = [
        "visionRightNoGlasses",
        "visionLeftNoGlasses",
        "visionRightWithGlasses",
        "visionLeftWithGlasses",
      ];

      visionFields.forEach((field) => {
        if (check[field] !== null && check[field] !== undefined) {
          updateData[field] = check[field].toString();
        }
      });

      // Chuyển đổi hearing fields
      const hearingFields = [
        "hearingLeftNormal",
        "hearingLeftWhisper",
        "hearingRightNormal",
        "hearingRightWhisper",
      ];

      hearingFields.forEach((field) => {
        if (check[field] !== null && check[field] !== undefined) {
          updateData[field] = check[field].toString();
        }
      });

      // Cập nhật nếu có dữ liệu cần thay đổi
      if (Object.keys(updateData).length > 0) {
        await prisma.medicalCheck.update({
          where: { id: check.id },
          data: updateData,
        });
        updatedCount++;
        console.log(`Đã cập nhật medical check ID: ${check.id}`);
      }
    }

    console.log(`Migration hoàn thành! Đã cập nhật ${updatedCount} bản ghi.`);
  } catch (error) {
    console.error("Lỗi trong quá trình migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy migration
migrateVisionHearingData();
