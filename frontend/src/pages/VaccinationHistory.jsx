import { useEffect, useState } from "react";
import { Table, Button, Typography, Spin, Select, Space } from "antd";
import VaccinationDetailModal from "../components/parent/VaccinationDetailModal";
import { parentAPI } from "../utils/api";
import dayjs from "dayjs";
import { HeartOutlined } from "@ant-design/icons";

const { Title } = Typography;

const VaccinationHistory = () => {
    const [vaccinations, setVaccinations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    // Giả lập danh sách học sinh
    const [children] = useState([
        { value: "child1", label: "Nguyễn Văn A" },
        { value: "child2", label: "Nguyễn Văn B" },
    ]);
    const [selectedChild, setSelectedChild] = useState("child1");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await parentAPI.getVaccinationHistory();
                if (res.data.success) setVaccinations(res.data.data);
            } catch (error) {
                console.error("Error fetching vaccination history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedChild]);

    const columns = [
        {
            title: "Ngày tiêm",
            dataIndex: "administeredDate",
            key: "administeredDate",
            align: "center",
            width: 120,
            render: (date) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Tên chiến dịch",
            dataIndex: ["campaign", "name"],
            key: "campaignName",
            width: 200,
            ellipsis: true,
        },
        {
            title: "Loại liều",
            dataIndex: "dose",
            key: "dose",
            align: "center",
            width: 120,
            render: (dose) => {
                switch (dose) {
                    case "FIRST":
                        return "Liều đầu tiên";
                    case "SECOND":
                        return "Liều thứ hai";
                    case "BOOSTER":
                        return "Liều nhắc lại";
                    default:
                        return dose;
                }
            },
        },
        {
            title: "Y tá thực hiện",
            dataIndex: ["nurse", "user", "fullName"],
            key: "nurseName",
            width: 150,
            ellipsis: true,
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            width: 120,
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                        setSelected(record);
                        setModalVisible(true);
                    }}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#f6fcfa]">
            <div className="w-full max-w-5xl mx-auto px-4 pt-24">
                {/* Header theo mẫu HealthProfile */}
                <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-2">
                        <HeartOutlined className="text-[#36ae9a]" />
                        <span>Quản lý sức khỏe học sinh</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Lịch sử tiêm chủng
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Xem lại toàn bộ lịch sử tiêm chủng của học sinh để theo
                        dõi quá trình bảo vệ sức khỏe.
                    </p>
                </div>
                {/* Bỏ Card, chỉ giữ Select và Table */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                    <Title
                        level={2}
                        className="!text-[#36ae9a] !mb-0 text-center md:text-left"
                    >
                        Lịch sử tiêm chủng
                    </Title>
                    <Space>
                        <Select
                            style={{ width: 200 }}
                            value={selectedChild}
                            onChange={setSelectedChild}
                            options={children}
                        />
                    </Space>
                </div>
                {loading ? (
                    <div style={{ padding: "24px", textAlign: "center" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        dataSource={vaccinations}
                        columns={columns}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} bản ghi`,
                        }}
                        className="rounded-xl"
                        style={{ padding: 12 }}
                    />
                )}
            </div>
            <VaccinationDetailModal
                visible={modalVisible}
                vaccination={selected}
                onClose={() => setModalVisible(false)}
            />
        </div>
    );
};

export default VaccinationHistory;
