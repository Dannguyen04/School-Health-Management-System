import {
  CheckOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

const { TextArea } = Input;
const { Text, Title } = Typography;

const StudentTreatment = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [form] = Form.useForm();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState({ logs: [], summary: {} });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTitle, setHistoryTitle] = useState("");
  const [summary, setSummary] = useState({});
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [errorModal, setErrorModal] = useState({ visible: false, message: "" });

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/nurse/student-treatments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setTreatments(response.data.data);
        setSummary(response.data.summary || {});
      } else {
        setTreatments([]);
        setSummary({});
      }
    } catch (error) {
      console.error("Error fetching treatments:", error);
      message.error("Lỗi khi tải danh sách điều trị");
      setTreatments([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  const handleGiveMedication = (record) => {
    if (!record.canAdminister) {
      const reasons = record.warnings.join(", ");
      message.warning(`Không thể cấp phát thuốc: ${reasons}`);
      return;
    }
    setSelectedTreatment(record);
    form.setFieldsValue({
      quantityUsed: 1,
      dosageGiven: record.dosage,
      notes: "",
    });
    setIsModalVisible(true);
  };

  const handleViewDetails = (record) => {
    setDetailRecord(record);
    setDetailModalVisible(true);
  };

  const handleViewHistory = async (record) => {
    setHistoryModalVisible(true);
    setHistoryLoading(true);
    setHistoryTitle(`${record.studentName} - ${record.medication.name}`);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/nurse/medication-history/${record.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setHistoryData(response.data.data);
      } else {
        setHistoryData({ logs: [], summary: {} });
      }
    } catch (error) {
      setHistoryData({ logs: [], summary: {} });
      console.error("Error fetching medication history:", error);
      message.error("Lỗi khi lấy lịch sử cấp phát thuốc");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `/api/nurse/give-medicine/${selectedTreatment.id}`,
        {
          quantityUsed: values.quantityUsed,
          dosageGiven: values.dosageGiven,
          notes: values.notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        message.success("Đã ghi nhận cấp phát thuốc thành công");

        // Hiển thị cảnh báo nếu có
        if (response.data.warnings && response.data.warnings.length > 0) {
          Modal.warning({
            title: "Cảnh báo",
            content: (
              <ul>
                {response.data.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            ),
          });
        }
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedTreatment(null);
      fetchTreatments();
    } catch (error) {
      console.log("CATCH ERROR", error, error.response?.data);
      setIsModalVisible(false);
      setSelectedTreatment(null);

      setTimeout(() => {
        if (error.response?.data?.error) {
          setErrorModal({
            visible: true,
            message: error.response.data.error,
          });
        } else {
          setErrorModal({
            visible: true,
            message: "Lỗi khi ghi nhận cấp phát thuốc",
          });
        }
      }, 300);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStopTreatment = async (record) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/nurse/student-treatments/${record.id}/stop`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Đã dừng điều trị cho học sinh này");
      fetchTreatments();
    } catch {
      message.error("Lỗi khi dừng điều trị");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "green";
      case "low_stock":
        return "orange";
      case "out_of_stock":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Có sẵn";
      case "low_stock":
        return "Tồn kho thấp";
      case "out_of_stock":
        return "Hết hàng";
      default:
        return "Không xác định";
    }
  };

  const getFrequencyText = (frequency) => {
    const freqMap = {
      once: "1 lần/ngày",
      twice: "2 lần/ngày",
      three: "3 lần/ngày",
      four: "4 lần/ngày",
    };
    return freqMap[frequency] || frequency || "-";
  };

  const columns = [
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <Text type="secondary" className="text-xs">
            {record.studentCode} -{record.class}
          </Text>
        </div>
      ),
    },
    {
      title: "Thuốc",
      dataIndex: "medication",
      key: "medication",
      render: (medication) => (
        <div>
          <div className="font-medium">{medication.name}</div>
          <Text type="secondary" className="text-xs">
            Tồn kho: {medication.stockQuantity} {medication.unit}
          </Text>
          <div className="mt-1">
            <Tag color={getStatusColor(medication.stockStatus)} size="small">
              {getStatusText(medication.stockStatus)}
            </Tag>
            {medication.expiryStatus === "expiring_soon" && (
              <Tag color="orange" size="small">
                Sắp hết hạn
              </Tag>
            )}
            {medication.expiryStatus === "expired" && (
              <Tag color="red" size="small">
                Hết hạn
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Liều lượng",
      dataIndex: "dosage",
      key: "dosage",
      render: (dosage, record) => {
        return (
          <div>
            <div>{dosage}</div>
            <Text type="secondary" className="text-xs">
              Hôm nay: {record.todayDosage} / {record.dailyLimit}
            </Text>
          </div>
        );
      },
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
      title: "Trạng thái",
      key: "status",
      render: (_, record) => (
        <div className="space-y-1">
          <Tag color={record.canAdminister ? "green" : "red"}>
            {record.canAdminister ? "Có thể cấp phát" : "Không thể cấp phát"}
          </Tag>
          {record.treatmentStatus === "STOPPED" && (
            <Tag color="default">Đã dừng điều trị</Tag>
          )}
          {record.warnings.length > 0 && (
            <Tooltip title={record.warnings.join(", ")}>
              <Badge count={record.warnings.length} size="small">
                <WarningOutlined style={{ color: "#faad14" }} />
              </Badge>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Cấp phát thuốc">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleGiveMedication(record)}
              disabled={
                !record.canAdminister || record.treatmentStatus !== "ONGOING"
              }
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Lịch sử cấp phát">
            <Button
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            />
          </Tooltip>
          {record.treatmentStatus === "ONGOING" && (
            <Popconfirm
              title="Bạn chắc chắn muốn dừng điều trị học sinh này?"
              onConfirm={() => handleStopTreatment(record)}
              okText="Dừng"
              cancelText="Hủy"
            >
              <Button danger type="dashed">
                Dừng điều trị
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2">
            Điều trị học sinh
          </Title>
          <Text type="secondary">Quản lý cấp phát thuốc cho học sinh</Text>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      {summary && Object.keys(summary).length > 0 && (
        <Row gutter={16} className="mb-6">
          <Col span={4}>
            <Card>
              <Statistic
                title="Tổng số"
                value={summary.total}
                prefix={<MedicineBoxOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Có thể cấp phát"
                value={summary.canAdminister}
                valueStyle={{ color: "#3f8600" }}
                prefix={<CheckOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Tồn kho thấp"
                value={summary.lowStock}
                valueStyle={{ color: "#faad14" }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Hết hàng"
                value={summary.outOfStock}
                valueStyle={{ color: "#cf1322" }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Sắp hết hạn"
                value={summary.expiringSoon}
                valueStyle={{ color: "#faad14" }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Đã hết hạn"
                value={summary.expired}
                valueStyle={{ color: "#cf1322" }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Spin spinning={loading}>
          <Table
            dataSource={treatments}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showQuickJumper: true,
            }}
          />
        </Spin>
      </Card>

      {/* Modal cấp phát thuốc */}
      <Modal
        title={
          <div>
            <CheckOutlined className="mr-2" />
            Cấp phát thuốc
          </div>
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedTreatment(null);
        }}
        width={600}
        confirmLoading={submitting}
        okText="Xác nhận cấp phát"
        cancelText="Hủy"
      >
        {selectedTreatment && (
          <div className="mb-4">
            <Alert
              message="Thông tin cấp phát"
              description={
                <div className="space-y-2">
                  <div>
                    <strong>Học sinh:</strong> {selectedTreatment.studentName}
                  </div>
                  <div>
                    <strong>Thuốc:</strong> {selectedTreatment.medication.name}
                  </div>
                  <div>
                    <strong>Tồn kho hiện tại:</strong>{" "}
                    {selectedTreatment.medication.stockQuantity}{" "}
                    {selectedTreatment.medication.unit}
                  </div>
                  <div>
                    <strong>Liều dùng hôm nay:</strong>{" "}
                    {selectedTreatment.todayDosage} /{" "}
                    {selectedTreatment.dailyLimit}{" "}
                    {selectedTreatment.medication.unit}
                  </div>
                </div>
              }
              type="info"
              showIcon
            />
          </div>
        )}

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantityUsed"
                label="Số lượng cấp phát"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng" },
                  {
                    type: "number",
                    min: 1,
                    message: "Số lượng phải lớn hơn 0",
                  },
                  {
                    validator: (_, value) => {
                      if (
                        selectedTreatment &&
                        value > selectedTreatment.medication.stockQuantity
                      ) {
                        return Promise.reject(
                          new Error("Số lượng vượt quá tồn kho")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={selectedTreatment?.medication?.stockQuantity || 999}
                  style={{ width: "100%" }}
                  addonAfter={selectedTreatment?.medication?.unit}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dosageGiven"
                label="Liều dùng thực tế"
                rules={[
                  { required: true, message: "Vui lòng nhập liều dùng" },
                  {
                    type: "number",
                    min: 0.1,
                    message: "Liều dùng phải lớn hơn 0",
                  },
                  {
                    validator: (_, value) => {
                      if (
                        selectedTreatment &&
                        value >
                          selectedTreatment.dailyLimit -
                            selectedTreatment.todayDosage
                      ) {
                        return Promise.reject(
                          new Error("Liều dùng vượt quá giới hạn ngày")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  min={0.1}
                  step={0.1}
                  style={{ width: "100%" }}
                  addonAfter={selectedTreatment?.medication?.unit}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea
              rows={4}
              placeholder="Ghi chú về việc cấp phát thuốc, quan sát của học sinh, v.v."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal lịch sử cấp phát */}
      <Modal
        title={
          <div>
            <HistoryOutlined className="mr-2" />
            Lịch sử cấp phát thuốc: {historyTitle}
          </div>
        }
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={
          <Button onClick={() => setHistoryModalVisible(false)}>Đóng</Button>
        }
        width={800}
      >
        <Spin spinning={historyLoading}>
          {historyData.logs && historyData.logs.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#888", padding: "40px" }}
            >
              <HistoryOutlined
                style={{ fontSize: "48px", marginBottom: "16px" }}
              />
              <div>Chưa có lịch sử cấp phát thuốc</div>
            </div>
          ) : (
            <div>
              {/* Thống kê lịch sử */}
              {historyData.summary && (
                <Row gutter={16} className="mb-4">
                  <Col span={8}>
                    <Statistic
                      title="Tổng số lần"
                      value={historyData.summary.totalAdministrations}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Tổng liều dùng"
                      value={historyData.summary.totalDosage}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Liều trung bình"
                      value={historyData.summary.averageDosage}
                    />
                  </Col>
                </Row>
              )}

              <Table
                dataSource={historyData.logs}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                }}
                columns={[
                  {
                    title: "Thời gian",
                    dataIndex: "formattedTime",
                    key: "formattedTime",
                    width: 150,
                  },
                  {
                    title: "Người cấp phát",
                    dataIndex: "nurseName",
                    key: "nurseName",
                    width: 120,
                  },
                  {
                    title: "Liều dùng",
                    dataIndex: "dosageGiven",
                    key: "dosageGiven",
                    width: 100,
                    render: (value, record) =>
                      `${value} ${record.medicationUnit}`,
                  },
                  {
                    title: "Ghi chú",
                    dataIndex: "notes",
                    key: "notes",
                    render: (val) => val || "-",
                  },
                ]}
              />
            </div>
          )}
        </Spin>
      </Modal>

      {/* Modal xem chi tiết điều trị học sinh */}
      <Modal
        title="Chi tiết điều trị"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          <Button onClick={() => setDetailModalVisible(false)}>Đóng</Button>
        }
        width={600}
      >
        {detailRecord && (
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-3">
                  <Text strong>Học sinh:</Text>
                  <div>{detailRecord.studentName}</div>
                  <Text type="secondary">Mã: {detailRecord.studentCode}</Text>
                </div>
                <div className="mb-3">
                  <Text strong>Lớp:</Text>
                  <div>{detailRecord.class}</div>
                </div>
                <div className="mb-3">
                  <Text strong>Phụ huynh:</Text>
                  <div>{detailRecord.parentName}</div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-3">
                  <Text strong>Thuốc:</Text>
                  <div>{detailRecord.medication.name}</div>
                  <Text type="secondary">
                    {detailRecord.medication.description}
                  </Text>
                </div>
                <div className="mb-3">
                  <Text strong>Liều lượng:</Text>
                  <div>{detailRecord.dosage}</div>
                </div>
                <div className="mb-3">
                  <Text strong>Tần suất:</Text>
                  <div>{getFrequencyText(detailRecord.frequency)}</div>
                </div>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <div className="mb-3">
                  <Text strong>Ngày bắt đầu:</Text>
                  <div>
                    {detailRecord.startDate
                      ? new Date(detailRecord.startDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "-"}
                  </div>
                </div>
                <div className="mb-3">
                  <Text strong>Ngày kết thúc:</Text>
                  <div>
                    {detailRecord.endDate
                      ? new Date(detailRecord.endDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "-"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mb-3">
                  <Text strong>Liều dùng hôm nay:</Text>
                  <div>
                    {detailRecord.todayDosage} / {detailRecord.dailyLimit}{" "}
                    {detailRecord.medication.unit}
                  </div>
                </div>
                <div className="mb-3">
                  <Text strong>Lần cuối cấp phát:</Text>
                  <div>
                    {detailRecord.lastAdministration
                      ? new Date(
                          detailRecord.lastAdministration
                        ).toLocaleString("vi-VN")
                      : "Chưa có"}
                  </div>
                </div>
              </Col>
            </Row>
            {detailRecord.warnings && detailRecord.warnings.length > 0 && (
              <>
                <Divider />
                <Alert
                  message="Cảnh báo"
                  description={
                    <ul>
                      {detailRecord.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  }
                  type="warning"
                  showIcon
                />
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Error Modal */}
      {errorModal.visible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setErrorModal({ visible: false, message: "" })}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#ff4d4f", marginBottom: "16px" }}>
              Lỗi cấp phát thuốc
            </h3>
            <p style={{ marginBottom: "16px" }}>{errorModal.message}</p>
            <Button
              type="primary"
              danger
              onClick={() => setErrorModal({ visible: false, message: "" })}
            >
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTreatment;
