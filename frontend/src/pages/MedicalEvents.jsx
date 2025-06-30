import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { parentAPI } from "../utils/api";
import {
    Card,
    Modal,
    Spin,
    Typography,
    Tag,
    Button,
    Row,
    Col,
    Tooltip,
    Skeleton,
    Empty,
    Divider,
} from "antd";
import {
    ExclamationCircleOutlined,
    UserOutlined,
    EnvironmentOutlined,
    FieldTimeOutlined,
    HeartFilled,
    HeartOutlined,
} from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;

const severityColor = {
    critical: "red",
    high: "orange",
    medium: "gold",
    low: "green",
};

const statusColor = {
    RESOLVED: "green",
    IN_PROGRESS: "blue",
    REFERRED: "orange",
    PENDING: "default",
};

const typeIcon = {
    ACCIDENT: (
        <ExclamationCircleOutlined style={{ color: "#ff4d4f", fontSize: 22 }} />
    ),
    FEVER: <HeartFilled style={{ color: "#faad14", fontSize: 22 }} />,
    FALL: (
        <ExclamationCircleOutlined style={{ color: "#fa8c16", fontSize: 22 }} />
    ),
    EPIDEMIC: <HeartFilled style={{ color: "#722ed1", fontSize: 22 }} />,
    ALLERGY_REACTION: (
        <HeartFilled style={{ color: "#13c2c2", fontSize: 22 }} />
    ),
    CHRONIC_DISEASE_EPISODE: (
        <HeartFilled style={{ color: "#1890ff", fontSize: 22 }} />
    ),
    OTHER: (
        <ExclamationCircleOutlined style={{ color: "#bfbfbf", fontSize: 22 }} />
    ),
};

const getTypeLabel = (type) => {
    switch (type) {
        case "ACCIDENT":
            return "Tai nạn";
        case "FEVER":
            return "Sốt";
        case "FALL":
            return "Ngã";
        case "EPIDEMIC":
            return "Dịch bệnh";
        case "ALLERGY_REACTION":
            return "Dị ứng";
        case "CHRONIC_DISEASE_EPISODE":
            return "Bệnh mãn tính";
        case "OTHER":
            return "Khác";
        default:
            return type;
    }
};

const getSeverityLabel = (sev) => {
    switch ((sev || "").toLowerCase()) {
        case "critical":
            return "Nguy kịch";
        case "high":
            return "Cao";
        case "medium":
            return "Trung bình";
        case "low":
            return "Thấp";
        default:
            return sev;
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case "RESOLVED":
            return "Đã giải quyết";
        case "IN_PROGRESS":
            return "Đang xử lý";
        case "REFERRED":
            return "Đã chuyển viện";
        case "PENDING":
            return "Chờ xử lý";
        default:
            return status;
    }
};

