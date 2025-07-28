import {
    CheckOutlined,
    CloseOutlined,
    FileTextOutlined,
    UserOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    MedicineBoxOutlined,
    SafetyCertificateOutlined,
    AlertOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Card,
    Checkbox,
    Descriptions,
    Divider,
    Empty,
    Input,
    message,
    Modal,
    Tabs,
    Tag,
    Typography,
    Timeline,
    Badge,
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

const getTimelineColor = (consent, status) => {
    if (consent === true) return "green";
    if (consent === false) return "red";
    if (status === "ACTIVE") return "blue";
    if (status === "FINISHED") return "gray";
    return "orange";
};

const getTimelineIcon = (consent, status) => {
    if (consent === true) return <CheckCircleOutlined />;
    if (consent === false) return <CloseCircleOutlined />;
    if (status === "ACTIVE") return <ClockCircleOutlined />;
    if (status === "FINISHED") return <CheckCircleOutlined />;
    return <ExclamationCircleOutlined />;
};

const getCardColor = (consent, status) => {
    if (consent === true)
        return "border-l-4 border-l-emerald-400 bg-emerald-50";
    if (consent === false) return "border-l-4 border-l-rose-400 bg-rose-50";
    if (status === "ACTIVE") return "border-l-4 border-l-sky-400 bg-sky-50";
    if (status === "FINISHED")
        return "border-l-4 border-l-slate-400 bg-slate-50";
    return "border-l-4 border-l-amber-400 bg-amber-50";
};

const getCardIcon = (consent, status) => {
    if (consent === true)
        return <SafetyCertificateOutlined className="text-emerald-500" />;
    if (consent === false) return <AlertOutlined className="text-rose-500" />;
    if (status === "ACTIVE")
        return <MedicineBoxOutlined className="text-sky-500" />;
    if (status === "FINISHED")
        return <CheckCircleOutlined className="text-slate-500" />;
    return <ExclamationCircleOutlined className="text-amber-500" />;
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
        confirmVaccination: false, // Thêm state cho checkbox xác nhận tiêm chủng
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
                console.log("Child consent data:", childConsent); // Debug log
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

    // Sort forms by date (newest first)
    const sortedForms = forms.sort((a, b) => {
        const dateA = new Date(a.scheduledDate);
        const dateB = new Date(b.scheduledDate);
        return dateB - dateA;
    });

    // Handle consent actions
    const openConsentModal = (form, consent) => {
        const child = children.find((c) => c.studentId === form.studentId);
        setConsentModal({
            visible: true,
            campaign: form,
            consent,
            studentId: form.studentId,
            reason: form.reason || "",
            consentDate: form.consentDate || null,
            studentName: child?.fullName || form.studentName || "-",
            className: child?.class || form.className || "-",
            confirmVaccination: false, // Reset checkbox khi mở modal
        });
    };
    const closeConsentModal = () =>
        setConsentModal({
            visible: false,
            campaign: null,
            consent: null,
            studentId: null,
            reason: "",
            consentDate: null,
            confirmVaccination: false,
        });
    const handleConsent = async () => {
        // Kiểm tra nếu đồng ý thì phải check checkbox
        if (consentModal.consent === true && !consentModal.confirmVaccination) {
            message.error("Vui lòng xác nhận đồng ý cho con em tiêm chủng");
            return;
        }

        // Kiểm tra nếu từ chối thì phải có lý do
        if (consentModal.consent === false && !consentModal.reason.trim()) {
            message.error("Vui lòng nhập lý do từ chối");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `/api/manager/vaccination-campaigns/${consentModal.campaign.id}/consent`,
                {
                    campaignId: consentModal.campaign.id,
                    studentId: consentModal.studentId,
                    consent: consentModal.consent,
                    notes: consentModal.consent ? "" : consentModal.reason,
                    confirmVaccination: consentModal.confirmVaccination, // Thêm thông tin xác nhận tiêm chủng
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
                    consentDate: null,
                    confirmVaccination: false,
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
            <div className="w-full max-w-6xl mx-auto px-4 pt-24">
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

                {/* Timeline Consent forms */}
                {sortedForms.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <Timeline
                            mode="left"
                            items={sortedForms.map((form) => ({
                                color: getTimelineColor(
                                    form.consent,
                                    form.status
                                ),
                                children: (
                                    <Card
                                        className={`mb-3 rounded-lg shadow-sm border-0 hover:shadow-md transition-shadow duration-300 ${getCardColor(
                                            form.consent,
                                            form.status
                                        )}`}
                                        styles={{ body: { padding: 16 } }}
                                    >
                                        {/* Header Section */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                {getCardIcon(
                                                    form.consent,
                                                    form.status
                                                )}
                                                <Title
                                                    level={4}
                                                    className="mb-0 text-red-800 font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent"
                                                >
                                                    {form.name}
                                                </Title>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {statusTag(form.consent)}
                                                {campaignStatusTag(form.status)}
                                            </div>
                                        </div>

                                        {/* Main Content Section */}
                                        <div className="space-y-3 mb-3">
                                            {/* Student Information */}
                                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                                <UserOutlined className="text-teal-600 text-base" />
                                                <span className="font-semibold text-teal-800 text-base">
                                                    {form.studentName}
                                                </span>
                                                {form.className && (
                                                    <span className="text-teal-500 text-sm font-medium">
                                                        ({form.className})
                                                    </span>
                                                )}
                                            </div>

                                            {/* Campaign Details - Two Row Layout */}
                                            <div className="space-y-2">
                                                {/* First Row - Time and Vaccine */}
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarOutlined className="text-purple-500 text-base" />
                                                        <span className="text-purple-700 font-medium">
                                                            Thời gian:{" "}
                                                            <span className="text-purple-900 font-semibold">
                                                                {new Date(
                                                                    form.scheduledDate
                                                                ).toLocaleDateString(
                                                                    "vi-VN"
                                                                )}{" "}
                                                                -{" "}
                                                                {new Date(
                                                                    form.deadline
                                                                ).toLocaleDateString(
                                                                    "vi-VN"
                                                                )}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <FileTextOutlined className="text-orange-500 text-base" />
                                                        <span className="text-orange-700 font-medium">
                                                            Vắc xin:{" "}
                                                            <span className="text-orange-900 font-semibold">
                                                                {form.vaccine
                                                                    ?.name ||
                                                                    "-"}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Second Row - Status and Reason */}
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    {form.consentDate && (
                                                        <div className="flex items-center gap-2">
                                                            <ClockCircleOutlined className="text-blue-500 text-base" />
                                                            <span className="text-blue-700">
                                                                {form.consent ===
                                                                    true &&
                                                                    "Đã đồng ý"}
                                                                {form.consent ===
                                                                    false &&
                                                                    "Đã từ chối"}
                                                                {" lúc "}
                                                                <span className="text-blue-900 font-semibold">
                                                                    {new Date(
                                                                        form.consentDate
                                                                    ).toLocaleDateString(
                                                                        "vi-VN"
                                                                    )}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    )}
                                                    {form.reason && (
                                                        <div className="flex items-center gap-2">
                                                            <ExclamationCircleOutlined className="text-rose-500 text-base" />
                                                            <span className="text-rose-700 font-medium">
                                                                Lý do từ chối:{" "}
                                                                <span className="text-rose-900 font-semibold">
                                                                    {
                                                                        form.reason
                                                                    }
                                                                </span>
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                                            <Button
                                                onClick={() =>
                                                    openConsentModal(form, null)
                                                }
                                                icon={<FileTextOutlined />}
                                                size="middle"
                                                className="flex items-center gap-2"
                                            >
                                                Xem chi tiết
                                            </Button>
                                            {form.consent === null && (
                                                <>
                                                    <Button
                                                        type="primary"
                                                        icon={<CheckOutlined />}
                                                        onClick={() =>
                                                            openConsentModal(
                                                                form,
                                                                true
                                                            )
                                                        }
                                                        size="middle"
                                                        className="flex items-center gap-2"
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
                                                        size="middle"
                                                        className="flex items-center gap-2"
                                                    >
                                                        Từ chối
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </Card>
                                ),
                                dot: getTimelineIcon(form.consent, form.status),
                            }))}
                        />
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
                            <Descriptions column={1} size="small" bordered>
                                <Descriptions.Item label="Tên chiến dịch">
                                    <span
                                        style={{
                                            wordBreak: "keep-all",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {consentModal.campaign.name}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Vắc xin">
                                    <span
                                        style={{
                                            wordBreak: "keep-all",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {consentModal.campaign.vaccine?.name ||
                                            "-"}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian">
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
                                <Descriptions.Item label="Mô tả">
                                    {consentModal.campaign.description || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số liều tối đa">
                                    {consentModal.campaign.vaccine
                                        ?.maxDoseCount || "-"}
                                </Descriptions.Item>
                            </Descriptions>

                            {/* Lưu ý về số liều tối đa */}
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <span className="text-yellow-600 text-lg">
                                        ⚠️
                                    </span>
                                    <div>
                                        <Text
                                            strong
                                            className="text-yellow-800 text-sm"
                                        >
                                            Lưu ý quan trọng:
                                        </Text>
                                        <Text className="text-yellow-700 text-sm block mt-1">
                                            Phụ huynh vui lòng đọc kỹ thông tin
                                            số liều tối đa để đảm bảo con em
                                            không bị tiêm quá số liều quy định.
                                            Việc tiêm quá liều có thể gây ảnh
                                            hưởng đến sức khỏe của học sinh.
                                        </Text>
                                    </div>
                                </div>
                            </div>
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
                            <Descriptions column={1} size="small" bordered>
                                <Descriptions.Item label="Trạng thái xác nhận">
                                    {statusTag(consentModal.campaign.consent)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày xác nhận">
                                    {consentModal.consentDate
                                        ? (() => {
                                              try {
                                                  return new Date(
                                                      consentModal.consentDate
                                                  ).toLocaleDateString("vi-VN");
                                              } catch (error) {
                                                  console.log(
                                                      "Error parsing date:",
                                                      consentModal.consentDate,
                                                      error
                                                  );
                                                  return consentModal.consentDate;
                                              }
                                          })()
                                        : "-"}
                                </Descriptions.Item>
                            </Descriptions>

                            {/* Thêm checkbox xác nhận tiêm chủng khi đồng ý */}
                            {consentModal.consent === true && (
                                <div className="mb-4 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <Checkbox
                                        checked={
                                            consentModal.confirmVaccination
                                        }
                                        onChange={(e) =>
                                            setConsentModal({
                                                ...consentModal,
                                                confirmVaccination:
                                                    e.target.checked,
                                            })
                                        }
                                        className="text-base"
                                    >
                                        <Text strong className="text-blue-800">
                                            Tôi xác nhận đồng ý cho con em tôi
                                            tham gia tiêm chủng trong chiến dịch
                                            này
                                        </Text>
                                    </Checkbox>
                                    <div className="mt-2 text-sm text-blue-600">
                                        <Text type="secondary">
                                            Bằng việc xác nhận này, tôi xin cam
                                            kết mọi thông tin về con em là phù
                                            hợp với chiến dịch tiêm vaccine. Tôi
                                            sẽ chịu mọi trách nhiệm nếu có vấn
                                            đề xảy ra trong quá trình thực hiện
                                            tiêm chủng tại trường.
                                        </Text>
                                    </div>
                                </div>
                            )}

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
