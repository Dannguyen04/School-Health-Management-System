import { Modal, Typography, Row, Col, Tag, Divider } from "antd";
import dayjs from "dayjs";
import { ScheduleOutlined, ExclamationCircleTwoTone } from "@ant-design/icons";

const getStatusTag = (status) => {
    switch (status) {
        case "ACTIVE":
            return <Tag color="green">Đang diễn ra</Tag>;
        case "SCHEDULED":
            return <Tag color="blue">Đã lên lịch</Tag>;
        case "FINISHED":
            return <Tag color="gray">Đã kết thúc</Tag>;
        case "CANCELLED":
            return <Tag color="red">Đã hủy</Tag>;
        default:
            return <Tag>{status || "-"}</Tag>;
    }
};

const MedicalCampaignDetailModal = ({ visible, campaign, onClose }) => {
    return (
        <Modal
            title={
                <div className="text-center">
                    <span className="text-2xl font-bold text-[#36ae9a]">
                        <ScheduleOutlined style={{ marginRight: 8 }} />
                        Chi tiết chiến dịch khám sức khỏe
                    </span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
            style={{ borderRadius: "1rem" }}
            bodyStyle={{ padding: "32px 24px" }}
        >
            {!campaign ? (
                <div
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                >
                    <ExclamationCircleTwoTone
                        twoToneColor="#faad14"
                        style={{ fontSize: 40, marginBottom: 12 }}
                    />
                    <div style={{ fontSize: 18 }}>
                        Không tìm thấy dữ liệu chiến dịch
                    </div>
                </div>
            ) : (
                <>
                    <Row gutter={[16, 16]} align="middle">
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Tên chiến dịch
                            </div>
                            <div className="font-semibold">
                                {campaign.name || "-"}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Trạng thái
                            </div>
                            <div>{getStatusTag(campaign.status)}</div>
                        </Col>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Ngày dự kiến
                            </div>
                            <div className="font-semibold">
                                {campaign.scheduledDate
                                    ? dayjs(campaign.scheduledDate).format(
                                          "DD/MM/YYYY"
                                      )
                                    : "-"}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Ngày kết thúc
                            </div>
                            <div className="font-semibold">
                                {campaign.deadline
                                    ? dayjs(campaign.deadline).format(
                                          "DD/MM/YYYY"
                                      )
                                    : "-"}
                            </div>
                        </Col>
                        <Col span={24}>
                            <div className="mb-2 text-base text-gray-500">
                                Mô tả
                            </div>
                            <div
                                style={{
                                    background: "#f6fcfa",
                                    borderRadius: 6,
                                    padding: 8,
                                    minHeight: 32,
                                }}
                            >
                                {campaign.description || "-"}
                            </div>
                        </Col>
                    </Row>
                </>
            )}
        </Modal>
    );
};

export default MedicalCampaignDetailModal;
