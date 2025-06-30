import {
    DownloadOutlined,
    PrinterOutlined,
    HeartOutlined,
} from "@ant-design/icons";
import { Button, Select, Space, Table, Typography, message, Spin } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";

const { Title } = Typography;

const HealthCheckupResults = () => {
    const [loading, setLoading] = useState(false);
    const [children, setChildren] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [checkupResults, setCheckupResults] = useState([]);

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
                        date: new Date(result.checkupDate).toLocaleDateString(),
                        height: `${result.height} cm`,
                        weight: `${result.weight} kg`,
                        bmi: (
                            result.weight /
                            (result.height / 100) ** 2
                        ).toFixed(1),
                        vision: result.vision || "N/A",
                        bloodPressure: result.bloodPressure || "N/A",
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
    ];

    const handleDownload = () => {
        message.success("Đang tải xuống kết quả khám sức khỏe...");
    };

    const handlePrint = () => {
        window.print();
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
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleDownload}
                        >
                            Tải xuống
                        </Button>
                        <Button
                            icon={<PrinterOutlined />}
                            onClick={handlePrint}
                        >
                            In
                        </Button>
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
        </div>
    );
};

export default HealthCheckupResults;
