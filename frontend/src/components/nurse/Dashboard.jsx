import { ReloadOutlined, TeamOutlined, AlertOutlined, CalendarOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Spin,
  Statistic,
  Table,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { nurseAPI } from "../../utils/api";
import NurseDashboardChart from "./NurseDashboardChart";

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalMedicalEvents: 0,
    upcomingVaccinations: 0,
    pendingTasks: 0,
    pendingMedications: 0,
    lowStockItems: 0,
  });
  const [medicalInventory, setMedicalInventory] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);

      // Fetch dashboard statistics
      const statsResponse = await nurseAPI.getDashboardStats();
      if (statsResponse.data.success) {
        setDashboardStats(statsResponse.data.data);
      } else {
        throw new Error(statsResponse.data.error || "Lỗi khi tải thống kê");
      }

      // Fetch recent medical events
      try {
        const eventsResponse = await nurseAPI.getAllMedicalEvents();
        if (eventsResponse.data.success) {
          setRecentEvents(eventsResponse.data.data || []);
        }
      } catch (err) {
        console.warn("Không thể tải danh sách sự cố y tế:", err);
      }

      // Fetch medical inventory
      const inventoryResponse = await nurseAPI.getMedicalInventory();
      if (inventoryResponse.data.success) {
        setMedicalInventory(inventoryResponse.data.data);
      } else {
        console.warn(
          "Không thể tải dữ liệu tồn kho:",
          inventoryResponse.data.error
        );
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Không thể tải dữ liệu dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Filter low stock items
  const lowStockItems = medicalInventory.filter(
    (item) => item.quantity <= item.minStock
  );

  // Sự cố y tế theo tháng
  const recentEventsByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString();
    const count = (recentEvents || []).filter(ev => {
      if (!ev.occurredAt) return false;
      const date = new Date(ev.occurredAt);
      return date.getMonth() + 1 === i + 1;
    }).length;
    return { thang: month, suco: count };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        className="mb-4"
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

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng số học sinh"
              value={dashboardStats.totalStudents}
              prefix={<TeamOutlined className="text-blue-500" />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Sự cố y tế tháng này"
              value={dashboardStats.totalMedicalEvents}
              prefix={<AlertOutlined className="text-orange-500" />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tiêm chủng sắp tới"
              value={dashboardStats.upcomingVaccinations}
              prefix={<CalendarOutlined className="text-green-500" />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Công việc đang chờ"
              value={dashboardStats.pendingTasks}
              prefix={<ExclamationCircleOutlined className="text-red-500" />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ sự cố y tế */}
      <div className="flex justify-center w-full mb-8">
        <NurseDashboardChart data={recentEventsByMonth} />
      </div>

      {/* Alerts Section */}
      {lowStockItems.length > 0 && (
        <Alert
          message="Cảnh báo tồn kho thấp"
          description={`${lowStockItems.length} vật tư đang ở mức tồn kho thấp cần được bổ sung`}
          type="warning"
          showIcon
          icon={<AlertOutlined />}
          className="mb-4"
        />
      )}

      {/* ... (các phần khác nếu bạn muốn giữ, ví dụ bảng sự cố y tế, bảng thuốc phụ huynh gửi đến) ... */}
    </div>
  );
};

export default Dashboard;