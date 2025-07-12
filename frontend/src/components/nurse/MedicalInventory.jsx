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
  Descriptions,
  Divider,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
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
  const [filters, setFilters] = useState({
    studentName: "",
    parentName: "",
    medicationName: "",
  });

  // Lưu dữ liệu gốc để filter client
  const [approvedDataRaw, setApprovedDataRaw] = useState([]);

  // Lấy danh sách thuốc đã được phê duyệt
  const fetchApprovedMedications = async (filters = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/nurse/approved-medications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setApprovedDataRaw(response.data.data);
        setApprovedData(
          response.data.data.map((item) => ({
            ...item,
            medicationName: item.name,
            studentName: item.student?.user?.fullName || "-",
            parentName: item.parent?.user?.fullName || "-",
            // BỎ duration
          }))
        );
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
      const response = await axios.get("/api/nurse/inventory", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        let data = response.data.data;
        // Nếu có filter search, thực hiện search phía client với normalize
        if (filters.search) {
          const normalize = (str) =>
            (str || "").replace(/\s+/g, " ").trim().toLowerCase();
          data = data.filter((item) =>
            normalize(item.name).includes(normalize(filters.search))
          );
        }
        // Các filter khác vẫn giữ nguyên nếu cần
        if (filters.category) {
          data = data.filter((item) => item.category === filters.category);
        }
        if (filters.lowStock) {
          data = data.filter((item) => item.stockQuantity <= 5);
        }
        setInventoryData(data);
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

  const handleSearch = () => {
    const normalize = (str) =>
      (str || "").replace(/\s+/g, " ").trim().toLowerCase();
    let data = approvedDataRaw;
    if (filters.studentName) {
      data = data.filter((item) =>
        normalize(item.studentName).includes(normalize(filters.studentName))
      );
    }
    if (filters.parentName) {
      data = data.filter((item) =>
        normalize(item.parentName).includes(normalize(filters.parentName))
      );
    }
    if (filters.medicationName) {
      data = data.filter((item) =>
        normalize(item.medicationName).includes(
          normalize(filters.medicationName)
        )
      );
    }
    setApprovedData(data);
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
      render: (frequency) => {
        const freqMap = {
          once: "1 lần/ngày",
          twice: "2 lần/ngày",
          three: "3 lần/ngày",
          four: "4 lần/ngày",
        };
        return freqMap[frequency] || frequency || "-";
      },
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
    {
      title: "Giờ uống cụ thể",
      dataIndex: "customTimes",
      key: "customTimes",
      render: (times) =>
        Array.isArray(times) && times.length > 0 ? times.join(", ") : "-",
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
          <div className="font-medium text-base">{text}</div>
          <Typography.Text type="secondary" className="text-xs">
            {record.description}
          </Typography.Text>
        </div>
      ),
      fixed: "left",
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
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
            <Badge
              count={isOutOfStock ? "Hết" : isLowStock ? "Thấp" : "OK"}
              style={{
                backgroundColor: isOutOfStock
                  ? "#ff4d4f"
                  : isLowStock
                  ? "#faad14"
                  : "#52c41a",
              }}
            >
              <span className="font-medium text-base">
                {quantity} {record.unit}
              </span>
            </Badge>
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
        let color = "green",
          text = "Còn hạn";
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
          <Tooltip title={text}>
            <Tag color={color}>
              {new Date(date).toLocaleDateString("vi-VN")}
              <br />
              {text}
            </Tag>
          </Tooltip>
        );
      },
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
        let color =
          isOutOfStock || hasExpired
            ? "red"
            : isLowStock || isExpiringSoon
            ? "orange"
            : "green";
        let text =
          isOutOfStock || hasExpired
            ? "Không khả dụng"
            : isLowStock || isExpiringSoon
            ? "Cần chú ý"
            : "Khả dụng";
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Hãng SX",
      dataIndex: "manufacturer",
      key: "manufacturer",
      render: (text) => text || "-",
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
      render: (text) => text || "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
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

  // Mapping cho đơn vị, trạng thái, hạn sử dụng
  const unitLabel = {
    vien: "viên",
    ml: "ml",
    mg: "mg",
    khac: "Khác",
  };
  const statusLabel = (record) => {
    if (
      record.stockQuantity <= 0 ||
      (record.expiryDate && new Date(record.expiryDate) <= new Date())
    )
      return { text: "Không khả dụng", color: "red" };
    if (
      record.stockQuantity <= 5 ||
      (record.expiryDate &&
        new Date(record.expiryDate) > new Date() &&
        Math.ceil(
          (new Date(record.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        ) <= 30)
    )
      return { text: "Cần chú ý", color: "orange" };
    return { text: "Khả dụng", color: "green" };
  };
  // Mapping cho hạn sử dụng
  const expiryLabel = (date) => {
    if (!date) return { text: "Không có", color: "default" };
    const d = new Date(date);
    const t = new Date();
    const days = Math.ceil((d - t) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { text: "Hết hạn", color: "red" };
    if (days <= 30) return { text: `Còn ${days} ngày`, color: "orange" };
    if (days <= 90) return { text: `Còn ${days} ngày`, color: "blue" };
    return { text: "Còn hạn", color: "green" };
  };

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
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        Thuốc phụ huynh gửi đã duyệt
      </h1>
      <Card style={{ marginBottom: 16 }}>
        <Form layout="inline" onFinish={handleSearch} initialValues={filters}>
          <Form.Item>
            <Input
              placeholder="Tên học sinh"
              value={filters.studentName}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  studentName: e.target.value,
                }))
              }
              allowClear
            />
          </Form.Item>
          <Form.Item>
            <Input
              placeholder="Tên phụ huynh"
              value={filters.parentName}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  parentName: e.target.value,
                }))
              }
              allowClear
            />
          </Form.Item>
          <Form.Item>
            <Input
              placeholder="Tên thuốc"
              value={filters.medicationName}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  medicationName: e.target.value,
                }))
              }
              allowClear
            />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Tìm kiếm
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => {
              setFilters({
                studentName: "",
                parentName: "",
                medicationName: "",
              });
              setApprovedData(approvedDataRaw);
            }}
          >
            Xóa lọc
          </Button>
        </Form>
      </Card>
      <Card>
        <Table
          dataSource={approvedData}
          rowKey="id"
          loading={loading}
          columns={[
            {
              title: "Tên thuốc",
              dataIndex: "medicationName",
              key: "medicationName",
            },
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
              title: "Liều lượng",
              dataIndex: "dosage",
              key: "dosage",
            },
            {
              title: "Số lượng",
              dataIndex: "stockQuantity",
              key: "stockQuantity",
            },
            {
              title: "Hướng dẫn",
              dataIndex: "instructions",
              key: "instructions",
              render: (text) => text || "-",
            },
            {
              title: "Giờ uống cụ thể",
              dataIndex: "customTimes",
              key: "customTimes",
              render: (times) =>
                Array.isArray(times) && times.length > 0
                  ? times.join(", ")
                  : "-",
            },
            {
              title: "Ngày duyệt",
              dataIndex: "updatedAt",
              key: "updatedAt",
              render: (date) =>
                date ? new Date(date).toLocaleDateString("vi-VN") : "-",
            },
            {
              title: "Chi tiết",
              key: "actions",
              render: (_, record) => (
                <Button
                  type="primary"
                  size="small"
                  shape="round"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelected(record);
                    setModalVisible(true);
                  }}
                >
                  Xem chi tiết
                </Button>
              ),
            },
          ]}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={
          <Button type="primary" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        }
        title={selected?.name || selected?.medicationName || "Chi tiết vật tư"}
        width={700}
      >
        {selected && (
          <div style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
            {selected.image ? (
              <Image
                src={selected.image}
                alt="Ảnh thuốc"
                style={{
                  maxWidth: 220,
                  borderRadius: 12,
                  margin: "0 auto 16px auto",
                  display: "block",
                }}
                preview={true}
              />
            ) : (
              <div
                style={{
                  width: 220,
                  height: 120,
                  background: "#f5f5f5",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#aaa",
                  margin: "0 auto 16px auto",
                }}
              >
                Không có ảnh
              </div>
            )}
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              {selected.medicationName || selected.name}
            </Typography.Title>
            <Divider style={{ margin: "12px 0" }} />
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Liều lượng">
                {selected.dosage || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Đơn vị">
                <Tag color="green">
                  {unitLabel[selected.unit] || selected.unit || "-"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tần suất">
                {(() => {
                  const freqMap = {
                    once: "1 lần/ngày",
                    twice: "2 lần/ngày",
                    three: "3 lần/ngày",
                    four: "4 lần/ngày",
                    "as-needed": "Khi cần thiết",
                    custom: "Tùy chỉnh",
                  };
                  return (
                    freqMap[selected.frequency] || selected.frequency || "-"
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng">
                <Badge
                  count={selected.stockQuantity}
                  style={{ backgroundColor: "#52c41a", marginLeft: 8 }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusLabel(selected).color}>
                  {statusLabel(selected).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian sử dụng">
                {selected.startDate && selected.endDate
                  ? `${new Date(selected.startDate).toLocaleDateString(
                      "vi-VN"
                    )} - ${new Date(selected.endDate).toLocaleDateString(
                      "vi-VN"
                    )}`
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Hãng SX">
                {selected.manufacturer || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Hướng dẫn">
                {selected.instructions || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {selected.updatedAt
                  ? new Date(selected.updatedAt).toLocaleDateString("vi-VN")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {selected.description || "-"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalInventory;
