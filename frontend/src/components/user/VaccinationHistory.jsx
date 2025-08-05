import {
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    HistoryOutlined,
    MedicineBoxOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Empty,
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
    Table,
    Tag,
    Typography,
    Alert,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState, useMemo, useCallback } from "react";
import { parentAPI } from "../../utils/api";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Constants
const PAGINATION_CONFIG = {
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50"],
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
};

const ERROR_MESSAGES = {
    FETCH_CHILDREN: "Không thể tải danh sách con em",
    FETCH_VACCINES: "Không thể tải danh sách vaccine",
    FETCH_VACCINATION_HISTORY: "Không thể tải lịch sử tiêm chủng",
    ADD_VACCINATION: "Không thể thêm lịch sử tiêm chủng",
    UPDATE_VACCINATION: "Không thể cập nhật lịch sử tiêm chủng",
    DELETE_VACCINATION: "Không thể xóa lịch sử tiêm chủng",
    NO_CHILDREN: "Không tìm thấy học sinh nào",
};

// Helper functions
const getDoseTypeLabel = (doseType) => {
    const types = {
        PRIMARY: "Mũi cơ bản",
        BOOSTER: "Mũi tăng cường",
        CATCHUP: "Mũi bù",
        ADDITIONAL: "Mũi bổ sung",
    };
    return types[doseType] || doseType;
};

const getDoseTypeColor = (doseType) => {
    const colors = {
        PRIMARY: "blue",
        BOOSTER: "green",
        CATCHUP: "orange",
        ADDITIONAL: "purple",
    };
    return colors[doseType] || "default";
};

