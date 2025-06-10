import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
    try {
        const users = [
            {
                fullName: "Nguyen Van An",
                email: "an.student@example.com",
                password: "student123",
                role: "STUDENT",
                phone: "0912345678",
                address: "123 Le Loi, Hanoi",
                avatar: "https://example.com/avatars/an.jpg",
                isActive: true,
                createdAt: new Date("2025-06-09T13:36:00.000Z"),
                updatedAt: new Date("2025-06-09T13:36:00.000Z"),
                studentProfile: {
                    create: {
                        studentCode: "STU001",
                        dateOfBirth: new Date("2010-05-15"),
                        gender: "Male",
                        class: "10A1",
                        grade: "10",
                        bloodType: "O+",
                        emergencyContact: "Nguyen Thi Binh",
                        emergencyPhone: "0987654321",
                        createdAt: new Date("2025-06-09T13:36:00.000Z"),
                        updatedAt: new Date("2025-06-09T13:36:00.000Z"),
                    },
                },
            },
            {
                fullName: "Tran Thi Mai",
                email: "mai.student@example.com",
                password: "student456",
                role: "STUDENT",
                phone: "0923456789",
                address: "456 Tran Hung Dao, HCMC",
                avatar: "https://example.com/avatars/mai.jpg",
                isActive: true,
                createdAt: new Date("2025-06-09T13:36:00.000Z"),
                updatedAt: new Date("2025-06-09T13:36:00.000Z"),
                studentProfile: {
                    create: {
                        studentCode: "STU002",
                        dateOfBirth: new Date("2011-03-22"),
                        gender: "Female",
                        class: "9B2",
                        grade: "9",
                        bloodType: "A+",
                        emergencyContact: "Tran Van Long",
                        emergencyPhone: "0976543210",
                        createdAt: new Date("2025-06-09T13:36:00.000Z"),
                        updatedAt: new Date("2025-06-09T13:36:00.000Z"),
                    },
                },
            },
            {
                fullName: "Le Thi Binh",
                email: "binh.parent@example.com",
                password: "parent123",
                role: "PARENT",
                phone: "0987654321",
                address: "123 Le Loi, Hanoi",
                avatar: "https://example.com/avatars/binh.jpg",
                isActive: true,
                createdAt: new Date("2025-06-09T13:36:00.000Z"),
                updatedAt: new Date("2025-06-09T13:36:00.000Z"),
                parentProfile: {
                    create: {
                        occupation: "Teacher",
                        workplace: "Hanoi High School",
                        createdAt: new Date("2025-06-09T13:36:00.000Z"),
                        updatedAt: new Date("2025-06-09T13:36:00.000Z"),
                    },
                },
            },
            {
                fullName: "Tran Van Long",
                email: "long.parent@example.com",
                password: "parent456",
                role: "PARENT",
                phone: "0976543210",
                address: "456 Tran Hung Dao, HCMC",
                avatar: "https://example.com/avatars/long.jpg",
                isActive: true,
                createdAt: new Date("2025-06-09T13:36:00.000Z"),
                updatedAt: new Date("2025-06-09T13:36:00.000Z"),
                parentProfile: {
                    create: {
                        occupation: "Engineer",
                        workplace: "Tech Corp",
                        createdAt: new Date("2025-06-09T13:36:00.000Z"),
                        updatedAt: new Date("2025-06-09T13:36:00.000Z"),
                    },
                },
            },
            {
                fullName: "An Vo",
                email: "an.vo@admin.com",
                password: "admin000",
                role: "ADMIN",
                phone: null,
                address: null,
                avatar: null,
                isActive: true,
                createdAt: new Date("2025-06-09T13:39:00.000Z"),
                updatedAt: new Date("2025-06-09T13:39:00.000Z"),
                adminProfile: {
                    create: {
                        permissions: [
                            "manage_users",
                            "view_reports",
                            "edit_settings",
                        ],
                        createdAt: new Date("2025-06-09T13:39:00.000Z"),
                        updatedAt: new Date("2025-06-09T13:39:00.000Z"),
                    },
                },
            },
        ];

        for (const userData of users) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email },
            });

            if (existingUser) {
                console.log(
                    `User with email ${userData.email} already exists, skipping...`
                );
                continue;
            }

            // Create user and associated profile
            const user = await prisma.user.create({
                data: userData,
            });

            console.log(
                `Created user: ${user.fullName} (${user.email}) with role ${user.role}`
            );
        }

        console.log("Seeding completed successfully!");
    } catch (error) {
        console.error("Seeding error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
