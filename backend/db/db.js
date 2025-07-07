import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const connectToDatabase = async () => {
    try {
        await prisma.$connect();
        console.log("Connected to database successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

export { prisma, connectToDatabase };
export default connectToDatabase;
