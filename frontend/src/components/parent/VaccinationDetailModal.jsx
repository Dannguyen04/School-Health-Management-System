import { Modal, Typography, Row, Col, Tag, Divider } from "antd";
import dayjs from "dayjs";
import {
    CheckCircleTwoTone,
    ExclamationCircleTwoTone,
    UserOutlined,
    MedicineBoxOutlined,
} from "@ant-design/icons";

const getDoseLabel = (dose) => {
    switch (dose) {
        case "FIRST":
            return "Liều đầu tiên";
        case "SECOND":
            return "Liều thứ hai";
        case "BOOSTER":
            return "Liều nhắc lại";
        default:
            return dose || "-";
    }
};

const getReactionLabel = (reaction) => {
    switch (reaction) {
        case "NONE":
            return "Không có phản ứng";
        case "MILD":
            return "Phản ứng nhẹ";
        case "MODERATE":
            return "Phản ứng vừa";
        case "SEVERE":
            return "Phản ứng nặng";
        default:
            return reaction || "-";
    }
};

const getStatusTag = (status) => {
    switch (status) {
        case "COMPLETED":
            return <Tag color="green">Đã tiêm</Tag>;
        case "SCHEDULED":
            return <Tag color="blue">Đã lên lịch</Tag>;
        case "CANCELLED":
            return <Tag color="red">Đã hủy</Tag>;
        case "POSTPONED":
            return <Tag color="orange">Hoãn</Tag>;
        default:
            return <Tag>{status || "-"}</Tag>;
    }
};

const VaccinationDetailModal = ({ visible, vaccination, onClose }) => {
    return (
        <Modal
            title={
                <div className="text-center">
                    <span className="text-2xl font-bold text-[#36ae9a]">
                        <MedicineBoxOutlined style={{ marginRight: 8 }} />
                        Chi tiết tiêm chủng
                    </span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            style={{ borderRadius: "1rem" }}
            bodyStyle={{ padding: "32px 24px" }}
        >
            {vaccination?.notFound ? (
                <div
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                >
                    <ExclamationCircleTwoTone
                        twoToneColor="#faad14"
                        style={{ fontSize: 40, marginBottom: 12 }}
                    />
                    <div style={{ fontSize: 18 }}>{vaccination.message}</div>
                </div>
            ) : (
                <>
                    {/* Thông tin chính */}
                    <Row gutter={[16, 16]} align="middle">
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Học sinh
                            </div>
                            <div className="font-semibold flex items-center gap-2">
                                <UserOutlined />
                                {vaccination?.student?.user?.fullName ||
                                    "Không có"}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Chiến dịch
                            </div>
                            <div className="font-semibold">
                                {vaccination?.campaign?.name || "Không có"}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Loại vắc xin
                            </div>
                            <div className="font-semibold">
                                {vaccination?.vaccineName || "-"}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Ngày tiêm
                            </div>
                            <div className="font-semibold">
                                {vaccination?.administeredDate ? (
                                    dayjs(vaccination.administeredDate).format(
                                        "DD/MM/YYYY"
                                    )
                                ) : (
                                    <span className="text-gray-400">
                                        Chưa tiêm
                                    </span>
                                )}
                            </div>
                        </Col>
                    </Row>
                    <Divider />
                    {/* Thông tin bổ sung */}
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Loại liều
                            </div>
                            <div>{getDoseLabel(vaccination?.dose)}</div>
                        </Col>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Số lô vắc xin
                            </div>
                            <div>{vaccination?.batchNumber || "-"}</div>
                        </Col>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Y tá thực hiện
                            </div>
                            <div>
                                {vaccination?.nurse?.user?.fullName || "-"}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Trạng thái
                            </div>
                            <div>{getStatusTag(vaccination?.status)}</div>
                        </Col>
                    </Row>
                    <Divider />
                    {/* Tác dụng phụ & phản ứng */}
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Tác dụng phụ
                            </div>
                            <div
                                style={{
                                    background: "#f6fcfa",
                                    borderRadius: 6,
                                    padding: 8,
                                    minHeight: 32,
                                }}
                            >
                                {vaccination?.sideEffects || "Không có"}
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="mb-2 text-base text-gray-500">
                                Phản ứng sau tiêm
                            </div>
                            <div
                                style={{
                                    background: "#f6fcfa",
                                    borderRadius: 6,
                                    padding: 8,
                                    minHeight: 32,
                                }}
                            >
                                {getReactionLabel(vaccination?.reaction)}
                            </div>
                        </Col>
                    </Row>
                    <Divider />
                    {/* Ghi chú */}
                    <div className="mb-2 text-base text-gray-500">Ghi chú</div>
                    <div
                        style={{
                            background: "#f6fcfa",
                            borderRadius: 6,
                            padding: 8,
                            minHeight: 32,
                        }}
                    >
                        {vaccination?.notes || "Không có"}
                    </div>
                </>
            )}
        </Modal>
    );
};

export default VaccinationDetailModal;
