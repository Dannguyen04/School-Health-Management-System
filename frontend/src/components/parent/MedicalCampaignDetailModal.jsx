import { ExclamationCircleTwoTone, ScheduleOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Checkbox, Descriptions, Divider, Modal, Space, Tag, message } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

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

const MedicalCampaignDetailModal = ({ visible, campaign, onClose, onConsentSubmit }) => {
  const [selectedExaminations, setSelectedExaminations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset selections when modal opens
  const handleModalOpen = () => {
    if (campaign?.optionalExaminations?.length > 0) {
      setSelectedExaminations([]);
    }
  };

  const handleConsentSubmit = async () => {
    // Không cần validate nữa vì có thể chọn 0 hoặc nhiều loại khám

    setIsSubmitting(true);
    try {
      await onConsentSubmit(campaign.id, selectedExaminations);
      message.success("Đã gửi ý kiến đồng ý thành công");
      onClose();
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectAll = async () => {
    setIsSubmitting(true);
    try {
      await onConsentSubmit(campaign.id, []); // Gửi mảng rỗng để từ chối tất cả
      message.success("Đã từ chối tất cả khám tùy chọn");
      onClose();
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };
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
      onOpenChange={handleModalOpen}
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

          {/* Khám tùy chọn */}
          {campaign.optionalExaminations && campaign.optionalExaminations.length > 0 && (
            <>
              <Divider orientation="left">Khám tùy chọn</Divider>
              <Alert
                message="Xin ý kiến đồng ý"
                description="Nhà trường xin phép được thực hiện các loại khám tùy chọn sau cho con/em của quý phụ huynh. Vui lòng chọn các loại khám mà quý phụ huynh đồng ý."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <div style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {campaign.optionalExaminations.includes("GENITAL") && (
                    <div style={{ 
                      border: "1px solid #d9d9d9", 
                      borderRadius: 8, 
                      padding: 16,
                      background: selectedExaminations.includes("GENITAL") ? "#f6ffed" : "#fff"
                    }}>
                      <Checkbox
                        checked={selectedExaminations.includes("GENITAL")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExaminations([...selectedExaminations, "GENITAL"]);
                          } else {
                            setSelectedExaminations(selectedExaminations.filter(item => item !== "GENITAL"));
                          }
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                            <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                            Khám sinh dục
                          </div>
                          <div style={{ color: "#666", fontSize: "14px" }}>
                            Kiểm tra bộ phận sinh dục và các vấn đề liên quan của học sinh
                          </div>
                        </div>
                      </Checkbox>
                    </div>
                  )}

                  {campaign.optionalExaminations.includes("PSYCHOLOGICAL") && (
                    <div style={{ 
                      border: "1px solid #d9d9d9", 
                      borderRadius: 8, 
                      padding: 16,
                      background: selectedExaminations.includes("PSYCHOLOGICAL") ? "#f6ffed" : "#fff"
                    }}>
                      <Checkbox
                        checked={selectedExaminations.includes("PSYCHOLOGICAL")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExaminations([...selectedExaminations, "PSYCHOLOGICAL"]);
                          } else {
                            setSelectedExaminations(selectedExaminations.filter(item => item !== "PSYCHOLOGICAL"));
                          }
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                            <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                            Khám tâm lý
                          </div>
                          <div style={{ color: "#666", fontSize: "14px" }}>
                            Đánh giá tình trạng tâm lý, cảm xúc và hành vi của học sinh
                          </div>
                        </div>
                      </Checkbox>
                    </div>
                  )}
                </Space>
              </div>

              <div style={{ textAlign: "center", marginTop: 24 }}>
                <Space>
                  <Button 
                    type="primary" 
                    onClick={handleConsentSubmit}
                    loading={isSubmitting}
                    icon={<CheckCircleOutlined />}
                  >
                    Gửi quyết định
                  </Button>
                  <Button 
                    danger
                    onClick={handleRejectAll}
                    loading={isSubmitting}
                    icon={<CloseCircleOutlined />}
                  >
                    Từ chối tất cả
                  </Button>
                  <Button 
                    onClick={onClose}
                  >
                    Hủy
                  </Button>
                </Space>
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
};

export default MedicalCampaignDetailModal;
