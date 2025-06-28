import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const RoleBaseRoutes = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    fontSize: "18px",
                }}
            >
                Đang tải...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" />;
    }

    if (!requiredRole?.includes(user.role)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default RoleBaseRoutes;
