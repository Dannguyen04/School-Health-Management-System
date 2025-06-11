import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import React, { useState } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Vaccination = () => {
  const [form] = Form.useForm();
  const [openModal, setOpenModal] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  // Mock data - replace with actual API data
  const vaccinations = [
    {
      id: 1,
      vaccineName: "Vaccine A",
      date: "2024-03-15",
      status: "Đã tiêm",
      nextDose: "2024-09-15",
      notes: "Không có phản ứng phụ",
    },
    {
      id: 2,
      vaccineName: "Vaccine B",
      date: "2024-02-01",
      status: "Chờ tiêm",
      nextDose: "2024-08-01",
      notes: "Cần xác nhận từ phụ huynh",
    },
  ];

  const handleOpenModal = (vaccine = null) => {
    if (vaccine) {
      setSelectedVaccine(vaccine);
      form.setFieldsValue({
        vaccineName: vaccine.vaccineName,
        date: vaccine.date,
        status: vaccine.status,
        notes: vaccine.notes,
      });
    } else {
      setSelectedVaccine(null);
      form.resetFields();
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedVaccine(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);
      // Add API call here to save/update vaccination data
      handleCloseModal();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã tiêm":
        return "success";
      case "Chờ tiêm":
        return "warning";
      case "Đã hủy":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Tên vaccine",
      dataIndex: "vaccineName",
      key: "vaccineName",
    },
    {
      title: "Ngày tiêm",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Ngày tiêm tiếp theo",
      dataIndex: "nextDose",
      key: "nextDose",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleOpenModal(record)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Quản lý tiêm chủng</Title>
        <Text type="secondary">
          Theo dõi và quản lý lịch tiêm chủng của học sinh
        </Text>
      </div>

      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button type="primary" onClick={() => handleOpenModal()}>
          Thêm mới
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={vaccinations} rowKey="id" />
      </Card>

      <Modal
        title={
          selectedVaccine
            ? "Chỉnh sửa thông tin tiêm chủng"
            : "Thêm mới tiêm chủng"
        }
        open={openModal}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        okText={selectedVaccine ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="vaccineName"
            label="Tên vaccine"
            rules={[{ required: true, message: "Vui lòng nhập tên vaccine" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="date"
            label="Ngày tiêm"
            rules={[{ required: true, message: "Vui lòng chọn ngày tiêm" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="Đã tiêm">Đã tiêm</Option>
              <Option value="Chờ tiêm">Chờ tiêm</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Vaccination;
