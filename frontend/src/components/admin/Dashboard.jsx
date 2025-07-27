import {
  CheckCircleOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Col, Row, Spin, Statistic } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#ff4d4f", // ADMIN - Red
  "#1890ff", // SCHOOL_NURSE - Blue
  "#52c41a", // PARENT - Green
  "#722ed1", // MANAGER - Purple
];

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
      const usersResponse = await axios.get("/api/admin/users/getAllUsers", {
        headers,
      });

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
            Object.prototype.hasOwnProperty.call(usersByRole, user.role)
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

  // Data for pie chart
  const roleData = [
    { name: "Quản trị viên", value: stats.usersByRole.ADMIN, role: "ADMIN" },
    {
      name: "Y tá trường học",
      value: stats.usersByRole.SCHOOL_NURSE,
      role: "SCHOOL_NURSE",
    },
    { name: "Phụ huynh", value: stats.usersByRole.PARENT, role: "PARENT" },
    { name: "Quản lý", value: stats.usersByRole.MANAGER, role: "MANAGER" },
  ].filter((item) => item.value > 0); // Only show roles with users

  // Calculate total users for percentage
  const totalRoleUsers = roleData.reduce((sum, item) => sum + item.value, 0);

  // Custom legend
  const renderLegend = () => (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {roleData.map((entry, index) => (
        <div key={entry.role} className="flex items-center gap-2">
          <span
            className="inline-block w-4 h-4 rounded-full"
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          ></span>
          <span className="text-sm font-medium text-gray-700">
            {entry.name}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  );

  // Center label for pie chart
  const renderCenterLabel = () => (
    <g>
      <text
        x="50%"
        y="45%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="24"
        fontWeight="bold"
        fill="#1890ff"
      >
        {totalRoleUsers}
      </text>
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fill="#666"
      >
        Tổng người dùng
      </text>
    </g>
  );

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
        <h1 className="text-2xl font-bold text-gray-800">Bảng điều khiển</h1>
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
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Không hoạt động"
              value={stats.inactiveUsers + stats.inactiveStudents}
              prefix={<UserAddOutlined className="text-orange-500" />}
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
              prefix={<MedicineBoxOutlined className="text-blue-500" />}
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
              prefix={<FileTextOutlined className="text-purple-500" />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Pie Chart */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={24}>
          <Card
            title="Phân bố người dùng theo vai trò"
            className="shadow-sm"
            styles={{
              header: {
                backgroundColor: "#f0f9ff",
                borderBottom: "1px solid #91d5ff",
              },
            }}
          >
            {roleData.length === 0 ? (
              <div className="text-center text-gray-400 py-16 text-lg">
                Không có dữ liệu người dùng để hiển thị
              </div>
            ) : (
              <div
                className="flex justify-center items-center"
                style={{ minHeight: 400 }}
              >
                <ResponsiveContainer width={400} height={400}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      dataKey="value"
                      nameKey="name"
                      isAnimationActive={true}
                      labelLine={false}
                      stroke="#fff"
                      strokeWidth={3}
                    >
                      {roleData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          style={{
                            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                          }}
                        />
                      ))}
                    </Pie>
                    {renderCenterLabel()}
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload && payload.length ? (
                          <div className="rounded-lg bg-white/95 px-3 py-2 shadow-lg border border-gray-200">
                            <span style={{ color: payload[0].color }}>
                              {payload[0].name}
                            </span>
                            : {payload[0].value} (
                            {Math.round(
                              (payload[0].value / totalRoleUsers) * 100
                            )}
                            %)
                          </div>
                        ) : null
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {renderLegend()}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
