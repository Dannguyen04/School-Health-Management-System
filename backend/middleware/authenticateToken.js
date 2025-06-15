import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

// Reuse PrismaClient instance (ideally imported from auth.js in a real app)
const prisma = new PrismaClient();

// Validate JWT_SECRET
if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    process.exit(1);
}

// Middleware to authenticate JWT and attach user data
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
        return res
            .status(401)
            .json({ success: false, error: "Access token required" });
    }

    try {
        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.users.findUnique({
            where: { id: decoded.userId },
            include: {
                parentProfile: true,
                studentProfile: true,
                nurseProfile: true,
                managerProfile: true,
                adminProfile: true
            }
        });

        if (!user) {
            return res
                .status(401)
                .json({ success: false, error: "User not found" });
        }

        // Attach user data to request
        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res
            .status(403)
            .json({ success: false, error: "Invalid or expired token" });
    }
};

// Middleware to verify user roles
const verifyRole = (requiredRoles) => (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res
            .status(401)
            .json({ success: false, error: "User not authenticated" });
    }

    // Check if user has required role
    if (!req.user.role || !requiredRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: "Insufficient permissions",
            required: requiredRoles,
            current: req.user.role,
        });
    }

    next();
};

// Specific role-based middleware
const verifyAdmin = verifyRole(["ADMIN"]);
const verifyUser = verifyRole(["ADMIN", "PARENT"]);

// Cleanup Prisma on shutdown
process.on("SIGTERM", async () => {
    console.log("Shutting down middleware...");
    await prisma.$disconnect();
    process.exit(0);
});

export { authenticateToken, verifyAdmin, verifyRole, verifyUser };
