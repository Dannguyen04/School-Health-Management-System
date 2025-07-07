// Script seed.js: Import vaccine data from School_Health.vaccinations.json into MongoDB via Prisma (ES6 module)
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const filePath = path.join(__dirname, "School_Health.vaccinations.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const vaccines = JSON.parse(rawData);

    for (const v of vaccines) {
        try {
            await prisma.vaccine.upsert({
                where: { name: v.name },
                update: {
                    requirement: v.requirement,
                    manufacturer: v.manufacturer || "",
                    origin: v.origin || "",
                    referenceUrl: v.referenceUrl || "",
                    description: v.notes || "",
                    sideEffects: v.sideEffects || "",
                    contraindications: null,
                    recommendedAge: null,
                    createdAt: v.createdAt
                        ? new Date(v.createdAt.$date)
                        : undefined,
                    updatedAt: v.updatedAt
                        ? new Date(v.updatedAt.$date)
                        : undefined,
                },
                create: {
                    name: v.name,
                    requirement: v.requirement,
                    manufacturer: v.manufacturer || "",
                    origin: v.origin || "",
                    referenceUrl: v.referenceUrl || "",
                    description: v.notes || "",
                    sideEffects: v.sideEffects || "",
                    contraindications: null,
                    recommendedAge: null,
                    createdAt: v.createdAt
                        ? new Date(v.createdAt.$date)
                        : undefined,
                    updatedAt: v.updatedAt
                        ? new Date(v.updatedAt.$date)
                        : undefined,
                },
            });
            console.log(`Seeded vaccine: ${v.name}`);
        } catch (err) {
            console.error(`Error seeding vaccine ${v.name}:`, err.message);
        }
    }
    await prisma.$disconnect();
}

main().catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
