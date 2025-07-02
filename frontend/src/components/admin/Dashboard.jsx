import {
    CheckCircleOutlined,
    FileTextOutlined,
    MedicineBoxOutlined,
    ReloadOutlined,
    TeamOutlined,
    UserAddOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Bar } from "@ant-design/plots";
import { Alert, Button, Card, Col, Row, Spin, Statistic } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        usersByRole: {
            ADMIN: 0,
            SCHOOL_NURSE: 0,
            PARENT: 0,
            MANAGER: 0,
        },
        activeUsers: 0,
        inactiveUsers: 0,
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const authToken = localStorage.getItem("token");
            if (!authToken) {
                throw new Error("Không tìm thấy token xác thực");
            }

            const headers = {
                Authorization: `Bearer ${authToken}`,
            };

            // Fetch all users (non-students)
            const usersResponse = await axios.get(
                "/api/admin/users/getAllUsers",
                {
                    headers,
                }
            );

            // Fetch all students
            const studentsResponse = await axios.get("/api/admin/students", {
                headers,
            });

            if (usersResponse.data.success && studentsResponse.data.success) {
                const users = usersResponse.data.data;
                const students = studentsResponse.data.data;

                // Calculate statistics
                const usersByRole = {
                    ADMIN: 0,
                    SCHOOL_NURSE: 0,
                    PARENT: 0,
                    MANAGER: 0,
                };

                let activeUsers = 0;
                let inactiveUsers = 0;

                users.forEach((user) => {
                    if (user.isActive) {
                        activeUsers++;
                    } else {
                        inactiveUsers++;
                    }

                    if (
                        user.role &&
                        Object.prototype.hasOwnProperty.call(
                            usersByRole,
                            user.role
                        )
                    ) {
                        usersByRole[user.role]++;
                    }
                });

                // Count active students
                const activeStudents = students.filter(
                    (student) => student.isActive
                ).length;
                const inactiveStudents = students.filter(
                    (student) => !student.isActive
                ).length;

                setStats({
                    totalUsers: users.length,
                    totalStudents: students.length,
                    usersByRole,
                    activeUsers,
                    inactiveUsers,
                    activeStudents,
                    inactiveStudents,
                });
            } else {
                throw new Error("Lỗi khi tải dữ liệu");
            }
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(
                err.response?.data?.error ||
                    err.message ||
                    "Lỗi khi tải dữ liệu dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleRefresh = () => {
        fetchDashboardData();
    };

    // Data for charts
    const roleData = [
        { role: "Quản trị viên", count: stats.usersByRole.ADMIN },
        { role: "Y tá trường học", count: stats.usersByRole.SCHOOL_NURSE },
        { role: "Phụ huynh", count: stats.usersByRole.PARENT },
        { role: "Quản lý", count: stats.usersByRole.MANAGER },
    ];

    const userStatusData = [
        {
            status: "Hoạt động",
            count: stats.activeUsers + stats.activeStudents,
        },
        {
            status: "Không hoạt động",
            count: stats.inactiveUsers + stats.inactiveStudents,
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        type="primary"
                        ghost
                    >
                        Thử lại
                    </Button>
                </div>
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button
                            type="link"
                            onClick={handleRefresh}
                            icon={<ReloadOutlined />}
                            className="text-red-600 hover:text-red-800"
                        >
                            Thử lại
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    Bảng điều khiển
                </h1>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    type="primary"
                    ghost
                >
                    Làm mới
                </Button>
            </div>

            {/* Main Statistics Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Tổng số người dùng"
                            value={stats.totalUsers + stats.totalStudents}
                            prefix={<UserOutlined className="text-blue-500" />}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Tổng số học sinh"
                            value={stats.totalStudents}
                            prefix={<TeamOutlined className="text-green-500" />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Đang hoạt động"
                            value={stats.activeUsers + stats.activeStudents}
                            prefix={
                                <CheckCircleOutlined className="text-green-500" />
                            }
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Không hoạt động"
                            value={stats.inactiveUsers + stats.inactiveStudents}
                            prefix={
                                <UserAddOutlined className="text-orange-500" />
                            }
                            valueStyle={{ color: "#fa8c16" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Role-based Statistics */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Quản trị viên"
                            value={stats.usersByRole.ADMIN}
                            prefix={<UserOutlined className="text-red-500" />}
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Y tá trường học"
                            value={stats.usersByRole.SCHOOL_NURSE}
                            prefix={
                                <MedicineBoxOutlined className="text-blue-500" />
                            }
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Phụ huynh"
                            value={stats.usersByRole.PARENT}
                            prefix={<UserOutlined className="text-green-500" />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Quản lý"
                            value={stats.usersByRole.MANAGER}
                            prefix={
                                <FileTextOutlined className="text-purple-500" />
                            }
                            valueStyle={{ color: "#722ed1" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card
                        title="Phân bố theo vai trò"
                        className="shadow-sm"
                        styles={{
                            header: {
                                backgroundColor: "#f0f9ff",
                                borderBottom: "1px solid #91d5ff",
                            },
                        }}
                    >
                        <Bar
                            data={roleData}
                            xField="count"
                            yField="role"
                            height={300}
                            color="#1890ff"
                            label={{
                                position: "right",
                                style: {
                                    fill: "#666",
                                },
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        title="Trạng thái người dùng"
                        className="shadow-sm"
                        styles={{
                            header: {
                                backgroundColor: "#f6ffed",
                                borderBottom: "1px solid #b7eb8f",
                            },
                        }}
                    >
                        <Bar
                            data={userStatusData}
                            xField="count"
                            yField="status"
                            height={300}
                            color={["#52c41a", "#fa8c16"]}
                            label={{
                                position: "right",
                                style: {
                                    fill: "#666",
                                },
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
