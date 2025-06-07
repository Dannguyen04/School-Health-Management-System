import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.User.findUnique({
        where: {
            email: "an.vo@admin.com",
        },
    });

    console.log(user);
}

main();
