import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Upload,
  message,
} from "antd";
import React, { useState } from "react";

const { TextArea } = Input;

const MedicationInfo = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);

  // Mock data - replace with real data from API
  const [medications, setMedications] = useState([
    {
      id: 1,
      studentName: "Alice Johnson",
      grade: "5A",
      medicationName: "Paracetamol",
      dosage: "500mg",
      frequency: "Twice daily",
      startDate: "2024-03-15",
      endDate: "2024-03-20",
      status: "active",
      notes: "Take after meals",
    },
    {
      id: 2,
      studentName: "Bob Smith",
      grade: "4B",
      medicationName: "Amoxicillin",
      dosage: "250mg",
      frequency: "Three times daily",
      startDate: "2024-03-14",
      endDate: "2024-03-21",
      status: "active",
      notes: "Take with water",
    },
  ]);

  const columns = [
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
      dataIndex: "medicationName",
      key: "medicationName",
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
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>
            View
          </Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingMedication(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (medication) => {
    setEditingMedication(medication);
    form.setFieldsValue(medication);
    setIsModalVisible(true);
  };

  const handleView = (medication) => {
    setEditingMedication(medication);
    setIsModalVisible(true);
  };

  const handleDelete = (medicationId) => {
    Modal.confirm({
      title: "Delete Medication Record",
      content: "Are you sure you want to delete this medication record?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        setMedications(medications.filter((med) => med.id !== medicationId));
        message.success("Medication record deleted successfully");
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingMedication) {
        // Update existing medication
        setMedications(
          medications.map((med) =>
            med.id === editingMedication.id ? { ...med, ...values } : med
          )
        );
        message.success("Medication record updated successfully");
      } else {
        // Add new medication
        const newMedication = {
          id: medications.length + 1,
          ...values,
          status: "active",
        };
        setMedications([...medications, newMedication]);
        message.success("Medication record added successfully");
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Medication Information</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Medication
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={medications}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingMedication ? "Edit Medication" : "Add Medication"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={editingMedication ? "Update" : "Add"}
        width={800}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="studentName"
              label="Student Name"
              rules={[
                { required: true, message: "Please input student name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="grade"
              label="Grade"
              rules={[{ required: true, message: "Please input grade!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="medicationName"
              label="Medication Name"
              rules={[
                { required: true, message: "Please input medication name!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="dosage"
              label="Dosage"
              rules={[{ required: true, message: "Please input dosage!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="frequency"
              label="Frequency"
              rules={[{ required: true, message: "Please input frequency!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: "Please select start date!" }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[{ required: true, message: "Please select end date!" }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="prescriptionFile" label="Prescription File">
            <Upload>
              <Button icon={<UploadOutlined />}>Upload File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicationInfo;
