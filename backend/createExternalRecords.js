import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateExistingVaccineRecords() {
    try {
        console.log("🔄 Đang kiểm tra và cập nhật các vaccine records...");

        // 1. Sử dụng raw query để lấy vaccines có diseaseName null hoặc không tồn tại
        const result = await prisma.$runCommandRaw({
            find: "vaccines",
            filter: {
                $or: [
                    { diseaseName: null },
                    { diseaseName: { $exists: false } },
                ],
            },
        });

        console.log(
            `📋 Tìm thấy ${result.cursor.firstBatch.length} vaccine records cần cập nhật:`
        );

        if (result.cursor.firstBatch.length === 0) {
            console.log("✅ Tất cả vaccine đã có diseaseName!");
            return;
        }

        // 2. Cập nhật từng vaccine thiếu diseaseName
        for (const vaccine of result.cursor.firstBatch) {
            console.log(`\n📝 Cập nhật ${vaccine.name} (ID: ${vaccine._id})`);

            // Dự đoán diseaseName dựa trên tên vaccine
            const diseaseName = predictDiseaseName(vaccine.name);
            console.log(`   Dự đoán diseaseName: "${diseaseName}"`);

            // Sử dụng raw update để cập nhật
            await prisma.$runCommandRaw({
                update: "vaccines",
                updates: [
                    {
                        q: { _id: vaccine._id },
                        u: { $set: { diseaseName: diseaseName } },
                    },
                ],
            });

            console.log(`   ✅ Đã cập nhật thành công!`);
        }

        console.log(
            `\n🎉 Hoàn thành cập nhật ${result.cursor.firstBatch.length} vaccine records!`
        );

        // 3. Kiểm tra lại sau khi cập nhật
        console.log("\n🔍 Kiểm tra lại sau khi cập nhật:");
        const allVaccines = await prisma.vaccine.findMany({
            select: {
                id: true,
                name: true,
                diseaseName: true,
            },
        });

        for (const vaccine of allVaccines) {
            console.log(`- ${vaccine.name}: "${vaccine.diseaseName}"`);
        }
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật vaccine records:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Hàm dự đoán diseaseName dựa trên tên vaccine
function predictDiseaseName(vaccineName) {
    const name = vaccineName.toLowerCase();

    // Mapping các từ khóa phổ biến
    const diseaseMapping = {
        // COVID
        covid: "COVID-19",
        coronavirus: "COVID-19",
        "sars-cov-2": "COVID-19",
        pfizer: "COVID-19",
        moderna: "COVID-19",
        astrazeneca: "COVID-19",

        // Cúm
        flu: "Cúm mùa",
        influenza: "Cúm mùa",
        cúm: "Cúm mùa",

        // Viêm gan
        "hepatitis a": "Viêm gan A",
        "hepatitis b": "Viêm gan B",
        hepatitis: "Viêm gan",
        hbv: "Viêm gan B",
        hav: "Viêm gan A",

        // BCG/Lao
        bcg: "Lao phổi",
        tuberculosis: "Lao phổi",
        lao: "Lao phổi",

        // Bại liệt
        polio: "Bại liệt",
        "bại liệt": "Bại liệt",

        // Sởi
        measles: "Sởi",
        sởi: "Sởi",
        rubella: "Rubella",
        mmr: "Sởi, Quai bị, Rubella",

        // Bạch hầu, Ho gà, Uốn ván
        dtp: "Bạch hầu, Ho gà, Uốn ván",
        dpt: "Bạch hầu, Ho gà, Uốn ván",
        hexaxim: "Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B",
        "6 trong 1": "Bạch hầu, Ho gà, Uốn ván, Bại liệt, Hib, Viêm gan B",
        diphtheria: "Bạch hầu",
        pertussis: "Ho gà",
        tetanus: "Uốn ván",
        "bạch hầu": "Bạch hầu",
        "ho gà": "Ho gà",
        "uốn ván": "Uốn ván",

        // Thủy đậu
        varicella: "Thủy đậu",
        chickenpox: "Thủy đậu",
        "thủy đậu": "Thủy đậu",

        // Viêm não Nhật Bản
        "japanese encephalitis": "Viêm não Nhật Bản",
        je: "Viêm não Nhật Bản",
        "viêm não": "Viêm não Nhật Bản",

        // HPV
        hpv: "HPV (Ung thư cổ tử cung)",
        "cervical cancer": "HPV (Ung thư cổ tử cung)",

        // Pneumonia
        pneumonia: "Viêm phổi",
        pneumococcal: "Viêm phổi do phế cầu",
        "viêm phổi": "Viêm phổi",

        // HIB
        hib: "Haemophilus influenzae type b",
        haemophilus: "Haemophilus influenzae type b",

        // Dại
        dại: "Bệnh dại",
        rabies: "Bệnh dại",

        // HIV (thực tế không có vaccine HIV, có thể là test vaccine)
        hiv: "HIV (Vaccine thử nghiệm)",

        // External/System
        external: "Phòng chống bệnh ngoài trường",
        system: "Hệ thống phòng chống bệnh",
    };

    // Tìm kiếm từ khóa trong tên vaccine
    for (const [keyword, disease] of Object.entries(diseaseMapping)) {
        if (name.includes(keyword)) {
            return disease;
        }
    }

    // Nếu không tìm thấy, tạo tên chung
    return `Phòng chống bệnh (${vaccineName})`;
}

// Chạy script
updateExistingVaccineRecords();
