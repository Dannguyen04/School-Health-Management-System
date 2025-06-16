import { NotificationOutlined, PlusOutlined } from "@ant-design/icons";
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

const HealthCheckupCampaigns = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock data for demonstration
  const campaigns = [
    {
      id: 1,
      name: "Annual Physical Exam 2024",
      startDate: "2024-04-01",
      endDate: "2024-04-30",
      targetGroup: "All Students",
      checkupType: "Comprehensive",
      status: "Upcoming",
      participants: 500,
    },
    {
      id: 2,
      name: "Dental Checkup",
      startDate: "2024-03-15",
      endDate: "2024-03-20",
      targetGroup: "Class 1-5",
      checkupType: "Dental",
      status: "Ongoing",
      participants: 200,
    },
  ];

  const columns = [
    {
      title: "Campaign Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Date Range",
      key: "dateRange",
      render: (_, record) => (
        <span>
          {record.startDate} - {record.endDate}
        </span>
      ),
    },
    {
      title: "Target Group",
      dataIndex: "targetGroup",
      key: "targetGroup",
    },
    {
      title: "Checkup Type",
      dataIndex: "checkupType",
      key: "checkupType",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Upcoming"
              ? "blue"
              : status === "Ongoing"
              ? "green"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Participants",
      dataIndex: "participants",
      key: "participants",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link">View Details</Button>
          <Button type="link">Edit</Button>
        </Space>
      ),
    },
  ];

  const handleCreateCampaign = (values) => {
    console.log("Form values:", values);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="space-y-4">
      <Card
        title="Health Checkup Campaigns"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Create New Campaign
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={campaigns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Create New Health Checkup Campaign"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateCampaign}>
          <Form.Item
            name="name"
            label="Campaign Name"
            rules={[{ required: true, message: "Please enter campaign name" }]}
          >
            <Input placeholder="Enter campaign name" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Campaign Period"
            rules={[{ required: true, message: "Please select date range" }]}
          >
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="targetGroup"
            label="Target Group"
            rules={[{ required: true, message: "Please select target group" }]}
          >
            <Select placeholder="Select target group">
              <Option value="All Students">All Students</Option>
              <Option value="Class 1-5">Class 1-5</Option>
              <Option value="Class 6-9">Class 6-9</Option>
              <Option value="Class 10-12">Class 10-12</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="checkupType"
            label="Checkup Type"
            rules={[{ required: true, message: "Please select checkup type" }]}
          >
            <Select placeholder="Select checkup type">
              <Option value="Comprehensive">Comprehensive Health Check</Option>
              <Option value="Dental">Dental Checkup</Option>
              <Option value="Vision">Vision Check</Option>
              <Option value="Hearing">Hearing Test</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notification" label="Parent Notification">
            <TextArea
              placeholder="Enter notification message for parents"
              rows={4}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<NotificationOutlined />}
              >
                Create & Notify
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HealthCheckupCampaigns;
