import { Modal, Descriptions } from "antd";
import dayjs from "dayjs";

const getDoseLabel = (dose) => {
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
            return reaction;
    }
};

const VaccinationDetailModal = ({ visible, vaccination, onClose }) => {
    return (
        <Modal
            title={
                <div className="text-center">
                    <span className="text-xl font-bold text-[#36ae9a]">
                        Chi tiết tiêm chủng
                    </span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            style={{
                borderRadius: "1rem",
            }}
            bodyStyle={{
                padding: "24px",
            }}
        >
            <Descriptions
                bordered
                column={2}
                size="middle"
                labelStyle={{
                    fontWeight: 600,
                    color: "#36ae9a",
                    backgroundColor: "#f6fcfa",
                }}
                contentStyle={{
                    backgroundColor: "#fff",
                }}
            >
                <Descriptions.Item label="Tên chiến dịch">
                    {vaccination?.campaign?.name || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tiêm">
                    {vaccination?.administeredDate
                        ? dayjs(vaccination.administeredDate).format(
                              "DD/MM/YYYY"
                          )
                        : "Chưa có"}
                </Descriptions.Item>
                <Descriptions.Item label="Số lô vắc xin">
                    {vaccination?.batchNumber || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Loại liều">
                    {getDoseLabel(vaccination?.dose)}
                </Descriptions.Item>
                <Descriptions.Item label="Y tá thực hiện">
                    {vaccination?.nurse?.user?.fullName || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Học sinh">
                    {vaccination?.student?.user?.fullName || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Tác dụng phụ" span={2}>
                    <div
                        style={{
                            backgroundColor: "#f6fcfa",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            minHeight: "20px",
                        }}
                    >
                        {vaccination?.sideEffects || "Không có"}
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label="Phản ứng sau tiêm" span={2}>
                    <div
                        style={{
                            backgroundColor: "#f6fcfa",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            minHeight: "20px",
                        }}
                    >
                        {getReactionLabel(vaccination?.reaction)}
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={2}>
                    <div
                        style={{
                            backgroundColor: "#f6fcfa",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            minHeight: "20px",
                        }}
                    >
                        {vaccination?.notes || "Không có"}
                    </div>
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default VaccinationDetailModal;
