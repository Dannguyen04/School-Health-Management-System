import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { parentAPI } from "../utils/api";
import {
    Card,
    Modal,
    Spin,
    Typography,
    Tag,
    Button,
    Row,
    Col,
    Tooltip,
    Skeleton,
    Empty,
    Divider,
    Alert,
    message,
} from "antd";
import {
    ScheduleOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import MedicalCampaignDetailModal from "../components/parent/MedicalCampaignDetailModal";

const { Title, Text } = Typography;

const getStatusColor = (status) => {
    switch (status) {
        case "ACTIVE":
            return "green";
        case "FINISHED":
            return "blue";
        case "CANCELLED":
            return "red";
        default:
            return "default";
    }
};

const getStatusText = (status) => {
    switch (status) {
        case "ACTIVE":
            return "Đang diễn ra";
        case "FINISHED":
            return "Hoàn thành";
        case "CANCELLED":
            return "Đã hủy";
        default:
            return status;
    }
};

const MedicalCampaigns = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Fetch campaigns for parent
    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await parentAPI.getMedicalCampaigns();
            if (response.data.success) {
                setCampaigns(response.data.data || []);
            } else {
                message.error("Không thể tải danh sách chiến dịch");
            }
        } catch (error) {
            console.error("Error fetching campaigns:", error);
            message.error("Không thể tải danh sách chiến dịch");
        } finally {
            setLoading(false);
        }
    };

    // Handle consent submission
    const handleConsentSubmit = async (campaignId, selectedExaminations) => {
        try {
            const response = await parentAPI.submitMedicalConsent(campaignId, {
                parentConsent: selectedExaminations
            });
            
            if (response.data.success) {
                // Refresh campaigns to update consent status
                await fetchCampaigns();
                return true;
            } else {
                throw new Error(response.data.error || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error("Error submitting consent:", error);
            throw error;
        }
    };

    // Handle campaign click
    const handleCampaignClick = (campaign) => {
        setSelectedCampaign(campaign);
        setModalVisible(true);
    };

    // Close modal
    const closeModal = () => {
        setModalVisible(false);
        setSelectedCampaign(null);
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2]">
                <div className="lg:px-32 px-5 pt-24 pb-12">
                    <div className="text-center max-w-4xl mx-auto">
                        <Title level={2}>Chiến dịch khám sức khỏe</Title>
                        <div className="mt-8">
                            <Skeleton active paragraph={{ rows: 4 }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6fcfa] to-[#e8f5f2]">
            {/* Header */}
            <div className="lg:px-32 px-5 pt-24 pb-12">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-[#d5f2ec] text-[#36ae9a] px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <ScheduleOutlined />
                        <span>Quản lý sức khỏe học đường</span>
                    </div>
                    <Title level={1} className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                        Chiến dịch khám sức khỏe
                    </Title>
                    <Text className="text-lg text-gray-600">
                        Xem thông tin và đưa ra quyết định về các loại khám tùy chọn cho con em
                    </Text>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="lg:px-32 px-5 pb-20">
                {campaigns.length === 0 ? (
                    <Empty
                        description="Chưa có chiến dịch khám sức khỏe nào"
                        className="mt-8"
                    />
                ) : (
                    <Row gutter={[16, 16]}>
                        {campaigns.map((campaign) => (
                            <Col xs={24} sm={12} lg={8} key={campaign.id}>
                                <Card
                                    hoverable
                                    className="h-full"
                                    actions={[
                                        <Button
                                            type="primary"
                                            icon={<EyeOutlined />}
                                            onClick={() => handleCampaignClick(campaign)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    ]}
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <Title level={4} className="mb-0">
                                                {campaign.name}
                                            </Title>
                                            <Tag color={getStatusColor(campaign.status)}>
                                                {getStatusText(campaign.status)}
                                            </Tag>
                                        </div>

                                        <Text type="secondary" className="block">
                                            {campaign.description || "Không có mô tả"}
                                        </Text>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <Text strong>Ngày bắt đầu:</Text>
                                                <Text>
                                                    {campaign.scheduledDate
                                                        ? dayjs(campaign.scheduledDate).format("DD/MM/YYYY")
                                                        : "Chưa có"}
                                                </Text>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <Text strong>Ngày kết thúc:</Text>
                                                <Text>
                                                    {campaign.deadline
                                                        ? dayjs(campaign.deadline).format("DD/MM/YYYY")
                                                        : "Chưa có"}
                                                </Text>
                                            </div>
                                        </div>

                                        {/* Optional Examinations */}
                                        {campaign.optionalExaminations && campaign.optionalExaminations.length > 0 && (
                                            <div className="mt-4">
                                                <Text strong className="block mb-2">
                                                    Khám tùy chọn:
                                                </Text>
                                                <div className="space-y-1">
                                                    {campaign.optionalExaminations.map((exam) => (
                                                        <Tag key={exam} color="blue">
                                                            {exam === "GENITAL" ? "Khám sinh dục" : "Khám tâm lý"}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Consent Status */}
                                        {campaign.optionalExaminations && campaign.optionalExaminations.length > 0 && (
                                            <div className="mt-4">
                                                <Text strong className="block mb-2">
                                                    Trạng thái đồng ý:
                                                </Text>
                                                {campaign.parentConsent && campaign.parentConsent.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {campaign.optionalExaminations.map((exam) => (
                                                            <Tag 
                                                                key={exam} 
                                                                color={campaign.parentConsent.includes(exam) ? "green" : "red"}
                                                            >
                                                                {exam === "GENITAL" ? "Khám sinh dục" : "Khám tâm lý"}: 
                                                                {campaign.parentConsent.includes(exam) ? " Đồng ý" : " Từ chối"}
                                                            </Tag>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <Alert
                                                        message="Chưa đưa ra quyết định"
                                                        description="Vui lòng xem chi tiết để đưa ra quyết định về các loại khám tùy chọn"
                                                        type="warning"
                                                        showIcon
                                                        size="small"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            {/* Campaign Detail Modal */}
            <MedicalCampaignDetailModal
                visible={modalVisible}
                campaign={selectedCampaign}
                onClose={closeModal}
                onConsentSubmit={handleConsentSubmit}
            />
        </div>
    );
};

export default MedicalCampaigns; 