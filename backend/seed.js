import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const findAdmin = async () => {
    const admin = await prisma.users.findMany({
        where: {
            role: "ADMIN",
        },
    });
    console.log(admin);
};

findAdmin();