const MedicalEvents = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [eventDetail, setEventDetail] = useState(null);

    useEffect(() => {
        if (user?.id) {
            fetchEvents();
        }
    }, [user]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await parentAPI.getNotifications({
                type: "medical_event",
            });
            if (res.data.success) {
                setEvents(
                    res.data.data.sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                );
            }
        } catch (err) {
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEventClick = async (event) => {
        setSelectedEvent(event);
        setDetailModalVisible(true);
        setLoadingDetail(true);
        try {
            const res = await parentAPI.getNotificationById(event.id);
            if (res.data.success && res.data.data.medicalEventDetails) {
                setEventDetail(res.data.data.medicalEventDetails);
            } else {
                setEventDetail(null);
            }
        } catch (err) {
            setEventDetail(null);
        } finally {
            setLoadingDetail(false);
        }
    };

    const closeModal = () => {
        setDetailModalVisible(false);
        setSelectedEvent(null);
        setEventDetail(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2] pt-20">
            <div className="w-full max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <HeartOutlined className="text-[#36ae9a]" />
                        <span>Thông báo y tế học sinh</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Sự kiện y tế
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Danh sách các sự kiện y tế liên quan đến học sinh của
                        bạn
                    </p>
                </div>
                {/* Danh sách sự kiện */}
                {loading ? (
                    <Row gutter={[24, 24]}>
                        {[...Array(6)].map((_, idx) => (
                            <Col xs={24} sm={12} md={8} key={idx}>
                                <Skeleton active paragraph={{ rows: 2 }} />
                            </Col>
                        ))}
                    </Row>
                ) : events.length === 0 ? (
                    <Empty description="Không có sự kiện y tế nào" />
                ) : (
                    <Row gutter={[24, 24]}>
                        {events
                            .slice()
                            .sort((a, b) => {
                                const dateA = a.occurredAt
                                    ? new Date(a.occurredAt)
                                    : new Date(a.createdAt);
                                const dateB = b.occurredAt
                                    ? new Date(b.occurredAt)
                                    : new Date(b.createdAt);
                                return dateB - dateA;
                            })
                            .map((item) => (
                                <Col xs={24} sm={12} md={8} key={item.id}>
                                    <Card
                                        hoverable
                                        className="rounded-2xl shadow border-0 mb-6 transition-all duration-200 bg-white group"
                                        onClick={() => handleEventClick(item)}
                                        style={{
                                            minHeight: 160,
                                            padding: 0,
                                            borderColor: "#e6f7f2",
                                        }}
                                        bodyStyle={{ padding: 0 }}
                                    >
                                        <div className="flex items-center gap-4 p-6">
                                            <div className="flex-shrink-0">
                                                {typeIcon[item.eventType] || (
                                                    <ExclamationCircleOutlined
                                                        style={{
                                                            fontSize: 32,
                                                            color: "#36ae9a",
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Text
                                                        strong
                                                        className="text-lg text-[#36ae9a] truncate"
                                                    >
                                                        {item.title ||
                                                            "Sự kiện y tế"}
                                                    </Text>
                                                </div>
                                                <div className="text-gray-400 text-xs mb-2">
                                                    <FieldTimeOutlined className="mr-1" />
                                                    {moment(
                                                        item.createdAt
                                                    ).format(
                                                        "DD/MM/YYYY HH:mm"
                                                    )}
                                                </div>
                                                <div className="text-gray-600 text-sm line-clamp-2 truncate">
                                                    <Tooltip
                                                        title={item.message}
                                                    >
                                                        {item.message}
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                    </Row>
                )}
                {/* Modal chi tiết */}
                <Modal
                    open={detailModalVisible}
                    onCancel={closeModal}
                    footer={<Button onClick={closeModal}>Đóng</Button>}
                    title={
                        <span>
                            <ExclamationCircleOutlined
                                style={{ color: "#36ae9a", marginRight: 8 }}
                            />
                            Chi tiết sự kiện y tế
                        </span>
                    }
                    width={700}
                    centered
                    bodyStyle={{ padding: 0 }}
                >
                    <Card
                        className="rounded-2xl shadow-lg border-0"
                        bodyStyle={{ padding: 24 }}
                    >
                        {loadingDetail ? (
                            <Skeleton active paragraph={{ rows: 8 }} />
                        ) : eventDetail ? (
                            <>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12}>
                                        <div className="mb-4 flex items-center">
                                            <UserOutlined
                                                style={{
                                                    color: "#36ae9a",
                                                    marginRight: 6,
                                                }}
                                            />
                                            <Text strong>Học sinh:</Text>
                                            <span className="ml-2">
                                                {eventDetail.studentName}
                                            </span>
                                        </div>
                                        <div className="mb-4 flex items-center">
                                            <FieldTimeOutlined
                                                style={{
                                                    color: "#36ae9a",
                                                    marginRight: 6,
                                                }}
                                            />
                                            <Text strong>Thời gian:</Text>
                                            <span className="ml-2">
                                                {moment(
                                                    eventDetail.occurredAt
                                                ).format("DD/MM/YYYY HH:mm")}
                                            </span>
                                        </div>
                                        <div className="mb-4 flex items-center">
                                            <EnvironmentOutlined
                                                style={{
                                                    color: "#36ae9a",
                                                    marginRight: 6,
                                                }}
                                            />
                                            <Text strong>Địa điểm:</Text>
                                            <span className="ml-2">
                                                {eventDetail.location ||
                                                    "Không xác định"}
                                            </span>
                                        </div>
                                        <div className="mb-4 flex items-center">
                                            <Text strong>Y tá phụ trách:</Text>
                                            <span className="ml-2">
                                                {eventDetail.nurseName}
                                            </span>
                                        </div>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <div className="mb-4 flex items-center gap-2">
                                            <Text strong className="mr-1">
                                                Loại sự kiện:
                                            </Text>
                                            <Tag color="cyan">
                                                {getTypeLabel(eventDetail.type)}
                                            </Tag>
                                        </div>
                                        <div className="mb-4 flex items-center gap-2">
                                            <Text strong className="mr-1">
                                                Mức độ:
                                            </Text>
                                            <Tag
                                                color={
                                                    eventDetail.severity ===
                                                    "critical"
                                                        ? "red"
                                                        : eventDetail.severity ===
                                                          "high"
                                                        ? "orange"
                                                        : eventDetail.severity ===
                                                          "medium"
                                                        ? "gold"
                                                        : "green"
                                                }
                                            >
                                                {getSeverityLabel(
                                                    eventDetail.severity
                                                )}
                                            </Tag>
                                        </div>
                                        <div className="mb-4 flex items-center gap-2">
                                            <Text strong className="mr-1">
                                                Trạng thái:
                                            </Text>
                                            <Tag
                                                color={
                                                    eventDetail.status ===
                                                    "RESOLVED"
                                                        ? "green"
                                                        : eventDetail.status ===
                                                          "IN_PROGRESS"
                                                        ? "blue"
                                                        : eventDetail.status ===
                                                          "REFERRED"
                                                        ? "orange"
                                                        : "default"
                                                }
                                            >
                                                {getStatusLabel(
                                                    eventDetail.status
                                                )}
                                            </Tag>
                                            {(eventDetail.severity ===
                                                "critical" ||
                                                eventDetail.status ===
                                                    "REFERRED") && (
                                                <ExclamationCircleOutlined className="ml-2 text-red-500" />
                                            )}
                                        </div>
                                    </Col>
                                </Row>
                                <Divider />
                                <div className="mb-4">
                                    <Text
                                        strong
                                        className="text-base text-[#36ae9a] flex items-center"
                                    >
                                        <ExclamationCircleOutlined className="mr-2" />
                                        Mô tả sự cố:
                                    </Text>
                                    <div className="text-gray-700 mt-1 ml-6">
                                        {eventDetail.description}
                                    </div>
                                </div>
                                {eventDetail.treatment && (
                                    <div className="mb-4">
                                        <Text
                                            strong
                                            className="text-base text-[#36ae9a]"
                                        >
                                            Hướng xử lý:
                                        </Text>
                                        <div className="text-gray-700 mt-1 ml-6">
                                            {eventDetail.treatment}
                                        </div>
                                    </div>
                                )}
                                {eventDetail.outcome && (
                                    <div className="mb-4">
                                        <Text
                                            strong
                                            className="text-base text-[#36ae9a]"
                                        >
                                            Kết quả:
                                        </Text>
                                        <div className="text-gray-700 mt-1 ml-6">
                                            {eventDetail.outcome}
                                        </div>
                                    </div>
                                )}
                                <div className="mb-2">
                                    <Text
                                        strong
                                        className="text-base text-[#36ae9a]"
                                    >
                                        Triệu chứng:
                                    </Text>
                                    {eventDetail.symptoms &&
                                    eventDetail.symptoms.length > 0 ? (
                                        <div className="mt-1 ml-6 flex flex-wrap gap-2">
                                            {eventDetail.symptoms.map(
                                                (sym, idx) => (
                                                    <Tag
                                                        key={idx}
                                                        color="magenta"
                                                    >
                                                        {sym}
                                                    </Tag>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 ml-6">
                                            Không có triệu chứng
                                        </span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Empty description="Không tìm thấy chi tiết sự kiện." />
                        )}
                    </Card>
                </Modal>
            </div>
        </div>
    );
};

export default MedicalEvents;
