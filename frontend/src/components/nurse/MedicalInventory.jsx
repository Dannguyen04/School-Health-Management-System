import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Table,
    message,
    Row,
    Col,
    Tag,
} from "antd";
import React, { useState, useEffect } from "react";
import { nurseAPI } from "../../utils/api";
import dayjs from "dayjs";

const { TextArea } = Input;

const MedicalInventory = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [inventory, setInventory] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showLowStock, setShowLowStock] = useState(false);

    // Fetch inventory data
    const fetchInventory = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchText) params.search = searchText;
            if (selectedCategory) params.category = selectedCategory;
            if (showLowStock) params.lowStock = "true";

            const response = await nurseAPI.getMedicalInventory(params);
            setInventory(response.data.data);
        } catch (error) {
            message.error("Lỗi khi tải danh sách vật tư y tế");
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await nurseAPI.getInventoryCategories();
            setCategories(response.data.data);
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
                    return <span className="text-red-500">Đã hết hạn</span>;
                } else if (daysUntilExpiry <= 30) {
                    return (
                        <span className="text-orange-500">
                            {expiryDate.format("DD/MM/YYYY")}
                        </span>
                    );
                } else {
                    return expiryDate.format("DD/MM/YYYY");
                }
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        type="primary"
                        size="small"
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                        size="small"
                    />
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

    const handleDelete = (record) => {
        Modal.confirm({
            title: "Bạn có chắc chắn muốn xóa vật tư này?",
            content: `Việc này sẽ xóa vĩnh viễn ${record.name} khỏi kho.`,
            okText: "Có",
            okType: "danger",
            cancelText: "Không",
            onOk: async () => {
                try {
                    await nurseAPI.deleteMedicalInventory(record.id);
                    message.success("Xóa vật tư thành công");
                    fetchInventory();
                } catch (error) {
                    message.error(
                        error.response?.data?.error || "Lỗi khi xóa vật tư"
                    );
                }
            },
        });
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
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
            message.error(error.response?.data?.error || "Lỗi khi lưu vật tư");
        }
    };

    const lowStockItems = inventory.filter(
        (item) => item.quantity <= item.minStock
    );

    const expiredItems = inventory.filter(
        (item) => item.expiryDate && dayjs(item.expiryDate).isBefore(dayjs())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý kho y tế</h1>
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
            </div>

            {/* Search and Filter Section */}
            <Card>
                <Row gutter={16} align="middle">
                    <Col span={8}>
                        <Input
                            placeholder="Tìm kiếm theo tên vật tư..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col span={6}>
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
                    <Col span={4}>
                        <Button
                            type={showLowStock ? "primary" : "default"}
                            icon={<FilterOutlined />}
                            onClick={() => setShowLowStock(!showLowStock)}
                        >
                            Tồn kho thấp
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Alerts */}
            {lowStockItems.length > 0 && (
                <Alert
                    message="Cảnh báo tồn kho thấp"
                    description={`${lowStockItems.length} vật tư đang ở mức tồn kho thấp`}
                    type="warning"
                    showIcon
                />
            )}

            {expiredItems.length > 0 && (
                <Alert
                    message="Cảnh báo vật tư hết hạn"
                    description={`${expiredItems.length} vật tư đã hết hạn sử dụng`}
                    type="error"
                    showIcon
                />
            )}

            {/* Inventory Table */}
            <Card>
                <Table
                    dataSource={inventory}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} vật tư`,
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
                width={600}
                okText={editingItem ? "Cập nhật" : "Thêm"}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
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
                        <Input />
                    </Form.Item>

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
                            placeholder="Chọn hoặc nhập danh mục mới"
                            allowClear
                        >
                            {categories.map((category) => (
                                <Select.Option key={category} value={category}>
                                    {category}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
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
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
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
                                <Select>
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
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
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
                                />
                            </Form.Item>
                        </Col>
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
                                <DatePicker style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="manufacturer" label="Nhà sản xuất">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dosage" label="Liều lượng">
                                <Input placeholder="VD: 500mg, 10ml" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default MedicalInventory;
