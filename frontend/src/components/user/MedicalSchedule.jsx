import {
    HeartOutlined,
    MedicineBoxOutlined,
    ScheduleOutlined,
} from "@ant-design/icons";
import { Button, Select, Space, Spin, Table, Tabs, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api, { parentAPI } from "../../utils/api";
import MedicalCampaignDetailModal from "../parent/MedicalCampaignDetailModal";
import VaccinationDetailModal from "../parent/VaccinationDetailModal";

const { Title } = Typography;

const MedicalSchedule = () => {
    const [tab, setTab] = useState("vaccination");
    const [loading, setLoading] = useState(false);
    const [vaccinationRecords, setVaccinationRecords] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [selected, setSelected] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [selectedMedicalCampaign, setSelectedMedicalCampaign] =
        useState(null);
    const [medicalModalVisible, setMedicalModalVisible] = useState(false);
    const [medicalDetail, setMedicalDetail] = useState(null);

    const location = useLocation();

    // Lấy danh sách học sinh
    useEffect(() => {
        parentAPI.getChildren().then((res) => {
            if (res.data.success) {
                const options = res.data.data.map((child) => ({
                    value: child.studentId,
                    label: child.fullName,
                    class: child.class,
                }));
                setChildren(options);

                // Lưu danh sách children vào localStorage để sử dụng cho notification navigation
                localStorage.setItem("children", JSON.stringify(res.data.data));

                // Chỉ set học sinh đầu tiên nếu không có selectedStudentId từ state
                if (options.length > 0 && !location.state?.selectedStudentId) {
                    setSelectedChild(options[0].value);
                }
            }
        });
    }, [location.state?.selectedStudentId]);

    // Nếu nhận state scrollToMedicalTab, tự động chuyển tab
    useEffect(() => {
        if (location.state && location.state.scrollToMedicalTab) {
            setTab("medical");
        }
        // Nếu có selectedStudentId thì tự động chọn học sinh đó
        if (location.state && location.state.selectedStudentId) {
            setSelectedChild(location.state.selectedStudentId);
        }
    }, [location.state]);

    // Lấy lịch tiêm chủng
    useEffect(() => {
        if (tab === "vaccination" && selectedChild) {
            setLoading(true);
            parentAPI
                .getVaccinationCampaigns(selectedChild)
                .then((res) => {
                    setVaccinationRecords(res.data.data || []);
                })
                .finally(() => setLoading(false));
        }
    }, [tab, selectedChild]);

    // Lấy lịch khám sức khỏe
    useEffect(() => {
        if (tab === "medical") {
            setLoading(true);
            api.get("/medical-campaigns")
                .then((res) => {
                    setMedicalRecords(res.data.data || []);
                })
                .finally(() => setLoading(false));
        }
    }, [tab]);

    // Hàm lấy chi tiết tiêm chủng cho modal
    const fetchVaccinationDetail = async (campaignId, studentId) => {
        try {
            setLoading(true);
            const res = await parentAPI.getVaccinationDetail(
                campaignId,
                studentId
            );
            if (res.data.success) {
                setSelected(res.data.data);
                setModalVisible(true);
            }
        } catch (e) {
            // Không mở modal nếu không có dữ liệu
            setSelected(null);
            setModalVisible(false);
        } finally {
            setLoading(false);
        }
    };

    // Hàm lấy chi tiết chiến dịch khám sức khỏe
    const fetchMedicalCampaignDetail = async (campaignId) => {
        try {
            setLoading(true);
            const res = await api.get(`/medical-campaigns/${campaignId}`);
            if (res.data.success) {
                setMedicalDetail(res.data.data);
                setMedicalModalVisible(true);
            }
        } catch (e) {
            setMedicalDetail(null);
            setMedicalModalVisible(false);
        } finally {
            setLoading(false);
        }
    };

    // Cột bảng cho lịch tiêm chủng
    const vaccinationColumns = [
        {
            title: "Tên chiến dịch",
            dataIndex: "name",
            key: "name",
            width: 200,
            ellipsis: true,
        },
        {
            title: "Loại vắc xin",
            key: "vaccineName",
            width: 180,
            render: (record) => record.vaccineName || "-",
        },
        {
            title: "Ngày bắt đầu",
            dataIndex: "scheduledDate",
            key: "scheduledDate",
            align: "center",
            width: 120,
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "deadline",
            key: "deadline",
            align: "center",
            width: 120,
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 120,
            render: (status) => {
                switch (status) {
                    case "ACTIVE":
                        return "Đang diễn ra";
                    case "FINISHED":
                        return "Đã kết thúc";
                    case "CANCELLED":
                        return "Đã hủy";
                    case "SCHEDULED":
                        return "Đã lên lịch";
                    default:
                        return status || "-";
                }
            },
        },
        {
            title: "Chi tiết",
            key: "action",
            align: "center",
            width: 100,
            render: (record) => (
                <Button
                    type="link"
                    onClick={() =>
                        fetchVaccinationDetail(record.id, selectedChild)
                    }
                    style={{ color: "#36ae9a" }}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    // Cột bảng cho lịch khám sức khỏe
    const medicalColumns = [
        {
            title: "Ngày dự kiến",
            dataIndex: "scheduledDate",
            key: "scheduledDate",
            align: "center",
            width: 120,
            render: (date) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Tên chiến dịch",
            dataIndex: "name",
            key: "name",
            width: 200,
            ellipsis: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            align: "center",
            width: 120,
            render: (status) => {
                switch (status) {
                    case "ACTIVE":
                        return "Đang diễn ra";
                    case "FINISHED":
                        return "Đã kết thúc";
                    case "CANCELLED":
                        return "Đã hủy";
                    case "SCHEDULED":
                        return "Đã lên lịch";
                    default:
                        return status || "-";
                }
            },
        },
        {
            title: "Chi tiết",
            key: "action",
            align: "center",
            width: 100,
            render: (record) => (
                <Button
                    type="link"
                    onClick={() => fetchMedicalCampaignDetail(record.id)}
                    style={{ color: "#36ae9a" }}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#f6fcfa]">
            <div className="w-full max-w-5xl mx-auto px-4 pt-24">
                <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-2">
                        <HeartOutlined className="text-[#36ae9a]" />
                        <span>Quản lý sức khỏe học sinh</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Lịch tiêm và khám
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Xem lịch tiêm chủng và lịch khám sức khỏe của học sinh
                        để theo dõi quá trình bảo vệ sức khỏe.
                    </p>
                </div>
                <Tabs
                    activeKey={tab}
                    onChange={setTab}
                    items={[
                        {
                            key: "vaccination",
                            label: (
                                <span>
                                    <MedicineBoxOutlined /> Lịch tiêm chủng
                                </span>
                            ),
                            children: (
                                <>
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                                        <Title
                                            level={2}
                                            className="!text-[#36ae9a] !mb-0 text-center md:text-left"
                                        >
                                            Lịch tiêm chủng
                                        </Title>
                                        <Space>
                                            <Select
                                                style={{
                                                    width: 320,
                                                    minWidth: 220,
                                                }}
                                                dropdownStyle={{
                                                    borderRadius: 18,
                                                    boxShadow:
                                                        "0 8px 32px rgba(54, 174, 154, 0.15)",
                                                }}
                                                dropdownClassName="custom-student-dropdown"
                                                value={selectedChild}
                                                onChange={setSelectedChild}
                                                placeholder="Chọn học sinh"
                                                size="large"
                                            >
                                                {children.map((child) => (
                                                    <Select.Option
                                                        key={child.value}
                                                        value={child.value}
                                                        className="!py-3 !px-5 !text-lg hover:bg-[#e8f5f2]"
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 14,
                                                        }}
                                                    >
                                                        <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                                                            {child.label} -{" "}
                                                            {child.class}
                                                        </span>
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Space>
                                    </div>
                                    {loading ? (
                                        <div
                                            style={{
                                                padding: "24px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <Spin
                                                size="large"
                                                tip="Đang tải dữ liệu..."
                                            />
                                        </div>
                                    ) : (
                                        <Table
                                            dataSource={vaccinationRecords}
                                            columns={vaccinationColumns}
                                            rowKey="id"
                                            locale={{
                                                emptyText: "Không có dữ liệu",
                                            }}
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
                                    {modalVisible && (
                                        <VaccinationDetailModal
                                            visible={modalVisible}
                                            vaccination={selected}
                                            onClose={() =>
                                                setModalVisible(false)
                                            }
                                        />
                                    )}
                                </>
                            ),
                        },
                        {
                            key: "medical",
                            label: (
                                <span>
                                    <ScheduleOutlined /> Lịch khám sức khỏe
                                </span>
                            ),
                            children: (
                                <>
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                                        <Title
                                            level={2}
                                            className="!text-[#36ae9a] !mb-0 text-center md:text-left"
                                        >
                                            Lịch khám sức khỏe
                                        </Title>
                                    </div>
                                    {loading ? (
                                        <div
                                            style={{
                                                padding: "24px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <Spin
                                                size="large"
                                                tip="Đang tải dữ liệu..."
                                            />
                                        </div>
                                    ) : (
                                        <Table
                                            dataSource={medicalRecords}
                                            columns={medicalColumns}
                                            rowKey="id"
                                            locale={{
                                                emptyText: "Không có dữ liệu",
                                            }}
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
                                    {medicalModalVisible && (
                                        <MedicalCampaignDetailModal
                                            visible={medicalModalVisible}
                                            campaign={medicalDetail}
                                            onClose={() =>
                                                setMedicalModalVisible(false)
                                            }
                                        />
                                    )}
                                </>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default MedicalSchedule;
