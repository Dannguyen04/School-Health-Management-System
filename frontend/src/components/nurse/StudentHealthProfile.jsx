import React, { useState, useEffect } from "react";
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Space,
    message,
    Spin,
    Tag,
    Row,
    Col,
    Typography,
    Divider,
    Descriptions,
    Badge,
    Tooltip,
    Popconfirm,
    Alert,
} from "antd";
import {
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined,
    UserOutlined,
    HeartOutlined,
    CalendarOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    IdcardOutlined,
    MedicineBoxOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    DropboxOutlined,
} from "@ant-design/icons";
import { nurseAPI } from "../../utils/api";

const { Title, Text } = Typography;
const { Option } = Select;

const StudentHealthProfile = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
    const [healthChecks, setHealthChecks] = useState([]);
    const [loadingChecks, setLoadingChecks] = useState(false);
    const [checkDetail, setCheckDetail] = useState(null);
    const [checkDetailModal, setCheckDetailModal] = useState(false);
    const [searchForm] = Form.useForm();
    const [filteredStudents, setFilteredStudents] = useState([]);

    // Fetch danh sách học sinh thực tế từ API - Updated with nurseAPI
    const fetchStudents = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);

            const response = await nurseAPI.getStudentsForNurse();

            if (response.data.success) {
                setStudents(response.data.data || []);
            } else {
                throw new Error(
                    response.data.error || "Không thể tải danh sách học sinh"
                );
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                err.message ||
                "Không thể tải danh sách học sinh";
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        setFilteredStudents(students);
    }, [students]);

    const handleRefresh = () => {
        fetchStudents(true);
    };

    const handleViewProfile = (student) => {
        setSelectedStudent(student);
        setIsProfileModalVisible(true);
    };

    // Xóa học sinh
    const handleDeleteStudent = (studentId) => {
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
    };

    // Fetch lịch sử kiểm tra sức khỏe khi chọn học sinh - Updated with nurseAPI
    const fetchHealthChecks = async (studentId) => {
        if (!studentId) return;

        setLoadingChecks(true);
        try {
            const response = await nurseAPI.getStudentMedicalChecks(studentId);

            if (response.data.success) {
                setHealthChecks(response.data.data || []);
            } else {
                setHealthChecks([]);
                console.warn("No health checks found for student:", studentId);
            }
        } catch (err) {
            console.error("Error fetching health checks:", err);
            setHealthChecks([]);
            message.warning("Không thể tải lịch sử kiểm tra sức khỏe");
        } finally {
            setLoadingChecks(false);
        }
    };

    // Gọi khi chọn học sinh
    useEffect(() => {
        if (selectedStudent?.id) {
            fetchHealthChecks(selectedStudent.id);
        }
    }, [selectedStudent]);

    // Xem chi tiết kiểm tra - Updated with proper error handling
    const handleViewCheckDetail = async (id) => {
        try {
            const response = await nurseAPI.getMedicalEventById(id);

            if (response.data.success) {
                setCheckDetail(response.data.data);
                setCheckDetailModal(true);
            } else {
                throw new Error(
                    response.data.error || "Không thể tải chi tiết kiểm tra"
                );
            }
        } catch (err) {
            console.error("Error fetching check detail:", err);
            message.error("Không thể tải chi tiết kiểm tra");
            setCheckDetail(null);
        }
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = () => {
        const values = searchForm.getFieldsValue();
        const normalize = (str) =>
            (str || "").replace(/\s+/g, "").toLowerCase();
        setFilteredStudents(
            students.filter((student) => {
                const codeMatch = values.studentCode
                    ? normalize(student.studentCode).includes(
                          normalize(values.studentCode)
                      )
                    : true;
                const nameMatch = values.name
                    ? normalize(student.fullName).includes(
                          normalize(values.name)
                      )
                    : true;
                const classMatch = values.class
                    ? normalize(student.class).includes(normalize(values.class))
                    : true;
                return codeMatch && nameMatch && classMatch;
            })
        );
    };

    // Hàm xóa bộ lọc
    const handleReset = () => {
        searchForm.resetFields();
        setFilteredStudents(students);
    };

    const columns = [
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
            width: 150,
        },
        {
            title: "Lớp",
            dataIndex: "class",
            key: "class",
            width: 80,
        },
        {
            title: "Khối",
            dataIndex: "grade",
            key: "grade",
            width: 80,
        },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            width: 80,
            render: (gender) => {
                const g = gender.toString().trim().toLowerCase();
                if (["male", "nam", "NAM"].includes(g)) return "Nam";
                if (["female", "NỮ", "nữ"].includes(g)) return "Nữ";
                return gender;
            },
        },
        {
            title: "Thao tác",
            key: "action",
            width: 80,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewProfile(record)}
                    ></Button>
                    <Popconfirm
                        title="Xóa học sinh"
                        description="Bạn có chắc chắn muốn xóa học sinh này?"
                        onConfirm={() => handleDeleteStudent(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Button
                            danger
                            size="small"
                            icon={<CloseCircleOutlined />}
                        ></Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const renderHealthProfile = (profile) => {
        if (!profile) {
            return <Descriptions title="Chưa có hồ sơ sức khỏe" />;
        }

        return (
            <Card
                title={
                    <span style={{ fontWeight: 700, fontSize: 18 }}>
                        Hồ sơ sức khỏe
                    </span>
                }
                bordered={false}
                style={{ boxShadow: "0 2px 8px #f0f1f2", borderRadius: 12 }}
            >
                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        <Descriptions
                            title={
                                <span style={{ fontWeight: 600 }}>
                                    Thông tin tổng quát
                                </span>
                            }
                            column={1}
                            size="middle"
                            labelStyle={{ fontWeight: 500, minWidth: 120 }}
                            contentStyle={{ fontSize: 16 }}
                            className="mb-4"
                        >
                            <Descriptions.Item label="Dị ứng">
                                {profile.allergies &&
                                profile.allergies.length > 0 ? (
                                    profile.allergies.map((allergy, idx) => (
                                        <Tag
                                            color="red"
                                            key={idx}
                                            style={{ marginBottom: 4 }}
                                        >
                                            {typeof allergy === "string"
                                                ? allergy
                                                : allergy.name ||
                                                  allergy.type ||
                                                  "Dị ứng không xác định"}
                                        </Tag>
                                    ))
                                ) : (
                                    <Text type="secondary">
                                        Không có dị ứng
                                    </Text>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Bệnh mãn tính">
                                {profile.chronicDiseases &&
                                profile.chronicDiseases.length > 0 ? (
                                    profile.chronicDiseases.map(
                                        (disease, idx) => (
                                            <Tag
                                                color="orange"
                                                key={idx}
                                                style={{ marginBottom: 4 }}
                                            >
                                                {typeof disease === "string"
                                                    ? disease
                                                    : disease.name ||
                                                      disease.type ||
                                                      "Bệnh không xác định"}
                                            </Tag>
                                        )
                                    )
                                ) : (
                                    <Text type="secondary">
                                        Không có bệnh mãn tính
                                    </Text>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thuốc đang sử dụng">
                                {profile.medications &&
                                profile.medications.length > 0 ? (
                                    profile.medications.map((med, idx) => (
                                        <Tag
                                            color="blue"
                                            key={idx}
                                            style={{ marginBottom: 4 }}
                                        >
                                            {typeof med === "string"
                                                ? med
                                                : med.name ||
                                                  med.type ||
                                                  "Thuốc không xác định"}
                                        </Tag>
                                    ))
                                ) : (
                                    <Text type="secondary">Không có thuốc</Text>
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                    <Col xs={24} md={12}>
                        <Descriptions
                            title={
                                <span style={{ fontWeight: 600 }}>
                                    Thông số cơ thể
                                </span>
                            }
                            column={1}
                            size="middle"
                            labelStyle={{ fontWeight: 500, minWidth: 120 }}
                            contentStyle={{ fontSize: 16 }}
                            className="mb-4"
                        >
                            <Descriptions.Item label="Chiều cao">
                                {profile.height
                                    ? `${profile.height} cm`
                                    : "Chưa cập nhật"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cân nặng">
                                {profile.weight
                                    ? `${profile.weight} kg`
                                    : "Chưa cập nhật"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thị lực">
                                {profile.vision || "Chưa cập nhật"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thính lực">
                                {profile.hearing || "Chưa cập nhật"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        {profile.notes && (
                            <Descriptions
                                title={
                                    <span style={{ fontWeight: 600 }}>
                                        Ghi chú
                                    </span>
                                }
                                column={1}
                                size="middle"
                                labelStyle={{ fontWeight: 500, minWidth: 120 }}
                                contentStyle={{ fontSize: 16 }}
                            >
                                <Descriptions.Item label="">
                                    {profile.notes}
                                </Descriptions.Item>
                            </Descriptions>
                        )}
                    </Col>
                </Row>
            </Card>
        );
    };

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
                <div>
                    <Title level={2} className="mb-2">
                        Hồ sơ sức khỏe học sinh
                    </Title>
                    <Text type="secondary">
                        Xem và theo dõi thông tin sức khỏe của học sinh
                    </Text>
                </div>
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

            <Card>
                <Form
                    layout="vertical"
                    form={searchForm}
                    onFinish={handleSearch}
                >
                    <Row gutter={16}>
                        <Col xs={24} sm={8}>
                            <Form.Item name="studentCode" label="Mã học sinh">
                                <Input
                                    placeholder="Nhập mã học sinh"
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="name" label="Tên học sinh">
                                <Input
                                    placeholder="Nhập tên học sinh"
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="class" label="Lớp">
                                <Input placeholder="Nhập lớp" allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} className="text-right">
                            <Space>
                                <Button onClick={handleReset}>
                                    Xóa bộ lọc
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    htmlType="submit"
                                >
                                    Tìm kiếm
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    dataSource={[...filteredStudents].sort((a, b) => {
                        if (!a.studentCode || !b.studentCode) return 0;
                        // Nếu studentCode là số, so sánh số; nếu là chuỗi, so sánh chuỗi
                        const codeA = isNaN(Number(a.studentCode))
                            ? a.studentCode
                            : Number(a.studentCode);
                        const codeB = isNaN(Number(b.studentCode))
                            ? b.studentCode
                            : Number(b.studentCode);
                        if (codeA < codeB) return -1;
                        if (codeA > codeB) return 1;
                        return 0;
                    })}
                    rowKey="id"
                    pagination={{
                        pageSize: 5,
                        showQuickJumper: true,
                    }}
                />
            </Card>

            {/* View Profile Modal */}
            <Modal
                title={
                    <div className="flex items-center space-x-2">
                        <UserOutlined className="text-blue-500" />
                        <span>
                            Hồ sơ sức khỏe - {selectedStudent?.fullName}
                        </span>
                    </div>
                }
                open={isProfileModalVisible}
                onCancel={() => {
                    setIsProfileModalVisible(false);
                    setSelectedStudent(null);
                }}
                footer={[
                    <Button
                        key="close"
                        onClick={() => {
                            setIsProfileModalVisible(false);
                            setSelectedStudent(null);
                        }}
                    >
                        Đóng
                    </Button>,
                ]}
                width={800}
            >
                {selectedStudent && (
                    <div className="space-y-4">
                        <Card size="small" title="Thông tin học sinh">
                            <Descriptions column={2} size="small">
                                <Descriptions.Item label="Mã học sinh">
                                    {selectedStudent.studentCode}
                                </Descriptions.Item>
                                <Descriptions.Item label="Họ và tên">
                                    {selectedStudent.fullName}
                                </Descriptions.Item>
                                <Descriptions.Item label="Lớp">
                                    {selectedStudent.class}
                                </Descriptions.Item>
                                <Descriptions.Item label="Khối">
                                    {selectedStudent.grade}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Divider />

                        {renderHealthProfile(selectedStudent.healthProfile)}

                        <Divider />

                        <Card size="small" title="Lịch sử kiểm tra sức khỏe">
                            <Table
                                dataSource={healthChecks}
                                loading={loadingChecks}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                                columns={[
                                    {
                                        title: "Ngày khám",
                                        dataIndex: "scheduledDate",
                                        key: "scheduledDate",
                                        render: (date) =>
                                            date &&
                                            new Date(date).toLocaleDateString(),
                                    },
                                    {
                                        title: "Chiến dịch",
                                        dataIndex: ["campaign", "name"],
                                        key: "campaignName",
                                    },
                                    {
                                        title: "Trạng thái",
                                        dataIndex: "status",
                                        key: "status",
                                        render: (status) => {
                                            const map = {
                                                COMPLETED: {
                                                    text: "Hoàn thành",
                                                    color: "green",
                                                },
                                                SCHEDULED: {
                                                    text: "Đã lên lịch",
                                                    color: "orange",
                                                },
                                                RESCHEDULED: {
                                                    text: "Đã dời lịch",
                                                    color: "blue",
                                                },
                                                CANCELLED: {
                                                    text: "Đã hủy",
                                                    color: "red",
                                                },
                                            };
                                            const info = map[status] || {
                                                text: status,
                                                color: "default",
                                            };
                                            return (
                                                <Tag
                                                    color={info.color}
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    {info.text}
                                                </Tag>
                                            );
                                        },
                                    },
                                    {
                                        title: "Thao tác",
                                        key: "actions",
                                        render: (_, record) => (
                                            <Button
                                                size="small"
                                                onClick={() =>
                                                    handleViewCheckDetail(
                                                        record.id
                                                    )
                                                }
                                            >
                                                Xem chi tiết
                                            </Button>
                                        ),
                                    },
                                ]}
                            />
                        </Card>
                    </div>
                )}
            </Modal>

            {/* Modal chi tiết kiểm tra sức khỏe */}
            <Modal
                title="Chi tiết kiểm tra sức khỏe"
                open={checkDetailModal}
                onCancel={() => setCheckDetailModal(false)}
                footer={
                    <Button onClick={() => setCheckDetailModal(false)}>
                        Đóng
                    </Button>
                }
                width={700}
            >
                {checkDetail ? (
                    <Card
                        bordered={false}
                        style={{
                            boxShadow: "0 2px 8px #f0f1f2",
                            borderRadius: 12,
                        }}
                    >
                        <Descriptions
                            title={
                                <span style={{ fontWeight: 700, fontSize: 18 }}>
                                    Thông tin kiểm tra
                                </span>
                            }
                            column={1}
                            size="middle"
                            labelStyle={{ fontWeight: 600, minWidth: 120 }}
                            contentStyle={{ fontSize: 16 }}
                        >
                            <Descriptions.Item label="Ngày khám">
                                {checkDetail.scheduledDate
                                    ? new Date(
                                          checkDetail.scheduledDate
                                      ).toLocaleDateString()
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chiến dịch">
                                {checkDetail.campaign?.name || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={
                                        checkDetail.status === "COMPLETED"
                                            ? "green"
                                            : "orange"
                                    }
                                    style={{
                                        fontSize: 14,
                                        padding: "2px 12px",
                                    }}
                                >
                                    {(() => {
                                        const map = {
                                            COMPLETED: "Hoàn thành",
                                            SCHEDULED: "Đã lên lịch",
                                            RESCHEDULED: "Đã dời lịch",
                                            CANCELLED: "Đã hủy",
                                        };
                                        return (
                                            map[checkDetail.status] ||
                                            checkDetail.status
                                        );
                                    })()}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Descriptions
                            title={
                                <span style={{ fontWeight: 700, fontSize: 18 }}>
                                    Chỉ số cơ thể
                                </span>
                            }
                            column={2}
                            size="middle"
                            labelStyle={{ fontWeight: 600, minWidth: 120 }}
                            contentStyle={{ fontSize: 16 }}
                        >
                            <Descriptions.Item label="Chiều cao">
                                {checkDetail.height != null
                                    ? `${checkDetail.height} cm`
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cân nặng">
                                {checkDetail.weight != null
                                    ? `${checkDetail.weight} kg`
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mạch">
                                {checkDetail.pulse != null
                                    ? `${checkDetail.pulse} lần/phút`
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Huyết áp">
                                {checkDetail.systolicBP != null &&
                                checkDetail.diastolicBP != null
                                    ? `${checkDetail.systolicBP}/${checkDetail.diastolicBP} mmHg`
                                    : "-"}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Descriptions
                            title={
                                <span style={{ fontWeight: 700, fontSize: 18 }}>
                                    Thị lực
                                </span>
                            }
                            column={2}
                            size="middle"
                            labelStyle={{ fontWeight: 600, minWidth: 120 }}
                            contentStyle={{ fontSize: 16 }}
                        >
                            <Descriptions.Item label="Phải (không kính)">
                                {checkDetail.visionRightNoGlasses != null
                                    ? checkDetail.visionRightNoGlasses
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trái (không kính)">
                                {checkDetail.visionLeftNoGlasses != null
                                    ? checkDetail.visionLeftNoGlasses
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phải (có kính)">
                                {checkDetail.visionRightWithGlasses != null
                                    ? checkDetail.visionRightWithGlasses
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trái (có kính)">
                                {checkDetail.visionLeftWithGlasses != null
                                    ? checkDetail.visionLeftWithGlasses
                                    : "-"}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Descriptions
                            title={
                                <span style={{ fontWeight: 700, fontSize: 18 }}>
                                    Thính lực
                                </span>
                            }
                            column={2}
                            size="middle"
                            labelStyle={{ fontWeight: 600, minWidth: 120 }}
                            contentStyle={{ fontSize: 16 }}
                        >
                            <Descriptions.Item label="Trái (bình thường)">
                                {checkDetail.hearingLeftNormal != null
                                    ? checkDetail.hearingLeftNormal
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trái (thì thầm)">
                                {checkDetail.hearingLeftWhisper != null
                                    ? checkDetail.hearingLeftWhisper
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phải (bình thường)">
                                {checkDetail.hearingRightNormal != null
                                    ? checkDetail.hearingRightNormal
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phải (thì thầm)">
                                {checkDetail.hearingRightWhisper != null
                                    ? checkDetail.hearingRightWhisper
                                    : "-"}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Descriptions
                            title={
                                <span style={{ fontWeight: 700, fontSize: 18 }}>
                                    Răng miệng
                                </span>
                            }
                            column={2}
                            size="middle"
                            labelStyle={{ fontWeight: 600, minWidth: 120 }}
                            contentStyle={{ fontSize: 16 }}
                        >
                            <Descriptions.Item label="Hàm trên">
                                {checkDetail.dentalUpperJaw || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Hàm dưới">
                                {checkDetail.dentalLowerJaw || "-"}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Descriptions
                            title={
                                <span style={{ fontWeight: 700, fontSize: 18 }}>
                                    Phân loại thể lực & Tổng thể
                                </span>
                            }
                            column={2}
                            size="middle"
                            labelStyle={{ fontWeight: 600, minWidth: 120 }}
                            contentStyle={{ fontSize: 16 }}
                        >
                            <Descriptions.Item label="Phân loại thể lực">
                                {(() => {
                                    const map = {
                                        EXCELLENT: "Xuất sắc",
                                        GOOD: "Tốt",
                                        AVERAGE: "Trung bình",
                                        WEAK: "Yếu",
                                    };
                                    return (
                                        map[
                                            checkDetail.physicalClassification
                                        ] ||
                                        checkDetail.physicalClassification ||
                                        "-"
                                    );
                                })()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng thể sức khỏe">
                                {(() => {
                                    const map = {
                                        NORMAL: "Bình thường",
                                        NEEDS_ATTENTION: "Cần chú ý",
                                        REQUIRES_TREATMENT: "Cần điều trị",
                                    };
                                    return (
                                        map[checkDetail.overallHealth] ||
                                        checkDetail.overallHealth ||
                                        "-"
                                    );
                                })()}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Descriptions
                            title={
                                <span style={{ fontWeight: 700, fontSize: 18 }}>
                                    Khuyến nghị & Theo dõi
                                </span>
                            }
                            column={1}
                            size="middle"
                            labelStyle={{ fontWeight: 600, minWidth: 120 }}
                            contentStyle={{ fontSize: 16 }}
                        >
                            <Descriptions.Item label="Khuyến nghị">
                                {checkDetail.recommendations || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cần theo dõi lại">
                                {checkDetail.requiresFollowUp ? "Có" : "Không"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày theo dõi lại">
                                {checkDetail.followUpDate
                                    ? new Date(
                                          checkDetail.followUpDate
                                      ).toLocaleDateString()
                                    : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú">
                                {checkDetail.notes ? (
                                    <span style={{ whiteSpace: "pre-line" }}>
                                        {checkDetail.notes}
                                    </span>
                                ) : (
                                    <span style={{ color: "#aaa" }}>
                                        Không có ghi chú
                                    </span>
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                ) : (
                    <div className="flex justify-center items-center h-32">
                        <Spin size="large" />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentHealthProfile;
