import {
  ExclamationCircleTwoTone,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { Descriptions, Divider, Modal, Tag, Typography } from "antd";
import dayjs from "dayjs";

const getDoseLabel = (dose) => {
  switch (dose) {
    case "PRIMARY":
      return "Liều cơ bản";
    case "BOOSTER":
      return "Liều nhắc lại";
    case "CATCHUP":
      return "Tiêm bù";
    case "ADDITIONAL":
      return "Liều bổ sung";
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

const getRequirementLabel = (requirement) => {
  switch (requirement) {
    case "REQUIRED":
      return "Bắt buộc";
    case "OPTIONAL":
      return "Không bắt buộc";
    default:
      return requirement || "-";
  }
};

const VaccinationDetailModal = ({ visible, vaccination, onClose }) => {
  // Kiểm tra trường hợp chưa tiêm
  const isNotVaccinated = vaccination?.notVaccinated;
  const campaign = isNotVaccinated
    ? vaccination?.campaign
    : vaccination?.campaign;
  const student = isNotVaccinated ? vaccination?.student : vaccination?.student;
  const consent = isNotVaccinated ? vaccination?.consent : null;
  // Lấy thông tin phụ huynh đầu tiên (nếu có)
  const parentInfo = student?.parents?.[0]?.parent?.user;
  const studentName =
    consent?.studentName ||
    campaign?.consents?.[0]?.studentName ||
    student?.user?.fullName ||
    student?.fullName ||
    vaccination?.studentName ||
    vaccination?.fullName ||
    vaccination?.student?.user?.fullName ||
    vaccination?.student?.fullName ||
    "-";
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
      styles={{ body: { padding: "32px 24px" } }}
    >
      {vaccination?.notFound ? (
        <div style={{ textAlign: "center", padding: 32, color: "#888" }}>
          <ExclamationCircleTwoTone
            twoToneColor="#faad14"
            style={{ fontSize: 40, marginBottom: 12 }}
          />
          <div style={{ fontSize: 18 }}>{vaccination.message}</div>
        </div>
      ) : (
        <>
          <Typography.Title level={5} style={{ marginBottom: 0 }}>
            {studentName}
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 4 }}
          >
            Chiến dịch: <b>{campaign?.name || "-"}</b>
          </Typography.Text>
          <Divider orientation="left">Thông tin vaccine</Divider>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Nhà sản xuất">
              {vaccination?.vaccine?.manufacturer ||
                campaign?.vaccine?.manufacturer ||
                campaign?.vaccineManufacturer ||
                "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Xuất xứ">
              {vaccination?.vaccine?.origin || campaign?.vaccine?.origin || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Độ tuổi khuyến nghị">
              {vaccination?.vaccine?.recommendedAge ||
                campaign?.vaccine?.recommendedAge ||
                "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Yêu cầu">
              {getRequirementLabel(
                vaccination?.vaccine?.requirement ||
                  campaign?.vaccine?.requirement ||
                  campaign?.vaccineRequirement ||
                  "-"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {vaccination?.vaccine?.description ||
                campaign?.vaccine?.description ||
                "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tác dụng phụ" span={2}>
              {vaccination?.vaccine?.sideEffects ||
                campaign?.vaccine?.sideEffects ||
                vaccination?.sideEffects ||
                "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Chống chỉ định" span={2}>
              {vaccination?.vaccine?.contraindications ||
                campaign?.vaccine?.contraindications ||
                "-"}
            </Descriptions.Item>
            {campaign?.vaccine?.referenceUrl && (
              <Descriptions.Item label="Tham khảo" span={2}>
                <a
                  href={campaign.vaccine.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#36ae9a" }}
                >
                  {campaign.vaccine.referenceUrl}
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
          <Divider orientation="left">Thông tin tiêm chủng</Divider>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Loại vắc xin">
              {vaccination?.vaccineName ||
                campaign?.vaccinations?.[0]?.name ||
                "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tiêm">
              {vaccination?.administeredDate ? (
                dayjs(vaccination.administeredDate).format("DD/MM/YYYY")
              ) : (
                <span className="text-gray-400">Chưa tiêm</span>
              )}
            </Descriptions.Item>
            {isNotVaccinated && (
              <>
                <Descriptions.Item label="Ngày dự kiến tiêm">
                  {campaign?.scheduledDate
                    ? dayjs(campaign.scheduledDate).format("DD/MM/YYYY")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả chiến dịch">
                  {campaign?.description || "-"}
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Loại liều">
              {getDoseLabel(vaccination?.doseType)}
            </Descriptions.Item>
            <Descriptions.Item label="Y tá thực hiện">
              {vaccination?.nurse?.user?.fullName || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(vaccination?.status)}
            </Descriptions.Item>
          </Descriptions>
          {isNotVaccinated && (
            <>
              <Divider orientation="left">Thông tin phụ huynh</Divider>
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Trạng thái đồng ý tiêm">
                  {consent
                    ? consent.consent
                      ? "Đồng ý"
                      : "Không đồng ý"
                    : "Chưa xác nhận"}
                </Descriptions.Item>
                <Descriptions.Item label="Phụ huynh">
                  {campaign?.consents?.parentName || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="SĐT">
                  {parentInfo?.phone || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {parentInfo?.email || "-"}
                </Descriptions.Item>
                {consent?.notes && (
                  <Descriptions.Item label="Ghi chú phụ huynh" span={2}>
                    {consent.notes}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </>
          )}
          <Divider orientation="left">Tác dụng phụ & phản ứng</Divider>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Tác dụng phụ">
              {vaccination?.sideEffects || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Phản ứng sau tiêm">
              {getReactionLabel(vaccination?.reaction)}
            </Descriptions.Item>
          </Descriptions>
          <Divider orientation="left">Ghi chú</Divider>
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
