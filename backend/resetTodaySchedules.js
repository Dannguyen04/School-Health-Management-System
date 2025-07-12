const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cron = require("node-cron");

// Chạy lúc 0h mỗi ngày
cron.schedule("0 0 * * *", async () => {
    console.log("Reset todaySchedules for all ongoing medications...");
    const meds = await prisma.studentMedication.findMany({
        where: {
            status: "APPROVED",
            treatmentStatus: "ONGOING",
            customTimes: { isEmpty: false },
        },
        select: { id: true, customTimes: true },
    });

    for (const med of meds) {
        await prisma.studentMedication.update({
            where: { id: med.id },
            data: { todaySchedules: med.customTimes },
        });
    }
    console.log("Reset todaySchedules done.");
});

// Để script chạy mãi
console.log("Cron job for resetting todaySchedules started.");
