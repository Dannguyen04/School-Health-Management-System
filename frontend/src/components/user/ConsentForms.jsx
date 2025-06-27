import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    message,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    Tabs,
    Input,
    Modal,
    Form,
} from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";

const { Title, Text } = Typography;
const { TextArea } = Input;

const requirementMap = {
    REQUIRED: "Bắt buộc",
    OPTIONAL: "Tùy chọn",
};

const doseMap = {
    FIRST: "Liều đầu tiên",
    SECOND: "Liều thứ hai",
    BOOSTER: "Liều nhắc lại",
};

const statusMap = {
    UNSCHEDULED: { color: "default", text: "Chưa lên lịch" },
    SCHEDULED: { color: "processing", text: "Đã lên lịch" },
    COMPLETED: { color: "success", text: "Đã tiêm" },
    POSTPONED: { color: "warning", text: "Hoãn" },
    CANCELLED: { color: "error", text: "Hủy" },
};

const VaccineConsentForm = () => {
    const { user } = useAuth();
    const [selectedChild, setSelectedChild] = useState(null);
    const [children, setChildren] = useState([]);
    const [vaccinationCampaigns, setVaccinationCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [consentModal, setConsentModal] = useState({
        visible: false,
        campaign: null,
        consent: null,
        studentId: null,
    });

    // Get auth token
    const getAuthToken = () => {
        return localStorage.getItem("token");
    };

    // API headers
    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
    });

    // Fetch children of parent
    const fetchChildren = async () => {
        try {
            const response = await axios.get("/api/parents/my-children", {
                headers: getHeaders(),
            });
            if (response.data.success) {
                setChildren(response.data.data || []);
                if (response.data.data && response.data.data.length > 0) {
                    setSelectedChild(response.data.data[0].id);
                }
            }
        } catch (error) {
            console.error("Error fetching children:", error);
            message.error("Không thể tải danh sách con em");
        }
    };

    // Fetch vaccination campaigns
    const fetchVaccinationCampaigns = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "/api/parents/vaccination-campaigns",
                {
                    headers: getHeaders(),
                }
            );
            if (response.data.success) {
                setVaccinationCampaigns(response.data.data || []);
                console.log("Fetched campaigns:", response.data.data);
            }
        } catch (error) {
            console.error("Error fetching vaccination campaigns:", error);
            message.error("Không thể tải danh sách chiến dịch tiêm chủng");
        } finally {
            setLoading(false);
        }
    };

    // Submit consent
    const submitConsent = async (campaignId, studentId, consent, notes) => {
        try {
            const response = await axios.post(
                `/api/manager/vaccination-campaigns/${campaignId}/consent`,
                {
                    campaignId,
                    studentId: studentId,
                    consent,
                    notes,
                },
                { headers: getHeaders() }
            );

            if (response.data.success) {
                message.success(response.data.message);
                fetchVaccinationCampaigns(); // Refresh data
                setConsentModal({
                    visible: false,
                    campaign: null,
                    consent: null,
                    studentId: null,
                });
            } else {
                message.error(
                    response.data.error || "Không thể gửi phiếu đồng ý"
                );
            }
        } catch (error) {
            console.error("Error submitting consent:", error);
            message.error(
                error.response?.data?.error || "Không thể gửi phiếu đồng ý"
            );
        }
    };

    const handleConsentClick = (campaign, studentId, consent) => {
        setConsentModal({ visible: true, campaign, consent, studentId });
    };

    const handleConsentModalOk = () => {
        const { campaign, consent, studentId } = consentModal;
        if (campaign && consent !== null && studentId) {
            submitConsent(campaign.id, studentId, consent, "");
        }
    };

    const handleConsentModalCancel = () => {
        setConsentModal({
            visible: false,
            campaign: null,
            consent: null,
            studentId: null,
        });
    };

    const getConsentTag = (consent) => {
        if (consent === true) return <Tag color="success">Đã đồng ý</Tag>;
        if (consent === false) return <Tag color="error">Không đồng ý</Tag>;
        return <Tag color="warning">Chưa xác nhận</Tag>;
    };

    useEffect(() => {
        fetchChildren();
    }, []);

    useEffect(() => {
        fetchVaccinationCampaigns();
    }, []);

    const vaccinationColumns = [
        {
            title: "Tên chiến dịch",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Vắc xin",
            dataIndex: ["vaccine", "name"],
            key: "vaccineName",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            render: (text) => text || "Không có",
        },
        {
            title: "Ngày bắt đầu",
            dataIndex: "scheduledDate",
            key: "scheduledDate",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "deadline",
            key: "deadline",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag
                    color={
                        status === "ACTIVE"
                            ? "blue"
                            : status === "FINISHED"
                            ? "green"
                            : "red"
                    }
                >
                    {status === "ACTIVE"
                        ? "Đang diễn ra"
                        : status === "FINISHED"
                        ? "Hoàn thành"
                        : "Đã hủy"}
                </Tag>
            ),
        },
        {
            title: "Con em",
            key: "children",
            render: (_, record) => (
                <div>
                    {record.childrenConsent?.map((child, index) => (
                        <div key={index} style={{ marginBottom: 8 }}>
                            <div
                                style={{ fontWeight: "bold", marginBottom: 4 }}
                            >
                                {child.studentName}
                            </div>
                            <div style={{ marginBottom: 4 }}>
                                {getConsentTag(child.consent)}
                            </div>
                            {child.consent === null && (
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        onClick={() =>
                                            handleConsentClick(
                                                record,
                                                child.studentId,
                                                true
                                            )
                                        }
                                        size="small"
                                    >
                                        Đồng ý
                                    </Button>
                                    <Button
                                        danger
                                        icon={<CloseOutlined />}
                                        onClick={() =>
                                            handleConsentClick(
                                                record,
                                                child.studentId,
                                                false
                                            )
                                        }
                                        size="small"
                                    >
                                        Từ chối
                                    </Button>
                                </Space>
                            )}
                            {child.consent !== null && (
                                <div
                                    style={{ fontSize: "12px", color: "#666" }}
                                >
                                    {child.consentDate &&
                                        `Đã xác nhận: ${new Date(
                                            child.consentDate
                                        ).toLocaleDateString("vi-VN")}`}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ),
        },
    ];

    const tabItems = [
        {
            key: "vaccination",
            label: "Phiếu đồng ý tiêm chủng",
            children: (
                <div>
                    <Table
                        columns={vaccinationColumns}
                        dataSource={vaccinationCampaigns}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                    />
                </div>
            ),
        },
        {
            key: "medical",
            label: "Phiếu đồng ý khám sức khỏe",
            children: (
                <div>
                    <Text type="secondary">Tính năng đang phát triển...</Text>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen flex justify-center items-center bg-[#f6fcfa]">
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
                <div
                    style={{
                        marginBottom: 24,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "16px",
                    }}
                >
                    <div>
                        <Title level={2} className="!text-[#36ae9a] !mb-0">
                            Phiếu đồng ý
                        </Title>
                        <Text type="secondary">
                            Xác nhận đồng ý cho các hoạt động y tế của con em
                        </Text>
                    </div>
                </div>

                <Tabs
                    defaultActiveKey="vaccination"
                    items={tabItems}
                    size="large"
                />

                {/* Consent Modal */}
                <Modal
                    title={`Xác nhận ${
                        consentModal.consent ? "đồng ý" : "từ chối"
                    } tiêm chủng`}
                    open={consentModal.visible}
                    onOk={handleConsentModalOk}
                    onCancel={handleConsentModalCancel}
                    okText={consentModal.consent ? "Đồng ý" : "Từ chối"}
                    cancelText="Hủy"
                    okType={consentModal.consent ? "primary" : "danger"}
                >
                    {consentModal.campaign && (
                        <div>
                            <p>
                                Bạn có chắc chắn muốn{" "}
                                {consentModal.consent ? "đồng ý" : "từ chối"}{" "}
                                tiêm chủng cho chiến dịch:
                            </p>
                            <div style={{ marginBottom: 16 }}>
                                <p>
                                    <strong>Tên chiến dịch:</strong>{" "}
                                    {consentModal.campaign.name}
                                </p>
                                <p>
                                    <strong>Vắc xin:</strong>{" "}
                                    {consentModal.campaign.vaccine?.name}
                                </p>
                                {consentModal.campaign.description && (
                                    <p>
                                        <strong>Mô tả:</strong>{" "}
                                        {consentModal.campaign.description}
                                    </p>
                                )}
                                <p>
                                    <strong>Ngày bắt đầu:</strong>{" "}
                                    {new Date(
                                        consentModal.campaign.scheduledDate
                                    ).toLocaleDateString("vi-VN")}
                                </p>
                                <p>
                                    <strong>Ngày kết thúc:</strong>{" "}
                                    {new Date(
                                        consentModal.campaign.deadline
                                    ).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                            {consentModal.studentId && (
                                <div
                                    style={{
                                        backgroundColor: "#f5f5f5",
                                        padding: 12,
                                        borderRadius: 6,
                                        marginTop: 16,
                                    }}
                                >
                                    <p style={{ margin: 0 }}>
                                        <strong>Con em:</strong>{" "}
                                        {
                                            consentModal.campaign.childrenConsent?.find(
                                                (child) =>
                                                    child.studentId ===
                                                    consentModal.studentId
                                            )?.studentName
                                        }
                                    </p>
                                </div>
                            )}
                            <div style={{ marginTop: 16 }}>
                                <p style={{ fontSize: "14px", color: "#666" }}>
                                    {consentModal.consent
                                        ? "Việc đồng ý sẽ cho phép con em bạn tham gia chiến dịch tiêm chủng này."
                                        : "Việc từ chối sẽ loại con em bạn khỏi chiến dịch tiêm chủng này."}
                                </p>
                            </div>
                        </div>
                    )}
                </Modal>
            </Card>
        </div>
    );
};

export default VaccineConsentForm;
