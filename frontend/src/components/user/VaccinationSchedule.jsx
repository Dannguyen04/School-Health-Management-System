import { CalendarOutlined, HistoryOutlined } from "@ant-design/icons";
import { Card, Spin, Table, Tabs, Tooltip } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { TabPane } = Tabs;

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
        render: (text) => {
            if (text === "Scheduled") {
                return (
                    <span
                        style={{
                            background: "#e6f0fd",
                            color: "#1976d2",
                            fontWeight: 600,
                            fontSize: 15,
                            padding: "6px 12px",
                            borderRadius: 12,
                            display: "inline-block",
                            minWidth: 0,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Đang diễn ra
                    </span>
                );
            } else {
                return (
                    <span
                        style={{
                            background: "#e6f7ec",
                            color: "#2e7d32",
                            fontWeight: 600,
                            fontSize: 15,
                            padding: "6px 12px",
                            borderRadius: 12,
                            display: "inline-block",
                            minWidth: 0,
                            textAlign: "center",
                            whiteSpace: "nowrap",
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
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "/api/parents/vaccination-campaigns",
                    {
                        headers: {
                            Authorization: token
                                ? `Bearer ${token}`
                                : undefined,
                        },
                    }
                );
                if (
                    res.data &&
                    res.data.success &&
                    Array.isArray(res.data.data)
                ) {
                    const mapped = res.data.data.map((item, idx) => ({
                        key: item.id || idx,
                        date: item.scheduledDate
                            ? new Date(item.scheduledDate).toLocaleDateString()
                            : "",
                        deadline: item.deadline
                            ? new Date(item.deadline).toLocaleDateString()
                            : "",
                        vaccineName: item.vaccine?.name || "",
                        type: "Vaccination",
                        description: item.name || "",
                        status:
                            item.status === "ACTIVE"
                                ? "Scheduled"
                                : "Completed",
                    }));
                    setRecords(mapped);
                } else {
                    setRecords([]);
                }
            } catch {
                setRecords([]);
            }
            setLoading(false);
        };
        fetchCampaigns();
    }, []);

    return (
        <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa] ">
            <div className="w-full max-w-5xl mx-auto px-4">
                <Card
                    className="w-full rounded-3xl shadow-lg border-0 mt-12"
                    style={{
                        background: "#fff",
                        borderRadius: "1.5rem",
                        boxShadow: "0px 3px 16px rgba(0,0,0,0.10)",
                        padding: "2rem",
                        marginTop: "3rem",
                        width: "100%",
                        maxWidth: "100%",
                    }}
                >
                    <h2 className="text-2xl font-bold text-[#36ae9a] mb-6 text-center">
                        Lịch tiêm & khám của học sinh
                    </h2>
                    <Tabs defaultActiveKey="1" centered>
                        <TabPane
                            tab={
                                <span>
                                    <CalendarOutlined /> Lịch sắp tới
                                </span>
                            }
                            key="1"
                        >
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Spin />
                                </div>
                            ) : (
                                <Table
                                    dataSource={records.filter(
                                        (r) => r.status === "Scheduled"
                                    )}
                                    columns={columns}
                                    pagination={false}
                                    className="rounded-xl"
                                    style={{ padding: 12 }}
                                />
                            )}
                        </TabPane>
                        <TabPane
                            tab={
                                <span>
                                    <HistoryOutlined /> Lịch sử
                                </span>
                            }
                            key="2"
                        >
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Spin />
                                </div>
                            ) : (
                                <Table
                                    dataSource={records.filter(
                                        (r) => r.status === "Completed"
                                    )}
                                    columns={columns}
                                    pagination={false}
                                    className="rounded-xl"
                                    style={{ padding: 12 }}
                                />
                            )}
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};

export default VaccinationSchedule;
