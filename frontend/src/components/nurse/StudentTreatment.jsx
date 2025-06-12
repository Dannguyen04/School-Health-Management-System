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
      title: "Medication",
      dataIndex: "medication",
      key: "medication",
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
          {status === "active" ? "Active" : "Completed"}
        </Tag>
      ),
    },
    {
      title: "Last Given",
      dataIndex: "lastGiven",
      key: "lastGiven",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleGiveMedication(record)}
          >
            Give
          </Button>
          <Button onClick={() => handleViewDetails(record)}>Details</Button>
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
      title: "Treatment Details",
      content: (
        <div className="space-y-4">
          <p>
            <strong>Student:</strong> {record.studentName}
          </p>
          <p>
            <strong>Medication:</strong> {record.medication}
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
            <strong>Last Given:</strong> {record.lastGiven}
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
        <h1 className="text-2xl font-bold">Student Treatment</h1>
        <Button
          type="primary"
          icon={<ClockCircleOutlined />}
          onClick={() => {
            // Handle view history
          }}
        >
          View History
        </Button>
      </div>

      <Card>
        <Table dataSource={studentTreatments} columns={columns} rowKey="id" />
      </Card>

      <Modal
        title="Give Medication"
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
              { required: true, message: "Please confirm medication given" },
            ]}
          >
            <Checkbox>Medication given to student</Checkbox>
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea
              rows={4}
              placeholder="Any additional notes or observations"
            />
          </Form.Item>

          <Form.Item
            name="nextDose"
            label="Next Dose Time"
            rules={[
              { required: true, message: "Please select next dose time" },
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
