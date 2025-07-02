import { CheckOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { TextArea } = Input;
const { Title, Text } = Typography;

const Vaccination = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [students, setStudents] = useState([]);
  const [displayedStudents, setDisplayedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchForm] = Form.useForm();
  const [vaccinationForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  });

  // Fetch active vaccination campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/nurse/vaccination-campaigns", {
        headers: getHeaders(),
      });
      if (response.data.success) {
        console.log(response.data.data);

        setCampaigns(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      message.error("Không thể tải danh sách chiến dịch tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for a specific campaign
  const fetchStudentsForCampaign = async (campaignId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/nurse/campaigns/${campaignId}/students`,
        {
          headers: getHeaders(),
        }
      );
      if (response.data.success) {
        setStudents(response.data.data || []);
        setDisplayedStudents(response.data.data || []);
        console.log("Fetched students:", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      message.error("Không thể tải danh sách học sinh");
    } finally {
      setLoading(false);
    }
  };

  // Perform vaccination
  const performVaccination = async (values) => {
    try {
      const response = await axios.post(
        `/api/nurse/vaccinations/perform`,
        {
          ...values,
          campaignId: selectedCampaign.id,
          studentId: selectedStudent.id,
        },
        { headers: getHeaders() }
      );

      if (response.data.success) {
        message.success("Đã thực hiện tiêm chủng thành công");
        setIsModalVisible(false);
        vaccinationForm.resetFields();
        setIsReportModalVisible(true);
        await fetchStudentsForCampaign(selectedCampaign.id);
      }
    } catch (error) {
      console.error("Error performing vaccination:", error);
      message.error(
        error.response?.data?.error || "Lỗi khi thực hiện tiêm chủng"
      );
    }
  };

  // Thêm hàm chuyển đổi dữ liệu trước khi gửi lên backend
  const normalizeReportValues = (values) => {
    return {
      ...values,
      followUpRequired:
        values.followUpRequired === true || values.followUpRequired === "true",
      followUpDate: values.followUpDate
        ? values.followUpDate.toISOString()
        : undefined,
    };
  };

  // Report vaccination result
  const reportVaccinationResult = async (values) => {
    try {
      const normalized = normalizeReportValues(values);
      const response = await axios.put(
        `/api/nurse/vaccinations/report`,
        {
          ...normalized,
          campaignId: selectedCampaign.id,
          studentId: selectedStudent.id,
        },
        { headers: getHeaders() }
      );
      console.log("API response:", response.data);

      if (response.data.success) {
        message.success("Đã báo cáo kết quả tiêm chủng");
        setIsReportModalVisible(false);
        setSelectedStudent(null);
        vaccinationForm.resetFields();
        fetchStudentsForCampaign(selectedCampaign.id);
      } else {
        message.error(response.data.error || "Lỗi khi báo cáo kết quả");
      }
      fetchStudentsForCampaign(selectedCampaign.id);
    } catch (error) {
      console.error("Error reporting vaccination:", error);
      message.error(error.response?.data?.error || "Lỗi khi báo cáo kết quả");
    }
  };

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
    fetchStudentsForCampaign(campaign.id);
  };

  const handlePerformVaccination = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
  };

  // Sửa handleReportResult để reset form khi mở modal
  const handleReportResult = (student) => {
    console.log("student for report:", student);
    if (student.vaccinationStatus !== "COMPLETED") {
      message.warning("Chỉ có thể báo cáo kết quả cho học sinh đã tiêm chủng.");
      return;
    }
    setSelectedStudent(student);
    // Set giá trị mặc định cho các trường đã nhập khi thực hiện tiêm
    vaccinationForm.setFieldsValue({
      administeredDate: student.administeredDate
        ? dayjs(student.administeredDate)
        : null,
      dose: student.doseType || undefined,
    });
    setIsReportModalVisible(true);
  };

  const handleSearch = (values) => {
    // Filter students based on search criteria
    let filteredStudents = students;

    if (values.studentCode) {
      filteredStudents = filteredStudents.filter((student) =>
        student.studentCode
          .toLowerCase()
          .includes(values.studentCode.toLowerCase())
      );
    }

    if (values.grade) {
      filteredStudents = filteredStudents.filter(
        (student) => student.grade === values.grade
      );
    }

    if (values.consentStatus !== undefined && values.consentStatus !== null) {
      filteredStudents = filteredStudents.filter(
        (student) => student.consentStatus === values.consentStatus
      );
    }

    // Update the displayed students
    setDisplayedStudents(filteredStudents);
    console.log("Filtered students:", filteredStudents);
  };

  const handleReset = () => {
    searchForm.resetFields();
    setDisplayedStudents(students);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "SCHEDULED":
        return "processing";
      case "POSTPONED":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "COMPLETED":
        return "Đã tiêm";
      case "SCHEDULED":
        return "Đã lên lịch";
      case "POSTPONED":
        return "Hoãn";
      case "CANCELLED":
        return "Hủy";
      default:
        return "Chưa lên lịch";
    }
  };

  const campaignColumns = [
    {
      title: "Tên chiến dịch",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Vắc xin",
      dataIndex: ["vaccinations", "name"],
      key: "vaccinationName",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "deadline",
      key: "deadline",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleCampaignSelect(record)}>
          Chọn chiến dịch
        </Button>
      ),
    },
  ];

  const studentColumns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
    },
    {
      title: "Tên học sinh",
      dataIndex: ["user", "fullName"],
      key: "studentName",
    },
    {
      title: "Lớp",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Trạng thái consent",
      dataIndex: "consentStatus",
      key: "consentStatus",
      render: (consent) => (
        <Tag
          color={
            consent === true
              ? "success"
              : consent === false
              ? "error"
              : "warning"
          }
        >
          {consent === true
            ? "Đã đồng ý"
            : consent === false
            ? "Từ chối"
            : "Chưa xác nhận"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái tiêm",
      dataIndex: "vaccinationStatus",
      key: "vaccinationStatus",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày tiêm",
      dataIndex: "administeredDate",
      key: "administeredDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "Chưa tiêm"),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.consentStatus === true &&
            record.vaccinationStatus !== "COMPLETED" && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handlePerformVaccination(record)}
                size="small"
              >
                Thực hiện tiêm
              </Button>
            )}
          {record.vaccinationStatus === "COMPLETED" && (
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleReportResult(record)}
              size="small"
            >
              Xem báo cáo
            </Button>
          )}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2}>Thực hiện tiêm chủng</Title>
      </div>

      {/* Campaign Selection */}
      <Card title="Chọn chiến dịch tiêm chủng">
        <Table
          dataSource={campaigns}
          columns={campaignColumns}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Selected Campaign Info */}
      {selectedCampaign && (
        <Card
          title={`Chiến dịch: ${selectedCampaign.name}`}
          extra={
            <Button onClick={() => setSelectedCampaign(null)}>Đóng</Button>
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Vắc xin">
              {Array.isArray(selectedCampaign.vaccinations) &&
              selectedCampaign.vaccinations.length > 0
                ? selectedCampaign.vaccinations[0]?.name
                : "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedCampaign.description || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu">
              {dayjs(selectedCampaign.scheduledDate).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc">
              {dayjs(selectedCampaign.deadline).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedCampaign.status)}>
                {getStatusText(selectedCampaign.status)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Search Form */}
          <Form form={searchForm} onFinish={handleSearch} layout="vertical">
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item name="studentCode" label="Mã học sinh">
                  <Input placeholder="Nhập mã học sinh" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="grade" label="Lớp">
                  <Select placeholder="Chọn lớp" allowClear>
                    <Select.Option value="1">Lớp 1</Select.Option>
                    <Select.Option value="2">Lớp 2</Select.Option>
                    <Select.Option value="3">Lớp 3</Select.Option>
                    <Select.Option value="4">Lớp 4</Select.Option>
                    <Select.Option value="5">Lớp 5</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="consentStatus" label="Trạng thái consent">
                  <Select placeholder="Chọn trạng thái" allowClear>
                    <Select.Option value={true}>Đã đồng ý</Select.Option>
                    <Select.Option value={false}>Từ chối</Select.Option>
                    <Select.Option value={null}>Chưa xác nhận</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24} className="text-right">
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  htmlType="submit"
                  style={{ marginRight: 8 }}
                >
                  Tìm kiếm
                </Button>
                <Button onClick={handleReset}>Xóa bộ lọc</Button>
              </Col>
            </Row>
          </Form>

          <Divider />

          {/* Students Table */}
          <Table
            dataSource={displayedStudents}
            columns={studentColumns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showQuickJumper: true,
            }}
          />
        </Card>
      )}

      {/* Perform Vaccination Modal */}
      <Modal
        title="Thực hiện tiêm chủng"
        open={isModalVisible}
        onOk={() => vaccinationForm.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          vaccinationForm.resetFields();
          setSelectedStudent(null);
        }}
        width={600}
      >
        {selectedStudent && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={`Thực hiện tiêm chủng cho học sinh: ${selectedStudent.user.fullName}`}
              description={`Mã học sinh: ${selectedStudent.studentCode} | Lớp: ${selectedStudent.grade}`}
              type="info"
              showIcon
            />
          </div>
        )}
        <Form
          form={vaccinationForm}
          layout="vertical"
          onFinish={performVaccination}
        >
          <Form.Item
            name="administeredDate"
            label="Ngày tiêm"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ngày tiêm",
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="dose"
            label="Loại liều"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn loại liều",
              },
            ]}
          >
            <Select placeholder="Chọn loại liều">
              <Select.Option value="FIRST">Liều đầu tiên</Select.Option>
              <Select.Option value="SECOND">Liều thứ hai</Select.Option>
              <Select.Option value="BOOSTER">Liều nhắc lại</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} placeholder="Ghi chú về quá trình tiêm chủng" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Report Result Modal */}
      <Modal
        title="Báo cáo kết quả tiêm chủng"
        open={isReportModalVisible}
        onOk={() => vaccinationForm.submit()}
        onCancel={() => {
          setIsReportModalVisible(false);
          setSelectedStudent(null);
          vaccinationForm.resetFields();
        }}
        width={600}
        destroyOnClose={true}
      >
        {selectedStudent && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={`Báo cáo kết quả cho học sinh: ${selectedStudent.user.fullName}`}
              description={`Mã học sinh: ${selectedStudent.studentCode} | Lớp: ${selectedStudent.grade}`}
              type="info"
              showIcon
            />
          </div>
        )}
        <Form
          form={vaccinationForm}
          layout="vertical"
          onFinish={(values) => {
            console.log("Form values:", values);
            reportVaccinationResult(values);
          }}
          onFinishFailed={(err) => {
            console.log("Form failed:", err);
          }}
        >
          <Form.Item name="administeredDate" label="Ngày tiêm">
            <DatePicker disabled style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="dose" label="Loại liều">
            <Select disabled placeholder="Chọn loại liều">
              <Select.Option value="FIRST">Liều đầu tiên</Select.Option>
              <Select.Option value="SECOND">Liều thứ hai</Select.Option>
              <Select.Option value="BOOSTER">Liều nhắc lại</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="sideEffects" label="Tác dụng phụ">
            <TextArea rows={3} placeholder="Mô tả tác dụng phụ (nếu có)" />
          </Form.Item>
          <Form.Item name="reaction" label="Phản ứng sau tiêm">
            <Select placeholder="Chọn phản ứng">
              <Select.Option value="NONE">Không có phản ứng</Select.Option>
              <Select.Option value="MILD">Phản ứng nhẹ</Select.Option>
              <Select.Option value="MODERATE">Phản ứng vừa</Select.Option>
              <Select.Option value="SEVERE">Phản ứng nặng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="followUpRequired" label="Cần theo dõi">
            <Select placeholder="Chọn tình trạng theo dõi">
              <Select.Option value={false}>Không cần</Select.Option>
              <Select.Option value={true}>Cần theo dõi</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="followUpDate" label="Ngày theo dõi">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="additionalNotes" label="Ghi chú bổ sung">
            <TextArea
              rows={3}
              placeholder="Ghi chú bổ sung về kết quả tiêm chủng"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Vaccination;
