import {
    CheckOutlined,
    CloseOutlined,
    FileTextOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Card,
    Descriptions,
    Divider,
    Empty,
    Input,
    message,
    Modal,
    Tabs,
    Tag,
    Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

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
    // const { user } = useAuth();
    const [children, setChildren] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
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
            } catch {
                message.error("Không thể tải danh sách con em");
            }
        };
        fetchChildren();
    }, []);

    // Fetch campaigns
    useEffect(() => {
        const fetchCampaigns = async () => {
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
            } catch {
                message.error("Không thể tải danh sách phiếu đồng ý");
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
        const child = children.find((c) => c.studentId === form.studentId);
        setConsentModal({
            visible: true,
            campaign: form,
            consent,
            studentId: form.studentId,
            reason: "",
            studentName: child?.fullName || form.studentName || "-",
            className: child?.class || form.className || "-",
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
        <div className="min-h-screen bg-[#f6fcfa]">
            <div className="w-full max-w-4xl mx-auto px-4 pt-24">
                {/* Header đồng bộ */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <FileTextOutlined className="text-[#36ae9a]" />
                        <span>Quản lý sức khỏe học sinh</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Phiếu đồng ý y tế
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Quản lý và xác nhận các phiếu đồng ý cho hoạt động y tế,
                        tiêm chủng, khám sức khỏe của học sinh.
                    </p>
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
                                styles={{ body: { padding: 20 } }}
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
                    styles={{ body: { padding: 20 } }}
                >
                    {consentModal.campaign && (
                        <div>
                            <Divider orientation="left">
                                Thông tin chiến dịch
                            </Divider>
                            <Descriptions column={2} size="small" bordered>
                                <Descriptions.Item label="Tên chiến dịch">
                                    {consentModal.campaign.name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Vắc xin">
                                    {consentModal.campaign.vaccine?.name || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian" span={2}>
                                    {new Date(
                                        consentModal.campaign.scheduledDate
                                    ).toLocaleDateString("vi-VN")}{" "}
                                    -{" "}
                                    {new Date(
                                        consentModal.campaign.deadline
                                    ).toLocaleDateString("vi-VN")}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái chiến dịch">
                                    {campaignStatusTag(
                                        consentModal.campaign.status
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Mô tả" span={2}>
                                    {consentModal.campaign.description || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số liều tối đa">
                                    {consentModal.campaign.vaccine
                                        ?.maxDoseCount || "-"}
                                </Descriptions.Item>
                            </Descriptions>
                            <Divider orientation="left">
                                Thông tin học sinh
                            </Divider>
                            <Descriptions column={2} size="small" bordered>
                                <Descriptions.Item label="Học sinh">
                                    {consentModal.studentName || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Lớp">
                                    {consentModal.className || "-"}
                                </Descriptions.Item>
                            </Descriptions>
                            <Divider orientation="left">
                                Trạng thái xác nhận
                            </Divider>
                            <Descriptions column={2} size="small" bordered>
                                <Descriptions.Item label="Trạng thái xác nhận">
                                    {statusTag(consentModal.campaign.consent)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày xác nhận">
                                    {consentModal.campaign.consentDate
                                        ? new Date(
                                              consentModal.campaign.consentDate
                                          ).toLocaleDateString("vi-VN")
                                        : "-"}
                                </Descriptions.Item>
                                {consentModal.campaign.reason && (
                                    <Descriptions.Item
                                        label="Lý do từ chối"
                                        span={2}
                                    >
                                        {consentModal.campaign.reason}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                            {consentModal.consent === false && (
                                <div className="mb-2 mt-2">
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