const VaccinationHistory = () => {
    // State management
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [vaccines, setVaccines] = useState([]);
    const [vaccinationRecords, setVaccinationRecords] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    // Vaccine selection modal
    const [isVaccineModalVisible, setIsVaccineModalVisible] = useState(false);
    const [selectedVaccine, setSelectedVaccine] = useState(null);

    // Loading states
    const [childrenLoading, setChildrenLoading] = useState(true);
    const [vaccinesLoading, setVaccinesLoading] = useState(false);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Error states
    const [error, setError] = useState(null);

    // Fetch children
    const fetchChildren = useCallback(async () => {
        try {
            setChildrenLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            const response = await axios.get("/api/parents/my-children", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                const childrenData = response.data.data || [];
                if (childrenData.length === 0) {
                    setError(ERROR_MESSAGES.NO_CHILDREN);
                    setChildren([]);
                    return;
                }

                setChildren(childrenData);
                setSelectedChild(childrenData[0].studentId);
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch children"
                );
            }
        } catch (err) {
            console.error("Error fetching children:", err);
            setError(ERROR_MESSAGES.FETCH_CHILDREN);
            message.error(ERROR_MESSAGES.FETCH_CHILDREN);
        } finally {
            setChildrenLoading(false);
        }
    }, []);

    // Fetch vaccines
    const fetchVaccines = useCallback(async () => {
        try {
            setVaccinesLoading(true);
            setError(null);

            const response = await parentAPI.getVaccines();

            if (response.data.success) {
                setVaccines(response.data.data || []);
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch vaccines"
                );
            }
        } catch (err) {
            console.error("Error fetching vaccines:", err);
            setError(ERROR_MESSAGES.FETCH_VACCINES);
            message.error(ERROR_MESSAGES.FETCH_VACCINES);
        } finally {
            setVaccinesLoading(false);
        }
    }, []);

    // Fetch vaccination records
    const fetchVaccinationRecords = useCallback(async (childId) => {
        if (!childId) {
            setVaccinationRecords([]);
            return;
        }

        try {
            setRecordsLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            const response = await axios.get(
                `/api/parents/vaccination-history/${childId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success) {
                setVaccinationRecords(response.data.data || []);
            } else {
                throw new Error(
                    response.data.message ||
                        "Failed to fetch vaccination records"
                );
            }
        } catch (err) {
            console.error("Error fetching vaccination records:", err);
            setError(ERROR_MESSAGES.FETCH_VACCINATION_HISTORY);
            message.error(ERROR_MESSAGES.FETCH_VACCINATION_HISTORY);
        } finally {
            setRecordsLoading(false);
        }
    }, []);

    // Effects
    useEffect(() => {
        fetchChildren();
        fetchVaccines();
    }, [fetchChildren, fetchVaccines]);

    useEffect(() => {
        fetchVaccinationRecords(selectedChild);
    }, [selectedChild, fetchVaccinationRecords]);

    // Handle submit
    const handleSubmit = useCallback(
        async (values) => {
            try {
                setSubmitLoading(true);
                const token = localStorage.getItem("token");

                const vaccinationHistories = [
                    {
                        vaccineId: values.vaccineId,
                        administeredDate:
                            values.administeredDate.format("YYYY-MM-DD"),
                        doseOrder: values.doseOrder,
                        doseType: values.doseType,
                        doseAmount: values.doseAmount || 0.5,
                        batchNumber: values.batchNumber || null,
                        location: values.location || "Cơ sở y tế bên ngoài",
                        notes: values.notes || null,
                    },
                ];

                const response = await axios.post(
                    `/api/parents/vaccination-history/${selectedChild}`,
                    { vaccinationHistories },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (response.data.success) {
                    message.success(response.data.message);
                    setIsModalVisible(false);
                    form.resetFields();
                    setEditingRecord(null);
                    fetchVaccinationRecords(selectedChild);
                } else {
                    throw new Error(
                        response.data.error || ERROR_MESSAGES.ADD_VACCINATION
                    );
                }
            } catch (error) {
                console.error("Error submitting vaccination:", error);
                message.error(
                    error.response?.data?.error ||
                        ERROR_MESSAGES.ADD_VACCINATION
                );
            } finally {
                setSubmitLoading(false);
            }
        },
        [selectedChild, form, fetchVaccinationRecords]
    );

    // Handle edit
    const handleEdit = useCallback(
        (record) => {
            setEditingRecord(record);
            form.setFieldsValue({
                vaccineId: record.vaccineId,
                administeredDate: dayjs(record.administeredDate),
                doseOrder: record.doseOrder,
                doseType: record.doseType,
                doseAmount: record.doseAmount,
                batchNumber: record.batchNumber,
                location: record.externalLocation,
                notes: record.notes,
            });
            setIsModalVisible(true);
        },
        [form]
    );

    // Handle delete
    const handleDelete = useCallback(
        async (recordId) => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.delete(
                    `/api/parents/vaccination-history/${recordId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (response.data.success) {
                    message.success("Xóa lịch sử tiêm chủng thành công");
                    fetchVaccinationRecords(selectedChild);
                } else {
                    throw new Error(
                        response.data.error || ERROR_MESSAGES.DELETE_VACCINATION
                    );
                }
            } catch (error) {
                console.error("Error deleting vaccination:", error);
                message.error(
                    error.response?.data?.error ||
                        ERROR_MESSAGES.DELETE_VACCINATION
                );
            }
        },
        [selectedChild, fetchVaccinationRecords]
    );

    // Handle modal cancel
    const handleModalCancel = useCallback(() => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingRecord(null);
    }, [form]);

    // Handle vaccine selection
    const handleVaccineSelect = useCallback((vaccine) => {
        setSelectedVaccine(vaccine);
        setIsVaccineModalVisible(true);
    }, []);

    // Handle vaccine confirmation
    const handleVaccineConfirm = useCallback(() => {
        if (selectedVaccine) {
            form.setFieldsValue({
                vaccineId: selectedVaccine.id,
                doseOrder: 1, // Reset to first dose when selecting new vaccine
                doseType: "PRIMARY", // Reset to primary dose
            });
            setIsVaccineModalVisible(false);
            setSelectedVaccine(null);
        }
    }, [selectedVaccine, form]);

    // Handle vaccine modal cancel
    const handleVaccineModalCancel = useCallback(() => {
        setIsVaccineModalVisible(false);
        setSelectedVaccine(null);
    }, []);

    // Handle child change
    const handleChildChange = useCallback((value) => {
        setSelectedChild(value);
        setError(null);
    }, []);

    // Handle retry
    const handleRetry = useCallback(() => {
        if (selectedChild) {
            fetchVaccinationRecords(selectedChild);
        } else {
            fetchChildren();
        }
    }, [selectedChild, fetchVaccinationRecords, fetchChildren]);

    // Memoized functions
    const getSelectedChildInfo = useMemo(() => {
        return children.find((child) => child.studentId === selectedChild);
    }, [children, selectedChild]);

    // Memoized table columns
    const columns = useMemo(
        () => [
            {
                title: "Vaccine",
                dataIndex: "vaccineName",
                key: "vaccineName",
                render: (text, record) => (
                    <div>
                        <Text strong className="text-blue-600">
                            {text}
                        </Text>
                        {record.vaccine?.diseaseName && (
                            <div className="text-xs text-gray-500">
                                Phòng chống: {record.vaccine.diseaseName}
                            </div>
                        )}
                    </div>
                ),
            },
            {
                title: "Ngày tiêm",
                dataIndex: "administeredDate",
                key: "administeredDate",
                render: (date) => dayjs(date).format("DD/MM/YYYY"),
                sorter: (a, b) =>
                    dayjs(a.administeredDate).unix() -
                    dayjs(b.administeredDate).unix(),
            },
            {
                title: "Mũi tiêm",
                key: "dose",
                render: (_, record) => (
                    <div>
                        <Tag color="blue">Mũi {record.doseOrder}</Tag>
                        <Tag
                            color={getDoseTypeColor(record.doseType)}
                            className="ml-1"
                        >
                            {getDoseTypeLabel(record.doseType)}
                        </Tag>
                    </div>
                ),
            },
            {
                title: "Liều lượng",
                dataIndex: "doseAmount",
                key: "doseAmount",
                render: (amount) => `${amount || 0.5} ml`,
            },
            {
                title: "Nơi tiêm",
                dataIndex: "externalLocation",
                key: "externalLocation",
                render: (location) => (
                    <span className="text-green-600">
                        {location || "Cơ sở y tế bên ngoài"}
                    </span>
                ),
            },
            {
                title: "Loại",
                key: "type",
                render: (_, record) => (
                    <Tag color={record.isExternalRecord ? "orange" : "blue"}>
                        {record.isExternalRecord
                            ? "Ngoài trường"
                            : "Tại trường"}
                    </Tag>
                ),
            },
            {
                title: "Thao tác",
                key: "actions",
                render: (_, record) =>
                    record.isExternalRecord ? (
                        <Space>
                            <Button
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => handleEdit(record)}
                            />
                            <Popconfirm
                                title="Xóa lịch sử tiêm chủng"
                                description="Bạn có chắc chắn muốn xóa lịch sử này?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okType="danger"
                            >
                                <Button
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    danger
                                />
                            </Popconfirm>
                        </Space>
                    ) : (
                        <Text type="secondary" className="text-xs">
                            Không thể chỉnh sửa
                        </Text>
                    ),
            },
        ],
        [handleEdit, handleDelete]
    );

    // Loading state for initial load
    if (childrenLoading) {
        return (
            <div className="min-h-screen bg-[#f6fcfa] flex items-center justify-center">
                <Card className="text-center p-8">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600">
                        Đang tải danh sách học sinh...
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6fcfa]">
            <div className="w-full max-w-6xl mx-auto px-4 pt-24">
                <style jsx>{`
                    .vaccination-modal .ant-modal-content {
                        border-radius: 12px;
                    }
                    .vaccination-modal .ant-form-item {
                        margin-bottom: 16px;
                    }
                    .vaccination-modal .ant-input,
                    .vaccination-modal .ant-select,
                    .vaccination-modal .ant-picker,
                    .vaccination-modal .ant-input-number {
                        border-radius: 8px;
                    }
                    @media (max-width: 768px) {
                        .vaccination-modal .ant-modal {
                            margin: 16px;
                            width: calc(100% - 32px) !important;
                        }
                        .vaccination-modal .ant-modal-content {
                            padding: 16px;
                        }
                        .vaccination-modal .ant-form-item-label {
                            padding-bottom: 4px;
                        }
                    }
                `}</style>
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <HistoryOutlined className="text-[#36ae9a]" />
                        <span>Quản lý sức khỏe học sinh</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Lịch sử tiêm chủng
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Quản lý và khai báo lịch sử tiêm chủng của học sinh, bao
                        gồm cả tiêm tại trường và ngoài trường.
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert
                        message="Có lỗi xảy ra"
                        description={error}
                        type="error"
                        icon={<ExclamationCircleOutlined />}
                        action={
                            <Button size="small" onClick={handleRetry}>
                                Thử lại
                            </Button>
                        }
                        className="mb-4"
                        closable
                        onClose={() => setError(null)}
                    />
                )}

                {/* Child Selection */}
                <Card className="mb-6">
                    <Row gutter={16} align="middle">
                        <Col span={12}>
                            <div className="flex items-center gap-3">
                                <SafetyCertificateOutlined className="text-blue-500 text-lg" />
                                <div>
                                    <Text strong>Chọn học sinh:</Text>
                                    <Select
                                        value={selectedChild}
                                        onChange={handleChildChange}
                                        className="ml-3 min-w-64"
                                        placeholder="Chọn học sinh"
                                        loading={childrenLoading}
                                    >
                                        {children.map((child) => (
                                            <Option
                                                key={child.studentId}
                                                value={child.studentId}
                                            >
                                                {child.fullName} - {child.class}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </Col>
                        <Col span={12} className="text-right">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsModalVisible(true)}
                                disabled={!selectedChild}
                            >
                                Thêm lịch sử tiêm chủng
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Student Info */}
                {selectedChild && getSelectedChildInfo && (
                    <Card className="mb-6">
                        <Descriptions column={3} size="small">
                            <Descriptions.Item label="Học sinh">
                                <Text strong>
                                    {getSelectedChildInfo.fullName}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Lớp">
                                {getSelectedChildInfo.class}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khối">
                                {getSelectedChildInfo.grade}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}

                {/* Vaccination Records Table */}
                <Card>
                    <div className="flex items-center gap-2 mb-4">
                        <MedicineBoxOutlined className="text-blue-500" />
                        <Title level={4} className="mb-0">
                            Lịch sử tiêm chủng
                        </Title>
                    </div>

                    {recordsLoading ? (
                        <div className="text-center py-12">
                            <Spin size="large" />
                            <p className="mt-4 text-gray-600">
                                Đang tải lịch sử tiêm chủng...
                            </p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={vaccinationRecords}
                            rowKey="id"
                            pagination={PAGINATION_CONFIG}
                            locale={{
                                emptyText: selectedChild ? (
                                    <Empty
                                        description="Chưa có lịch sử tiêm chủng nào"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                ) : (
                                    <Empty
                                        description="Vui lòng chọn học sinh để xem lịch sử"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                ),
                            }}
                        />
                    )}
                </Card>

                {/* Statistics */}
                {vaccinationRecords.length > 0 && (
                    <Card className="mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-2xl font-bold text-[#36ae9a]">
                                    {vaccinationRecords.length}
                                </div>
                                <div className="text-gray-600">
                                    Tổng số lần tiêm
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {
                                        vaccinationRecords.filter(
                                            (v) => v.isExternalRecord
                                        ).length
                                    }
                                </div>
                                <div className="text-gray-600">
                                    Tiêm ngoài trường
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {
                                        new Set(
                                            vaccinationRecords
                                                .map((v) => v.vaccine?.name)
                                                .filter(Boolean)
                                        ).size
                                    }
                                </div>
                                <div className="text-gray-600">
                                    Loại vaccine
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Add/Edit Modal */}
                <Modal
                    title={
                        editingRecord
                            ? "Chỉnh sửa lịch sử tiêm chủng"
                            : "Thêm lịch sử tiêm chủng"
                    }
                    open={isModalVisible}
                    onCancel={handleModalCancel}
                    footer={null}
                    width="90%"
                    style={{ maxWidth: 700 }}
                    className="vaccination-modal"
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            doseAmount: 0.5,
                            doseType: "PRIMARY",
                            location: "Bệnh viện",
                        }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                    name="vaccineId"
                                    label="Vaccine"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn vaccine",
                                        },
                                    ]}
                                >
                                    <div className="space-y-2">
                                        {/* Selected vaccine display */}
                                        {form.getFieldValue("vaccineId") && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-green-900">
                                                            {
                                                                vaccines.find(
                                                                    (v) =>
                                                                        v.id ===
                                                                        form.getFieldValue(
                                                                            "vaccineId"
                                                                        )
                                                                )?.name
                                                            }
                                                        </div>
                                                        {vaccines.find(
                                                            (v) =>
                                                                v.id ===
                                                                form.getFieldValue(
                                                                    "vaccineId"
                                                                )
                                                        )?.diseaseName && (
                                                            <div className="text-sm text-green-700 mt-1">
                                                                Phòng chống:{" "}
                                                                {
                                                                    vaccines.find(
                                                                        (v) =>
                                                                            v.id ===
                                                                            form.getFieldValue(
                                                                                "vaccineId"
                                                                            )
                                                                    )
                                                                        ?.diseaseName
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="small"
                                                        onClick={() =>
                                                            form.setFieldsValue(
                                                                {
                                                                    vaccineId:
                                                                        undefined,
                                                                }
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        Thay đổi
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Vaccine selection grid */}
                                        {!form.getFieldValue("vaccineId") && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                                {vaccines.map((vaccine) => (
                                                    <div
                                                        key={vaccine.id}
                                                        className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                                        onClick={() =>
                                                            handleVaccineSelect(
                                                                vaccine
                                                            )
                                                        }
                                                    >
                                                        <div className="font-medium text-gray-900 truncate">
                                                            {vaccine.name}
                                                        </div>
                                                        {vaccine.diseaseName && (
                                                            <div className="text-sm text-gray-600 mt-1">
                                                                Phòng chống:{" "}
                                                                {
                                                                    vaccine.diseaseName
                                                                }
                                                            </div>
                                                        )}
                                                        {vaccine.manufacturer && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                NSX:{" "}
                                                                {
                                                                    vaccine.manufacturer
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {vaccinesLoading && (
                                            <div className="text-center py-4">
                                                <Spin size="small" />
                                                <p className="text-gray-500 mt-2">
                                                    Đang tải danh sách
                                                    vaccine...
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                    name="administeredDate"
                                    label="Ngày tiêm"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn ngày tiêm",
                                        },
                                    ]}
                                >
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        format="DD/MM/YYYY"
                                        disabledDate={(current) =>
                                            current &&
                                            current > dayjs().endOf("day")
                                        }
                                        placeholder="Chọn ngày tiêm"
                                        className="w-full"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    name="doseOrder"
                                    label="Mũi tiêm thứ"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập mũi tiêm",
                                        },
                                        {
                                            validator: (_, value) => {
                                                const selectedVaccineId =
                                                    form.getFieldValue(
                                                        "vaccineId"
                                                    );
                                                const selectedVaccine =
                                                    vaccines.find(
                                                        (v) =>
                                                            v.id ===
                                                            selectedVaccineId
                                                    );

                                                if (!selectedVaccine) {
                                                    return Promise.resolve();
                                                }

                                                const maxDoses =
                                                    selectedVaccine.maxDoseCount ||
                                                    1;

                                                if (value < 1) {
                                                    return Promise.reject(
                                                        new Error(
                                                            "Mũi tiêm phải từ 1 trở lên"
                                                        )
                                                    );
                                                }

                                                if (value > maxDoses) {
                                                    return Promise.reject(
                                                        new Error(
                                                            `Vaccine này chỉ có tối đa ${maxDoses} mũi tiêm`
                                                        )
                                                    );
                                                }

                                                // Validate dose type based on dose order
                                                const doseType =
                                                    form.getFieldValue(
                                                        "doseType"
                                                    );
                                                if (
                                                    doseType === "BOOSTER" &&
                                                    value === 1
                                                ) {
                                                    return Promise.reject(
                                                        new Error(
                                                            "Mũi nhắc lại không thể là mũi đầu tiên"
                                                        )
                                                    );
                                                }

                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                    extra={
                                        form.getFieldValue("vaccineId") ? (
                                            <div className="text-xs text-blue-600 mt-1">
                                                Vaccine này có tối đa{" "}
                                                {vaccines.find(
                                                    (v) =>
                                                        v.id ===
                                                        form.getFieldValue(
                                                            "vaccineId"
                                                        )
                                                )?.maxDoseCount || 1}{" "}
                                                mũi tiêm
                                            </div>
                                        ) : null
                                    }
                                >
                                    <InputNumber
                                        min={1}
                                        max={
                                            form.getFieldValue("vaccineId")
                                                ? vaccines.find(
                                                      (v) =>
                                                          v.id ===
                                                          form.getFieldValue(
                                                              "vaccineId"
                                                          )
                                                  )?.maxDoseCount || 1
                                                : 10
                                        }
                                        style={{ width: "100%" }}
                                        placeholder="Nhập mũi tiêm"
                                        className="w-full"
                                        disabled={
                                            !form.getFieldValue("vaccineId")
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    name="doseType"
                                    label="Loại mũi tiêm"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng chọn loại mũi tiêm",
                                        },
                                        {
                                            validator: (_, value) => {
                                                const doseOrder =
                                                    form.getFieldValue(
                                                        "doseOrder"
                                                    );

                                                if (
                                                    value === "BOOSTER" &&
                                                    doseOrder === 1
                                                ) {
                                                    return Promise.reject(
                                                        new Error(
                                                            "Mũi nhắc lại không thể là mũi đầu tiên"
                                                        )
                                                    );
                                                }

                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                    extra={
                                        <div className="text-xs text-gray-600 mt-1">
                                            <div>
                                                • <strong>Mũi cơ bản:</strong>{" "}
                                                Mũi tiêm đầu tiên hoặc theo lịch
                                                tiêm chủng
                                            </div>
                                            <div>
                                                • <strong>Mũi nhắc lại:</strong>{" "}
                                                Mũi tiêm bổ sung để tăng cường
                                                miễn dịch
                                            </div>
                                        </div>
                                    }
                                >
                                    <Select
                                        placeholder="Chọn loại mũi tiêm"
                                        className="w-full"
                                        disabled={
                                            !form.getFieldValue("vaccineId")
                                        }
                                    >
                                        <Option value="PRIMARY">
                                            Mũi cơ bản
                                        </Option>
                                        <Option value="BOOSTER">
                                            Mũi nhắc lại
                                        </Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={8}>
                                <Form.Item
                                    name="doseAmount"
                                    label="Liều lượng (ml)"
                                >
                                    <InputNumber
                                        min={0.1}
                                        max={5}
                                        step={0.1}
                                        style={{ width: "100%" }}
                                        placeholder="Nhập liều lượng"
                                        className="w-full"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                    name="location"
                                    label="Nơi tiêm"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập nơi tiêm",
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="Ví dụ: Bệnh viện Nhi Trung ương"
                                        className="w-full"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item name="batchNumber" label="Số lô">
                                    <Input
                                        placeholder="Nhập số lô vaccine (nếu có)"
                                        className="w-full"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="notes" label="Ghi chú">
                            <TextArea
                                rows={3}
                                placeholder="Ghi chú thêm về việc tiêm chủng (tùy chọn)"
                                className="w-full"
                            />
                        </Form.Item>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                            <div className="flex items-start gap-2">
                                <ExclamationCircleOutlined className="text-blue-600 mt-1" />
                                <div>
                                    <Text strong className="text-blue-800">
                                        Lưu ý quan trọng:
                                    </Text>
                                    <div className="text-blue-700 text-sm mt-1">
                                        • Chỉ khai báo những mũi tiêm đã thực sự
                                        được tiêm
                                        <br />
                                        • Thông tin khai báo sẽ được lưu vào hồ
                                        sơ sức khỏe của học sinh
                                        <br />• Phụ huynh chịu trách nhiệm về
                                        tính chính xác của thông tin
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={handleModalCancel}
                                disabled={submitLoading}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitLoading}
                            >
                                {editingRecord ? "Cập nhật" : "Thêm lịch sử"}
                            </Button>
                        </div>
                    </Form>
                </Modal>

                {/* Vaccine Detail Modal */}
                <Modal
                    title="Chi tiết vaccine"
                    open={isVaccineModalVisible}
                    onCancel={handleVaccineModalCancel}
                    footer={[
                        <Button key="cancel" onClick={handleVaccineModalCancel}>
                            Hủy
                        </Button>,
                        <Button
                            key="confirm"
                            type="primary"
                            onClick={handleVaccineConfirm}
                            disabled={!selectedVaccine}
                        >
                            Chọn vaccine này
                        </Button>,
                    ]}
                    width="90%"
                    style={{ maxWidth: 600 }}
                >
                    {selectedVaccine && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                    {selectedVaccine.name}
                                </h3>
                                <div className="space-y-2 text-sm">
                                    {selectedVaccine.diseaseName && (
                                        <div>
                                            <span className="font-medium text-gray-700">
                                                Phòng chống:
                                            </span>
                                            <span className="ml-2 text-gray-600">
                                                {selectedVaccine.diseaseName}
                                            </span>
                                        </div>
                                    )}
                                    {selectedVaccine.manufacturer && (
                                        <div>
                                            <span className="font-medium text-gray-700">
                                                Nhà sản xuất:
                                            </span>
                                            <span className="ml-2 text-gray-600">
                                                {selectedVaccine.manufacturer}
                                            </span>
                                        </div>
                                    )}
                                    {selectedVaccine.origin && (
                                        <div>
                                            <span className="font-medium text-gray-700">
                                                Nguồn gốc:
                                            </span>
                                            <span className="ml-2 text-gray-600">
                                                {selectedVaccine.origin}
                                            </span>
                                        </div>
                                    )}
                                    {selectedVaccine.requirement && (
                                        <div>
                                            <span className="font-medium text-gray-700">
                                                Yêu cầu:
                                            </span>
                                            <span className="ml-2 text-gray-600">
                                                {selectedVaccine.requirement}
                                            </span>
                                        </div>
                                    )}
                                    {selectedVaccine.maxDoseCount && (
                                        <div>
                                            <span className="font-medium text-gray-700">
                                                Số mũi tối đa:
                                            </span>
                                            <span className="ml-2 text-gray-600">
                                                {selectedVaccine.maxDoseCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedVaccine.description && (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">
                                        Mô tả:
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                        {selectedVaccine.description}
                                    </p>
                                </div>
                            )}

                            {selectedVaccine.sideEffects && (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">
                                        Tác dụng phụ:
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                        {selectedVaccine.sideEffects}
                                    </p>
                                </div>
                            )}

                            {selectedVaccine.contraindications && (
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">
                                        Chống chỉ định:
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                        {selectedVaccine.contraindications}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default VaccinationHistory;
