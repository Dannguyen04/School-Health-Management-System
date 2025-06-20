import {
  CheckOutlined,
  FileTextOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import React, { useState } from "react";
import { confirmedMedicines } from "../../mock/nurseData";

const { TextArea } = Input;

const ConfirmedMedicines = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchForm] = Form.useForm();
  const [confirmationForm] = Form.useForm();

  const columns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Tên học sinh",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Lớp",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Thuốc",
      dataIndex: "medicineName",
      key: "medicineName",
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
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Đang điều trị" : "Đã hoàn thành"}
        </Tag>
      ),
    },
    {
      title: "Lần xác nhận cuối",
      dataIndex: "lastConfirmed",
      key: "lastConfirmed",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleConfirm(record)}
          >
            Xác nhận
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const handleConfirm = (record) => {
    setSelectedMedicine(record);
    setIsModalVisible(true);
  };

  const handleViewDetails = (record) => {
    Modal.info({
      title: "Chi tiết thuốc",
      content: (
        <div className="space-y-4">
          <p>
            <strong>Học sinh:</strong> {record.studentName}
          </p>
          <p>
            <strong>Thuốc:</strong> {record.medicineName}
          </p>
          <p>
            <strong>Liều lượng:</strong> {record.dosage}
          </p>
          <p>
            <strong>Tần suất:</strong> {record.frequency}
          </p>
          <p>
            <strong>Ngày bắt đầu:</strong> {record.startDate}
          </p>
          <p>
            <strong>Ngày kết thúc:</strong> {record.endDate}
          </p>
          <p>
            <strong>Kê bởi:</strong> {record.prescribedBy}
          </p>
          <p>
            <strong>Lần xác nhận cuối:</strong> {record.lastConfirmed}
          </p>
        </div>
      ),
    });
  };

  const handleSearch = (values) => {
    console.log("Search values:", values);
  };

  const handleSubmit = () => {
    confirmationForm.validateFields().then((values) => {
      console.log("Confirmation:", { ...selectedMedicine, ...values });
      setIsModalVisible(false);
      confirmationForm.resetFields();
      setSelectedMedicine(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Thuốc đã xác nhận</h1>
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="studentId" label="Mã học sinh">
                <Input placeholder="Nhập mã học sinh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="grade" label="Lớp">
                <Select placeholder="Chọn lớp">
                  <Select.Option value="Lớp 1">Lớp 1</Select.Option>
                  <Select.Option value="Lớp 2">Lớp 2</Select.Option>
                  <Select.Option value="Lớp 3">Lớp 3</Select.Option>
                  <Select.Option value="Lớp 4">Lớp 4</Select.Option>
                  <Select.Option value="Lớp 5">Lớp 5</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="status" label="Trạng thái">
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="active">Đang điều trị</Select.Option>
                  <Select.Option value="completed">Đã hoàn thành</Select.Option>
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
              >
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table dataSource={confirmedMedicines} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title="Xác nhận thuốc"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          confirmationForm.resetFields();
          setSelectedMedicine(null);
        }}
        width={500}
      >
        <Form form={confirmationForm} layout="vertical">
          <Form.Item
            name="confirmationDate"
            label="Ngày xác nhận"
            rules={[{ required: true, message: "Vui lòng chọn ngày xác nhận" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={4} placeholder="Ghi chú hoặc quan sát thêm" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConfirmedMedicines;
