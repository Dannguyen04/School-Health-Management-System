import { AlertOutlined, CheckCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import React, { useState } from "react";

const { Option } = Select;
const { TextArea } = Input;

const AlertsAndEvents = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data for alerts
  const alerts = [
    {
      id: 1,
      type: "Health Alert",
      message: "Increased cases of flu reported in Class 9C",
      date: "2024-03-18",
      status: "Active",
      severity: "High",
      source: "School Nurse",
    },
    {
      id: 2,
      type: "Vaccination Reminder",
      message: "Hepatitis B vaccination due for Class 10A",
      date: "2024-03-20",
      status: "Active",
      severity: "Medium",
      source: "System",
    },
    {
      id: 3,
      type: "Health Check",
      message: "Annual health checkup scheduled for Class 8B",
      date: "2024-03-25",
      status: "Resolved",
      severity: "Low",
      source: "System",
    },
  ];

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag
          color={
            type === "Health Alert"
              ? "red"
              : type === "Vaccination Reminder"
              ? "blue"
              : "green"
          }
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "red" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (severity) => (
        <Tag
          color={
            severity === "High"
              ? "red"
              : severity === "Medium"
              ? "orange"
              : "green"
          }
        >
          {severity}
        </Tag>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status === "Active" && (
            <Button type="primary" size="small" icon={<CheckCircleOutlined />}>
              Resolve
            </Button>
          )}
          <Button type="link" size="small">
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  const handleCreateAlert = (values) => {
    console.log("Form values:", values);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="space-y-4">
      <Card
        title={
          <div className="flex items-center">
            <AlertOutlined className="mr-2" />
            Health Alerts & Events
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<AlertOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Create New Alert
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={alerts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Create New Health Alert"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateAlert}>
          <Form.Item
            name="type"
            label="Alert Type"
            rules={[{ required: true, message: "Please select alert type" }]}
          >
            <Select placeholder="Select alert type">
              <Option value="Health Alert">Health Alert</Option>
              <Option value="Vaccination Reminder">Vaccination Reminder</Option>
              <Option value="Health Check">Health Check</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
            label="Alert Message"
            rules={[{ required: true, message: "Please enter alert message" }]}
          >
            <TextArea rows={4} placeholder="Enter alert message" />
          </Form.Item>

          <Form.Item
            name="severity"
            label="Severity"
            rules={[{ required: true, message: "Please select severity" }]}
          >
            <Select placeholder="Select severity">
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Alert Date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Alert
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlertsAndEvents;
