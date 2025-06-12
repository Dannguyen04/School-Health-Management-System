import { PlusOutlined } from "@ant-design/icons";
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
} from "antd";
import React, { useState } from "react";
import { campaigns } from "../../mock/nurseData";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const Campaigns = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "vaccination" ? "blue" : "green"}>
          {type === "vaccination" ? "Vaccination" : "Health Checkup"}
        </Tag>
      ),
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "completed" ? "green" : "orange"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Target Classes",
      dataIndex: "targetClasses",
      key: "targetClasses",
      render: (classes) => classes.join(", "),
    },
  ];

  const handleCreateCampaign = () => {
    form.validateFields().then((values) => {
      console.log("New campaign:", values);
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Create Campaign
        </Button>
      </div>

      <Card>
        <Table dataSource={campaigns} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title="Create New Campaign"
        open={isModalVisible}
        onOk={handleCreateCampaign}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Campaign Title"
            rules={[{ required: true, message: "Please enter campaign title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Campaign Type"
            rules={[{ required: true, message: "Please select campaign type" }]}
          >
            <Select>
              <Select.Option value="vaccination">Vaccination</Select.Option>
              <Select.Option value="health_checkup">
                Health Checkup
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Date Range"
            rules={[{ required: true, message: "Please select date range" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="targetClasses"
            label="Target Classes"
            rules={[
              { required: true, message: "Please select target classes" },
            ]}
          >
            <Select mode="multiple">
              <Select.Option value="Grade 1">Grade 1</Select.Option>
              <Select.Option value="Grade 2">Grade 2</Select.Option>
              <Select.Option value="Grade 3">Grade 3</Select.Option>
              <Select.Option value="Grade 4">Grade 4</Select.Option>
              <Select.Option value="Grade 5">Grade 5</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter campaign description" },
            ]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Campaigns;
