import {
  AlertOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Col, Row, Spin, Statistic, Table } from "antd";
import { useEffect, useState } from "react";
import { nurseAPI } from "../../utils/api";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalMedicalEvents: 0,
    upcomingVaccinations: 0,
    pendingTasks: 0,
    pendingMedications: 0,
    lowStockItems: 0,
  });
  const [medicalInventory, setMedicalInventory] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
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
      setRefreshing(false);
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
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const isLowStock = record.quantity <= record.minStock;
        return (
          <span style={{ color: isLowStock ? "#ff4d4f" : "#52c41a" }}>
            {isLowStock ? "Tồn kho thấp" : "Bình thường"}
          </span>
        );
      },
    },
  ];

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
          loading={refreshing}
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

      {(() => {
        const expiredItems = medicalInventory.filter(
          (item) => item.expiryDate && new Date(item.expiryDate) < new Date()
        );
        return expiredItems.length > 0 ? (
          <Alert
            message="Cảnh báo vật tư hết hạn"
            description={`${expiredItems.length} vật tư đã hết hạn sử dụng cần được xử lý ngay`}
            type="error"
            showIcon
            icon={<ExclamationCircleOutlined />}
            className="mb-4"
          />
        ) : null;
      })()}

      {(() => {
        const expiringSoonItems = medicalInventory.filter((item) => {
          if (!item.expiryDate) return false;
          const daysUntilExpiry = Math.ceil(
            (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
          );
          return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        });
        return expiringSoonItems.length > 0 ? (
          <Alert
            message="Cảnh báo vật tư sắp hết hạn"
            description={`${expiringSoonItems.length} vật tư sẽ hết hạn trong vòng 30 ngày tới cần được chú ý`}
            type="info"
            showIcon
            icon={<ExclamationCircleOutlined />}
            className="mb-4"
          />
        ) : null;
      })()}

      {/* Low Stock Items Table */}
      {lowStockItems.length > 0 ? (
        <Card
          title={`Vật tư tồn kho thấp (${lowStockItems.length})`}
          className="mt-4 shadow-sm"
          styles={{
            header: {
              backgroundColor: "#fff7e6",
              borderBottom: "1px solid #ffd591",
            },
          }}
        >
          <Table
            dataSource={lowStockItems}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      ) : (
        <Card
          title="Vật tư tồn kho"
          className="mt-4 shadow-sm"
          styles={{
            header: {
              backgroundColor: "#f6ffed",
              borderBottom: "1px solid #b7eb8f",
            },
          }}
        >
          <div className="text-center py-8 text-gray-500">
            <MedicineBoxOutlined className="text-4xl mb-2" />
            <p>Không có vật tư nào ở mức tồn kho thấp</p>
          </div>
        </Card>
      )}

      {/* Pending Medications */}
      <Card
        title="Thuốc đang chờ xử lý"
        className="mt-4 shadow-sm"
        styles={{
          header: {
            backgroundColor: "#f6ffed",
            borderBottom: "1px solid #b7eb8f",
          },
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Học sinh cần uống thuốc"
              value={dashboardStats.pendingMedications}
              prefix={<MedicineBoxOutlined className="text-purple-500" />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Vật tư tồn kho thấp"
              value={dashboardStats.lowStockItems}
              prefix={<AlertOutlined className="text-red-500" />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
