import {
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    FilterOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    AlertOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
    Statistic,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { nurseAPI } from "../../utils/api";

const { TextArea } = Input;

const MedicalInventory = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [inventory, setInventory] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showLowStock, setShowLowStock] = useState(false);
    const [error, setError] = useState(null);
    const [lowStockModalVisible, setLowStockModalVisible] = useState(false);
    const [expiredModalVisible, setExpiredModalVisible] = useState(false);
    const [expiringSoonModalVisible, setExpiringSoonModalVisible] =
        useState(false);

    // Fetch inventory data
    const fetchInventory = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (searchText) params.search = searchText;
            if (selectedCategory) params.category = selectedCategory;

            const response = await nurseAPI.getMedicalInventory(params);
            if (response.data.success) {
                setInventory(response.data.data);
            } else {
                throw new Error(response.data.error || "Lỗi khi tải dữ liệu");
            }
        } catch (error) {
            console.error("Error fetching inventory:", error);
            setError(
                error.response?.data?.error ||
                    error.message ||
                    "Lỗi khi tải danh sách vật tư y tế"
            );
            message.error("Lỗi khi tải danh sách vật tư y tế");
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await nurseAPI.getInventoryCategories();
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [searchText, selectedCategory, showLowStock]);

    const columns = [
        {
            title: "Tên vật tư",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    {record.manufacturer && (
                        <div className="text-xs text-gray-500">
                            {record.manufacturer}
                        </div>
                    )}
                    {record.dosage && (
                        <div className="text-xs text-blue-500">
                            {record.dosage}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Danh mục",
            dataIndex: "category",
            key: "category",
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (text, record) => (
                <span
                    className={
                        text <= record.minStock
                            ? "text-red-500 font-medium"
                            : ""
                    }
                >
                    {text} {record.unit}
                </span>
            ),
        },
        {
            title: "Tồn kho tối thiểu",
            dataIndex: "minStock",
            key: "minStock",
            render: (text, record) => `${text} ${record.unit}`,
        },
        {
            title: "Hạn sử dụng",
            dataIndex: "expiryDate",
            key: "expiryDate",
            render: (text) => {
                if (!text) return "-";
                const expiryDate = dayjs(text);
                const today = dayjs();
                const daysUntilExpiry = expiryDate.diff(today, "day");

                if (daysUntilExpiry < 0) {
                    return (
                        <Tooltip title="Đã hết hạn">
                            <span className="text-red-500 flex items-center">
                                <ExclamationCircleOutlined className="mr-1" />
                                {expiryDate.format("DD/MM/YYYY")}
                            </span>
                        </Tooltip>
                    );
                } else if (daysUntilExpiry <= 30) {
                    return (
                        <Tooltip title={`Còn ${daysUntilExpiry} ngày`}>
                            <span className="text-orange-500">
                                {expiryDate.format("DD/MM/YYYY")}
                            </span>
                        </Tooltip>
                    );
                } else {
                    return expiryDate.format("DD/MM/YYYY");
                }
            },
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (_, record) => {
                const isLowStock = record.quantity <= record.minStock;
                const isExpired =
                    record.expiryDate &&
                    dayjs(record.expiryDate).isBefore(dayjs());

                if (isExpired) {
                    return <Tag color="red">Hết hạn</Tag>;
                } else if (isLowStock) {
                    return <Tag color="orange">Tồn kho thấp</Tag>;
                } else {
                    return <Tag color="green">Bình thường</Tag>;
                }
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            type="primary"
                            size="small"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description={`Bạn có chắc chắn muốn xóa "${record.name}"?`}
                        onConfirm={() => handleDelete(record)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Tooltip title="Xóa">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleEdit = (record) => {
        setEditingItem(record);
        form.setFieldsValue({
            ...record,
            expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (record) => {
        try {
            await nurseAPI.deleteMedicalInventory(record.id);
            message.success("Xóa vật tư thành công");
            fetchInventory();
        } catch (error) {
            console.error("Delete failed:", error);
            const errorMessage =
                error.response?.data?.error ||
                error.message ||
                "Lỗi khi xóa vật tư";
            message.error(errorMessage);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            const formData = {
                ...values,
                expiryDate: values.expiryDate
                    ? values.expiryDate.format("YYYY-MM-DD")
                    : null,
                stockQuantity: values.quantity,
                minStockLevel: values.minStock,
            };

            if (editingItem) {
                await nurseAPI.updateMedicalInventory(editingItem.id, formData);
                message.success("Cập nhật vật tư thành công");
            } else {
                await nurseAPI.createMedicalInventory(formData);
                message.success("Thêm vật tư thành công");
            }

            setIsModalVisible(false);
            form.resetFields();
            setEditingItem(null);
            fetchInventory();
        } catch (error) {
            console.error("Submit error:", error);
            const errorMessage =
                error.response?.data?.error ||
                error.message ||
                "Lỗi khi lưu vật tư";
            message.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRefresh = () => {
        fetchInventory();
        fetchCategories();
    };

    const lowStockItems = inventory.filter(
        (item) => item.quantity <= item.minStock
    );

    const expiredItems = inventory.filter(
        (item) => item.expiryDate && dayjs(item.expiryDate).isBefore(dayjs())
    );

    const expiringSoonItems = inventory.filter((item) => {
        if (!item.expiryDate) return false;
        const daysUntilExpiry = dayjs(item.expiryDate).diff(dayjs(), "day");
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    if (error && !loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Quản lý kho y tế</h1>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        type="primary"
                        ghost
                    >
                        Thử lại
                    </Button>
                </div>
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
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
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                    Quản lý kho y tế
                </h1>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                        type="primary"
                        ghost
                    >
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingItem(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                    >
                        Thêm vật tư
                    </Button>
                </Space>
            </div>

            {/* Search and Filter Section */}
            <Card className="shadow-sm">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8}>
                        <Input
                            placeholder="Tìm kiếm theo tên vật tư..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={6}>
                        <Select
                            placeholder="Chọn danh mục"
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            allowClear
                            style={{ width: "100%" }}
                        >
                            {categories.map((category) => (
                                <Select.Option key={category} value={category}>
                                    {category}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={10}>
                        <Space size="small" wrap>
                            <Button
                                type="primary"
                                danger={lowStockItems.length > 0}
                                icon={<AlertOutlined />}
                                onClick={() => setLowStockModalVisible(true)}
                            >
                                Tồn kho thấp ({lowStockItems.length})
                            </Button>
                            <Button
                                type="primary"
                                danger={expiredItems.length > 0}
                                icon={<ExclamationCircleOutlined />}
                                onClick={() => setExpiredModalVisible(true)}
                            >
                                Hết hạn ({expiredItems.length})
                            </Button>
                            <Button
                                type="primary"
                                icon={<ExclamationCircleOutlined />}
                                onClick={() =>
                                    setExpiringSoonModalVisible(true)
                                }
                            >
                                Sắp hết hạn ({expiringSoonItems.length})
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Alerts */}
            {lowStockItems.length > 0 && (
                <Alert
                    message="Cảnh báo tồn kho thấp"
                    description={`${lowStockItems.length} vật tư đang ở mức tồn kho thấp cần được bổ sung`}
                    type="warning"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                />
            )}

            {expiredItems.length > 0 && (
                <Alert
                    message="Cảnh báo vật tư hết hạn"
                    description={`${expiredItems.length} vật tư đã hết hạn sử dụng cần được xử lý`}
                    type="error"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                />
            )}

            {expiringSoonItems.length > 0 && (
                <Alert
                    message="Cảnh báo vật tư sắp hết hạn"
                    description={`${expiringSoonItems.length} vật tư sẽ hết hạn trong vòng 30 ngày tới`}
                    type="info"
                    showIcon
                />
            )}

            {/* Inventory Table */}
            <Card className="shadow-sm">
                <Table
                    dataSource={inventory}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 5,
                        showQuickJumper: true,
                    }}
                    rowClassName={(record) => {
                        const isLowStock = record.quantity <= record.minStock;
                        const isExpired =
                            record.expiryDate &&
                            dayjs(record.expiryDate).isBefore(dayjs());

                        if (isExpired) return "bg-red-50";
                        if (isLowStock) return "bg-orange-50";
                        return "";
                    }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingItem ? "Sửa vật tư" : "Thêm vật tư mới"}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                    setEditingItem(null);
                }}
                width={700}
                okText={editingItem ? "Cập nhật" : "Thêm"}
                cancelText="Hủy"
                confirmLoading={submitting}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="name"
                                label="Tên vật tư"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tên vật tư",
                                    },
                                ]}
                            >
                                <Input placeholder="VD: Paracetamol, Băng gạc..." />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="description"
                                label="Danh mục"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn danh mục",
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
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
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="quantity"
                                label="Số lượng"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập số lượng",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    placeholder="0"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="unit"
                                label="Đơn vị"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn đơn vị",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn đơn vị">
                                    <Select.Option value="viên">
                                        Viên
                                    </Select.Option>
                                    <Select.Option value="chai">
                                        Chai
                                    </Select.Option>
                                    <Select.Option value="cái">
                                        Cái
                                    </Select.Option>
                                    <Select.Option value="hộp">
                                        Hộp
                                    </Select.Option>
                                    <Select.Option value="gói">
                                        Gói
                                    </Select.Option>
                                    <Select.Option value="ml">ml</Select.Option>
                                    <Select.Option value="mg">mg</Select.Option>
                                    <Select.Option value="lọ">Lọ</Select.Option>
                                    <Select.Option value="túi">
                                        Túi
                                    </Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="minStock"
                                label="Tồn kho tối thiểu"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Vui lòng nhập tồn kho tối thiểu",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    placeholder="10"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="expiryDate"
                                label="Hạn sử dụng"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn hạn sử dụng",
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    placeholder="Chọn ngày"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dosage" label="Liều lượng">
                                <Input placeholder="VD: 500mg, 10ml, 100mg/ml" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="manufacturer" label="Nhà sản xuất">
                        <Input placeholder="VD: ABC Pharma, XYZ Company" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Low Stock Items Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <AlertOutlined className="text-orange-500 mr-2" />
                        <span>Vật tư tồn kho thấp</span>
                    </div>
                }
                open={lowStockModalVisible}
                onCancel={() => setLowStockModalVisible(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setLowStockModalVisible(false)}
                    >
                        Đóng
                    </Button>,
                ]}
                width={900}
                destroyOnClose
            >
                {lowStockItems.length > 0 ? (
                    <div className="space-y-4">
                        {/* Summary Statistics */}
                        <Row gutter={16} className="mb-4">
                            <Col span={8}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Tổng số vật tư"
                                        value={lowStockItems.length}
                                        valueStyle={{ color: "#ff4d4f" }}
                                        prefix={<AlertOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Cần bổ sung gấp"
                                        value={
                                            lowStockItems.filter(
                                                (item) => item.quantity === 0
                                            ).length
                                        }
                                        valueStyle={{ color: "#ff7875" }}
                                        prefix={<ExclamationCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Sắp hết hạn"
                                        value={
                                            lowStockItems.filter((item) => {
                                                if (!item.expiryDate)
                                                    return false;
                                                const daysUntilExpiry = dayjs(
                                                    item.expiryDate
                                                ).diff(dayjs(), "day");
                                                return (
                                                    daysUntilExpiry > 0 &&
                                                    daysUntilExpiry <= 30
                                                );
                                            }).length
                                        }
                                        valueStyle={{ color: "#fa8c16" }}
                                        prefix={<ExclamationCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Low Stock Items Table */}
                        <Table
                            dataSource={lowStockItems}
                            columns={[
                                {
                                    title: "Tên vật tư",
                                    dataIndex: "name",
                                    key: "name",
                                    render: (text, record) => (
                                        <div>
                                            <div className="font-medium">
                                                {text}
                                            </div>
                                            {record.manufacturer && (
                                                <div className="text-xs text-gray-500">
                                                    {record.manufacturer}
                                                </div>
                                            )}
                                            {record.dosage && (
                                                <div className="text-xs text-blue-500">
                                                    {record.dosage}
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    title: "Danh mục",
                                    dataIndex: "category",
                                    key: "category",
                                    render: (text) => (
                                        <Tag color="blue">{text}</Tag>
                                    ),
                                },
                                {
                                    title: "Số lượng hiện tại",
                                    dataIndex: "quantity",
                                    key: "quantity",
                                    render: (text, record) => (
                                        <span className="text-red-500 font-medium">
                                            {text} {record.unit}
                                        </span>
                                    ),
                                },
                                {
                                    title: "Tồn kho tối thiểu",
                                    dataIndex: "minStock",
                                    key: "minStock",
                                    render: (text, record) =>
                                        `${text} ${record.unit}`,
                                },
                                {
                                    title: "Thiếu hụt",
                                    key: "shortage",
                                    render: (_, record) => {
                                        const shortage =
                                            record.minStock - record.quantity;
                                        return (
                                            <span className="text-red-500 font-medium">
                                                {shortage} {record.unit}
                                            </span>
                                        );
                                    },
                                },
                                {
                                    title: "Hạn sử dụng",
                                    dataIndex: "expiryDate",
                                    key: "expiryDate",
                                    render: (text) => {
                                        if (!text) return "-";
                                        const expiryDate = dayjs(text);
                                        const today = dayjs();
                                        const daysUntilExpiry = expiryDate.diff(
                                            today,
                                            "day"
                                        );

                                        if (daysUntilExpiry < 0) {
                                            return (
                                                <Tooltip title="Đã hết hạn">
                                                    <span className="text-red-500 flex items-center">
                                                        <ExclamationCircleOutlined className="mr-1" />
                                                        {expiryDate.format(
                                                            "DD/MM/YYYY"
                                                        )}
                                                    </span>
                                                </Tooltip>
                                            );
                                        } else if (daysUntilExpiry <= 30) {
                                            return (
                                                <Tooltip
                                                    title={`Còn ${daysUntilExpiry} ngày`}
                                                >
                                                    <span className="text-orange-500">
                                                        {expiryDate.format(
                                                            "DD/MM/YYYY"
                                                        )}
                                                    </span>
                                                </Tooltip>
                                            );
                                        } else {
                                            return expiryDate.format(
                                                "DD/MM/YYYY"
                                            );
                                        }
                                    },
                                },
                                {
                                    title: "Thao tác",
                                    key: "actions",
                                    render: (_, record) => (
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={() => {
                                                setLowStockModalVisible(false);
                                                handleEdit(record);
                                            }}
                                        >
                                            Cập nhật
                                        </Button>
                                    ),
                                },
                            ]}
                            rowKey="id"
                            pagination={false}
                            rowClassName="bg-orange-50"
                        />
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <AlertOutlined className="text-4xl text-green-500 mb-4" />
                        <p className="text-lg text-gray-600">
                            Không có vật tư nào ở mức tồn kho thấp
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Tất cả vật tư đều đang ở mức tồn kho an toàn
                        </p>
                    </div>
                )}
            </Modal>

            {/* Expired Items Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <ExclamationCircleOutlined className="text-red-500 mr-2" />
                        <span>Vật tư đã hết hạn</span>
                    </div>
                }
                open={expiredModalVisible}
                onCancel={() => setExpiredModalVisible(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setExpiredModalVisible(false)}
                    >
                        Đóng
                    </Button>,
                ]}
                width={900}
                destroyOnClose
            >
                {expiredItems.length > 0 ? (
                    <div className="space-y-4">
                        {/* Summary Statistics */}
                        <Row gutter={16} className="mb-4">
                            <Col span={8}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Tổng số vật tư hết hạn"
                                        value={expiredItems.length}
                                        valueStyle={{ color: "#ff4d4f" }}
                                        prefix={<ExclamationCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Cần xử lý gấp"
                                        value={
                                            expiredItems.filter((item) => {
                                                const daysExpired =
                                                    dayjs().diff(
                                                        dayjs(item.expiryDate),
                                                        "day"
                                                    );
                                                return daysExpired > 7;
                                            }).length
                                        }
                                        valueStyle={{ color: "#ff7875" }}
                                        prefix={<ExclamationCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Hết hạn gần đây"
                                        value={
                                            expiredItems.filter((item) => {
                                                const daysExpired =
                                                    dayjs().diff(
                                                        dayjs(item.expiryDate),
                                                        "day"
                                                    );
                                                return daysExpired <= 7;
                                            }).length
                                        }
                                        valueStyle={{ color: "#fa8c16" }}
                                        prefix={<ExclamationCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Expired Items Table */}
                        <Table
                            dataSource={expiredItems}
                            columns={[
                                {
                                    title: "Tên vật tư",
                                    dataIndex: "name",
                                    key: "name",
                                    render: (text, record) => (
                                        <div>
                                            <div className="font-medium">
                                                {text}
                                            </div>
                                            {record.manufacturer && (
                                                <div className="text-xs text-gray-500">
                                                    {record.manufacturer}
                                                </div>
                                            )}
                                            {record.dosage && (
                                                <div className="text-xs text-blue-500">
                                                    {record.dosage}
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    title: "Danh mục",
                                    dataIndex: "category",
                                    key: "category",
                                    render: (text) => (
                                        <Tag color="blue">{text}</Tag>
                                    ),
                                },
                                {
                                    title: "Số lượng",
                                    dataIndex: "quantity",
                                    key: "quantity",
                                    render: (text, record) =>
                                        `${text} ${record.unit}`,
                                },
                                {
                                    title: "Ngày hết hạn",
                                    dataIndex: "expiryDate",
                                    key: "expiryDate",
                                    render: (text) => {
                                        const expiryDate = dayjs(text);
                                        const daysExpired = dayjs().diff(
                                            expiryDate,
                                            "day"
                                        );
                                        return (
                                            <Tooltip
                                                title={`Đã hết hạn ${daysExpired} ngày`}
                                            >
                                                <span className="text-red-500 font-medium flex items-center">
                                                    <ExclamationCircleOutlined className="mr-1" />
                                                    {expiryDate.format(
                                                        "DD/MM/YYYY"
                                                    )}
                                                </span>
                                            </Tooltip>
                                        );
                                    },
                                },
                                {
                                    title: "Số ngày hết hạn",
                                    key: "daysExpired",
                                    render: (_, record) => {
                                        const daysExpired = dayjs().diff(
                                            dayjs(record.expiryDate),
                                            "day"
                                        );
                                        return (
                                            <span className="text-red-500 font-medium">
                                                {daysExpired} ngày
                                            </span>
                                        );
                                    },
                                },
                                {
                                    title: "Thao tác",
                                    key: "actions",
                                    render: (_, record) => (
                                        <Space>
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={() => {
                                                    setExpiredModalVisible(
                                                        false
                                                    );
                                                    handleEdit(record);
                                                }}
                                            >
                                                Cập nhật
                                            </Button>
                                            <Popconfirm
                                                title="Xác nhận xóa"
                                                description={`Bạn có chắc chắn muốn xóa "${record.name}" đã hết hạn?`}
                                                onConfirm={() =>
                                                    handleDelete(record)
                                                }
                                                okText="Xóa"
                                                cancelText="Hủy"
                                                okType="danger"
                                            >
                                                <Button
                                                    danger
                                                    size="small"
                                                    icon={<DeleteOutlined />}
                                                >
                                                    Xóa
                                                </Button>
                                            </Popconfirm>
                                        </Space>
                                    ),
                                },
                            ]}
                            rowKey="id"
                            pagination={false}
                            rowClassName="bg-red-50"
                        />
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <ExclamationCircleOutlined className="text-4xl text-green-500 mb-4" />
                        <p className="text-lg text-gray-600">
                            Không có vật tư nào đã hết hạn
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Tất cả vật tư đều còn hạn sử dụng
                        </p>
                    </div>
                )}
            </Modal>

            {/* Expiring Soon Items Modal */}
            <Modal
                title={
                    <div className="flex items-center">
                        <ExclamationCircleOutlined className="text-orange-500 mr-2" />
                        <span>Vật tư sắp hết hạn</span>
                    </div>
                }
                open={expiringSoonModalVisible}
                onCancel={() => setExpiringSoonModalVisible(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setExpiringSoonModalVisible(false)}
                    >
                        Đóng
                    </Button>,
                ]}
                width={900}
                destroyOnClose
            >
                {expiringSoonItems.length > 0 ? (
                    <div className="space-y-4">
                        {/* Summary Statistics */}
                        <Row gutter={16} className="mb-4">
                            <Col span={8}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Tổng số vật tư sắp hết hạn"
                                        value={expiringSoonItems.length}
                                        valueStyle={{ color: "#fa8c16" }}
                                        prefix={<ExclamationCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Hết hạn trong 7 ngày"
                                        value={
                                            expiringSoonItems.filter((item) => {
                                                const daysUntilExpiry = dayjs(
                                                    item.expiryDate
                                                ).diff(dayjs(), "day");
                                                return daysUntilExpiry <= 7;
                                            }).length
                                        }
                                        valueStyle={{ color: "#ff4d4f" }}
                                        prefix={<ExclamationCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card className="text-center">
                                    <Statistic
                                        title="Hết hạn trong 30 ngày"
                                        value={
                                            expiringSoonItems.filter((item) => {
                                                const daysUntilExpiry = dayjs(
                                                    item.expiryDate
                                                ).diff(dayjs(), "day");
                                                return (
                                                    daysUntilExpiry > 7 &&
                                                    daysUntilExpiry <= 30
                                                );
                                            }).length
                                        }
                                        valueStyle={{ color: "#fa8c16" }}
                                        prefix={<ExclamationCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Expiring Soon Items Table */}
                        <Table
                            dataSource={expiringSoonItems}
                            columns={[
                                {
                                    title: "Tên vật tư",
                                    dataIndex: "name",
                                    key: "name",
                                    render: (text, record) => (
                                        <div>
                                            <div className="font-medium">
                                                {text}
                                            </div>
                                            {record.manufacturer && (
                                                <div className="text-xs text-gray-500">
                                                    {record.manufacturer}
                                                </div>
                                            )}
                                            {record.dosage && (
                                                <div className="text-xs text-blue-500">
                                                    {record.dosage}
                                                </div>
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    title: "Danh mục",
                                    dataIndex: "category",
                                    key: "category",
                                    render: (text) => (
                                        <Tag color="blue">{text}</Tag>
                                    ),
                                },
                                {
                                    title: "Số lượng",
                                    dataIndex: "quantity",
                                    key: "quantity",
                                    render: (text, record) =>
                                        `${text} ${record.unit}`,
                                },
                                {
                                    title: "Ngày hết hạn",
                                    dataIndex: "expiryDate",
                                    key: "expiryDate",
                                    render: (text) => {
                                        const expiryDate = dayjs(text);
                                        const daysUntilExpiry = expiryDate.diff(
                                            dayjs(),
                                            "day"
                                        );
                                        return (
                                            <Tooltip
                                                title={`Còn ${daysUntilExpiry} ngày`}
                                            >
                                                <span className="text-orange-500 font-medium">
                                                    {expiryDate.format(
                                                        "DD/MM/YYYY"
                                                    )}
                                                </span>
                                            </Tooltip>
                                        );
                                    },
                                },
                                {
                                    title: "Còn lại (ngày)",
                                    key: "daysUntilExpiry",
                                    render: (_, record) => {
                                        const daysUntilExpiry = dayjs(
                                            record.expiryDate
                                        ).diff(dayjs(), "day");
                                        const color =
                                            daysUntilExpiry <= 7
                                                ? "#ff4d4f"
                                                : "#fa8c16";
                                        return (
                                            <span
                                                style={{
                                                    color,
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                {daysUntilExpiry} ngày
                                            </span>
                                        );
                                    },
                                },
                                {
                                    title: "Trạng thái",
                                    key: "urgency",
                                    render: (_, record) => {
                                        const daysUntilExpiry = dayjs(
                                            record.expiryDate
                                        ).diff(dayjs(), "day");
                                        if (daysUntilExpiry <= 7) {
                                            return (
                                                <Tag color="red">Khẩn cấp</Tag>
                                            );
                                        } else if (daysUntilExpiry <= 15) {
                                            return (
                                                <Tag color="orange">
                                                    Cần chú ý
                                                </Tag>
                                            );
                                        } else {
                                            return (
                                                <Tag color="blue">
                                                    Bình thường
                                                </Tag>
                                            );
                                        }
                                    },
                                },
                                {
                                    title: "Thao tác",
                                    key: "actions",
                                    render: (_, record) => (
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={() => {
                                                setExpiringSoonModalVisible(
                                                    false
                                                );
                                                handleEdit(record);
                                            }}
                                        >
                                            Cập nhật
                                        </Button>
                                    ),
                                },
                            ]}
                            rowKey="id"
                            pagination={false}
                            rowClassName="bg-orange-50"
                        />
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <ExclamationCircleOutlined className="text-4xl text-green-500 mb-4" />
                        <p className="text-lg text-gray-600">
                            Không có vật tư nào sắp hết hạn
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Tất cả vật tư đều còn hạn sử dụng dài
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MedicalInventory;
