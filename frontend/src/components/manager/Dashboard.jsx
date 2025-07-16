import {
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Card, Col, message, Row, Statistic, Table, Typography } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import ManagerDashboardPieChart from "./ManagerDashboardPieChart";
import ManagerHealthCheckPieChart from "./ManagerHealthCheckPieChart";
// import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCampaigns: 0,
    vaccinationCampaigns: 0,
    medicalCheckCampaigns: 0,
    totalConsents: 0,
    agreedConsents: 0,
    declinedConsents: 0,
    healthCheckups: 0,
    vaccinatedStudents: 0,
    incidents: 0,
    needsAttention: 0,
  });
  const [gradeStats, setGradeStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "/api/manager/students/dashboard-stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setStats(response.data.data.stats);
        setGradeStats(response.data.data.gradeStats);
      }
    } catch {
      message.error("Lỗi khi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Table columns
  const gradeColumns = [
    { title: "Lớp", dataIndex: "grade", key: "grade" },
    {
      title: "Tổng số học sinh",
      dataIndex: "totalStudents",
      key: "totalStudents",
      render: (v) => v?.toLocaleString("vi-VN") || 0,
    },
    {
      title: "Đã tiêm chủng",
      dataIndex: "vaccinated",
      key: "vaccinated",
      render: (v) => v?.toLocaleString("vi-VN") || 0,
    },
    {
      title: "Khám sức khỏe",
      dataIndex: "healthCheckups",
      key: "healthCheckups",
      render: (v) => v?.toLocaleString("vi-VN") || 0,
    },
    {
      title: "Thuốc",
      dataIndex: "medications",
      key: "medications",
      render: (v) => v?.toLocaleString("vi-VN") || 0,
    },
  ];

  const getAgreementRate = () => {
    if (stats.totalConsents === 0) return 0;
    return Math.round((stats.agreedConsents / stats.totalConsents) * 100);
  };

  return (
    <div className="space-y-8">
      <Title level={2}>Bảng điều khiển</Title>

      {/* Quick Summary */}
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            bordered
            style={{ boxShadow: "0 2px 8px #e6f7ff", borderRadius: 12 }}
          >
            <Statistic
              title={<span style={{ color: "#888" }}>Tổng số học sinh</span>}
              value={stats.totalStudents}
              valueStyle={{ color: "#1677ff", fontWeight: 700, fontSize: 28 }}
              prefix={<UserOutlined style={{ fontSize: 28 }} />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            bordered
            style={{ boxShadow: "0 2px 8px #fffbe6", borderRadius: 12 }}
          >
            <Statistic
              title={
                <span style={{ color: "#888" }}>Chiến dịch tiêm chủng</span>
              }
              value={stats.vaccinationCampaigns}
              valueStyle={{ color: "#faad14", fontWeight: 700, fontSize: 28 }}
              prefix={<MedicineBoxOutlined style={{ fontSize: 28 }} />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            bordered
            style={{ boxShadow: "0 2px 8px #f6ffed", borderRadius: 12 }}
          >
            <Statistic
              title={
                <span style={{ color: "#888" }}>Chiến dịch khám sức khỏe</span>
              }
              value={stats.medicalCheckCampaigns}
              valueStyle={{ color: "#3f8600", fontWeight: 700, fontSize: 28 }}
              prefix={<CalendarOutlined style={{ fontSize: 28 }} />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            bordered
            style={{ boxShadow: "0 2px 8px #fff1f0", borderRadius: 12 }}
          >
            <Statistic
              title={<span style={{ color: "#888" }}>Số sự cố</span>}
              value={stats.incidents}
              valueStyle={{ color: "#cf1322", fontWeight: 700, fontSize: 28 }}
              prefix={<WarningOutlined style={{ fontSize: 28 }} />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            bordered
            style={{ boxShadow: "0 2px 8px #e6f7ff", borderRadius: 12 }}
          >
            <Statistic
              title={
                <span style={{ color: "#888" }}>Phiếu đồng ý đã nhận</span>
              }
              value={stats.totalConsents}
              valueStyle={{ color: "#1677ff", fontWeight: 700, fontSize: 28 }}
              prefix={<FileTextOutlined style={{ fontSize: 28 }} />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            bordered
            style={{ boxShadow: "0 2px 8px #f6ffed", borderRadius: 12 }}
          >
            <Statistic
              title={<span style={{ color: "#888" }}>Khám sức khỏe</span>}
              value={stats.healthCheckups}
              valueStyle={{ color: "#3f8600", fontWeight: 700, fontSize: 28 }}
              prefix={<CheckCircleOutlined style={{ fontSize: 28 }} />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            bordered
            style={{ boxShadow: "0 2px 8px #fffbe6", borderRadius: 12 }}
          >
            <Statistic
              title={<span style={{ color: "#888" }}>Đã tiêm chủng</span>}
              value={stats.vaccinatedStudents}
              valueStyle={{ color: "#faad14", fontWeight: 700, fontSize: 28 }}
              prefix={<MedicineBoxOutlined style={{ fontSize: 28 }} />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card
            bordered
            style={{ boxShadow: "0 2px 8px #fff1f0", borderRadius: 12 }}
          >
            <Statistic
              title={<span style={{ color: "#888" }}>Cần chú ý</span>}
              value={stats.needsAttention}
              valueStyle={{ color: "#cf1322", fontWeight: 700, fontSize: 28 }}
              prefix={<WarningOutlined style={{ fontSize: 28 }} />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ Pie tỷ lệ tiêm chủng và tỷ lệ khám sức khỏe */}
      <Row gutter={[24, 24]} justify="center" className="mb-8">
        <Col xs={24} md={12}>
          <ManagerDashboardPieChart
            vaccinated={stats.vaccinatedStudents || 0}
            total={stats.totalStudents || 0}
          />
        </Col>
        <Col xs={24} md={12}>
          <ManagerHealthCheckPieChart
            participated={stats.agreedConsents || 0}
            declined={stats.declinedConsents || 0}
          />
        </Col>
      </Row>

      <Card
        title="Thống kê theo lớp"
        style={{
          marginTop: 32,
          borderRadius: 12,
          boxShadow: "0 2px 8px #f0f0f0",
        }}
      >
        <Table
          dataSource={gradeStats}
          columns={gradeColumns}
          rowKey="grade"
          pagination={false}
          loading={loading}
          bordered
          size="middle"
          style={{ background: "#fff", borderRadius: 12 }}
          locale={{ emptyText: "Không có dữ liệu" }}
        />
      </Card>

      {/* <Row gutter={16} style={{ marginTop: 32 }}>
        <Col xs={24} lg={12}>
          <Card title="Tiêm chủng tháng" style={{ borderRadius: 12 }}>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Biểu đồ tiêm chủng tháng (đang phát triển)
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Khám sức khỏe tháng" style={{ borderRadius: 12 }}>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Biểu đồ khám sức khỏe tháng (đang phát triển)
            </div>
          </Card>
        </Col>
      </Row> */}
    </div>
  );
};

export default Dashboard;
