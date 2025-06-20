import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
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
      studentName: "Nguyễn Văn A",
      grade: "5A",
      medicationName: "Paracetamol",
      dosage: "500mg",
      frequency: "2 lần/ngày",
      startDate: "2024-03-15",
      endDate: "2024-03-20",
      status: "active",
      notes: "Uống sau bữa ăn",
    },
    {
      id: 2,
      studentName: "Trần Thị B",
      grade: "4B",
      medicationName: "Amoxicillin",
      dosage: "250mg",
      frequency: "3 lần/ngày",
      startDate: "2024-03-14",
      endDate: "2024-03-21",
      status: "active",
      notes: "Uống với nước",
    },
  ]);

  const columns = [
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
      title: "Tên thuốc",
      dataIndex: "medicationName",
      key: "medicationName",
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
          {status === "active" ? "Đang sử dụng" : "Đã kết thúc"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>
            Xem
          </Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
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
      title: "Xóa thông tin thuốc",
      content: "Bạn có chắc chắn muốn xóa thông tin thuốc này?",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: () => {
        setMedications(medications.filter((med) => med.id !== medicationId));
        message.success("Xóa thông tin thuốc thành công");
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
        message.success("Cập nhật thông tin thuốc thành công");
      } else {
        // Add new medication
        const newMedication = {
          id: medications.length + 1,
          ...values,
          status: "active",
        };
        setMedications([...medications, newMedication]);
        message.success("Thêm thông tin thuốc thành công");
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error("Lỗi xác thực:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Thông tin thuốc</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm thuốc
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={medications}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingMedication ? "Sửa thông tin thuốc" : "Thêm thuốc mới"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText={editingMedication ? "Cập nhật" : "Thêm"}
        width={800}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="studentName"
              label="Tên học sinh"
              rules={[
                { required: true, message: "Vui lòng nhập tên học sinh!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="grade"
              label="Lớp"
              rules={[{ required: true, message: "Vui lòng nhập lớp!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="medicationName"
              label="Tên thuốc"
              rules={[{ required: true, message: "Vui lòng nhập tên thuốc!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="dosage"
              label="Liều lượng"
              rules={[{ required: true, message: "Vui lòng nhập liều lượng!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="frequency"
              label="Tần suất"
              rules={[{ required: true, message: "Vui lòng nhập tần suất!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
              ]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc!" },
              ]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              name="notes"
              label="Ghi chú"
              rules={[{ required: true, message: "Vui lòng nhập ghi chú!" }]}
            >
              <TextArea rows={4} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicationInfo;
