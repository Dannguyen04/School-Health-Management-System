import {
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
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
  message,
} from "antd";
import React, { useState } from "react";

const { Option } = Select;

const VaccinationManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Học sinh",
      dataIndex: "student",
      key: "student",
    },
    {
      title: "Loại vắc xin",
      dataIndex: "vaccineType",
      key: "vaccineType",
    },
    {
      title: "Ngày tiêm",
      dataIndex: "vaccinationDate",
      key: "vaccinationDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          "Đã tiêm": "green",
          "Chưa tiêm": "orange",
          "Đã hủy": "red",
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Kết quả tiêm chủng",
      dataIndex: "vaccinationResult",
      key: "vaccinationResult",
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
          <Button
            type="default"
            icon={<BellOutlined />}
            onClick={() => handleNotify(record)}
          >
            Thông báo
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      id: "VC001",
      student: "Nguyễn Văn A",
      vaccineType: "Vắc xin 5 trong 1",
      vaccinationDate: "2024-04-15",
      status: "Chưa tiêm",
      notes: "Cần thông báo cho phụ huynh",
      vaccinationResult: "Chưa tiêm",
    },
    {
      key: "2",
      id: "VC002",
      student: "Trần Thị B",
      vaccineType: "Vắc xin cúm",
      vaccinationDate: "2024-04-16",
      status: "Đã tiêm",
      notes: "Đã tiêm đầy đủ",
      vaccinationResult: "Đã tiêm, không phản ứng phụ",
    },
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
    console.log("Deleting record:", record);
    message.success("Đã xóa phiếu tiêm chủng");
  };

  const handleNotify = (record) => {
    console.log("Notifying for record:", record);
    message.success("Đã gửi thông báo đến phụ huynh");
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log("Form values:", values);
      setIsModalVisible(false);
      message.success(
        editingRecord ? "Cập nhật thành công" : "Thêm mới thành công"
      );
    });
  };

  return (
    <div>
      <Card
        title="Quản lý tiêm chủng"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm phiếu tiêm
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} />
      </Card>

      <Modal
        title={
          editingRecord ? "Sửa phiếu tiêm chủng" : "Thêm phiếu tiêm chủng mới"
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="Mã phiếu"
            rules={[{ required: true, message: "Vui lòng nhập mã phiếu" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="student"
            label="Học sinh"
            rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
          >
            <Select>
              <Option value="Nguyễn Văn A">Nguyễn Văn A</Option>
              <Option value="Trần Thị B">Trần Thị B</Option>
              <Option value="Lê Văn C">Lê Văn C</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="vaccineType"
            label="Loại vắc xin"
            rules={[{ required: true, message: "Vui lòng chọn loại vắc xin" }]}
          >
            <Select>
              <Option value="Vắc xin 5 trong 1">Vắc xin 5 trong 1</Option>
              <Option value="Vắc xin cúm">Vắc xin cúm</Option>
              <Option value="Vắc xin viêm não Nhật Bản">
                Vắc xin viêm não Nhật Bản
              </Option>
              <Option value="Vắc xin sởi">Vắc xin sởi</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="vaccinationDate"
            label="Ngày tiêm"
            rules={[{ required: true, message: "Vui lòng chọn ngày tiêm" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="Chưa tiêm">Chưa tiêm</Option>
              <Option value="Đã tiêm">Đã tiêm</Option>
              <Option value="Đã hủy">Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item name="vaccinationResult" label="Kết quả tiêm chủng">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinationManagement;
