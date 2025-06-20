import { CheckOutlined, ClockCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
} from "antd";
import React, { useState } from "react";
import { studentTreatments } from "../../mock/nurseData";

const { TextArea } = Input;

const StudentTreatment = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [form] = Form.useForm();

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
      dataIndex: "medication",
      key: "medication",
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
      title: "Lần uống cuối",
      dataIndex: "lastGiven",
      key: "lastGiven",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleGiveMedication(record)}
          >
            Cho uống
          </Button>
          <Button onClick={() => handleViewDetails(record)}>Chi tiết</Button>
        </Space>
      ),
    },
  ];

  const handleGiveMedication = (record) => {
    setSelectedTreatment(record);
    setIsModalVisible(true);
  };

  const handleViewDetails = (record) => {
    Modal.info({
      title: "Chi tiết điều trị",
      content: (
        <div className="space-y-4">
          <p>
            <strong>Học sinh:</strong> {record.studentName}
          </p>
          <p>
            <strong>Thuốc:</strong> {record.medication}
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
            <strong>Lần uống cuối:</strong> {record.lastGiven}
          </p>
        </div>
      ),
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      console.log("Medication given:", { ...selectedTreatment, ...values });
      setIsModalVisible(false);
      form.resetFields();
      setSelectedTreatment(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Điều trị học sinh</h1>
        <Button
          type="primary"
          icon={<ClockCircleOutlined />}
          onClick={() => {
            // Handle view history
          }}
        >
          Xem lịch sử
        </Button>
      </div>

      <Card>
        <Table dataSource={studentTreatments} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title="Cho uống thuốc"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedTreatment(null);
        }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="given"
            valuePropName="checked"
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận đã cho học sinh uống thuốc",
              },
            ]}
          >
            <Checkbox>Đã cho học sinh uống thuốc</Checkbox>
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={4} placeholder="Ghi chú hoặc quan sát thêm" />
          </Form.Item>

          <Form.Item
            name="nextDose"
            label="Thời gian uống tiếp theo"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn thời gian uống tiếp theo",
              },
            ]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentTreatment;
