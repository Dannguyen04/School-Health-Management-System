import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Modal,
  Row,
  Select,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const VaccinationReports = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [consents, setConsents] = useState([]);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ visible: false, consent: null });
  const [vaccineRecordDetail, setVaccineRecordDetail] = useState(null);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/manager/vaccination-campaigns", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCampaigns(res.data.data || []);
      } catch {
        setCampaigns([]);
      }
    };
    fetchCampaigns();
  }, []);

  // Fetch consents when campaign selected
  useEffect(() => {
    if (!selectedCampaign) return;
    const fetchConsents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `/api/manager/vaccination-campaigns/${selectedCampaign}/consents`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCampaignDetail(res.data.data.campaign);
        setConsents(res.data.data.consents || []);
      } catch {
        setCampaignDetail(null);
        setConsents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConsents();
  }, [selectedCampaign]);

  // Statistics
  const total = consents.length;
  const agreed = consents.filter((c) => c.consent === true).length;
  const declined = consents.filter((c) => c.consent === false).length;
  const agreeRate = total > 0 ? Math.round((agreed / total) * 100) : 0;

  // Table columns
  const columns = [
    {
      title: "Học sinh",
      dataIndex: ["student", "user", "fullName"],
      key: "studentName",
    },
    {
      title: "Lớp",
      dataIndex: ["student", "class"],
      key: "class",
    },
    {
      title: "Phụ huynh",
      dataIndex: ["parent", "user", "fullName"],
      key: "parentName",
    },
    {
      title: "Trạng thái",
      dataIndex: "consent",
      key: "consent",
      render: (consent) => (
        <Tag color={consent ? "success" : "error"}>
          {consent ? "Đã đồng ý" : "Đã từ chối"}
        </Tag>
      ),
    },
    {
      title: "Ngày gửi",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          shape="round"
          style={{ fontWeight: 500 }}
          onClick={() => setModal({ visible: true, consent: record })}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (
      modal.visible &&
      modal.consent &&
      modal.consent.campaignId &&
      modal.consent.student?.id
    ) {
      const token = localStorage.getItem("accessToken");
      axios
        .get(
          `/api/manager/vaccination-campaigns/vaccination-report/${modal.consent.campaignId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          const data = res.data;
          if (data.success && Array.isArray(data.data)) {
            const record = data.data.find(
              (r) => r.studentId === modal.consent.student.id
            );
            setVaccineRecordDetail(record || null);
          } else {
            setVaccineRecordDetail(null);
          }
        })
        .catch(() => setVaccineRecordDetail(null));
    } else {
      setVaccineRecordDetail(null);
    }
  }, [modal.visible, modal.consent]);

  return (
    <div className="space-y-6">
      <Typography.Title level={2}>Báo cáo tiêm chủng</Typography.Title>
      <Card>
        <Select
          showSearch
          placeholder="Chọn chiến dịch tiêm chủng"
          style={{ width: 350, marginBottom: 16 }}
          value={selectedCampaign}
          onChange={setSelectedCampaign}
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {campaigns.map((c) => (
            <Select.Option key={c.id} value={c.id}>
              {c.name} ({new Date(c.scheduledDate).toLocaleDateString()} -{" "}
              {new Date(c.deadline).toLocaleDateString()})
            </Select.Option>
          ))}
        </Select>
        {loading ? (
          <Spin />
        ) : selectedCampaign && campaignDetail ? (
          <div className="space-y-6">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tổng số phiếu"
                    value={total}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Đã đồng ý"
                    value={agreed}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Đã từ chối"
                    value={declined}
                    valueStyle={{ color: "#ff4d4f" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tỷ lệ đồng ý"
                    value={agreeRate}
                    suffix="%"
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
            </Row>
            <Card
              title={
                <span>
                  Loại vaccine:{" "}
                  <b>
                    {campaignDetail.vaccine?.name ||
                      campaignDetail.vaccinations?.[0]?.name ||
                      ""}
                  </b>
                </span>
              }
            >
              <Table
                dataSource={consents}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5, showQuickJumper: true }}
                locale={{ emptyText: "Không có phiếu nào" }}
              />
            </Card>
            <Modal
              open={modal.visible}
              onCancel={() => setModal({ visible: false, consent: null })}
              footer={null}
              width={600}
              title="Chi tiết phiếu tiêm chủng"
            >
              {modal.consent && (
                <div>
                  <Typography.Title level={4} style={{ marginBottom: 0 }}>
                    Tên học sinh: {modal.consent.student?.user?.fullName || ""}
                  </Typography.Title>
                  <Divider style={{ margin: "8px 0" }} />
                  {/* Thông tin học sinh & phụ huynh */}
                  <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="Mã học sinh">
                      {modal.consent.student?.studentCode || ""}
                    </Descriptions.Item>
                    <Descriptions.Item label="Lớp">
                      {modal.consent.student?.class || ""}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phụ huynh">
                      {modal.consent.parent?.user?.fullName || ""}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email phụ huynh">
                      {modal.consent.parent?.user?.email || ""}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái đồng ý">
                      <Tag color={modal.consent.consent ? "success" : "error"}>
                        {modal.consent.consent ? "Đã đồng ý" : "Đã từ chối"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày gửi">
                      {modal.consent.submittedAt
                        ? new Date(
                            modal.consent.submittedAt
                          ).toLocaleDateString("vi-VN")
                        : ""}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider orientation="left" style={{ marginTop: 16 }}>
                    Thông tin tiêm chủng
                  </Divider>
                  <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="Loại vaccine">
                      {campaignDetail?.vaccine?.name ||
                        campaignDetail?.vaccinations?.[0]?.name ||
                        ""}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lô vaccine">
                      {vaccineRecordDetail?.batchNumber ||
                        modal.consent.batchNumber ||
                        ""}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại liều">
                      {(() => {
                        const dose =
                          vaccineRecordDetail?.dose || modal.consent.dose;
                        switch (dose) {
                          case "FIRST":
                            return "Liều đầu tiên";
                          case "SECOND":
                            return "Liều thứ hai";
                          case "BOOSTER":
                            return "Liều nhắc lại";
                          default:
                            return dose || "";
                        }
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tiêm">
                      {vaccineRecordDetail?.administeredDate
                        ? new Date(
                            vaccineRecordDetail.administeredDate
                          ).toLocaleDateString("vi-VN")
                        : modal.consent.administeredDate
                        ? new Date(
                            modal.consent.administeredDate
                          ).toLocaleDateString("vi-VN")
                        : ""}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider orientation="left" style={{ marginTop: 16 }}>
                    Theo dõi & Phản ứng
                  </Divider>
                  <Descriptions column={2} size="small" bordered>
                    <Descriptions.Item label="Tác dụng phụ">
                      {vaccineRecordDetail?.sideEffects ||
                        modal.consent.sideEffects ||
                        "Không có"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phản ứng sau tiêm">
                      {(() => {
                        const reaction =
                          vaccineRecordDetail?.reaction ||
                          modal.consent.reaction;
                        switch (reaction) {
                          case "NONE":
                            return "Không có";
                          case "MILD":
                            return "Nhẹ";
                          case "MODERATE":
                            return "Vừa";
                          case "SEVERE":
                            return "Nặng";
                          default:
                            return reaction || "";
                        }
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cần theo dõi">
                      {vaccineRecordDetail?.followUpRequired ??
                      modal.consent.followUpRequired
                        ? "Có"
                        : "Không"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày theo dõi">
                      {vaccineRecordDetail?.followUpDate
                        ? new Date(
                            vaccineRecordDetail.followUpDate
                          ).toLocaleDateString("vi-VN")
                        : modal.consent.followUpDate
                        ? new Date(
                            modal.consent.followUpDate
                          ).toLocaleDateString("vi-VN")
                        : ""}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider orientation="left" style={{ marginTop: 16 }}>
                    Ghi chú
                  </Divider>
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Ghi chú">
                      {vaccineRecordDetail?.notes ||
                        modal.consent.notes ||
                        "Không có"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú bổ sung">
                      {vaccineRecordDetail?.additionalNotes ||
                        modal.consent.additionalNotes ||
                        "Không có"}
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider orientation="left" style={{ marginTop: 16 }}>
                    Trạng thái tiêm chủng
                  </Divider>
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Trạng thái">
                      {(() => {
                        const status =
                          vaccineRecordDetail?.status || modal.consent.status;
                        switch (status) {
                          case "COMPLETED":
                            return <Tag color="green">Đã tiêm</Tag>;
                          case "SCHEDULED":
                            return <Tag color="blue">Đã lên lịch</Tag>;
                          case "POSTPONED":
                            return <Tag color="orange">Hoãn</Tag>;
                          case "CANCELLED":
                            return <Tag color="red">Hủy</Tag>;
                          default:
                            return status || "-";
                        }
                      })()}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              )}
            </Modal>
          </div>
        ) : (
          <div>Vui lòng chọn chiến dịch để xem báo cáo</div>
        )}
      </Card>
    </div>
  );
};

export default VaccinationReports;
