import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function generateVaccines() {
    const vaccines = [
        {
            name: "Viêm gan B",
            requirement: "REQUIRED",
            expiredDate: new Date("2030-12-31"),
            status: "UNSCHEDULED",
            dose: "first",
            parentConsent: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "Lao",
            requirement: "REQUIRED",
            expiredDate: new Date("2030-12-31"),
            status: "UNSCHEDULED",
            dose: "first",
            parentConsent: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "Bạch hầu",
            requirement: "REQUIRED",
            expiredDate: new Date("2030-12-31"),
            status: "UNSCHEDULED",
            dose: "first",
            parentConsent: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "Ho gà",
            requirement: "REQUIRED",
            expiredDate: new Date("2030-12-31"),
            status: "UNSCHEDULED",
            dose: "first",
            parentConsent: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "Uốn ván",
            requirement: "REQUIRED",
            expiredDate: new Date("2030-12-31"),
            status: "UNSCHEDULED",
            dose: "first",
            parentConsent: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "Bại liệt",
            requirement: "REQUIRED",
            expiredDate: new Date("2030-12-31"),
            status: "UNSCHEDULED",
            dose: "first",
            parentConsent: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "Hib",
            requirement: "REQUIRED",
            expiredDate: new Date("2030-12-31"),
            status: "UNSCHEDULED",
            dose: "first",
            parentConsent: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "Sởi",
            requirement: "REQUIRED",
            expiredDate: new Date("2030-12-31"),
            status: "UNSCHEDULED",
            dose: "first",
            parentConsent: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "Viêm não Nhật Bản B",
            requirement: "REQUIRED",
            expiredDate: new Date("2030-12-31"),
            status: "UNSCHEDULED",
            dose: "first",
            parentConsent: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "Rubella",
            requirement: "REQUIRED",
            expiredDate: new Date("2030-12-31"),
            status: "UNSCHEDULED",
            dose: "first",
            parentConsent: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    try {
        for (const vaccine of vaccines) {
            await prisma.vaccination.create({
                data: vaccine,
            });
            console.log(`Created vaccine: ${vaccine.name}`);
        }
        console.log("Successfully generated 10 mandatory vaccines.");
    } catch (error) {
        console.error("Error generating vaccines:", error);
    } finally {
        await prisma.$disconnect();
    }
}

generateVaccines();
