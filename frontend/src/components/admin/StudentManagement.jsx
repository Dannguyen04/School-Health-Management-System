import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
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

const StudentManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);

  const columns = [
    {
      title: "Student ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Allergies",
      dataIndex: "allergies",
      key: "allergies",
      render: (allergies) => (
        <>
          {allergies.map((allergy) => (
            <Tag color="red" key={allergy}>
              {allergy}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Chronic Diseases",
      dataIndex: "chronicDiseases",
      key: "chronicDiseases",
      render: (diseases) => (
        <>
          {diseases.map((disease) => (
            <Tag color="orange" key={disease}>
              {disease}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Vision",
      dataIndex: "vision",
      key: "vision",
    },
    {
      title: "Hearing",
      dataIndex: "hearing",
      key: "hearing",
    },
    {
      title: "Tiền sử điều trị",
      dataIndex: "treatmentHistory",
      key: "treatmentHistory",
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      id: "HS001",
      name: "Nguyen Van A",
      class: "10A1",
      allergies: ["Penicillin", "Peanut"],
      chronicDiseases: ["Asthma"],
      vision: "10/10",
      hearing: "Normal",
      treatmentHistory: "Đã điều trị hen năm 2022",
    },
    // Add more sample data as needed
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (record) => {
    // Implement delete functionality
    console.log("Delete record:", record);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log("Form values:", values);
      setIsModalVisible(false);
    });
  };

  return (
    <div>
      <Card
        title="Student Records Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Student
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} />
      </Card>

      <Modal
        title={editingRecord ? "Edit Student Information" : "Add New Student"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="Student ID"
            rules={[{ required: true, message: "Please enter student ID" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter full name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="class"
            label="Class"
            rules={[{ required: true, message: "Please select class" }]}
          >
            <Select>
              <Option value="10A1">10A1</Option>
              <Option value="10A2">10A2</Option>
              <Option value="11A1">11A1</Option>
              <Option value="11A2">11A2</Option>
            </Select>
          </Form.Item>

          <Form.Item name="allergies" label="Allergies">
            <Select mode="tags" placeholder="Enter allergies">
              <Option value="Penicillin">Penicillin</Option>
              <Option value="Peanut">Peanut</Option>
              <Option value="Seafood">Seafood</Option>
            </Select>
          </Form.Item>

          <Form.Item name="chronicDiseases" label="Chronic Diseases">
            <Select mode="tags" placeholder="Enter chronic diseases">
              <Option value="Asthma">Asthma</Option>
              <Option value="Diabetes">Diabetes</Option>
              <Option value="Hypertension">Hypertension</Option>
            </Select>
          </Form.Item>

          <Form.Item name="vision" label="Vision">
            <Input />
          </Form.Item>

          <Form.Item name="hearing" label="Hearing">
            <Select>
              <Option value="Normal">Normal</Option>
              <Option value="Mild hearing loss">Mild hearing loss</Option>
              <Option value="Severe hearing loss">Severe hearing loss</Option>
            </Select>
          </Form.Item>

          <Form.Item name="treatmentHistory" label="Tiền sử điều trị">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManagement;
