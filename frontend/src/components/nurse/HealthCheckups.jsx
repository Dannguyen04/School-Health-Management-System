import {
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import React, { useState } from "react";
import { healthCheckups } from "../../mock/nurseData";

const { TextArea } = Input;

const HealthCheckups = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchForm] = Form.useForm();
  const [checkupForm] = Form.useForm();

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
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "BMI",
      dataIndex: "bmi",
      key: "bmi",
      render: (bmi) => (
        <Tag
          color={
            bmi < 18.5
              ? "blue"
              : bmi < 25
              ? "green"
              : bmi < 30
              ? "orange"
              : "red"
          }
        >
          {bmi}
        </Tag>
      ),
    },
    {
      title: "Vision",
      dataIndex: "vision",
      key: "vision",
    },
    {
      title: "Blood Pressure",
      dataIndex: "bloodPressure",
      key: "bloodPressure",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
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

  const handleViewDetails = (record) => {
    Modal.info({
      title: "Health Checkup Details",
      content: (
        <div className="space-y-4">
          <p>
            <strong>Student:</strong> {record.studentName}
          </p>
          <p>
            <strong>Height:</strong> {record.height} cm
          </p>
          <p>
            <strong>Weight:</strong> {record.weight} kg
          </p>
          <p>
            <strong>BMI:</strong> {record.bmi}
          </p>
          <p>
            <strong>Vision:</strong> {record.vision}
          </p>
          <p>
            <strong>Blood Pressure:</strong> {record.bloodPressure}
          </p>
          <p>
            <strong>Notes:</strong> {record.notes}
          </p>
        </div>
      ),
    });
  };

  const handleSearch = (values) => {
    console.log("Search values:", values);
  };

  const handleSubmit = () => {
    checkupForm.validateFields().then((values) => {
      console.log("New health checkup record:", values);
      setIsModalVisible(false);
      checkupForm.resetFields();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Health Checkups</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Checkup
        </Button>
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
              <Form.Item name="date" label="Checkup Date">
                <DatePicker style={{ width: "100%" }} />
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
        <Table dataSource={healthCheckups} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title="Add Health Checkup"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          checkupForm.resetFields();
        }}
        width={600}
      >
        <Form form={checkupForm} layout="vertical">
          <Form.Item
            name="studentId"
            label="Student ID"
            rules={[{ required: true, message: "Please enter student ID" }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="height"
                label="Height (cm)"
                rules={[{ required: true, message: "Please enter height" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Weight (kg)"
                rules={[{ required: true, message: "Please enter weight" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vision"
                label="Vision"
                rules={[{ required: true, message: "Please enter vision" }]}
              >
                <Input placeholder="e.g., 20/20" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bloodPressure"
                label="Blood Pressure"
                rules={[
                  { required: true, message: "Please enter blood pressure" },
                ]}
              >
                <Input placeholder="e.g., 120/80" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthCheckups;
