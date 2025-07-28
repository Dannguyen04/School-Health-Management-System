import { HeartOutlined } from "@ant-design/icons";
import {
    Alert,
    Button,
    Descriptions,
    Divider,
    message,
    Modal,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const { Title } = Typography;

const HealthCheckupResults = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [children, setChildren] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [checkupResults, setCheckupResults] = useState([]);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedCheckup, setSelectedCheckup] = useState(null);
    const [consultationModalVisible, setConsultationModalVisible] =
        useState(false);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchCheckupResults();
        }
    }, [selectedStudent]);

    // Xử lý state từ notification navigation
    useEffect(() => {
        if (location.state?.selectedStudentName && children.length > 0) {
            let targetStudent = null;

            // Ưu tiên tìm theo studentCode nếu có
            if (location.state?.selectedStudentCode) {
                targetStudent = children.find(
                    (child) =>
                        child.studentCode === location.state.selectedStudentCode
                );
            }

            // Nếu không tìm thấy theo studentCode, tìm theo tên
            if (!targetStudent) {
                targetStudent = children.find(
                    (child) =>
                        child.fullName === location.state.selectedStudentName
                );
            }

            if (targetStudent) {
                setSelectedStudent(targetStudent.studentId);
                // Clear state để tránh mở lại khi refresh
                window.history.replaceState({}, document.title);
            }
        }
    }, [
        location.state?.selectedStudentName,
        location.state?.selectedStudentCode,
        children,
    ]);

    // Xử lý scroll đến phần lịch tư vấn khi có state scrollToConsultation
    useEffect(() => {
        if (location.state?.scrollToConsultation && checkupResults.length > 0) {
            // Tìm kết quả khám có lịch tư vấn
            const consultationResult = checkupResults.find(
                (result) =>
                    result.raw.consultationStart && result.raw.consultationEnd
            );
            if (consultationResult) {
                // Scroll đến phần lịch tư vấn sau khi component đã render
                setTimeout(() => {
                    const consultationSection = document.querySelector(
                        "[data-consultation-section]"
                    );
                    if (consultationSection) {
                        consultationSection.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }
                }, 500);
            }
        }
    }, [location.state?.scrollToConsultation, checkupResults]);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/parents/my-children", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
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

    const fetchCheckupResults = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `/api/parents/students/${selectedStudent}/health-checkups`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.data.success) {
                const formattedResults = response.data.data.map(
                    (result, index) => ({
                        key: index,
                        raw: result,
                        date: result.scheduledDate
                            ? new Date(
                                  result.scheduledDate
                              ).toLocaleDateString()
                            : "N/A",
                        height: result.height ? `${result.height} cm` : "N/A",
                        weight: result.weight ? `${result.weight} kg` : "N/A",
                        bmi:
                            result.height && result.weight
                                ? (
                                      result.weight /
                                      (result.height / 100) ** 2
                                  ).toFixed(1)
                                : "N/A",
                        vision:
                            result.visionRightNoGlasses &&
                            result.visionLeftNoGlasses
                                ? `${result.visionRightNoGlasses}/${result.visionLeftNoGlasses}`
                                : "N/A",
                        bloodPressure:
                            result.systolicBP && result.diastolicBP
                                ? `${result.systolicBP}/${result.diastolicBP} mmHg`
                                : "N/A",
                        notes: result.notes || "",
                    })
                );
                setCheckupResults(formattedResults);
            } else {
                setCheckupResults([]);
            }
        } catch (error) {
            console.error("Error fetching checkup results:", error);
            message.error("Không thể lấy kết quả khám sức khỏe");
            setCheckupResults([]);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Ngày khám",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Chiến dịch",
            key: "campaign",
            render: (_, record) => record.raw.campaign?.name || "-",
        },
        {
            title: "Chiều cao",
            dataIndex: "height",
            key: "height",
        },
        {
            title: "Cân nặng",
            dataIndex: "weight",
            key: "weight",
        },
        {
            title: "BMI",
            dataIndex: "bmi",
            key: "bmi",
        },
        {
            title: "Tình trạng sức khỏe",
            key: "healthStatus",
            render: (_, record) => {
                const status = record.raw.overallHealth;
                const statusMap = {
                    NORMAL: { text: "Bình thường", color: "green" },
                    NEEDS_ATTENTION: { text: "Cần chú ý", color: "orange" },
                    REQUIRES_TREATMENT: { text: "Cần điều trị", color: "red" },
                };
                const statusInfo = statusMap[status] || {
                    text: status,
                    color: "default",
                };
                return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
            },
        },
        {
            title: "Lịch tư vấn",
            key: "consultation",
            render: (_, record) => {
                const hasConsultation =
                    record.raw.consultationStart && record.raw.consultationEnd;
                if (!hasConsultation) {
                    return <span className="text-gray-400">Chưa có</span>;
                }

                const startDate = new Date(record.raw.consultationStart);
                const endDate = new Date(record.raw.consultationEnd);
                const now = new Date();

                let statusText = "Đã đặt lịch";
                let statusColor = "blue";

                if (now > endDate) {
                    statusText = "Đã hoàn thành";
                    statusColor = "green";
                } else if (now >= startDate && now <= endDate) {
                    statusText = "Đang diễn ra";
                    statusColor = "orange";
                }

                return (
                    <div className="flex flex-col gap-1">
                        <Tag color={statusColor}>{statusText}</Tag>
                        <div className="text-xs text-gray-600">
                            {startDate.toLocaleDateString("vi-VN")} -{" "}
                            {endDate.toLocaleDateString("vi-VN")}
                            <br />
                            {startDate.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {endDate.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Ghi chú",
            dataIndex: "notes",
            key: "notes",
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <div className="flex flex-col gap-2">
                    <Button
                        type="primary"
                        size="small"
                        style={{
                            backgroundColor: "#36ae9a",
                            borderColor: "#36ae9a",
                            borderRadius: "6px",
                            fontWeight: "500",
                            height: "32px",
                            boxShadow: "0 2px 4px rgba(54, 174, 154, 0.2)",
                        }}
                        onClick={() => {
                            setSelectedCheckup(record.raw);
                            setDetailModalVisible(true);
                        }}
                    >
                        Xem chi tiết
                    </Button>
                    {record.raw.consultationStart &&
                        record.raw.consultationEnd && (
                            <Button
                                type="default"
                                size="small"
                                style={{
                                    color: "#36ae9a",
                                    borderColor: "#36ae9a",
                                    borderRadius: "6px",
                                    fontWeight: "500",
                                    height: "32px",
                                    backgroundColor: "#f0f9f7",
                                }}
                                onClick={() => {
                                    setSelectedCheckup(record.raw);
                                    setConsultationModalVisible(true);
                                }}
                            >
                                Xem lịch tư vấn
                            </Button>
                        )}
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6fcfa] flex justify-center items-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6fcfa] ">
            <div className="w-full max-w-5xl mx-auto px-4 pt-24">
                {/* Header theo mẫu HealthProfile */}
                <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-2">
                        <HeartOutlined className="text-[#36ae9a]" />
                        <span>Quản lý sức khỏe học sinh</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Kết quả khám sức khỏe
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Xem lại kết quả các lần khám sức khỏe định kỳ của học
                        sinh để theo dõi sự phát triển và phát hiện sớm các vấn
                        đề.
                    </p>
                </div>
                {/* Bỏ Card, chỉ giữ Select, Button và Table */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                    <Title
                        level={2}
                        className="!text-[#36ae9a] !mb-0 text-center md:text-left"
                    >
                        Kết quả khám sức khỏe
                    </Title>
                    <Space>
                        <Select
                            style={{ width: 320, minWidth: 220 }}
                            dropdownStyle={{
                                borderRadius: 18,
                                boxShadow:
                                    "0 8px 32px rgba(54, 174, 154, 0.15)",
                            }}
                            dropdownClassName="custom-student-dropdown"
                            value={selectedStudent}
                            onChange={setSelectedStudent}
                            placeholder="Chọn học sinh"
                            size="large"
                        >
                            {children.map((child) => (
                                <Select.Option
                                    key={child.studentId}
                                    value={child.studentId}
                                    className="!py-3 !px-5 !text-lg hover:bg-[#e8f5f2]"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 14,
                                    }}
                                >
                                    <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                                        {child.fullName} - {child.class}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({child.studentCode})
                                    </span>
                                </Select.Option>
                            ))}
                        </Select>
                    </Space>
                </div>

                {/* Thông báo lịch tư vấn từ notification */}
                {location.state?.scrollToConsultation && (
                    <Alert
                        message="Lịch tư vấn sức khỏe"
                        description="Học sinh có lịch tư vấn sức khỏe đã được đặt. Vui lòng kiểm tra chi tiết bên dưới."
                        type="info"
                        showIcon
                        className="mb-4"
                        style={{
                            borderColor: "#36ae9a",
                            backgroundColor: "#f0f9f7",
                        }}
                    />
                )}

                <Table
                    columns={columns}
                    dataSource={checkupResults}
                    pagination={false}
                    className="rounded-xl"
                    style={{ padding: 12 }}
                    data-consultation-section="true"
                />
            </div>
            {/* Modal xem chi tiết */}
            <Modal
                title="Chi tiết báo cáo khám sức khỏe"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedCheckup && (
                    <div>
                        <Typography.Title level={4} style={{ marginBottom: 0 }}>
                            {selectedCheckup.studentName || ""}
                        </Typography.Title>
                        <Typography.Text
                            type="secondary"
                            style={{ display: "block", marginBottom: 4 }}
                        >
                            {selectedCheckup.campaign?.name && (
                                <>
                                    Chiến dịch:{" "}
                                    <b>{selectedCheckup.campaign.name}</b>
                                    <br />
                                </>
                            )}
                            Ngày khám:{" "}
                            {selectedCheckup.scheduledDate
                                ? new Date(
                                      selectedCheckup.scheduledDate
                                  ).toLocaleDateString("vi-VN")
                                : "N/A"}
                        </Typography.Text>
                        <Divider orientation="left">Thông tin cơ bản</Divider>
                        <Descriptions column={2} size="small" bordered>
                            <Descriptions.Item label="Chiều cao">
                                {selectedCheckup.height
                                    ? `${selectedCheckup.height} cm`
                                    : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cân nặng">
                                {selectedCheckup.weight
                                    ? `${selectedCheckup.weight} kg`
                                    : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mạch">
                                {selectedCheckup.pulse || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Huyết áp tâm thu">
                                {selectedCheckup.systolicBP || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Huyết áp tâm trương">
                                {selectedCheckup.diastolicBP || "N/A"}
                            </Descriptions.Item>
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
                                            selectedCheckup
                                                .physicalClassification
                                        ] ||
                                        selectedCheckup.physicalClassification ||
                                        "N/A"
                                    );
                                })()}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider orientation="left">Thị lực</Divider>
                        <Descriptions column={2} size="small" bordered>
                            <Descriptions.Item label="Phải (không kính)">
                                {selectedCheckup.visionRightNoGlasses || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trái (không kính)">
                                {selectedCheckup.visionLeftNoGlasses || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phải (có kính)">
                                {selectedCheckup.visionRightWithGlasses ||
                                    "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trái (có kính)">
                                {selectedCheckup.visionLeftWithGlasses || "N/A"}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider orientation="left">Thính lực</Divider>
                        <Descriptions column={2} size="small" bordered>
                            <Descriptions.Item label="Trái (bình thường)">
                                {selectedCheckup.hearingLeftNormal || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trái (thì thầm)">
                                {selectedCheckup.hearingLeftWhisper || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phải (bình thường)">
                                {selectedCheckup.hearingRightNormal || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phải (thì thầm)">
                                {selectedCheckup.hearingRightWhisper || "N/A"}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider orientation="left">Răng miệng</Divider>
                        <Descriptions column={2} size="small" bordered>
                            <Descriptions.Item label="Răng hàm trên">
                                {selectedCheckup.dentalUpperJaw || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Răng hàm dưới">
                                {selectedCheckup.dentalLowerJaw || "N/A"}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider orientation="left">Đánh giá tổng thể</Divider>
                        <Descriptions column={2} size="small" bordered>
                            <Descriptions.Item label="Sức khỏe tổng thể">
                                <Tag
                                    color={
                                        selectedCheckup.overallHealth ===
                                        "NORMAL"
                                            ? "green"
                                            : selectedCheckup.overallHealth ===
                                              "NEEDS_ATTENTION"
                                            ? "orange"
                                            : "red"
                                    }
                                >
                                    {(() => {
                                        const map = {
                                            NORMAL: "Bình thường",
                                            NEEDS_ATTENTION: "Cần chú ý",
                                            REQUIRES_TREATMENT: "Cần điều trị",
                                        };
                                        return (
                                            map[
                                                selectedCheckup.overallHealth
                                            ] ||
                                            selectedCheckup.overallHealth ||
                                            "N/A"
                                        );
                                    })()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Cần theo dõi">
                                {selectedCheckup.requiresFollowUp
                                    ? "Có"
                                    : "Không"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày theo dõi">
                                {selectedCheckup.followUpDate
                                    ? new Date(
                                          selectedCheckup.followUpDate
                                      ).toLocaleDateString("vi-VN")
                                    : ""}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khuyến nghị">
                                <Typography.Text strong>
                                    {selectedCheckup.recommendations || "N/A"}
                                </Typography.Text>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label="Ghi chú lâm sàng"
                                span={2}
                            >
                                {selectedCheckup.clinicalNotes || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú thêm" span={2}>
                                {selectedCheckup.notes || "N/A"}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>

            {/* Modal chi tiết lịch tư vấn */}
            <Modal
                title={
                    <div>
                        <div>Chi tiết lịch tư vấn sức khỏe</div>
                        <div
                            style={{
                                fontSize: "14px",
                                color: "#666",
                                fontWeight: "normal",
                            }}
                        >
                            {selectedCheckup?.studentName || ""}
                        </div>
                    </div>
                }
                open={consultationModalVisible}
                onCancel={() => setConsultationModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedCheckup && (
                    <div>
                        {/* Alert tình trạng sức khỏe */}
                        <Alert
                            message={`Tình trạng sức khỏe: ${
                                selectedCheckup.overallHealth ===
                                "NEEDS_ATTENTION"
                                    ? "Cần chú ý"
                                    : "Cần điều trị"
                            }`}
                            type={
                                selectedCheckup.overallHealth ===
                                "NEEDS_ATTENTION"
                                    ? "warning"
                                    : "error"
                            }
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        {/* Thông tin lịch tư vấn */}
                        <Descriptions
                            title="Thông tin lịch tư vấn"
                            column={1}
                            bordered
                        >
                            <Descriptions.Item label="Ngày tư vấn">
                                {selectedCheckup.consultationStart
                                    ? new Date(
                                          selectedCheckup.consultationStart
                                      ).toLocaleDateString("vi-VN")
                                    : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian">
                                {selectedCheckup.consultationStart &&
                                selectedCheckup.consultationEnd
                                    ? `${new Date(
                                          selectedCheckup.consultationStart
                                      ).toLocaleDateString("vi-VN")} ${new Date(
                                          selectedCheckup.consultationStart
                                      ).toLocaleTimeString("vi-VN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      })} - ${new Date(
                                          selectedCheckup.consultationEnd
                                      ).toLocaleDateString("vi-VN")} ${new Date(
                                          selectedCheckup.consultationEnd
                                      ).toLocaleTimeString("vi-VN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      })}`
                                    : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {(() => {
                                    const startDate = new Date(
                                        selectedCheckup.consultationStart
                                    );
                                    const endDate = new Date(
                                        selectedCheckup.consultationEnd
                                    );
                                    const now = new Date();

                                    if (now > endDate) {
                                        return (
                                            <Tag color="green">
                                                Đã hoàn thành
                                            </Tag>
                                        );
                                    } else if (
                                        now >= startDate &&
                                        now <= endDate
                                    ) {
                                        return (
                                            <Tag color="orange">
                                                Đang diễn ra
                                            </Tag>
                                        );
                                    } else {
                                        return (
                                            <Tag color="blue">Đã đặt lịch</Tag>
                                        );
                                    }
                                })()}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Thông tin khám sức khỏe liên quan */}
                        <Divider orientation="left">
                            Thông tin khám sức khỏe liên quan
                        </Divider>
                        <Descriptions column={2} size="small" bordered>
                            <Descriptions.Item label="Ngày khám">
                                {selectedCheckup.scheduledDate
                                    ? new Date(
                                          selectedCheckup.scheduledDate
                                      ).toLocaleDateString("vi-VN")
                                    : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chiến dịch">
                                {selectedCheckup.campaign?.name || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chiều cao">
                                {selectedCheckup.height
                                    ? `${selectedCheckup.height} cm`
                                    : "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cân nặng">
                                {selectedCheckup.weight
                                    ? `${selectedCheckup.weight} kg`
                                    : "N/A"}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Ghi chú lâm sàng */}
                        {selectedCheckup.clinicalNotes && (
                            <>
                                <Divider orientation="left">
                                    Ghi chú lâm sàng
                                </Divider>
                                <div
                                    style={{
                                        background: "#f5f5f5",
                                        padding: 12,
                                        borderRadius: 6,
                                        border: "1px solid #d9d9d9",
                                    }}
                                >
                                    {selectedCheckup.clinicalNotes}
                                </div>
                            </>
                        )}

                        {/* Khuyến nghị */}
                        {selectedCheckup.recommendations && (
                            <>
                                <Divider orientation="left">
                                    Khuyến nghị
                                </Divider>
                                <div
                                    style={{
                                        background: "#fff7e6",
                                        padding: 12,
                                        borderRadius: 6,
                                        border: "1px solid #ffd591",
                                    }}
                                >
                                    {selectedCheckup.recommendations}
                                </div>
                            </>
                        )}

                        {/* Hướng dẫn */}
                        <Alert
                            message="Hướng dẫn"
                            description="Vui lòng liên hệ với nhà trường hoặc y tá học đường để biết thêm chi tiết về buổi tư vấn này. Nếu cần thay đổi lịch, vui lòng liên hệ trước ít nhất 24 giờ."
                            type="info"
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HealthCheckupResults;
