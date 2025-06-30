import {
    HeartOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import {
    Table,
    Typography,
    Select,
    Space,
    Tag,
    Tooltip,
    Spin,
    message,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { Title } = Typography;

const columns = [
    {
        title: "Ngày tiêm",
        dataIndex: "date",
        key: "date",
        width: 120,
    },
    {
        title: "Tên vaccine",
        dataIndex: "vaccineName",
        key: "vaccineName",
        width: 200,
        ellipsis: true,
        render: (text) => <Tooltip title={text}>{text}</Tooltip>,
    },
    {
        title: "Loại vaccine",
        dataIndex: "vaccineType",
        key: "vaccineType",
        width: 150,
    },
    {
        title: "Liều lượng",
        dataIndex: "dosage",
        key: "dosage",
        width: 120,
    },
    {
        title: "Đợt tiêm",
        dataIndex: "doseNumber",
        key: "doseNumber",
        width: 100,
        render: (text) => `Mũi ${text}`,
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 150,
        render: (status) => {
            let color = status === "COMPLETED" ? "success" : "processing";
            let icon =
                status === "COMPLETED" ? (
                    <CheckCircleOutlined />
                ) : (
                    <ClockCircleOutlined />
                );
            let text = status === "COMPLETED" ? "Đã hoàn thành" : "Đang chờ";

            return (
                <Tag icon={icon} color={color}>
                    {text}
                </Tag>
            );
        },
    },
    {
        title: "Ghi chú",
        dataIndex: "notes",
        key: "notes",
        ellipsis: true,
        render: (text) => <Tooltip title={text}>{text || "—"}</Tooltip>,
    },
];

const VaccinationHistory = () => {
    const [loading, setLoading] = useState(false);
    const [children, setChildren] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [vaccinations, setVaccinations] = useState([]);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchVaccinationHistory();
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

    const fetchVaccinationHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `/api/parents/students/${selectedStudent}/vaccination-history`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (response.data.success) {
                const formattedHistory = response.data.data.map(
                    (record, index) => ({
                        key: record.id || index,
                        date: new Date(
                            record.vaccinationDate
                        ).toLocaleDateString(),
                        vaccineName: record.vaccine?.name || "",
                        vaccineType: record.vaccine?.type || "",
                        dosage: record.dosage || "",
                        doseNumber: record.doseNumber || 1,
                        status: record.status || "PENDING",
                        notes: record.notes || "",
                    })
                );
                setVaccinations(formattedHistory);
            } else {
                setVaccinations([]);
            }
        } catch (error) {
            console.error("Error fetching vaccination history:", error);
            message.error("Không thể lấy lịch sử tiêm chủng");
            setVaccinations([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !vaccinations.length) {
        return (
            <div className="min-h-screen bg-[#f6fcfa] flex justify-center items-center">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6fcfa]">
            <div className="w-full max-w-5xl mx-auto px-4 pt-24">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <HeartOutlined className="text-[#36ae9a]" />
                        <span>Quản lý sức khỏe học sinh</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Lịch sử tiêm chủng
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Xem lại toàn bộ lịch sử tiêm chủng của học sinh để theo
                        dõi và đảm bảo đầy đủ các mũi tiêm cần thiết.
                    </p>
                </div>

                {/* Content */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <Title
                        level={2}
                        className="!text-[#36ae9a] !mb-0 text-center md:text-left"
                    >
                        Lịch sử tiêm chủng
                    </Title>
                    <Space>
                        <Select
                            style={{ width: 200 }}
                            value={selectedStudent}
                            onChange={setSelectedStudent}
                            options={children.map((child) => ({
                                value: child.studentId,
                                label: child.fullName,
                            }))}
                            placeholder="Chọn học sinh"
                        />
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={vaccinations}
                    pagination={{
                        pageSize: 10,
                        position: ["bottomCenter"],
                        showSizeChanger: false,
                    }}
                    className="rounded-xl"
                    style={{ padding: 12 }}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default VaccinationHistory;
