import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
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
import { vaccinations } from "../../mock/nurseData";

const { TextArea } = Input;

const Vaccination = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchForm] = Form.useForm();
  const [vaccinationForm] = Form.useForm();

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
      title: "Vaccine Name",
      dataIndex: "vaccineName",
      key: "vaccineName",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Batch Number",
      dataIndex: "batchNumber",
      key: "batchNumber",
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleViewDetails(record)}>Details</Button>
        </Space>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    Modal.info({
      title: "Vaccination Details",
      content: (
        <div className="space-y-4">
          <p>
            <strong>Student:</strong> {record.studentName}
          </p>
          <p>
            <strong>Vaccine:</strong> {record.vaccineName}
          </p>
          <p>
            <strong>Date:</strong> {record.date}
          </p>
          <p>
            <strong>Batch Number:</strong> {record.batchNumber}
          </p>
          <p>
            <strong>Status:</strong> {record.status}
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
    vaccinationForm.validateFields().then((values) => {
      console.log("New vaccination record:", values);
      setIsModalVisible(false);
      vaccinationForm.resetFields();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vaccination Records</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add Record
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
              <Form.Item name="vaccineName" label="Vaccine">
                <Select placeholder="Select vaccine">
                  <Select.Option value="Flu Shot">Flu Shot</Select.Option>
                  <Select.Option value="MMR">MMR</Select.Option>
                  <Select.Option value="DTaP">DTaP</Select.Option>
                  <Select.Option value="Hepatitis B">Hepatitis B</Select.Option>
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
        <Table dataSource={vaccinations} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title="Add Vaccination Record"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          vaccinationForm.resetFields();
        }}
        width={600}
      >
        <Form form={vaccinationForm} layout="vertical">
          <Form.Item
            name="studentId"
            label="Student ID"
            rules={[{ required: true, message: "Please enter student ID" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="vaccineName"
            label="Vaccine Name"
            rules={[{ required: true, message: "Please select vaccine" }]}
          >
            <Select>
              <Select.Option value="Flu Shot">Flu Shot</Select.Option>
              <Select.Option value="MMR">MMR</Select.Option>
              <Select.Option value="DTaP">DTaP</Select.Option>
              <Select.Option value="Hepatitis B">Hepatitis B</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Vaccination Date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="batchNumber"
            label="Batch Number"
            rules={[{ required: true, message: "Please enter batch number" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Vaccination;
