import {
    DownloadOutlined,
    PrinterOutlined,
    HeartOutlined,
} from "@ant-design/icons";
import {
    Button,
    Select,
    Space,
    Table,
    Typography,
    message,
    Spin,
    Modal,
    Descriptions,
} from "antd";
import { useState, useEffect } from "react";
import axios from "axios";

const { Title } = Typography;

const HealthCheckupResults = () => {
    const [loading, setLoading] = useState(false);
    const [children, setChildren] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [checkupResults, setCheckupResults] = useState([]);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedCheckup, setSelectedCheckup] = useState(null);

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchCheckupResults();
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
            title: "Thị lực",
            dataIndex: "vision",
            key: "vision",
        },
        {
            title: "Huyết áp",
            dataIndex: "bloodPressure",
            key: "bloodPressure",
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
                <Button
                    type="link"
                    onClick={() => {
                        setSelectedCheckup(record.raw);
                        setDetailModalVisible(true);
                    }}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    const handleDownload = () => {
        message.success("Đang tải xuống kết quả khám sức khỏe...");
    };

    const handlePrint = () => {
        window.print();
    };

    // Thêm hàm định dạng ngày giờ đẹp
    const formatDateTime = (dateStr) => {
        if (!dateStr) return "N/A";
        const d = new Date(dateStr);
        return `${d.getHours().toString().padStart(2, "0")}:${d
            .getMinutes()
            .toString()
            .padStart(2, "0")} ${d.getDate().toString().padStart(2, "0")}/${(
            d.getMonth() + 1
        )
            .toString()
            .padStart(2, "0")}/${d.getFullYear()}`;
    };

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
                    dataSource={checkupResults}
                    pagination={false}
                    className="rounded-xl"
                    style={{ padding: 12 }}
                />
            </div>
            {/* Modal xem chi tiết */}
            <Modal
                title={
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 20 }}>
                            Chi tiết báo cáo khám sức khỏe
                        </div>
                        <div
                            style={{
                                color: "#888",
                                fontSize: 14,
                                marginBottom: 8,
                            }}
                        >
                            Ngày khám:{" "}
                            {selectedCheckup?.scheduledDate
                                ? new Date(
                                      selectedCheckup.scheduledDate
                                  ).toLocaleDateString()
                                : "N/A"}
                        </div>
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={520}
            >
                {selectedCheckup && (
                    <div style={{ background: "#fff", borderRadius: 8 }}>
                        {/* Thông tin cơ bản */}
                        <div className="font-semibold mb-2">
                            Thông tin cơ bản
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                                Chiều cao:{" "}
                                <b>
                                    {selectedCheckup.height
                                        ? `${selectedCheckup.height} cm`
                                        : "N/A"}
                                </b>
                            </div>
                            <div>
                                Cân nặng:{" "}
                                <b>
                                    {selectedCheckup.weight
                                        ? `${selectedCheckup.weight} kg`
                                        : "N/A"}
                                </b>
                            </div>
                            <div>
                                Huyết áp:{" "}
                                <b>
                                    {selectedCheckup.systolicBP &&
                                    selectedCheckup.diastolicBP
                                        ? `${selectedCheckup.systolicBP}/${selectedCheckup.diastolicBP} mmHg`
                                        : "N/A"}
                                </b>
                            </div>
                            <div>
                                Phân loại thể lực:{" "}
                                <b>
                                    {selectedCheckup.physicalClassification ||
                                        "N/A"}
                                </b>
                            </div>
                        </div>
                        {/* Thị lực */}
                        <div className="font-semibold mb-2">Thị lực</div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                                Phải (không kính):{" "}
                                <b>
                                    {selectedCheckup.visionRightNoGlasses ||
                                        "N/A"}
                                </b>
                            </div>
                            <div>
                                Trái (không kính):{" "}
                                <b>
                                    {selectedCheckup.visionLeftNoGlasses ||
                                        "N/A"}
                                </b>
                            </div>
                            <div>
                                Phải (có kính):{" "}
                                <b>
                                    {selectedCheckup.visionRightWithGlasses ||
                                        "N/A"}
                                </b>
                            </div>
                            <div>
                                Trái (có kính):{" "}
                                <b>
                                    {selectedCheckup.visionLeftWithGlasses ||
                                        "N/A"}
                                </b>
                            </div>
                        </div>
                        {/* Thính lực */}
                        <div className="font-semibold mb-2">Thính lực</div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                                Trái (bình thường):{" "}
                                <b>
                                    {selectedCheckup.hearingLeftNormal || "N/A"}
                                </b>
                            </div>
                            <div>
                                Phải (bình thường):{" "}
                                <b>
                                    {selectedCheckup.hearingRightNormal ||
                                        "N/A"}
                                </b>
                            </div>
                            <div>
                                Trái (thì thầm):{" "}
                                <b>
                                    {selectedCheckup.hearingLeftWhisper ||
                                        "N/A"}
                                </b>
                            </div>
                            <div>
                                Phải (thì thầm):{" "}
                                <b>
                                    {selectedCheckup.hearingRightWhisper ||
                                        "N/A"}
                                </b>
                            </div>
                        </div>
                        {/* Răng miệng */}
                        <div className="font-semibold mb-2">Răng miệng</div>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                                Hàm trên:{" "}
                                <b>{selectedCheckup.dentalUpperJaw || "N/A"}</b>
                            </div>
                            <div>
                                Hàm dưới:{" "}
                                <b>{selectedCheckup.dentalLowerJaw || "N/A"}</b>
                            </div>
                        </div>
                        {/* Đánh giá tổng thể */}
                        <div className="font-semibold mb-2">
                            Đánh giá tổng thể
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                                Sức khỏe tổng thể:{" "}
                                <b>
                                    {selectedCheckup.overallHealth === "NORMAL"
                                        ? "Bình thường"
                                        : selectedCheckup.overallHealth ===
                                          "NEEDS_ATTENTION"
                                        ? "Cần chú ý"
                                        : selectedCheckup.overallHealth ===
                                          "REQUIRES_TREATMENT"
                                        ? "Cần điều trị"
                                        : selectedCheckup.overallHealth ||
                                          "N/A"}
                                </b>
                            </div>
                            <div>
                                Khuyến nghị:{" "}
                                <b>
                                    {selectedCheckup.recommendations || "N/A"}
                                </b>
                            </div>
                            <div>
                                Lịch tư vấn:{" "}
                                <b>
                                    {selectedCheckup.consultationStart &&
                                    selectedCheckup.consultationEnd
                                        ? `Từ ${formatDateTime(
                                              selectedCheckup.consultationStart
                                          )} đến ${formatDateTime(
                                              selectedCheckup.consultationEnd
                                          )}`
                                        : "Chưa có lịch tư vấn"}
                                </b>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HealthCheckupResults;
