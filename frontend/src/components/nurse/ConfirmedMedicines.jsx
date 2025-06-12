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
      title: "Student ID",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Medicine",
      dataIndex: "medicineName",
      key: "medicineName",
    },
    {
      title: "Dosage",
      dataIndex: "dosage",
      key: "dosage",
    },
    {
      title: "Frequency",
      dataIndex: "frequency",
      key: "frequency",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Last Confirmed",
      dataIndex: "lastConfirmed",
      key: "lastConfirmed",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleConfirm(record)}
          >
            Confirm
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Details
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
      title: "Medicine Details",
      content: (
        <div className="space-y-4">
          <p>
            <strong>Student:</strong> {record.studentName}
          </p>
          <p>
            <strong>Medicine:</strong> {record.medicineName}
          </p>
          <p>
            <strong>Dosage:</strong> {record.dosage}
          </p>
          <p>
            <strong>Frequency:</strong> {record.frequency}
          </p>
          <p>
            <strong>Start Date:</strong> {record.startDate}
          </p>
          <p>
            <strong>End Date:</strong> {record.endDate}
          </p>
          <p>
            <strong>Prescribed By:</strong> {record.prescribedBy}
          </p>
          <p>
            <strong>Last Confirmed:</strong> {record.lastConfirmed}
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
        <h1 className="text-2xl font-bold">Confirmed Medicines</h1>
      </div>

      <Card>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="studentId" label="Student ID">
                <Input placeholder="Enter student ID" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="grade" label="Grade">
                <Select placeholder="Select grade">
                  <Select.Option value="Grade 1">Grade 1</Select.Option>
                  <Select.Option value="Grade 2">Grade 2</Select.Option>
                  <Select.Option value="Grade 3">Grade 3</Select.Option>
                  <Select.Option value="Grade 4">Grade 4</Select.Option>
                  <Select.Option value="Grade 5">Grade 5</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Select status">
                  <Select.Option value="active">Active</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
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
                Search
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table dataSource={confirmedMedicines} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title="Confirm Medication"
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
            label="Confirmation Date"
            rules={[
              { required: true, message: "Please select confirmation date" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea
              rows={4}
              placeholder="Any additional notes or observations"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConfirmedMedicines;
