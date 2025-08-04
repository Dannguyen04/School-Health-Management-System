import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateSpecificVaccines() {
    try {
        console.log(
            "🔄 Cập nhật các vaccine combo với diseaseName chính xác hơn..."
        );

        // Các vaccine cần cập nhật thủ công
        const updates = [
            {
                name: "Vắc xin 6 trong 1 Hexaxim",
                newDiseaseName:
                    "Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B",
            },
            {
                name: "Vaccine Hexaxim",
                newDiseaseName:
                    "Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B",
            },
            {
                name: "DTP",
                newDiseaseName: "Bạch hầu, Ho gà, Uốn ván",
            },
            {
                name: "Dại",
                newDiseaseName: "Bệnh dại",
            },
            {
                name: "HIV",
                newDiseaseName: "HIV (Vaccine thử nghiệm)",
            },
        ];

        for (const update of updates) {
            console.log(`\n📝 Cập nhật "${update.name}":`);
            console.log(`   Từ: cũ → Sang: "${update.newDiseaseName}"`);

            const result = await prisma.vaccine.updateMany({
                where: { name: update.name },
                data: { diseaseName: update.newDiseaseName },
            });

            if (result.count > 0) {
                console.log(`   ✅ Đã cập nhật ${result.count} vaccine(s)`);
            } else {
                console.log(`   ⚠️ Không tìm thấy vaccine với tên này`);
            }
        }

        console.log(`\n🎉 Hoàn thành cập nhật các vaccine combo!`);

        // Kiểm tra lại kết quả
        console.log("\n🔍 Kết quả cuối cùng:");
        const allVaccines = await prisma.vaccine.findMany({
            select: {
                name: true,
                diseaseName: true,
            },
            orderBy: { name: "asc" },
        });

        for (const vaccine of allVaccines) {
            console.log(`- ${vaccine.name}: "${vaccine.diseaseName}"`);
        }
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy script
updateSpecificVaccines();
