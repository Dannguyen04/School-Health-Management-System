import { CalendarOutlined, HistoryOutlined } from "@ant-design/icons";
import {
    Card,
    Spin,
    Table,
    Tabs,
    Tooltip,
    Typography,
    Select,
    Space,
    message,
    Empty,
} from "antd";
import { useEffect, useState } from "react";
import { parentAPI } from "../../utils/api";

const { TabPane } = Tabs;
const { Title } = Typography;

const columns = [
    {
        title: "Ngày",
        dataIndex: "date",
        key: "date",
        align: "center",
        width: 110,
    },
    {
        title: "Hạn chót",
        dataIndex: "deadline",
        key: "deadline",
        align: "center",
        width: 110,
    },
    {
        title: "Loại",
        dataIndex: "type",
        key: "type",
        align: "center",
        width: 120,
    },
    {
        title: "Tên vaccine",
        dataIndex: "vaccineName",
        key: "vaccineName",
        width: 180,
        ellipsis: true,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
        width: 220,
        ellipsis: true,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        align: "center",
        width: 160,
        render: (status) => {
            const style = {
                fontWeight: 600,
                fontSize: 15,
                padding: "6px 12px",
                borderRadius: 12,
                display: "inline-block",
                minWidth: 0,
                textAlign: "center",
                whiteSpace: "nowrap",
            };

            if (status === "ACTIVE" || status === "Scheduled") {
                return (
                    <span
                        style={{
                            ...style,
                            background: "#e6f0fd",
                            color: "#1976d2",
                        }}
                    >
                        Đang diễn ra
                    </span>
                );
            } else {
                return (
                    <span
                        style={{
                            ...style,
                            background: "#e6f7ec",
                            color: "#2e7d32",
                        }}
                    >
                        Hoàn tất
                    </span>
                );
            }
        },
    },
];

const VaccinationSchedule = () => {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [children, setChildren] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchCampaigns();
        }
    }, [selectedStudent]);

    const fetchChildren = async () => {
        try {
            setLoading(true);
            const response = await parentAPI.getChildren();
            if (response?.data?.success) {
                const childrenData = response.data.data || [];
                setChildren(childrenData);
                if (childrenData.length > 0) {
                    const firstChild = childrenData[0];
                    setSelectedStudent(firstChild.id || firstChild.studentId);
                }
            } else {
                message.error(
                    response?.data?.message ||
                        "Không thể lấy danh sách học sinh"
                );
            }
        } catch (error) {
            console.error("Error fetching children:", error);
            message.error("Không thể lấy danh sách học sinh");
        } finally {
            setLoading(false);
        }
    };

    const fetchCampaigns = async () => {
        if (!selectedStudent) return;

        setLoading(true);
        try {
            const response = await parentAPI.getVaccinationCampaigns(
                selectedStudent
            );

            if (response?.data?.success && Array.isArray(response.data.data)) {
                const mapped = response.data.data.map((item, idx) => ({
                    key: item.id || idx,
                    date: item.scheduledDate
                        ? new Date(item.scheduledDate).toLocaleDateString(
                              "vi-VN"
                          )
                        : "",
                    deadline: item.deadline
                        ? new Date(item.deadline).toLocaleDateString("vi-VN")
                        : "",
                    vaccineName: item.vaccine?.name || "",
                    type: "Tiêm chủng",
                    description: item.description || item.name || "",
                    status: item.status || "ACTIVE",
                }));
                setRecords(mapped);
            } else {
                setRecords([]);
                if (response?.data?.message) {
                    message.warning(response.data.message);
                }
            }
        } catch (error) {
            console.error("Error fetching vaccination campaigns:", error);
            message.error("Không thể lấy lịch tiêm chủng");
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentChange = (value) => {
        setSelectedStudent(value);
    };

    if (loading && !records.length) {
        return (
            <div className="min-h-screen bg-[#f6fcfa] flex justify-center items-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6fcfa]">
            <div className="w-full max-w-5xl mx-auto px-4 pt-24">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <CalendarOutlined />
                        <span>Lịch tiêm chủng</span>
                    </div>
                    <Title level={2} className="!mb-0">
                        Lịch tiêm chủng của học sinh
                    </Title>
                </div>

                <Card className="mb-8">
                    <div className="mb-4">
                        <Space>
                            <span>Chọn học sinh:</span>
                            <Select
                                value={selectedStudent}
                                onChange={handleStudentChange}
                                style={{ width: 200 }}
                                loading={loading}
                                placeholder="Chọn học sinh"
                            >
                                {children.map((child) => (
                                    <Select.Option
                                        key={child.id || child.studentId}
                                        value={child.id || child.studentId}
                                    >
                                        {child.fullName || child.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Space>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={records}
                        loading={loading}
                        locale={{
                            emptyText: <Empty description="Không có dữ liệu" />,
                        }}
                        pagination={{
                            pageSize: 5,
                            showTotal: (total) => `Tổng số ${total} mục`,
                        }}
                    />
                </Card>
            </div>
        </div>
    );
};

export default VaccinationSchedule;
