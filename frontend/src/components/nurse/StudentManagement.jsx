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
import { useState } from "react";

const { Option } = Select;

const StudentManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);

  const columns = [
    {
      title: "Mã học sinh",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
    },
    {
      title: "Dị ứng",
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
      title: "Bệnh mãn tính",
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
      title: "Thị lực",
      dataIndex: "vision",
      key: "vision",
    },
    {
      title: "Thính lực",
      dataIndex: "hearing",
      key: "hearing",
    },
    {
      title: "Tiền sử điều trị",
      dataIndex: "treatmentHistory",
      key: "treatmentHistory",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      id: "HS001",
      name: "Nguyễn Văn A",
      class: "10A1",
      allergies: ["Penicillin", "Đậu phộng"],
      chronicDiseases: ["Hen suyễn"],
      vision: "10/10",
      hearing: "Bình thường",
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
        title="Quản lý hồ sơ học sinh"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm học sinh
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} />
      </Card>

      <Modal
        title={editingRecord ? "Sửa thông tin học sinh" : "Thêm học sinh mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="Mã học sinh"
            rules={[{ required: true, message: "Vui lòng nhập mã học sinh" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="class"
            label="Lớp"
            rules={[{ required: true, message: "Vui lòng chọn lớp" }]}
          >
            <Select>
              <Option value="10A1">10A1</Option>
              <Option value="10A2">10A2</Option>
              <Option value="11A1">11A1</Option>
              <Option value="11A2">11A2</Option>
            </Select>
          </Form.Item>

          <Form.Item name="allergies" label="Dị ứng">
            <Select mode="tags" placeholder="Nhập các dị ứng">
              <Option value="Penicillin">Penicillin</Option>
              <Option value="Đậu phộng">Đậu phộng</Option>
              <Option value="Hải sản">Hải sản</Option>
            </Select>
          </Form.Item>

          <Form.Item name="chronicDiseases" label="Bệnh mãn tính">
            <Select mode="tags" placeholder="Nhập các bệnh mãn tính">
              <Option value="Hen suyễn">Hen suyễn</Option>
              <Option value="Tiểu đường">Tiểu đường</Option>
              <Option value="Cao huyết áp">Cao huyết áp</Option>
            </Select>
          </Form.Item>

          <Form.Item name="vision" label="Thị lực">
            <Input />
          </Form.Item>

          <Form.Item name="hearing" label="Thính lực">
            <Select>
              <Option value="Bình thường">Bình thường</Option>
              <Option value="Giảm thính lực nhẹ">Giảm thính lực nhẹ</Option>
              <Option value="Giảm thính lực nặng">Giảm thính lực nặng</Option>
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
