import {
    CheckOutlined,
    CloseOutlined,
    FileTextOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Button,
    Card,
    message,
    Select,
    Tag,
    Typography,
    Tabs,
    Modal,
    Input,
    Avatar,
    Empty,
    Space,
    Tooltip,
} from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext";

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusTag = (consent) => {
    if (consent === true) return <Tag color="green">Đã đồng ý</Tag>;
    if (consent === false) return <Tag color="red">Đã từ chối</Tag>;
    return <Tag color="gold">Chưa xác nhận</Tag>;
};

const campaignStatusTag = (status) => {
    if (status === "ACTIVE") return <Tag color="blue">Đang diễn ra</Tag>;
    if (status === "FINISHED") return <Tag color="green">Hoàn thành</Tag>;
    return <Tag color="red">Đã hủy</Tag>;
};

const ConsentForms = () => {
    const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [consentModal, setConsentModal] = useState({
        visible: false,
        campaign: null,
        consent: null,
        studentId: null,
        reason: "",
    });

    // Fetch children
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("/api/parents/my-children", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data.success) {
                    setChildren(response.data.data || []);
                }
            } catch (error) {
                message.error("Không thể tải danh sách con em");
            }
        };
        fetchChildren();
    }, []);

    // Fetch campaigns
    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    "/api/parents/vaccination-campaigns",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.data.success) {
                    setCampaigns(response.data.data || []);
                }
            } catch (error) {
                message.error("Không thể tải danh sách phiếu đồng ý");
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    // Remove selectedChild logic and show all consents for all children
    // Get all forms for all children
    const getAllConsents = () => {
        let forms = [];
        campaigns.forEach((c) => {
            c.childrenConsent?.forEach((childConsent) => {
                forms.push({
                    ...c,
                    consent: childConsent.consent,
                    consentDate: childConsent.consentDate,
                    reason: childConsent.reason,
                    studentName: childConsent.studentName,
                    className: childConsent.className,
                    studentId: childConsent.studentId,
                });
            });
        });
        // Filter by tab
        if (activeTab === "pending")
            return forms.filter((f) => f.consent === null);
        if (activeTab === "approved")
            return forms.filter((f) => f.consent === true);
        if (activeTab === "rejected")
            return forms.filter((f) => f.consent === false);
        return forms;
    };

    const forms = getAllConsents();

    // Handle consent actions
    const openConsentModal = (form, consent) => {
        setConsentModal({
            visible: true,
            campaign: form,
            consent,
            studentId: form.studentId,
            reason: "",
        });
    };
    const closeConsentModal = () =>
        setConsentModal({
            visible: false,
            campaign: null,
            consent: null,
            studentId: null,
            reason: "",
        });
    const handleConsent = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `/api/manager/vaccination-campaigns/${consentModal.campaign.id}/consent`,
                {
                    campaignId: consentModal.campaign.id,
                    studentId: consentModal.studentId,
                    consent: consentModal.consent,
                    notes: consentModal.consent ? "" : consentModal.reason,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                message.success(response.data.message);
                setConsentModal({
                    visible: false,
                    campaign: null,
                    consent: null,
                    studentId: null,
                    reason: "",
                });
                // Refresh campaigns
                const refreshed = await axios.get(
                    "/api/parents/vaccination-campaigns",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (refreshed.data.success)
                    setCampaigns(refreshed.data.data || []);
            } else {
                message.error(
                    response.data.error || "Không thể gửi phiếu đồng ý"
                );
            }
        } catch (error) {
            message.error(
                error.response?.data?.error || "Không thể gửi phiếu đồng ý"
            );
        }
    };

    // UI
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2] py-10 px-2">
            <div className="max-w-4xl mx-auto mt-8">
                {/* Header */}
                <div className="flex flex-col items-center mb-8 pt-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FileTextOutlined className="text-3xl text-[#36ae9a]" />
                        <Title level={2} className="!mb-0 !text-[#36ae9a]">
                            Phiếu đồng ý y tế
                        </Title>
                    </div>
                    <Text type="secondary" className="text-center">
                        Quản lý và xác nhận các phiếu đồng ý cho hoạt động y tế
                        của học sinh
                    </Text>
                </div>

                {/* Tabs */}
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="mb-6"
                    items={[
                        { key: "all", label: "Tất cả" },
                        { key: "pending", label: "Chưa xác nhận" },
                        { key: "approved", label: "Đã đồng ý" },
                        { key: "rejected", label: "Đã từ chối" },
                    ]}
                />

                {/* Consent forms list */}
                {forms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {forms.map((form) => (
                            <Card
                                key={form.id + "-" + form.studentId}
                                className="rounded-xl shadow border-0 hover:shadow-lg transition-shadow duration-300"
                                bodyStyle={{ padding: 20 }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <FileTextOutlined className="text-xl text-[#36ae9a]" />
                                    <Title level={5} className="mb-0">
                                        {form.name}
                                    </Title>
                                </div>
                                <div className="mb-2 flex items-center gap-2">
                                    <Avatar icon={<UserOutlined />} size={24} />
                                    <span className="font-semibold">
                                        {form.studentName}
                                    </span>
                                    {form.className && (
                                        <span className="text-gray-400">
                                            ({form.className})
                                        </span>
                                    )}
                                </div>
                                <div className="mb-2">
                                    <Text type="secondary">Loại phiếu: </Text>
                                    <Text strong>Tiêm chủng</Text>
                                </div>
                                <div className="mb-2">
                                    <Text type="secondary">Vắc xin: </Text>
                                    <Text>{form.vaccine?.name || "-"}</Text>
                                </div>
                                <div className="mb-2">
                                    <Text type="secondary">Thời gian: </Text>
                                    <Text>
                                        {new Date(
                                            form.scheduledDate
                                        ).toLocaleDateString("vi-VN")}{" "}
                                        -{" "}
                                        {new Date(
                                            form.deadline
                                        ).toLocaleDateString("vi-VN")}
                                    </Text>
                                </div>
                                <div className="mb-2">
                                    <Text type="secondary">
                                        Trạng thái chiến dịch:{" "}
                                    </Text>
                                    {campaignStatusTag(form.status)}
                                </div>
                                <div className="mb-2">
                                    <Text type="secondary">
                                        Trạng thái xác nhận:{" "}
                                    </Text>
                                    {statusTag(form.consent)}
                                </div>
                                {form.consentDate && (
                                    <div className="mb-2 text-xs text-gray-500">
                                        {form.consent === true && "Đã đồng ý"}
                                        {form.consent === false && "Đã từ chối"}
                                        {" lúc "}
                                        {new Date(
                                            form.consentDate
                                        ).toLocaleDateString("vi-VN")}
                                    </div>
                                )}
                                {form.reason && (
                                    <div className="mb-2 text-xs text-red-500">
                                        Lý do từ chối: {form.reason}
                                    </div>
                                )}
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        onClick={() =>
                                            openConsentModal(form, null)
                                        }
                                        icon={<FileTextOutlined />}
                                    >
                                        Xem chi tiết
                                    </Button>
                                    {form.consent === null && (
                                        <>
                                            <Button
                                                type="primary"
                                                icon={<CheckOutlined />}
                                                onClick={() =>
                                                    openConsentModal(form, true)
                                                }
                                            >
                                                Đồng ý
                                            </Button>
                                            <Button
                                                danger
                                                icon={<CloseOutlined />}
                                                onClick={() =>
                                                    openConsentModal(
                                                        form,
                                                        false
                                                    )
                                                }
                                            >
                                                Từ chối
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="rounded-xl shadow border-0">
                        <Empty description="Không có phiếu đồng ý nào" />
                    </Card>
                )}

                {/* Consent Modal */}
                <Modal
                    title={
                        consentModal.campaign
                            ? consentModal.consent === null
                                ? "Chi tiết phiếu đồng ý"
                                : consentModal.consent
                                ? "Xác nhận đồng ý"
                                : "Xác nhận từ chối"
                            : ""
                    }
                    open={consentModal.visible}
                    onCancel={closeConsentModal}
                    onOk={
                        consentModal.consent !== null
                            ? handleConsent
                            : closeConsentModal
                    }
                    okText={
                        consentModal.consent === null
                            ? "Đóng"
                            : consentModal.consent
                            ? "Đồng ý"
                            : "Từ chối"
                    }
                    cancelText="Hủy"
                    okType={consentModal.consent ? "primary" : "danger"}
                >
                    {consentModal.campaign && (
                        <div>
                            <div className="mb-2">
                                <Text strong>Tên chiến dịch:</Text>{" "}
                                {consentModal.campaign.name}
                            </div>
                            <div className="mb-2">
                                <Text strong>Vắc xin:</Text>{" "}
                                {consentModal.campaign.vaccine?.name}
                            </div>
                            <div className="mb-2">
                                <Text strong>Thời gian:</Text>{" "}
                                {new Date(
                                    consentModal.campaign.scheduledDate
                                ).toLocaleDateString("vi-VN")}{" "}
                                -{" "}
                                {new Date(
                                    consentModal.campaign.deadline
                                ).toLocaleDateString("vi-VN")}
                            </div>
                            <div className="mb-2">
                                <Text strong>Trạng thái chiến dịch:</Text>{" "}
                                {campaignStatusTag(
                                    consentModal.campaign.status
                                )}
                            </div>
                            <div className="mb-2">
                                <Text strong>Mô tả:</Text>{" "}
                                {consentModal.campaign.description || "-"}
                            </div>
                            <div className="mb-2">
                                <Text strong>Trạng thái xác nhận:</Text>{" "}
                                {statusTag(consentModal.campaign.consent)}
                            </div>
                            {consentModal.consent === false && (
                                <div className="mb-2">
                                    <Text strong>Lý do từ chối:</Text>
                                    <TextArea
                                        rows={2}
                                        value={consentModal.reason}
                                        onChange={(e) =>
                                            setConsentModal({
                                                ...consentModal,
                                                reason: e.target.value,
                                            })
                                        }
                                        placeholder="Nhập lý do từ chối (bắt buộc)"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default ConsentForms;
