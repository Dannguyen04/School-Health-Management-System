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
      title: "Tên vật tư",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tồn kho hiện tại",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => `${text} ${record.unit}`,
    },
    {
      title: "Tồn kho tối thiểu",
      dataIndex: "minStock",
      key: "minStock",
      render: (text, record) => `${text} ${record.unit}`,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bảng điều khiển</h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số học sinh"
              value={dashboardStats.totalStudents}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Học sinh đã tiêm chủng"
              value={dashboardStats.vaccinatedStudents}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khám sức khỏe"
              value={dashboardStats.healthCheckups}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Lịch hẹn hôm nay"
              value={dashboardStats.todayAppointments}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts Section */}
      {lowStockItems.length > 0 && (
        <Alert
          message="Cảnh báo tồn kho thấp"
          description={`${lowStockItems.length} vật tư đang ở mức tồn kho thấp`}
          type="warning"
          showIcon
          icon={<AlertOutlined />}
        />
      )}

      {/* Low Stock Items Table */}
      {lowStockItems.length > 0 && (
        <Card title="Vật tư tồn kho thấp" className="mt-4">
          <Table
            dataSource={lowStockItems}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}

      {/* Pending Medications */}
      <Card title="Thuốc đang chờ" className="mt-4">
        <Statistic
          title="Học sinh cần uống thuốc"
          value={dashboardStats.pendingMedications}
          prefix={<MedicineBoxOutlined />}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
