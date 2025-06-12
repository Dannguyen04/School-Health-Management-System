import validator from "validator";
class User {
    constructor(data = {}) {
        this.id = data.id || "";
        this.fullName = data.fullName || "";
        this.email = data.email || "";
        this.password = data.password || "";
        this.role = data.role || UserRole.PARENT;
        this.phone = data.phone || "";
        this.address = data.address || "";
        this.avatar = data.avatar || "";
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();

        this.createdPosts = data.createdPosts || [];
        this.createdEvents = data.createdEvents || [];
        this.notifications = data.notifications || [];
        this.auditLogs = data.auditLogs || [];
    }

    async verifyToken(token) {
        if (!token) throw new Error("Access token required");
        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not defined");

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, fullName: true, role: true },
            });

            if (!user) throw new Error("User not found");
            if (user.id !== this.id)
                throw new Error("Token does not match user");
            return { ...decoded, ...user };
        } catch (error) {
            throw new Error("Invalid or expired token");
        }
    }

    hasPermission(permission, requiredRoles = []) {
        if (this.isAdmin()) return true;
        if (requiredRoles.includes(this.role)) return true;
        if (this.isNurse() && permission.includes("medical")) return true;
        if (this.isManager() && permission.includes("manage")) return true;
        return false;
    }

    getAccessibleData(requesterRole) {
        const baseData = {
            id: this.id,
            fullName: this.fullName,
            email: this.email,
            role: this.role,
        };
        if (requesterRole === UserRole.ADMIN || requesterRole === this.role) {
            return { ...baseData, phone: this.phone, address: this.address };
        }
        return baseData;
    }

    update(data) {
        Object.assign(this, data);
        this.updatedAt = new Date();
        return this;
    }

    validateEmail() {
        return validator.isEmail(this.email);
    }

    validatePassword() {
        return this.password && this.password.length >= 6;
    }

    isStudent() {
        return this.role === UserRole.STUDENT;
    }
    isParent() {
        return this.role === UserRole.PARENT;
    }
    isNurse() {
        return this.role === UserRole.SCHOOL_NURSE;
    }
    isManager() {
        return this.role === UserRole.MANAGER;
    }
    isAdmin() {
        return this.role === UserRole.ADMIN;
    }

    toJSON() {
        return { ...this };
    }
    static fromJSON(data) {
        return new this(data);
    }
}
