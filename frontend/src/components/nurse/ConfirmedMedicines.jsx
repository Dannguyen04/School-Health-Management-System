import {
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Image,
  Input,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { TextArea } = Input;

const ConfirmedMedicines = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [confirmationForm] = Form.useForm();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Lấy danh sách yêu cầu thuốc đang chờ phê duyệt
  const fetchPendingRequests = async (filters = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (filters.studentName)
        params.append("studentName", filters.studentName);
      if (filters.parentName) params.append("parentName", filters.parentName);
      if (filters.medicationName)
        params.append("medicationName", filters.medicationName);

      const response = await axios.get(
        `/api/nurse/medication-requests?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      message.error("Lỗi khi tải danh sách yêu cầu thuốc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const columns = [
    {
      title: "Tên học sinh",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Phụ huynh",
      dataIndex: "parentName",
      key: "parentName",
    },
    {
      title: "Thuốc",
      dataIndex: "medicationName",
      key: "medicationName",
    },
    {
      title: "Liều lượng",
      dataIndex: "dosage",
      key: "dosage",
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Tần suất",
      dataIndex: "frequency",
      key: "frequency",
      render: (frequency) => {
        const freqMap = {
          once: "1 lần/ngày",
          twice: "2 lần/ngày",
          three: "3 lần/ngày",
          four: "4 lần/ngày",
        };
        return freqMap[frequency] || frequency || "-";
      },
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record)}
          ></Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleReject(record)}
          ></Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetails(record)}
          ></Button>
        </Space>
      ),
    },
  ];

  const medicationTypeLabel = {
    "giam-dau": "Giảm đau, hạ sốt",
    "khang-sinh": "Kháng sinh",
    "ho-hap": "Hô hấp",
    "tieu-hoa": "Tiêu hóa",
    khac: "Khác",
  };
  const frequencyLabel = {
    once: "1 lần/ngày",
    twice: "2 lần/ngày",
    three: "3 lần/ngày",
    four: "4 lần/ngày",
    "as-needed": "Khi cần",
    custom: "Tùy chỉnh",
  };

  const handleApprove = (record) => {
    setSelectedMedicine({ ...record, action: "APPROVE" });
    setIsModalVisible(true);
  };

  const handleReject = (record) => {
    setSelectedMedicine({ ...record, action: "REJECT" });
    setIsModalVisible(true);
  };

  const handleViewDetails = async (record) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/nurse/medication-requests/${record.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setDetailData(response.data.data);
        setDetailLoading(false);
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      message.error("Lỗi khi tải chi tiết yêu cầu");
      setDetailLoading(false);
    }
  };

  const handleSearch = (values) => {
    fetchPendingRequests(values);
  };

  const handleResetFilters = () => {
    searchForm.resetFields();
    fetchPendingRequests();
  };

  const handleSubmit = async () => {
    try {
      const values = await confirmationForm.validateFields();
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `/api/nurse/medication-requests/${selectedMedicine.id}/approve`,
        {
          action: selectedMedicine.action,
          notes: values.notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        message.success(response.data.message);
        setIsModalVisible(false);
        confirmationForm.resetFields();
        setSelectedMedicine(null);
        fetchPendingRequests(); // Refresh data
      }
    } catch (error) {
      console.error("Error approving/rejecting request:", error);
      message.error("Lỗi khi xử lý yêu cầu");
    }
  };

  // Modal chi tiết thuốc (UI mới chuyên nghiệp)
  const renderDetailModal = () => (
    <Modal
      open={detailModalOpen}
      onCancel={() => {
        setDetailModalOpen(false);
        setDetailData(null);
        setDetailLoading(false);
      }}
      footer={[
        <Button
          key="close"
          type="primary"
          style={{ minWidth: 100, borderRadius: 24, fontWeight: 600 }}
          onClick={() => {
            setDetailModalOpen(false);
            setDetailData(null);
            setDetailLoading(false);
          }}
        >
          Đóng
        </Button>,
      ]}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileTextOutlined style={{ color: "#36ae9a", fontSize: 22 }} />
          <span style={{ fontWeight: 700, fontSize: 18 }}>
            Chi tiết yêu cầu thuốc
          </span>
        </div>
      }
      width={700}
      bodyStyle={{ padding: 28, paddingTop: 18 }}
    >
      {detailLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : (
        detailData && (
          <div>
            {/* Ảnh thuốc */}
            {(detailData.image || detailData.prescriptionImage) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 18,
                }}
              >
                <Image
                  src={detailData.image || detailData.prescriptionImage}
                  alt="Ảnh thuốc"
                  style={{
                    maxWidth: 180,
                    maxHeight: 180,
                    borderRadius: 12,
                    boxShadow: "0 2px 8px #e0e0e0",
                  }}
                />
              </div>
            )}
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              {detailData.medicationName}
            </Typography.Title>
            <Typography.Text type="secondary">
              {detailData.medicationDescription || (
                <span style={{ color: "#bbb" }}>Không có mô tả</span>
              )}
            </Typography.Text>
            <Divider orientation="left" style={{ marginTop: 18 }}>
              Thông tin học sinh & phụ huynh
            </Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Học sinh">
                {detailData.studentName}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp">
                {detailData.studentGrade}
              </Descriptions.Item>
              <Descriptions.Item label="Phụ huynh">
                {detailData.parentName}
              </Descriptions.Item>
              <Descriptions.Item label="Email phụ huynh">
                {detailData.parentEmail}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT phụ huynh">
                {detailData.parentPhone || "N/A"}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left" style={{ marginTop: 18 }}>
              Thông tin thuốc
            </Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Tên thuốc">
                {detailData.medicationName}
              </Descriptions.Item>
              <Descriptions.Item label="Loại">
                {medicationTypeLabel[detailData.medicationType] ||
                  detailData.medicationType ||
                  "-"}{" "}
              </Descriptions.Item>
              <Descriptions.Item label="Liều lượng">
                {detailData.dosage
                  ? `${detailData.medicationDosage} ${
                      detailData.medicationUnit || ""
                    }`
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tần suất">
                {(() => {
                  const freqMap = {
                    once: "1 lần/ngày",
                    twice: "2 lần/ngày",
                    three: "3 lần/ngày",
                    four: "4 lần/ngày",
                  };
                  return (
                    freqMap[detailData.frequency] || detailData.frequency || "-"
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Hướng dẫn">
                {detailData.instructions || (
                  <span style={{ color: "#bbb" }}>Không có</span>
                )}
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left" style={{ marginTop: 18 }}>
              Ngày tháng & trạng thái
            </Divider>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Ngày bắt đầu">
                {detailData.startDate
                  ? new Date(detailData.startDate).toLocaleDateString("vi-VN")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">
                {detailData.endDate
                  ? new Date(detailData.endDate).toLocaleDateString("vi-VN")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {detailData.createdAt
                  ? new Date(detailData.createdAt).toLocaleDateString("vi-VN")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái duyệt">
                {detailData.status ? (
                  <Tag
                    color={
                      detailData.status === "APPROVED"
                        ? "green"
                        : detailData.status === "REJECTED"
                        ? "red"
                        : "orange"
                    }
                  >
                    {detailData.status === "APPROVED"
                      ? "Đã duyệt"
                      : detailData.status === "REJECTED"
                      ? "Từ chối"
                      : "Chờ duyệt"}
                  </Tag>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
            </Descriptions>
            {detailData.healthProfile && (
              <>
                <Divider orientation="left" style={{ marginTop: 18 }}>
                  Thông tin sức khỏe
                </Divider>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="Dị ứng">
                    {Array.isArray(detailData.healthProfile.allergies)
                      ? detailData.healthProfile.allergies.length > 0
                        ? detailData.healthProfile.allergies
                            .map(
                              (item) =>
                                item.name || item.group || JSON.stringify(item)
                            )
                            .join(", ")
                        : "Không có"
                      : detailData.healthProfile.allergies || "Không có"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Bệnh mãn tính">
                    {Array.isArray(detailData.healthProfile.chronicDiseases)
                      ? detailData.healthProfile.chronicDiseases.length > 0
                        ? detailData.healthProfile.chronicDiseases
                            .map(
                              (item) =>
                                item.name || item.group || JSON.stringify(item)
                            )
                            .join(", ")
                        : "Không có"
                      : detailData.healthProfile.chronicDiseases || "Không có"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thuốc đang dùng">
                    {Array.isArray(detailData.healthProfile.medications)
                      ? detailData.healthProfile.medications.length > 0
                        ? detailData.healthProfile.medications
                            .map(
                              (item) =>
                                item.name || item.group || JSON.stringify(item)
                            )
                            .join(", ")
                        : "Không có"
                      : detailData.healthProfile.medications || "Không có"}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </div>
        )
      )}
    </Modal>
  );

  // Helper lấy loại thuốc từ selectedMedicine
  const getMedicineType = (medicine) =>
    medicine?.medicationType || medicine?.type || "";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Thuốc đang chờ phê duyệt</h1>
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="studentName" label="Tên học sinh">
                <Input placeholder="Nhập tên học sinh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="parentName" label="Tên phụ huynh">
                <Input placeholder="Nhập tên phụ huynh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="medicationName" label="Tên thuốc">
                <Input placeholder="Nhập tên thuốc" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="text-right">
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                >
                  Tìm kiếm
                </Button>
                <Button onClick={handleResetFilters}>Xóa bộ lọc</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            dataSource={data}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showQuickJumper: true,
            }}
          />
        </Spin>
      </Card>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileTextOutlined
              style={{
                color:
                  selectedMedicine?.action === "APPROVE"
                    ? "#36ae9a"
                    : "#cf1322",
                fontSize: 22,
              }}
            />
            <span style={{ fontWeight: 700, fontSize: 18 }}>
              {selectedMedicine?.action === "APPROVE" ? "Phê duyệt" : "Từ chối"}{" "}
              yêu cầu thuốc
            </span>
          </div>
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          confirmationForm.resetFields();
          setSelectedMedicine(null);
        }}
        width={520}
        okText={
          selectedMedicine?.action === "APPROVE" ? "Phê duyệt" : "Từ chối"
        }
        cancelText="Hủy"
        okButtonProps={{
          type: selectedMedicine?.action === "APPROVE" ? "primary" : "default",
          danger: selectedMedicine?.action === "REJECT",
        }}
        bodyStyle={{ padding: 28, paddingTop: 18 }}
      >
        {selectedMedicine && (
          <>
            <Typography.Title level={5} style={{ marginBottom: 0 }}>
              {selectedMedicine.medicationName}
            </Typography.Title>
            <Divider style={{ margin: "12px 0" }} />
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Học sinh">
                {selectedMedicine.studentName}
              </Descriptions.Item>
              <Descriptions.Item label="Loại">
                {medicationTypeLabel[getMedicineType(selectedMedicine)] ||
                  getMedicineType(selectedMedicine) ||
                  "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Liều lượng">
                {selectedMedicine.dosage} {selectedMedicine.unit}
              </Descriptions.Item>
              <Descriptions.Item label="Tần suất">
                {frequencyLabel[selectedMedicine.frequency] ||
                  selectedMedicine.frequency ||
                  "-"}
              </Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: "12px 0" }} />
          </>
        )}
        <Form form={confirmationForm} layout="vertical">
          <Form.Item name="notes" label="Ghi chú">
            <TextArea
              rows={4}
              placeholder={`Ghi chú cho việc ${
                selectedMedicine?.action === "APPROVE" ? "phê duyệt" : "từ chối"
              } yêu cầu này`}
            />
          </Form.Item>
        </Form>
      </Modal>

      {renderDetailModal()}
    </div>
  );
};

export default ConfirmedMedicines;
