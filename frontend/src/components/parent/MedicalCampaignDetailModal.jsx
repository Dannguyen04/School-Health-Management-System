import { ExclamationCircleTwoTone, ScheduleOutlined } from "@ant-design/icons";
import { Descriptions, Divider, Modal, Tag } from "antd";
import dayjs from "dayjs";

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
      styles={{ body: { padding: "32px 24px" } }}
    >
      {!campaign ? (
        <div style={{ textAlign: "center", padding: 32, color: "#888" }}>
          <ExclamationCircleTwoTone
            twoToneColor="#faad14"
            style={{ fontSize: 40, marginBottom: 12 }}
          />
          <div style={{ fontSize: 18 }}>Không tìm thấy dữ liệu chiến dịch</div>
        </div>
      ) : (
        <>
          <Divider orientation="left">Thông tin chiến dịch</Divider>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Tên chiến dịch">
              {campaign.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(campaign.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày dự kiến">
              {campaign.scheduledDate
                ? dayjs(campaign.scheduledDate).format("DD/MM/YYYY")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {campaign.deadline
                ? dayjs(campaign.deadline).format("DD/MM/YYYY")
                : "-"}
            </Descriptions.Item>
          </Descriptions>
          <Divider orientation="left">Mô tả</Divider>
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
        </>
      )}
    </Modal>
  );
};

export default MedicalCampaignDetailModal;
