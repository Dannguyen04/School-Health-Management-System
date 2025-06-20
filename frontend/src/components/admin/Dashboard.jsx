import {
  CheckCircleOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Bar, Line } from "@ant-design/plots";
import { Card, Col, Row, Statistic } from "antd";

const AdminDashboard = () => {
  // Mock data - replace with real data from API
  const userStats = {
    total: 150,
    active: 120,
    nurses: 15,
    parents: 100,
  };

  const formStats = {
    total: 200,
    approved: 150,
    pending: 30,
    rejected: 20,
  };

  const medicationStats = {
    total: 80,
    active: 60,
    completed: 20,
  };

  // Mock data for charts
  const userTrendData = [
    { date: "2024-01", users: 100 },
    { date: "2024-02", users: 120 },
    { date: "2024-03", users: 150 },
  ];

  const formStatusData = [
    { status: "Đã duyệt", count: 150 },
    { status: "Đang chờ", count: 30 },
    { status: "Từ chối", count: 20 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bảng điều khiển</h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={userStats.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số biểu mẫu"
              value={formStats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Biểu mẫu đã duyệt"
              value={formStats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thuốc đang sử dụng"
              value={medicationStats.active}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Xu hướng tăng trưởng người dùng">
            <Line
              data={userTrendData}
              xField="date"
              yField="users"
              smooth
              point
              height={300}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Phân bố trạng thái biểu mẫu">
            <Bar
              data={formStatusData}
              xField="count"
              yField="status"
              height={300}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
