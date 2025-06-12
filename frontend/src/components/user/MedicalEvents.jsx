import {
  Button,
  Card,
  Col,
  DatePicker,
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
import dayjs from "dayjs";
import React, { useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MedicalEvents = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventData, setEventData] = useState({
    type: "",
    date: null,
    severity: "",
    description: "",
    action: "",
    status: "",
  });

  // Mock data - replace with actual API data
  const events = [
    {
      id: 1,
      type: "Tai nạn",
      date: "2024-03-15",
      severity: "Nhẹ",
      description: "Trượt ngã trong sân trường",
      action: "Sơ cứu và theo dõi",
      status: "Đã xử lý",
    },
    {
      id: 2,
      type: "Sốt",
      date: "2024-03-20",
      severity: "Trung bình",
      description: "Sốt cao 39 độ",
      action: "Cho uống thuốc hạ sốt",
      status: "Đang theo dõi",
    },
  ];

  const handleOpenModal = (event = null) => {
    if (event) {
      setSelectedEvent(event);
      setEventData({
        type: event.type,
        date: event.date ? new Date(event.date) : null, // Convert string to Date object
        severity: event.severity,
        description: event.description,
        action: event.action,
        status: event.status,
      });
    } else {
      setSelectedEvent(null);
      setEventData({
        type: "",
        date: null,
        severity: "",
        description: "",
        action: "",
        status: "",
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent(null);
    setEventData({
      type: "",
      date: null,
      severity: "",
      description: "",
      action: "",
      status: "",
    });
  };

  const handleSubmit = () => {
    // Add API call here to save/update event data
    console.log("Submitting event data:", eventData);
    message.success("Sự kiện đã được lưu thành công");
    handleCloseModal();
  };

  const getSeverityTagColor = (severity) => {
    switch (severity) {
      case "Nhẹ":
        return "green";
      case "Trung bình":
        return "orange";
      case "Nặng":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusTagColor = (status) => {
    switch (status) {
      case "Đã xử lý":
        return "green";
      case "Đang theo dõi":
        return "orange";
      case "Cần can thiệp":
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Loại sự kiện",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Ngày xảy ra",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => (
        <Tag color={getSeverityTagColor(severity)}>{severity}</Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusTagColor(status)}>{status}</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleOpenModal(record)}>
            Chỉnh sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Sự kiện y tế</Title>
        <Text type="secondary">
          Quản lý và theo dõi các sự kiện y tế trong trường học
        </Text>
      </div>

      <Row justify="end" style={{ marginBottom: 24 }}>
        <Col>
          <Button type="primary" onClick={() => handleOpenModal()}>
            Báo cáo sự kiện
          </Button>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={events} rowKey="id" />
      </Card>

      <Modal
        title={
          selectedEvent ? "Chỉnh sửa sự kiện y tế" : "Báo cáo sự kiện y tế mới"
        }
        open={openModal}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Select
            placeholder="Loại sự kiện"
            value={eventData.type || undefined} // Ant Design Select needs undefined for no selection
            onChange={(value) => setEventData({ ...eventData, type: value })}
            style={{ width: "100%" }}
          >
            <Option value="Tai nạn">Tai nạn</Option>
            <Option value="Sốt">Sốt</Option>
            <Option value="Dị ứng">Dị ứng</Option>
            <Option value="Chấn thương">Chấn thương</Option>
            <Option value="Khác">Khác</Option>
          </Select>
          <DatePicker
            placeholder="Ngày xảy ra"
            value={eventData.date ? dayjs(eventData.date) : null} // Use dayjs for DatePicker
            onChange={(date) =>
              setEventData({ ...eventData, date: date ? date.toDate() : null })
            }
            style={{ width: "100%" }}
          />
          <Select
            placeholder="Mức độ"
            value={eventData.severity || undefined}
            onChange={(value) =>
              setEventData({ ...eventData, severity: value })
            }
            style={{ width: "100%" }}
          >
            <Option value="Nhẹ">Nhẹ</Option>
            <Option value="Trung bình">Trung bình</Option>
            <Option value="Nặng">Nặng</Option>
          </Select>
          <TextArea
            placeholder="Mô tả"
            value={eventData.description}
            onChange={(e) =>
              setEventData({ ...eventData, description: e.target.value })
            }
            rows={4}
          />
          <TextArea
            placeholder="Hành động"
            value={eventData.action}
            onChange={(e) =>
              setEventData({ ...eventData, action: e.target.value })
            }
            rows={4}
          />
          <Select
            placeholder="Trạng thái"
            value={eventData.status || undefined}
            onChange={(value) => setEventData({ ...eventData, status: value })}
            style={{ width: "100%" }}
          >
            <Option value="Đã xử lý">Đã xử lý</Option>
            <Option value="Đang theo dõi">Đang theo dõi</Option>
            <Option value="Cần can thiệp">Cần can thiệp</Option>
          </Select>
        </Space>
      </Modal>
    </div>
  );
};

export default MedicalEvents;
