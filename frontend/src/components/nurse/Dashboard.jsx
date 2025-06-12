import {
  AlertOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Alert, Card, Col, Row, Statistic, Table } from "antd";
import React from "react";
import { dashboardStats, medicalInventory } from "../../mock/nurseData";

const Dashboard = () => {
  // Filter low stock items
  const lowStockItems = medicalInventory.filter(
    (item) => item.quantity <= item.minStock
  );

  const columns = [
    {
      title: "Item Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Current Stock",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => `${text} ${record.unit}`,
    },
    {
      title: "Minimum Stock",
      dataIndex: "minStock",
      key: "minStock",
      render: (text, record) => `${text} ${record.unit}`,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={dashboardStats.totalStudents}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Vaccinated Students"
              value={dashboardStats.vaccinatedStudents}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Health Checkups"
              value={dashboardStats.healthCheckups}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Appointments"
              value={dashboardStats.todayAppointments}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts Section */}
      {lowStockItems.length > 0 && (
        <Alert
          message="Low Stock Alert"
          description={`${lowStockItems.length} items are running low on stock`}
          type="warning"
          showIcon
          icon={<AlertOutlined />}
        />
      )}

      {/* Low Stock Items Table */}
      {lowStockItems.length > 0 && (
        <Card title="Low Stock Items" className="mt-4">
          <Table
            dataSource={lowStockItems}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}

      {/* Pending Medications */}
      <Card title="Pending Medications" className="mt-4">
        <Statistic
          title="Students Requiring Medication"
          value={dashboardStats.pendingMedications}
          prefix={<MedicineBoxOutlined />}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
