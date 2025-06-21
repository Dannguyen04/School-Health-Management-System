import {
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { nurseAPI } from "../../utils/api.js";

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const MedicalEventReport = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [form] = Form.useForm();
    const [medicalEvents, setMedicalEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Filter states
    const [searchText, setSearchText] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterSeverity, setFilterSeverity] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDateRange, setFilterDateRange] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStudentInfo, setSelectedStudentInfo] = useState(null);
    const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
    const [studentSearchText, setStudentSearchText] = useState("");
    const [studentFilterGrade, setStudentFilterGrade] = useState("");
    const [filteredStudents, setFilteredStudents] = useState([]);

    // Load medical events from API
    const loadMedicalEvents = async () => {
        setLoading(true);
        try {
            const response = await nurseAPI.getAllMedicalEvents();
            if (response.data.success) {
                setMedicalEvents(response.data.data);
            } else {
                message.error("Không thể tải danh sách sự kiện y tế");
            }
        } catch (error) {
            console.error("Error loading medical events:", error);
            message.error("Lỗi khi tải danh sách sự kiện y tế");
        } finally {
            setLoading(false);
        }
    };

    // Load students from API
    const loadStudents = async () => {
        try {
            const response = await nurseAPI.getStudentsForNurse();
            if (response.data.success) {
                setStudents(response.data.data);
            } else {
                message.error("Không thể tải danh sách học sinh");
            }
        } catch (error) {
            console.error("Error loading students:", error);
            message.error("Lỗi khi tải danh sách học sinh");
        }
    };

    useEffect(() => {
        loadMedicalEvents();
        loadStudents();
    }, []);

    // Filter events based on search and filter criteria
    useEffect(() => {
        let filtered = [...medicalEvents];

        // Search by student name or title
        if (searchText) {
            filtered = filtered.filter(
                (event) =>
                    event.studentName
                        .toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                    event.title
                        .toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                    event.description
                        .toLowerCase()
                        .includes(searchText.toLowerCase())
            );
        }

        // Filter by type
        if (filterType) {
            filtered = filtered.filter((event) => event.type === filterType);
        }

        // Filter by severity
        if (filterSeverity) {
            filtered = filtered.filter(
                (event) => event.severity === filterSeverity
            );
        }

        // Filter by status
        if (filterStatus) {
            filtered = filtered.filter(
                (event) => event.status === filterStatus
            );
        }

        // Filter by date range
        if (filterDateRange && filterDateRange.length === 2) {
            const [startDate, endDate] = filterDateRange;
            filtered = filtered.filter((event) => {
                const eventDate = dayjs(event.occurredAt);
                return (
                    eventDate.isAfter(startDate.startOf("day")) &&
                    eventDate.isBefore(endDate.endOf("day"))
                );
            });
        }

        setFilteredEvents(filtered);
    }, [
        medicalEvents,
        searchText,
        filterType,
        filterSeverity,
        filterStatus,
        filterDateRange,
    ]);

    // Filter students based on search and filter criteria
    useEffect(() => {
        let filtered = [...students];

        // Search by student name, code, or grade
        if (studentSearchText) {
            filtered = filtered.filter(
                (student) =>
                    student.fullName
                        .toLowerCase()
                        .includes(studentSearchText.toLowerCase()) ||
                    student.studentCode
                        .toLowerCase()
                        .includes(studentSearchText.toLowerCase()) ||
                    student.grade
                        .toLowerCase()
                        .includes(studentSearchText.toLowerCase())
            );
        }

        // Filter by grade
        if (studentFilterGrade) {
            filtered = filtered.filter(
                (student) => student.grade === studentFilterGrade
            );
        }

        setFilteredStudents(filtered);
    }, [students, studentSearchText, studentFilterGrade]);

    // Get unique grades for filter
    const gradeOptions = [
        ...new Set(students.map((student) => student.grade)),
    ].sort();

    const eventTypeOptions = [
        { value: "ACCIDENT", label: "Tai nạn" },
        { value: "FEVER", label: "Sốt" },
        { value: "FALL", label: "Ngã" },
        { value: "EPIDEMIC", label: "Dịch bệnh" },
        { value: "ALLERGY_REACTION", label: "Dị ứng" },
        { value: "CHRONIC_DISEASE_EPISODE", label: "Bệnh mãn tính" },
        { value: "OTHER", label: "Khác" },
    ];

    const severityOptions = [
        { value: "low", label: "Nhẹ" },
        { value: "medium", label: "Trung bình" },
        { value: "high", label: "Nặng" },
        { value: "critical", label: "Nghiêm trọng" },
    ];

    const statusOptions = [
        { value: "PENDING", label: "Chờ xử lý" },
        { value: "IN_PROGRESS", label: "Đang xử lý" },
        { value: "RESOLVED", label: "Đã giải quyết" },
        { value: "REFERRED", label: "Đã chuyển viện" },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "orange";
            case "IN_PROGRESS":
                return "blue";
            case "RESOLVED":
                return "green";
            case "REFERRED":
                return "red";
            default:
                return "default";
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case "low":
                return "green";
            case "medium":
                return "orange";
            case "high":
                return "red";
            case "critical":
                return "red";
            default:
                return "default";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "ACCIDENT":
                return (
                    <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                );
            case "FEVER":
                return (
                    <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
                );
            case "FALL":
                return (
                    <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                );
            case "ALLERGY_REACTION":
                return (
                    <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                );
            default:
                return <ExclamationCircleOutlined />;
        }
    };

    const columns = [
        {
            title: "Học sinh",
            dataIndex: "studentName",
            key: "studentName",
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-sm text-gray-500">{record.grade}</div>
                </div>
            ),
        },
        {
            title: "Sự kiện",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    {getTypeIcon(record.type)}
                    <div>
                        <div className="font-medium">{text}</div>
                        <div className="text-sm text-gray-500">
                            {record.location}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: (type) => {
                const option = eventTypeOptions.find(
                    (opt) => opt.value === type
                );
                return <Tag>{option?.label || type}</Tag>;
            },
        },
        {
            title: "Mức độ",
            dataIndex: "severity",
            key: "severity",
            render: (severity) => (
                <Tag color={getSeverityColor(severity)}>
                    {severityOptions.find((opt) => opt.value === severity)
                        ?.label || severity}
                </Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {statusOptions.find((opt) => opt.value === status)?.label ||
                        status}
                </Tag>
            ),
        },
        {
            title: "Thời gian",
            dataIndex: "occurredAt",
            key: "occurredAt",
            render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewEvent(record)}
                    >
                        Xem
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditEvent(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa sự kiện y tế này?"
                        onConfirm={() => handleDeleteEvent(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger icon={<DeleteOutlined />} size="small">
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const studentColumns = [
        {
            title: "Mã học sinh",
            dataIndex: "studentCode",
            key: "studentCode",
            width: 120,
        },
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <div className="text-sm text-gray-500">{record.gender}</div>
                </div>
            ),
        },
        {
            title: "Lớp",
            dataIndex: "grade",
            key: "grade",
            width: 100,
        },
        {
            title: "Nhóm máu",
            dataIndex: "bloodType",
            key: "bloodType",
            width: 100,
        },
        {
            title: "Liên lạc khẩn cấp",
            key: "emergency",
            render: (_, record) => (
                <div>
                    <div className="text-sm">{record.emergencyContact}</div>
                    <div className="text-sm text-gray-500">
                        {record.emergencyPhone}
                    </div>
                </div>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 100,
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => handleSelectStudent(record)}
                >
                    Chọn
                </Button>
            ),
        },
    ];

    const handleAddEvent = () => {
        setIsEditMode(false);
        setSelectedEvent(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditEvent = (event) => {
        setIsEditMode(true);
        setSelectedEvent(event);
        const student = students.find((s) => s.id === event.studentId);
        setSelectedStudentInfo(student);
        form.setFieldsValue({
            ...event,
            studentId: event.studentId,
            occurredAt: dayjs(event.occurredAt),
            resolvedAt: event.resolvedAt ? dayjs(event.resolvedAt) : null,
            symptoms: event.symptoms.join(", "),
        });
        setIsModalVisible(true);
    };

    const handleViewEvent = (event) => {
        setSelectedEvent(event);
        setIsViewModalVisible(true);
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const response = await nurseAPI.deleteMedicalEvent(eventId);
            if (response.data.success) {
                message.success("Đã xóa sự kiện y tế");
                loadMedicalEvents(); // Reload data
            } else {
                message.error("Lỗi khi xóa sự kiện y tế");
            }
        } catch (error) {
            console.error("Error deleting medical event:", error);
            message.error("Lỗi khi xóa sự kiện y tế");
        }
    };

    const clearFilters = () => {
        setSearchText("");
        setFilterType("");
        setFilterSeverity("");
        setFilterStatus("");
        setFilterDateRange(null);
    };

    const hasActiveFilters = () => {
        return (
            searchText ||
            filterType ||
            filterSeverity ||
            filterStatus ||
            filterDateRange
        );
    };

    const handleStudentChange = (studentId) => {
        const student = students.find((s) => s.id === studentId);
        setSelectedStudentInfo(student);
    };

    const openStudentModal = () => {
        setIsStudentModalVisible(true);
        setStudentSearchText("");
        setStudentFilterGrade("");
    };

    const handleSelectStudent = (student) => {
        setSelectedStudentInfo(student);
        form.setFieldsValue({ studentId: student.id });
        setIsStudentModalVisible(false);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const values = await form.validateFields();

            // Get selected student data
            const selectedStudent = students.find(
                (student) => student.id === values.studentId
            );

            const eventData = {
                studentId: values.studentId,
                title: values.title,
                description: values.description,
                type: values.type,
                severity: values.severity,
                status: values.status,
                location: values.location,
                symptoms: values.symptoms
                    ? values.symptoms.split(",").map((s) => s.trim())
                    : [],
                treatment: values.treatment,
                outcome: values.outcome,
                occurredAt: values.occurredAt.toISOString(),
                resolvedAt: values.resolvedAt
                    ? values.resolvedAt.toISOString()
                    : null,
            };

            if (isEditMode) {
                // Update existing event
                const response = await nurseAPI.updateMedicalEvent(
                    selectedEvent.id,
                    eventData
                );
                if (response.data.success) {
                    message.success("Đã cập nhật sự kiện y tế");
                    loadMedicalEvents(); // Reload data
                } else {
                    message.error("Lỗi khi cập nhật sự kiện y tế");
                }
            } else {
                // Create new event
                const response = await nurseAPI.createMedicalEvent(eventData);
                if (response.data.success) {
                    message.success("Đã tạo sự kiện y tế mới");
                    loadMedicalEvents(); // Reload data
                } else {
                    message.error("Lỗi khi tạo sự kiện y tế");
                }
            }

            setIsModalVisible(false);
            form.resetFields();
            setSelectedEvent(null);
            setIsEditMode(false);
            setSelectedStudentInfo(null);
        } catch (error) {
            console.error("Error submitting medical event:", error);
            message.error("Lỗi khi lưu sự kiện y tế");
        } finally {
            setSubmitting(false);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setIsViewModalVisible(false);
        form.resetFields();
        setSelectedEvent(null);
        setIsEditMode(false);
        setSelectedStudentInfo(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Báo cáo sự kiện y tế</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddEvent}
                >
                    Tạo báo cáo mới
                </Button>
            </div>

            {/* Search and Filter Section */}
            <Card>
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm kiếm theo tên học sinh, tiêu đề hoặc mô tả..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                            />
                        </div>
                        <Tooltip title="Hiển thị/ẩn bộ lọc">
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setShowFilters(!showFilters)}
                                type={showFilters ? "primary" : "default"}
                            >
                                Bộ lọc
                            </Button>
                        </Tooltip>
                        {hasActiveFilters() && (
                            <Button onClick={clearFilters}>Xóa bộ lọc</Button>
                        )}
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="border-t pt-4">
                            <Row gutter={16}>
                                <Col span={6}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Loại sự kiện
                                        </label>
                                        <Select
                                            placeholder="Tất cả loại"
                                            value={filterType}
                                            onChange={setFilterType}
                                            allowClear
                                            style={{ width: "100%" }}
                                        >
                                            {eventTypeOptions.map((option) => (
                                                <Option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Mức độ
                                        </label>
                                        <Select
                                            placeholder="Tất cả mức độ"
                                            value={filterSeverity}
                                            onChange={setFilterSeverity}
                                            allowClear
                                            style={{ width: "100%" }}
                                        >
                                            {severityOptions.map((option) => (
                                                <Option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Trạng thái
                                        </label>
                                        <Select
                                            placeholder="Tất cả trạng thái"
                                            value={filterStatus}
                                            onChange={setFilterStatus}
                                            allowClear
                                            style={{ width: "100%" }}
                                        >
                                            {statusOptions.map((option) => (
                                                <Option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Khoảng thời gian
                                        </label>
                                        <RangePicker
                                            value={filterDateRange}
                                            onChange={setFilterDateRange}
                                            style={{ width: "100%" }}
                                            placeholder={[
                                                "Từ ngày",
                                                "Đến ngày",
                                            ]}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* Filter Summary */}
                    {hasActiveFilters() && (
                        <div className="border-t pt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Kết quả tìm kiếm:</span>
                                <span className="font-medium">
                                    {filteredEvents.length}
                                </span>
                                <span>sự kiện</span>
                                {filteredEvents.length !==
                                    medicalEvents.length && (
                                    <>
                                        <span>trong tổng số</span>
                                        <span className="font-medium">
                                            {medicalEvents.length}
                                        </span>
                                        <span>sự kiện</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <Card>
                <Table
                    dataSource={filteredEvents}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 5,
                        showQuickJumper: true,
                    }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={
                    isEditMode
                        ? "Chỉnh sửa sự kiện y tế"
                        : "Tạo báo cáo sự kiện y tế"
                }
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleModalCancel}
                width={900}
                okText={isEditMode ? "Cập nhật" : "Tạo báo cáo"}
                cancelText="Hủy"
                confirmLoading={submitting}
            >
                <Form form={form} layout="vertical">
                    {/* Student Information Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4 text-blue-600 border-b pb-2">
                            Thông tin học sinh
                        </h3>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="studentId"
                                    label="Chọn học sinh"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn học sinh",
                                        },
                                    ]}
                                >
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Chọn học sinh để xem thông tin"
                                            value={
                                                selectedStudentInfo
                                                    ? `${selectedStudentInfo.fullName} - ${selectedStudentInfo.grade}`
                                                    : ""
                                            }
                                            readOnly
                                            style={{ flex: 1 }}
                                        />
                                        <Button
                                            type="primary"
                                            onClick={openStudentModal}
                                        >
                                            Chọn học sinh
                                        </Button>
                                    </div>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="occurredAt"
                                    label="Thời gian xảy ra"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn thời gian",
                                        },
                                    ]}
                                >
                                    <DatePicker
                                        showTime
                                        style={{ width: "100%" }}
                                        placeholder="Chọn ngày và giờ"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Display selected student information */}
                        {selectedStudentInfo && (
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <h4 className="font-medium text-gray-700 mb-2">
                                    Thông tin học sinh được chọn:
                                </h4>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <div className="text-sm">
                                            <span className="font-medium">
                                                Tên:
                                            </span>{" "}
                                            {selectedStudentInfo.fullName}
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div className="text-sm">
                                            <span className="font-medium">
                                                Lớp:
                                            </span>{" "}
                                            {selectedStudentInfo.grade}
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div className="text-sm">
                                            <span className="font-medium">
                                                Nhóm máu:
                                            </span>{" "}
                                            {selectedStudentInfo.bloodType}
                                        </div>
                                    </Col>
                                </Row>
                                <Row gutter={16} className="mt-2">
                                    <Col span={12}>
                                        <div className="text-sm">
                                            <span className="font-medium">
                                                Liên lạc khẩn cấp:
                                            </span>{" "}
                                            {
                                                selectedStudentInfo.emergencyContact
                                            }
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div className="text-sm">
                                            <span className="font-medium">
                                                Số điện thoại:
                                            </span>{" "}
                                            {selectedStudentInfo.emergencyPhone}
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </div>

                    {/* Event Details Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4 text-blue-600 border-b pb-2">
                            Chi tiết sự kiện
                        </h3>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="title"
                                    label="Tiêu đề sự kiện"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập tiêu đề",
                                        },
                                    ]}
                                >
                                    <Input placeholder="VD: Ngã trong giờ ra chơi" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="type"
                                    label="Loại sự kiện"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng chọn loại sự kiện",
                                        },
                                    ]}
                                >
                                    <Select placeholder="Chọn loại sự kiện">
                                        {eventTypeOptions.map((option) => (
                                            <Option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="severity"
                                    label="Mức độ nghiêm trọng"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn mức độ",
                                        },
                                    ]}
                                >
                                    <Select placeholder="Chọn mức độ">
                                        {severityOptions.map((option) => (
                                            <Option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="status"
                                    label="Trạng thái"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn trạng thái",
                                        },
                                    ]}
                                >
                                    <Select placeholder="Chọn trạng thái">
                                        {statusOptions.map((option) => (
                                            <Option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="description"
                            label="Mô tả chi tiết"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập mô tả",
                                },
                            ]}
                        >
                            <TextArea
                                rows={3}
                                placeholder="Mô tả chi tiết về sự kiện y tế, nguyên nhân, diễn biến..."
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="location"
                                    label="Địa điểm xảy ra"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập địa điểm",
                                        },
                                    ]}
                                >
                                    <Input placeholder="VD: Sân trường, Lớp học, Căng tin" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="symptoms"
                                    label="Triệu chứng"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Vui lòng nhập triệu chứng",
                                        },
                                    ]}
                                >
                                    <Input placeholder="VD: Đau đầu, Sốt cao, Nôn mửa (phân cách bằng dấu phẩy)" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    {/* Treatment Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4 text-blue-600 border-b pb-2">
                            Điều trị và kết quả
                        </h3>
                        <Form.Item
                            name="treatment"
                            label="Điều trị đã thực hiện"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Mô tả chi tiết điều trị đã thực hiện, thuốc đã sử dụng..."
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="resolvedAt"
                                    label="Thời gian giải quyết"
                                >
                                    <DatePicker
                                        showTime
                                        style={{ width: "100%" }}
                                        placeholder="Chọn ngày và giờ"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="outcome"
                                    label="Kết quả cuối cùng"
                                >
                                    <Input placeholder="Kết quả điều trị, tình trạng hiện tại" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </Modal>

            {/* View Modal */}
            <Modal
                title="Chi tiết sự kiện y tế"
                open={isViewModalVisible}
                onCancel={handleModalCancel}
                footer={[
                    <Button key="close" onClick={handleModalCancel}>
                        Đóng
                    </Button>,
                ]}
                width={700}
            >
                {selectedEvent && (
                    <div className="space-y-4">
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Học sinh" span={2}>
                                {selectedEvent.studentName} -{" "}
                                {selectedEvent.grade}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tiêu đề" span={2}>
                                {selectedEvent.title}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại sự kiện">
                                <Tag>
                                    {
                                        eventTypeOptions.find(
                                            (opt) =>
                                                opt.value === selectedEvent.type
                                        )?.label
                                    }
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mức độ">
                                <Tag
                                    color={getSeverityColor(
                                        selectedEvent.severity
                                    )}
                                >
                                    {
                                        severityOptions.find(
                                            (opt) =>
                                                opt.value ===
                                                selectedEvent.severity
                                        )?.label
                                    }
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={getStatusColor(selectedEvent.status)}
                                >
                                    {
                                        statusOptions.find(
                                            (opt) =>
                                                opt.value ===
                                                selectedEvent.status
                                        )?.label
                                    }
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa điểm">
                                {selectedEvent.location}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian xảy ra">
                                {dayjs(selectedEvent.occurredAt).format(
                                    "DD/MM/YYYY HH:mm"
                                )}
                            </Descriptions.Item>
                            {selectedEvent.resolvedAt && (
                                <Descriptions.Item label="Thời gian giải quyết">
                                    {dayjs(selectedEvent.resolvedAt).format(
                                        "DD/MM/YYYY HH:mm"
                                    )}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Y tá xử lý">
                                {selectedEvent.nurseName}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <div>
                            <h4 className="font-medium mb-2">
                                Mô tả chi tiết:
                            </h4>
                            <p className="text-gray-700">
                                {selectedEvent.description}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-medium mb-2">Triệu chứng:</h4>
                            <div className="flex flex-wrap gap-1">
                                {selectedEvent.symptoms.map(
                                    (symptom, index) => (
                                        <Tag key={index} color="blue">
                                            {symptom}
                                        </Tag>
                                    )
                                )}
                            </div>
                        </div>

                        {selectedEvent.treatment && (
                            <div>
                                <h4 className="font-medium mb-2">Điều trị:</h4>
                                <p className="text-gray-700">
                                    {selectedEvent.treatment}
                                </p>
                            </div>
                        )}

                        {selectedEvent.outcome && (
                            <div>
                                <h4 className="font-medium mb-2">Kết quả:</h4>
                                <p className="text-gray-700">
                                    {selectedEvent.outcome}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Student Selection Modal */}
            <Modal
                title="Chọn học sinh"
                open={isStudentModalVisible}
                onCancel={() => setIsStudentModalVisible(false)}
                footer={null}
                width={1000}
            >
                <div className="space-y-4">
                    {/* Search and Filter */}
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm kiếm theo tên, mã học sinh hoặc lớp..."
                                prefix={<SearchOutlined />}
                                value={studentSearchText}
                                onChange={(e) =>
                                    setStudentSearchText(e.target.value)
                                }
                                allowClear
                            />
                        </div>
                        <Select
                            placeholder="Lọc theo lớp"
                            value={studentFilterGrade}
                            onChange={setStudentFilterGrade}
                            allowClear
                            style={{ width: 200 }}
                        >
                            {gradeOptions.map((grade) => (
                                <Option key={grade} value={grade}>
                                    {grade}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    {/* Student Table */}
                    <Table
                        dataSource={filteredStudents}
                        columns={studentColumns}
                        rowKey="id"
                        pagination={{
                            pageSize: 8,
                            showQuickJumper: true,
                            showSizeChanger: true,
                        }}
                        size="small"
                    />

                    {/* Summary */}
                    <div className="text-sm text-gray-600 text-center">
                        Tìm thấy {filteredStudents.length} học sinh
                        {studentSearchText || studentFilterGrade ? (
                            <span>
                                {" "}
                                (trong tổng số {students.length} học sinh)
                            </span>
                        ) : null}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MedicalEventReport;
