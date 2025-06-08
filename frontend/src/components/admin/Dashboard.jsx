import {
  AlertOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic, Table } from "antd";
import React from "react";

const Dashboard = () => {
  const statistics = [
    {
      title: "Total Students",
      value: 450,
      icon: <TeamOutlined style={{ fontSize: 24 }} />,
      color: "#1890ff",
    },
    {
      title: "Medical Events Today",
      value: 5,
      icon: <AlertOutlined style={{ fontSize: 24 }} />,
      color: "#ff4d4f",
    },
    {
      title: "Pending Vaccinations",
      value: 23,
      icon: <MedicineBoxOutlined style={{ fontSize: 24 }} />,
      color: "#52c41a",
    },
    {
      title: "Health Reports",
      value: 12,
      icon: <FileTextOutlined style={{ fontSize: 24 }} />,
      color: "#722ed1",
    },
  ];

  const recentEvents = [
    {
      key: "1",
      student: "Nguyen Van A",
      event: "High fever",
      time: "09:30",
      status: "Resolved",
    },
    {
      key: "2",
      student: "Tran Thi B",
      event: "Fall",
      time: "10:15",
      status: "In progress",
    },
    {
      key: "3",
      student: "Le Van C",
      event: "Stomachache",
      time: "11:00",
      status: "Resolved",
    },
  ];

  const columns = [
    {
      title: "Student",
      dataIndex: "student",
      key: "student",
    },
    {
      title: "Event",
      dataIndex: "event",
      key: "event",
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Recent Medical Events">
            <Table
              columns={columns}
              dataSource={recentEvents}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Upcoming Vaccination Notices">
            <Table
              columns={[
                {
                  title: "Student",
                  dataIndex: "student",
                  key: "student",
                },
                {
                  title: "Vaccine Type",
                  dataIndex: "vaccine",
                  key: "vaccine",
                },
                {
                  title: "Date",
                  dataIndex: "date",
                  key: "date",
                },
              ]}
              dataSource={[
                {
                  key: "1",
                  student: "Nguyen Van A",
                  vaccine: "5-in-1 Vaccine",
                  date: "15/04/2024",
                },
                {
                  key: "2",
                  student: "Tran Thi B",
                  vaccine: "Flu Vaccine",
                  date: "16/04/2024",
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
