import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const { TextArea } = Input;
const { Option } = Select;

const MedicalEventReport = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const [medicalEvents, setMedicalEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data for medical events - replace with API calls
  const mockMedicalEvents = [
    {
      id: "1",
      studentId: "ST001",
      studentName: "Nguyễn Văn A",
      grade: "Lớp 5A",
      title: "Ngã trong giờ ra chơi",
      description: "Học sinh bị ngã khi chạy trong sân trường",
      type: "FALL",
      status: "RESOLVED",
      severity: "medium",
      location: "Sân trường",
      symptoms: ["Đau đầu", "Sưng mắt cá chân"],
      treatment: "Chườm lạnh, băng bó",
      outcome: "Đã khỏi, có thể đi lại bình thường",
      occurredAt: "2024-02-21T10:30:00Z",
      resolvedAt: "2024-02-21T11:00:00Z",
      createdAt: "2024-02-21T10:35:00Z",
      nurseName: "Y tá Mai",
    },
    {
      id: "2",
      studentId: "ST002",
      studentName: "Trần Thị B",
      grade: "Lớp 4B",
      title: "Sốt cao đột ngột",
      description: "Học sinh bị sốt cao 39°C trong giờ học",
      type: "FEVER",
      status: "IN_PROGRESS",
      severity: "high",
      location: "Lớp học 4B",
      symptoms: ["Sốt cao", "Đau đầu", "Mệt mỏi"],
      treatment: "Hạ sốt bằng paracetamol",
      outcome: null,
      occurredAt: "2024-02-21T14:15:00Z",
      resolvedAt: null,
      createdAt: "2024-02-21T14:20:00Z",
      nurseName: "Y tá Mai",
    },
    {
      id: "3",
      studentId: "ST003",
      studentName: "Lê Văn C",
      grade: "Lớp 5A",
      title: "Dị ứng thức ăn",
      description: "Học sinh bị dị ứng sau khi ăn trưa",
      type: "ALLERGY_REACTION",
      status: "REFERRED",
      severity: "critical",
      location: "Căng tin trường",
      symptoms: ["Nổi mề đay", "Khó thở", "Sưng mặt"],
      treatment: "Tiêm thuốc chống dị ứng",
      outcome: "Đã chuyển đến bệnh viện",
      occurredAt: "2024-02-20T12:30:00Z",
      resolvedAt: "2024-02-20T13:00:00Z",
      createdAt: "2024-02-20T12:35:00Z",
      nurseName: "Y tá Mai",
    },
  ];

  useEffect(() => {
    setMedicalEvents(mockMedicalEvents);
  }, []);

  const eventTypeOptions = [
    { value: "ACCIDENT", label: "Tai nạn" },
    { value: "FEVER", label: "Sốt" },
    { value: "FALL", label: "Ngã" },
    { value: "EPIDEMIC", label: "Dịch bệnh" },
    { value: "ALLERGY_REACTION", label: "Dị ứng" },
    { value: "CHRONIC_DISEASE_EPISODE", label: "Bệnh mãn tính" },
    { value: "OTHER", label: "Khác" },
  ];

  const severityOptions = [
    { value: "low", label: "Nhẹ" },
    { value: "medium", label: "Trung bình" },
    { value: "high", label: "Nặng" },
    { value: "critical", label: "Nghiêm trọng" },
  ];

  const statusOptions = [
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "IN_PROGRESS", label: "Đang xử lý" },
    { value: "RESOLVED", label: "Đã giải quyết" },
    { value: "REFERRED", label: "Đã chuyển viện" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "IN_PROGRESS":
        return "blue";
      case "RESOLVED":
        return "green";
      case "REFERRED":
        return "red";
      default:
        return "default";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "green";
      case "medium":
        return "orange";
      case "high":
        return "red";
      case "critical":
        return "red";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "ACCIDENT":
        return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "FEVER":
        return <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />;
      case "FALL":
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
      case "ALLERGY_REACTION":
        return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <ExclamationCircleOutlined />;
    }
  };

  const columns = [
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.grade}</div>
        </div>
      ),
    },
    {
      title: "Sự kiện",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(record.type)}
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-gray-500">{record.location}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const option = eventTypeOptions.find((opt) => opt.value === type);
        return <Tag>{option?.label || type}</Tag>;
      },
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severityOptions.find((opt) => opt.value === severity)?.label ||
            severity}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {statusOptions.find((opt) => opt.value === status)?.label || status}
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "occurredAt",
      key: "occurredAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewEvent(record)}
          >
            Xem
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditEvent(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa sự kiện y tế này?"
            onConfirm={() => handleDeleteEvent(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAddEvent = () => {
    setIsEditMode(false);
    setSelectedEvent(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditEvent = (event) => {
    setIsEditMode(true);
    setSelectedEvent(event);
    form.setFieldsValue({
      ...event,
      occurredAt: dayjs(event.occurredAt),
      resolvedAt: event.resolvedAt ? dayjs(event.resolvedAt) : null,
      symptoms: event.symptoms.join(", "),
    });
    setIsModalVisible(true);
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsViewModalVisible(true);
  };

  const handleDeleteEvent = (eventId) => {
    setMedicalEvents((prev) => prev.filter((event) => event.id !== eventId));
    message.success("Đã xóa sự kiện y tế");
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const eventData = {
        ...values,
        symptoms: values.symptoms
          ? values.symptoms.split(",").map((s) => s.trim())
          : [],
        occurredAt: values.occurredAt.toISOString(),
        resolvedAt: values.resolvedAt ? values.resolvedAt.toISOString() : null,
        createdAt: new Date().toISOString(),
        nurseName: "Y tá Mai", // Replace with actual nurse name
      };

      if (isEditMode) {
        // Update existing event
        setMedicalEvents((prev) =>
          prev.map((event) =>
            event.id === selectedEvent.id ? { ...event, ...eventData } : event
          )
        );
        message.success("Đã cập nhật sự kiện y tế");
      } else {
        // Add new event
        const newEvent = {
          id: Date.now().toString(),
          studentId: "ST" + Math.floor(Math.random() * 1000),
          studentName: "Học sinh mới",
          grade: "Lớp mới",
          ...eventData,
        };
        setMedicalEvents((prev) => [newEvent, ...prev]);
        message.success("Đã tạo sự kiện y tế mới");
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedEvent(null);
      setIsEditMode(false);
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setIsViewModalVisible(false);
    form.resetFields();
    setSelectedEvent(null);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Báo cáo sự kiện y tế</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddEvent}>
          Tạo báo cáo mới
        </Button>
      </div>

      <Card>
        <Table
          dataSource={medicalEvents}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 5,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={
          isEditMode ? "Chỉnh sửa sự kiện y tế" : "Tạo báo cáo sự kiện y tế"
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        width={800}
        okText={isEditMode ? "Cập nhật" : "Tạo báo cáo"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Tiêu đề sự kiện"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input placeholder="VD: Ngã trong giờ ra chơi" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại sự kiện"
                rules={[
                  { required: true, message: "Vui lòng chọn loại sự kiện" },
                ]}
              >
                <Select placeholder="Chọn loại sự kiện">
                  {eventTypeOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="Mức độ nghiêm trọng"
                rules={[{ required: true, message: "Vui lòng chọn mức độ" }]}
              >
                <Select placeholder="Chọn mức độ">
                  {severityOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  {statusOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea rows={3} placeholder="Mô tả chi tiết về sự kiện y tế" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Địa điểm xảy ra"
                rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
              >
                <Input placeholder="VD: Sân trường, Lớp học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="occurredAt"
                label="Thời gian xảy ra"
                rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
              >
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày và giờ"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="symptoms"
            label="Triệu chứng"
            rules={[{ required: true, message: "Vui lòng nhập triệu chứng" }]}
          >
            <Input placeholder="VD: Đau đầu, Sốt cao, Nôn mửa (phân cách bằng dấu phẩy)" />
          </Form.Item>

          <Form.Item name="treatment" label="Điều trị">
            <TextArea rows={2} placeholder="Mô tả điều trị đã thực hiện" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="resolvedAt" label="Thời gian giải quyết">
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày và giờ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="outcome" label="Kết quả">
                <Input placeholder="Kết quả cuối cùng" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Chi tiết sự kiện y tế"
        open={isViewModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="close" onClick={handleModalCancel}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedEvent && (
          <div className="space-y-4">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Học sinh" span={2}>
                {selectedEvent.studentName} - {selectedEvent.grade}
              </Descriptions.Item>
              <Descriptions.Item label="Tiêu đề" span={2}>
                {selectedEvent.title}
              </Descriptions.Item>
              <Descriptions.Item label="Loại sự kiện">
                <Tag>
                  {
                    eventTypeOptions.find(
                      (opt) => opt.value === selectedEvent.type
                    )?.label
                  }
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ">
                <Tag color={getSeverityColor(selectedEvent.severity)}>
                  {
                    severityOptions.find(
                      (opt) => opt.value === selectedEvent.severity
                    )?.label
                  }
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedEvent.status)}>
                  {
                    statusOptions.find(
                      (opt) => opt.value === selectedEvent.status
                    )?.label
                  }
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm">
                {selectedEvent.location}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian xảy ra">
                {dayjs(selectedEvent.occurredAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              {selectedEvent.resolvedAt && (
                <Descriptions.Item label="Thời gian giải quyết">
                  {dayjs(selectedEvent.resolvedAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Y tá xử lý">
                {selectedEvent.nurseName}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div>
              <h4 className="font-medium mb-2">Mô tả chi tiết:</h4>
              <p className="text-gray-700">{selectedEvent.description}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Triệu chứng:</h4>
              <div className="flex flex-wrap gap-1">
                {selectedEvent.symptoms.map((symptom, index) => (
                  <Tag key={index} color="blue">
                    {symptom}
                  </Tag>
                ))}
              </div>
            </div>

            {selectedEvent.treatment && (
              <div>
                <h4 className="font-medium mb-2">Điều trị:</h4>
                <p className="text-gray-700">{selectedEvent.treatment}</p>
              </div>
            )}

            {selectedEvent.outcome && (
              <div>
                <h4 className="font-medium mb-2">Kết quả:</h4>
                <p className="text-gray-700">{selectedEvent.outcome}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalEventReport;
