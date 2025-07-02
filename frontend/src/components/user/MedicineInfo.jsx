import {
    EditOutlined,
    PlusOutlined,
    MedicineBoxOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    CalendarOutlined,
    UserOutlined,
    SearchOutlined,
    FilterOutlined,
    BellOutlined,
    FileTextOutlined,
    EyeOutlined,
    DeleteOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
    Statistic,
    Progress,
    Divider,
    Tooltip,
    Badge,
    Empty,
    Avatar,
    List,
    Tabs,
    notification,
    Upload,
    Image,
} from "antd";
import axios from "axios";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Search } = Input;
const { Dragger } = Upload;

const validationSchema = Yup.object().shape({
    studentId: Yup.string().required("Vui lòng chọn học sinh"),
    medicationName: Yup.string().required("Vui lòng nhập tên thuốc"),
    dosage: Yup.string().required("Vui lòng nhập liều lượng"),
    frequency: Yup.string().required("Vui lòng nhập tần suất sử dụng"),
    instructions: Yup.string().required("Vui lòng nhập hướng dẫn sử dụng"),
    startDate: Yup.date().required("Vui lòng chọn ngày bắt đầu"),
    endDate: Yup.date().required("Vui lòng chọn ngày kết thúc"),
    description: Yup.string(),
    unit: Yup.string(),
    stockQuantity: Yup.number()
        .typeError("Vui lòng nhập số lượng")
        .min(1, "Số lượng phải lớn hơn 0")
        .required("Vui lòng nhập số lượng"),
});

const statusColor = {
    PENDING_APPROVAL: "orange",
    APPROVED: "green",
    REJECTED: "red",
};

const statusLabel = {
    PENDING_APPROVAL: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
};

