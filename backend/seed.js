import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function generateTestData() {
    try {
        // Create test medications
        const medications = [
            {
                name: "Paracetamol 500mg",
                description: "Thuốc giảm đau, hạ sốt",
                dosage: "500mg",
                unit: "tablets",
                manufacturer: "Dược phẩm Việt Nam",
                expiryDate: new Date("2024-12-31"),
                stockQuantity: 500,
                minStockLevel: 100,
            },
            {
                name: "Bandages",
                description: "Băng y tế",
                dosage: "1",
                unit: "pieces",
                manufacturer: "Medical Supplies Co.",
                expiryDate: new Date("2025-06-30"),
                stockQuantity: 200,
                minStockLevel: 50,
            },
            {
                name: "Antiseptic Solution",
                description: "Dung dịch sát khuẩn",
                dosage: "100ml",
                unit: "bottles",
                manufacturer: "Health Care Ltd.",
                expiryDate: new Date("2024-09-30"),
                stockQuantity: 15,
                minStockLevel: 20,
            },
            {
                name: "Ibuprofen 400mg",
                description: "Thuốc chống viêm",
                dosage: "400mg",
                unit: "tablets",
                manufacturer: "Pharma Corp",
                expiryDate: new Date("2024-11-30"),
                stockQuantity: 300,
                minStockLevel: 80,
            },
        ];

        for (const med of medications) {
            await prisma.medication.create({
                data: med,
            });
            console.log(`Created medication: ${med.name}`);
        }

        console.log("Test data created successfully!");
    } catch (error) {
        console.error("Error generating test data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

generateTestData();
