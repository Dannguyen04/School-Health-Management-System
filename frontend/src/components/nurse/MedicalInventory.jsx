import {
  BarChartOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const MedicalInventory = () => {
  const [activeTab, setActiveTab] = useState("approved");
  const [approvedData, setApprovedData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [inventoryForm] = Form.useForm();

  // Lấy danh sách thuốc đã được phê duyệt
  const fetchApprovedMedications = async (filters = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (filters.studentName)
        params.append("studentName", filters.studentName);
      if (filters.parentName) params.append("parentName", filters.parentName);
      if (filters.medicationName)
        params.append("medicationName", filters.medicationName);

      const response = await axios.get("/api/nurse/approved-medications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      if (response.data.success) {
        setApprovedData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching approved medications:", error);
      message.error("Lỗi khi tải danh sách thuốc đã phê duyệt");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách kho vật tư y tế
  const fetchMedicalInventory = async (filters = {}) => {
    setInventoryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.lowStock) params.append("lowStock", filters.lowStock);

      const response = await axios.get("/api/nurse/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      if (response.data.success) {
        setInventoryData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching medical inventory:", error);
      message.error("Lỗi khi tải danh sách kho vật tư");
    } finally {
      setInventoryLoading(false);
    }
  };

  // Lấy danh mục vật tư
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/nurse/inventory/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Lấy thống kê yêu cầu thuốc
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/nurse/medication-requests/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Lấy thống kê kho thuốc
  const fetchInventoryStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/nurse/inventory/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setInventoryStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching inventory stats:", error);
    }
  };

  useEffect(() => {
    fetchApprovedMedications();
    fetchMedicalInventory();
    fetchCategories();
    fetchStats();
    fetchInventoryStats();
  }, []);

  // Cập nhật vật tư
  const handleUpdateInventory = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/nurse/inventory/${selected.id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        message.success("Cập nhật vật tư thành công");
        setEditModalVisible(false);
        setSelected(null);
        fetchMedicalInventory();
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      message.error(error.response?.data?.error || "Lỗi khi cập nhật vật tư");
    }
  };

  // Xóa vật tư
  const handleDeleteInventory = async (record) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`/api/nurse/inventory/${record.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        message.success("Xóa vật tư thành công");
        fetchMedicalInventory();
      }
    } catch (error) {
      console.error("Error deleting inventory:", error);
      message.error(error.response?.data?.error || "Lỗi khi xóa vật tư");
    }
  };

  const handleView = (record) => {
    setSelected(record);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelected(record);
    inventoryForm.setFieldsValue({
      name: record.name,
      description: record.category,
      dosage: record.dosage,
      unit: record.unit,
      manufacturer: record.manufacturer,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
      stockQuantity: record.quantity,
      minStockLevel: record.minStock,
    });
    setEditModalVisible(true);
  };

  const handleSearch = (values) => {
    if (activeTab === "approved") {
      fetchApprovedMedications(values);
    } else {
      fetchMedicalInventory(values);
    }
  };

  const handleResetFilters = () => {
    searchForm.resetFields();
    if (activeTab === "approved") {
      fetchApprovedMedications();
    } else {
      fetchMedicalInventory();
    }
  };

  // Columns cho thuốc đã phê duyệt
  const approvedColumns = [
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Phụ huynh",
      dataIndex: "parentName",
      key: "parentName",
    },
    {
      title: "Tên thuốc",
      dataIndex: "medicationName",
      key: "medicationName",
    },
    {
      title: "Liều lượng",
      dataIndex: "dosage",
      key: "dosage",
    },
    {
      title: "Tần suất",
      dataIndex: "frequency",
      key: "frequency",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Ngày phê duyệt",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        />
      ),
    },
  ];

  // Columns cho kho vật tư
  const inventoryColumns = [
    {
      title: "Tên thuốc",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <Typography.Text type="secondary" className="text-xs">
            {record.description}
          </Typography.Text>
          {record.manufacturer && (
            <div className="text-xs text-gray-500">
              NSX: {record.manufacturer}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      render: (quantity, record) => {
        const isLowStock = quantity <= 5;
        const isOutOfStock = quantity <= 0;

        return (
          <div>
            <div
              className={`font-medium ${
                isOutOfStock
                  ? "text-red-600"
                  : isLowStock
                  ? "text-orange-600"
                  : "text-green-600"
              }`}
            >
              {quantity} {record.unit}
            </div>
            {isLowStock && (
              <Tag color={isOutOfStock ? "red" : "orange"} size="small">
                {isOutOfStock ? "Hết hàng" : "Tồn kho thấp"}
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) => {
        if (!date)
          return <Typography.Text type="secondary">Không có</Typography.Text>;

        const expiryDate = new Date(date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil(
          (expiryDate - today) / (1000 * 60 * 60 * 24)
        );

        let color = "green";
        let text = "Còn hạn";

        if (daysUntilExpiry <= 0) {
          color = "red";
          text = "Hết hạn";
        } else if (daysUntilExpiry <= 30) {
          color = "orange";
          text = `Còn ${daysUntilExpiry} ngày`;
        } else if (daysUntilExpiry <= 90) {
          color = "blue";
          text = `Còn ${daysUntilExpiry} ngày`;
        }

        return (
          <div>
            <div>{new Date(date).toLocaleDateString("vi-VN")}</div>
            <Tag color={color} size="small">
              {text}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        const isLowStock = record.stockQuantity <= 5;
        const isOutOfStock = record.stockQuantity <= 0;
        const hasExpired =
          record.expiryDate && new Date(record.expiryDate) <= new Date();
        const isExpiringSoon =
          record.expiryDate &&
          new Date(record.expiryDate) > new Date() &&
          Math.ceil(
            (new Date(record.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
          ) <= 30;

        const warnings = [];
        if (isOutOfStock) warnings.push("Hết hàng");
        else if (isLowStock) warnings.push("Tồn kho thấp");
        if (hasExpired) warnings.push("Hết hạn");
        else if (isExpiringSoon) warnings.push("Sắp hết hạn");

        return (
          <div className="space-y-1">
            <Tag
              color={
                isOutOfStock || hasExpired
                  ? "red"
                  : isLowStock || isExpiringSoon
                  ? "orange"
                  : "green"
              }
            >
              {isOutOfStock || hasExpired
                ? "Không khả dụng"
                : isLowStock || isExpiringSoon
                ? "Cần chú ý"
                : "Khả dụng"}
            </Tag>
            {warnings.length > 0 && (
              <Tooltip title={warnings.join(", ")}>
                <Badge count={warnings.length} size="small">
                  <WarningOutlined style={{ color: "#faad14" }} />
                </Badge>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xác nhận xóa"
              description="Bạn có chắc chắn muốn xóa vật tư này?"
              onConfirm={() => handleDeleteInventory(record)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: "approved",
      label: "Thuốc đã phê duyệt",
      children: (
        <div className="space-y-6">
          {/* Thống kê */}
          {stats && (
            <Row gutter={16}>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Yêu cầu chờ phê duyệt"
                    value={stats.total.pending}
                    valueStyle={{ color: "#faad14" }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Đã phê duyệt"
                    value={stats.total.approved}
                    valueStyle={{ color: "#52c41a" }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Đã từ chối"
                    value={stats.total.rejected}
                    valueStyle={{ color: "#ff4d4f" }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card>
                  <Statistic
                    title="Phê duyệt tháng này"
                    value={stats.monthly.approved}
                    valueStyle={{ color: "#1890ff" }}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <Card>
            <Form form={searchForm} onFinish={handleSearch} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="studentName" label="Tên học sinh">
                    <Input placeholder="Nhập tên học sinh" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="parentName" label="Tên phụ huynh">
                    <Input placeholder="Nhập tên phụ huynh" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="medicationName" label="Tên thuốc">
                    <Input placeholder="Nhập tên thuốc" />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24} className="text-right">
                  <Space>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      htmlType="submit"
                    >
                      Tìm kiếm
                    </Button>
                    <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card>
            <Spin spinning={loading}>
              <Table
                dataSource={approvedData}
                columns={approvedColumns}
                rowKey="id"
                pagination={{
                  pageSize: 5,
                  showQuickJumper: true,
                }}
              />
            </Spin>
          </Card>
        </div>
      ),
    },
    {
      key: "inventory",
      label: "Kho vật tư y tế",
      children: (
        <div className="space-y-6">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold">Quản lý kho vật tư y tế</h3>
          </div>

          {/* Thống kê tổng quan kho vật tư y tế */}
          {inventoryStats && (
            <Row gutter={16} className="mb-6">
              <Col span={4}>
                <Card>
                  <Statistic
                    title="Tổng số vật tư"
                    value={inventoryStats.total}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="Tồn kho thấp"
                    value={inventoryStats.lowStock}
                    valueStyle={{ color: "#faad14" }}
                    prefix={<WarningOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="Hết hàng"
                    value={inventoryStats.outOfStock}
                    valueStyle={{ color: "#cf1322" }}
                    prefix={<DeleteOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="Sắp hết hạn"
                    value={inventoryStats.expiringSoon}
                    valueStyle={{ color: "#faad14" }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={4}>
                <Card>
                  <Statistic
                    title="Đã hết hạn"
                    value={inventoryStats.expired}
                    valueStyle={{ color: "#cf1322" }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <Card>
            <Form form={searchForm} onFinish={handleSearch} layout="vertical">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="search" label="Tìm kiếm">
                    <Input placeholder="Tên thuốc..." />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="category" label="Danh mục">
                    <Select placeholder="Chọn danh mục" allowClear>
                      {categories.map((category) => (
                        <Select.Option key={category} value={category}>
                          {category}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="lowStock" label="Tồn kho">
                    <Select placeholder="Chọn trạng thái" allowClear>
                      <Select.Option value="true">Tồn kho thấp</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24} className="text-right">
                  <Space>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      htmlType="submit"
                    >
                      Tìm kiếm
                    </Button>
                    <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card>
            <Spin spinning={inventoryLoading}>
              <Table
                dataSource={inventoryData}
                columns={inventoryColumns}
                rowKey="id"
                pagination={{
                  pageSize: 5,
                  showQuickJumper: true,
                }}
              />
            </Spin>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý thuốc và vật tư y tế</h1>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        size="large"
      />

      {/* Modal xem chi tiết thuốc đã phê duyệt */}
      <Modal
        title="Chi tiết thuốc đã phê duyệt"
        open={modalVisible && activeTab === "approved"}
        onCancel={() => setModalVisible(false)}
        footer={<Button onClick={() => setModalVisible(false)}>Đóng</Button>}
        width={700}
      >
        {selected && activeTab === "approved" && (
          <div style={{ padding: 8 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 18,
                marginBottom: 12,
                color: "#1677ff",
              }}
            >
              Thông tin học sinh & phụ huynh
            </div>
            <Row gutter={32}>
              <Col span={12}>
                <div className="mb-2">
                  <div className="label">Họ tên học sinh</div>
                  <div className="value">{selected.studentName}</div>
                </div>
                <div className="mb-2">
                  <div className="label">Email học sinh</div>
                  <div className="value">{selected.studentEmail}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-2">
                  <div className="label">Họ tên phụ huynh</div>
                  <div className="value">{selected.parentName}</div>
                </div>
                <div className="mb-2">
                  <div className="label">Email phụ huynh</div>
                  <div className="value">{selected.parentEmail}</div>
                </div>
              </Col>
            </Row>
            <Divider style={{ margin: "18px 0" }} />
            <div
              style={{
                fontWeight: 600,
                fontSize: 18,
                marginBottom: 12,
                color: "#1677ff",
              }}
            >
              Thông tin thuốc
            </div>
            <Row gutter={32}>
              <Col span={12}>
                <div className="mb-2">
                  <div className="label">Tên thuốc</div>
                  <div className="value">{selected.medicationName}</div>
                </div>
                <div className="mb-2">
                  <div className="label">Mô tả</div>
                  <div className="value">
                    {selected.medicationDescription || "N/A"}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="label">Liều lượng</div>
                  <div className="value">{selected.dosage}</div>
                </div>
                <div className="mb-2">
                  <div className="label">Tần suất</div>
                  <div className="value">{selected.frequency}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-2">
                  <div className="label">Thời gian</div>
                  <div className="value">{selected.duration || "N/A"}</div>
                </div>
                <div className="mb-2">
                  <div className="label">Hướng dẫn</div>
                  <div className="value">{selected.instructions || "N/A"}</div>
                </div>
                <div className="mb-2">
                  <div className="label">Ngày bắt đầu</div>
                  <div className="value">
                    {dayjs(selected.startDate).format("DD/MM/YYYY")}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="label">Ngày kết thúc</div>
                  <div className="value">
                    {selected.endDate
                      ? dayjs(selected.endDate).format("DD/MM/YYYY")
                      : "N/A"}
                  </div>
                </div>
              </Col>
            </Row>
            <Divider style={{ margin: "18px 0" }} />
            <Row gutter={32}>
              <Col span={12}>
                <div className="mb-2">
                  <div className="label">Ngày tạo</div>
                  <div className="value">
                    {dayjs(selected.createdAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-2">
                  <div className="label">Ngày phê duyệt</div>
                  <div className="value">
                    {dayjs(selected.updatedAt).format("DD/MM/YYYY HH:mm")}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Modal xem chi tiết vật tư */}
      <Modal
        title="Chi tiết vật tư y tế"
        open={modalVisible && activeTab === "inventory"}
        onCancel={() => setModalVisible(false)}
        footer={<Button onClick={() => setModalVisible(false)}>Đóng</Button>}
        width={600}
      >
        {selected && activeTab === "inventory" && (
          <div style={{ padding: 8 }}>
            <Row gutter={32}>
              <Col span={12}>
                <div className="mb-2">
                  <div className="label">Tên vật tư</div>
                  <div className="value">{selected.name}</div>
                </div>
                <div className="mb-2">
                  <div className="label">Danh mục</div>
                  <div className="value">{selected.category}</div>
                </div>
                <div className="mb-2">
                  <div className="label">Số lượng</div>
                  <div className="value">
                    <span
                      style={{
                        color:
                          selected.quantity <= selected.minStock
                            ? "#ff4d4f"
                            : "#36ae9a",
                        fontWeight: 600,
                      }}
                    >
                      {selected.quantity} {selected.unit}
                    </span>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="label">Tồn kho tối thiểu</div>
                  <div className="value">
                    {selected.minStock} {selected.unit}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-2">
                  <div className="label">Nhà sản xuất</div>
                  <div className="value">{selected.manufacturer || "-"}</div>
                </div>
                {selected.dosage && (
                  <div className="mb-2">
                    <div className="label">Liều lượng</div>
                    <div className="value">{selected.dosage}</div>
                  </div>
                )}
                {selected.expiryDate && (
                  <div className="mb-2">
                    <div className="label">Hạn sử dụng</div>
                    <div className="value">
                      {dayjs(selected.expiryDate).format("DD/MM/YYYY")}
                    </div>
                  </div>
                )}
              </Col>
            </Row>
            <style>
              {`
                .label {
                  font-weight: 500;
                  color: #555;
                  margin-bottom: 2px;
                }
                .value {
                  font-size: 16px;
                  color: #222;
                  background: #f6f8fa;
                  border-radius: 4px;
                  padding: 4px 10px;
                  margin-bottom: 8px;
                  min-height: 28px;
                  display: flex;
                  align-items: center;
                }
              `}
            </style>
          </div>
        )}
      </Modal>

      {/* Modal cập nhật vật tư */}
      <Modal
        title="Cập nhật vật tư"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={inventoryForm}
          layout="vertical"
          onFinish={handleUpdateInventory}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên thuốc"
                rules={[{ required: true, message: "Vui lòng nhập tên thuốc" }]}
              >
                <Input placeholder="Nhập tên thuốc" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="description"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Select.Option value="Thuốc kháng sinh">
                    Thuốc kháng sinh
                  </Select.Option>
                  <Select.Option value="Thuốc giảm đau">
                    Thuốc giảm đau
                  </Select.Option>
                  <Select.Option value="Thuốc hạ sốt">
                    Thuốc hạ sốt
                  </Select.Option>
                  <Select.Option value="Thuốc ho">Thuốc ho</Select.Option>
                  <Select.Option value="Thuốc dị ứng">
                    Thuốc dị ứng
                  </Select.Option>
                  <Select.Option value="Vật tư y tế">Vật tư y tế</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dosage" label="Liều lượng">
                <Input placeholder="Ví dụ: 500mg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="Đơn vị"
                rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
              >
                <Select placeholder="Chọn đơn vị">
                  <Select.Option value="viên">Viên</Select.Option>
                  <Select.Option value="chai">Chai</Select.Option>
                  <Select.Option value="hộp">Hộp</Select.Option>
                  <Select.Option value="gói">Gói</Select.Option>
                  <Select.Option value="cái">Cái</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="manufacturer" label="Nhà sản xuất">
                <Input placeholder="Nhập nhà sản xuất" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expiryDate" label="Hạn sử dụng">
                <DatePicker
                  placeholder="Chọn ngày"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="stockQuantity"
                label="Số lượng"
                rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="Nhập số lượng"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="minStockLevel"
                label="Tồn kho tối thiểu"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tồn kho tối thiểu",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="Nhập tồn kho tối thiểu"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <div className="text-right">
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <style>
        {`
          .label {
            font-weight: 500;
            color: #555;
            margin-bottom: 2px;
          }
          .value {
            font-size: 16px;
            color: #222;
            background: #f6f8fa;
            border-radius: 4px;
            padding: 4px 10px;
            margin-bottom: 8px;
            min-height: 28px;
            display: flex;
            align-items: center;
          }
        `}
      </style>
    </div>
  );
};

export default MedicalInventory;
