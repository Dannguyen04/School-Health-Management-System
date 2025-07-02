import {
  ExclamationCircleTwoTone,
  MedicineBoxOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Col, Divider, Modal, Row, Tag } from "antd";
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
  // Kiểm tra trường hợp chưa tiêm
  const isNotVaccinated = vaccination?.notVaccinated;
  const campaign = isNotVaccinated
    ? vaccination?.campaign
    : vaccination?.campaign;
  const student = isNotVaccinated ? vaccination?.student : vaccination?.student;
  const consent = isNotVaccinated ? vaccination?.consent : null;
  // Lấy thông tin phụ huynh đầu tiên (nếu có)
  const parentInfo = student?.parents?.[0]?.parent?.user;
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
          {/* Thông tin chính */}
          <Row gutter={[16, 16]} align="middle">
            <Col span={12}>
              <div className="mb-2 text-base text-gray-500">Học sinh</div>
              <div className="font-semibold flex items-center gap-2">
                <UserOutlined />
                {student?.user?.fullName || "Không có"}
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-2 text-base text-gray-500">Chiến dịch</div>
              <div className="font-semibold">
                {campaign?.name || "Không có"}
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-2 text-base text-gray-500">Loại vắc xin</div>
              <div className="font-semibold">
                {vaccination?.vaccineName ||
                  campaign?.vaccinations?.[0]?.name ||
                  "-"}
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-2 text-base text-gray-500">Ngày tiêm</div>
              <div className="font-semibold">
                {isNotVaccinated ? (
                  <span className="text-gray-400">Chưa tiêm</span>
                ) : vaccination?.administeredDate ? (
                  dayjs(vaccination.administeredDate).format("DD/MM/YYYY")
                ) : (
                  <span className="text-gray-400">Chưa tiêm</span>
                )}
              </div>
            </Col>
            {/* Nếu chưa tiêm, hiển thị ngày dự kiến tiêm và mô tả chiến dịch */}
            {isNotVaccinated && (
              <>
                <Col span={12}>
                  <div className="mb-2 text-base text-gray-500">
                    Ngày dự kiến tiêm
                  </div>
                  <div className="font-semibold">
                    {campaign?.scheduledDate
                      ? dayjs(campaign.scheduledDate).format("DD/MM/YYYY")
                      : "-"}
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mb-2 text-base text-gray-500">
                    Mô tả chiến dịch
                  </div>
                  <div>{campaign?.description || "-"}</div>
                </Col>
              </>
            )}
          </Row>
          <Divider />
          {/* Thông tin bổ sung */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="mb-2 text-base text-gray-500">Loại liều</div>
              <div>{getDoseLabel(vaccination?.dose)}</div>
            </Col>
            <Col span={12}>
              <div className="mb-2 text-base text-gray-500">Y tá thực hiện</div>
              <div>{vaccination?.nurse?.user?.fullName || "-"}</div>
            </Col>
            <Col span={12}>
              <div className="mb-2 text-base text-gray-500">Trạng thái</div>
              <div>{getStatusTag(vaccination?.status)}</div>
            </Col>
            {/* Nếu chưa tiêm, hiển thị trạng thái đồng ý tiêm và thông tin phụ huynh */}
            {isNotVaccinated && (
              <>
                <Col span={12}>
                  <div className="mb-2 text-base text-gray-500">
                    Trạng thái đồng ý tiêm
                  </div>
                  <div>
                    {consent
                      ? consent.consent
                        ? "Đồng ý"
                        : "Không đồng ý"
                      : "Chưa xác nhận"}
                  </div>
                </Col>
                <Col span={12}>
                  <div className="mb-2 text-base text-gray-500">Phụ huynh</div>
                  <div>{parentInfo?.fullName || "-"}</div>
                  <div>{parentInfo?.phone || "-"}</div>
                  <div>{parentInfo?.email || "-"}</div>
                </Col>
                {consent?.notes && (
                  <Col span={24}>
                    <div className="mb-2 text-base text-gray-500">
                      Ghi chú phụ huynh
                    </div>
                    <div>{consent.notes}</div>
                  </Col>
                )}
              </>
            )}
          </Row>
          <Divider />
          {/* Tác dụng phụ & phản ứng */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="mb-2 text-base text-gray-500">Tác dụng phụ</div>
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
