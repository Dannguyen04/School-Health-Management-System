import {
  AlertOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Statistic, Table } from "antd";
import React from "react";

const Dashboard = () => {
  // Mock data
  const dashboardData = {
    totalStudents: 1200,
    vaccinatedStudents: 980,
    healthCheckups: 850,
    incidents: 5,
    gradeStats: [
      {
        grade: "Lớp 1",
        totalStudents: 200,
        vaccinated: 180,
        healthCheckups: 190,
        medications: 15,
      },
      {
        grade: "Lớp 2",
        totalStudents: 220,
        vaccinated: 200,
        healthCheckups: 210,
        medications: 18,
      },
      {
        grade: "Lớp 3",
        totalStudents: 210,
        vaccinated: 190,
        healthCheckups: 200,
        medications: 12,
      },
      {
        grade: "Lớp 4",
        totalStudents: 230,
        vaccinated: 210,
        healthCheckups: 220,
        medications: 20,
      },
      {
        grade: "Lớp 5",
        totalStudents: 240,
        vaccinated: 220,
        healthCheckups: 230,
        medications: 25,
      },
    ],
  };

  const columns = [
    {
      title: "Lớp",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Tổng số học sinh",
      dataIndex: "totalStudents",
      key: "totalStudents",
    },
    {
      title: "Đã tiêm chủng",
      dataIndex: "vaccinated",
      key: "vaccinated",
    },
    {
      title: "Khám sức khỏe",
      dataIndex: "healthCheckups",
      key: "healthCheckups",
    },
    {
      title: "Thuốc",
      dataIndex: "medications",
      key: "medications",
    },
  ];

  const healthStats = [
    { title: "Total Students", value: 1200, icon: <UserOutlined /> },
    { title: "Vaccinated", value: 980, icon: <CheckCircleOutlined /> },
    {
      title: "Health Check Completed",
      value: 850,
      icon: <CheckCircleOutlined />,
    },
    { title: "Pending Alerts", value: 5, icon: <WarningOutlined /> },
  ];

  const recentAlerts = [
    {
      id: 1,
      type: "Vaccination",
      message: "Hepatitis B vaccination due for Class 10A",
      date: "2024-03-20",
    },
    {
      id: 2,
      type: "Health Check",
      message: "Annual health checkup scheduled for Class 8B",
      date: "2024-03-25",
    },
    {
      id: 3,
      type: "Alert",
      message: "Increased cases of flu reported in Class 9C",
      date: "2024-03-18",
    },
  ];

  const upcomingCampaigns = [
    {
      id: 1,
      type: "Vaccination",
      name: "COVID-19 Booster",
      date: "2024-04-01",
      status: "Upcoming",
    },
    {
      id: 2,
      type: "Health Check",
      name: "Annual Physical Exam",
      date: "2024-04-15",
      status: "Upcoming",
    },
  ];

  const alertColumns = [
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Message", dataIndex: "message", key: "message" },
    { title: "Date", dataIndex: "date", key: "date" },
  ];

  const campaignColumns = [
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bảng điều khiển</h1>

      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số học sinh"
              value={dashboardData.totalStudents}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã tiêm chủng"
              value={dashboardData.vaccinatedStudents}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khám sức khỏe"
              value={dashboardData.healthCheckups}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sự cố"
              value={dashboardData.incidents}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Thống kê theo lớp">
        <Table
          dataSource={dashboardData.gradeStats}
          columns={columns}
          rowKey="grade"
          pagination={false}
        />
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Tiêm chủng tháng">
            <div className="h-64 flex items-center justify-center text-gray-500">
              Biểu đồ tiêm chủng tháng
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Khám sức khỏe tháng">
            <div className="h-64 flex items-center justify-center text-gray-500">
              Biểu đồ khám sức khỏe tháng
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Thuốc tháng">
            <div className="h-64 flex items-center justify-center text-gray-500">
              Biểu đồ thuốc tháng
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sự cố tháng">
            <div className="h-64 flex items-center justify-center text-gray-500">
              Biểu đồ sự cố tháng
            </div>
          </Card>
        </Col>
      </Row>

      {/* Health Status Overview */}
      <Row gutter={[16, 16]}>
        {healthStats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Alerts */}
      <Card
        title={
          <div className="flex items-center">
            <AlertOutlined className="mr-2" />
            Recent Health Alerts
          </div>
        }
      >
        <Table
          dataSource={recentAlerts}
          columns={alertColumns}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Upcoming Campaigns */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarOutlined className="mr-2" />
              Upcoming Campaigns
            </div>
            <Button type="primary" icon={<PlusOutlined />}>
              Create New Campaign
            </Button>
          </div>
        }
      >
        <Table
          dataSource={upcomingCampaigns}
          columns={campaignColumns}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Dashboard;
