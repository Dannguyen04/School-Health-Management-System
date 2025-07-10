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
    Image,
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
            const response = await axios.get(
                "/api/nurse/approved-medications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.data.success) {
                setApprovedDataRaw(response.data.data);
                setApprovedData(
                    response.data.data.map((item) => ({
                        ...item,
                        medicationName: item.name,
                        studentName: item.student?.user?.fullName || "-",
                        parentName: item.parent?.user?.fullName || "-",
                        duration: item.duration || "-",
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
                    data = data.filter(
                        (item) => item.category === filters.category
                    );
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
            const response = await axios.get(
                "/api/nurse/inventory/categories",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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
            const response = await axios.get(
                `/api/nurse/medication-requests/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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
            message.error(
                error.response?.data?.error || "Lỗi khi cập nhật vật tư"
            );
        }
    };

    // Xóa vật tư
    const handleDeleteInventory = async (record) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(
                `/api/nurse/inventory/${record.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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

    const handleSearch = () => {
        const normalize = (str) =>
            (str || "").replace(/\s+/g, " ").trim().toLowerCase();
        let data = approvedDataRaw;
        if (filters.studentName) {
            data = data.filter((item) =>
                normalize(item.studentName).includes(
                    normalize(filters.studentName)
                )
            );
        }
        if (filters.parentName) {
            data = data.filter((item) =>
                normalize(item.parentName).includes(
                    normalize(filters.parentName)
                )
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
                Array.isArray(times) && times.length > 0
                    ? times.join(", ")
                    : "-",
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
                            <Tag
                                color={isOutOfStock ? "red" : "orange"}
                                size="small"
                            >
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
                    return (
                        <Typography.Text type="secondary">
                            Không có
                        </Typography.Text>
                    );

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
                    record.expiryDate &&
                    new Date(record.expiryDate) <= new Date();
                const isExpiringSoon =
                    record.expiryDate &&
                    new Date(record.expiryDate) > new Date() &&
                    Math.ceil(
                        (new Date(record.expiryDate) - new Date()) /
                            (1000 * 60 * 60 * 24)
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
                                    <WarningOutlined
                                        style={{ color: "#faad14" }}
                                    />
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
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
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
                        <Form
                            form={searchForm}
                            onFinish={handleSearch}
                            layout="vertical"
                        >
                            <Row gutter={16}>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="studentName"
                                        label="Tên học sinh"
                                    >
                                        <Input placeholder="Nhập tên học sinh" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="parentName"
                                        label="Tên phụ huynh"
                                    >
                                        <Input placeholder="Nhập tên phụ huynh" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="medicationName"
                                        label="Tên thuốc"
                                    >
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
                                        <Button onClick={handleResetFilters}>
                                            Xóa bộ lọc
                                        </Button>
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
                        <h3 className="text-lg font-semibold">
                            Quản lý kho vật tư y tế
                        </h3>
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
                        <Form
                            form={searchForm}
                            onFinish={handleSearch}
                            layout="vertical"
                        >
                            <Row gutter={16}>
                                <Col xs={24} sm={8}>
                                    <Form.Item name="search" label="Tìm kiếm">
                                        <Input placeholder="Tên thuốc..." />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item name="category" label="Danh mục">
                                        <Select
                                            placeholder="Chọn danh mục"
                                            allowClear
                                        >
                                            {categories.map((category) => (
                                                <Select.Option
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item name="lowStock" label="Tồn kho">
                                        <Select
                                            placeholder="Chọn trạng thái"
                                            allowClear
                                        >
                                            <Select.Option value="true">
                                                Tồn kho thấp
                                            </Select.Option>
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
                                        <Button onClick={handleResetFilters}>
                                            Xóa bộ lọc
                                        </Button>
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
                <Form
                    layout="inline"
                    onFinish={handleSearch}
                    initialValues={filters}
                >
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
                            title: "Thời gian dùng",
                            dataIndex: "duration",
                            key: "duration",
                            render: (text) => text || "-",
                        },
                        {
                            title: "Ghi chú sử dụng",
                            dataIndex: "usageNote",
                            key: "usageNote",
                            render: (text) => text || "-",
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
                            title: "Ảnh",
                            dataIndex: "image",
                            key: "image",
                            render: (img) =>
                                img ? (
                                    <Image
                                        src={img}
                                        alt="Ảnh thuốc"
                                        style={{
                                            width: 60,
                                            height: 60,
                                            objectFit: "cover",
                                            borderRadius: 8,
                                        }}
                                        preview={true}
                                    />
                                ) : (
                                    "-"
                                ),
                        },
                        {
                            title: "Ngày duyệt",
                            dataIndex: "updatedAt",
                            key: "updatedAt",
                            render: (date) =>
                                date
                                    ? new Date(date).toLocaleDateString("vi-VN")
                                    : "-",
                        },
                        {
                            title: "Chi tiết",
                            key: "actions",
                            render: (_, record) => (
                                <Button
                                    type="link"
                                    onClick={() => {
                                        setSelected(record);
                                        setModalVisible(true);
                                    }}
                                >
                                    Xem chi tiết
                                </Button>
                            ),
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
                    ]}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
            <Modal
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={
                    <Button onClick={() => setModalVisible(false)}>Đóng</Button>
                }
                title={selected?.medicationName || "Chi tiết thuốc"}
                width={600}
            >
                {selected && (
                    <div>
                        <p>
                            <strong>Học sinh:</strong> {selected.studentName}
                        </p>
                        <p>
                            <strong>Phụ huynh:</strong> {selected.parentName}
                        </p>
                        <p>
                            <strong>Tên thuốc:</strong>{" "}
                            {selected.medicationName}
                        </p>
                        <p>
                            <strong>Thời gian dùng:</strong>{" "}
                            {selected.duration || "-"}
                        </p>
                        <p>
                            <strong>Ghi chú sử dụng:</strong>{" "}
                            {selected.usageNote || "-"}
                        </p>
                        <p>
                            <strong>Liều lượng:</strong> {selected.dosage}
                        </p>
                        <p>
                            <strong>Số lượng:</strong> {selected.stockQuantity}
                        </p>
                        <p>
                            <strong>Hướng dẫn:</strong>{" "}
                            {selected.instructions || "-"}
                        </p>
                        {selected.image && (
                            <div style={{ margin: "16px 0" }}>
                                <Image
                                    src={selected.image}
                                    alt="Ảnh thuốc"
                                    style={{ maxWidth: 200, borderRadius: 8 }}
                                    preview={true}
                                />
                            </div>
                        )}
                        <p>
                            <strong>Ngày duyệt:</strong>{" "}
                            {selected.updatedAt
                                ? new Date(
                                      selected.updatedAt
                                  ).toLocaleDateString("vi-VN")
                                : "-"}
                        </p>
                        <p>
                            <strong>Giờ uống cụ thể:</strong>{" "}
                            {Array.isArray(selected?.customTimes) &&
                            selected.customTimes.length > 0
                                ? selected.customTimes.join(", ")
                                : "-"}
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MedicalInventory;
