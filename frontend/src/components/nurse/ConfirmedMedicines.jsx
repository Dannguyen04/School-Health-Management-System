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
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Table,
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

  const handleApprove = (record) => {
    setSelectedMedicine({ ...record, action: "APPROVE" });
    setIsModalVisible(true);
  };

  const handleReject = (record) => {
    setSelectedMedicine({ ...record, action: "REJECT" });
    setIsModalVisible(true);
  };

  const handleViewDetails = async (record) => {
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
        const details = response.data.data;
        Modal.info({
          title: "Chi tiết yêu cầu thuốc",
          width: 600,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Học sinh:</strong> {details.studentName}
                  </p>
                  <p>
                    <strong>Lớp:</strong> {details.studentGrade}
                  </p>
                  <p>
                    <strong>Email học sinh:</strong> {details.studentEmail}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Phụ huynh:</strong> {details.parentName}
                  </p>
                  <p>
                    <strong>Email phụ huynh:</strong> {details.parentEmail}
                  </p>
                  <p>
                    <strong>SĐT phụ huynh:</strong>{" "}
                    {details.parentPhone || "N/A"}
                  </p>
                </div>
              </div>
              <hr />
              <div>
                <p>
                  <strong>Thuốc:</strong> {details.medicationName}
                </p>
                <p>
                  <strong>Mô tả:</strong>{" "}
                  {details.medicationDescription || "N/A"}
                </p>
                <p>
                  <strong>Liều lượng:</strong> {details.dosage}
                </p>
                <p>
                  <strong>Tần suất:</strong> {details.frequency}
                </p>
                <p>
                  <strong>Thời gian:</strong> {details.duration || "N/A"}
                </p>
                <p>
                  <strong>Hướng dẫn:</strong> {details.instructions || "N/A"}
                </p>
              </div>
              <hr />
              <div>
                <p>
                  <strong>Ngày bắt đầu:</strong>{" "}
                  {new Date(details.startDate).toLocaleDateString("vi-VN")}
                </p>
                <p>
                  <strong>Ngày kết thúc:</strong>{" "}
                  {details.endDate
                    ? new Date(details.endDate).toLocaleDateString("vi-VN")
                    : "N/A"}
                </p>
                <p>
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(details.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              {details.healthProfile && (
                <>
                  <hr />
                  <div>
                    <p>
                      <strong>Thông tin sức khỏe:</strong>
                    </p>
                    <p>
                      <strong>Dị ứng:</strong>{" "}
                      {details.healthProfile.allergies || "Không có"}
                    </p>
                    <p>
                      <strong>Bệnh mãn tính:</strong>{" "}
                      {details.healthProfile.chronicDiseases || "Không có"}
                    </p>
                    <p>
                      <strong>Thuốc đang dùng:</strong>{" "}
                      {details.healthProfile.medications || "Không có"}
                    </p>
                  </div>
                </>
              )}
            </div>
          ),
        });
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      message.error("Lỗi khi tải chi tiết yêu cầu");
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
        title={`${
          selectedMedicine?.action === "APPROVE" ? "Phê duyệt" : "Từ chối"
        } yêu cầu thuốc`}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          confirmationForm.resetFields();
          setSelectedMedicine(null);
        }}
        width={500}
        okText={
          selectedMedicine?.action === "APPROVE" ? "Phê duyệt" : "Từ chối"
        }
        cancelText="Hủy"
        okButtonProps={{
          type: selectedMedicine?.action === "APPROVE" ? "primary" : "default",
          danger: selectedMedicine?.action === "REJECT",
        }}
      >
        {selectedMedicine && (
          <div className="mb-4">
            <p>
              <strong>Học sinh:</strong> {selectedMedicine.studentName}
            </p>
            <p>
              <strong>Thuốc:</strong> {selectedMedicine.medicationName}
            </p>
            <p>
              <strong>Liều lượng:</strong> {selectedMedicine.dosage}
            </p>
            <p>
              <strong>Tần suất:</strong> {selectedMedicine.frequency}
            </p>
          </div>
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
    </div>
  );
};

export default ConfirmedMedicines;
