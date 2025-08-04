import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function finalTest() {
    try {
        console.log("🔍 Final system test with diseaseName field...\n");

        // 1. Test Vaccine Creation
        console.log("1️⃣ Testing Vaccine Creation...");
        const testVaccine = await prisma.vaccine.create({
            data: {
                name: "Test Final Vaccine",
                diseaseName: "Test Disease",
                requirement: "REQUIRED",
                manufacturer: "Test Manufacturer",
                origin: "Test Origin",
                description: "Test Description",
                maxDoseCount: 2,
                doseSchedules: [
                    {
                        doseOrder: 1,
                        minInterval: 0,
                        recommendedInterval: 0,
                        description: "First dose",
                    },
                ],
            },
        });
        console.log(
            "✅ Vaccine created:",
            testVaccine.name,
            "- Disease:",
            testVaccine.diseaseName
        );

        // 2. Test Vaccine Update
        console.log("\n2️⃣ Testing Vaccine Update...");
        const updatedVaccine = await prisma.vaccine.update({
            where: { id: testVaccine.id },
            data: {
                diseaseName: "Updated Test Disease",
                description: "Updated description",
            },
        });
        console.log(
            "✅ Vaccine updated:",
            updatedVaccine.name,
            "- New Disease:",
            updatedVaccine.diseaseName
        );

        // 3. Test All Vaccines Query
        console.log("\n3️⃣ Testing Vaccines Query...");
        const allVaccines = await prisma.vaccine.findMany({
            select: {
                id: true,
                name: true,
                diseaseName: true,
                manufacturer: true,
                requirement: true,
            },
        });
        console.log("✅ Found vaccines:", allVaccines.length);
        allVaccines.forEach((v) => {
            console.log(`   - ${v.name} (${v.diseaseName})`);
        });

        // 4. Test Campaign Creation with Vaccine
        console.log("\n4️⃣ Testing Campaign Creation...");
        const testCampaign = await prisma.vaccinationCampaign.create({
            data: {
                name: "Test Campaign",
                vaccineId: testVaccine.id,
                vaccineName: testVaccine.name,
                vaccineManufacturer: testVaccine.manufacturer,
                vaccineRequirement: testVaccine.requirement,
                targetGrades: ["1", "2"],
                scheduledDate: new Date(),
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        console.log(
            "✅ Campaign created:",
            testCampaign.name,
            "for vaccine:",
            testCampaign.vaccineName
        );

        // 5. Test Campaign with Vaccine relation
        console.log("\n5️⃣ Testing Campaign with Vaccine relation...");
        const campaignWithVaccine = await prisma.vaccinationCampaign.findUnique(
            {
                where: { id: testCampaign.id },
                include: {
                    vaccine: true,
                },
            }
        );
        console.log(
            "✅ Campaign includes vaccine diseaseName:",
            campaignWithVaccine.vaccine.diseaseName
        );

        // Clean up
        console.log("\n🧹 Cleaning up test data...");
        await prisma.vaccinationCampaign.delete({
            where: { id: testCampaign.id },
        });
        await prisma.vaccine.delete({ where: { id: testVaccine.id } });
        console.log("✅ Test data cleaned up");

        console.log(
            "\n🎉 ALL TESTS PASSED! System is ready with diseaseName field"
        );
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

finalTest();
