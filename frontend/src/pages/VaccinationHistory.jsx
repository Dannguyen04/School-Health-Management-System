import { useEffect, useState } from "react";
import { Table, Button, Typography, Card, Spin } from "antd";
import VaccinationDetailModal from "../components/parent/VaccinationDetailModal";
import { parentAPI } from "../utils/api";
import dayjs from "dayjs";

const { Title } = Typography;

const VaccinationHistory = () => {
    const [vaccinations, setVaccinations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

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
    }, []);

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

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa]">
                <div className="w-full max-w-5xl mx-auto px-4">
                    <div style={{ padding: "24px", textAlign: "center" }}>
                        <Spin size="large" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa]">
            <div className="w-full max-w-5xl mx-auto px-4">
                <Card
                    className="w-full rounded-3xl shadow-lg border-0 mt-12"
                    style={{
                        background: "#fff",
                        borderRadius: "1.5rem",
                        boxShadow: "0px 3px 16px rgba(0,0,0,0.10)",
                        padding: "2rem",
                        marginTop: "3rem",
                        maxWidth: "100%",
                    }}
                >
                    <Title
                        level={2}
                        className="text-2xl font-bold text-[#36ae9a] mb-6 text-center"
                    >
                        Lịch sử tiêm chủng
                    </Title>

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
                </Card>
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
