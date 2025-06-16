import {
  AlertOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Statistic, Table } from "antd";
import React from "react";

const Dashboard = () => {
  // Mock data for demonstration
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