const MedicineInfo = () => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [children, setChildren] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentMedicines, setStudentMedicines] = useState([]);
    const [loadingMedicines, setLoadingMedicines] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [activeTab, setActiveTab] = useState("all");
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageError, setImageError] = useState("");

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchStudentMedicines(selectedStudent);
        }
    }, [selectedStudent]);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/parents/my-children", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                console.log(response.data.data);
                setChildren(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedStudent(response.data.data[0].studentId);
                }
            }
        } catch (error) {
            console.error("Error fetching children:", error);
            message.error("Không thể lấy danh sách học sinh");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentMedicines = async (studentId) => {
        setLoadingMedicines(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `/api/parents/students/${studentId}/medicines`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.data.success) {
                setStudentMedicines(response.data.data || []);
            } else {
                setStudentMedicines([]);
            }
        } catch {
            setStudentMedicines([]);
        } finally {
            setLoadingMedicines(false);
        }
    };

    const handleStudentChange = (studentId) => {
        setSelectedStudent(studentId);
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("medicationName", values.medicationName);
            formData.append("dosage", values.dosage);
            formData.append("frequency", values.frequency);
            formData.append("instructions", values.instructions);
            formData.append(
                "startDate",
                values.startDate ? values.startDate.toISOString() : ""
            );
            formData.append(
                "endDate",
                values.endDate ? values.endDate.toISOString() : ""
            );
            formData.append("description", values.description || "");
            formData.append("unit", values.unit || "");
            formData.append("stockQuantity", values.stockQuantity);
            if (selectedImageFile) {
                formData.append("medicineImage", selectedImageFile);
            }
            const response = await axios.post(
                `/api/parents/request-medication/${values.studentId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                message.success("Gửi thông tin thuốc thành công");
                resetForm();
                setIsEditModalVisible(false);
                setShowSuccess(true);
                fetchStudentMedicines(selectedStudent);
                setSelectedImageFile(null);
                setImagePreview(null);
            } else {
                message.error(
                    response.data.error || "Có lỗi xảy ra khi gửi thông tin"
                );
            }
        } catch (error) {
            console.error("Error submitting medication:", error);
            message.error(
                error.response?.data?.error || "Có lỗi xảy ra khi gửi thông tin"
            );
        } finally {
            setSubmitting(false);
            setLoading(false);
        }
    };

    // Helper functions for enhanced features
    const frequencyLabel = {
        once: "1 lần/ngày",
        twice: "2 lần/ngày",
        three: "3 lần/ngày",
        four: "4 lần/ngày",
    };

    // Calculate statistics
    const getStatistics = () => {
        const total = studentMedicines.length;
        const approved = studentMedicines.filter(
            (m) => m.status === "APPROVED"
        ).length;
        const pending = studentMedicines.filter(
            (m) => m.status === "PENDING_APPROVAL"
        ).length;
        const rejected = studentMedicines.filter(
            (m) => m.status === "REJECTED"
        ).length;

        // Check for expiring medicines (within 7 days)
        const today = dayjs();
        const expiring = studentMedicines.filter((m) => {
            if (!m.endDate) return false;
            const endDate = dayjs(m.endDate);
            return (
                endDate.diff(today, "day") <= 7 &&
                endDate.diff(today, "day") >= 0
            );
        }).length;

        return { total, approved, pending, rejected, expiring };
    };

    // Filter medicines based on search and status
    const getFilteredMedicines = () => {
        let filtered = studentMedicines;

        // Filter by search text
        if (searchText) {
            filtered = filtered.filter(
                (medicine) =>
                    medicine.medication?.name
                        ?.toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                    medicine.dosage
                        ?.toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                    medicine.instructions
                        ?.toLowerCase()
                        .includes(searchText.toLowerCase())
            );
        }

        // Filter by status
        if (filterStatus !== "all") {
            filtered = filtered.filter(
                (medicine) => medicine.status === filterStatus
            );
        }

        // Filter by tab
        if (activeTab === "active") {
            filtered = filtered.filter(
                (medicine) => medicine.status === "APPROVED"
            );
        } else if (activeTab === "pending") {
            filtered = filtered.filter(
                (medicine) => medicine.status === "PENDING_APPROVAL"
            );
        } else if (activeTab === "expiring") {
            const today = dayjs();
            filtered = filtered.filter((medicine) => {
                if (!medicine.endDate) return false;
                const endDate = dayjs(medicine.endDate);
                return (
                    endDate.diff(today, "day") <= 7 &&
                    endDate.diff(today, "day") >= 0
                );
            });
        }

        return filtered;
    };

    const filteredMedicines = getFilteredMedicines();
    const stats = getStatistics();

    // Hiện modal chi tiết khi phụ huynh bấm vào thuốc
    const handleMedicineClick = (medicine) => {
        setSelectedMedicine(medicine);
        setDetailModalOpen(true);
    };

    // Xử lý chọn ảnh
    const beforeUpload = (file) => {
        const isImage = file.type.startsWith("image/");
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isImage) {
            setImageError("Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WebP)");
            return Upload.LIST_IGNORE;
        }
        if (!isLt10M) {
            setImageError("Ảnh phải nhỏ hơn 10MB!");
            return Upload.LIST_IGNORE;
        }
        setImageError("");
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        setSelectedImageFile(file);
        return false; // Ngăn upload tự động
    };
    const handleRemoveImage = () => {
        setSelectedImageFile(null);
        setImagePreview(null);
        setImageError("");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa] pt-20">
                <div className="w-full max-w-6xl mx-auto px-4">
                    <div style={{ padding: "24px", textAlign: "center" }}>
                        <Spin size="large" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2] pt-20">
            <div className="w-full max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <MedicineBoxOutlined className="text-[#36ae9a]" />
                        <span>Quản lý thuốc học sinh</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Thông tin thuốc
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Theo dõi và quản lý thông tin thuốc của học sinh một
                        cách an toàn và hiệu quả
                    </p>
                </div>

                {/* Student Selection */}
                <Card className="rounded-2xl shadow-lg border-0 mb-6">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div>
                            <Title level={4} className="mb-2">
                                Chọn học sinh
                            </Title>
                            <Text type="secondary">
                                Chọn học sinh để xem và quản lý thông tin thuốc
                            </Text>
                        </div>
                        <div className="flex items-center gap-4">
                            {children && children.length > 0 ? (
                                <Select
                                    style={{ width: 250 }}
                                    value={selectedStudent}
                                    onChange={handleStudentChange}
                                    placeholder="Chọn học sinh"
                                    size="large"
                                >
                                    {children.map((child) => (
                                        <Select.Option
                                            key={child.studentId}
                                            value={child.studentId}
                                        >
                                            <div className="flex items-center gap-2">
                                                <UserOutlined />
                                                <span>{child.fullName}</span>
                                            </div>
                                        </Select.Option>
                                    ))}
                                </Select>
                            ) : (
                                <Text type="secondary">
                                    Không có học sinh nào
                                </Text>
                            )}
                        </div>
                    </div>
                </Card>

                {showSuccess && (
                    <Alert
                        message="Thông tin thuốc đã được gửi thành công!"
                        type="success"
                        showIcon
                        className="mb-6"
                    />
                )}

                {selectedStudent && (
                    <>
                        {/* Separator */}
                        <div className="my-8">
                            <div className="flex items-center">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <div className="px-4">
                                    <div className="inline-flex items-center gap-2 bg-white text-gray-500 px-3 py-1 rounded-full text-sm border border-gray-200">
                                        <MedicineBoxOutlined className="text-[#36ae9a]" />
                                        <span>Danh sách thuốc</span>
                                    </div>
                                </div>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>
                        </div>

                        {/* Tabs and Medicine List Section (merged) */}
                        <Card className="rounded-2xl shadow-lg border-0">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <Title level={4} className="mb-0">
                                        Danh sách thuốc
                                    </Title>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() =>
                                            setIsEditModalVisible(true)
                                        }
                                        className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
                                    >
                                        Gửi thuốc cho học sinh
                                    </Button>
                                </div>
                                <Tabs
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                    items={[
                                        {
                                            key: "all",
                                            label: (
                                                <span>
                                                    Tất cả
                                                    <Badge
                                                        count={stats.total}
                                                        className="ml-2"
                                                    />
                                                </span>
                                            ),
                                        },
                                        {
                                            key: "active",
                                            label: (
                                                <span>
                                                    Đang dùng
                                                    <Badge
                                                        count={stats.approved}
                                                        className="ml-2"
                                                    />
                                                </span>
                                            ),
                                        },
                                        {
                                            key: "pending",
                                            label: (
                                                <span>
                                                    Chờ duyệt
                                                    <Badge
                                                        count={stats.pending}
                                                        className="ml-2"
                                                    />
                                                </span>
                                            ),
                                        },
                                        {
                                            key: "expiring",
                                            label: (
                                                <span>
                                                    Sắp hết hạn
                                                    <Badge
                                                        count={stats.expiring}
                                                        className="ml-2"
                                                    />
                                                </span>
                                            ),
                                        },
                                    ]}
                                />

                                {filteredMedicines.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                        {filteredMedicines.map((medicine) => {
                                            const isExpiring =
                                                medicine.endDate &&
                                                dayjs(medicine.endDate).diff(
                                                    dayjs(),
                                                    "day"
                                                ) <= 7;
                                            const isExpired =
                                                medicine.endDate &&
                                                dayjs(medicine.endDate).diff(
                                                    dayjs(),
                                                    "day"
                                                ) < 0;

                                            return (
                                                <Card
                                                    key={medicine.id}
                                                    className="rounded-2xl shadow-lg border-0 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                                    actions={[
                                                        <Tooltip title="Xem chi tiết">
                                                            <EyeOutlined
                                                                key="view"
                                                                className="text-blue-500"
                                                            />
                                                        </Tooltip>,
                                                        // Phụ huynh chỉ có thể xem thông tin thuốc, không thể sửa hoặc xóa. Nếu cần thay đổi, hãy liên hệ với nhà trường hoặc gửi yêu cầu mới.
                                                    ]}
                                                    onClick={() =>
                                                        handleMedicineClick(
                                                            medicine
                                                        )
                                                    }
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <Title
                                                                level={5}
                                                                className="mb-2 text-gray-800"
                                                            >
                                                                {medicine
                                                                    .medication
                                                                    ?.name ||
                                                                    "Không có tên"}
                                                            </Title>
                                                            <Tag
                                                                color={
                                                                    statusColor[
                                                                        medicine
                                                                            .status
                                                                    ]
                                                                }
                                                                className="mb-2"
                                                            >
                                                                {
                                                                    statusLabel[
                                                                        medicine
                                                                            .status
                                                                    ]
                                                                }
                                                            </Tag>
                                                            {isExpiring &&
                                                                !isExpired && (
                                                                    <Tag
                                                                        color="warning"
                                                                        className="mb-2"
                                                                    >
                                                                        ⚠️ Sắp
                                                                        hết hạn
                                                                    </Tag>
                                                                )}
                                                            {isExpired && (
                                                                <Tag
                                                                    color="error"
                                                                    className="mb-2"
                                                                >
                                                                    ❌ Đã hết
                                                                    hạn
                                                                </Tag>
                                                            )}
                                                        </div>
                                                        <Avatar
                                                            size={48}
                                                            icon={
                                                                <MedicineBoxOutlined />
                                                            }
                                                            className="bg-[#36ae9a] text-white"
                                                        />
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <Text type="secondary">
                                                                Liều lượng:
                                                            </Text>
                                                            <Text strong>
                                                                {
                                                                    medicine.dosage
                                                                }
                                                            </Text>
                                                        </div>

                                                        <div className="flex justify-between items-center">
                                                            <Text type="secondary">
                                                                Tần suất:
                                                            </Text>
                                                            <Text strong>
                                                                {frequencyLabel[
                                                                    medicine
                                                                        .frequency
                                                                ] ||
                                                                    medicine.frequency}
                                                            </Text>
                                                        </div>

                                                        {medicine.startDate &&
                                                            medicine.endDate && (
                                                                <div className="flex justify-between items-center">
                                                                    <Text type="secondary">
                                                                        Thời
                                                                        gian:
                                                                    </Text>
                                                                    <Text
                                                                        strong
                                                                    >
                                                                        {dayjs(
                                                                            medicine.startDate
                                                                        ).format(
                                                                            "DD/MM/YYYY"
                                                                        )}{" "}
                                                                        -{" "}
                                                                        {dayjs(
                                                                            medicine.endDate
                                                                        ).format(
                                                                            "DD/MM/YYYY"
                                                                        )}
                                                                    </Text>
                                                                </div>
                                                            )}

                                                        {medicine.instructions && (
                                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                                <Text
                                                                    type="secondary"
                                                                    className="text-sm"
                                                                >
                                                                    {medicine
                                                                        .instructions
                                                                        .length >
                                                                    100
                                                                        ? `${medicine.instructions.substring(
                                                                              0,
                                                                              100
                                                                          )}...`
                                                                        : medicine.instructions}
                                                                </Text>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <span>
                                                {searchText ||
                                                filterStatus !== "all" ||
                                                activeTab !== "all"
                                                    ? "Không tìm thấy thuốc phù hợp"
                                                    : "Chưa có thông tin thuốc nào"}
                                            </span>
                                        }
                                    >
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() =>
                                                setIsEditModalVisible(true)
                                            }
                                            className="bg-[#36ae9a] hover:bg-[#2a8a7a] border-[#36ae9a]"
                                        >
                                            Gửi thuốc cho học sinh
                                        </Button>
                                    </Empty>
                                )}
                            </div>
                        </Card>
                    </>
                )}

                {!selectedStudent && (
                    <Card className="rounded-2xl shadow-lg border-0">
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">
                                👨‍🎓
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                Vui lòng chọn học sinh
                            </h3>
                            <p className="text-gray-500">
                                Chọn học sinh từ danh sách để xem thông tin
                                thuốc
                            </p>
                        </div>
                    </Card>
                )}

                <Modal
                    title="Thêm thuốc mới"
                    open={isEditModalVisible}
                    onCancel={() => setIsEditModalVisible(false)}
                    footer={null}
                    width={800}
                >
                    <Formik
                        initialValues={{
                            studentId: selectedStudent,
                            medicationName: "",
                            dosage: "",
                            frequency: "",
                            instructions: "",
                            startDate: null,
                            endDate: null,
                            description: "",
                            unit: "",
                            stockQuantity: 1,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                            setFieldValue,
                        }) => (
                            <Form layout="vertical" onFinish={handleSubmit}>
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Tên thuốc"
                                            validateStatus={
                                                touched.medicationName &&
                                                errors.medicationName
                                                    ? "error"
                                                    : ""
                                            }
                                            help={
                                                touched.medicationName &&
                                                errors.medicationName
                                            }
                                        >
                                            <Input
                                                name="medicationName"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.medicationName}
                                                placeholder="Nhập tên thuốc"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Liều lượng"
                                            validateStatus={
                                                touched.dosage && errors.dosage
                                                    ? "error"
                                                    : ""
                                            }
                                            help={
                                                touched.dosage && errors.dosage
                                            }
                                        >
                                            <Input
                                                name="dosage"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.dosage}
                                                placeholder="Ví dụ: 1 viên/lần"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Tần suất sử dụng"
                                            validateStatus={
                                                touched.frequency &&
                                                errors.frequency
                                                    ? "error"
                                                    : ""
                                            }
                                            help={
                                                touched.frequency &&
                                                errors.frequency
                                            }
                                        >
                                            <Select
                                                name="frequency"
                                                onChange={(value) =>
                                                    setFieldValue(
                                                        "frequency",
                                                        value
                                                    )
                                                }
                                                onBlur={handleBlur}
                                                value={values.frequency}
                                                placeholder="Chọn tần suất"
                                            >
                                                <Select.Option value="once">
                                                    1 lần/ngày
                                                </Select.Option>
                                                <Select.Option value="twice">
                                                    2 lần/ngày
                                                </Select.Option>
                                                <Select.Option value="three">
                                                    3 lần/ngày
                                                </Select.Option>
                                                <Select.Option value="four">
                                                    4 lần/ngày
                                                </Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Mô tả"
                                            validateStatus={
                                                touched.description &&
                                                errors.description
                                                    ? "error"
                                                    : ""
                                            }
                                            help={
                                                touched.description &&
                                                errors.description
                                            }
                                        >
                                            <Input
                                                name="description"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.description}
                                                placeholder="Nhập mô tả thuốc"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Đơn vị"
                                            validateStatus={
                                                touched.unit && errors.unit
                                                    ? "error"
                                                    : ""
                                            }
                                            help={touched.unit && errors.unit}
                                        >
                                            <Input
                                                name="unit"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.unit}
                                                placeholder="Ví dụ: viên, ml, mg"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Số lượng"
                                            validateStatus={
                                                touched.stockQuantity &&
                                                errors.stockQuantity
                                                    ? "error"
                                                    : ""
                                            }
                                            help={
                                                touched.stockQuantity &&
                                                errors.stockQuantity
                                            }
                                        >
                                            <Input
                                                name="stockQuantity"
                                                type="number"
                                                min={1}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.stockQuantity}
                                                placeholder="Nhập số lượng"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Thời gian sử dụng"
                                            validateStatus={
                                                (touched.startDate &&
                                                    errors.startDate) ||
                                                (touched.endDate &&
                                                    errors.endDate)
                                                    ? "error"
                                                    : ""
                                            }
                                            help={
                                                (touched.startDate &&
                                                    errors.startDate) ||
                                                (touched.endDate &&
                                                    errors.endDate)
                                            }
                                        >
                                            <Space>
                                                <DatePicker
                                                    placeholder="Ngày bắt đầu"
                                                    onChange={(date) =>
                                                        setFieldValue(
                                                            "startDate",
                                                            date
                                                        )
                                                    }
                                                    value={values.startDate}
                                                />
                                                <span>-</span>
                                                <DatePicker
                                                    placeholder="Ngày kết thúc"
                                                    onChange={(date) =>
                                                        setFieldValue(
                                                            "endDate",
                                                            date
                                                        )
                                                    }
                                                    value={values.endDate}
                                                />
                                            </Space>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item
                                            label="Hướng dẫn sử dụng"
                                            validateStatus={
                                                touched.instructions &&
                                                errors.instructions
                                                    ? "error"
                                                    : ""
                                            }
                                            help={
                                                touched.instructions &&
                                                errors.instructions
                                            }
                                        >
                                            <TextArea
                                                name="instructions"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.instructions}
                                                placeholder="Nhập hướng dẫn sử dụng chi tiết"
                                                rows={4}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Ảnh thuốc (nếu có)">
                                            <Dragger
                                                name="medicineImage"
                                                multiple={false}
                                                maxCount={1}
                                                accept="image/*"
                                                beforeUpload={beforeUpload}
                                                showUploadList={false}
                                                onRemove={handleRemoveImage}
                                                style={{ padding: 8 }}
                                            >
                                                <p className="ant-upload-drag-icon">
                                                    <UploadOutlined />
                                                </p>
                                                <p className="ant-upload-text">
                                                    Kéo và thả ảnh vào đây hoặc
                                                    nhấp để chọn ảnh
                                                </p>
                                                <p className="ant-upload-hint">
                                                    Hỗ trợ: JPG, PNG, GIF, WebP
                                                    - Kích thước tối đa 10MB
                                                </p>
                                            </Dragger>
                                            {imageError && (
                                                <div
                                                    style={{
                                                        color: "red",
                                                        marginTop: 8,
                                                    }}
                                                >
                                                    {imageError}
                                                </div>
                                            )}
                                            {imagePreview && (
                                                <div className="mt-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span
                                                            style={{
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            Xem trước:
                                                        </span>
                                                        <Button
                                                            size="small"
                                                            danger
                                                            onClick={
                                                                handleRemoveImage
                                                            }
                                                        >
                                                            Xóa ảnh
                                                        </Button>
                                                    </div>
                                                    <Image
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        style={{
                                                            maxWidth: 180,
                                                            maxHeight: 180,
                                                            borderRadius: 8,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            marginTop: 24,
                                        }}
                                    >
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={isSubmitting}
                                        >
                                            Gửi thông tin
                                        </Button>
                                    </div>
                                </Form.Item>
                            </Form>
                        )}
                    </Formik>
                </Modal>

                <Modal
                    open={detailModalOpen}
                    onCancel={() => setDetailModalOpen(false)}
                    footer={[
                        <Button
                            key="close"
                            type="primary"
                            onClick={() => setDetailModalOpen(false)}
                        >
                            Đóng
                        </Button>,
                    ]}
                    title={
                        selectedMedicine?.medication?.name || "Chi tiết thuốc"
                    }
                    width={500}
                >
                    {selectedMedicine && (
                        <div className="space-y-4">
                            {selectedMedicine.image && (
                                <div className="flex justify-center mb-4">
                                    <Image
                                        src={selectedMedicine.image}
                                        alt="Ảnh thuốc"
                                        style={{
                                            maxWidth: 200,
                                            maxHeight: 200,
                                            borderRadius: 8,
                                        }}
                                    />
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <Text type="secondary">Liều lượng:</Text>
                                <Text strong>{selectedMedicine.dosage}</Text>
                            </div>
                            <div className="flex justify-between items-center">
                                <Text type="secondary">Tần suất:</Text>
                                <Text strong>
                                    {frequencyLabel[
                                        selectedMedicine.frequency
                                    ] || selectedMedicine.frequency}
                                </Text>
                            </div>
                            {selectedMedicine.startDate &&
                                selectedMedicine.endDate && (
                                    <div className="flex justify-between items-center">
                                        <Text type="secondary">Thời gian:</Text>
                                        <Text strong>
                                            {dayjs(
                                                selectedMedicine.startDate
                                            ).format("DD/MM/YYYY")}{" "}
                                            -{" "}
                                            {dayjs(
                                                selectedMedicine.endDate
                                            ).format("DD/MM/YYYY")}
                                        </Text>
                                    </div>
                                )}
                            {selectedMedicine.instructions && (
                                <div>
                                    <Text type="secondary">
                                        Hướng dẫn sử dụng:
                                    </Text>
                                    <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                                        <Text>
                                            {selectedMedicine.instructions}
                                        </Text>
                                    </div>
                                </div>
                            )}
                            {selectedMedicine.description && (
                                <div>
                                    <Text type="secondary">Mô tả:</Text>
                                    <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                                        <Text>
                                            {selectedMedicine.description}
                                        </Text>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <Text type="secondary">Đơn vị:</Text>
                                <Text strong>{selectedMedicine.unit}</Text>
                            </div>
                            <div className="flex justify-between items-center">
                                <Text type="secondary">Số lượng:</Text>
                                <Text strong>
                                    {selectedMedicine.medication
                                        ?.stockQuantity ?? "-"}
                                </Text>
                            </div>
                            <div className="flex justify-between items-center">
                                <Text type="secondary">Trạng thái:</Text>
                                <Tag
                                    color={statusColor[selectedMedicine.status]}
                                >
                                    {statusLabel[selectedMedicine.status]}
                                </Tag>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default MedicineInfo;
