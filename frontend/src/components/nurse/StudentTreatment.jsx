import {
    CheckOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    HistoryOutlined,
    MedicineBoxOutlined,
    WarningOutlined,
    CalendarOutlined,
    ScheduleOutlined,
    BellOutlined,
    UserOutlined,
    NotificationOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Tooltip,
    Typography,
    Timeline,
    Descriptions,
    List,
    Select,
    TimePicker,
    DatePicker,
    Switch,
    notification,
    Tabs,
    Progress,
    Drawer,
} from "antd";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

const StudentTreatment = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState(null);
    const [form] = Form.useForm();
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [historyData, setHistoryData] = useState({ logs: [], summary: {} });
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyTitle, setHistoryTitle] = useState("");
    const [summary, setSummary] = useState({});
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailRecord, setDetailRecord] = useState(null);
    const [errorModal, setErrorModal] = useState({
        visible: false,
        message: "",
    });
    const [notificationDrawerVisible, setNotificationDrawerVisible] =
        useState(false);
    const [scheduledTreatments, setScheduledTreatments] = useState([]);
    const [upcomingNotifications, setUpcomingNotifications] = useState([]);
    const [notificationInterval, setNotificationInterval] = useState(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        fetchTreatments();
        fetchScheduledTreatments();
        startNotificationCheck();

        return () => {
            if (notificationInterval) {
                clearInterval(notificationInterval);
            }
        };
    }, []);

    const startNotificationCheck = () => {
        const interval = setInterval(() => {
            checkUpcomingMedications();
        }, 60000); // Kiểm tra mỗi phút
        setNotificationInterval(interval);
    };

    const checkUpcomingMedications = () => {
        const now = new Date();
        const upcoming = scheduledTreatments.filter((treatment) => {
            if (!treatment.customTimes || treatment.customTimes.length === 0)
                return false;

            return treatment.customTimes.some((time) => {
                const [hours, minutes] = time.split(":").map(Number);
                const scheduledTime = new Date();
                scheduledTime.setHours(hours, minutes, 0, 0);

                const timeDiff = scheduledTime.getTime() - now.getTime();
                return timeDiff > 0 && timeDiff <= 300000; // 5 phút trước
            });
        });

        if (upcoming.length > 0) {
            upcoming.forEach((treatment) => {
                const times = treatment.customTimes.filter((time) => {
                    const [hours, minutes] = time.split(":").map(Number);
                    const scheduledTime = new Date();
                    scheduledTime.setHours(hours, minutes, 0, 0);

                    const timeDiff = scheduledTime.getTime() - now.getTime();
                    return timeDiff > 0 && timeDiff <= 300000;
                });

                if (times.length > 0) {
                    notification.warning({
                        message: "Đến giờ cấp phát thuốc phụ huynh gửi!",
                        description: `${treatment.studentName} - ${
                            treatment.medication.name
                        } lúc ${times.join(", ")}`,
                        duration: 0,
                        icon: <BellOutlined />,
                        onClick: () => {
                            setSelectedTreatment(treatment);
                            setIsModalVisible(true);
                        },
                    });
                }
            });
        }
    };

    const fetchScheduledTreatments = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                "/api/nurse/scheduled-treatments",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.data.success) {
                // Lọc chỉ những lịch có customTimes và cần cấp phát hôm nay
                const todayTreatments = response.data.data.filter(
                    (treatment) => {
                        if (
                            !treatment.customTimes ||
                            treatment.customTimes.length === 0
                        ) {
                            return false;
                        }

                        const now = new Date();
                        const currentTime =
                            now.getHours() * 60 + now.getMinutes();

                        // Kiểm tra xem có lịch nào cần cấp phát hôm nay không
                        return treatment.customTimes.some((time) => {
                            const [hours, minutes] = time
                                .split(":")
                                .map(Number);
                            const timeInMinutes = hours * 60 + minutes;
                            return timeInMinutes > currentTime; // Chỉ hiển thị những lịch chưa đến giờ
                        });
                    }
                );

                setScheduledTreatments(todayTreatments);
                setUpcomingNotifications(response.data.upcoming || []);
            }
        } catch (error) {
            console.error("Error fetching scheduled treatments:", error);
        }
    };

    const fetchTreatments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/nurse/student-treatments", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                setTreatments(response.data.data);
                setSummary(response.data.summary || {});
            } else {
                setTreatments([]);
                setSummary({});
            }
        } catch (error) {
            console.error("Error fetching treatments:", error);
            message.error("Lỗi khi tải danh sách điều trị");
            setTreatments([]);
            setSummary({});
        } finally {
            setLoading(false);
        }
    };

    const handleGiveMedication = (record) => {
        if (!record.canAdminister) {
            const reasons = record.warnings.join(", ");
            message.warning(`Không thể cấp phát thuốc: ${reasons}`);
            return;
        }
        setSelectedTreatment(record);
        const dosageNumber = parseFloat(record.dosage);
        form.setFieldsValue({
            quantityUsed: dosageNumber,
            dosageGiven: dosageNumber,
            notes: "",
        });
        setIsModalVisible(true);
    };

    const handleViewDetails = (record) => {
        setDetailRecord(record);
        setDetailModalVisible(true);
    };

    const handleViewHistory = async (record) => {
        setHistoryModalVisible(true);
        setHistoryLoading(true);
        setHistoryTitle(`${record.studentName} - ${record.medication.name}`);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `/api/nurse/medication-history/${record.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.data.success) {
                setHistoryData(response.data.data);
            } else {
                setHistoryData({ logs: [], summary: {} });
            }
        } catch (error) {
            setHistoryData({ logs: [], summary: {} });
            console.error("Error fetching medication history:", error);
            message.error("Lỗi khi lấy lịch sử cấp phát thuốc");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleStopTreatment = async (record) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `/api/nurse/student-treatments/${record.id}/stop`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            message.success("Đã dừng điều trị cho học sinh này");
            fetchTreatments();
        } catch {
            message.error("Lỗi khi dừng điều trị");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "available":
                return "green";
            case "low_stock":
                return "orange";
            case "out_of_stock":
                return "red";
            default:
                return "default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "available":
                return "Có sẵn";
            case "low_stock":
                return "Tồn kho thấp";
            case "out_of_stock":
                return "Hết hàng";
            default:
                return "Không xác định";
        }
    };

    const getFrequencyText = (frequency) => {
        const freqMap = {
            once: "1 lần/ngày",
            twice: "2 lần/ngày",
            three: "3 lần/ngày",
            four: "4 lần/ngày",
        };
        return freqMap[frequency] || frequency || "-";
    };

    const formatCustomTimes = (customTimes) => {
        if (
            !customTimes ||
            !Array.isArray(customTimes) ||
            customTimes.length === 0
        ) {
            return "Không có";
        }
        return customTimes.join(", ");
    };

    const getTimeUntilNext = (customTimes) => {
        if (!customTimes || customTimes.length === 0) return null;

        const now = new Date();
        const today = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        let nextTime = null;
        let minDiff = Infinity;

        customTimes.forEach((time) => {
            const [hours, minutes] = time.split(":").map(Number);
            const timeInMinutes = hours * 60 + minutes;
            const diff = timeInMinutes - currentTime;

            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                nextTime = time;
            }
        });

        if (nextTime) {
            const hours = Math.floor(minDiff / 60);
            const minutes = minDiff % 60;
            return { time: nextTime, hours, minutes };
        }

        return null;
    };

    const columns = [
        {
            title: "Học sinh",
            dataIndex: "studentName",
            key: "studentName",
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <Text type="secondary" className="text-xs">
                        {record.studentCode} - {record.grade} {record.class}
                    </Text>
                    <div className="mt-1">
                        <Tag color="blue" size="small">
                            <UserOutlined /> {record.parentName}
                        </Tag>
                    </div>
                </div>
            ),
        },
        {
            title: "Thuốc",
            dataIndex: "medication",
            key: "medication",
            render: (medication) => (
                <div>
                    <div className="font-medium">{medication.name}</div>
                    <Text type="secondary" className="text-xs">
                        Thuốc phụ huynh gửi: {medication.stockQuantity}{" "}
                        {medication.unit}
                    </Text>
                    <div className="mt-1">
                        <Tag
                            color={getStatusColor(medication.stockStatus)}
                            size="small"
                        >
                            {medication.stockStatus === "out_of_stock"
                                ? "Hết thuốc phụ huynh gửi"
                                : medication.stockStatus === "low_stock"
                                ? "Sắp hết thuốc phụ huynh gửi"
                                : "Còn thuốc phụ huynh gửi"}
                        </Tag>
                        {medication.expiryStatus === "expiring_soon" && (
                            <Tag color="orange" size="small">
                                Sắp hết hạn
                            </Tag>
                        )}
                        {medication.expiryStatus === "expired" && (
                            <Tag color="red" size="small">
                                Hết hạn
                            </Tag>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: "Liều lượng & Tần suất",
            dataIndex: "dosage",
            key: "dosage",
            render: (dosage, record) => {
                const timeUntilNext = record.timeUntilNext;
                return (
                    <div>
                        <div className="font-medium">{dosage}</div>
                        <Text type="secondary" className="text-xs">
                            {getFrequencyText(record.frequency)}
                        </Text>
                        <div className="mt-1">
                            <Text type="secondary" className="text-xs">
                                Hôm nay: {record.todayDosage} /{" "}
                                {record.dailyLimit}
                            </Text>
                        </div>
                        {record.customTimes &&
                            record.customTimes.length > 0 && (
                                <div className="mt-1">
                                    <Tag color="purple" size="small">
                                        <ClockCircleOutlined /> Giờ cấp phát:{" "}
                                        {formatCustomTimes(record.customTimes)}
                                    </Tag>
                                    {timeUntilNext && (
                                        <div className="mt-1">
                                            <Tag color="green" size="small">
                                                <BellOutlined /> Lần tiếp theo:{" "}
                                                {timeUntilNext.time} (
                                                {timeUntilNext.hours}h{" "}
                                                {timeUntilNext.minutes}m)
                                            </Tag>
                                        </div>
                                    )}
                                    <div className="mt-1">
                                        <Text
                                            type="secondary"
                                            className="text-xs"
                                        >
                                            Còn {record.customTimes.length} lần
                                            cấp phát hôm nay
                                        </Text>
                                    </div>
                                </div>
                            )}
                    </div>
                );
            },
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (_, record) => {
                const hasWarnings =
                    record.warnings && record.warnings.length > 0;
                const timeUntilNext = record.timeUntilNext;
                const isDueSoon =
                    timeUntilNext &&
                    timeUntilNext.hours === 0 &&
                    timeUntilNext.minutes <= 30;

                return (
                    <div>
                        <Tag
                            color={record.canAdminister ? "green" : "red"}
                            icon={
                                record.canAdminister ? (
                                    <CheckOutlined />
                                ) : (
                                    <WarningOutlined />
                                )
                            }
                        >
                            {record.canAdminister
                                ? "Có thể cấp phát"
                                : "Không thể cấp phát"}
                        </Tag>
                        {isDueSoon && (
                            <div className="mt-1">
                                <Tag color="red" size="small">
                                    <BellOutlined /> Đến giờ cấp phát!
                                </Tag>
                            </div>
                        )}
                        {hasWarnings && (
                            <div className="mt-1">
                                {record.warnings.map((warning, index) => (
                                    <Tag
                                        key={index}
                                        color="orange"
                                        size="small"
                                    >
                                        {warning}
                                    </Tag>
                                ))}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Thời gian",
            key: "timeInfo",
            render: (_, record) => (
                <div>
                    <div>
                        <Text type="secondary" className="text-xs">
                            Bắt đầu:{" "}
                            {dayjs(record.startDate).format("DD/MM/YYYY")}
                        </Text>
                    </div>
                    {record.endDate && (
                        <div>
                            <Text type="secondary" className="text-xs">
                                Kết thúc:{" "}
                                {dayjs(record.endDate).format("DD/MM/YYYY")}
                            </Text>
                        </div>
                    )}
                    {record.lastAdministration && (
                        <div>
                            <Tag color="blue" size="small">
                                <HistoryOutlined /> Lần cuối:{" "}
                                {dayjs(record.lastAdministration).format(
                                    "HH:mm DD/MM"
                                )}
                            </Tag>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => {
                const timeUntilNext = record.timeUntilNext;
                const isDueSoon =
                    timeUntilNext &&
                    timeUntilNext.hours === 0 &&
                    timeUntilNext.minutes <= 30;

                return (
                    <Space direction="vertical" size="small">
                        <Space>
                            <Tooltip title="Cấp phát thuốc">
                                <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleGiveMedication(record)}
                                    disabled={
                                        !record.canAdminister ||
                                        record.treatmentStatus !== "ONGOING"
                                    }
                                    size="small"
                                    danger={isDueSoon}
                                />
                            </Tooltip>
                            <Tooltip title="Xem chi tiết">
                                <Button
                                    icon={<EyeOutlined />}
                                    onClick={() => handleViewDetails(record)}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="Lịch sử cấp phát">
                                <Button
                                    icon={<HistoryOutlined />}
                                    onClick={() => handleViewHistory(record)}
                                    size="small"
                                />
                            </Tooltip>
                        </Space>
                        {record.treatmentStatus === "ONGOING" && (
                            <Popconfirm
                                title="Bạn chắc chắn muốn dừng điều trị học sinh này?"
                                onConfirm={() => handleStopTreatment(record)}
                                okText="Dừng"
                                cancelText="Hủy"
                            >
                                <Button danger type="dashed" size="small">
                                    Dừng điều trị
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                );
            },
        },
    ];

    const items = [
        {
            key: "treatments",
            label: "Danh sách điều trị",
            children: (
                <div className="space-y-6">
                    {/* Thống kê */}
                    {summary && Object.keys(summary).length > 0 && (
                        <Row gutter={16}>
                            <Col xs={24} sm={6}>
                                <Card>
                                    <Statistic
                                        title="Tổng số điều trị"
                                        value={summary.total || 0}
                                        prefix={<MedicineBoxOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={6}>
                                <Card>
                                    <Statistic
                                        title="Có thể cấp phát"
                                        value={summary.canAdminister || 0}
                                        valueStyle={{ color: "#52c41a" }}
                                        prefix={<CheckOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={6}>
                                <Card>
                                    <Statistic
                                        title="Cần chú ý"
                                        value={summary.needsAttention || 0}
                                        valueStyle={{ color: "#faad14" }}
                                        prefix={<WarningOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={6}>
                                <Card>
                                    <Statistic
                                        title="Đã cấp phát hôm nay"
                                        value={summary.administeredToday || 0}
                                        valueStyle={{ color: "#1890ff" }}
                                        prefix={<ClockCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    )}

                    <Card>
                        <Spin spinning={loading}>
                            <Table
                                dataSource={treatments}
                                columns={columns}
                                rowKey="id"
                                pagination={{
                                    pageSize: 10,
                                    showQuickJumper: true,
                                    showSizeChanger: true,
                                }}
                                scroll={{ x: 1200 }}
                            />
                        </Spin>
                    </Card>
                </div>
            ),
        },
        {
            key: "scheduled",
            label: (
                <span>
                    <BellOutlined /> Lịch cấp phát
                    {upcomingNotifications.length > 0 && (
                        <Badge
                            count={upcomingNotifications.length}
                            size="small"
                        />
                    )}
                </span>
            ),
            children: (
                <div className="space-y-6">
                    <Card>
                        <div className="mb-4">
                            <Title level={4}>Lịch cấp phát hôm nay</Title>
                            <Text type="secondary">
                                Danh sách các lịch cấp phát thuốc theo giờ
                            </Text>
                        </div>

                        {scheduledTreatments.length > 0 ? (
                            <List
                                dataSource={scheduledTreatments}
                                renderItem={(treatment) => {
                                    const timeUntilNext =
                                        treatment.timeUntilNext;
                                    const isDueSoon =
                                        timeUntilNext &&
                                        timeUntilNext.hours === 0 &&
                                        timeUntilNext.minutes <= 30;

                                    return (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    key="give"
                                                    type="primary"
                                                    size="small"
                                                    onClick={() =>
                                                        handleGiveMedication(
                                                            treatment
                                                        )
                                                    }
                                                    disabled={
                                                        !treatment.canAdminister
                                                    }
                                                    danger={isDueSoon}
                                                >
                                                    Cấp phát
                                                </Button>,
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={
                                                    <div className="flex items-center justify-between">
                                                        <span>
                                                            {
                                                                treatment.studentName
                                                            }
                                                        </span>
                                                        {isDueSoon && (
                                                            <Tag color="red">
                                                                <BellOutlined />{" "}
                                                                Đến giờ!
                                                            </Tag>
                                                        )}
                                                    </div>
                                                }
                                                description={
                                                    <div>
                                                        <div>
                                                            {
                                                                treatment
                                                                    .medication
                                                                    .name
                                                            }{" "}
                                                            - {treatment.dosage}
                                                        </div>
                                                        <div className="mt-1">
                                                            <Tag color="purple">
                                                                <ClockCircleOutlined />{" "}
                                                                {formatCustomTimes(
                                                                    treatment.customTimes
                                                                )}
                                                            </Tag>
                                                            {timeUntilNext && (
                                                                <Tag color="green">
                                                                    Lần tiếp
                                                                    theo:{" "}
                                                                    {
                                                                        timeUntilNext.time
                                                                    }
                                                                    (
                                                                    {
                                                                        timeUntilNext.hours
                                                                    }
                                                                    h{" "}
                                                                    {
                                                                        timeUntilNext.minutes
                                                                    }
                                                                    m)
                                                                </Tag>
                                                            )}
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </List.Item>
                                    );
                                }}
                            />
                        ) : (
                            <div className="text-center py-8">
                                <Text type="secondary">
                                    Không có lịch cấp phát thuốc phụ huynh gửi
                                    nào hôm nay
                                </Text>
                                <div className="mt-2">
                                    <Text type="secondary" className="text-xs">
                                        Phụ huynh cần gửi thuốc và y tá cần lên
                                        lịch cấp phát
                                    </Text>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            ),
        },
    ];

    // Đảm bảo có hàm handleSubmit cho form ghi nhận cấp phát thuốc:
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            const token = localStorage.getItem("token");

            const response = await axios.post(
                `/api/nurse/give-medicine/${selectedTreatment.id}`,
                {
                    quantityUsed: values.dosageGiven, // Gửi cùng giá trị
                    dosageGiven: values.dosageGiven,
                    notes: values.notes,
                    administrationTime: new Date().toISOString(),
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success) {
                message.success(
                    "Đã ghi nhận cấp phát thuốc phụ huynh gửi thành công"
                );

                // Hiển thị cảnh báo nếu có
                if (
                    response.data.warnings &&
                    response.data.warnings.length > 0
                ) {
                    Modal.warning({
                        title: "Cảnh báo",
                        content: (
                            <ul>
                                {response.data.warnings.map(
                                    (warning, index) => (
                                        <li key={index}>{warning}</li>
                                    )
                                )}
                            </ul>
                        ),
                    });
                }
            }

            setIsModalVisible(false);
            form.resetFields();
            setSelectedTreatment(null);
            fetchTreatments();
            fetchScheduledTreatments();
        } catch (error) {
            setIsModalVisible(false);
            setSelectedTreatment(null);
            setTimeout(() => {
                if (error.response?.data?.error) {
                    setErrorModal({
                        visible: true,
                        message: error.response.data.error,
                    });
                } else {
                    setErrorModal({
                        visible: true,
                        message: "Lỗi khi ghi nhận cấp phát thuốc",
                    });
                }
            }, 300);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2">
                        Cấp phát thuốc
                    </Title>
                    <Text type="secondary">
                        Quản lý cấp phát thuốc từ phụ huynh và lịch điều trị cho
                        học sinh
                    </Text>
                </div>
                <div className="flex space-x-2">
                    <Button
                        icon={<BellOutlined />}
                        onClick={() => setNotificationDrawerVisible(true)}
                        type="primary"
                    >
                        Lịch cấp phát hôm nay
                        {scheduledTreatments.length > 0 && (
                            <Badge count={scheduledTreatments.length} />
                        )}
                    </Button>
                </div>
            </div>

            {items[0].children}

            {/* Modal cấp phát thuốc */}
            <Modal
                title="Cấp phát thuốc cho học sinh"
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setSelectedTreatment(null);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                {selectedTreatment && (
                    <div className="mb-4">
                        <Alert
                            message={`Cấp phát thuốc cho ${selectedTreatment.studentName}`}
                            description={`Thuốc phụ huynh gửi: ${selectedTreatment.medication.name} - ${selectedTreatment.dosage} (Còn lại: ${selectedTreatment.medication.stockQuantity} ${selectedTreatment.medication.unit})`}
                            type="info"
                            showIcon
                        />
                        {selectedTreatment.customTimes &&
                            selectedTreatment.customTimes.length > 0 && (
                                <div className="mt-2">
                                    <Tag color="purple">
                                        <ClockCircleOutlined /> Giờ cấp phát:{" "}
                                        {formatCustomTimes(
                                            selectedTreatment.customTimes
                                        )}
                                    </Tag>
                                </div>
                            )}
                    </div>
                )}

                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="dosageGiven"
                        label={
                            <span>
                                Liều dùng thực tế
                                <span
                                    title="Số lượng thuốc thực tế đã cấp phát cho học sinh trong lần này. Mặc định bằng liều kê đơn."
                                    style={{
                                        marginLeft: 6,
                                        color: "#888",
                                        cursor: "help",
                                    }}
                                >
                                    ?
                                </span>
                            </span>
                        }
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập liều dùng",
                            },
                            {
                                type: "number",
                                min: 0.1,
                                message: "Liều dùng phải lớn hơn 0",
                            },
                        ]}
                    >
                        <InputNumber
                            min={0.1}
                            step={0.1}
                            style={{ width: "100%" }}
                            addonAfter={selectedTreatment?.medication?.unit}
                            defaultValue={selectedTreatment?.dosage}
                        />
                    </Form.Item>
                    <Form.Item name="notes" label="Ghi chú">
                        <TextArea
                            rows={4}
                            placeholder="Ghi chú về việc cấp phát thuốc, quan sát của học sinh, v.v."
                        />
                    </Form.Item>

                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => {
                                setIsModalVisible(false);
                                setSelectedTreatment(null);
                                form.resetFields();
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                        >
                            Ghi nhận cấp phát
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Modal chi tiết */}
            <Modal
                title="Chi tiết điều trị"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {detailRecord && (
                    <div>
                        <Descriptions title="Thông tin học sinh" bordered>
                            <Descriptions.Item label="Tên học sinh" span={2}>
                                {detailRecord.studentName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mã học sinh">
                                {detailRecord.studentCode}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lớp">
                                {detailRecord.grade} {detailRecord.class}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phụ huynh" span={2}>
                                {detailRecord.parentName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {detailRecord.parentPhone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tần suất">
                                {getFrequencyText(detailRecord.frequency)}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label="Giờ cấp phát cụ thể"
                                span={2}
                            >
                                {formatCustomTimes(detailRecord.customTimes)}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions title="Thông tin thuốc" bordered>
                            <Descriptions.Item label="Tên thuốc" span={2}>
                                {detailRecord.medication.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {detailRecord.medication.description ||
                                    "Không có"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Liều lượng">
                                {detailRecord.dosage}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tần suất">
                                {getFrequencyText(detailRecord.frequency)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giờ uống cụ thể">
                                {formatCustomTimes(detailRecord.customTimes)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tồn kho">
                                <Tag
                                    color={getStatusColor(
                                        detailRecord.medication.stockStatus
                                    )}
                                >
                                    {detailRecord.medication.stockQuantity}{" "}
                                    {detailRecord.medication.unit}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Hướng dẫn" span={3}>
                                {detailRecord.instructions || "Không có"}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions title="Thông tin điều trị" bordered>
                            <Descriptions.Item label="Ngày bắt đầu">
                                {dayjs(detailRecord.startDate).format(
                                    "DD/MM/YYYY"
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày kết thúc">
                                {detailRecord.endDate
                                    ? dayjs(detailRecord.endDate).format(
                                          "DD/MM/YYYY"
                                      )
                                    : "Không có"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={
                                        detailRecord.treatmentStatus ===
                                        "ONGOING"
                                            ? "green"
                                            : "red"
                                    }
                                >
                                    {detailRecord.treatmentStatus === "ONGOING"
                                        ? "Đang điều trị"
                                        : "Đã dừng"}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Liều dùng hôm nay">
                                {detailRecord.todayDosage} /{" "}
                                {detailRecord.dailyLimit}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lần cấp phát cuối">
                                {detailRecord.lastAdministration
                                    ? dayjs(
                                          detailRecord.lastAdministration
                                      ).format("HH:mm DD/MM/YYYY")
                                    : "Chưa có"}
                            </Descriptions.Item>
                        </Descriptions>

                        {detailRecord.warnings &&
                            detailRecord.warnings.length > 0 && (
                                <>
                                    <Divider />
                                    <Alert
                                        message="Cảnh báo"
                                        description={
                                            <ul>
                                                {detailRecord.warnings.map(
                                                    (warning, index) => (
                                                        <li key={index}>
                                                            {warning}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        }
                                        type="warning"
                                        showIcon
                                    />
                                </>
                            )}
                    </div>
                )}
            </Modal>

            {/* Modal lịch sử */}
            <Modal
                title={`Lịch sử cấp phát - ${historyTitle}`}
                open={historyModalVisible}
                onCancel={() => setHistoryModalVisible(false)}
                footer={null}
                width={800}
            >
                <Spin spinning={historyLoading}>
                    {historyData.logs && historyData.logs.length > 0 ? (
                        <Timeline>
                            {historyData.logs.map((log, index) => (
                                <Timeline.Item
                                    key={index}
                                    color="green"
                                    dot={<CheckOutlined />}
                                >
                                    <div>
                                        <div className="font-medium">
                                            {dayjs(log.givenAt).format(
                                                "HH:mm DD/MM/YYYY"
                                            )}
                                        </div>
                                        <Text type="secondary">
                                            Liều dùng: {log.dosageGiven} - Y tá:{" "}
                                            {log.nurse?.user?.fullName}
                                        </Text>
                                        {log.notes && (
                                            <div className="mt-2">
                                                <Text type="secondary">
                                                    Ghi chú: {log.notes}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    ) : (
                        <div className="text-center py-8">
                            <Text type="secondary">
                                Chưa có lịch sử cấp phát
                            </Text>
                        </div>
                    )}
                </Spin>
            </Modal>

            {/* Drawer lịch cấp phát hôm nay */}
            <Drawer
                title="Lịch cấp phát thuốc hôm nay"
                placement="right"
                onClose={() => setNotificationDrawerVisible(false)}
                open={notificationDrawerVisible}
                width={400}
            >
                <div className="space-y-4">
                    {scheduledTreatments.length > 0 ? (
                        scheduledTreatments.map((treatment, index) => {
                            const timeUntilNext = treatment.timeUntilNext;
                            const isDueSoon =
                                timeUntilNext &&
                                timeUntilNext.hours === 0 &&
                                timeUntilNext.minutes <= 30;

                            return (
                                <Card key={index} size="small">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium">
                                                {treatment.studentName}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {treatment.medication.name} -{" "}
                                                {treatment.dosage}
                                            </div>
                                            <div className="mt-1">
                                                <Tag color="purple">
                                                    <ClockCircleOutlined />{" "}
                                                    {formatCustomTimes(
                                                        treatment.customTimes
                                                    )}
                                                </Tag>
                                                {timeUntilNext && (
                                                    <Tag
                                                        color={
                                                            isDueSoon
                                                                ? "red"
                                                                : "green"
                                                        }
                                                        className="ml-1"
                                                    >
                                                        <BellOutlined /> Lần
                                                        tiếp theo:{" "}
                                                        {timeUntilNext.time}(
                                                        {timeUntilNext.hours}h{" "}
                                                        {timeUntilNext.minutes}
                                                        m)
                                                    </Tag>
                                                )}
                                            </div>
                                            {isDueSoon && (
                                                <div className="mt-1">
                                                    <Tag color="red">
                                                        <BellOutlined /> Đến giờ
                                                        cấp phát!
                                                    </Tag>
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            type="primary"
                                            size="small"
                                            danger={isDueSoon}
                                            onClick={() => {
                                                setSelectedTreatment(treatment);
                                                setIsModalVisible(true);
                                                setNotificationDrawerVisible(
                                                    false
                                                );
                                            }}
                                        >
                                            Cấp phát
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="text-center py-8">
                            <Text type="secondary">
                                Không có lịch cấp phát nào hôm nay
                            </Text>
                        </div>
                    )}
                </div>
            </Drawer>

            {/* Modal lỗi */}
            <Modal
                title="Lỗi"
                open={errorModal.visible}
                onCancel={() => setErrorModal({ visible: false, message: "" })}
                footer={[
                    <Button
                        key="ok"
                        onClick={() =>
                            setErrorModal({ visible: false, message: "" })
                        }
                    >
                        OK
                    </Button>,
                ]}
            >
                <p>{errorModal.message}</p>
            </Modal>
        </div>
    );
};

export default StudentTreatment;
