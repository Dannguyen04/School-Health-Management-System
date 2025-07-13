import { ReloadOutlined } from "@ant-design/icons";
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
import "./Dashboard.css";

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
  // Bỏ mọi phần liên quan đến medicalInventory, lowStockItems, vật tư/kho
  // Thêm state mock cho thuốc phụ huynh gửi đến
  const [parentMedicines, setParentMedicines] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        // setRefreshing(true); // Xoá
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch dashboard statistics
      const statsResponse = await nurseAPI.getDashboardStats();
      console.log("Dashboard stats response:", statsResponse);

      if (statsResponse.data.success) {
        setDashboardStats(statsResponse.data.data);
      } else {
        throw new Error(statsResponse.data.error || "Lỗi khi tải thống kê");
      }

      // Fetch recent medical events
      try {
        const eventsResponse = await nurseAPI.getRecentMedicalEvents();
        if (eventsResponse.data.success) {
          setRecentEvents(eventsResponse.data.data || []);
        }
      } catch (err) {
        console.warn("Không thể tải sự kiện y tế gần đây:", err);
      }

      // Lấy danh sách thuốc phụ huynh gửi đến từ API
      try {
        const medicinesResponse = await nurseAPI.getPendingMedicines();
        if (medicinesResponse.data.success) {
          setParentMedicines(medicinesResponse.data.data || []);
        }
      } catch (err) {
        console.warn("Không thể tải danh sách thuốc phụ huynh gửi đến:", err);
      }

      // Fetch students for nurse
      try {
        const studentsResponse = await nurseAPI.getStudentsForNurse();
        if (studentsResponse.data.success) {
          setStudents(studentsResponse.data.data || []);
        }
      } catch (err) {
        console.warn("Không thể tải danh sách học sinh:", err);
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
      // setRefreshing(false); // Xoá
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Calculate real statistics
  const realStats = {
    totalStudents: students.length || dashboardStats.totalStudents,
    totalMedicalEvents:
      recentEvents.length || dashboardStats.totalMedicalEvents,
    upcomingVaccinations: dashboardStats.upcomingVaccinations,
    pendingTasks: dashboardStats.pendingTasks,
    pendingMedications:
      parentMedicines.length || dashboardStats.pendingMedications,
    lowStockItems: 0, // No longer applicable
  };

  // Sau khi có recentEvents:
  const recentEventsByMonth = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString();
    const count = recentEvents.filter(ev => {
      if (!ev.occurredAt) return false;
      const date = new Date(ev.occurredAt);
      return date.getMonth() + 1 === i + 1;
    }).length;
    return { thang: month, suco: count };
  });


  const statusMap = {
    PENDING_APPROVAL: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    ACTIVE: "Đang sử dụng",
    EXPIRED: "Hết hạn",
  };

  const severityMap = {
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
    critical: "Nguy kịch",
  };

  const eventStatusMap = {
    PENDING: "Chờ xử lý",
    IN_PROGRESS: "Đang xử lý",
    RESOLVED: "Đã giải quyết",
    REFERRED: "Chuyển viện",
  };

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
    <div className="dashboard-container">
      <div className="dashboard-header p-6 mb-6 fade-in">
        <Title level={2} className="mb-1 text-gray-800">
          Bảng điều khiển y tế
        </Title>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card blue">
            <Statistic
              title={<Text strong>Tổng số học sinh</Text>}
              value={realStats.totalStudents}
              valueStyle={{ color: "#1890ff", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card orange">
            <Statistic
              title={<Text strong>Sự cố y tế tháng này</Text>}
              value={realStats.totalMedicalEvents}
              valueStyle={{ color: "#fa8c16", fontSize: "24px" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card green">
            <Statistic
              title={<Text strong>Đơn thuốc phụ huynh gửi</Text>}
              value={parentMedicines.length}
              valueStyle={{ color: "#52c41a", fontSize: "24px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ sự cố y tế */}
      <div className="flex justify-center w-full mb-8">
        <NurseDashboardChart data={recentEventsByMonth} />
      </div>

      {/* Bảng dữ liệu sự cố y tế */}
      <Card className="content-card mb-6">
        <Title level={4}>Danh sách sự cố y tế</Title>
        <Table
          dataSource={recentEvents}
          rowKey={(record, idx) => record.id || idx}
          columns={[
            {
              title: "Ngày",
              dataIndex: "occurredAt",
              key: "occurredAt",
              render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : ""),
            },
            {
              title: "Mã học sinh",
              dataIndex: "studentCode",
              key: "studentCode",
            },
            {
              title: "Học sinh",
              dataIndex: "studentName",
              key: "studentName",
            },
            {
              title: "Sự kiện",
              dataIndex: "title",
              key: "title",
            },
            {
              title: "Mức độ",
              dataIndex: "severity",
              key: "severity",
              render: (v) => severityMap[v] || v,
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              key: "status",
              render: (v) => eventStatusMap[v] || v,
            },
          ]}
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: "Không có sự cố y tế nào" }}
        />
      </Card>

      {/* Bảng dữ liệu thuốc phụ huynh gửi đến */}
      <Card className="content-card">
        <Title level={4}>Danh sách thuốc phụ huynh gửi đến</Title>
        <Table
          dataSource={parentMedicines}
          rowKey={(record) => record.id}
          columns={[
            {
              title: "Học sinh",
              dataIndex: "studentName",
              key: "studentName",
            },
            {
              title: "Tên thuốc",
              dataIndex: "medicationName",
              key: "medicationName",
            },
            {
              title: "Liều lượng",
              key: "dosage",
              render: (_, record) => `${record.dosage} ${record.unit || ""}`,
            },
            {
              title: "Ngày gửi",
              dataIndex: "createdAt",
              key: "createdAt",
              render: (v) => (v ? new Date(v).toLocaleDateString("vi-VN") : ""),
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              key: "status",
              render: (v) => statusMap[v] || v,
            },
          ]}
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: "Không có đơn thuốc nào" }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
